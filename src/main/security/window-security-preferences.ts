// Import only the Electron preference type so this pure policy module remains testable outside Electron.
import type { WebPreferences } from 'electron';

/**
 * Keep every renderer security preference in one immutable reviewed object. Runtime-only paths and developer
 * tooling choices are added separately by the window factory because they are not static security defaults.
 */
export const WINDOW_SECURITY_PREFERENCES = Object.freeze({
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
}) satisfies Readonly<WebPreferences>;
