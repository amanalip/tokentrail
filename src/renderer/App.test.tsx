// Import renderer testing helpers that query through user-visible semantics.
import { act, render, screen, within } from '@testing-library/react';

// Import user interaction helpers for the refresh contract.
import userEvent from '@testing-library/user-event';

// Import Vitest lifecycle, mock, and assertion helpers.
import { beforeEach, expect, it, vi } from 'vitest';

// Import runtime validation and the public snapshot type for safe fixtures.
import {
  createLoadingOverviewSnapshot,
  overviewSnapshotSchema,
  type OverviewSnapshot,
} from '../shared/contracts/overview-snapshot';

// Import reviewed preference defaults for bridge stubbing.
import { createDefaultPreferences, type Preferences } from '../shared/contracts/preferences';

// Import the narrow bridge type so tests cannot add generic IPC behavior.
import type { TokenTrailBridge } from '../shared/contracts/token-trail-bridge';

// Import the Phase 2 Overview component under test.
import { App } from './App';

// Construct one complete normalized fixture through the real public boundary schema.
function createSnapshot(overrides: Partial<OverviewSnapshot> = {}): OverviewSnapshot {
  // Start from the honest loading factory so new Phase 3 sections always exist with valid defaults.
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
            usedPercent: {
              value: 37,
              provenance: 'codex-reported',
              explanation: 'used-percentage-reported',
            },
            remainingPercent: {
              value: 63,
              provenance: 'calculated',
              explanation: 'remaining-is-one-hundred-minus-used',
            },
            durationMinutes: {
              value: 300,
              provenance: 'codex-reported',
              explanation: 'duration-reported-in-minutes',
            },
            resetsAt: {
              value: 1_800_000_000,
              provenance: 'codex-reported',
              explanation: 'reset-time-reported',
            },
          },
        ],
      },
    ],
    lastSuccessfulRefreshAt: '2026-08-14T07:00:00.000Z',
    refreshAttemptedAt: '2026-08-14T07:00:00.000Z',
    errorCategory: null,
    ...overrides,
  });
}

// Install one frozen purpose-specific bridge before each renderer test.
function installBridge(initialSnapshot: OverviewSnapshot, refreshSnapshot = initialSnapshot) {
  // Retain the subscription callback so tests can model one main-process update.
  let listener: ((snapshot: OverviewSnapshot) => void) | null = null;

  // Create spies around the real bridge method signatures.
  const bridge: TokenTrailBridge = Object.freeze({
    getOverviewSnapshot: vi.fn().mockResolvedValue(initialSnapshot),
    refreshOverview: vi.fn().mockResolvedValue(refreshSnapshot),
    onOverviewChanged: vi.fn((nextListener) => {
      listener = nextListener;
      return () => {
        listener = null;
      };
    }),
    getPreferences: vi.fn().mockResolvedValue(createDefaultPreferences()),
    setPreferences: vi.fn(async (preferences: Preferences) => preferences),
    previewDiagnostics: vi.fn(),
    exportDiagnostics: vi.fn().mockResolvedValue({ saved: false, errorCategory: null }),
    clearApplicationData: vi.fn().mockResolvedValue(createDefaultPreferences()),
  });

  // Define the same read-only global shape exposed by contextBridge in Electron.
  Object.defineProperty(window, 'tokenTrail', { configurable: true, value: bridge });

  // Return controlled test access without widening production capabilities.
  return { bridge, emit: (snapshot: OverviewSnapshot) => listener?.(snapshot) };
}

// Reset mocks before installing each isolated bridge.
beforeEach(() => vi.restoreAllMocks());

