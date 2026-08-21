// Import Vitest assertions and grouping helpers.
import { describe, expect, it } from 'vitest';

// Import the clause builder under test.
import { buildCombinedCapacityClauses } from './combined-capacity';

// Import runtime validation so fixtures pass through the real public boundary.
import {
  createLoadingOverviewSnapshot,
  overviewSnapshotSchema,
  type OverviewSnapshot,
} from '../contracts/overview-snapshot';
import { createUnavailableCreditsSection, creditsSectionSchema } from '../contracts/credits-data';
import { createNumericMetric } from '../contracts/metric';

// Construct one snapshot with configurable reached state and credits section.
function snapshotWith(
  overrides: {
    readonly reached?: boolean;
    readonly quotaCount?: number;
    readonly credits?: ReturnType<typeof creditsSectionSchema.parse>;
  } = {},
): OverviewSnapshot {
  // Build the requested number of deterministic quota buckets.
  const quotas = Array.from({ length: overrides.quotaCount ?? 1 }, (_, index) => ({
    id: `bucket-${index}`,
    name: `Bucket ${index}`,
    planType: 'plus',
    reached: overrides.reached ?? false,
    windows: [
      {
        kind: 'primary' as const,
        usedPercent: createNumericMetric(37, 'codex-reported', 'used-percentage-reported'),
        remainingPercent: createNumericMetric(
          63,
          'calculated',
          'remaining-is-one-hundred-minus-used',
        ),
        durationMinutes: createNumericMetric(300, 'codex-reported', 'duration-reported-in-minutes'),
        resetsAt: createNumericMetric(1_800_000_000, 'codex-reported', 'reset-time-reported'),
      },
    ],
  }));

  // Parse through the boundary schema so fixtures satisfy renderer invariants.
  return overviewSnapshotSchema.parse({
    ...createLoadingOverviewSnapshot('2026-08-14T07:00:00.000Z'),
    state: 'ready',
    accountKind: 'chatgpt',
    planType: 'plus',
    quotas,
    credits: overrides.credits ?? createUnavailableCreditsSection(),
    lastSuccessfulRefreshAt: '2026-08-14T07:00:00.000Z',
    refreshAttemptedAt: '2026-08-14T07:00:00.000Z',
    errorCategory: null,
  });
}

// Use one fixed current time so expiry classification is deterministic.
const NOW = 1_000_000;

// Group behavior around fixed factual clause selection.
describe('buildCombinedCapacityClauses', () => {
  it('reports an explicit reached limit without assigning it to one window', () => {
    const clauses = buildCombinedCapacityClauses(snapshotWith({ reached: true }), NOW);
    expect(clauses[0]?.clauseKey).toBe('reached-limit-reported');
  });

  it('reports no reached limit when none was reported', () => {
    const clauses = buildCombinedCapacityClauses(snapshotWith(), NOW);
    expect(clauses[0]?.clauseKey).toBe('no-reached-limit-reported');
  });

  it('keeps credit balance in its original unit without conversion or scoring', () => {
    const credits = creditsSectionSchema.parse({
      ...createUnavailableCreditsSection(),
      state: 'ready',
      balanceAmount: '$18.40',
    });
    const clauses = buildCombinedCapacityClauses(snapshotWith({ credits }), NOW);
    expect(clauses).toContainEqual({
      clauseKey: 'credit-balance-reported',
      values: { amount: '$18.40' },
    });
  });

  it('distinguishes unlimited balance from unavailable information', () => {
    const unlimited = creditsSectionSchema.parse({
      ...createUnavailableCreditsSection(),
      state: 'ready',
      balanceUnlimited: true,
    });
    const clauses = buildCombinedCapacityClauses(snapshotWith({ credits: unlimited }), NOW);
    expect(clauses.map((clause) => clause.clauseKey)).toContain('credit-unlimited-reported');

    // Unavailable sections produce the explicit no-information clause instead.
    const absent = buildCombinedCapacityClauses(snapshotWith(), NOW);
    expect(absent.map((clause) => clause.clauseKey)).toContain('no-credit-information');
  });

  it('surfaces reset-credit counts and at most one seven-day expiry notice', () => {
    const credits = creditsSectionSchema.parse({
      ...createUnavailableCreditsSection(),
      state: 'ready',
      resetCreditsAvailableCount: 2,
      resetCreditDetails: [
        {
          title: 'Expiring',
          description: 'Expires soon',
          expiresAtSeconds: NOW + 100,
          state: 'available',
        },
      ],
      resetCreditDetailsCapped: true,
    });
    const clauses = buildCombinedCapacityClauses(snapshotWith({ credits }), NOW);
    expect(clauses).toContainEqual({
      clauseKey: 'reset-credits-available',
      values: { count: '2' },
    });
    expect(
      clauses.filter((clause) => clause.clauseKey === 'reset-credit-expires-within-seven-days'),
    ).toHaveLength(1);
  });

  it('produces no synthetic conclusion when every independent metric is unavailable', () => {
    // No quota data plus fully unavailable credits yields only explicit unavailability clauses.
    const clauses = buildCombinedCapacityClauses(snapshotWith({ quotaCount: 0 }), NOW);
    expect(clauses.map((clause) => clause.clauseKey)).toEqual([
      'no-quota-data',
      'no-credit-information',
      'no-credit-information',
      'no-reset-credit-information',
    ]);

    // No clause may claim sufficiency, estimate capacity, or produce a score.
    const serialized = JSON.stringify(clauses);
    expect(serialized).not.toContain('enough');
    expect(serialized).not.toContain('score');
  });
});
