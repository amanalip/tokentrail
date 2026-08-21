// Import a loopback server to reserve one local Chromium debugging port.
import { createServer } from 'node:net';

// Import shell-free process spawning for the real npm development orchestrator.
import { spawn, type ChildProcess } from 'node:child_process';

// Import path helpers for an explicit repository working directory.
import path from 'node:path';

// Import URL conversion so helper behavior never depends on the caller's directory.
import { fileURLToPath } from 'node:url';

// Import Chromium's CDP client and narrow browser/page types.
import { chromium, type Browser, type Page } from 'playwright';

// Resolve the repository from this checked-in helper.
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Describe the page and exact cleanup owned by one real development session.
export interface DevelopmentApplicationHarness {
  // Expose the actual Electron renderer page served by Vite.
  readonly page: Page;
  // Close CDP and the complete detached npm-owned process group.
  readonly close: () => Promise<void>;
}

// Reserve one numeric loopback port and release it immediately before process launch.
async function reserveLoopbackPort(): Promise<number> {
  // Create a server that never binds an external interface.
  const server = createServer();

  // Wait for the operating system to choose one unused loopback port.
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  // Read the assigned TCP address.
  const address = server.address();
  if (address === null || typeof address === 'string') {
    server.close();
    throw new Error('Could not reserve a development debugging port.');
  }

  // Retain the port before closing the temporary reservation.
  const port = address.port;
  await new Promise<void>((resolve) => server.close(() => resolve()));
  return port;
}

// Connect to the real Electron development renderer with a bounded startup wait.
async function connectToDevelopmentChromium(
  port: number,
  developmentProcess: ChildProcess,
  readOutput: () => string,
): Promise<Browser> {
  // Bound Vite builds, server startup, and Electron launch to fifteen seconds on the local test machine.
  const deadline = Date.now() + 15_000;

  // Retry only the exact reserved loopback endpoint.
  while (Date.now() < deadline) {
    if (developmentProcess.exitCode !== null) {
      throw new Error(`Development session exited early. ${readOutput()}`);
    }

    try {
      // Return after Chromium exposes the test-only loopback endpoint.
      return await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
    } catch {
      // Vite and Electron are expected to refuse briefly during startup.
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Fail with only bounded local development output.
  throw new Error(`Timed out connecting to the development renderer. ${readOutput()}`);
}

/** Launch the real `npm run dev` orchestration with one checked-in fixture scenario. */
export async function launchDevelopmentApplication(
  fixtureScenario = 'full',
): Promise<DevelopmentApplicationHarness> {
  // Reserve one local debugging port before creating the development process group.
  const debuggingPort = await reserveLoopbackPort();

  // Keep a bounded tail of development output for startup failures.
  let output = '';

  // Copy the parent environment without forced Electron packaging or development switches.
  const environment: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key === 'ELECTRON_FORCE_IS_PACKAGED' || key === 'ELECTRON_IS_DEV') continue;
    environment[key] = value;
  }

  // Start the exact checked-in orchestrator used by `npm run dev`; direct Node ownership makes cleanup reliable.
  const developmentProcess = spawn(
    process.execPath,
    [path.join(repositoryRoot, 'scripts', 'dev.mjs')],
    {
      cwd: repositoryRoot,
      detached: false,
      env: {
        ...environment,
        TOKENTRAIL_TEST_DEBUG_PORT: String(debuggingPort),
        TOKENTRAIL_TEST_FIXTURE_SCENARIO: fixtureScenario,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  // Retain only the last 16 KiB of local orchestrator output.
  for (const stream of [developmentProcess.stdout, developmentProcess.stderr]) {
    stream?.on('data', (chunk: Buffer) => {
      output = `${output}${chunk.toString('utf8')}`.slice(-16_384);
    });
  }

  // Retain bounded cleanup for the exact orchestrator process and all children it owns.
  const stopDevelopmentProcess = async () => {
    // Return immediately when the npm leader already completed ordinary cleanup.
    if (developmentProcess.exitCode !== null) return;

    // Ask the exact development orchestrator to run its registered owned-child shutdown path.
    developmentProcess.kill('SIGTERM');

    // Wait briefly for the orchestrator to perform its owned-child cleanup.
    await Promise.race([
      new Promise<void>((resolve) => developmentProcess.once('exit', () => resolve())),
      new Promise<void>((resolve) => setTimeout(resolve, 5_000)),
    ]);
  };

  try {
    // Connect to the exact development Electron instance.
    const browser = await connectToDevelopmentChromium(
      debuggingPort,
      developmentProcess,
      () => output,
    );

    // Resolve Electron's default browser context and its application window.
    const context = browser.contexts()[0];
    if (context === undefined) {
      await browser.close();
      throw new Error('Development Electron did not create a browser context.');
    }

    // Reuse the current page or wait for the renderer window.
    const page = context.pages()[0] ?? (await context.waitForEvent('page'));

    // Return the real page and complete owned cleanup.
    return {
      page,
      close: async () => {
        // Detach the CDP test client before stopping the exact development orchestrator.
        await Promise.race([
          browser.close().catch(() => undefined),
          new Promise<void>((resolve) => setTimeout(resolve, 2_000)),
        ]);

        // Stop the exact script that owns both Vite watchers, the Vite server, and Electron.
        await stopDevelopmentProcess();
      },
    };
  } catch (error) {
    // Stop the complete development group before returning a startup failure.
    await stopDevelopmentProcess();
    throw error;
  }
}
