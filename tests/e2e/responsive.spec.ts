// Import Playwright's user-visible assertions and test lifecycle.
import { expect, test } from '@playwright/test';

// Import the shared built-application launcher.
import { launchBuiltApplication } from '../helpers/launch-electron';

// Import Electron's window sizing type so bounds updates stay typed in the main-process evaluate.
import type { Rectangle } from 'electron';

/**
 * The supported layout matrix.
 *
 * Window widths cover the enforced minimum (720 DIP), a typical laptop, and a large desktop;
 * zoom factors cover 100, 150, and 200 percent. Because Electron zoom scales content inside the
 * same window, each zoom level exercises a narrower effective CSS viewport: the minimum window at
 * 200 percent lays out at roughly 360 CSS pixels, below the narrowest breakpoint. One tall combo
 * checks the large-screen path where content is centered rather than stretched.
 */
const LAYOUT_MATRIX = Object.freeze([
  { width: 720, height: 560, zoom: 1 },
  { width: 720, height: 560, zoom: 1.5 },
  { width: 720, height: 560, zoom: 2 },
  { width: 1024, height: 640, zoom: 1 },
  { width: 1024, height: 640, zoom: 2 },
  { width: 1440, height: 900, zoom: 1 },
  { width: 1440, height: 900, zoom: 1.5 },
  { width: 1920, height: 1080, zoom: 1 },
]);

// Name every core action that must stay visible and unclipped across the matrix.
const NAVIGATION_LABELS = Object.freeze([
  'Overview',
  'Quota Windows',
  'Usage',
  'Credits',
  'Learn',
  'Settings & Diagnostics',
]);

test('keeps core actions visible and unclipped across widths and zoom levels', async () => {
  // Start one built application for the whole matrix; each combination resets its own geometry.
  const electronApplication = await launchBuiltApplication();

  try {
    const page = await electronApplication.firstWindow();

    // Wait for the shell so the first measured layout is real content, not the loading flash.
    await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();

    for (const combo of LAYOUT_MATRIX) {
      // Describe the combination inside assertions so any failure names its exact case.
      const label = `${combo.width}x${combo.height} at ${Math.round(combo.zoom * 100)}% zoom`;

      // Apply the window size from the trusted main process, then the zoom factor on its contents.
      await electronApplication.evaluate(
        ({ BrowserWindow }, next) => {
          const mainWindow = BrowserWindow.getAllWindows()[0];
          if (!mainWindow) throw new Error('Token Trail did not create a main window.');
          const bounds: Rectangle = { x: 0, y: 0, width: next.width, height: next.height };
          mainWindow.setBounds(bounds);
          mainWindow.webContents.setZoomFactor(next.zoom);
        },
        { width: combo.width, height: combo.height, zoom: combo.zoom },
      );

      // Wait two animation frames so layout settles after both geometry changes.
      await page.evaluate(
        () =>
          new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          }),
      );

      // The document must never scroll horizontally; vertical growth is expected when stacking.
      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(overflow.scrollWidth, `horizontal overflow at ${label}`).toBeLessThanOrEqual(
        overflow.clientWidth + 1,
      );

      // The brand link must remain visible with a measurable box.
      const brand = page.getByRole('link', { name: 'Token Trail Overview' });
      await expect(brand, `brand hidden at ${label}`).toBeVisible();

      // Every navigation destination stays reachable; none may extend past the right edge.
      // Queries scope to the navigation landmark because contextual content links (for example
      // corrective actions pointing at Learn) share label prefixes with nav destinations.
      const navigation = page.getByRole('navigation', { name: 'Token Trail sections' });
      await expect(navigation, `navigation missing at ${label}`).toBeVisible();
      for (const navLabel of NAVIGATION_LABELS) {
        const link = navigation.getByRole('link', { name: navLabel, exact: true });
        await expect(link, `${navLabel} link hidden at ${label}`).toBeVisible();
        const box = await link.boundingBox();
        expect(box, `${navLabel} box missing at ${label}`).not.toBeNull();
        expect(box!.x, `${navLabel} starts left of viewport at ${label}`).toBeGreaterThanOrEqual(0);
        expect(
          box!.x + box!.width,
          `${navLabel} extends past viewport at ${label}`,
        ).toBeLessThanOrEqual(overflow.clientWidth + 1);
      }

      // The primary refresh control keeps a usable target and its label never clips mid-glyph.
      const refreshButton = page.getByRole('button', { name: /refresh/i });
      await expect(refreshButton, `refresh control hidden at ${label}`).toBeVisible();
      const clipped = await refreshButton.evaluate((element) => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        clientHeight: element.clientHeight,
      }));
      expect(clipped.clientWidth, `refresh control collapsed at ${label}`).toBeGreaterThan(0);
      expect(clipped.scrollWidth, `refresh label clipped at ${label}`).toBeLessThanOrEqual(
        clipped.clientWidth + 1,
      );
      expect(clipped.clientHeight, `refresh control too short at ${label}`).toBeGreaterThanOrEqual(
        24,
      );

      // The page heading is the widest display text; it must not clip horizontally either.
      const headingClipped = await page
        .getByRole('heading', { level: 1 })
        .evaluate((element) => element.scrollWidth - element.clientWidth);
      expect(headingClipped, `page heading clipped at ${label}`).toBeLessThanOrEqual(1);
    }
  } finally {
    // Close the owned Electron process even when an assertion fails.
    await electronApplication.close();
  }
});
