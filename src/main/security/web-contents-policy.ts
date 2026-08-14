// Import Electron's application and default session objects in the privileged main process.
import { app, session } from 'electron';

/**
 * Install deny-by-default browser policies before any TokenTrail window is created. These handlers block
 * navigation, new windows, webviews, permissions, and downloads because v1 has no feature requiring them.
 */
export function installWebContentsPolicy(): void {
  // Apply navigation and window rules to every webContents created by this application.
  app.on('web-contents-created', (_event, contents) => {
    // Deny every renderer-initiated top-level navigation after the approved page begins loading.
    contents.on('will-navigate', (navigationEvent) => {
      navigationEvent.preventDefault();
    });

    // Deny redirects so a compromised local route cannot move the window to another origin.
    contents.on('will-redirect', (redirectEvent) => {
      redirectEvent.preventDefault();
    });

    // Deny all window creation because TokenTrail v1 has one local application window.
    contents.setWindowOpenHandler(() => ({ action: 'deny' }));

    // Deny webview attachment before any supplied preferences or parameters can take effect.
    contents.on('will-attach-webview', (webviewEvent) => {
      webviewEvent.preventDefault();
    });
  });

  // Deny every browser permission request because the approved v1 feature set needs none.
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });

  // Make synchronous permission checks agree with asynchronous permission requests.
  session.defaultSession.setPermissionCheckHandler(() => false);

  // Deny downloads because diagnostics use a reviewed native save flow rather than browser downloads.
  session.defaultSession.on('will-download', (downloadEvent) => {
    downloadEvent.preventDefault();
  });
}
