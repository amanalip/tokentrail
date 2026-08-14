// Import Node's CommonJS bridge so tests can obtain the installed Electron binary path safely.
import { createRequire } from 'node:module';

// Import path helpers to launch the built application from the explicit repository root.
import path from 'node:path';

// Import URL conversion so helper paths never depend on the test runner's working directory.
import { fileURLToPath } from 'node:url';

// Import Playwright's Electron launcher and application type only in external test code.
import { _electron as electron, type ElectronApplication } from 'playwright';

// Resolve the repository root from the checked-in helper location.
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Create a scoped require function because the Electron package exports its binary path to Node callers.
const require = createRequire(import.meta.url);

// Resolve the exact Electron executable installed by the pinned development dependency.
const electronExecutablePath = require('electron') as string;

/**
 * Launch the built Token Trail application without a development URL so tests exercise the secure custom protocol.
 */
export async function launchBuiltApplication(
  fixtureScenario?: string,
): Promise<ElectronApplication> {
  // Launch one isolated Electron process from the repository package entry.
  return electron.launch({
    executablePath: electronExecutablePath,
    args: ['.'],
    cwd: repositoryRoot,
    // Activate only the main process's exact unpackaged checked-in fixture hook when requested.
    env: {
      ...process.env,
      ...(fixtureScenario === undefined
        ? {}
        : { TOKENTRAIL_TEST_FIXTURE_SCENARIO: fixtureScenario }),
    },
  });
}
