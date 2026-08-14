// Import only the normalized public snapshot type exposed through the narrow Phase 2 bridge.
import type { OverviewSnapshot } from './overview-snapshot';

// Name fixed internal channels in shared privileged code so no renderer input can select an IPC destination.
export const TOKEN_TRAIL_IPC_CHANNELS = Object.freeze({
  // Read the current in-memory snapshot without triggering transport work.
  getOverviewSnapshot: 'token-trail:overview:get-snapshot',
  // Request one deduplicated bounded refresh.
  refreshOverview: 'token-trail:overview:refresh',
  // Deliver normalized snapshot changes from main to subscribed renderers.
  overviewChanged: 'token-trail:overview:changed',
} as const);

/**
 * Expose only purpose-specific Overview capabilities. No raw channel, Electron object, protocol method, subprocess
 * option, payload, path, or environment value is accepted from the renderer.
 */
export interface TokenTrailBridge {
  // Return the most recent validated in-memory snapshot.
  readonly getOverviewSnapshot: () => Promise<OverviewSnapshot>;
  // Request a refresh with no caller-controlled argument and return the resulting safe snapshot.
  readonly refreshOverview: () => Promise<OverviewSnapshot>;
  // Subscribe to validated snapshots and return an exact listener cleanup function.
  readonly onOverviewChanged: (listener: (snapshot: OverviewSnapshot) => void) => () => void;
}
