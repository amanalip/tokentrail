// Import Playwright's user-visible assertions, test lifecycle, and the page type for helper signatures.
import { expect, test, type Page } from '@playwright/test';

// Import the shared built-application launcher and its shared-profile helper.
import {
  createDisposableUserDataDirectory,
  launchBuiltApplication,
} from '../helpers/launch-electron';

// Read the effective background token so assertions track computed palette state, not attributes alone.
const readBackgroundToken = (page: Page) =>
  page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--background').trim(),
  );

// Confirm preference changes apply immediately and survive an application restart.
test('applies theme preferences live and persists them across restarts', async () => {
  // Share one profile across both launches so the restart reads the document the first wrote.
  const sharedProfileDirectory = createDisposableUserDataDirectory();

  // Launch one built application with fixture data.
  const firstApplication = await launchBuiltApplication('full', {
    userDataDirectory: sharedProfileDirectory,
  });

  try {
    // Resolve the renderer and open the real settings controls.
    const page = await firstApplication.firstWindow();
    await page.getByRole('link', { name: 'Settings & Diagnostics' }).click();

    // Choose Dark through its radio and require the palette to change without any restart.
    await page.getByRole('radio', { name: 'Dark' }).click();
    await expect.poll(() => readBackgroundToken(page), { timeout: 5_000 }).toBe('#090d14');
    await expect(page.getByRole('radio', { name: 'Dark' })).toBeChecked();

    // Choose Light through its radio and require the immediate opposite change.
    await page.getByRole('radio', { name: 'Light' }).click();
    await expect.poll(() => readBackgroundToken(page), { timeout: 5_000 }).toBe('#f4f7fb');
    await expect(page.getByRole('radio', { name: 'Light' })).toBeChecked();

    // Restore the neutral default so repeated runs stay independent of persisted state.
    await page.getByRole('group', { name: 'Theme' }).getByRole('radio', { name: 'System' }).click();
  } finally {
    // Close the exact test-owned process before launching a fresh instance.
    await firstApplication.close();
  }

  // Launch a second instance whose initial load must read the persisted document from disk.
  const secondApplication = await launchBuiltApplication('full', {
    userDataDirectory: sharedProfileDirectory,
  });

  try {
    // Resolve the restarted renderer.
    const page = await secondApplication.firstWindow();

    // The System selection restored the default; the document carries no explicit override.
    await expect
      .poll(async () => page.evaluate(() => document.documentElement.dataset.theme), {
        timeout: 5_000,
      })
      .toBeUndefined();
  } finally {
    // Close the exact restarted process.
    await secondApplication.close();
  }
});
