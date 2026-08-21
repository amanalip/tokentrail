// Import Zod so exported diagnostics are validated against one closed safe schema.
import { z } from 'zod';

// Describe the non-sensitive application identity section.
export const diagnosticsApplicationSchema = z
  .object({
    // Report the running Token Trail version from package metadata.
    tokenTrailVersion: z.string().min(1).max(32),
    // Report the Electron, Chromium, and Node versions for environment triage only.
    electronVersion: z.string().min(1).max(32),
    chromiumVersion: z.string().min(1).max(32),
    nodeVersion: z.string().min(1).max(32),
  })
  .strict();

// Describe the platform section without paths, hostnames, usernames, or environment values.
export const diagnosticsPlatformSchema = z
  .object({
    // Preserve the operating system family and architecture from process.platform and process.arch.
    operatingSystem: z.string().min(1).max(32),
    architecture: z.string().min(1).max(16),
    // Record the detected session type when safely detectable; null otherwise.
    sessionType: z.enum(['wayland', 'x11', 'unknown']).nullable(),
    // Record the resolved theme mode at capture time.
    themeMode: z.enum(['system', 'light', 'dark']),
  })
  .strict();

// Describe the Codex connection section using only discovery and capability facts.
export const diagnosticsConnectionSchema = z
  .object({
    // State whether an executable was discovered without naming its path.
    codexDiscovered: z.boolean(),
    // Carry the bounded reported CLI version when initialization supplied one.
    codexReportedVersion: z.string().max(64).nullable(),
    // List supported approved reads by stable capability name.
    supportedCapabilities: z.array(z.string().max(64)).max(16),
    // List approved capabilities this build cannot use on the connected server.
    unsupportedCapabilities: z.array(z.string().max(64)).max(16),
    // Carry the last refresh outcome category from the closed safe error list.
    lastRefreshCategory: z.string().max(64).nullable(),
    // Record the last successful refresh time in ISO form.
    lastSuccessfulRefreshAt: z.string().datetime({ offset: true }).nullable(),
  })
  .strict();

// Describe usage coverage counts without any raw bucket content.
export const diagnosticsCoverageSchema = z
  .object({
    // Count valid dated buckets accepted into the normalized model.
    validDateCount: z.number().int().safe().nonnegative(),
    // Count rejected records so support can reason about source quality.
    rejectedRecordCount: z.number().int().safe().nonnegative(),
    // Name the first and last valid dates as bounds only.
    firstValidDate: z.string().nullable(),
    lastValidDate: z.string().nullable(),
  })
  .strict();

// Describe the in-memory session observation without persisting snapshot bodies.
export const diagnosticsSessionSchema = z
  .object({
    // Record when the current process first accepted a valid snapshot.
    startedAtIso: z.string().datetime({ offset: true }).nullable(),
    // Count valid snapshots observed since process open.
    validSnapshotCount: z.number().int().safe().nonnegative(),
  })
  .strict();

// Describe sanitized local health counters used only for troubleshooting support requests.
// Every field is a bounded counter or closed category; no timestamps, identifiers, or paths exist here.
export const diagnosticsHealthSchema = z
  .object({
    // Count refresh attempts observed since process open, regardless of outcome.
    refreshAttemptCount: z.number().int().safe().nonnegative(),
    // Count attempts that produced a ready or partial snapshot.
    refreshSuccessCount: z.number().int().safe().nonnegative(),
    // Count attempts that ended in a stale or error state.
    refreshFailureCount: z.number().int().safe().nonnegative(),
    // Count attempts that completed without account data, such as signed-out or unsupported states.
    refreshNoDataCount: z.number().int().safe().nonnegative(),
    // Carry the outcome of the most recent attempt as one closed category.
    lastRefreshOutcome: z.enum(['none', 'succeeded', 'failed', 'no-data']),
    // Coarsen refresh timing into reviewed buckets so support sees magnitude without a detailed history.
    lastRefreshDurationBucket: z.enum([
      'not-measured',
      'under-250ms',
      '250ms-to-1s',
      '1s-to-3s',
      'over-3s',
    ]),
  })
  .strict();

// Derive the renderer-safe health section type shared by main and renderer.
export type DiagnosticsHealthSection = Readonly<z.infer<typeof diagnosticsHealthSchema>>;

// Describe the complete closed diagnostic document eligible for preview and export.
export const diagnosticsDocumentSchema = z
  .object({
    // Version the diagnostic schema itself so exports remain interpretable over time.
    schemaVersion: z.literal(1),
    // Record when this document was generated.
    generatedAtIso: z.string().datetime({ offset: true }),
    application: diagnosticsApplicationSchema,
    platform: diagnosticsPlatformSchema,
    connection: diagnosticsConnectionSchema,
    coverage: diagnosticsCoverageSchema,
    session: diagnosticsSessionSchema,
    health: diagnosticsHealthSchema,
  })
  .strict();

// Derive the public diagnostics document type shared by main and renderer.
export type DiagnosticsDocument = Readonly<z.infer<typeof diagnosticsDocumentSchema>>;
