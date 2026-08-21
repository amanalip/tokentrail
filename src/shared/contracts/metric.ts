// Import Zod so metric primitives are runtime-validated everywhere they cross a boundary.
import { z } from 'zod';

// Enumerate the only provenance labels any Token Trail metric may present to a user.
export const METRIC_PROVENANCE = Object.freeze([
  'codex-reported',
  'locally-observed',
  'calculated',
  'unavailable',
] as const);

// Describe one finite numeric value together with its stable provenance and availability explanation.
export const numericMetricSchema = z
  .object({
    // Preserve a valid value or an explicit absence without inventing zero.
    value: z.number().finite().nullable(),
    // Keep provenance inside the domain object rather than attaching it only in the visual layer.
    provenance: z.enum(METRIC_PROVENANCE),
    // Use a bounded local explanation key so raw protocol or error text cannot cross IPC.
    explanation: z.string().min(1).max(96),
  })
  .strict();

// Derive the immutable presentation type directly from its runtime validator.
export type NumericMetric = Readonly<z.infer<typeof numericMetricSchema>>;

/** Construct one frozen numeric metric through the shared reviewed helper. */
export function createNumericMetric(
  value: number | null,
  provenance: NumericMetric['provenance'],
  explanation: string,
): NumericMetric {
  return Object.freeze({ value, provenance, explanation });
}