// Confirm the normal Overview preserves naming, values, provenance, and all-bucket visibility.
it('renders the complete read-only Overview with Token Trail naming', async () => {
  // Install one complete normalized snapshot.
  installBridge(createSnapshot());

  // Render the component into jsdom.
  render(<App />);

  // Wait for the asynchronous initial snapshot read.
  expect(await screen.findByRole('heading', { level: 1, name: 'Overview' })).not.toBeNull();

  // Confirm product identity uses the spaced visible name.
  expect(screen.getByRole('link', { name: 'Token Trail Overview' })).not.toBeNull();

  // Confirm the primary quota and calculated complement are visible.
  expect(screen.getAllByText('63%').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Calculated by Token Trail')).toHaveLength(2);

  // Confirm the complete bucket section does not hide the source bucket.
  const allBuckets = screen
    .getByRole('heading', { level: 2, name: 'All reported quota buckets' })
    .closest('section');
  expect(allBuckets).not.toBeNull();
  expect(within(allBuckets!).getByRole('heading', { level: 3, name: 'Codex' })).not.toBeNull();
});

// Confirm partial and stale states preserve valid values and explain their limitation.
it('renders partial and stale data without replacing missing values with zero', async () => {
  // Start with a partial snapshot containing one unavailable duration.
  const partialSnapshot = createSnapshot({
    state: 'partial',
    quotas: [
      {
        ...createSnapshot().quotas[0]!,
        windows: [
          {
            ...createSnapshot().quotas[0]!.windows[0]!,
            durationMinutes: {
              value: null,
              provenance: 'unavailable',
              explanation: 'duration-unavailable',
            },
          },
        ],
      },
    ],
  });
  const staleSnapshot = createSnapshot({ state: 'stale', errorCategory: 'request-timeout' });
  const { emit } = installBridge(partialSnapshot);
  render(<App />);

  // Confirm missing duration remains explicit and valid quota remains visible.
  expect(await screen.findByText(/Some Codex fields were unavailable/)).not.toBeNull();
  expect(screen.getAllByText(/Duration unavailable/).length).toBeGreaterThan(0);
  expect(screen.queryByText('0 minutes')).toBeNull();

  // Deliver one validated stale update through the subscription.
  act(() => emit(staleSnapshot));
  expect(screen.getByRole('alert')).not.toBeNull();
  expect(screen.getByText(/latest refresh failed/i)).not.toBeNull();
  expect(screen.getAllByText('63%').length).toBeGreaterThan(0);
});

// Confirm signed-out and incompatible states use local guidance without credentials or raw errors.
it('renders distinct signed-out and unsupported states', async () => {
  // Render the explicit signed-out state first.
  const { emit } = installBridge(
    createSnapshot({ state: 'signed-out', accountKind: null, planType: null, quotas: [] }),
  );
  render(<App />);
  expect(await screen.findByRole('heading', { name: 'Codex is not signed in' })).not.toBeNull();
  expect(screen.getByText(/never handles your credentials/i)).not.toBeNull();

  // Replace it with an incompatible state through the safe subscription.
  act(() =>
    emit(
      createSnapshot({
        state: 'unsupported',
        accountKind: null,
        planType: null,
        quotas: [],
        lastSuccessfulRefreshAt: null,
        errorCategory: 'codex-incompatible',
      }),
    ),
  );
  expect(
    screen.getByRole('heading', { name: 'Codex compatibility needs attention' }),
  ).not.toBeNull();
  expect(screen.getByText(/does not support the required read-only data/i)).not.toBeNull();
});

// Confirm refresh is purpose-specific and immediately updates its visible button state.
it('requests a bounded refresh through the named bridge method', async () => {
  // Return a partial snapshot from the explicit refresh call.
  const initialSnapshot = createSnapshot();
  const refreshedSnapshot = createSnapshot({ state: 'partial' });
  const { bridge } = installBridge(initialSnapshot, refreshedSnapshot);
  const user = userEvent.setup();
  render(<App />);

  // Activate the user-visible refresh control.
  const refreshButton = await screen.findByRole('button', { name: /Refresh/i });
  await user.click(refreshButton);

  // Confirm no payload or generic channel is supplied.
  expect(bridge.refreshOverview).toHaveBeenCalledWith();
  expect(await screen.findByText(/Some Codex fields were unavailable/)).not.toBeNull();
});

// Confirm markup-shaped protocol text remains inert escaped text.
it('renders protocol-derived labels as text rather than markup', async () => {
  // Use a hostile-looking string in the already normalized bucket name.
  const hostileName = '<img src=x onerror=alert(1)>';
  const baseSnapshot = createSnapshot();
  installBridge(createSnapshot({ quotas: [{ ...baseSnapshot.quotas[0]!, name: hostileName }] }));
  render(<App />);

  // Confirm the literal text is visible and no injected image element exists.
  expect((await screen.findAllByText(hostileName)).length).toBeGreaterThan(0);
  expect(document.querySelectorAll('img')).toHaveLength(1);
});
