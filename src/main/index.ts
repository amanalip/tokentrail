// Import path helpers to locate packaged renderer output from the bundled main entry.
import path from 'node:path';

// Import only the Electron application and window lifecycle capabilities needed by main orchestration.
import { app, BrowserWindow } from 'electron';

// Import the local protocol registration functions owned by the security layer.
import {
  installApplicationProtocol,
  registerApplicationScheme,
} from './security/application-protocol';

// Import strict development URL validation so environment input never becomes arbitrary navigation.
import { validateDevelopmentUrl } from './security/development-url';

// Import the global deny-by-default browser policy.
import { installWebContentsPolicy } from './security/web-contents-policy';

// Import the window factory that owns all BrowserWindow security preferences.
import { createMainWindow } from './windows/create-main-window';

// Register the custom secure scheme before Electron's ready event, as required by the protocol API.
registerApplicationScheme();

// Enforce Chromium sandboxing application-wide in addition to the explicit per-window preference.
app.enableSandbox();

// Ask Electron for the one-instance lock before starting protocol handlers or windows.
const hasSingleInstanceLock = app.requestSingleInstanceLock();

// Quit an accidental second process before it can create application state.
if (!hasSingleInstanceLock) {
  app.quit();
} else {
  // Retain the main window in privileged process memory for the application lifetime.
  let mainWindow: BrowserWindow | null = null;

  // Resolve the renderer output relative to the bundled main entry, never from the launch directory.
  const rendererRoot = path.resolve(__dirname, '..', 'renderer');

  // Validate the development URL once; malformed or unexpected values safely fall back to packaged content.
  const developmentUrl = app.isPackaged
    ? null
    : validateDevelopmentUrl(process.env['TOKENTRAIL_RENDERER_URL']);

  // Install privileged services only after Electron reports that its default session is ready.
  void app.whenReady().then(() => {
    // Serve the local bundle through the secure custom protocol even when development uses loopback content.
    installApplicationProtocol(rendererRoot);

    // Install deny-by-default browser behavior before the first webContents is created.
    installWebContentsPolicy();

    // Create the one approved application window.
    mainWindow = createMainWindow(developmentUrl);

    // Recreate the window on platforms that keep an application active after its last window closes.
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createMainWindow(developmentUrl);
      }
    });
  });

  // Focus the existing window when a user attempts to start a second TokenTrail instance.
  app.on('second-instance', () => {
    if (mainWindow !== null) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }

      mainWindow.focus();
    }
  });

  // Follow conventional desktop lifecycle behavior while preserving macOS reactivation support for later work.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
