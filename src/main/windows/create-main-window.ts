// Import path operations to locate the separately built preload bundle.
import path from 'node:path';

// Import the one Electron window capability owned by this module.
import { app, BrowserWindow } from 'electron';

// Import the fixed packaged renderer URL.
import { APPLICATION_URL } from '../security/application-protocol';

// Import the immutable security preferences shared with focused policy tests.
import { WINDOW_SECURITY_PREFERENCES } from '../security/window-security-preferences';

// Resolve the preload output beside the main output according to the reviewed build layout.
const preloadPath = path.resolve(__dirname, '..', 'preload', 'index.cjs');

/**
 * Create TokenTrail's one main window with an explicit least-privilege preference set. The caller supplies a
 * validated loopback development URL or `null`; packaged content remains the default and production path.
 */
export function createMainWindow(developmentUrl: string | null): BrowserWindow {
  // Construct one conventional window while keeping every security-sensitive preference explicit.
  const mainWindow = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 720,
    minHeight: 560,
    show: false,
    backgroundColor: '#10131a',
    title: 'TokenTrail',
    autoHideMenuBar: true,
    webPreferences: {
      ...WINDOW_SECURITY_PREFERENCES,
      preload: preloadPath,
      devTools: !app.isPackaged,
    },
  });

  // Avoid a white or incomplete flash by showing the window only after its first local frame is ready.
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load only the validated development origin or the fixed packaged application origin.
  void mainWindow.loadURL(developmentUrl ?? APPLICATION_URL);

  // Return the window so the lifecycle owner can retain it and prevent premature garbage collection.
  return mainWindow;
}
