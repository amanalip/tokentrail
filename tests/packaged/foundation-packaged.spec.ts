// Import Playwright's assertions and lifecycle for the unpacked Linux package.
import { expect, test } from '@playwright/test';

// Import filesystem access so packaged identity assets can be verified from the test process.
import { readFile } from 'node:fs/promises';

// Import path helpers to locate the packaged archive beside this checked-in suite.
import path from 'node:path';

// Import URL conversion so package paths never depend on the test working directory.
import { fileURLToPath } from 'node:url';

// Import the launcher that targets electron-builder output instead of the development Electron binary.
import { launchPackagedApplication } from '../helpers/launch-packaged-application';

// Confirm the packaged ASAR starts and preserves the visible and capability boundaries tested in development.
test('launches the hardened unpacked Linux package', async () => {
  // Start the exact executable produced by electron-builder.
  const packagedApplication = await launchPackagedApplication();

  try {
    // Wait for the packaged renderer's first local frame.
    const { page } = packagedApplication;

    // Confirm the package loads from the approved custom scheme. A plain poll hides
    // the failing value on timeout, so a miss rethrows with the live URL for diagnosis.
    try {
      await page.waitForURL('tokentrail://app/', { timeout: 15_000 });
    } catch {
      throw new Error(
        `Packaged document did not reach the approved custom scheme; current URL: ${page.url()}`,
      );
    }

    // Confirm the packaged product shell is visible.
    await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();
    await expect(page).toHaveTitle('Token Trail');

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

    // Attempt both a top-level remote navigation and a popup from the real packaged renderer.
    const popupResult = await page.evaluate(() => {
      const popup = window.open('https://example.invalid/');
      window.location.assign('https://example.invalid/');
      return popup === null;
    });

    // Require the popup denial and confirm the navigation guard preserves the packaged document.
    expect(popupResult).toBe(true);
    await expect.poll(() => page.url()).toBe('tokentrail://app/');

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

// Confirm the runtime window icon asset shipped inside the packaged application archive.
test('packages the Token Trail window icon inside the application archive', async () => {
  // Resolve the ASAR archive produced by electron-builder beside this suite's repository root.
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const asarPath = path.join(repositoryRoot, 'release', 'linux-unpacked', 'resources', 'app.asar');

  // Read the archive bytes and locate its JSON header, which lists every packaged file name.
  const asarBytes = await readFile(asarPath);
  const headerText = asarBytes.toString('utf8', 0, Math.min(asarBytes.length, 1_048_576));

  // The window icon must be present by exact name so createMainWindow resolves it in packaged mode.
  expect(headerText).toContain('tokentrail-icon-256.png');
});
