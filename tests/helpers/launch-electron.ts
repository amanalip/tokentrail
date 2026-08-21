// Import Node's CommonJS bridge so tests can obtain the installed Electron binary path safely.
import { createRequire } from 'node:module';

// Import synchronous filesystem helpers so owned profile cleanup runs even on abrupt test exits.
import { mkdtempSync, rmSync } from 'node:fs';

// Import path helpers to launch the built application from the explicit repository root.
import path from 'node:path';

// Import URL conversion so helper paths never depend on the test runner's working directory.
import { fileURLToPath } from 'node:url';

// Import the operating-system temporary directory for disposable test profiles.
import { tmpdir } from 'node:os';

// Import Playwright's Electron launcher and application type only in external test code.
import { _electron as electron, type ElectronApplication } from 'playwright';

// Resolve the repository root from the checked-in helper location.
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Create a scoped require function because the Electron package exports its binary path to Node callers.
const require = createRequire(import.meta.url);

// Resolve the exact Electron executable installed by the pinned development dependency.
const electronExecutablePath = require('electron') as string;

// Name the environment variables that would force Electron packaging or development flags and must never
// leak from a maintainer's shell into a test process, because they change identity and fixture behavior.
const FORCED_ELECTRON_ENVIRONMENT_KEYS = Object.freeze([
  'ELECTRON_FORCE_IS_PACKAGED',
  'ELECTRON_IS_DEV',
] as const);

// Build one sanitized copy of the parent environment without the forced packaging switches.
function createSanitizedTestEnvironment(): NodeJS.ProcessEnv {
  // Copy every parent variable except the reviewed force flags.
  const environment: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (FORCED_ELECTRON_ENVIRONMENT_KEYS.some((forcedKey) => forcedKey === key)) continue;
    environment[key] = value;
  }
  return environment;
}

// Retain every helper-owned profile directory so one process-exit sweep can remove them all.
const ownedProfileDirectories: string[] = [];

// Register the single exit sweep once per test process.
let exitSweepRegistered = false;

function createOwnedProfileDirectory(): string {
  // Create one unique temporary directory so concurrent suites never share state.
  const directory = mkdtempSync(path.join(tmpdir(), 'tokentrail-built-test-'));
  ownedProfileDirectories.push(directory);

  // Register the bounded synchronous sweep on first use; profiles are disposable by design.
  if (!exitSweepRegistered) {
    exitSweepRegistered = true;
    process.once('exit', () => {
      for (const ownedDirectory of ownedProfileDirectories) {
        rmSync(ownedDirectory, { recursive: true, force: true });
      }
    });
  }

  return directory;
}

/**
 * Create one disposable profile directory for a launch sequence that needs shared persisted state
 * across several application starts, such as persistence assertions. The directory is removed when
 * the test process exits; callers that need earlier removal may delete it themselves.
 */
export function createDisposableUserDataDirectory(): string {
  return createOwnedProfileDirectory();
}

/**
 * Launch the built Token Trail application without a development URL so tests exercise the secure custom protocol.
 * Each launch receives its own isolated profile directory unless the caller supplies one deliberately.
 * Extra environment entries merge last so scenarios such as timezone observation can vary only
 * the variable under test while every other launch property stays identical.
 */
export async function launchBuiltApplication(
  fixtureScenario?: string,
  options?: {
    readonly userDataDirectory?: string;
    readonly extraEnv?: Readonly<Record<string, string>>;
  },
): Promise<ElectronApplication> {
  // Isolate every launch from other suites and from real user configuration by default.
  const profileDirectory = options?.userDataDirectory ?? createOwnedProfileDirectory();

  // Launch one isolated Electron process from the repository package entry.
  return electron.launch({
    executablePath: electronExecutablePath,
    args: ['.'],
    cwd: repositoryRoot,
    // Activate only the main process's exact unpackaged checked-in fixture hook when requested.
    env: {
      ...createSanitizedTestEnvironment(),
      ...(fixtureScenario === undefined
        ? {}
        : { TOKENTRAIL_TEST_FIXTURE_SCENARIO: fixtureScenario }),
      TOKENTRAIL_TEST_USER_DATA_DIR: profileDirectory,
      ...(options?.extraEnv ?? {}),
    },
  });
}
