// Import Zod so usage data is runtime-validated at every privileged and renderer boundary.
import { z } from 'zod';

// Reuse the closed provenance labels from the shared metric module so contract modules stay acyclic.
import { METRIC_PROVENANCE } from './metric';

/**
 * Aggregate token counters can exceed JavaScript's exact integer range, so every retained counter crosses IPC as
 * a canonical unsigned decimal string. Calculations convert these strings to bigint exactly; presentation never
 * parses them through lossy binary floats.
 */
export const decimalCounterSchema = z
  .string()
  .regex(/^(0|[1-9]\d*)$/u, 'Expected a canonical unsigned decimal integer string.')
  .max(128);

// Derive the public decimal-counter type so adapters and calculations share one representation.
export type DecimalCounter = z.infer<typeof decimalCounterSchema>;

// Describe one supplied dated usage bucket after normalization. Missing dates never appear here.
export const usageDaySchema = z
  .object({
    // Keep the strict calendar key; validation of its real-calendar semantics happens in shared domain code.
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
    // Preserve the exact reported total for that day as an exact decimal string.
    tokens: decimalCounterSchema,
    // Label the value with its stable provenance so the table and chart cannot invent authority.
    provenance: z.enum(METRIC_PROVENANCE),
  })
  .strict();

// Derive the immutable daily-bucket type used across adapter, controller, and renderer.
export type UsageDay = Readonly<z.infer<typeof usageDaySchema>>;

// Describe the reported aggregate summary fields Token Trail may display without reconstruction.
export const usageSummarySchema = z
  .object({
    // Preserve the reported lifetime total only when Codex supplies it explicitly.
    lifetimeTokens: decimalCounterSchema.nullable(),
    // Preserve a reported peak-day total without labeling it a lifetime maximum.
    peakDailyTokens: decimalCounterSchema.nullable(),
    // Preserve reported streak integers exactly as supplied, including zero.
    currentStreakDays: z.number().int().safe().nonnegative().nullable(),
    longestStreakDays: z.number().int().safe().nonnegative().nullable(),
    // Preserve a reported longest-turn duration in whole seconds.
    longestTurnSeconds: z.number().int().safe().nonnegative().nullable(),
  })
  .strict();

// Derive the summary type for renderer display.
export type UsageSummary = Readonly<z.infer<typeof usageSummarySchema>>;

// Describe source coverage so every derived calculation can explain its own availability honestly.
export const usageCoverageSchema = z
  .object({
    // Count the distinct valid dated buckets accepted into the normalized model.
    validDateCount: z.number().int().safe().nonnegative(),
    // Count buckets rejected for duplicate dates, invalid dates, negative or unsafe values.
    rejectedRecordCount: z.number().int().safe().nonnegative(),
    // Count accepted buckets whose reported value is exactly zero.
    reportedZeroCount: z.number().int().safe().nonnegative(),
    // List up to the bounded number of missing dates inside the observed supplied span.
    missingDates: z.array(z.string()).max(64),
    // Record whether the bounded missing-date list was truncated and therefore incomplete.
    missingDatesTruncated: z.boolean(),
    // Name the first and last valid dates so ranges are labeled from evidence rather than assumption.
    firstValidDate: z.string().nullable(),
    lastValidDate: z.string().nullable(),
  })
  .strict();

// Derive the coverage type used by the Usage screen and diagnostics.
export type UsageCoverage = Readonly<z.infer<typeof usageCoverageSchema>>;

// Enumerate how the usage section explains itself to the renderer without raw protocol context.
export const USAGE_SECTION_STATES = Object.freeze(['unavailable', 'ready', 'partial'] as const);

// Describe the complete normalized usage section carried beside quota data in one snapshot.
export const usageSectionSchema = z
  .object({
    // Drive rendering from one closed discriminant instead of inferring availability from empty arrays.
    state: z.enum(USAGE_SECTION_STATES),
    // Carry accepted buckets sorted chronologically with duplicates removed by rejection, not silence.
    days: z.array(usageDaySchema).max(366),
    // Preserve reported summary fields separately from locally calculated statistics.
    summary: usageSummarySchema,
    // Explain what the source actually covered so comparisons and totals can be honest.
    coverage: usageCoverageSchema,
  })
  .strict();

// Derive the public usage-section type shared by main and renderer.
export type UsageSection = Readonly<z.infer<typeof usageSectionSchema>>;

/** Construct the honest unavailable usage section used before the first successful approved read. */
export function createUnavailableUsageSection(): UsageSection {
  return usageSectionSchema.parse({
    state: 'unavailable',
    days: [],
    summary: {
      lifetimeTokens: null,
      peakDailyTokens: null,
      currentStreakDays: null,
      longestStreakDays: null,
      longestTurnSeconds: null,
    },
    coverage: {
      validDateCount: 0,
      rejectedRecordCount: 0,
      reportedZeroCount: 0,
      missingDates: [],
      missingDatesTruncated: false,
      firstValidDate: null,
      lastValidDate: null,
    },
  });
}
