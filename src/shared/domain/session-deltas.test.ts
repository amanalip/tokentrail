// Import Vitest assertions and grouping helpers.
import { describe, expect, it } from 'vitest';

// Import the delta derivation under test.
import { deriveSessionDeltas } from './session-deltas';

// Import runtime validation so fixtures pass through the real public boundary.
import {
  createLoadingOverviewSnapshot,
  overviewSnapshotSchema,
  type OverviewSnapshot,
} from '../contracts/overview-snapshot';
import { createNumericMetric } from '../contracts/metric';

// Construct one valid snapshot with configurable quota windows and lifetime tokens.
function snapshot(
  windows: readonly {
    readonly bucketId: string;
    readonly kind: 'primary' | 'secondary';
    readonly usedPercent: number | null;
    readonly resetsAt: number | null;
  }[],
  lifetimeTokens: string | null,
): OverviewSnapshot {
  // Group window fixtures by bucket identity for compact fixture authoring.
  const grouped = new Map<
    string,
    { name: string; windows: OverviewSnapshot['quotas'][number]['windows'] }
  >();
  for (const entry of windows) {
    const existing = grouped.get(entry.bucketId) ?? {
      name: entry.bucketId.toUpperCase(),
      windows: [],
    };
    existing.windows = [
      ...existing.windows,
      {
        kind: entry.kind,
        usedPercent: createNumericMetric(
          entry.usedPercent,
          'codex-reported',
          'used-percentage-reported',
        ),
        remainingPercent: createNumericMetric(
          entry.usedPercent === null ? null : 100 - entry.usedPercent,
          'calculated',
          'remaining-is-one-hundred-minus-used',
        ),
        durationMinutes: createNumericMetric(300, 'codex-reported', 'duration-reported-in-minutes'),
        resetsAt: createNumericMetric(
          entry.resetsAt,
          entry.resetsAt === null ? 'unavailable' : 'codex-reported',
          entry.resetsAt === null ? 'reset-time-unavailable' : 'reset-time-reported',
        ),
      },
    ];
    grouped.set(entry.bucketId, existing);
  }

  // Parse through the boundary schema so every fixture satisfies renderer invariants.
  return overviewSnapshotSchema.parse({
    ...createLoadingOverviewSnapshot('2026-08-14T07:00:00.000Z'),
    state: 'ready',
    accountKind: 'chatgpt',
    planType: 'plus',
    quotas: [...grouped.entries()].map(([id, value]) => ({
      id,
      name: value.name,
      planType: 'plus',
      reached: false,
      windows: value.windows,
    })),
    usage: {
      ...createLoadingOverviewSnapshot('2026-08-14T07:00:00.000Z').usage,
      summary: {
        ...createLoadingOverviewSnapshot('2026-08-14T07:00:00.000Z').usage.summary,
        lifetimeTokens,
      },
    },
    lastSuccessfulRefreshAt: '2026-08-14T07:00:00.000Z',
    refreshAttemptedAt: '2026-08-14T07:00:00.000Z',
    errorCategory: null,
  });
}

// Group behavior around quota percentage-point deltas.
describe('deriveSessionDeltas', () => {
  it('expresses quota movement in percentage points between matching identities', () => {
    const baseline = snapshot(
      [{ bucketId: 'codex', kind: 'primary', usedPercent: 28, resetsAt: 1_800_000_000 }],
      null,
    );
    const current = snapshot(
      [{ bucketId: 'codex', kind: 'primary', usedPercent: 32, resetsAt: 1_800_000_000 }],
      null,
    );
    const derived = deriveSessionDeltas(baseline, current);

    expect(derived.quotaDeltas).toHaveLength(1);
    expect(derived.quotaDeltas[0]).toMatchObject({
      metricKind: 'quota-window-used-percent',
      bucketId: 'codex',
      baselinePercent: 28,
      currentPercent: 32,
      changePercentagePoints: '4',
    });
    expect(derived.resetTransitions).toHaveLength(0);
  });

  it('suppresses cross-reset percentage deltas and reports a reset transition instead', () => {
    const baseline = snapshot(
      [{ bucketId: 'codex', kind: 'primary', usedPercent: 90, resetsAt: 1_800_000_000 }],
      null,
    );
    const current = snapshot(
      [{ bucketId: 'codex', kind: 'primary', usedPercent: 5, resetsAt: 1_800_600_000 }],
      null,
    );
    const derived = deriveSessionDeltas(baseline, current);

    // A decrease after a reset must never appear as negative usage.
    expect(derived.quotaDeltas).toHaveLength(0);
    expect(derived.resetTransitions).toHaveLength(1);
    expect(derived.resetTransitions[0]).toMatchObject({
      metricKind: 'quota-window-reset-transition',
      previousResetsAtSeconds: 1_800_000_000,
      currentResetsAtSeconds: 1_800_600_000,
    });
  });

  it('reports counter decreases as source changes rather than negative usage', () => {
    const baseline = snapshot([], '4201400');
    const decreased = snapshot([], '4201000');
    const increased = snapshot([], '4203910');

    // An increase is presented exactly through bigint subtraction.
    const increasedDelta = deriveSessionDeltas(baseline, increased).counterDeltas[0];
    expect(increasedDelta?.increaseTokens).toBe('2510');
    expect(increasedDelta?.sourceValueChanged).toBe(false);

    // A decrease is surfaced as an uninterpreted source change without a negative delta.
    const decreasedDelta = deriveSessionDeltas(baseline, decreased).counterDeltas[0];
    expect(decreasedDelta?.increaseTokens).toBeNull();
    expect(decreasedDelta?.sourceValueChanged).toBe(true);
  });

  it('compares counters beyond the safe JavaScript integer range exactly', () => {
    const baselineValue = '12345678901234567890';
    const currentValue = '12345678901234567900';
    const derived = deriveSessionDeltas(snapshot([], baselineValue), snapshot([], currentValue));
    expect(derived.counterDeltas[0]?.increaseTokens).toBe('10');
  });

  it('stops comparing buckets that disappear from the current snapshot', () => {
    const baseline = snapshot(
      [
        { bucketId: 'codex', kind: 'primary', usedPercent: 10, resetsAt: 1_800_000_000 },
        { bucketId: 'review', kind: 'primary', usedPercent: 20, resetsAt: 1_800_000_000 },
      ],
      null,
    );
    const current = snapshot(
      [{ bucketId: 'codex', kind: 'primary', usedPercent: 15, resetsAt: 1_800_000_000 }],
      null,
    );
    const derived = deriveSessionDeltas(baseline, current);
    expect(derived.quotaDeltas).toHaveLength(1);
    expect(derived.quotaDeltas[0]?.bucketId).toBe('codex');
  });
});
