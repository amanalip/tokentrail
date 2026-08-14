// Import Playwright's user-visible assertions and test lifecycle for the real Electron shell.
import { expect, test } from '@playwright/test';

// Import the shared built-application launcher so accessibility evidence uses the secure renderer boundary.
import { launchBuiltApplication } from '../helpers/launch-electron';

// Confirm the minimal shell exposes a coherent semantic structure before interactive features are added.
test('provides the Phase 1 landmark and heading structure', async () => {
  // Launch one built Electron application through the production custom protocol.
  const electronApplication = await launchBuiltApplication();

  try {
    // Resolve the application renderer after its local document loads.
    const page = await electronApplication.firstWindow();

    // Confirm one main landmark contains the product's unique level-one heading.
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1, name: 'TokenTrail' })).toHaveCount(1);

    // Confirm the supporting boundary has a correctly nested level-two heading.
    await expect(page.getByRole('heading', { level: 2, name: 'Current boundary' })).toHaveCount(1);

    // Confirm the accurate development milestone is exposed as live status text.
    await expect(page.getByRole('status')).toHaveText('Phase 1 foundation');

    // Confirm the decorative logo contributes no duplicate accessible product name.
    await expect(page.locator('img.logo')).toHaveAttribute('alt', '');
  } finally {
    // Close the exact test-owned Electron process after semantic checks.
    await electronApplication.close();
  }
});

// Confirm the shell does not force horizontal scrolling at high zoom in a compact desktop window.
test('reflows without horizontal overflow at 200 percent zoom', async () => {
  // Launch a separate application so zoom and viewport state remain isolated.
  const electronApplication = await launchBuiltApplication();

  try {
    // Resolve and size the renderer to a compact but supported desktop viewport.
    const page = await electronApplication.firstWindow();
    await page.setViewportSize({ width: 800, height: 600 });

    // Apply 200 percent page zoom to model a common low-vision desktop configuration.
    await page.evaluate(() => {
      document.documentElement.style.zoom = '2';
    });

    // Compare layout and viewport widths without collecting any page content.
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );

    // Require vertical reflow instead of clipped or horizontally scrolling content.
    expect(hasHorizontalOverflow).toBe(false);
  } finally {
    // Close the exact test-owned Electron process after responsive accessibility checks.
    await electronApplication.close();
  }
});
