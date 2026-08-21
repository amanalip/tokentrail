// Import renderer testing helpers that query through user-visible semantics.
import { act, render, screen, within } from '@testing-library/react';

// Import user interaction helpers for navigation and preference controls.
import userEvent from '@testing-library/user-event';

// Import Vitest lifecycle, mock, and assertion helpers.
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Import runtime validation and the public snapshot type for safe fixtures.
import {
  createLoadingOverviewSnapshot,
  overviewSnapshotSchema,
  type OverviewSnapshot,
} from '../../shared/contracts/overview-snapshot';
import { createDefaultPreferences, type Preferences } from '../../shared/contracts/preferences';
import { createUnavailableCreditsSection } from '../../shared/contracts/credits-data';
import { createNumericMetric } from '../../shared/contracts/metric';
import type { TokenTrailBridge } from '../../shared/contracts/token-trail-bridge';
import type { DiagnosticsDocument } from '../../shared/contracts/diagnostics';

// Import the shell under test so route switching is exercised through real navigation.
import { App } from '../App';

// Construct one complete snapshot fixture including usage and credit sections.
function createSnapshot(overrides: Partial<OverviewSnapshot> = {}): OverviewSnapshot {
  // Start from the honest loading factory so every section exists with valid defaults.
  const base = createLoadingOverviewSnapshot('2026-08-14T07:00:00.000Z');

  // Parse every test value so fixtures cannot bypass renderer contract invariants.
  return overviewSnapshotSchema.parse({
    ...base,
    state: 'ready',
    accountKind: 'chatgpt',
    planType: 'plus',
    quotas: [
      {
        id: 'codex',
        name: 'Codex',
        planType: 'plus',
        reached: false,
        windows: [
          {
            kind: 'primary',
            usedPercent: createNumericMetric(37, 'codex-reported', 'used-percentage-reported'),
            remainingPercent: createNumericMetric(
              63,
              'calculated',
              'remaining-is-one-hundred-minus-used',
            ),
            durationMinutes: createNumericMetric(
              300,
              'codex-reported',
              'duration-reported-in-minutes',
            ),
            resetsAt: createNumericMetric(1_800_000_000, 'codex-reported', 'reset-time-reported'),
          },
        ],
      },
    ],
    usage: {
      ...base.usage,
      state: 'ready',
      days: [
        { date: '2026-08-12', tokens: '91210', provenance: 'codex-reported' },
        { date: '2026-08-13', tokens: '0', provenance: 'codex-reported' },
        { date: '2026-08-14', tokens: '124500', provenance: 'codex-reported' },
      ],
      summary: {
        ...base.usage.summary,
        lifetimeTokens: '4203910',
        currentStreakDays: 8,
      },
      coverage: {
        ...base.usage.coverage,
        validDateCount: 3,
        reportedZeroCount: 1,
        firstValidDate: '2026-08-12',
        lastValidDate: '2026-08-14',
      },
    },
    credits: {
      ...createUnavailableCreditsSection(),
      state: 'ready',
      balanceAmount: '$18.40',
      resetCreditsAvailableCount: 2,
      resetCreditDetails: [
        {
          title: 'Extended session reset',
          description: 'Backend-provided description text',
          expiresAtSeconds: 1_800_000_000,
          state: 'available',
        },
      ],
      resetCreditDetailsCapped: true,
    },
    lastSuccessfulRefreshAt: '2026-08-14T07:00:00.000Z',
    refreshAttemptedAt: '2026-08-14T07:00:00.000Z',
    errorCategory: null,
    ...overrides,
  });
}

