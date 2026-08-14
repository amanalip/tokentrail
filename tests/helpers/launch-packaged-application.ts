// Import a temporary loopback server so each packaged test can reserve an available debugging port.
import { createServer } from 'node:net';

// Import process spawning to launch the fused package as a normal desktop application.
import { spawn, type ChildProcess } from 'node:child_process';

// Import filesystem operations for package validation and isolated temporary Chromium state.
import { access, mkdtemp, rm } from 'node:fs/promises';

// Import the operating-system temporary directory instead of writing test profiles into user configuration.
import { tmpdir } from 'node:os';

// Import path helpers to identify explicit package and temporary-profile paths.
import path from 'node:path';

// Import URL conversion so helper paths never depend on the test process working directory.
import { fileURLToPath } from 'node:url';

// Import Chromium's CDP client and the narrow browser types used by the smoke-test harness.
import { chromium, type Browser, type Page } from 'playwright';

// Resolve the repository root from the helper's checked-in path.
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Point to electron-builder's unpacked Linux executable with its fuses and ASAR already applied.
const packagedExecutablePath = path.join(repositoryRoot, 'release', 'linux-unpacked', 'tokentrail');

// Describe only the page and bounded cleanup behavior packaged smoke tests are allowed to use.
export interface PackagedApplicationHarness {
  readonly page: Page;
  readonly processId: number;
  readonly startupMilliseconds: number;
  readonly close: () => Promise<void>;
}

/**
 * Reserve and release one loopback port immediately before launch. The small release-to-spawn race is limited
 * to the local test machine, and a failed CDP connection still times out rather than selecting another host.
 */
async function reserveLoopbackPort(): Promise<number> {
  // Create a server that never accepts external interfaces.
  const server = createServer();

  // Wait until the operating system selects an unused port on numeric loopback.
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  // Read the bound address before closing the reservation.
  const address = server.address();

  // Reject the unexpected Unix-socket form because Chromium requires a TCP port.
  if (address === null || typeof address === 'string') {
    server.close();
    throw new Error('Could not reserve a loopback TCP port for packaged testing.');
  }

  // Save the selected port before closing the temporary listener.
  const selectedPort = address.port;

  // Release the port so the packaged Chromium process can bind it.
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error === undefined) {
        resolve();
      } else {
        reject(error);
      }
    });
  });

  // Return the exact local port for launch and CDP connection.
  return selectedPort;
}

/**
 * Connect to the packaged Chromium debugging endpoint with a fixed timeout and useful launch diagnostics.
 */
