// Import read and write access for one carefully restored CSS hot-update check.
import { readFile, writeFile } from 'node:fs/promises';

// Import path helpers and URL conversion for the exact stylesheet path.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Import Playwright assertions and test lifecycle.
import { expect, test } from '@playwright/test';

// Import the harness that starts the real npm development orchestration.
import { launchDevelopmentApplication } from '../helpers/launch-development-application';

// Resolve the tracked stylesheet independently of the test command's directory.
const stylesheetPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'src',
  'renderer',
  'styles.css',
);

// Confirm Vite development CSS loads under the explicit development policy and updates without restart.
test('loads and hot-updates authored CSS through the npm development orchestrator', async () => {
  // Read the exact original bytes so cleanup can restore them even after a failed assertion.
  const originalStylesheet = await readFile(stylesheetPath, 'utf8');

  // Start Vite watchers, the Vite renderer server, Electron, and the full checked-in data fixture.
  const developmentApplication = await launchDevelopmentApplication();

  try {
    // Resolve the actual loopback Vite renderer.
    const page = developmentApplication.page;
    await expect.poll(() => page.url()).toBe('http://127.0.0.1:5173/');

    // Collect only console message categories and text needed to identify a CSP regression.
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    // Require authored grid layout and local font tokens rather than browser defaults.
    await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();
    await expect
      .poll(() =>
        page.locator('.app-shell').evaluate((element) => getComputedStyle(element).display),
      )
      .toBe('grid');
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.body).fontFamily))
      .toContain('Inter');

    // Force the explicit dark token set so the hot-update assertion is independent of host color preference.
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

    // Replace one exact token with a distinctive test color and let Vite apply it through CSS HMR.
    const updatedStylesheet = originalStylesheet.replace('--mint: #54e5c1;', '--mint: #45d7b2;');
    expect(updatedStylesheet).not.toBe(originalStylesheet);
    await writeFile(stylesheetPath, updatedStylesheet, 'utf8');

    // Confirm the existing page receives the new computed token without Electron restart.
    await expect
      .poll(() =>
        page.evaluate(() =>
          getComputedStyle(document.documentElement).getPropertyValue('--mint').trim(),
        ),
      )
      .toBe('#45d7b2');

    // Restore the reviewed token and confirm a second hot update before capturing durable evidence.
    await writeFile(stylesheetPath, originalStylesheet, 'utf8');
    await expect
      .poll(() =>
        page.evaluate(() =>
          getComputedStyle(document.documentElement).getPropertyValue('--mint').trim(),
        ),
      )
      .toBe('#54e5c1');

    // Confirm the development console contains no inline-style CSP rejection.
    expect(
      consoleErrors.filter((message) => /content security policy|style-src/iu.test(message)),
    ).toEqual([]);

    // Capture deliberate development evidence only when the maintainer supplies a versioned path.
    const evidencePath = process.env['TOKENTRAIL_DEVELOPMENT_EVIDENCE_SCREENSHOT'];
    if (evidencePath !== undefined) {
      await page.setViewportSize({ width: 1180, height: 780 });
      await page.screenshot({ path: evidencePath, fullPage: true });
    }
  } finally {
    // Restore the exact original stylesheet before stopping Vite so the working tree remains unchanged.
    await writeFile(stylesheetPath, originalStylesheet, 'utf8');
    await developmentApplication.close();
  }
});

// Confirm the same authored development styling remains present in the sanitized unavailable state.
test('renders the styled Codex-unavailable development state', async () => {
  // Start the real development orchestration with a fixture that exits during its approved quota read.
  const developmentApplication = await launchDevelopmentApplication('app-server-exit');

  try {
    // Require the safe state and authored grid layout in the same real Vite renderer.
    const page = developmentApplication.page;
    await expect(page.getByRole('heading', { name: 'Codex data is unavailable' })).toBeVisible();
    await expect
      .poll(() =>
        page.locator('.app-shell').evaluate((element) => getComputedStyle(element).display),
      )
      .toBe('grid');

    // Capture paired development evidence only when a versioned path is supplied.
    const evidencePath = process.env['TOKENTRAIL_DEVELOPMENT_UNAVAILABLE_SCREENSHOT'];
    if (evidencePath !== undefined) {
      await page.setViewportSize({ width: 1180, height: 780 });
      await page.screenshot({ path: evidencePath, fullPage: true });
    }
  } finally {
    // Stop the complete npm-owned development process group.
    await developmentApplication.close();
  }
});
