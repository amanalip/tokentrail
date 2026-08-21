// Import the closed diagnostics document schema and its section types.
import {
  diagnosticsDocumentSchema,
  diagnosticsHealthSchema,
  type DiagnosticsDocument,
  type DiagnosticsHealthSection,
} from '../../shared/contracts/diagnostics';
import type { OverviewSnapshot } from '../../shared/contracts/overview-snapshot';
import type { Preferences } from '../../shared/contracts/preferences';

// Describe the environment facts collected by privileged callers at capture time.
export interface DiagnosticsEnvironmentInput {
  readonly tokenTrailVersion: string;
  readonly electronVersion: string;
  readonly chromiumVersion: string;
  readonly nodeVersion: string;
  readonly operatingSystem: string;
  readonly architecture: string;
  readonly sessionType: 'wayland' | 'x11' | 'unknown' | null;
}

// Describe the connection facts observed by the adapter and controller.
export interface DiagnosticsConnectionInput {
  readonly codexDiscovered: boolean;
  readonly codexReportedVersion: string | null;
  readonly supportedCapabilities: readonly string[];
  readonly unsupportedCapabilities: readonly string[];
}

/**
 * Build one closed diagnostic document from reviewed inputs and the current snapshot. Every field is
 * allowlisted; raw protocol data, snapshot bodies, paths, identifiers, email, prompts, and unknown fields have
 * no path into this document, which recursive canary tests verify.
 */
export function buildDiagnosticsDocument(input: {
  readonly environment: DiagnosticsEnvironmentInput;
  readonly connection: DiagnosticsConnectionInput;
  readonly snapshot: OverviewSnapshot;
  readonly preferences: Preferences;
  readonly health: DiagnosticsHealthSection;
  readonly generatedAt: Date;
}): DiagnosticsDocument {
  // Map the closed theme preference into the diagnostic theme mode.
  const themeMode = input.preferences.theme;

  // Derive coverage counts from the normalized usage section without exposing bucket values.
  const coverage = input.snapshot.usage.coverage;

  // Parse the complete document through its boundary schema so no extra field can survive.
  return diagnosticsDocumentSchema.parse({
    schemaVersion: 1,
    generatedAtIso: input.generatedAt.toISOString(),
    application: {
      tokenTrailVersion: input.environment.tokenTrailVersion,
      electronVersion: input.environment.electronVersion,
      chromiumVersion: input.environment.chromiumVersion,
      nodeVersion: input.environment.nodeVersion,
    },
    platform: {
      operatingSystem: input.environment.operatingSystem,
      architecture: input.environment.architecture,
      sessionType: input.environment.sessionType,
      themeMode,
    },
    connection: {
      codexDiscovered: input.connection.codexDiscovered,
      codexReportedVersion: input.connection.codexReportedVersion,
      supportedCapabilities: [...input.connection.supportedCapabilities],
      unsupportedCapabilities: [...input.connection.unsupportedCapabilities],
      lastRefreshCategory: input.snapshot.errorCategory,
      lastSuccessfulRefreshAt: input.snapshot.lastSuccessfulRefreshAt,
    },
    coverage: {
      validDateCount: coverage.validDateCount,
      rejectedRecordCount: coverage.rejectedRecordCount,
      firstValidDate: coverage.firstValidDate,
      lastValidDate: coverage.lastValidDate,
    },
    session: {
      startedAtIso: input.snapshot.sessionObservation.startedAtIso,
      validSnapshotCount: input.snapshot.sessionObservation.validSnapshotCount,
    },
    health: diagnosticsHealthSchema.parse(input.health),
  });
}
