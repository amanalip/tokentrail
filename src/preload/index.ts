// Import Electron's context bridge without exposing the module or raw IPC to the renderer.
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

// Import the compile-time bridge contract shared with the renderer.
import {
  TOKEN_TRAIL_IPC_CHANNELS,
  type TokenTrailBridge,
} from '../shared/contracts/token-trail-bridge';

// Import the public runtime validator so malformed IPC cannot reach renderer state.
import {
  overviewSnapshotSchema,
  type OverviewSnapshot,
} from '../shared/contracts/overview-snapshot';

// Expose exactly the three purpose-specific Overview capabilities reviewed for Phase 2.
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
});

// Publish one frozen, named application API into the isolated renderer world.
contextBridge.exposeInMainWorld('tokenTrail', tokenTrailBridge);
