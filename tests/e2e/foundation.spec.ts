// Import Playwright's user-visible assertions and test lifecycle.
import { expect, test } from '@playwright/test';

// Import the shared built-application launcher.
import { launchBuiltApplication } from '../helpers/launch-electron';

// Confirm a production build reaches the local shell through the custom application protocol.
test('launches the packaged-content foundation shell', async () => {
  // Start one Electron application from the completed Vite bundles.
  const electronApplication = await launchBuiltApplication();

  try {
    // Wait for the first and only TokenTrail window.
    const page = await electronApplication.firstWindow();

    // Confirm navigation uses the fixed secure local scheme rather than file or remote HTTP content.
    await expect.poll(() => page.url()).toBe('tokentrail://app/');

    // Confirm the visible product identity and honest milestone reached the real Electron renderer.
    await expect(page.getByRole('heading', { level: 1, name: 'TokenTrail' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText('Phase 1 foundation');
  } finally {
    // Close the owned Electron process even when an assertion fails.
    await electronApplication.close();
  }
});

// Confirm system, explicit light, and explicit dark theme paths select the reviewed shell tokens.
test('supports system, light, and dark shell themes', async () => {
  // Launch a fresh built application so theme mutations cannot affect another test.
  const electronApplication = await launchBuiltApplication();

  try {
    // Resolve the renderer page after the secure custom-protocol document loads.
    const page = await electronApplication.firstWindow();

    // Read the root background token without depending on antialiasing or screenshot pixel sampling.
    const readBackgroundToken = () =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--background').trim(),
      );

    // Leave the data attribute absent and simulate a dark operating-system preference.
    await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect.poll(readBackgroundToken).toBe('#0b0e14');

    // Confirm system mode follows the corresponding light operating-system preference.
    await page.emulateMedia({ colorScheme: 'light' });
    await expect.poll(readBackgroundToken).toBe('#f4f7fb');

    // Confirm explicit dark overrides a light operating-system preference.
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await expect.poll(readBackgroundToken).toBe('#0b0e14');

    // Confirm explicit light overrides a dark operating-system preference.
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await expect.poll(readBackgroundToken).toBe('#f4f7fb');
  } finally {
    // Close the exact test-owned Electron process after theme checks.
    await electronApplication.close();
  }
});
