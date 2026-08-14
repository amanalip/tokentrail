// Import child-process primitives so Token Trail can own one shell-free Codex app-server process.
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';

// Import executable access checks for trusted PATH discovery without invoking a shell.
import { access } from 'node:fs/promises';

// Import platform path handling for absolute executable resolution.
import path from 'node:path';

// Import the stable public error category type without carrying raw exceptions across boundaries.
import type { ApplicationErrorCategory } from '../../shared/contracts/application-error';

// Import the request and notification allowlists enforced before protocol serialization.
import {
  isApprovedCodexNotificationMethod,
  isApprovedCodexRequestMethod,
  type ApprovedCodexNotificationMethod,
  type ApprovedCodexRequestMethod,
} from './approved-methods';

// Import centralized message and timeout limits.
import { CODEX_PROTOCOL_LIMITS } from './protocol-limits';

// Import the shape-independent post-JSON limit walk.
import { isProtocolValueWithinLimits } from './protocol-value';

// Import the narrow initialization schema so compatibility is established before account reads.
import { initializationResultSchema } from './protocol-schemas';

// Describe one sanitized adapter failure that privileged orchestration may classify without logging its cause.
export class CodexProcessError extends Error {
  // Store only a closed public category on the error instance.
  public readonly category: ApplicationErrorCategory;

  // Construct an internal error with fixed local text rather than upstream stderr or payload content.
  public constructor(category: ApplicationErrorCategory) {
    // Use the category itself as the safe internal message.
    super(category);
    // Give stack traces a stable local class name during development.
    this.name = 'CodexProcessError';
    // Retain the safe category for controller state selection.
    this.category = category;
  }
}

// Describe a fully correlated JSON response retained only until its matching request settles.
interface PendingRequest {
  // Resolve with the unknown bounded result for version-specific schema validation.
  readonly resolve: (result: unknown) => void;
  // Reject with one local sanitized error.
  readonly reject: (error: CodexProcessError) => void;
  // Cancel the exact request timeout during response, exit, or shutdown handling.
  readonly timeout: NodeJS.Timeout;
}

// Describe the only construction overrides used by checked-in fixture tests.
export interface CodexProcessClientOptions {
  // Use an already resolved absolute executable path; production discovers `codex` from trusted PATH entries.
  readonly executablePath?: string;
  // Use a fixed argument list; production always selects `app-server --stdio`.
  readonly argumentsList?: readonly string[];
  // Supply an allowlisted environment; production creates one from known required variable names.
  readonly environment?: Readonly<NodeJS.ProcessEnv>;
}

// Name non-secret environment variables required for executable discovery, local authentication storage, locale,
// certificate discovery, and temporary runtime behavior.
const ALLOWED_CODEX_ENVIRONMENT_NAMES = Object.freeze([
  'PATH',
  'HOME',
  'CODEX_HOME',
  'XDG_CONFIG_HOME',
  'XDG_DATA_HOME',
  'XDG_CACHE_HOME',
  'TMPDIR',
  'LANG',
  'LC_ALL',
  'SSL_CERT_FILE',
  'SSL_CERT_DIR',
] as const);

// Copy only reviewed environment keys and never log their values.
export function createCodexEnvironment(
  source: Readonly<NodeJS.ProcessEnv>,
): Readonly<NodeJS.ProcessEnv> {
  // Start from no inherited environment so unrelated credentials cannot reach the child automatically.
  const environment: NodeJS.ProcessEnv = {};

  // Copy each known key only when the parent actually defines it.
  for (const name of ALLOWED_CODEX_ENVIRONMENT_NAMES) {
    const value = source[name];
    if (value !== undefined) {
      environment[name] = value;
    }
  }

  // Freeze the reviewed environment map before process creation.
  return Object.freeze(environment);
}

/** Resolve the Codex executable from explicit PATH directories without shell parsing or command substitution. */
export async function resolveCodexExecutable(
  pathValue: string | undefined,
): Promise<string | null> {
  // Reject a missing PATH instead of falling back to a shell or current directory search.
  if (!pathValue) {
    return null;
  }

  // Choose platform executable suffixes explicitly while keeping Unix discovery minimal.
  const executableNames = process.platform === 'win32' ? ['codex.exe', 'codex.cmd'] : ['codex'];

  // Inspect at most 128 absolute PATH entries to bound filesystem work and exclude relative directories.
  const directories = pathValue.split(path.delimiter).filter(path.isAbsolute).slice(0, 128);

  // Return the first executable file accepted by the operating system.
  for (const directory of directories) {
    for (const executableName of executableNames) {
      const candidate = path.join(directory, executableName);

      try {
        // Require executable permission on Unix and existence on Windows.
        await access(candidate, process.platform === 'win32' ? undefined : 1);
        return candidate;
      } catch {
        // Continue to the next trusted PATH candidate without exposing machine paths in an error.
      }
    }
  }

  // Report absence through a safe null result for controller classification.
  return null;
}

