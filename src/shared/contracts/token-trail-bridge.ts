// Import only the normalized public types exposed through the narrow reviewed bridge.
import type { OverviewSnapshot } from './overview-snapshot';
import type { Preferences } from './preferences';
import type { DiagnosticsDocument } from './diagnostics';

// Name fixed internal channels in shared privileged code so no renderer input can select an IPC destination.
export const TOKEN_TRAIL_IPC_CHANNELS = Object.freeze({
  // Read the current in-memory snapshot without triggering transport work.
  getOverviewSnapshot: 'token-trail:overview:get-snapshot',
  // Request one deduplicated bounded refresh.
  refreshOverview: 'token-trail:overview:refresh',
  // Deliver normalized snapshot changes from main to subscribed renderers.
  overviewChanged: 'token-trail:overview:changed',
  // Read the current validated preferences document.
  getPreferences: 'token-trail:preferences:get',
  // Persist one complete validated preferences document.
  setPreferences: 'token-trail:preferences:set',
  // Build one closed redacted diagnostics preview in main.
  previewDiagnostics: 'token-trail:diagnostics:preview',
  // Write the last previewed document to a user-selected destination through a native dialog.
  exportDiagnostics: 'token-trail:diagnostics:export',
  // Delete only Token Trail-owned preference files after explicit renderer-side confirmation.
  clearApplicationData: 'token-trail:data:clear',
} as const);

// Describe the closed result of an explicit diagnostics export attempt without exposing filesystem paths.
export interface DiagnosticsExportResult {
  // Report whether the document was written successfully.
  readonly saved: boolean;
  // Carry a stable safe category when saving failed; null on success.
  readonly errorCategory: 'canceled' | 'write-failed' | null;
}

/**
 * Expose only purpose-specific capabilities. No raw channel, Electron object, protocol method, subprocess
 * option, payload, path, or environment value is accepted from the renderer.
 */
export interface TokenTrailBridge {
  // Return the most recent validated in-memory snapshot.
  readonly getOverviewSnapshot: () => Promise<OverviewSnapshot>;
  // Request a refresh with no caller-controlled argument and return the resulting safe snapshot.
  readonly refreshOverview: () => Promise<OverviewSnapshot>;
  // Subscribe to validated snapshots and return an exact listener cleanup function.
  readonly onOverviewChanged: (listener: (snapshot: OverviewSnapshot) => void) => () => void;
  // Read the persisted validated preferences.
  readonly getPreferences: () => Promise<Preferences>;
  // Validate and persist a complete preferences replacement, returning the stored document.
  readonly setPreferences: (preferences: Preferences) => Promise<Preferences>;
  // Build and return the redacted diagnostics preview for display before any save.
  readonly previewDiagnostics: () => Promise<DiagnosticsDocument>;
  // Offer a native save dialog and write the previewed document; never returns a filesystem path.
  readonly exportDiagnostics: () => Promise<DiagnosticsExportResult>;
  // Delete only Token Trail-owned preference files and return to reviewed defaults.
  readonly clearApplicationData: () => Promise<Preferences>;
}
