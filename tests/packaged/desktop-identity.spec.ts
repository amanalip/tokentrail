// Import filesystem and process helpers so identity reads come from the real packaged runtime.
import { readFile, readlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Import Playwright's user-visible assertions and test lifecycle.
import { expect, test, type Page } from '@playwright/test';

// Import the fused packaged-application harness with its environment seam.
import { launchPackagedApplication } from '../helpers/launch-packaged-application';

/**
 * Phase 4 desktop-identity evidence (plan section 8.6).
 *
 * Responsibility: verify that the packaged prototype carries the reviewed Linux identity across
 * the display-server backends available in this environment — the native Wayland path and the
 * X11 path through XWayland via the ozone platform hint. Trust level: observation of the real
 * packaged executable with a disposable profile; identity is only read, never rewritten.
 * Denied behavior: no window positioning or focus acquisition occurs in these launches.
 */

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Assert one launch exposes the reviewed people-facing and machine-facing identities. */
async function expectReviewedIdentity(page: Page, processId: number): Promise<void> {
  // Visible product name must be the spaced brand on real content, not a loading shell.
  await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();
  await expect(page).toHaveTitle('Token Trail');

  // The launcher-visible executable stays the machine-safe slug by design; /proc exposes the
  // link target, so readlink (not readFile) yields the executable path itself.
  const exeTarget = await readlink(`/proc/${processId}/exe`).catch(() => 'unknown');
  const exeBaseName = path.basename(exeTarget);
  expect(exeBaseName).toBe('tokentrail');
}

test('carries reviewed identity on the native Wayland backend', async () => {
  const harness = await launchPackagedApplication();
  try {
    await expectReviewedIdentity(harness.page, harness.processId);

    // The packaged manifest must carry both identities: the spaced product name for people and
    // the tokentrail slug for machines, so desktop metadata and runtime agree after install.
    // The manifest content lives past the archive's one-megabyte header region, so the whole
    // archive is scanned rather than a prefix.
    const asarBytes = await readFile(
      path.join(repositoryRoot, 'release', 'linux-unpacked', 'resources', 'app.asar'),
    );
    const asarText = asarBytes.toString('utf8');
    expect(asarText).toContain('"productName": "Token Trail"');
    expect(asarText).toContain('"name": "tokentrail"');
  } finally {
    await harness.close();
  }
});

test('carries reviewed identity when forced onto the X11 backend through XWayland', async () => {
  const harness = await launchPackagedApplication({
    extraEnv: { ELECTRON_OZONE_PLATFORM_HINT: 'x11' },
  });
  try {
    await expectReviewedIdentity(harness.page, harness.processId);

    // Confirm the hint reached Chromium so the run cannot silently degrade back to Wayland.
    const usingX11 = await harness.page.evaluate(() => navigator.userAgent.includes('X11'));
    expect(usingX11, 'ozone x11 hint did not reach the renderer user agent').toBe(true);
  } finally {
    await harness.close();
  }
});