async function connectToPackagedChromium(
  debuggingPort: number,
  packagedProcess: ChildProcess,
  readErrorOutput: () => string,
): Promise<Browser> {
  // Calculate one bounded deadline for all connection attempts.
  const deadline = Date.now() + 15_000;

  // Retry while Electron starts its browser process and custom protocol.
  while (Date.now() < deadline) {
    // Fail immediately if the packaged application exited before exposing its local debugging endpoint.
    if (packagedProcess.exitCode !== null) {
      throw new Error(
        `Packaged Token Trail exited with code ${packagedProcess.exitCode}. ${readErrorOutput()}`,
      );
    }

    try {
      // Connect only to the exact loopback endpoint selected for this test.
      return await chromium.connectOverCDP(`http://127.0.0.1:${debuggingPort}`);
    } catch {
      // A short refusal is expected while Chromium initializes.
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Include bounded stderr text when the package never becomes testable.
  throw new Error(`Timed out connecting to packaged Token Trail. ${readErrorOutput()}`);
}

/**
 * Launch the fused unpacked Linux package normally, then attach through Chromium's loopback debugging protocol.
 * Playwright's Electron launcher is intentionally not used because the production fuses disable Node inspect,
 * which that launcher needs. This difference is itself part of the package security posture being tested.
 */
export async function launchPackagedApplication(): Promise<PackagedApplicationHarness> {
  // Fail with the expected path if the packaging command did not produce an executable.
  await access(packagedExecutablePath);

  // Create an isolated disposable Chromium profile for this one smoke test.
  const userDataDirectory = await mkdtemp(path.join(tmpdir(), 'tokentrail-packaged-test-'));

  // Reserve one loopback port for test-only Chromium inspection.
  const debuggingPort = await reserveLoopbackPort();

  // Capture a bounded amount of stderr so launch failures are diagnosable without unbounded logs.
  let errorOutput = '';

  // Start the launch timer immediately before creating the packaged desktop process.
  const launchStartedAt = performance.now();

  // Start the packaged application with a test-only local debugging endpoint and isolated profile.
  const packagedProcess = spawn(
    packagedExecutablePath,
    [
      `--remote-debugging-port=${debuggingPort}`,
      '--remote-debugging-address=127.0.0.1',
      `--user-data-dir=${userDataDirectory}`,
    ],
    {
      cwd: path.dirname(packagedExecutablePath),
      // Isolate packaged tests from a real Codex installation and account by searching only the empty test profile.
      env: { ...process.env, PATH: userDataDirectory, HOME: userDataDirectory },
      stdio: ['ignore', 'ignore', 'pipe'],
    },
  );

  // Retain only the last 8 KiB of launch diagnostics to keep test failures safe and bounded.
  packagedProcess.stderr?.on('data', (chunk: Buffer) => {
    errorOutput = `${errorOutput}${chunk.toString('utf8')}`.slice(-8_192);
  });

  try {
    // Connect after the packaged Chromium browser exposes its local endpoint.
    const browser = await connectToPackagedChromium(
      debuggingPort,
      packagedProcess,
      () => errorOutput,
    );

    // Resolve the default Electron browser context created for the application window.
    const [browserContext] = browser.contexts();

    // Fail clearly if Electron did not create its expected default context.
    if (browserContext === undefined) {
      await browser.close();
      throw new Error('Packaged Token Trail did not create a browser context.');
    }

    // Reuse an existing page or wait for the application window to finish being created.
    const [existingPage] = browserContext.pages();
    const page = existingPage ?? (await browserContext.waitForEvent('page'));

    // Require a concrete operating-system process identifier for lifecycle and performance evidence.
    const processId = packagedProcess.pid;

    // Fail safely if Node did not assign a PID after a nominally successful spawn.
    if (processId === undefined) {
      await browser.close();
      throw new Error('Packaged Token Trail process did not receive a process identifier.');
    }

    // Record the bounded launch-to-page-attachment duration before returning control to a test.
    const startupMilliseconds = performance.now() - launchStartedAt;

    // Return the page and one cleanup operation that owns every created resource.
    return {
      page,
      processId,
      startupMilliseconds,
      close: async () => {
        // Detach the CDP client before stopping the packaged desktop process.
        await browser.close();

        // Ask the exact owned packaged process to stop if it is still running.
        if (packagedProcess.exitCode === null) {
          // Register the exit listener before signaling so a fast exit cannot leave cleanup waiting forever.
          await new Promise<void>((resolve) => {
            packagedProcess.once('exit', () => resolve());

            // Signal only the exact process launched by this helper.
            packagedProcess.kill('SIGTERM');

            // Resolve immediately if the process exited between the initial check and listener registration.
            if (packagedProcess.exitCode !== null) {
              resolve();
            }
          });
        }

        // Remove only the unique temporary profile created by this helper.
        await rm(userDataDirectory, { recursive: true, force: true });
      },
    };
  } catch (error) {
    // Stop the exact owned process when launch or connection fails.
    if (packagedProcess.exitCode === null) {
      packagedProcess.kill('SIGTERM');
    }

    // Remove only this helper's unique temporary profile before rethrowing the original failure.
    await rm(userDataDirectory, { recursive: true, force: true });
    throw error;
  }
}
