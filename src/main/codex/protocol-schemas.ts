// Import Zod to validate unknown app-server payloads before normalization.
import { z } from 'zod';

// Reuse conservative string bounds from the centralized protocol policy.
import { CODEX_PROTOCOL_LIMITS } from './protocol-limits';

// Bound every retained protocol string more tightly than the generic transport ceiling.
const metadataStringSchema = z
  .string()
  .max(Math.min(512, CODEX_PROTOCOL_LIMITS.maximumStringCharacters));

// Validate only non-identifying initialization fields needed to establish compatibility.
export const initializationResultSchema = z
  .object({
    // Retain the server user agent only inside the privileged adapter for compatibility evidence.
    userAgent: metadataStringSchema,
    // Confirm the server describes its target family without retaining filesystem paths.
    platformFamily: metadataStringSchema,
    // Confirm the target operating system is bounded metadata.
    platformOs: metadataStringSchema,
  })
  .strip();

// Validate the three known account variants while intentionally dropping email and credential-related fields.
const accountSchema = z.discriminatedUnion('type', [
  // API-key mode carries no renderer-safe identifying field.
  z.object({ type: z.literal('apiKey') }).strip(),
  // ChatGPT mode retains only the bounded plan label and strips email.
  z.object({ type: z.literal('chatgpt'), planType: metadataStringSchema }).strip(),
  // Bedrock mode is represented only as an account kind.
  z.object({ type: z.literal('amazonBedrock') }).strip(),
]);

// Validate the complete account-read envelope needed to distinguish signed-in and signed-out states.
export const accountReadResultSchema = z
  .object({
    // Preserve an explicit null as the signed-out account state.
    account: accountSchema.nullable(),
    // Keep the server's explicit authentication requirement as a state signal.
    requiresOpenaiAuth: z.boolean(),
  })
  .strip();

// Validate a quota window container while leaving individual fields for availability-aware normalization.
export const rateLimitWindowInputSchema = z
  .object({
    // Require the current protocol keys but accept their values as unknown until field-level checks run.
    usedPercent: z.unknown(),
    windowDurationMins: z.unknown(),
    resetsAt: z.unknown(),
  })
  .strip();

// Validate a quota snapshot container and strip all fields not approved for the Phase 2 slice.
export const rateLimitSnapshotInputSchema = z
  .object({
    // Retain bounded optional identity metadata for stable grouping and display.
    limitId: metadataStringSchema.nullable(),
    limitName: metadataStringSchema.nullable(),
    // Preserve nullable supported windows for field-aware normalization.
    primary: rateLimitWindowInputSchema.nullable(),
    secondary: rateLimitWindowInputSchema.nullable(),
    // Keep the plan label bounded without treating future enum values as known.
    planType: metadataStringSchema.nullable(),
    // Preserve only presence of an explicit reached category; raw enum text never reaches the renderer.
    rateLimitReachedType: metadataStringSchema.nullable(),
    // Phase 3: retain credit and spending-control fields as unknown for availability-aware normalization.
    credits: z.unknown().optional(),
    individualLimit: z.unknown().optional(),
    spendControlReached: z.unknown().optional(),
  })
  .strip();

// Validate a quota snapshot container and strip all fields not approved for the Phase 2 slice.
export const rateLimitsReadResultSchema = z
  .object({
    // Accept null for compatibility with older or partial servers and fixtures.
    rateLimits: rateLimitSnapshotInputSchema.nullable(),
    // Validate each keyed snapshot while stripping unrelated raw fields.
    rateLimitsByLimitId: z.record(metadataStringSchema, rateLimitSnapshotInputSchema).nullable(),
    // Phase 3: retain reset-credit structure as unknown for availability-aware normalization.
    rateLimitResetCredits: z.unknown().optional(),
    // Accept the older observed fixture spelling only as ignored compatibility input.
    resetCredits: z.unknown().optional(),
  })
  .strip();

// Validate one dated aggregate-usage bucket while leaving field semantics to normalization.
export const usageDailyBucketInputSchema = z
  .object({
    // Accept the calendar key and counter as unknown so invalid records are counted, not coerced.
    date: z.unknown(),
    tokens: z.unknown(),
  })
  .strip();

/**
 * Canonicalize one raw daily-usage bucket from either observed upstream spelling.
 *
 * Codex installations have been observed emitting the calendar key under either `startDate`
 * or `date`; mapping onto the reviewed `date` key here keeps downstream validation and
 * rejection counting independent of upstream naming. A record that is not a plain object
 * canonicalizes to an empty bucket so normalization counts exactly one rejected record
 * instead of failing the entire approved read over one malformed neighbor.
 */
