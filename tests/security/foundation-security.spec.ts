// Import Playwright's assertions and test lifecycle for real Electron security checks.
import { expect, test } from '@playwright/test';

// Import the shared built-application launcher.
import { launchBuiltApplication } from '../helpers/launch-electron';

// Confirm web content cannot observe Node, Electron, environment, or raw IPC capabilities.
test('keeps privileged globals out of the renderer', async () => {
  // Launch the built application through its secure custom protocol.
  const electronApplication = await launchBuiltApplication();

  try {
    // Resolve the real renderer page after preload and context isolation have run.
    const page = await electronApplication.firstWindow();

    // Inspect only capability presence and the frozen public bridge from the untrusted renderer world.
    const capabilityState = await page.evaluate(() => {
      // Use a narrow structural view so the test can inspect globals TypeScript correctly omits from Window.
      const unsafeGlobal = globalThis as typeof globalThis & {
        require?: unknown;
        process?: unknown;
        ipcRenderer?: unknown;
      };

      // Return strings and booleans that cannot expose environment or machine data.
      return {
        requireType: typeof unsafeGlobal.require,
        processType: typeof unsafeGlobal.process,
        ipcRendererType: typeof unsafeGlobal.ipcRenderer,
        bridgeKeys: Object.keys(window.tokenTrail),
        bridgeFrozen: Object.isFrozen(window.tokenTrail),
      };
    });

    // Confirm no privileged global exists and the reviewed bridge remains empty and frozen.
    expect(capabilityState).toEqual({
      requireType: 'undefined',
      processType: 'undefined',
      ipcRendererType: 'undefined',
      bridgeKeys: [],
      bridgeFrozen: true,
    });
  } finally {
    // Close the test-owned application after capability inspection.
    await electronApplication.close();
  }
});

// Confirm compromised renderer code cannot navigate away or create another browsing context.
test('denies navigation and new windows', async () => {
  // Launch one built application and obtain its local renderer.
  const electronApplication = await launchBuiltApplication();

  try {
    // Wait for the initial custom-protocol document.
    const page = await electronApplication.firstWindow();

    // Record the trusted URL before attempting unapproved navigation.
    const trustedUrl = page.url();

    // Attempt a renderer-driven external navigation that the main policy must cancel before networking.
    await page.evaluate(() => {
      window.location.assign('https://example.com/');
    });

    // Confirm the renderer stayed at the trusted local origin.
    await expect.poll(() => page.url()).toBe(trustedUrl);

    // Attempt window creation and confirm Electron's deny handler returns no child window.
    const openedWindow = await page.evaluate(() => window.open('https://example.com/'));
    expect(openedWindow).toBeNull();

    // Confirm the application still owns exactly one renderer window.
    expect(electronApplication.windows()).toHaveLength(1);
  } finally {
    // Close the application process even if navigation behavior regresses.
    await electronApplication.close();
  }
});
