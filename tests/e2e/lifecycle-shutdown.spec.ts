// Import Node filesystem promises so process-table observations stay inside the test process.
import { readFile, access } from 'node:fs/promises';

// Import Playwright's user-visible assertions and test lifecycle.
import { expect, test } from '@playwright/test';

// Import the shared built-application launcher with its disposable-profile helper.
import {
  createDisposableUserDataDirectory,
  launchBuiltApplication,
  spawnUnmanagedInstance,
} from '../helpers/launch-electron';

/**
 * Window close, reopen, and shutdown lifecycle evidence (plan section 8.4).
 *
 * Responsibility: prove on the real built application that closing the window exits the whole
 * application cleanly — including SIGTERM termination of the owned Codex app-server child —
 * and that a second launch while an instance is running hands off to the existing window and
 * exits instead of creating a split-brain second process. Trust level: read-only /proc
 * observation plus real user gestures (window close, second launch); no signals are sent to
 * any process this test does not own. Dependencies: the checked-in full fixture scenario,
 * whose app-server stands in as a genuine spawned child process.
 * Denied behavior: these tests never suspend the machine, never touch processes outside their
 * own launch tree, and never simulate suspend/resume or display changes, which require
 * desktop-session control and remain recorded as open operator-held scope.
 */

/** True when the given process id still exists in the kernel process table. */
async function processExists(pid: number): Promise<boolean> {
  try {
    await access(`/proc/${pid}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Collect the direct children of one process whose command line names the fixture script.
 * The kernel exposes each process's direct children through its per-task `children` file, so
 * the result is exact even while other tests run their own applications concurrently.
 */
async function findOwnedFixtureChildren(mainPid: number): Promise<number[]> {
  const raw = await readFile(`/proc/${mainPid}/task/${mainPid}/children`, 'utf8');
  const candidatePids = raw
    .split(' ')
    .map((token) => Number.parseInt(token, 10))
    .filter((pid) => Number.isFinite(pid) && pid > 0);

  const fixturePids: number[] = [];
  for (const childPid of candidatePids) {
    try {
      const cmdline = await readFile(`/proc/${childPid}/cmdline`, 'utf8');
      if (cmdline.includes('codex-app-server-fixture.mjs')) {
        fixturePids.push(childPid);
      }
    } catch {
      // A child that exited between the two reads simply no longer exists; skip it.
    }
  }
  return fixturePids;
}

test('closing the window quits cleanly and terminates the owned Codex child', async () => {
  // Launch the complete fixture so startup refresh spawns a real owned app-server child.
  const electronApplication = await launchBuiltApplication('full');

  try {
    const page = await electronApplication.firstWindow();
    await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();

    // Read the main process id and enumerate its direct fixture children once data is live.
    const mainPid = await electronApplication.evaluate(() => process.pid);
    const fixtureChildPids = await findOwnedFixtureChildren(mainPid);
    expect(
      fixtureChildPids.length,
      'the running application owns at least one fixture app-server child',
    ).toBeGreaterThan(0);

    // Close the window exactly as the user's titlebar button would; window-all-closed must
    // translate that gesture into a full application quit, not a headless leftover process.
    await electronApplication.evaluate(({ BrowserWindow }) => {
      BrowserWindow.getAllWindows().forEach((window) => {
        window.close();
      });
    });

    // The main process must disappear entirely within a bounded grace period.
    await expect
      .poll(() => processExists(mainPid), { timeout: 10_000, intervals: [200, 500, 1_000] })
      .toBe(false);

    // Every owned fixture child must be gone too: an orphaned app-server after quit would
    // mean the before-quit stop path failed its single responsibility.
    for (const childPid of fixtureChildPids) {
      expect(await processExists(childPid), `fixture child ${childPid} exited`).toBe(false);
    }
  } finally {
    // Guarantee teardown even if an assertion fires mid-test; the launcher owns this process.
    await electronApplication.close().catch(() => undefined);
  }
});

test('a second launch while running exits after handing off to the existing window', async () => {
  // Share one profile so both processes contend for the identical single-instance lock.
  const sharedProfileDirectory = createDisposableUserDataDirectory();

  // Start the first instance and wait for its live window.
  const firstApplication = await launchBuiltApplication('full', {
    userDataDirectory: sharedProfileDirectory,
  });

  try {
    const firstPage = await firstApplication.firstWindow();
    await expect(firstPage.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();
    const firstPid = await firstApplication.evaluate(() => process.pid);

    // Attempt a second instance exactly as a user's double-launch would arrive: a plain
    // process with no debugger attachment. It must lose the lock, quit before creating
    // windows or state, and leave the first instance untouched.
    const secondProcess = spawnUnmanagedInstance('full', sharedProfileDirectory);
    const secondExited = new Promise<number | null>((resolve) => {
      secondProcess.once('exit', (code) => {
        resolve(code);
      });
    });
    try {
      const secondExitCode = await Promise.race([
        secondExited,
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('second instance did not exit within 10s'));
          }, 10_000);
        }),
      ]);
      expect(secondExitCode).toBe(0);
    } finally {
      // If the expectation failed because the instance kept running, stop it before teardown.
      if (secondProcess.exitCode === null && !secondProcess.killed) {
        secondProcess.kill('SIGTERM');
      }
    }

    expect(await processExists(firstPid)).toBe(true);

    // The surviving window must still answer user interaction after the handoff attempt.
    await expect(firstPage.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();
  } finally {
    // Close the exact test-owned first instance even when an assertion fails.
    await firstApplication.close().catch(() => undefined);
  }
});
