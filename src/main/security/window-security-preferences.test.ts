// Import Vitest's explicit helpers for the static privileged-window policy.
import { describe, expect, it } from 'vitest';

// Import the immutable preference object consumed by BrowserWindow creation.
import { WINDOW_SECURITY_PREFERENCES } from './window-security-preferences';

// Group the complete preference assertion around renderer isolation.
describe('WINDOW_SECURITY_PREFERENCES', () => {
  // Confirm every dangerous renderer capability is denied and every isolation control is enabled.
  it('defines the complete hardened renderer policy', () => {
    expect(WINDOW_SECURITY_PREFERENCES).toEqual({
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      webviewTag: false,
      spellcheck: false,
    });
  });

  // Confirm later code cannot mutate the reviewed policy before constructing a window.
  it('is immutable at runtime', () => {
    expect(Object.isFrozen(WINDOW_SECURITY_PREFERENCES)).toBe(true);
  });
});
