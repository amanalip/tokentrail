// Import Electron's dialog and fixed invoke-handler API in the privileged main process.
import { dialog, ipcMain, type IpcMainInvokeEvent } from 'electron';
import { writeFile } from 'node:fs/promises';

// Import the dependency-free exact-frame authorization predicate.
import { isApprovedApplicationFrameUrl } from '../security/ipc-sender';

// Import fixed internal channels and the public response validators.
import { TOKEN_TRAIL_IPC_CHANNELS } from '../../shared/contracts/token-trail-bridge';
import type { DiagnosticsExportResult } from '../../shared/contracts/token-trail-bridge';
import { preferencesSchema, type Preferences } from '../../shared/contracts/preferences';
import {
  diagnosticsDocumentSchema,
  type DiagnosticsDocument,
} from '../../shared/contracts/diagnostics';

// Describe the privileged services this installer depends on without widening their surfaces.
export interface ApplicationIpcServices {
  readonly loadPreferences: () => Promise<Preferences>;
  readonly savePreferences: (preferences: Preferences) => Promise<void>;
  readonly buildDiagnosticsPreview: () => Promise<DiagnosticsDocument>;
  readonly clearOwnedData: () => Promise<Preferences>;
}

// Determine whether an invoke originated from the one approved top-level application frame.
function isApprovedIpcSender(event: IpcMainInvokeEvent): boolean {
  // Electron may report no frame for a destroyed or otherwise invalid sender.
  if (event.senderFrame === null) return false;

  // Delegate exact URL matching while deriving top-level status from trusted Electron frame objects.
  return isApprovedApplicationFrameUrl(
    event.senderFrame.url,
    event.senderFrame === event.sender.mainFrame,
  );
}

/**
 * Install purpose-specific preferences and diagnostics handlers. Every handler validates its sender frame,
 * accepts no free-form payload beyond the reviewed schema, and returns only schema-valid documents or closed
 * result categories. Export writes exactly the document returned by the most recent preview.
 */
export function installApplicationIpc(services: ApplicationIpcServices): () => void {
  // Retain the last previewed document so export can never write unreviewed content.
  let lastPreviewedDocument: DiagnosticsDocument | null = null;

  // Return the current validated preferences to the approved top-level frame.
  ipcMain.handle(TOKEN_TRAIL_IPC_CHANNELS.getPreferences, async (event) => {
    if (!isApprovedIpcSender(event)) {
      throw new Error('Denied Token Trail IPC sender.');
    }
    return preferencesSchema.parse(await services.loadPreferences());
  });

  // Validate and persist a complete replacement document; partial updates are rejected by design.
  ipcMain.handle(TOKEN_TRAIL_IPC_CHANNELS.setPreferences, async (event, candidate: unknown) => {
    if (!isApprovedIpcSender(event)) {
      throw new Error('Denied Token Trail IPC sender.');
    }
    const validated = preferencesSchema.parse(candidate);
    await services.savePreferences(validated);
    return validated;
  });

  // Build one fresh redacted preview and retain it as the only exportable content.
  ipcMain.handle(TOKEN_TRAIL_IPC_CHANNELS.previewDiagnostics, async (event) => {
    if (!isApprovedIpcSender(event)) {
      throw new Error('Denied Token Trail IPC sender.');
    }
    lastPreviewedDocument = diagnosticsDocumentSchema.parse(
      await services.buildDiagnosticsPreview(),
    );
    return lastPreviewedDocument;
  });

  // Offer a native save dialog and write exactly the retained previewed document.
  ipcMain.handle(TOKEN_TRAIL_IPC_CHANNELS.exportDiagnostics, async (event) => {
    if (!isApprovedIpcSender(event)) {
      throw new Error('Denied Token Trail IPC sender.');
    }

    // Refuse exports when no preview exists in this session so saving implies review.
    const document = lastPreviewedDocument;
    if (document === null) {
      const result: DiagnosticsExportResult = { saved: false, errorCategory: 'write-failed' };
      return result;
    }

    // Ask the operating system for an explicit user-chosen destination.
    const outcome = await dialog.showSaveDialog({
      title: 'Export Token Trail diagnostics',
      defaultPath: 'token-trail-diagnostics.json',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });

    // Treat a canceled dialog as an explicit non-error outcome.
    if (outcome.canceled || outcome.filePath === undefined) {
      const result: DiagnosticsExportResult = { saved: false, errorCategory: 'canceled' };
      return result;
    }

    try {
      // Write only the validated previewed document with restrictive permissions where supported.
      await writeFile(outcome.filePath, JSON.stringify(document, null, 2), {
        encoding: 'utf8',
        mode: 0o600,
      });
      const result: DiagnosticsExportResult = { saved: true, errorCategory: null };
      return result;
    } catch {
      // Report failures through the closed category without exposing filesystem error text.
      const result: DiagnosticsExportResult = { saved: false, errorCategory: 'write-failed' };
      return result;
    }
  });

  // Delete only Token Trail-owned files and return the resulting reviewed defaults.
  ipcMain.handle(TOKEN_TRAIL_IPC_CHANNELS.clearApplicationData, async (event) => {
    if (!isApprovedIpcSender(event)) {
      throw new Error('Denied Token Trail IPC sender.');
    }
    return preferencesSchema.parse(await services.clearOwnedData());
  });

  // Return exact cleanup for application shutdown and isolated tests.
  return () => {
    for (const channel of Object.values(TOKEN_TRAIL_IPC_CHANNELS)) {
      ipcMain.removeHandler(channel);
    }
  };
}