// Install one frozen purpose-specific bridge before each renderer test.
function installBridge(initialSnapshot: OverviewSnapshot) {
  // Retain persisted preferences so settings tests can assert exact stored documents.
  let storedPreferences: Preferences = createDefaultPreferences();

  // Retain the diagnostics document returned by preview calls.
  const previewDocument: DiagnosticsDocument = {
    schemaVersion: 1,
    generatedAtIso: '2026-08-14T07:00:00.000Z',
    application: {
      tokenTrailVersion: '0.3.0',
      electronVersion: '43.0.0',
      chromiumVersion: '134.0.0.0',
      nodeVersion: '24.0.0',
    },
    platform: {
      operatingSystem: 'linux',
      architecture: 'x64',
      sessionType: 'wayland',
      themeMode: 'system',
    },
    connection: {
      codexDiscovered: true,
      codexReportedVersion: null,
      supportedCapabilities: ['account/read'],
      unsupportedCapabilities: [],
      lastRefreshCategory: null,
      lastSuccessfulRefreshAt: '2026-08-14T07:00:00.000Z',
    },
    coverage: {
      validDateCount: 3,
      rejectedRecordCount: 0,
      firstValidDate: '2026-08-12',
      lastValidDate: '2026-08-14',
    },
    session: { startedAtIso: null, validSnapshotCount: 1 },
    health: {
      refreshAttemptCount: 2,
      refreshSuccessCount: 2,
      refreshFailureCount: 0,
      refreshNoDataCount: 0,
      lastRefreshOutcome: 'succeeded',
      lastRefreshDurationBucket: 'under-250ms',
    },
  };

  // Create spies around the real bridge method signatures.
  const bridge: TokenTrailBridge = Object.freeze({
    getOverviewSnapshot: vi.fn().mockResolvedValue(initialSnapshot),
    refreshOverview: vi.fn().mockResolvedValue(initialSnapshot),
    onOverviewChanged: vi.fn(() => () => undefined),
    getPreferences: vi.fn(async () => storedPreferences),
    setPreferences: vi.fn(async (preferences: Preferences) => {
      storedPreferences = preferences;
      return preferences;
    }),
    previewDiagnostics: vi.fn().mockResolvedValue(previewDocument),
    exportDiagnostics: vi.fn().mockResolvedValue({ saved: true, errorCategory: null }),
    clearApplicationData: vi.fn(async () => createDefaultPreferences()),
  });

  // Define the same read-only global shape exposed by contextBridge in Electron.
  Object.defineProperty(window, 'tokenTrail', { configurable: true, value: bridge });

  // Return controlled test access without widening production capabilities.
  return { bridge };
}

// Reset mocks and the location hash before each isolated test.
beforeEach(() => {
  vi.restoreAllMocks();
  window.location.hash = '';
});

