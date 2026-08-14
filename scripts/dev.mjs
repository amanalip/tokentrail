// Import filesystem access only in the development orchestrator so it can wait for Vite's first bundles.
import { access } from 'node:fs/promises';

// Import process spawning to run the three Vite processes and Electron without adding orchestration packages.
import { spawn } from 'node:child_process';

// Import path helpers so every child runs against the same explicit repository root.
import path from 'node:path';

// Import URL conversion to locate the repository from this script instead of trusting the caller's directory.
import { fileURLToPath } from 'node:url';

// Resolve the repository root from the checked-in script location.
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Keep all child processes in one set so signal and failure cleanup cannot leave development services behind.
const children = new Set();

// Track shutdown once so simultaneous child exits cannot perform conflicting cleanup.
let isShuttingDown = false;

/**
 * Spawn one inherited-output child process from the repository root.
 * The explicit shell-free argument array avoids accidental command interpolation.
 */
function startChild(command, argumentsList, extraEnvironment = {}) {
  // Start the child with inherited terminal streams so failures remain immediately visible.
  const child = spawn(command, argumentsList, {
    cwd: repositoryRoot,
    env: { ...process.env, ...extraEnvironment },
    stdio: 'inherit',
  });

  // Remember the child before asynchronous events can fire.
  children.add(child);

  // Remove completed children so shutdown only signals live processes.
  child.once('exit', () => {
    children.delete(child);
  });

  // Return the exact process to callers that need to observe its exit.
  return child;
}

/**
 * Stop every owned child exactly once and propagate a meaningful exit code to the calling shell.
 */
function shutdown(exitCode) {
  // Ignore repeated shutdown requests caused by related child exits or multiple signals.
  if (isShuttingDown) {
    return;
  }

  // Lock cleanup before signaling children.
  isShuttingDown = true;

  // Ask each process created by this script to terminate gracefully.
  for (const child of children) {
    child.kill('SIGTERM');
  }

  // Preserve success, child failure, or interrupted status for the developer and CI caller.
  process.exitCode = exitCode;
}

/**
 * Wait for a local file with a fixed timeout so Electron never starts against half-built process bundles.
 */
async function waitForFile(filePath, timeoutMilliseconds) {
  // Calculate one monotonic deadline for all retry attempts.
  const deadline = Date.now() + timeoutMilliseconds;

  // Retry until Vite writes the file or the bounded wait expires.
  while (Date.now() < deadline) {
    try {
      // Resolve when the file becomes accessible.
      await access(filePath);
      return;
    } catch {
      // Wait briefly without blocking the Node event loop before checking again.
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Fail clearly instead of launching Electron with a missing entry point.
  throw new Error(`Timed out waiting for development bundle: ${filePath}`);
}

/**
 * Wait for the loopback Vite server to answer while keeping all network behavior local to development.
 */
async function waitForRenderer(rendererUrl, timeoutMilliseconds) {
  // Calculate one deadline so connection failures remain bounded.
  const deadline = Date.now() + timeoutMilliseconds;

  // Poll only the exact loopback URL that Electron will load.
  while (Date.now() < deadline) {
    try {
      // Request the local entry page without following an unexpected redirect.
      const response = await fetch(rendererUrl, { redirect: 'error' });

      // Resolve only after Vite reports a successful response.
      if (response.ok) {
        return;
      }
    } catch {
      // The server is expected to reject connections briefly while it starts.
    }

    // Yield before the next bounded readiness check.
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Stop the development run rather than falling back to an unapproved URL.
  throw new Error(`Timed out waiting for renderer development server: ${rendererUrl}`);
}

// Convert the npm-installed binary directory into explicit platform-appropriate executable paths.
const binaryExtension = process.platform === 'win32' ? '.cmd' : '';
const viteBinary = path.join(repositoryRoot, 'node_modules', '.bin', `vite${binaryExtension}`);
const electronBinary = path.join(
  repositoryRoot,
  'node_modules',
  '.bin',
  `electron${binaryExtension}`,
);

// Use one fixed loopback URL that the main process validates before loading development content.
const rendererUrl = 'http://127.0.0.1:5173';

// Accept an optional test-only Chromium debugging port only when it is a valid unprivileged TCP port.
const requestedDebuggingPort = process.env['TOKENTRAIL_TEST_DEBUG_PORT'];
const debuggingPort =
  requestedDebuggingPort !== undefined && /^\d{4,5}$/u.test(requestedDebuggingPort)
    ? Number(requestedDebuggingPort)
    : null;

// Reject an out-of-range test port instead of forwarding arbitrary Chromium arguments.
if (debuggingPort !== null && (debuggingPort < 1_024 || debuggingPort > 65_535)) {
  throw new Error('TOKENTRAIL_TEST_DEBUG_PORT must be an unprivileged TCP port.');
}

// Start independent watched builds for privileged main and preload code.
const mainBuilder = startChild(viteBinary, ['build', '--watch', '--config', 'vite.main.config.ts']);
const preloadBuilder = startChild(viteBinary, [
  'build',
  '--watch',
  '--config',
  'vite.preload.config.ts',
]);

// Start the renderer development server on the fixed loopback origin.
const rendererServer = startChild(viteBinary, ['--config', 'vite.renderer.config.ts']);

// Treat an unexpected build or server exit as a failed development session.
for (const service of [mainBuilder, preloadBuilder, rendererServer]) {
  service.once('exit', (code) => {
    if (!isShuttingDown) {
      shutdown(code ?? 1);
    }
  });
}

// Register interactive shutdown before awaiting service readiness.
process.once('SIGINT', () => shutdown(130));
process.once('SIGTERM', () => shutdown(143));

try {
  // Wait until the privileged bundles and local renderer are all ready.
  await Promise.all([
    waitForFile(path.join(repositoryRoot, 'dist', 'main', 'index.cjs'), 30_000),
    waitForFile(path.join(repositoryRoot, 'dist', 'preload', 'index.cjs'), 30_000),
    waitForRenderer(rendererUrl, 30_000),
  ]);

  // Launch Electron with the one validated development origin and no renderer-visible environment bridge.
  const electronArguments =
    debuggingPort === null
      ? ['.']
      : [`--remote-debugging-port=${debuggingPort}`, '--remote-debugging-address=127.0.0.1', '.'];

  // Launch Electron with no extra switches outside the one validated test-only loopback debugging pair.
  const electronProcess = startChild(electronBinary, electronArguments, {
    TOKENTRAIL_RENDERER_URL: rendererUrl,
  });

  // End the complete development session when the user closes Electron.
  electronProcess.once('exit', (code) => shutdown(code ?? 0));
} catch (error) {
  // Report only the orchestrator failure and then clean up every process it owns.
  console.error(error);
  shutdown(1);
}
