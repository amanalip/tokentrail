// Import Vitest assertions and grouping helpers.
import { describe, expect, it } from 'vitest';

// Import runtime protocol schemas so tests model the actual privileged boundary.
import { accountUsageReadResultSchema, rateLimitsReadResultSchema } from './protocol-schemas';

// Import the normalization functions under test.
import { normalizeCreditsData, normalizeUsageData } from './normalize-usage';

// Group behavior around aggregate-usage normalization.
describe('normalizeUsageData', () => {
  it('returns the unavailable section for null results without fabricating data', () => {
    const { usage } = normalizeUsageData(null);
    expect(usage.state).toBe('unavailable');
    expect(usage.days).toEqual([]);
    expect(usage.summary.lifetimeTokens).toBeNull();
  });

  it('accepts canonical decimal strings and safe integers while rejecting invalid records', () => {
    // Parse a response mixing valid buckets with duplicate, malformed, and negative records.
    const result = accountUsageReadResultSchema.parse({
      summary: { lifetimeTokens: '4203910', currentStreakDays: 8 },
      dailyBuckets: [
        { date: '2026-08-12', tokens: '91210' },
        { date: '2026-08-13', tokens: 124_500 },
        { date: '2026-08-13', tokens: '999' },
        { date: '2026-13-40', tokens: '10' },
        { date: '2026-08-14', tokens: '-5' },
        { date: '2026-08-15', tokens: '1.5' },
      ],
    });

    const { usage, rejectedRecordCount } = normalizeUsageData(result);

    // Exactly four records were rejected: duplicate, impossible date, negative, fractional.
    expect(rejectedRecordCount).toBe(4);
    expect(usage.days.map((day) => day.date)).toEqual(['2026-08-12', '2026-08-13']);
    expect(usage.days[1]?.tokens).toBe('124500');
    expect(usage.coverage.rejectedRecordCount).toBe(4);
    expect(usage.state).toBe('partial');
  });

  it('preserves reported zero days as distinct from missing dates', () => {
    const result = accountUsageReadResultSchema.parse({
      summary: null,
      dailyBuckets: [
        { date: '2026-08-12', tokens: '0' },
        { date: '2026-08-14', tokens: '50' },
      ],
    });
    const { usage } = normalizeUsageData(result);

    // August 13 is missing; August 12 is a supplied zero. Both stay distinguishable.
    expect(usage.coverage.reportedZeroCount).toBe(1);
    expect(usage.coverage.missingDates).toEqual(['2026-08-13']);
  });

  it('keeps huge counters exact as strings beyond safe integer range', () => {
    const huge = '123456789012345678901234567890';
    const result = accountUsageReadResultSchema.parse({
      summary: { lifetimeTokens: huge },
      dailyBuckets: [{ date: '2026-08-13', tokens: huge }],
    });
    const { usage } = normalizeUsageData(result);
    expect(usage.summary.lifetimeTokens).toBe(huge);
    expect(usage.days[0]?.tokens).toBe(huge);
  });

  it('marks the section ready when every record is valid', () => {
    const result = accountUsageReadResultSchema.parse({
      summary: { lifetimeTokens: '100' },
      dailyBuckets: [
        { date: '2026-08-12', tokens: '40' },
        { date: '2026-08-13', tokens: '60' },
      ],
    });
    const { usage, rejectedRecordCount } = normalizeUsageData(result);
    expect(rejectedRecordCount).toBe(0);
    expect(usage.state).toBe('ready');
  });
});

