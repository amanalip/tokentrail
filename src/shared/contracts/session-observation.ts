// Import Zod so session observations are runtime-validated at the same boundaries as other domain data.
import { z } from 'zod';

// Describe one observed quota-window change in percentage points between two valid snapshots.
export const sessionQuotaDeltaSchema = z
  .object({
    metricKind: z.literal('quota-window-used-percent'),
    bucketId: z.string().min(1).max(128),
    bucketName: z.string().min(1).max(128),
    windowKind: z.enum(['primary', 'secondary']),
    baselinePercent: z.number().finite().min(0).max(100),
    currentPercent: z.number().finite().min(0).max(100),
    // Carry the signed point change as a bounded string so rounding is decided once, in shared code.
    changePercentagePoints: z
      .string()
      .regex(/^-?\d+(\.\d+)?$/u)
      .max(16),
  })
  .strict();

// Derive the public quota-delta type.
export type SessionQuotaDelta = Readonly<z.infer<typeof sessionQuotaDeltaSchema>>;

// Describe one observed exact integer token-counter change.
export const sessionCounterDeltaSchema = z
  .object({
    metricKind: z.literal('usage-counter-tokens'),
    counterId: z.enum(['lifetime', 'today']),
    baselineTokens: z
      .string()
      .regex(/^(0|[1-9]\d*)$/u)
      .max(128),
    currentTokens: z
      .string()
      .regex(/^(0|[1-9]\d*)$/u)
      .max(128),
    increaseTokens: z
      .string()
      .regex(/^(0|[1-9]\d*)$/u)
      .max(128)
      .nullable(),
    sourceValueChanged: z.boolean(),
  })
  .strict();

// Derive the public counter-delta type.
export type SessionCounterDelta = Readonly<z.infer<typeof sessionCounterDeltaSchema>>;

// Describe one reset transition where a window's reset timestamp changed between observations.
export const sessionResetTransitionSchema = z
  .object({
    metricKind: z.literal('quota-window-reset-transition'),
    bucketId: z.string().min(1).max(128),
    bucketName: z.string().min(1).max(128),
    windowKind: z.enum(['primary', 'secondary']),
    previousResetsAtSeconds: z.number().int().safe().nullable(),
    currentResetsAtSeconds: z.number().int().safe().nullable(),
  })
  .strict();

// Derive the public reset-transition type.
export type SessionResetTransition = Readonly<z.infer<typeof sessionResetTransitionSchema>>;

// Describe the complete in-memory observation state attached to one validated snapshot response.
export const sessionObservationSchema = z
  .object({
    // Record when the current process first accepted a valid snapshot; null before that moment.
    startedAtIso: z.string().datetime({ offset: true }).nullable(),
    // Count valid snapshots observed since process open without persisting any of them.
    validSnapshotCount: z.number().int().safe().nonnegative(),
    quotaDeltas: z.array(sessionQuotaDeltaSchema).max(128),
    counterDeltas: z.array(sessionCounterDeltaSchema).max(8),
    resetTransitions: z.array(sessionResetTransitionSchema).max(128),
  })
  .strict();

// Derive the public session-observation type shared by main and renderer.
export type SessionObservation = Readonly<z.infer<typeof sessionObservationSchema>>;

/** Construct the honest empty observation used before any valid snapshot exists. */
export function createEmptySessionObservation(): SessionObservation {
  return sessionObservationSchema.parse({
    startedAtIso: null,
    validSnapshotCount: 0,
    quotaDeltas: [],
    counterDeltas: [],
    resetTransitions: [],
  });
}