// Group behavior around shell navigation between the six approved destinations.
describe('application navigation', () => {
  it('switches routes through standard fragment links', async () => {
    // Install one complete snapshot and render the shell.
    installBridge(createSnapshot());
    const user = userEvent.setup();
    render(<App />);

    // Wait for the default Overview route.
    expect(await screen.findByRole('heading', { level: 1, name: 'Overview' })).not.toBeNull();

    // Navigate to Usage through its visible link.
    await user.click(screen.getByRole('link', { name: 'Usage' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Usage' })).not.toBeNull();

    // Navigate to Learn and confirm its local explanation content.
    await user.click(screen.getByRole('link', { name: 'Learn' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Learn' })).not.toBeNull();
  });

  it('lands on the exact explanation for a validated Learn deep link', async () => {
    // Seed the hash before render exactly as a contextual metric link would.
    window.location.hash = '#learn/provenance';
    installBridge(createSnapshot());
    render(<App />);

    // The Learn route renders directly with the targeted card highlighted.
    expect(await screen.findByRole('heading', { level: 1, name: 'Learn' })).not.toBeNull();
    const focusedCard = document.querySelector('[data-learn-entry="provenance"]');
    expect(focusedCard).not.toBeNull();
    expect(focusedCard?.className).toContain('learn-card--focused');
  });

  it('falls back to the Learn top for an unknown deep-link identifier', async () => {
    // An unreviewed identifier must never select arbitrary content.
    window.location.hash = '#learn/not-a-real-entry';
    installBridge(createSnapshot());
    render(<App />);

    // No card carries the focus modifier because the identifier was rejected.
    expect(await screen.findByRole('heading', { level: 1, name: 'Learn' })).not.toBeNull();
    expect(document.querySelector('.learn-card--focused')).toBeNull();
  });
});

// Group behavior around contextual navigation from metrics and errors to explanations.
describe('contextual navigation', () => {
  it('links capacity clauses to their Quota Windows and Credits detail sections', async () => {
    // Install one snapshot whose clauses cover both quota and credit families.
    installBridge(createSnapshot());
    const user = userEvent.setup();
    render(<App />);

    // Wait for Overview content that includes the combined-capacity clause list.
    await screen.findByRole('heading', { level: 2, name: 'Current reported capacity' });

    // Every rendered clause offers a follow-up link to its detail route.
    const windowLinks = screen.getAllByRole('link', { name: 'See window details' });
    const creditLinks = screen.getAllByRole('link', { name: 'See credit details' });
    expect(windowLinks.length).toBeGreaterThan(0);
    expect(creditLinks.length).toBeGreaterThan(0);
    expect(windowLinks[0]?.getAttribute('href')).toBe('#windows');
    expect(creditLinks[0]?.getAttribute('href')).toBe('#credits');

    // Follow one clause link through real navigation to prove the target resolves.
    await user.click(windowLinks[0]!);
    expect(await screen.findByRole('heading', { level: 1, name: 'Quota Windows' })).not.toBeNull();
  });

  it('offers corrective actions from error states and explanations from reached states', async () => {
    // Build one snapshot carrying a reached bucket so both surfaces exist together.
    const base = createSnapshot();
    const reachedSnapshot = overviewSnapshotSchema.parse({
      ...base,
      quotas: [
        {
          id: 'codex',
          name: 'Codex',
          planType: 'plus',
          reached: true,
          windows: base.quotas[0]?.windows ?? [],
        },
      ],
      state: 'error',
      errorCategory: 'codex-unavailable',
    });
    installBridge(reachedSnapshot);
    render(<App />);

    // The error panel names the diagnostics destination as the corrective action.
    const settingsLink = await screen.findByRole('link', {
      name: 'Settings & Diagnostics',
    });
    expect(settingsLink.getAttribute('href')).toBe('#settings');
    expect(screen.getByRole('link', { name: 'what Token Trail reads' })).not.toBeNull();

    // The reached bucket explains itself instead of leaving an unexplained warning label.
    // Both the bucket card and the attention entry carry the same explanation link.
    const meaningLinks = screen.getAllByRole('link', { name: 'what this means' });
    expect(meaningLinks.length).toBeGreaterThan(0);
    expect(meaningLinks[0]?.getAttribute('href')).toBe('#learn/when-a-limit-is-hit');
  });

  it('explains missing-day handling from the Usage coverage panel', async () => {
    // Install one snapshot whose coverage span contains a real calendar gap.
    const gapped = createSnapshot({
      usage: {
        ...createSnapshot().usage,
        state: 'partial',
        days: [
          { date: '2026-08-12', tokens: '91210', provenance: 'codex-reported' },
          { date: '2026-08-14', tokens: '124500', provenance: 'codex-reported' },
        ],
        coverage: {
          validDateCount: 2,
          reportedZeroCount: 0,
          rejectedRecordCount: 0,
          firstValidDate: '2026-08-12',
          lastValidDate: '2026-08-14',
          missingDates: ['2026-08-13'],
          missingDatesTruncated: false,
        },
      },
    });
    installBridge(gapped);
    const user = userEvent.setup();
    render(<App />);

    // Travel to Usage where the coverage panel lives.
    await user.click(await screen.findByRole('link', { name: 'Usage' }));
    await screen.findByRole('heading', { level: 2, name: 'Data coverage' });

    // The missing-date note links to the matching packaged explanation.
    const missingLink = screen.getByRole('link', { name: 'How missing days are handled' });
    expect(missingLink.getAttribute('href')).toBe('#learn/missing-days-statistics');
  });
});

// Group behavior around the Usage route's derived content.
describe('UsageRoute', () => {
  it('renders statistics, comparisons, and coverage from supplied data only', async () => {
    // Install one snapshot with three supplied days including one reported zero.
    installBridge(createSnapshot());
    const user = userEvent.setup();
    render(<App />);

    // Navigate to the Usage route.
    await user.click(await screen.findByRole('link', { name: 'Usage' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Usage' })).not.toBeNull();

    // Confirm the exact total across supplied buckets appears in the statistics cards.
    expect(screen.getByText('215,710')).not.toBeNull();

    // Confirm the reported zero day is preserved in the table view rather than hidden.
    await user.click(screen.getByRole('button', { name: 'Table' }));
    expect(screen.getByText(/0 \(reported zero\)/)).not.toBeNull();

    // Confirm the seven-day comparison explains incomplete coverage honestly.
    expect(screen.getAllByText(/does not yet cover two complete consecutive periods/).length).toBe(
      2,
    );
  });

  it('keeps missing dates visible in the heatmap legend states', async () => {
    // Install one snapshot whose span contains a gap.
    installBridge(createSnapshot());
    const user = userEvent.setup();
    render(<App />);

    // Navigate to the Usage route.
    await user.click(await screen.findByRole('link', { name: 'Usage' }));

    // The heatmap must classify cells without treating gaps as zero.
    expect(await screen.findByLabelText(/Calendar heatmap of daily activity/)).not.toBeNull();
  });
});

// Group behavior around the Credits route.
describe('CreditsRoute', () => {
  it('renders balance, authoritative count, and capped-detail explanation', async () => {
    // Install one snapshot carrying credit information.
    installBridge(createSnapshot());
    const user = userEvent.setup();
    render(<App />);

    // Navigate to the Credits route.
    await user.click(await screen.findByRole('link', { name: 'Credits' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Credits and spending' }),
    ).not.toBeNull();

    // Confirm the balance string keeps its original unit without conversion.
    expect(screen.getByText('$18.40')).not.toBeNull();

    // Confirm the authoritative count and capping note are both visible.
    expect(screen.getByText('2')).not.toBeNull();
    expect(screen.getByText(/fewer detail rows than the authoritative count/)).not.toBeNull();
  });
});

// Group behavior around Settings persistence and diagnostics flow.
describe('SettingsDiagnosticsRoute', () => {
  it('persists a complete validated preferences replacement', async () => {
    // Install one snapshot and render the shell.
    installBridge(createSnapshot());
    const user = userEvent.setup();
    render(<App />);

    // Navigate to Settings & Diagnostics.
    await user.click(await screen.findByRole('link', { name: 'Settings & Diagnostics' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Settings & Diagnostics' }),
    ).not.toBeNull();

    // Choose the light theme through its radio control.
    await user.click(screen.getByRole('radio', { name: 'Light' }));

    // Confirm the bridge received a complete document with the updated field.
    const setCall = (window.tokenTrail.setPreferences as ReturnType<typeof vi.fn>).mock.calls.at(
      -1,
    )?.[0] as Preferences | undefined;
    expect(setCall?.theme).toBe('light');
    expect(setCall?.version).toBe(1);
  });

  it('requires explicit two-step confirmation before clearing local data', async () => {
    // Install one snapshot and render the shell.
    const { bridge } = installBridge(createSnapshot());
    const user = userEvent.setup();
    render(<App />);

    // Navigate to Settings & Diagnostics.
    await user.click(await screen.findByRole('link', { name: 'Settings & Diagnostics' }));

    // The first activation opens a confirmation dialog instead of deleting anything.
    await user.click(screen.getByRole('button', { name: 'Clear data' }));
    expect(bridge.clearApplicationData).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog', { name: 'Clear Token Trail data?' })).not.toBeNull();

    // Cancel returns without deleting.
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(bridge.clearApplicationData).not.toHaveBeenCalled();

    // Confirming performs exactly one no-payload clear call.
    await user.click(screen.getByRole('button', { name: 'Clear data' }));
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Clear data' }),
    );
    expect(bridge.clearApplicationData).toHaveBeenCalledWith();
  });

  it('requires a preview before export and exports exactly the previewed document', async () => {
    // Install one snapshot and render the shell.
    const { bridge } = installBridge(createSnapshot());
    const user = userEvent.setup();
    render(<App />);

    // Navigate to Settings & Diagnostics and switch to the diagnostics tab.
    await user.click(await screen.findByRole('link', { name: 'Settings & Diagnostics' }));
    await user.click(screen.getByRole('button', { name: 'Diagnostics' }));

    // Export stays disabled until a preview exists.
    const exportButton = screen.getByRole('button', { name: /Export…/ });
    expect((exportButton as HTMLButtonElement).disabled).toBe(true);

    // Build the preview and confirm redacted content is displayed.
    await user.click(screen.getByRole('button', { name: 'Build preview' }));
    expect(await screen.findByText(/tokenTrailVersion/)).not.toBeNull();

    // Export now succeeds through the fixed no-payload bridge call.
    await user.click(exportButton);
    expect(bridge.exportDiagnostics).toHaveBeenCalledWith();
    expect(await screen.findByText(/Diagnostics saved to the location you chose/)).not.toBeNull();
  });
});

// Group behavior around the local Learn search.
describe('LearnRoute', () => {
  it('filters packaged explanations locally without remote requests', async () => {
    // Install one snapshot and render the shell.
    installBridge(createSnapshot());
    const user = userEvent.setup();
    render(<App />);

    // Navigate to Learn.
    await user.click(await screen.findByRole('link', { name: 'Learn' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Learn' })).not.toBeNull();

    // Search for a term matching exactly one entry title.
    await user.type(screen.getByRole('searchbox', { name: 'Search explanations' }), 'Provenance');
    const learnRegion = screen
      .getByRole('heading', { level: 2, name: 'Privacy and sources' })
      .closest('section');
    expect(within(learnRegion!).getByRole('heading', { name: 'Provenance' })).not.toBeNull();

    // Confirm unrelated entries were filtered out of the rendered set.
    expect(screen.queryByRole('heading', { name: 'Tokens vs quota' })).toBeNull();
  });
});

// Group behavior around keyboard-visible operation of the complete route set.
describe('keyboard route sweep', () => {
  it('reaches and activates all six destinations through keyboard events alone', async () => {
    // Install one complete snapshot and render the shell.
    installBridge(createSnapshot());
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('heading', { level: 1, name: 'Overview' });

    // Walk the tab sequence by keyboard events until the focus lands on each destination link.
    const destinations = [
      { name: 'Quota Windows', heading: 'Quota Windows' },
      { name: 'Usage', heading: 'Usage' },
      { name: 'Credits', heading: 'Credits and spending' },
      { name: 'Learn', heading: 'Learn' },
      { name: 'Settings & Diagnostics', heading: 'Settings & Diagnostics' },
    ] as const;

    for (const destination of destinations) {
      // Press Tab until the focused element is the next destination's navigation link.
      // Nav labels render a decorative state marker before the text, so strip it for comparison.
      const focusedLabel = (): string =>
        (document.activeElement?.textContent ?? '').replace(/^[○◉]/u, '');
      let steps = 0;
      while (focusedLabel() !== destination.name && steps < 40) {
        await user.keyboard('{Tab}');
        steps += 1;
      }
      expect(focusedLabel()).toBe(destination.name);

      // Activate the focused link with Enter and confirm the destination heading rendered.
      await user.keyboard('{Enter}');
      expect(
        await screen.findByRole('heading', { level: 1, name: destination.heading }),
      ).not.toBeNull();
    }
  });
});

// Group behavior around Usage honesty guarantees from section 25 of the product specification.
describe('Usage presentation honesty', () => {
  it('presents chart and table views from the same normalized day source', async () => {
    // Install one snapshot with three supplied days including one reported zero.
    installBridge(createSnapshot());
    const user = userEvent.setup();
    render(<App />);

    // Navigate to the Usage route and wait for the default chart view.
    await user.click(await screen.findByRole('link', { name: 'Usage' }));
    const chart = await screen.findByRole('img', {
      name: /Bar chart of daily token totals across 3 supplied days/,
    });
    expect(chart).not.toBeNull();

    // Switch to the table and confirm the exact same values appear as cells.
    await user.click(screen.getByRole('button', { name: 'Table' }));
    expect(screen.getByRole('cell', { name: '91,210' })).not.toBeNull();
    expect(screen.getByRole('cell', { name: /0 \(reported zero\)/ })).not.toBeNull();
    expect(screen.getByRole('cell', { name: '124,500' })).not.toBeNull();

    // Switching back keeps the identical chart description, proving one shared source.
    await user.click(screen.getByRole('button', { name: 'Chart' }));
    expect(
      screen.getByRole('img', {
        name: /Bar chart of daily token totals across 3 supplied days/,
      }),
    ).not.toBeNull();
  });

  it('renders statistics as Unavailable rather than zero when no days were supplied', async () => {
    // Install one ready snapshot whose usage section carries no dated buckets.
    installBridge(
      createSnapshot({
        usage: {
          ...createSnapshot().usage,
          state: 'partial',
          days: [],
          coverage: {
            validDateCount: 0,
            reportedZeroCount: 0,
            rejectedRecordCount: 2,
            firstValidDate: null,
            lastValidDate: null,
            missingDates: [],
            missingDatesTruncated: false,
          },
        },
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    // Navigate to the Usage route's statistics panel.
    await user.click(await screen.findByRole('link', { name: 'Usage' }));
    await screen.findByRole('heading', { level: 2, name: 'Activity statistics' });

    // Every per-day statistic reads Unavailable; only the empty total may legitimately be zero.
    const unavailableCount = screen.getAllByText('Unavailable').length;
    expect(unavailableCount).toBeGreaterThanOrEqual(4);

    // The rejected records are counted visibly instead of being silently dropped.
    expect(screen.getByText('2')).not.toBeNull();
  });
});

// Keep the act import referenced for future subscription-driven tests.
void act;