/** Own one bounded newline-delimited Codex app-server connection. */
export class CodexProcessClient {
  // Retain immutable construction options for one process lifecycle.
  readonly #options: CodexProcessClientOptions;

  // Retain the exact owned process handle so shutdown cannot target any unrelated process.
  #child: ChildProcessWithoutNullStreams | null = null;

  // Correlate safe integer IDs with bounded outstanding requests.
  readonly #pendingRequests = new Map<number, PendingRequest>();

  // Retain notification listeners by their independently approved inbound method.
  readonly #notificationListeners = new Map<
    ApprovedCodexNotificationMethod,
    Set<(params: unknown) => void>
  >();

  // Accumulate only an incomplete stdout line and never raw stderr.
  #stdoutBuffer = Buffer.alloc(0);

  // Increment IDs locally so renderer or protocol input can never choose a correlation identifier.
  #nextRequestId = 1;

  // Prevent work after explicit shutdown or fatal protocol failure.
  #isStopped = false;

  // Construct a client without starting external work until `start` is called.
  public constructor(options: CodexProcessClientOptions = {}) {
    this.#options = Object.freeze({ ...options });
  }

  // Start and initialize the one owned app-server process.
  public async start(): Promise<void> {
    // Reject duplicate or post-stop starts so lifecycle ownership remains unambiguous.
    if (this.#child !== null || this.#isStopped) {
      throw new CodexProcessError('internal-error');
    }

    // Use an injected absolute fixture executable only when a caller supplied one explicitly.
    const executablePath =
      this.#options.executablePath ?? (await resolveCodexExecutable(process.env['PATH']));

    // Convert discovery failure into a stable user-actionable category.
    if (executablePath === null) {
      throw new CodexProcessError('codex-not-found');
    }

    // Use the fixed production arguments unless a test-only constructor override is present.
    const argumentsList = this.#options.argumentsList ?? ['app-server', '--stdio'];

    // Use an explicit environment map so the child does not inherit unrelated parent secrets.
    const environment = this.#options.environment ?? createCodexEnvironment(process.env);

    // Start without a shell, with bounded owned pipes, and with no platform console window.
    const child = spawn(executablePath, [...argumentsList], {
      shell: false,
      windowsHide: true,
      env: environment,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Retain the handle before asynchronous events can report output or exit.
    this.#child = child;

    // Parse only complete bounded protocol messages from standard output.
    child.stdout.on('data', (chunk: Buffer) => this.#handleStdoutChunk(chunk));

    // Drain and discard stderr because it may contain paths, identifiers, or other sensitive diagnostics.
    child.stderr.on('data', () => undefined);

    // Convert process creation failure into an unavailable state without retaining the raw operating-system error.
    child.once('error', () => this.#failConnection('codex-unavailable'));

    // Reject pending work and stop using the connection when the owned child exits.
    child.once('exit', () => this.#failConnection('codex-unavailable'));

    // Complete the required protocol handshake before permitting account reads.
    const initializationResult = await this.request(
      'initialize',
      {
        clientInfo: { name: 'tokentrail', title: 'Token Trail', version: '0.2.0' },
        capabilities: {
          experimentalApi: true,
          requestAttestation: false,
          optOutNotificationMethods: null,
        },
      },
      CODEX_PROTOCOL_LIMITS.initializationTimeoutMilliseconds,
    );

    // Reject a structurally incompatible server before announcing initialized state.
    if (!initializationResultSchema.safeParse(initializationResult).success) {
      this.#failConnection('codex-incompatible');
      throw new CodexProcessError('codex-incompatible');
    }

    // Notify the server that initialization is complete using the one fixed protocol notification.
    this.#writeProtocolValue({ method: 'initialized' });
  }

  // Send one approved request and correlate its bounded response.
  public request(
    method: ApprovedCodexRequestMethod,
    params: unknown,
    timeoutMilliseconds: number = CODEX_PROTOCOL_LIMITS.requestTimeoutMilliseconds,
  ): Promise<unknown> {
    // Re-check the runtime value even though TypeScript restricts trusted callers at compile time.
    if (!isApprovedCodexRequestMethod(method)) {
      return Promise.reject(new CodexProcessError('permission-denied'));
    }

    // Reject unavailable lifecycle states before allocating a pending request.
    if (this.#child === null || this.#isStopped) {
      return Promise.reject(new CodexProcessError('codex-unavailable'));
    }

    // Allocate a monotonically increasing safe integer correlation ID.
    const id = this.#nextRequestId;
    this.#nextRequestId += 1;

    // Stop before precision loss could make two outstanding IDs collide.
    if (!Number.isSafeInteger(this.#nextRequestId)) {
      return Promise.reject(new CodexProcessError('internal-error'));
    }

    // Create the response promise before writing so an immediate fixture response cannot race registration.
    const responsePromise = new Promise<unknown>((resolve, reject) => {
      // Reject one stalled request without terminating unrelated validated state.
      const timeout = setTimeout(() => {
        this.#pendingRequests.delete(id);
        reject(new CodexProcessError('request-timeout'));
      }, timeoutMilliseconds);

      // Retain only closures and timer state, never a copy of the request payload.
      this.#pendingRequests.set(id, {
        resolve,
        reject: (error) => reject(error),
        timeout,
      });
    });

    try {
      // Serialize only after approval and pending registration succeed.
      this.#writeProtocolValue(params === undefined ? { id, method } : { id, method, params });
    } catch {
      // Clear and reject the exact request if bounded serialization or pipe writing fails.
      const pendingRequest = this.#pendingRequests.get(id);
      if (pendingRequest) {
        clearTimeout(pendingRequest.timeout);
        this.#pendingRequests.delete(id);
        pendingRequest.reject(new CodexProcessError('codex-unavailable'));
      }
    }

    // Return the correlated unknown result for version-specific runtime validation.
    return responsePromise;
  }

  // Subscribe to one approved notification without broad event forwarding.
  public onNotification(
    method: ApprovedCodexNotificationMethod,
    listener: (params: unknown) => void,
  ): () => void {
    // Re-check the exact inbound method at runtime before retaining the callback.
    if (!isApprovedCodexNotificationMethod(method)) {
      return () => undefined;
    }

    // Create one listener set per approved method.
    const listeners = this.#notificationListeners.get(method) ?? new Set();
    listeners.add(listener);
    this.#notificationListeners.set(method, listeners);

    // Return idempotent cleanup bound to the exact method and callback.
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.#notificationListeners.delete(method);
      }
    };
  }

  // Stop only the process created by this client and settle all outstanding work.
  public stop(): void {
    // Make repeated cleanup harmless.
    if (this.#isStopped) {
      return;
    }

    // Prevent new writes before signaling the owned handle.
    this.#isStopped = true;

    // Ask the exact owned process to terminate gracefully when it is still running.
    if (this.#child !== null && this.#child.exitCode === null && this.#child.signalCode === null) {
      this.#child.kill('SIGTERM');
    }

    // Reject every unresolved request with a safe local category.
    this.#rejectAllPending('codex-unavailable');

    // Release listeners and the process reference for garbage collection.
    this.#notificationListeners.clear();
    this.#child = null;
  }

  // Serialize and write one bounded application-owned protocol value.
  #writeProtocolValue(value: unknown): void {
    // Reject internal construction mistakes before serialization.
    if (!isProtocolValueWithinLimits(value)) {
      throw new CodexProcessError('internal-error');
    }

    // Serialize one compact line; outbound values contain no bigint or caller-controlled method.
    const serializedValue = JSON.stringify(value);

    // Enforce the same byte ceiling used for inbound protocol messages.
    if (Buffer.byteLength(serializedValue, 'utf8') > CODEX_PROTOCOL_LIMITS.maximumMessageBytes) {
      throw new CodexProcessError('internal-error');
    }

    // Require a live writable owned pipe before emitting the complete newline-delimited value.
    if (this.#child === null || !this.#child.stdin.writable) {
      throw new CodexProcessError('codex-unavailable');
    }

    // Write one framed message without a shell, interpolation, or raw diagnostic copy.
    this.#child.stdin.write(`${serializedValue}\n`);
  }

  // Add one stdout chunk and dispatch every complete bounded line.
  #handleStdoutChunk(chunk: Buffer): void {
    // Ignore output after shutdown or a previous fatal protocol failure.
    if (this.#isStopped) {
      return;
    }

    // Append only up to the maximum line plus delimiter; larger incomplete input is a fatal invalid response.
    this.#stdoutBuffer = Buffer.concat([this.#stdoutBuffer, chunk]);
    if (this.#stdoutBuffer.length > CODEX_PROTOCOL_LIMITS.maximumMessageBytes + 1) {
      this.#failConnection('invalid-response');
      return;
    }

    // Process all complete newline-delimited values in the current buffer.
    let delimiterIndex = this.#stdoutBuffer.indexOf(10);
    while (delimiterIndex >= 0) {
      // Slice one message without its newline delimiter.
      const line = this.#stdoutBuffer.subarray(0, delimiterIndex);
      // Retain only bytes after the processed delimiter.
      this.#stdoutBuffer = this.#stdoutBuffer.subarray(delimiterIndex + 1);

      // Reject empty or oversized protocol lines.
      if (line.length === 0 || line.length > CODEX_PROTOCOL_LIMITS.maximumMessageBytes) {
        this.#failConnection('invalid-response');
        return;
      }

      // Parse and dispatch the complete line without ever logging it.
      this.#handleProtocolLine(line.toString('utf8'));

      // Locate the next delimiter in the reduced buffer.
      delimiterIndex = this.#stdoutBuffer.indexOf(10);
    }
  }