// Group behavior around credits normalization.
describe('normalizeCreditsData', () => {
  // Build one rate-limits response carrying credit-shaped fields.
  function rateLimitsWith(fields: Record<string, unknown>) {
    return rateLimitsReadResultSchema.parse({
      rateLimits: {
        limitId: 'codex',
        limitName: 'Codex',
        primary: { usedPercent: 37, windowDurationMins: 300, resetsAt: 1_800_000_000 },
        secondary: null,
        planType: 'plus',
        rateLimitReachedType: null,
        ...fields,
      },
      rateLimitsByLimitId: null,
    });
  }

  it('returns the unavailable section when no credit information exists', () => {
    const credits = normalizeCreditsData(rateLimitsWith({}), 1_000_000);
    expect(credits.state).toBe('unavailable');
    expect(credits.balanceAmount).toBeNull();
    expect(credits.balanceUnlimited).toBe(false);
  });

  it('normalizes balance strings and unlimited markers as distinct states', () => {
    const balanced = normalizeCreditsData(rateLimitsWith({ credits: '$18.40' }), 1_000_000);
    expect(balanced.balanceAmount).toBe('$18.40');
    expect(balanced.balanceUnlimited).toBe(false);
    expect(balanced.state).toBe('ready');

    const unlimited = normalizeCreditsData(
      rateLimitsWith({ credits: { unlimited: true } }),
      1_000_000,
    );
    expect(unlimited.balanceUnlimited).toBe(true);
    expect(unlimited.balanceAmount).toBeNull();
  });

  it('normalizes spending controls with per-field availability', () => {
    const credits = normalizeCreditsData(
      rateLimitsWith({
        individualLimit: {
          limitAmount: '$25.00',
          usedAmount: '$7.00',
          remainingPercent: 72,
          reached: false,
          resetsAt: 1_800_600_000,
        },
      }),
      1_000_000,
    );
    expect(credits.spendingControl).toMatchObject({
      limitAmount: '$25.00',
      usedAmount: '$7.00',
      reached: false,
      resetsAtSeconds: 1_800_600_000,
    });
    expect(credits.spendingControl?.remainingPercent.value).toBe(72);
  });

  it('merges the explicit spend-control reached flag into the structured control', () => {
    const credits = normalizeCreditsData(
      rateLimitsWith({
        individualLimit: { remainingPercent: 0 },
        spendControlReached: true,
      }),
      1_000_000,
    );
    expect(credits.spendingControl?.reached).toBe(true);
  });

  it('retains the authoritative availableCount when detail rows are absent or capped', () => {
    const absentRows = normalizeCreditsData(
      rateLimitsWith({ rateLimitResetCredits: undefined }),
      1_000_000,
    );

    // Build a capped reset-credit container through the real schema boundary.
    const capped = normalizeCreditsData(
      rateLimitsReadResultSchema.parse({
        rateLimits: {
          limitId: 'codex',
          limitName: 'Codex',
          primary: { usedPercent: 37, windowDurationMins: 300, resetsAt: 1_800_000_000 },
          secondary: null,
          planType: 'plus',
          rateLimitReachedType: null,
        },
        rateLimitsByLimitId: null,
        rateLimitResetCredits: {
          availableCount: 2,
          details: [
            {
              title: 'Extended session reset',
              description: 'Backend-provided text',
              expiresAt: 1_000_500,
            },
          ],
        },
      }),
      1_000_000,
    );

    expect(absentRows.resetCreditsAvailableCount).toBeNull();
    expect(capped.resetCreditsAvailableCount).toBe(2);
    expect(capped.resetCreditDetails).toHaveLength(1);
    expect(capped.resetCreditDetailsCapped).toBe(true);
  });

  it('classifies expired detail rows relative to the controller clock', () => {
    const credits = normalizeCreditsData(
      rateLimitsReadResultSchema.parse({
        rateLimits: {
          limitId: 'codex',
          limitName: 'Codex',
          primary: { usedPercent: 37, windowDurationMins: 300, resetsAt: 1_800_000_000 },
          secondary: null,
          planType: 'plus',
          rateLimitReachedType: null,
        },
        rateLimitsByLimitId: null,
        rateLimitResetCredits: {
          availableCount: 2,
          details: [
            { title: 'Old', description: 'Already passed', expiresAt: 999_000 },
            { title: 'Current', description: 'Still valid', expiresAt: 1_001_000 },
          ],
        },
      }),
      1_000_000,
    );
    expect(credits.resetCreditDetails.map((row) => row.state)).toEqual(['expired', 'available']);
  });
});
