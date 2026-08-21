// Import path helpers to locate packaged renderer output from the bundled main entry.
import path from 'node:path';

// Import only the Electron application and window lifecycle capabilities needed by main orchestration.
import { app, BrowserWindow } from 'electron';

// Import the in-memory Overview controller that owns the approved Codex process lifecycle.
import { OverviewController } from './overview/overview-controller';

// Import the owned client only to construct a fixed checked-in fixture connection in unpackaged tests.
import { CodexProcessClient } from './codex/codex-process-client';

// Import the narrow Overview IPC registration.
import { installOverviewIpc } from './ipc/overview-ipc';

// Import the Phase 3 preferences and diagnostics IPC registration.
import { installApplicationIpc } from './ipc/application-ipc';
import { PreferenceStore } from './preferences/preference-store';
import { buildDiagnosticsDocument } from './diagnostics/build-diagnostics';

// Import the fixed main-to-renderer event channel without exposing it to renderer code.
import { TOKEN_TRAIL_IPC_CHANNELS } from '../shared/contracts/token-trail-bridge';

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

// Set the human-readable desktop application name independently from the machine-safe package slug.
app.setName('Token Trail');

// Enumerate fixture scenarios that may activate only in an unpackaged test process.
const APPROVED_TEST_FIXTURE_SCENARIOS = Object.freeze([
  'full',
  'missing-account',
  'single-bucket',
  'multiple-buckets',
  'null-fields',
  'unknown-fields',
  'malformed',
  'oversized',
  'method-not-found',
  'timeout',
  'app-server-exit',
] as const);

// Construct the controller with production discovery or one exact repository-owned fixture.
function createOverviewController(): OverviewController {
  // Ignore the test scenario completely in a packaged process.
  const requestedScenario = app.isPackaged
    ? undefined
    : process.env['TOKENTRAIL_TEST_FIXTURE_SCENARIO'];

  // Use production Codex discovery unless the value exactly matches a reviewed scenario.
  if (
    requestedScenario === undefined ||
    !APPROVED_TEST_FIXTURE_SCENARIOS.some((scenario) => scenario === requestedScenario)
  ) {
    return new OverviewController();
  }

  // Resolve one fixed checked-in script without accepting a renderer or environment-controlled path.
  const fixturePath = path.resolve(
    __dirname,
    '..',
    '..',
    'tests',
    'fixtures',
    'codex-app-server-fixture.mjs',
  );

  // Inject only the fixed Node executable, fixed fixture path, and approved scenario into the test client.
  return new OverviewController({
    createClient: () =>
      new CodexProcessClient({
        executablePath: process.execPath,
        argumentsList: [fixturePath],
        environment: {
          // Ask the development Electron binary to execute the fixed JavaScript fixture as Node.
          ELECTRON_RUN_AS_NODE: '1',
          // Pass only the already allowlisted deterministic fixture scenario.
          TOKENTRAIL_FIXTURE_SCENARIO: requestedScenario,
        },
      }),
  });
}

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

  // Own one process and snapshot controller for the complete application lifetime.
  const overviewController = createOverviewController();

  // Own the validated preferences store inside the Electron user-data directory.
  const preferenceStore = new PreferenceStore({ userDataDirectory: app.getPath('userData') });

  // Retain IPC cleanup once Electron installs the fixed handlers.
  let removeOverviewIpc: (() => void) | null = null;
  let removeApplicationIpc: (() => void) | null = null;

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

    // Install purpose-specific IPC before the renderer can request its initial snapshot.
    removeOverviewIpc = installOverviewIpc(overviewController);

    // Install preferences and diagnostics handlers backed by the privileged services.
    removeApplicationIpc = installApplicationIpc({
      loadPreferences: () => preferenceStore.load(),
      savePreferences: (preferences) => preferenceStore.save(preferences),
      clearOwnedData: () => preferenceStore.clear(),
      buildDiagnosticsPreview: async () =>
        buildDiagnosticsDocument({
          environment: {
            tokenTrailVersion: app.getVersion(),
            electronVersion: process.versions.electron ?? 'unknown',
            chromiumVersion: process.versions.chrome ?? 'unknown',
            nodeVersion: process.versions.node ?? 'unknown',
            operatingSystem: process.platform,
            architecture: process.arch,
            sessionType:
              process.env['XDG_SESSION_TYPE'] === 'wayland'
                ? 'wayland'
                : process.env['XDG_SESSION_TYPE'] === 'x11'
                  ? 'x11'
                  : 'unknown',
          },
          connection: {
            codexDiscovered: overviewController.getSnapshot().state !== 'unavailable',
            codexReportedVersion: null,
            supportedCapabilities: [
              'account/read',
              'account/rateLimits/read',
              'account/usage/read',
            ],
            unsupportedCapabilities: [],
          },
          snapshot: overviewController.getSnapshot(),
          preferences: await preferenceStore.load(),
          generatedAt: new Date(),
        }),
    });

    // Forward only validated normalized snapshot changes to the current approved renderer.
    overviewController.subscribe((snapshot) => {
      if (mainWindow !== null && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(TOKEN_TRAIL_IPC_CHANNELS.overviewChanged, snapshot);
      }
    });

    // Create the one approved application window.
    mainWindow = createMainWindow(developmentUrl);

    // Begin the first local read after the secure window and handlers exist.
    void overviewController.refresh();

    // Recreate the window on platforms that keep an application active after its last window closes.
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createMainWindow(developmentUrl);
      }
    });
  });

  // Focus the existing window when a user attempts to start a second Token Trail instance.
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

  // Stop only owned Phase 2 resources before Electron tears down process services.
  app.once('before-quit', () => {
    removeOverviewIpc?.();
    removeOverviewIpc = null;
    removeApplicationIpc?.();
    removeApplicationIpc = null;
    overviewController.stop();
  });
}
