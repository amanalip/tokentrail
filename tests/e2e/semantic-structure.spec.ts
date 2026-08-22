// Import Playwright's user-visible assertions and test lifecycle.
import { expect, test } from '@playwright/test';

// Import the shared built-application launcher so observations run against the real application.
import { launchBuiltApplication } from '../helpers/launch-electron';

/**
 * Phase 4 semantic-structure evidence (plan section 8.3).
 *
 * Responsibility: verify the machine-checkable portion of the landmark, heading, name,
 * description, error, and announcement requirements against the real built application —
 * one stable landmark inventory with a first-focus skip link, exactly one named heading per
 * route, signed-out and error states presented as named regions, and live-region semantics
 * that stay quiet by default. Trust level: read-only inspection of rendered content.
 * Dependencies: the full and missing-account fixture scenarios only; no real Codex data.
 * Denied behavior: these tests never replace the human Orca session recorded separately
 * under LIM-001; they prove the structural substrate that session will consume.
 */

/** The six implemented destinations with their exact heading copy. */
const DESTINATIONS = [
  { hash: '#overview', heading: 'Overview' },
  { hash: '#windows', heading: 'Quota Windows' },
  { hash: '#usage', heading: 'Usage' },
  { hash: '#credits', heading: 'Credits and spending' },
  { hash: '#learn', heading: 'Learn' },
  { hash: '#settings', heading: 'Settings & Diagnostics' },
] as const;

test('presents one stable landmark inventory with a single heading per route', async () => {
  // Launch the complete fixture so every route renders its data-bearing content.
  const electronApplication = await launchBuiltApplication('full');

  try {
    const page = await electronApplication.firstWindow();
    await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();

    // The landmark inventory is part of the accessibility contract: exactly one main content
    // landmark, the branded sidebar as a named complementary landmark, and its link list as a
    // named navigation landmark so screen-reader users can jump between them directly.
    expect(await page.getByRole('main').count()).toBe(1);
    const complementary = page.getByRole('complementary', { name: 'Primary navigation' });
    expect(await complementary.count()).toBe(1);
    expect(await page.getByRole('navigation', { name: 'Token Trail sections' }).count()).toBe(1);

    // The content bypass must be the very first control in the tab order so keyboard users
    // reach it before any navigation link.
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();

    // Every route owns exactly one top-level heading inside the main landmark; duplicates or
    // missing headings would scramble how assistive technology summarizes each destination.
    for (const destination of DESTINATIONS) {
      await page.evaluate((hash) => {
        window.location.hash = hash;
      }, destination.hash);
      await expect(
        page.getByRole('heading', { level: 1, name: destination.heading }),
      ).toBeVisible();
      expect(await page.getByRole('heading', { level: 1 }).count()).toBe(1);

      // The route heading must live in the main landmark rather than the navigation rail.
      const headingInMain = await page
        .getByRole('main')
        .getByRole('heading', { level: 1, name: destination.heading })
        .count();
      expect(headingInMain).toBe(1);
    }
  } finally {
    // Close the owned Electron process even when an assertion fails.
    await electronApplication.close();
  }
});

test('gives every interactive control an accessible name on data and settings routes', async () => {
  // Launch the complete fixture so both surveyed routes render their full control sets.
  const electronApplication = await launchBuiltApplication('full');

  try {
    const page = await electronApplication.firstWindow();

    // Survey the Overview (buttons, links, progress bars) and Settings & Diagnostics (radios,
    // checkboxes, search input through Learn) so icon-only styling can never orphan a control
    // from its name. An unnamed control is unreadable to assistive technology.
    const surveyTargets = [
      { hash: '#overview', roles: ['button', 'link', 'progressbar'] },
      { hash: '#settings', roles: ['button', 'link', 'radio', 'checkbox'] },
      { hash: '#learn', roles: ['button', 'link', 'searchbox'] },
    ] as const;

    for (const target of surveyTargets) {
      await page.evaluate((hash) => {
        window.location.hash = hash;
      }, target.hash);
      await expect(page.locator('main').getByRole('heading', { level: 1 })).toBeVisible();

      for (const role of target.roles) {
        const controls = await page.getByRole(role).all();
        for (const control of controls) {
          await expect(control).toHaveAccessibleName(/.+/u);
        }
      }
    }

    // Pin the control families this survey exists to catch at their canonical locations so a
    // silent regression (for example, an icon-only refresh button) cannot empty the sweep.
    await page.evaluate(() => {
      window.location.hash = '#overview';
    });
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.getByRole('progressbar').count()).toBeGreaterThan(0);
    await page.evaluate(() => {
      window.location.hash = '#settings';
    });
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.getByRole('radio').count()).toBeGreaterThan(0);
    await page.evaluate(() => {
      window.location.hash = '#learn';
    });
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.getByRole('searchbox').count()).toBeGreaterThan(0);
  } finally {
    // Close the owned Electron process even when an assertion fails.
    await electronApplication.close();
  }
});

test('presents connection states as named regions with quiet live-region semantics', async () => {
  // Launch the signed-out scenario so an initial error-family state renders on load.
  const electronApplication = await launchBuiltApplication('missing-account');

  try {
    const page = await electronApplication.firstWindow();

    // Signed-out guidance is a jump target, not an emergency: it must be a named region with
    // its own heading, and it must not borrow alert semantics that would fire on every load.
    const region = page.getByRole('region', { name: 'Codex is not signed in' });
    await expect(region).toBeVisible();
    await expect(
      region.getByRole('heading', { level: 2, name: 'Codex is not signed in' }),
    ).toBeVisible();
    expect(await page.getByRole('alert').count()).toBe(0);

    // The resting state must expose no assertive announcements anywhere in the document.
    const alertRoles = await page.evaluate(
      () => document.querySelectorAll('[role="alert"]').length,
    );
    expect(alertRoles).toBe(0);
  } finally {
    // Close the owned Electron process even when an assertion fails.
    await electronApplication.close();
  }
});
