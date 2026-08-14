/**
 * The Phase 1 bridge is intentionally empty because no renderer-to-main capability has completed review.
 * Later phases add individual purpose-specific functions instead of exposing generic IPC or Electron objects.
 */
export type TokenTrailBridge = Readonly<Record<string, never>>;
