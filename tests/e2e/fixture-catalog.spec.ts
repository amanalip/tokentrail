// Import Playwright's user-visible assertions and lifecycle.
import { expect, test } from '@playwright/test';

// Import the built-app launcher with its fixed unpackaged fixture scenario seam.
import { launchBuiltApplication } from '../helpers/launch-electron';

// Confirm server-designated primary-only data selects that window without fabricating a secondary.
test('renders a primary-only quota snapshot', async () => {
  // Launch the primary-only fixture through the real built application.
  const electronApplication = await launchBuiltApplication('primary-only');

  try {
    // Resolve the application renderer after normalization completes.
    const page = await electronApplication.firstWindow();
    await expect(page.getByText('Codex connected')).toBeVisible();

    // The Quota Windows route lists exactly the primary window for the single bucket.
    await page.getByRole('link', { name: 'Quota Windows' }).click();
    const primaryWindow = page.getByRole('region', { name: 'primary window' });
    await expect(primaryWindow).toBeVisible();
    await expect(page.getByRole('region', { name: 'secondary window' })).toHaveCount(0);
  } finally {
    // Close the exact test-owned Electron process.
    await electronApplication.close();
  }
});

// Confirm a reached-state report explains itself and coexists with high-percentage non-reached data.
test('explains reached states beside high percentages without reached flags', async () => {
  // Launch the reached-state fixture carrying both bucket kinds.
  const electronApplication = await launchBuiltApplication('reached-state');

  try {
    // Resolve the renderer and wait for the normalized two-bucket state.
    const page = await electronApplication.firstWindow();
    await expect(page.getByText('2 reported')).toBeVisible();

    // Every reached label offers its explanation deep link to Learn.
    const meaningLinks = page.getByRole('link', { name: 'what this means' });
    await expect(meaningLinks.first()).toBeVisible();

    // Following the contextual link lands on the exact packaged explanation.
    await meaningLinks.first().click();
    await expect(
      page.getByRole('heading', { level: 3, name: 'When a limit is hit' }),
    ).toBeVisible();
  } finally {
    // Close the test-owned application.
    await electronApplication.close();
  }
});

// Confirm decimal credit balances and structured spending controls reach the Credits route intact.
test('renders decimal balance and spending-control detail', async () => {
  // Launch the decimal-balance credits fixture.
  const electronApplication = await launchBuiltApplication('credits-decimal-balance');

  try {
    // Resolve the renderer and open the Credits destination.
    const page = await electronApplication.firstWindow();
    await page.getByRole('link', { name: 'Credits' }).click();

    // The original-unit strings survive normalization without conversion.
    await expect(page.getByText('$18.40')).toBeVisible();
    await expect(page.getByText('$40.00')).toBeVisible();
    await expect(page.getByText('46% remaining')).toBeVisible();
  } finally {
    // Close the test-owned application.
    await electronApplication.close();
  }
});

// Confirm missing dates stay explicit in the Usage coverage panel instead of becoming zeros.
test('lists missing dates in Usage coverage from gapped daily buckets', async () => {
  // Launch the gapped-usage fixture.
  const electronApplication = await launchBuiltApplication('usage-gaps');

  try {
    // Resolve the renderer and open the Usage destination.
    const page = await electronApplication.firstWindow();
    await page.getByRole('link', { name: 'Usage' }).click();

    // The partial banner and missing-date note are both visible with their explanation link.
    await expect(page.getByText(/source covered this data incompletely/)).toBeVisible();
    await expect(page.getByText(/2026-08-08/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'How missing days are handled' })).toBeVisible();
  } finally {
    // Close the test-owned application.
    await electronApplication.close();
  }
});

// Confirm counters beyond safe integer range display exactly in the accessible table view.
test('keeps huge token counters exact in the table view', async () => {
  // Launch the huge-counter fixture.
  const electronApplication = await launchBuiltApplication('usage-huge-counters');

  try {
    // Resolve the renderer and open the Usage destination's table view.
    const page = await electronApplication.firstWindow();
    await page.getByRole('link', { name: 'Usage' }).click();
    await page.getByRole('button', { name: 'Table' }).click();

    // The full precision value appears as grouped text in its table cell without float rounding.
    await expect(page.getByRole('cell', { name: '12,345,678,901,234,567,890' })).toBeVisible();
  } finally {
    // Close the test-owned application.
    await electronApplication.close();
  }
});

// Confirm every destination is reachable and activatable through raw keyboard events alone.
test('sweeps all six routes through keyboard-only navigation', async () => {
  // Launch the complete fixture so every route renders data-bearing content.
  const electronApplication = await launchBuiltApplication('full');

  try {
    // Resolve the renderer and wait for the initial Overview.
    const page = await electronApplication.firstWindow();
    await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();

    // Walk the destinations by pressing Tab until each nav link focuses, then activate with Enter.
    const destinations = [
      { name: 'Quota Windows', heading: 'Quota Windows' },
      { name: 'Usage', heading: 'Usage' },
      { name: 'Credits', heading: 'Credits and spending' },
      { name: 'Learn', heading: 'Learn' },
      { name: 'Settings & Diagnostics', heading: 'Settings & Diagnostics' },
    ] as const;

    for (const destination of destinations) {
      // Press Tab repeatedly until the link with this exact name holds focus.
      let focused = false;
      for (let steps = 0; steps < 40 && !focused; steps += 1) {
        await page.keyboard.press('Tab');
        focused = await page.evaluate((name) => {
          const active = document.activeElement;
          return (
            active instanceof HTMLAnchorElement &&
            active.classList.contains('nav-item') &&
            (active.textContent ?? '').replace(/^[○◉]/u, '') === name
          );
        }, destination.name);
      }
      expect(focused).toBe(true);

      // Activate through Enter and confirm the destination heading rendered.
      await page.keyboard.press('Enter');
      await expect(
        page.getByRole('heading', { level: 1, name: destination.heading }),
      ).toBeVisible();

      // Route changes move focus to the content heading by design; release it so the next leg
      // of the walk starts from the top of the tab order again.
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    }
  } finally {
    // Close the exact test-owned Electron process.
    await electronApplication.close();
  }
});

// Confirm a sparse update notification triggers a safe full read without breaking the session.
test('survives a sparse update notification after the first full snapshot', async () => {
  // Launch the after-full sparse-update fixture.
  const electronApplication = await launchBuiltApplication('sparse-update-after-full');

  try {
    // Resolve the renderer and confirm the initial connected state.
    const page = await electronApplication.firstWindow();
    await expect(page.getByText('Codex connected')).toBeVisible();

    // The notification-triggered full read keeps valid data visible rather than clearing sections.
    await expect(page.getByText('63%', { exact: true }).first()).toBeVisible();
  } finally {
    // Close the test-owned application.
    await electronApplication.close();
  }
});