  // Parse one complete protocol line and route only correlated responses or approved notifications.
  #handleProtocolLine(line: string): void {
    // Hold parsed input as unknown until generic and message-specific checks succeed.
    let value: unknown;

    try {
      value = JSON.parse(line) as unknown;
    } catch {
      this.#failConnection('invalid-response');
      return;
    }

    // Reject generically oversized or non-JSON-shaped values before property access.
    if (!isProtocolValueWithinLimits(value) || value === null || typeof value !== 'object') {
      this.#failConnection('invalid-response');
      return;
    }

    // Use a narrow record view only after the object check.
    const message = value as Record<string, unknown>;

    // Route safe-integer response IDs only to an existing pending request.
    if (typeof message['id'] === 'number' && Number.isSafeInteger(message['id'])) {
      const id = message['id'];
      const pendingRequest = this.#pendingRequests.get(id);

      // Ignore unknown or already timed-out response IDs without creating state.
      if (!pendingRequest) {
        return;
      }

      // Settle the request exactly once.
      clearTimeout(pendingRequest.timeout);
      this.#pendingRequests.delete(id);

      // Convert any upstream error object into a stable compatibility category.
      if ('error' in message) {
        pendingRequest.reject(new CodexProcessError('codex-incompatible'));
        return;
      }

      // Require an explicit result key even when the approved result itself is null.
      if (!('result' in message)) {
        pendingRequest.reject(new CodexProcessError('invalid-response'));
        return;
      }

      // Pass only the bounded unknown result to the caller's Zod schema.
      pendingRequest.resolve(message['result']);
      return;
    }

