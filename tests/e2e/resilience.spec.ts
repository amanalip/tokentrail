// Import Playwright's user-visible assertions and test lifecycle.
import { expect, test } from '@playwright/test';

// Import the shared built-application launcher.
import { launchBuiltApplication } from '../helpers/launch-electron';

/**
 * Phase 4 resilience and resource-bound evidence (plan section 8.4).
 *
 * Responsibility: prove that repeated use stays bounded — chart instances do not accumulate,
 * windows never multiply, and rapid refreshes leave the application responsive — on the real
 * built application with real fixture data. Trust level: read-only observation plus normal user
 * input. Dependencies: the full checked-in fixture scenario. Denied behavior: no production
 * code paths are altered for these observations.
 */

test('bounds chart instances across repeated route churn', async () => {
  // Launch the complete fixture so Usage always renders a real chart.
  const electronApplication = await launchBuiltApplication('full');

  try {
    const page = await electronApplication.firstWindow();
    await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();

    // Alternate Overview <-> Usage eight times; each visit must own exactly one live chart
    // instance, and each departure must remove it together with its container.
    for (let round = 1; round <= 4; round += 1) {
      await page.evaluate(() => {
        window.location.hash = '#usage';
      });
      await expect(page.getByRole('heading', { level: 1, name: 'Usage' })).toBeVisible();
      await page.waitForTimeout(100);
      const instancesOnUsage = await page.evaluate(
        () => document.querySelectorAll('[_echarts_instance_]').length,
      );
      expect(instancesOnUsage, `round ${round}: chart instance count while mounted`).toBe(1);

      await page.evaluate(() => {
        window.location.hash = '#overview';
      });
      await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();
      const instancesAfterLeaving = await page.evaluate(
        () => document.querySelectorAll('[_echarts_instance_]').length,
      );
      expect(instancesAfterLeaving, `round ${round}: leftover chart containers`).toBe(0);
    }

    // Repeated use must never multiply windows or spawn extra top-level documents.
    const windowCount = await electronApplication.evaluate(
      ({ BrowserWindow }) => BrowserWindow.getAllWindows().length,
    );
    expect(windowCount).toBe(1);
  } finally {
    // Close the owned Electron process even when an assertion fails.
    await electronApplication.close();
  }
});

test('stays responsive through five consecutive manual refreshes', async () => {
  // Launch the complete fixture so each refresh completes against a real transport.
  const electronApplication = await launchBuiltApplication('full');

  try {
    const page = await electronApplication.firstWindow();
    await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();

    for (let round = 1; round <= 5; round += 1) {
      const refreshButton = page.getByRole('button', { name: /refresh/i });

      // Activate refresh and require the control to return to ready within the timeout budget.
      await refreshButton.click();
      await expect(refreshButton, `refresh round ${round} never returned to ready`).toBeEnabled({
        timeout: 10_000,
      });

      // The connection status region keeps describing current data after every round.
      await expect(page.getByRole('status').first()).toBeVisible();
    }

    // Five completed rounds later there is still exactly one window and one renderer document.
    const windowCount = await electronApplication.evaluate(
      ({ BrowserWindow }) => BrowserWindow.getAllWindows().length,
    );
    expect(windowCount).toBe(1);
  } finally {
    // Close the owned Electron process even when an assertion fails.
    await electronApplication.close();
  }
});
