// Import Playwright's assertions and lifecycle for the unpacked Linux package.
import { expect, test } from '@playwright/test';

// Import the launcher that targets electron-builder output instead of the development Electron binary.
import { launchPackagedApplication } from '../helpers/launch-packaged-application';

// Confirm the packaged ASAR starts and preserves the visible and capability boundaries tested in development.
test('launches the hardened unpacked Linux package', async () => {
  // Start the exact executable produced by electron-builder.
  const packagedApplication = await launchPackagedApplication();

  try {
    // Wait for the packaged renderer's first local frame.
    const { page } = packagedApplication;

    // Confirm the package loads from the approved custom scheme.
    await expect.poll(() => page.url()).toBe('tokentrail://app/');

    // Confirm the packaged product shell is visible.
    await expect(page.getByRole('heading', { level: 1, name: 'TokenTrail' })).toBeVisible();

    // Inspect only the presence of prohibited renderer globals.
    const privilegedGlobalTypes = await page.evaluate(() => {
      // Describe possible unsafe globals without adding them to the production Window contract.
      const unsafeGlobal = globalThis as typeof globalThis & {
        require?: unknown;
        process?: unknown;
      };

      // Return capability types without reading any environment or filesystem data.
      return {
        requireType: typeof unsafeGlobal.require,
        processType: typeof unsafeGlobal.process,
      };
    });

    // Confirm packaging and fuses did not weaken renderer isolation.
    expect(privilegedGlobalTypes).toEqual({
      requireType: 'undefined',
      processType: 'undefined',
    });

    // Capture curated phase evidence only when an explicit output path is supplied by the maintainer.
    const evidencePath = process.env['TOKENTRAIL_EVIDENCE_SCREENSHOT'];

    // Keep routine CI transient while allowing versioned reports to embed a deliberate packaged screenshot.
    if (evidencePath !== undefined) {
      await page.screenshot({ path: evidencePath, fullPage: true });
    }
  } finally {
    // Close the packaged process owned by this test.
    await packagedApplication.close();
  }
});