    // Route only exact approved notification methods and never generic server events.
    if (isApprovedCodexNotificationMethod(message['method'])) {
      const listeners = this.#notificationListeners.get(message['method']);
      if (listeners) {
        for (const listener of listeners) {
          listener(message['params']);
        }
      }
    }
  }

  // Fail the connection once, reject requests, and stop the exact owned process.
  #failConnection(category: ApplicationErrorCategory): void {
    // Ignore repeated exit, error, and parser events after the first failure.
    if (this.#isStopped) {
      return;
    }

    // Lock the failed state before signaling the child.
    this.#isStopped = true;

    // Reject all requests with one safe classification.
    this.#rejectAllPending(category);

    // Terminate only the retained owned handle when it is still active.
    if (this.#child !== null && this.#child.exitCode === null && this.#child.signalCode === null) {
      this.#child.kill('SIGTERM');
    }

    // Release the handle and notification callbacks after failure.
    this.#child = null;
    this.#notificationListeners.clear();
  }

  // Reject and clear every outstanding request without exposing method, params, or raw server details.
  #rejectAllPending(category: ApplicationErrorCategory): void {
    // Settle each retained promise and cancel its timer.
    for (const pendingRequest of this.#pendingRequests.values()) {
      clearTimeout(pendingRequest.timeout);
      pendingRequest.reject(new CodexProcessError(category));
    }

    // Remove every settled correlation entry.
    this.#pendingRequests.clear();
  }
}
