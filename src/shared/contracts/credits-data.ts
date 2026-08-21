// Import Zod so credit data is runtime-validated at every boundary like the rest of the domain.
import { z } from 'zod';

// Reuse the closed provenance labels from the shared metric module so contract modules stay acyclic.
import { METRIC_PROVENANCE } from './metric';

/**
 * Money-like values remain bounded display strings with Codex provenance. Token Trail never parses them into
 * numbers, never invents a currency symbol, and never converts them into quota percentages or scores.
 */
export const creditAmountSchema = z.string().min(1).max(64);

// Describe one normalized individual spending control reported beside quota windows.
export const spendingControlSchema = z
  .object({
    // Preserve the bounded reported limit amount exactly as supplied.
    limitAmount: creditAmountSchema.nullable(),
    // Preserve the bounded reported used amount exactly as supplied.
    usedAmount: creditAmountSchema.nullable(),
    // Preserve a reported remaining percentage through the shared metric shape.
    remainingPercent: z
      .object({
        value: z.number().finite().nullable(),
        provenance: z.enum(METRIC_PROVENANCE),
        explanation: z.string().min(1).max(96),
      })
      .strict(),
    // Report only whether Codex explicitly reports this control as reached.
    reached: z.boolean(),
    // Preserve a nullable Unix reset timestamp in seconds for the control window.
    resetsAtSeconds: z.number().int().safe().positive().nullable(),
  })
  .strict();

// Derive the public spending-control type.
export type SpendingControl = Readonly<z.infer<typeof spendingControlSchema>>;

// Enumerate the closed reset-credit states so expiry language stays factual and reviewed.
export const RESET_CREDIT_STATES = Object.freeze(['available', 'expired'] as const);

// Describe one safe reset-credit detail row after stripping backend identifiers and unknown fields.
export const resetCreditDetailSchema = z
  .object({
    // Keep the backend title bounded and render it later as plain text only.
    title: z.string().min(1).max(128),
    // Keep the backend description bounded and plain-text rendered.
    description: z.string().min(1).max(512),
    // Preserve a nullable future-or-past expiry timestamp; null means no expiry was reported.
    expiresAtSeconds: z.number().int().safe().positive().nullable(),
    // Carry the closed availability state derived from the reported fields at normalization time.
    state: z.enum(RESET_CREDIT_STATES),
  })
  .strict();

// Derive the public reset-credit detail type.
export type ResetCreditDetail = Readonly<z.infer<typeof resetCreditDetailSchema>>;

// Describe the complete normalized credits section carried beside quota data in one snapshot.
export const creditsSectionSchema = z
  .object({
    // Drive rendering from one closed discriminant instead of inferring from nulls.
    state: z.enum(['unavailable', 'ready', 'partial']),
    // Distinguish an explicitly reported unlimited balance from an unavailable or absent one.
    balanceUnlimited: z.boolean(),
    // Preserve the bounded reported balance string when one exists and the account is not unlimited.
    balanceAmount: creditAmountSchema.nullable(),
    // Preserve the optional individual spending control separately from workspace credit balance.
    spendingControl: spendingControlSchema.nullable(),
    // Keep the authoritative available count even when detail rows are absent or capped.
    resetCreditsAvailableCount: z.number().int().safe().nonnegative().nullable(),
    // Carry at most the bounded detail rows accepted from the response.
    resetCreditDetails: z.array(resetCreditDetailSchema).max(32),
    // Record whether detail rows were capped so the interface can explain the difference honestly.
    resetCreditDetailsCapped: z.boolean(),
  })
  .strict();

// Derive the public credits-section type shared by main and renderer.
export type CreditsSection = Readonly<z.infer<typeof creditsSectionSchema>>;

/** Construct the honest unavailable credits section used before or without a successful approved read. */
export function createUnavailableCreditsSection(): CreditsSection {
  return creditsSectionSchema.parse({
    state: 'unavailable',
    balanceUnlimited: false,
    balanceAmount: null,
    spendingControl: null,
    resetCreditsAvailableCount: null,
    resetCreditDetails: [],
    resetCreditDetailsCapped: false,
  });
}
