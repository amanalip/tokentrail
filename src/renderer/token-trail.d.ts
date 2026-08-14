// Import the exact bridge type so renderer code cannot invent capabilities that preload does not provide.
import type { TokenTrailBridge } from '../shared/contracts/token-trail-bridge';

// Extend the browser Window type with the one reviewed preload bridge.
declare global {
  interface Window {
    readonly tokenTrail: TokenTrailBridge;
  }
}

// Keep this declaration file in module scope so its global augmentation is applied safely.
export {};
