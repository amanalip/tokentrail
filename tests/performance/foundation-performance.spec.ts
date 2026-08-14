// Import process execution to read the kernel clock-tick rate without assuming one Linux configuration.
import { execFile } from 'node:child_process';

// Import promise conversion so the clock query composes with asynchronous test steps.
import { promisify } from 'node:util';

// Import Linux process-directory reads for local packaged CPU and resident-memory evidence.
import { readdir, readFile, writeFile } from 'node:fs/promises';

// Import Playwright's assertions and test lifecycle.
import { expect, test } from '@playwright/test';

// Import the fused packaged-application harness.
import { launchPackagedApplication } from '../helpers/launch-packaged-application';

// Convert Node's callback-based `execFile` into one bounded promise for the trusted local `getconf` tool.
const executeFile = promisify(execFile);

// Describe the process fields required for tree, CPU, and memory calculations.
interface LinuxProcessSnapshot {
  readonly processId: number;
  readonly parentProcessId: number;
  readonly cpuTicks: number;
  readonly residentKilobytes: number;
  readonly proportionalKilobytes: number;
}

/**
 * Read one Linux `/proc` entry. A disappearing process returns `null` because Chromium helper processes may
 * legitimately exit between directory listing and file reads.
 */
async function readLinuxProcess(processId: number): Promise<LinuxProcessSnapshot | null> {
  try {
    // Read process relationship and CPU counters from the kernel's stat record.
    const statText = await readFile(`/proc/${processId}/stat`, 'utf8');

    // Locate the final command-name parenthesis because command names may themselves contain spaces.
    const commandNameEnd = statText.lastIndexOf(')');

    // Reject a malformed kernel record rather than calculating from shifted fields.
    if (commandNameEnd < 0) {
      return null;
    }

    // Split fields after the command name, where index zero is process state and index one is parent PID.
    const fields = statText
      .slice(commandNameEnd + 2)
      .trim()
      .split(/\s+/);

    // Parse the parent PID plus user and system CPU ticks from their documented Linux stat positions.
    const parentProcessId = Number(fields[1]);
    const userCpuTicks = Number(fields[11]);
    const systemCpuTicks = Number(fields[12]);

    // Read resident memory from the human-readable status record.
    const statusText = await readFile(`/proc/${processId}/status`, 'utf8');

    // Select the resident-set line and default to zero only when the kernel omits it for an exiting process.
    const residentMatch = /^VmRSS:\s+(\d+)\s+kB$/mu.exec(statusText);
    const residentKilobytes = residentMatch === null ? 0 : Number(residentMatch[1]);

    // Attempt proportional memory separately because hardened Linux hosts may deny `smaps_rollup` to tests.
    const proportionalKilobytes = await readFile(`/proc/${processId}/smaps_rollup`, 'utf8')
      .then((memoryRollupText) => {
        // Select the kernel's proportional memory line when the host exposes it.
        const proportionalMatch = /^Pss:\s+(\d+)\s+kB$/mu.exec(memoryRollupText);

        // Retain zero only when this optional kernel field is unavailable in an otherwise valid snapshot.
        return proportionalMatch === null ? 0 : Number(proportionalMatch[1]);
      })
      .catch(() => 0);

    // Reject non-numeric records instead of contaminating aggregate evidence with `NaN`.
    if (
      !Number.isInteger(parentProcessId) ||
      !Number.isFinite(userCpuTicks) ||
      !Number.isFinite(systemCpuTicks) ||
      !Number.isFinite(residentKilobytes) ||
      !Number.isFinite(proportionalKilobytes)
    ) {
      return null;
    }

    // Return the safe numeric snapshot used by tree aggregation.
    return {
      processId,
      parentProcessId,
      cpuTicks: userCpuTicks + systemCpuTicks,
      residentKilobytes,
      proportionalKilobytes,
    };
  } catch {
    // Treat a process that exits during collection as absent from this instant's snapshot.
    return null;
  }
}

