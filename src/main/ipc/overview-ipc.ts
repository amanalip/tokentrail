// Import Electron's fixed invoke-handler API and frame metadata in the privileged main process.
import { ipcMain, type IpcMainInvokeEvent } from 'electron';

// Import the dependency-free exact-frame authorization predicate.
import { isApprovedApplicationFrameUrl } from '../security/ipc-sender';

// Import the controller type that owns all process and snapshot behavior.
import type { OverviewController } from '../overview/overview-controller';

// Import fixed internal channels and the public response validator.
import { TOKEN_TRAIL_IPC_CHANNELS } from '../../shared/contracts/token-trail-bridge';
import { overviewSnapshotSchema } from '../../shared/contracts/overview-snapshot';

// Determine whether an invoke originated from the one approved top-level application frame.
export function isApprovedOverviewIpcSender(event: IpcMainInvokeEvent): boolean {
  // Electron may report no frame for a destroyed or otherwise invalid sender.
  if (event.senderFrame === null) return false;

  // Delegate exact URL matching while deriving top-level status from trusted Electron frame objects.
  return isApprovedApplicationFrameUrl(
    event.senderFrame.url,
    event.senderFrame === event.sender.mainFrame,
  );
}

/**
 * Install two purpose-specific no-argument Overview handlers. When `onRefreshComplete` is supplied, each
 * renderer-triggered refresh reports its measured duration to privileged diagnostics code; the callback
 * receives a millisecond count only, never renderer input or protocol content.
 */
export function installOverviewIpc(
  controller: OverviewController,
  onRefreshComplete?: (durationMilliseconds: number) => void,
): () => void {
  // Return the current validated snapshot only to the approved top-level frame.
  ipcMain.handle(TOKEN_TRAIL_IPC_CHANNELS.getOverviewSnapshot, (event) => {
    if (!isApprovedOverviewIpcSender(event)) {
      throw new Error('Denied Token Trail IPC sender.');
    }

    // Validate the response at the final main-process boundary.
    return overviewSnapshotSchema.parse(controller.getSnapshot());
  });

  // Trigger one deduplicated controller refresh without accepting renderer input.
  ipcMain.handle(TOKEN_TRAIL_IPC_CHANNELS.refreshOverview, async (event) => {
    if (!isApprovedOverviewIpcSender(event)) {
      throw new Error('Denied Token Trail IPC sender.');
    }

    // Measure the bounded refresh so sanitized duration buckets stay factual for support.
    const startedAt = Date.now();
    try {
      // Validate the asynchronous result before Electron serializes it to preload.
      return overviewSnapshotSchema.parse(await controller.refresh());
    } finally {
      // Report timing even when the read failed, because failures are diagnostic facts too.
      onRefreshComplete?.(Date.now() - startedAt);
    }
  });

  // Return exact cleanup for application shutdown and isolated tests.
  return () => {
    ipcMain.removeHandler(TOKEN_TRAIL_IPC_CHANNELS.getOverviewSnapshot);
    ipcMain.removeHandler(TOKEN_TRAIL_IPC_CHANNELS.refreshOverview);
  };
}
