// Import Zod to validate unknown diagnostic input before any value is retained or exported.
import { z } from 'zod';

// Import the closed renderer-safe error vocabulary instead of accepting exception names or messages.
import { APPLICATION_ERROR_CATEGORIES } from '../../shared/contracts/application-error';

// Define the complete diagnostic document as a strict allowlist of non-identifying operational categories.
const SAFE_DIAGNOSTIC_SCHEMA = z.object({
  // Version the safe document independently from application or upstream protocol versions.
  schemaVersion: z.literal(1),
  // Retain the public application version while rejecting long or free-form build text.
  applicationVersion: z
    .string()
    .regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u)
    .max(32),
  // Retain only the broad supported operating-system family, never a hostname or distribution username.
  platform: z.enum(['linux', 'darwin', 'win32']),
  // Retain only architectures needed to interpret a package or compatibility finding.
  architecture: z.enum(['x64', 'arm64']),
  // Describe where startup reached without storing timestamps, command lines, or paths.
  startupPhase: z.enum(['boot', 'window', 'codex', 'ready']),
  // Describe executable discovery using a category instead of retaining the discovered path.
  discoveryOutcome: z.enum(['not-attempted', 'found', 'not-found', 'denied', 'invalid']),
  // Describe protocol compatibility without serializing capabilities or raw upstream responses.
  capabilityState: z.enum(['not-checked', 'supported', 'partial', 'unsupported']),
  // Permit only the already reviewed safe error category vocabulary.
  sanitizedErrorCategory: z.enum(APPLICATION_ERROR_CATEGORIES).optional(),
  // Bound the restart counter so corrupted state cannot become an unbounded diagnostic value.
  childRestartCount: z.number().int().min(0).max(10),
  // Coarsen refresh timing so diagnostics remain useful without becoming a detailed activity history.
  refreshDurationBucket: z.enum([
    'not-measured',
    'under-250ms',
    '250ms-to-1s',
    '1s-to-3s',
    'over-3s',
  ]),
});

// Export the exact safe document type inferred from the one runtime schema.
export type SafeDiagnostic = z.infer<typeof SAFE_DIAGNOSTIC_SCHEMA>;

/**
 * Construct a diagnostic document from unknown input. Zod strips unknown keys, which makes the output an
 * allowlist projection rather than a blacklist that could miss a newly introduced credential or account field.
 */
export function createSafeDiagnostic(input: unknown): Readonly<SafeDiagnostic> | null {
  // Validate known values and strip every unknown property before the result can reach a preview or file.
  const validationResult = SAFE_DIAGNOSTIC_SCHEMA.safeParse(input);

  // Return no document when a required safe field is missing or malformed.
  if (!validationResult.success) {
    return null;
  }

  // Freeze the allowlisted projection so later code cannot append a raw exception or protocol object.
  return Object.freeze(validationResult.data);
}