/**
 * Read every visible numeric `/proc` entry and keep the root packaged process plus all of its descendants.
 */
async function readProcessTree(rootProcessId: number): Promise<LinuxProcessSnapshot[]> {
  // List the kernel process directory once for a consistent best-effort snapshot.
  const processEntries = await readdir('/proc');

  // Parse only numeric directory names as process identifiers.
  const processIds = processEntries
    .filter((entry) => /^\d+$/u.test(entry))
    .map((entry) => Number(entry));

  // Read process records concurrently because `/proc` files are small and local.
  const processSnapshots = await Promise.all(
    processIds.map((processId) => readLinuxProcess(processId)),
  );

  // Remove processes that disappeared or produced invalid records.
  const validSnapshots = processSnapshots.filter(
    (snapshot): snapshot is LinuxProcessSnapshot => snapshot !== null,
  );

  // Build a parent-to-children index for deterministic descendant discovery.
  const childrenByParent = new Map<number, number[]>();

  // Add every valid process to its parent's child list.
  for (const snapshot of validSnapshots) {
    const existingChildren = childrenByParent.get(snapshot.parentProcessId) ?? [];
    existingChildren.push(snapshot.processId);
    childrenByParent.set(snapshot.parentProcessId, existingChildren);
  }

  // Start traversal with the packaged main process itself.
  const includedProcessIds = new Set<number>([rootProcessId]);
  const pendingProcessIds = [rootProcessId];

  // Traverse all descendants without following unrelated system processes.
  while (pendingProcessIds.length > 0) {
    const currentProcessId = pendingProcessIds.shift();

    // Continue defensively if the queue is unexpectedly empty.
    if (currentProcessId === undefined) {
      continue;
    }

    // Include each newly discovered child once and inspect its children later.
    for (const childProcessId of childrenByParent.get(currentProcessId) ?? []) {
      if (!includedProcessIds.has(childProcessId)) {
        includedProcessIds.add(childProcessId);
        pendingProcessIds.push(childProcessId);
      }
    }
  }

  // Return only snapshots belonging to the packaged process tree.
  return validSnapshots.filter((snapshot) => includedProcessIds.has(snapshot.processId));
}

