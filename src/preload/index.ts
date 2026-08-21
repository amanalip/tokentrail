// Import Electron's context bridge without exposing the module or raw IPC to the renderer.
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

// Import the compile-time bridge contract shared with the renderer.
import {
  TOKEN_TRAIL_IPC_CHANNELS,
  type TokenTrailBridge,
} from '../shared/contracts/token-trail-bridge';

// Import the public runtime validators so malformed IPC cannot reach renderer state.
import {
  overviewSnapshotSchema,
  type OverviewSnapshot,
} from '../shared/contracts/overview-snapshot';
import { preferencesSchema, type Preferences } from '../shared/contracts/preferences';
import { diagnosticsDocumentSchema } from '../shared/contracts/diagnostics';

// Expose exactly the reviewed purpose-specific capabilities across the isolation boundary.
const tokenTrailBridge: TokenTrailBridge = Object.freeze({
  // Read the current safe snapshot through one fixed internal channel.
  getOverviewSnapshot: async () =>
    overviewSnapshotSchema.parse(
      await ipcRenderer.invoke(TOKEN_TRAIL_IPC_CHANNELS.getOverviewSnapshot),
    ),

  // Request a refresh without accepting a caller-selected channel, method, or payload.
  refreshOverview: async () =>
    overviewSnapshotSchema.parse(
      await ipcRenderer.invoke(TOKEN_TRAIL_IPC_CHANNELS.refreshOverview),
    ),

  // Subscribe to validated snapshots while hiding Electron event objects and channel names.
  onOverviewChanged: (listener: (snapshot: OverviewSnapshot) => void) => {
    // Wrap the renderer callback so it receives only a schema-validated snapshot.
    const wrappedListener = (_event: IpcRendererEvent, value: unknown) => {
      const parsedSnapshot = overviewSnapshotSchema.safeParse(value);
      if (parsedSnapshot.success) {
        listener(parsedSnapshot.data);
      }
    };

    // Attach only to the fixed main-to-renderer Overview channel.
    ipcRenderer.on(TOKEN_TRAIL_IPC_CHANNELS.overviewChanged, wrappedListener);

    // Return exact-listener cleanup for React effect teardown.
    return () => {
      ipcRenderer.removeListener(TOKEN_TRAIL_IPC_CHANNELS.overviewChanged, wrappedListener);
    };
  },

  // Read the persisted validated preferences through one fixed internal channel.
  getPreferences: async () =>
    preferencesSchema.parse(await ipcRenderer.invoke(TOKEN_TRAIL_IPC_CHANNELS.getPreferences)),

  // Send a complete replacement document and return the stored validated result.
  setPreferences: async (preferences: Preferences) =>
    preferencesSchema.parse(
      await ipcRenderer.invoke(TOKEN_TRAIL_IPC_CHANNELS.setPreferences, preferences),
    ),

  // Build and return the redacted diagnostics preview for display before any save.
  previewDiagnostics: async () =>
    diagnosticsDocumentSchema.parse(
      await ipcRenderer.invoke(TOKEN_TRAIL_IPC_CHANNELS.previewDiagnostics),
    ),

  // Offer a native save dialog and write the previewed document; never returns a filesystem path.
  exportDiagnostics: async () =>
    ipcRenderer.invoke(TOKEN_TRAIL_IPC_CHANNELS.exportDiagnostics) as ReturnType<
      TokenTrailBridge['exportDiagnostics']
    >,

  // Delete only Token Trail-owned preference files and adopt the returned reviewed defaults.
  clearApplicationData: async () =>
    preferencesSchema.parse(
      await ipcRenderer.invoke(TOKEN_TRAIL_IPC_CHANNELS.clearApplicationData),
    ),
});

// Publish one frozen, named application API into the isolated renderer world.
contextBridge.exposeInMainWorld('tokenTrail', tokenTrailBridge);
