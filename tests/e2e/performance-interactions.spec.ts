// Import Node's file writer so interaction evidence can be curated into versioned reports.
import { writeFile } from 'node:fs/promises';

// Import Playwright's assertions, test lifecycle, and fixture metadata.
import { expect, test, type Page } from '@playwright/test';

// Import the shared built-application launcher with its fixture seam.
import { launchBuiltApplication } from '../helpers/launch-electron';

/**
 * Phase 4 interaction-timing evidence (plan section 8.5).
 *
 * Responsibility: measure Overview refresh feedback, chart-ready time on first Usage visit
 * (including the lazy chart chunk), and chart/table toggle latency against the built application
 * with real fixture data. Packaged startup, idle CPU, and memory gates live in the packaged
 * performance suite because the packaged harness intentionally runs without the fixture seam.
 * Denied behavior: no production timing hooks are added; all measurements observe user-visible
 * readiness through standard roles.
 */

/** Time one awaited predicate and return the elapsed milliseconds with tenth precision. */
async function timed(
  page: Page,
  action: () => Promise<void>,
  ready: () => Promise<boolean>,
): Promise<number> {
  const startedAt = performance.now();
  await action();
  while (!(await ready())) {
    if (performance.now() - startedAt > 15_000) {
      throw new Error('Interaction did not become ready within the fifteen-second budget.');
    }
    await page.waitForTimeout(25);
  }
  return Number((performance.now() - startedAt).toFixed(1));
}

test('records interaction timings for refresh, chart load, and view toggles', async ({
  browserName,
}, testInfo) => {
  // Launch the complete fixture so every measured interaction operates on real data states.
  const electronApplication = await launchBuiltApplication('full');

  try {
    const page = await electronApplication.firstWindow();
    await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();

    // --- Manual refresh feedback ---------------------------------------------------
    const refreshDurations: number[] = [];
    for (let round = 1; round <= 5; round += 1) {
      const refreshButton = page.getByRole('button', { name: /refresh/i });
      const duration = await timed(
        page,
        () => refreshButton.click(),
        async () => refreshButton.isEnabled(),
      );
      // The first click's duration is dominated by activation bookkeeping rather than the round
      // trip; recording from round one keeps the series honest about that ordering.
      refreshDurations.push(duration);
    }

    // --- First Usage visit including the lazy chart chunk ---------------------------
    const chartReadyMilliseconds = await timed(
      page,
      async () => {
        await page.evaluate(() => {
          window.location.hash = '#usage';
        });
      },
      async () =>
        (await page.getByRole('img', { name: /Bar chart of daily token totals/ }).count()) > 0,
    );

    // --- Chart and table toggle latency ----------------------------------------------
    const tableToggleMilliseconds = await timed(
      page,
      async () => {
        await page.getByRole('button', { name: 'Table' }).click();
      },
      async () => (await page.getByRole('region', { name: 'Daily usage table' }).count()) > 0,
    );

    const chartToggleMilliseconds = await timed(
      page,
      async () => {
        await page.getByRole('button', { name: 'Chart' }).click();
      },
      async () =>
        (await page.getByRole('img', { name: /Bar chart of daily token totals/ }).count()) > 0,
    );

    // Assemble the evidence object with the same shape discipline as packaged metrics.
    const evidence = {
      playwrightController: browserName,
      refreshRoundTripMilliseconds: refreshDurations,
      chartReadyMilliseconds,
      tableToggleMilliseconds,
      chartToggleMilliseconds,
    };

    // Curated evidence path mirrors the packaged performance suite's environment override.
    const evidencePath =
      process.env['TOKENTRAIL_INTERACTION_EVIDENCE'] ??
      testInfo.outputPath('interaction-performance.json');
    await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
    await testInfo.attach('interaction-performance', {
      body: Buffer.from(JSON.stringify(evidence)),
      contentType: 'application/json',
    });

    // Phase 4 gates: interaction feedback must feel immediate against local data.
    expect(evidence.chartReadyMilliseconds).toBeLessThanOrEqual(2_000);
    expect(evidence.tableToggleMilliseconds).toBeLessThanOrEqual(500);
    expect(evidence.chartToggleMilliseconds).toBeLessThanOrEqual(500);
    for (const duration of refreshDurations) {
      expect(duration, `refresh round exceeded feedback budget: ${duration}ms`).toBeLessThanOrEqual(
        5_000,
      );
    }
  } finally {
    // Close the owned Electron process even when an assertion fails.
    await electronApplication.close();
  }
});