function canonicalizeUsageBucket(value: unknown): unknown {
  // Non-object containers become empty buckets; normalization rejects them by its own rules.
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { date: undefined, tokens: undefined };
  }

  const raw = value as Record<string, unknown>;
  return {
    date: 'startDate' in raw ? raw['startDate'] : raw['date'],
    tokens: raw['tokens'],
  };
}

/**
 * Canonicalize the aggregate-usage read result from either observed upstream spelling.
 *
 * Real Codex 0.149.0 responses name the bucket array `dailyUsageBuckets` with per-bucket
 * `startDate` keys and the longest-turn counter `longestRunningTurnSec`, while the originally
 * reviewed contract named them `dailyBuckets`, `date`, and `longestTurnSeconds`. Both spellings
 * map onto one reviewed internal shape before structural validation so a naming drift can
 * never again erase an otherwise valid approved read.
 */
function canonicalizeUsageReadResult(value: unknown): unknown {
  // Non-object results fail structural validation below exactly as before.
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return value;
  }

  const raw = value as Record<string, unknown>;

  // Accept the bucket array under either name. Absence under both spellings canonicalizes to
  // null — the same honest "no content" signal the reviewed contract used for an explicit
  // null — so a server that omits the array produces an unavailable section instead of a
  // failed read.
  const hasBuckets = Object.prototype.hasOwnProperty.call(raw, 'dailyUsageBuckets')
    ? true
    : Object.prototype.hasOwnProperty.call(raw, 'dailyBuckets');
  const rawBuckets = hasBuckets
    ? Object.prototype.hasOwnProperty.call(raw, 'dailyUsageBuckets')
      ? raw['dailyUsageBuckets']
      : raw['dailyBuckets']
    : null;

  // Canonicalize the summary aliases while leaving every counter value untouched.
  let summary = raw['summary'];
  if (typeof summary === 'object' && summary !== null && !Array.isArray(summary)) {
    const rawSummary = summary as Record<string, unknown>;
    summary = {
      lifetimeTokens: rawSummary['lifetimeTokens'],
      peakDailyTokens: rawSummary['peakDailyTokens'],
      currentStreakDays: rawSummary['currentStreakDays'],
      longestStreakDays: rawSummary['longestStreakDays'],
      longestTurnSeconds: Object.prototype.hasOwnProperty.call(rawSummary, 'longestTurnSeconds')
        ? rawSummary['longestTurnSeconds']
        : rawSummary['longestRunningTurnSec'],
    };
  }

  return {
    summary,
    dailyBuckets: Array.isArray(rawBuckets) ? rawBuckets.map(canonicalizeUsageBucket) : rawBuckets,
  };
}

// Validate the one approved aggregate-usage read before availability-aware normalization,
// accepting both observed upstream spellings through the canonicalization above.
export const accountUsageReadResultSchema = z.preprocess(
  canonicalizeUsageReadResult,
  z
    .object({
      // Preserve reported summary counters as unknown; normalization decides availability per field.
      summary: z
        .object({
          lifetimeTokens: z.unknown().optional(),
          peakDailyTokens: z.unknown().optional(),
          currentStreakDays: z.unknown().optional(),
          longestStreakDays: z.unknown().optional(),
          longestTurnSeconds: z.unknown().optional(),
        })
        .strip()
        .nullable(),
      // Bound daily buckets by the generic transport array ceiling before semantic validation runs.
      dailyBuckets: z
        .array(usageDailyBucketInputSchema)
        .max(CODEX_PROTOCOL_LIMITS.maximumArrayItems)
        .nullable(),
    })
    .strip(),
);

// Validate the one approved sparse rate-limit notification before a full-refresh fallback.
export const rateLimitsUpdatedParamsSchema = z
  .object({
    // Require one bounded snapshot; the controller chooses a safe merge or full read.
    rateLimits: rateLimitSnapshotInputSchema,
  })
  .strip();

// Export inferred privileged types for the normalization layer only.
export type AccountReadResult = z.infer<typeof accountReadResultSchema>;
export type RateLimitSnapshotInput = z.infer<typeof rateLimitSnapshotInputSchema>;
export type RateLimitsReadResult = z.infer<typeof rateLimitsReadResultSchema>;
export type AccountUsageReadResult = z.infer<typeof accountUsageReadResultSchema>;
