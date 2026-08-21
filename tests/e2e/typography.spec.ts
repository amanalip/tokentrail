// Import Playwright's user-visible assertions, test lifecycle, and the page type for helper signatures.
import { expect, test, type Page } from '@playwright/test';

// Import path helpers so maintainer-supplied evidence directories resolve deterministically.
import path from 'node:path';

// Import the shared built-application launcher with its fixture seam.
import { launchBuiltApplication } from '../helpers/launch-electron';

// Enumerate the representative primary-metric values required by the Phase 3 readability matrix.
const REPRESENTATIVE_VALUES = [11, 47, 48, 88, 100] as const;

// Name the narrowest supported Overview width from the window's reviewed minimum constraints.
const NARROWEST_WIDTH = 720;

// Describe one measured geometry snapshot of a rendered display number.
interface DisplayNumberGeometry {
  readonly text: string;
  readonly clientWidth: number;
  readonly scrollWidth: number;
  readonly clientHeight: number;
  readonly scrollHeight: number;
  readonly letterSpacingPx: number;
  readonly fontVariantNumeric: string;
  readonly whiteSpace: string;
}

/**
 * Read one bounded geometry snapshot of the first rendered display number. Clipping appears as scroll
 * dimensions exceeding client dimensions; missing tokens appear as unset computed styles.
 */
async function readDisplayNumberGeometry(page: Page) {
  return page.evaluate<DisplayNumberGeometry>(() => {
    // Select the dedicated large-metric token element by its reviewed class name.
    const element = document.querySelector<HTMLElement>('.display-number');
    if (element === null) throw new Error('No display number rendered.');

    // Computed styles expose the numeric-presentation tokens under review.
    const styles = getComputedStyle(element);
    return {
      text: (element.textContent ?? '').trim(),
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      letterSpacingPx: Number.parseFloat(styles.letterSpacing || '0'),
      fontVariantNumeric: styles.fontVariantNumeric,
      whiteSpace: styles.whiteSpace,
    };
  });
}

// Confirm every representative value renders unclipped with explicit numeric typography tokens.
test('renders representative percentages with distinct, unclipped glyphs across the matrix', async () => {
  // Resolve the optional maintainer-supplied evidence directory for curated screenshots.
  const evidenceDirectory = process.env['TOKENTRAIL_TYPOGRAPHY_EVIDENCE_DIR'];

  // Run the full matrix once per representative value because each fixture exposes one primary metric.
  for (const remainingValue of REPRESENTATIVE_VALUES) {
    // Launch the exact parameterized fixture for this remaining percentage.
    const electronApplication = await launchBuiltApplication(`typography-${remainingValue}`);

    try {
      // Resolve the renderer and wait for the connected data-bearing Overview.
      const page = await electronApplication.firstWindow();
      await expect(page.getByText('Codex connected')).toBeVisible();

      // Capture both themes at both zoom levels and the narrowest supported width.
      for (const theme of ['light', 'dark'] as const) {
        // Apply the theme through the real settings control so preference plumbing stays exercised.
        await page.getByRole('link', { name: 'Settings & Diagnostics' }).click();
        await page.getByRole('radio', { name: theme === 'light' ? 'Light' : 'Dark' }).click();
        await page.getByRole('link', { name: 'Overview', exact: true }).click();
        await expect(
          page.locator('.display-number', { hasText: `${remainingValue}%` }),
        ).toBeVisible();

        for (const zoomFactor of [1, 2] as const) {
          // Apply zoom through the renderer itself so glyph scaling matches a real zoom session.
          await page.evaluate((factor) => {
            document.documentElement.style.zoom = factor === 1 ? '' : `${factor}`;
          }, zoomFactor);

          // Measure at the default window size first.
          await page.setViewportSize({ width: 1180, height: 900 });
          let geometry = await readDisplayNumberGeometry(page);

          // The exact reported value must be the visible text without rounding or substitution.
          expect(geometry.text).toBe(`${remainingValue}%`);

          // No glyph may clip horizontally; nowrap plus narrow widths are the real clipping risk.
          expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);

          // Vertical ink overflow beyond the tight 1.1 line-height is expected for display type
          // because ancestors leave overflow visible, so bound it instead of forbidding it.
          expect(geometry.scrollHeight).toBeLessThanOrEqual(geometry.clientHeight * 1.5);

          // The reviewed numeric tokens must be active rather than font defaults.
          expect(geometry.fontVariantNumeric).toContain('tabular-nums');
          expect(geometry.letterSpacingPx).toBeGreaterThan(0);
          expect(geometry.whiteSpace).toBe('nowrap');

          // Repeat the measurement at the narrowest supported Overview width.
          await page.setViewportSize({ width: NARROWEST_WIDTH, height: 900 });
          geometry = await readDisplayNumberGeometry(page);
          expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);

          // Persist curated matrix evidence only when a maintainer supplies a versioned directory.
          // Capture the primary card itself so the reviewed glyph rendering fills the frame.
          if (evidenceDirectory !== undefined) {
            const primaryCard = page.locator('.primary-card');
            await primaryCard.scrollIntoViewIfNeeded();
            await primaryCard.screenshot({
              path: path.join(
                evidenceDirectory,
                `typography-${remainingValue}-${theme}-${zoomFactor}x-${NARROWEST_WIDTH}w.png`,
              ),
            });
          }

          // Restore the default viewport before the next capture.
          await page.setViewportSize({ width: 1180, height: 900 });
        }

        // Reset zoom after each theme block so the next theme starts from the baseline.
        await page.evaluate(() => {
          document.documentElement.style.zoom = '';
        });
      }
    } finally {
      // Close the exact test-owned Electron process for this value.
      await electronApplication.close();
    }
  }
});
