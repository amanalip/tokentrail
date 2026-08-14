// Import Electron's context bridge without exposing the module or raw IPC to the renderer.
import { contextBridge } from 'electron';

// Import the compile-time bridge contract shared with the renderer.
import type { TokenTrailBridge } from '../shared/contracts/token-trail-bridge';

// Keep Phase 1's public API deliberately empty until each purpose-specific method receives review and tests.
const tokenTrailBridge: TokenTrailBridge = Object.freeze({});

// Publish one frozen, named application API into the isolated renderer world.
contextBridge.exposeInMainWorld('tokenTrail', tokenTrailBridge);
