// Import Zod so the privileged and renderer boundaries share one runtime-validated public data shape.
import { z } from 'zod';

// Import the closed renderer-safe error categories instead of permitting caller-authored error messages.
import { APPLICATION_ERROR_CATEGORIES } from './application-error';

// Import shared metric primitives from their own module so contract modules stay acyclic.
import { numericMetricSchema } from './metric';

// Import the Phase 3 usage, credits, and session-observation sections carried beside quota data.
import { usageSectionSchema, createUnavailableUsageSection } from './usage-data';
import { creditsSectionSchema, createUnavailableCreditsSection } from './credits-data';
import { createEmptySessionObservation, sessionObservationSchema } from './session-observation';

// Re-export the metric primitives under their historical import path for existing privileged callers.
export { METRIC_PROVENANCE, numericMetricSchema } from './metric';
export type { NumericMetric } from './metric';

// Describe one validated quota window without passing the raw app-server object to the renderer.
export const quotaWindowSchema = z
  .object({
    // Distinguish the server's primary and secondary slots without guessing friendly periods.
    kind: z.enum(['primary', 'secondary']),
    // Preserve the reported percentage with Codex provenance.
    usedPercent: numericMetricSchema,
    // Carry the locally calculated complement separately and label it calculated.
    remainingPercent: numericMetricSchema,
    // Preserve a nullable reported duration in minutes.
    durationMinutes: numericMetricSchema,
    // Preserve a nullable Unix reset timestamp in seconds.
    resetsAt: numericMetricSchema,
  })
  .strict();

// Derive the public window type so TypeScript and runtime checks cannot drift.
export type QuotaWindow = Readonly<z.infer<typeof quotaWindowSchema>>;

// Describe a safe normalized quota bucket selected from the primary or keyed app-server response.
export const quotaBucketSchema = z
  .object({
    // Use a bounded safe identifier or a local fallback; never expose an unbounded map key.
    id: z.string().min(1).max(128),
    // Display a bounded server name when valid or a neutral local label.
    name: z.string().min(1).max(128),
    // Preserve a bounded plan label without assuming an unknown future enum value is understood.
    planType: z.string().min(1).max(64).nullable(),
    // Report only whether Codex explicitly supplied a reached state.
    reached: z.boolean(),
    // Keep the supported primary and secondary windows in stable display order.
    windows: z.array(quotaWindowSchema).max(2),
  })
  .strict();

// Derive the public quota bucket type from the closed schema.
export type QuotaBucket = Readonly<z.infer<typeof quotaBucketSchema>>;

// Enumerate every renderer state required by the Phase 2 vertical slice.
export const OVERVIEW_STATES = Object.freeze([
  'not-started',
  'loading',
  'ready',
  'partial',
  'stale',
  'signed-out',
  'unsupported',
  'unavailable',
  'error',
] as const);

// Define the complete JSON-serializable snapshot that may cross the preload boundary.
export const overviewSnapshotSchema = z
  .object({
    // Drive visible state from one closed discriminant.
    state: z.enum(OVERVIEW_STATES),
    // Reveal only the non-identifying account kind needed for connection copy.
    accountKind: z.enum(['chatgpt', 'api-key', 'amazon-bedrock']).nullable(),
    // Preserve the safe plan label separately from any account identifier or email.
    planType: z.string().min(1).max(64).nullable(),
    // Bound the number of quota buckets accepted by the renderer.
    quotas: z.array(quotaBucketSchema).max(64),
    // Carry the normalized aggregate-usage section with its own availability state.
    usage: usageSectionSchema,
    // Carry the normalized credits section with its own availability state.
    credits: creditsSectionSchema,
    // Attach the in-memory current-session observation derived by the privileged controller.
    sessionObservation: sessionObservationSchema,
    // Record the last successful read separately so a failed refresh cannot make old data look new.
    lastSuccessfulRefreshAt: z.string().datetime({ offset: true }).nullable(),
    // Record the latest local attempt for diagnostics and immediate feedback.
    refreshAttemptedAt: z.string().datetime({ offset: true }).nullable(),
    // Cross IPC with only a stable safe category and never a raw exception string.
    errorCategory: z.enum(APPLICATION_ERROR_CATEGORIES).nullable(),
  })
  .strict();

// Derive the renderer snapshot type from the runtime schema.
export type OverviewSnapshot = Readonly<z.infer<typeof overviewSnapshotSchema>>;

// Construct the honest initial state before the first local app-server read resolves.
export function createLoadingOverviewSnapshot(attemptedAt: string | null): OverviewSnapshot {
  // Validate the local constant through the same boundary schema used for external messages.
  return overviewSnapshotSchema.parse({
    state: attemptedAt === null ? 'not-started' : 'loading',
    accountKind: null,
    planType: null,
    quotas: [],
    usage: createUnavailableUsageSection(),
    credits: createUnavailableCreditsSection(),
    sessionObservation: createEmptySessionObservation(),
    lastSuccessfulRefreshAt: null,
    refreshAttemptedAt: attemptedAt,
    errorCategory: null,
  });
}