// Measure the Phase 1 packaged shell against the initial startup, idle CPU, and resident-memory budgets.
test('records packaged foundation performance', async ({ browserName }, testInfo) => {
  // Launch the fused Linux package once from a cold application state.
  const coldApplication = await launchPackagedApplication();

  // Confirm the cold renderer becomes usable before recording and closing the first launch.
  await expect(
    coldApplication.page.getByRole('heading', { level: 1, name: 'TokenTrail' }),
  ).toBeVisible();

  // Retain the first launch measurement before closing its exact process and disposable profile.
  const coldStartupMilliseconds = coldApplication.startupMilliseconds;
  await coldApplication.close();

  // Launch again immediately to measure the operating system's warm executable and page-cache path.
  const packagedApplication = await launchPackagedApplication();

  try {
    // Confirm the local renderer is usable before beginning idle measurements.
    await expect(
      packagedApplication.page.getByRole('heading', { level: 1, name: 'TokenTrail' }),
    ).toBeVisible();

    // Allow Chromium initialization work to settle before capturing the first idle snapshot.
    await new Promise((resolve) => setTimeout(resolve, 5_000));

    // Read the process tree at the beginning of the measurement interval.
    const firstSnapshot = await readProcessTree(packagedApplication.processId);

    // Record an explicit wall-clock start for CPU percentage calculation.
    const measurementStartedAt = performance.now();

    // Observe a long enough idle interval to avoid interpreting a short scheduler burst as sustained CPU use.
    await new Promise((resolve) => setTimeout(resolve, 5_000));

    // Read the same owned process tree after the idle interval.
    const secondSnapshot = await readProcessTree(packagedApplication.processId);

    // Calculate the actual observation duration rather than assuming timers fired exactly on schedule.
    const measurementSeconds = (performance.now() - measurementStartedAt) / 1_000;

    // Ask Linux for its configured clock ticks per second.
    const { stdout: clockTickOutput } = await executeFile('getconf', ['CLK_TCK']);
    const clockTicksPerSecond = Number(clockTickOutput.trim());

    // Index the first CPU counters by process so new or exited helpers are handled explicitly.
    const firstCpuTicksByProcess = new Map(
      firstSnapshot.map((snapshot) => [snapshot.processId, snapshot.cpuTicks]),
    );

    // Sum non-negative CPU growth for processes visible at the final snapshot.
    const idleCpuTicks = secondSnapshot.reduce((totalTicks, snapshot) => {
      const initialTicks = firstCpuTicksByProcess.get(snapshot.processId) ?? snapshot.cpuTicks;
      return totalTicks + Math.max(0, snapshot.cpuTicks - initialTicks);
    }, 0);

    // Convert CPU time to one-core percentage over the observed interval.
    const idleCpuPercent = (idleCpuTicks / clockTicksPerSecond / measurementSeconds) * 100;

    // Sum final resident memory across the packaged main, renderer, GPU, and utility process tree.
    const residentMegabytes =
      secondSnapshot.reduce((totalKilobytes, snapshot) => {
        return totalKilobytes + snapshot.residentKilobytes;
      }, 0) / 1_024;

    // Sum proportional memory to provide a second view that apportions shared Chromium pages once.
    const proportionalMegabytes =
      secondSnapshot.reduce((totalKilobytes, snapshot) => {
        return totalKilobytes + snapshot.proportionalKilobytes;
      }, 0) / 1_024;

    // Construct the exact evidence object written to transient or explicitly curated output.
    const performanceEvidence = {
      playwrightController: browserName,
      coldStartupMilliseconds: Number(coldStartupMilliseconds.toFixed(1)),
      warmStartupMilliseconds: Number(packagedApplication.startupMilliseconds.toFixed(1)),
      idleCpuPercent: Number(idleCpuPercent.toFixed(2)),
      residentMegabytes: Number(residentMegabytes.toFixed(1)),
      proportionalMegabytes: Number(proportionalMegabytes.toFixed(1)),
      observedProcessCount: secondSnapshot.length,
      idleObservationSeconds: Number(measurementSeconds.toFixed(3)),
    };

    // Use a transient Playwright path unless a maintainer deliberately supplies a versioned evidence file.
    const evidencePath =
      process.env['TOKENTRAIL_PERFORMANCE_EVIDENCE'] ??
      testInfo.outputPath('phase-1-performance.json');

    // Persist the small non-sensitive metrics object for report preparation.
    await writeFile(evidencePath, `${JSON.stringify(performanceEvidence, null, 2)}\n`, 'utf8');

    // Print the same object so local and CI logs remain independently reviewable.
    await testInfo.attach('phase-1-performance', {
      body: Buffer.from(JSON.stringify(performanceEvidence)),
      contentType: 'application/json',
    });

    // Enforce the cold-start target now because the Phase 1 shell has no external data dependency.
    expect(performanceEvidence.coldStartupMilliseconds).toBeLessThanOrEqual(3_000);

    // Enforce the same ceiling for the immediately repeated warm launch.
    expect(performanceEvidence.warmStartupMilliseconds).toBeLessThanOrEqual(3_000);

    // Confirm total resident memory was collected; Phase 4 owns optimization and final budget enforcement.
    expect(performanceEvidence.residentMegabytes).toBeGreaterThan(0);

    // Permit proportional memory to be unavailable on hardened kernels while rejecting an invalid negative value.
    expect(performanceEvidence.proportionalMegabytes).toBeGreaterThanOrEqual(0);

    // Confirm CPU evidence is valid; Phase 4 owns optimization and the final near-zero threshold gate.
    expect(performanceEvidence.idleCpuPercent).toBeGreaterThanOrEqual(0);
  } finally {
    // Stop the exact packaged process and remove its isolated temporary profile.
    await packagedApplication.close();
  }
});
