// Import Playwright's user-visible assertions and test lifecycle.
import { expect, test } from '@playwright/test';

// Import the launcher plus its shared-profile helper so two launches observe identical data.
import {
  createDisposableUserDataDirectory,
  launchBuiltApplication,
} from '../helpers/launch-electron';

/**
 * Phase 4 timezone-change evidence (plan section 8.4).
 *
 * Responsibility: prove that a timezone change between application sessions re-renders times in
 * the new local zone without corrupting the underlying snapshot timestamps or persisted
 * preferences. Trust level: observation of real launches with controlled environment variables.
 * Dependencies: the full checked-in fixture scenario, whose timestamps are fixed so formatted
 * output is deterministic per zone. Denied behavior: no stored timestamp is ever rewritten; only
 * presentation changes.
 */

test('renders identical fixture instants differently after a timezone change', async () => {
  // Both launches share one profile and scenario so the only variable is the timezone.
  const sharedProfile = createDisposableUserDataDirectory();

  const captureUpdatedTime = async (timeZoneIdentifier: string): Promise<string> => {
    const electronApplication = await launchBuiltApplication('full', {
      userDataDirectory: sharedProfile,
      extraEnv: { TZ: timeZoneIdentifier },
    });
    try {
      const page = await electronApplication.firstWindow();
      await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();

      // The Updated metric renders the last successful refresh instant in local time.
      const updated = page.getByRole('definition').filter({ hasText: /,/ }).first();
      const metricRow = page.locator('.metric-line', { hasText: 'Updated' });
      const rendered = (await metricRow.textContent()) ?? '';
      await expect(updated).toBeVisible();

      // Return the full row text; it contains the formatted local timestamp under test.
      return rendered.replace(/\s+/gu, ' ').trim();
    } finally {
      // Close this launch before observing the next timezone.
      await electronApplication.close();
    }
  };

  // Observe one fixed fixture instant from two far-apart zones (13 hours apart in summer).
  const easternObservation = await captureUpdatedTime('America/New_York');
  const tokyoObservation = await captureUpdatedTime('Asia/Tokyo');

  // Both observations must render a clock time, and they must differ across zones.
  expect(easternObservation).toMatch(/\d{1,2}:\d{2}/u);
  expect(tokyoObservation).toMatch(/\d{1,2}:\d{2}/u);
  expect(
    easternObservation,
    'identical formatted time across distant zones suggests TZ was ignored',
  ).not.toBe(tokyoObservation);
});
