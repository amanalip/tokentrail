// Import Vitest's describe/it/expect for the schema contract suite.
import { describe, expect, it } from 'vitest';

// Import the validated aggregate-usage schema whose alias behavior this suite pins.
import { accountUsageReadResultSchema, type AccountUsageReadResult } from './protocol-schemas';

/**
 * Aggregate-usage read-result schema contract (plan section 5.4 protocol research).
 *
 * Responsibility: pin the accepted upstream spellings for the approved `account/usage/read`
 * result so a naming drift can never again erase an otherwise valid read. Real Codex 0.149.0
 * responses were observed using `dailyUsageBuckets` with per-bucket `startDate` keys and the
 * summary counter `longestRunningTurnSec`; the originally reviewed contract used
 * `dailyBuckets`, `date`, and `longestTurnSeconds`. Both must validate to one internal shape.
 * Denied behavior: no counter value is coerced or interpreted here; unknown fields strip.
 */

describe('aggregate-usage read-result schema', () => {
  it('accepts the observed upstream spelling and canonicalizes names', () => {
    // Mirror the exact structure captured from a real Codex 0.149.0 app-server response.
    const upstreamShape = {
      summary: {
        lifetimeTokens: 1743486842,
        peakDailyTokens: 231352487,
        longestRunningTurnSec: 4774,
        currentStreakDays: 41,
        longestStreakDays: 41,
      },
      dailyUsageBuckets: [
        { startDate: '2026-01-18', tokens: 4186 },
        { startDate: '2026-06-04', tokens: 11166159 },
      ],
    };

    const parsed = accountUsageReadResultSchema.parse(upstreamShape);

    // Canonical names carry identical values into normalization.
    expect(parsed.summary).toEqual({
      lifetimeTokens: 1743486842,
      peakDailyTokens: 231352487,
      currentStreakDays: 41,
      longestStreakDays: 41,
      longestTurnSeconds: 4774,
    });
    expect(parsed.dailyBuckets).toEqual([
      { date: '2026-01-18', tokens: 4186 },
      { date: '2026-06-04', tokens: 11166159 },
    ]);
  });

  it('keeps accepting the originally reviewed spelling unchanged', () => {
    const reviewedShape = {
      summary: { lifetimeTokens: '4203910', longestTurnSeconds: 2520 },
      dailyBuckets: [{ date: '2026-08-12', tokens: '91210' }],
    };

    const parsed: AccountUsageReadResult = accountUsageReadResultSchema.parse(reviewedShape);

    expect(parsed.summary).toEqual({ lifetimeTokens: '4203910', longestTurnSeconds: 2520 });
    expect(parsed.dailyBuckets).toEqual([{ date: '2026-08-12', tokens: '91210' }]);
  });

  it('preserves absent and null bucket arrays so availability rules hold', () => {
    // Null content stays null exactly as the unavailable-state rule expects.
    expect(accountUsageReadResultSchema.parse({ summary: null, dailyBuckets: null })).toEqual({
      summary: null,
      dailyBuckets: null,
    });

    // A missing array key under both spellings canonicalizes to null so an omitted array
    // produces the honest unavailable section instead of failing the whole read.
    expect(accountUsageReadResultSchema.parse({ summary: { lifetimeTokens: 1 } })).toMatchObject({
      summary: { lifetimeTokens: 1 },
      dailyBuckets: null,
    });
  });

  it('degrades malformed bucket records into counted rejections instead of a failed read', () => {
    // One non-object record among valid ones must not erase its neighbors: it canonicalizes
    // to an empty bucket that normalization counts as rejected.
    const parsed = accountUsageReadResultSchema.parse({
      summary: { lifetimeTokens: 10 },
      dailyUsageBuckets: [{ startDate: '2026-08-12', tokens: 1 }, 'not-a-bucket', 42],
    });

    expect(parsed.dailyBuckets).toHaveLength(3);
    expect(parsed.dailyBuckets?.[0]).toEqual({ date: '2026-08-12', tokens: 1 });
    expect(parsed.dailyBuckets?.[1]).toEqual({ date: undefined, tokens: undefined });
    expect(parsed.dailyBuckets?.[2]).toEqual({ date: undefined, tokens: undefined });
  });

  it('still fails closed on structurally impossible results', () => {
    // A string result was never valid under either spelling.
    expect(() => accountUsageReadResultSchema.parse('unrelated')).toThrow();
  });
});
