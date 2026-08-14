// Import Playwright's user-visible assertions and lifecycle.
import { expect, test } from '@playwright/test';

// Import the built-app launcher with its fixed unpackaged fixture scenario seam.
import { launchBuiltApplication } from '../helpers/launch-electron';

// Confirm one complete fixture traverses process transport, validation, normalization, IPC, preload, and React.
test('renders a complete fixture-backed Overview end to end', async () => {
  // Start the secure built app with the exact checked-in full-data fixture.
  const electronApplication = await launchBuiltApplication('full');

  try {
    // Resolve the one real Electron renderer.
    const page = await electronApplication.firstWindow();

    // Wait for the normalized data-bearing state.
    await expect(page.getByText('Codex connected')).toBeVisible();

    // Confirm reported and calculated values reached the presentation boundary.
    await expect(page.getByRole('heading', { level: 2, name: 'Codex' }).first()).toBeVisible();
    await expect(page.getByText('63%', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Calculated by Token Trail')).toHaveCount(2);

    // Confirm the bridge never exposes identifying fixture email text.
    await expect(page.getByText('fixture@example.invalid')).toHaveCount(0);

    // Capture curated fixture-backed Overview evidence only when a maintainer supplies a versioned path.
    const evidencePath = process.env['TOKENTRAIL_OVERVIEW_EVIDENCE_SCREENSHOT'];
    if (evidencePath !== undefined) {
      await page.setViewportSize({ width: 1180, height: 780 });
      await page.screenshot({ path: evidencePath, fullPage: true });
    }
  } finally {
    // Close the exact test-owned Electron process.
    await electronApplication.close();
  }
});

// Confirm keyed multi-bucket data remains complete and does not conceal the secondary bucket.
test('renders every reported quota bucket', async () => {
  // Launch the deterministic multi-bucket fixture.
  const electronApplication = await launchBuiltApplication('multiple-buckets');

  try {
    // Resolve the application renderer after normalization completes.
    const page = await electronApplication.firstWindow();
    await expect(page.getByText('2 reported')).toBeVisible();

    // Confirm both independently named buckets exist in the complete section.
    await expect(page.getByRole('heading', { level: 3, name: 'Codex' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: 'Code review' })).toBeVisible();
  } finally {
    // Close the test-owned application.
    await electronApplication.close();
  }
});

// Confirm missing fields remain explicit and markup-shaped labels remain inert text.
test('handles partial and markup-shaped protocol data safely', async () => {
  // Launch the null-field fixture first.
  const partialApplication = await launchBuiltApplication('null-fields');

  try {
    // Confirm partial state and unavailable fields remain visible rather than becoming zero.
    const partialPage = await partialApplication.firstWindow();
    await expect(partialPage.getByText(/Some Codex fields were unavailable/)).toBeVisible();
    await expect(partialPage.getByText(/Duration unavailable/).first()).toBeVisible();
    await expect(partialPage.getByText('0 minutes')).toHaveCount(0);
  } finally {
    // Close the first owned application before launching another single-instance process.
    await partialApplication.close();
  }

  // Launch the fixture carrying unknown fields and markup-shaped text.
  const hostileApplication = await launchBuiltApplication('unknown-fields');

  try {
    // Confirm React renders literal text and creates no injected image.
    const hostilePage = await hostileApplication.firstWindow();
    await expect(hostilePage.getByText('<img src=x onerror=alert(1)>').first()).toBeVisible();
    await expect(hostilePage.locator('img')).toHaveCount(1);
  } finally {
    // Close the second exact application.
    await hostileApplication.close();
  }
});

// Confirm signed-out, unsupported, invalid, oversized, and exited fixture outcomes degrade safely.
for (const [scenario, heading] of [
  ['missing-account', 'Codex is not signed in'],
  ['method-not-found', 'Codex compatibility needs attention'],
  ['malformed', 'The latest read did not complete'],
  ['oversized', 'The latest read did not complete'],
  ['app-server-exit', 'Codex data is unavailable'],
] as const) {
  // Generate one isolated end-to-end case per required failure fixture.
  test(`renders a safe ${scenario} state`, async () => {
    // Launch only the exact approved scenario name.
    const electronApplication = await launchBuiltApplication(scenario);

    try {
      // Confirm the local reviewed state heading appears without raw protocol detail.
      const page = await electronApplication.firstWindow();
      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
      await expect(page.getByText(/fixture method missing/)).toHaveCount(0);
      await expect(page.getByText(/not-json/)).toHaveCount(0);
    } finally {
      // Close the exact process for this generated scenario case.
      await electronApplication.close();
    }
  });
}
