// Import the stable public error category used to classify sanitized failures.
import type { ApplicationErrorCategory } from '../../shared/contracts/application-error';

// Import the public snapshot validator and honest initial state factory.
import {
  createLoadingOverviewSnapshot,
  overviewSnapshotSchema,
  type OverviewSnapshot,
} from '../../shared/contracts/overview-snapshot';

// Import the owned Codex process client and its categorized local error.
import { CodexProcessClient, CodexProcessError } from '../codex/codex-process-client';

// Import closed method names so the controller's test seam cannot widen transport authority.
import type {
  ApprovedCodexNotificationMethod,
  ApprovedCodexRequestMethod,
} from '../codex/approved-methods';

// Import normalization that prevents raw protocol objects from reaching application state.
import {
  createSuccessfulOverviewSnapshot,
  normalizeOverviewData,
} from '../codex/normalize-overview';

// Import Phase 3 usage and credits normalization for the approved aggregate-usage read.
import { normalizeCreditsData, normalizeUsageData } from '../codex/normalize-usage';

// Import runtime schemas for the approved reads and sparse update notification.
import {
  accountReadResultSchema,
  accountUsageReadResultSchema,
  rateLimitsReadResultSchema,
  rateLimitsUpdatedParamsSchema,
} from '../codex/protocol-schemas';
import type { AccountUsageReadResult } from '../codex/protocol-schemas';

// Import session-observation derivation so in-memory deltas are computed once, in shared code.
import { deriveSessionDeltas } from '../../shared/domain/session-deltas';
import type { SessionObservation } from '../../shared/contracts/session-observation';

// Describe a constructor seam used by deterministic fixture tests without widening production methods.
// Describe only the client capabilities the controller owns, allowing deterministic in-memory lifecycle tests.
export interface OverviewProcessClient {
  // Initialize one connection before reads.
  start(): Promise<void>;
  // Request only a method from the existing central allowlist.
  request(method: ApprovedCodexRequestMethod, params: unknown): Promise<unknown>;
  // Subscribe only to an independently approved notification.
  onNotification(
    method: ApprovedCodexNotificationMethod,
    listener: (params: unknown) => void,
  ): () => void;
  // Stop only resources owned by this client.
  stop(): void;
}

export interface OverviewControllerOptions {
  // Create one owned client per connection attempt.
  readonly createClient?: () => OverviewProcessClient;
  // Supply a deterministic local clock in unit tests.
  readonly now?: () => Date;
}

// Bound repeated failed process starts so a broken installation cannot create a restart loop.
const MAXIMUM_CONSECUTIVE_RESTARTS = 3;

// Bound exponential restart delay while keeping a later manual recovery practical.
const MAXIMUM_RESTART_DELAY_MILLISECONDS = 30_000;

/** Own the in-memory Overview snapshot and deduplicate all refresh work. */
export class OverviewController {
  // Retain the immutable process-client factory.
  readonly #createClient: () => OverviewProcessClient;

  // Retain a local clock seam without accepting time from the renderer.
  readonly #now: () => Date;

  // Retain normalized snapshot listeners owned by IPC registration.
  readonly #listeners = new Set<(snapshot: OverviewSnapshot) => void>();

  // Start with no fabricated data and no claimed refresh attempt.
  #snapshot: OverviewSnapshot = createLoadingOverviewSnapshot(null);

  // Retain the exact active process client for reads and shutdown.
  #client: OverviewProcessClient | null = null;

  // Retain the in-memory first valid snapshot of this process as the session-delta baseline.
  #sessionBaseline: OverviewSnapshot | null = null;

  // Count valid snapshots observed since process open without persisting any snapshot body.
  #validSnapshotCount = 0;

  // Retain one in-flight refresh so simultaneous UI calls share the same operation.
  #inFlightRefresh: Promise<OverviewSnapshot> | null = null;

  // Retain notification cleanup separately from the process handle.
  #removeRateLimitNotification: (() => void) | null = null;

  // Track consecutive failed connection lifecycles for bounded backoff.
  #consecutiveFailures = 0;

  // Record the earliest local time another restart may begin.
  #nextRestartAtMilliseconds = 0;

  // Prevent new lifecycle work after application shutdown begins.
  #isStopped = false;

  // Construct the controller without starting I/O, allowing IPC to register first.
  public constructor(options: OverviewControllerOptions = {}) {
    this.#createClient = options.createClient ?? (() => new CodexProcessClient());
    this.#now = options.now ?? (() => new Date());
  }

  // Return the immutable current normalized snapshot without triggering work.
  public getSnapshot(): OverviewSnapshot {
    return this.#snapshot;
  }

  // Subscribe to complete safe snapshots and return idempotent cleanup.
  public subscribe(listener: (snapshot: OverviewSnapshot) => void): () => void {
    // Retain the exact listener reference for later removal.
    this.#listeners.add(listener);

    // Return cleanup that removes only this callback.
    return () => this.#listeners.delete(listener);
  }

  // Begin one deduplicated refresh and return its resulting safe state.
  public refresh(): Promise<OverviewSnapshot> {
    // Return the existing work so repeated clicks cannot create process or request pressure.
    if (this.#inFlightRefresh !== null) {
      return this.#inFlightRefresh;
    }

    // Refuse lifecycle work after stop while preserving the last visible snapshot.
    if (this.#isStopped) {
      return Promise.resolve(this.#snapshot);
    }

    // Respect bounded restart backoff after failures.
    if (this.#now().getTime() < this.#nextRestartAtMilliseconds) {
      return Promise.resolve(this.#snapshot);
    }

    // After the circuit-breaker cooldown, permit exactly one recovery attempt instead of locking the app forever.
    if (this.#consecutiveFailures >= MAXIMUM_CONSECUTIVE_RESTARTS) {
      this.#consecutiveFailures = MAXIMUM_CONSECUTIVE_RESTARTS - 1;
    }

    // Start the private refresh and clear its deduplication slot after either outcome.
    this.#inFlightRefresh = this.#performRefresh().finally(() => {
      this.#inFlightRefresh = null;
    });

    // Return the shared in-flight promise.
    return this.#inFlightRefresh;
  }

  // Stop subscriptions, timers, and only the exact process client this controller owns.
  public stop(): void {
    // Make repeated Electron shutdown events harmless.
    if (this.#isStopped) {
      return;
    }

    // Prevent new refresh work before stopping the process.
    this.#isStopped = true;

    // Remove the exact notification listener when present.
    this.#removeRateLimitNotification?.();
    this.#removeRateLimitNotification = null;

    // Stop only the retained owned process client.
    this.#client?.stop();
    this.#client = null;

    // Release renderer listeners after the application begins shutdown.
    this.#listeners.clear();
  }

  // Perform one complete account and quota refresh inside the privileged boundary.
  async #performRefresh(): Promise<OverviewSnapshot> {
    // Record the attempt locally before external I/O.
    const attemptedAt = this.#now().toISOString();

    // Preserve valid prior data during refresh; show loading only before the first successful snapshot.
    if (this.#snapshot.lastSuccessfulRefreshAt === null) {
      this.#setSnapshot(createLoadingOverviewSnapshot(attemptedAt));
    } else {
      this.#setSnapshot(
        overviewSnapshotSchema.parse({
          ...this.#snapshot,
          refreshAttemptedAt: attemptedAt,
          errorCategory: null,
        }),
      );
    }

    try {
      // Start and initialize an owned client only when no compatible connection exists.
      const client = await this.#getOrStartClient();

      // Request account state without asking Codex to refresh credentials.
      const accountResultUnknown = await client.request('account/read', { refreshToken: false });

      // Validate and strip the account response before issuing the quota read.
      const accountResult = accountReadResultSchema.parse(accountResultUnknown);

      // Avoid a quota request when Codex explicitly reports no account.
      if (accountResult.account === null) {
        const signedOutSnapshot = createSuccessfulOverviewSnapshot(
          normalizeOverviewData(accountResult, {
            rateLimits: null,
            rateLimitsByLimitId: null,
          }),
          this.#now().toISOString(),
        );
        this.#recordSuccess(signedOutSnapshot);
        return signedOutSnapshot;
      }

      // Request only the approved current account rate-limit snapshot.
      const rateLimitsResultUnknown = await client.request('account/rateLimits/read', undefined);

      // Validate and strip the raw response before normalization.
      const rateLimitsResult = rateLimitsReadResultSchema.parse(rateLimitsResultUnknown);

      // Request the approved aggregate-usage read; a failure here must not erase quota data.
      let usageResult: AccountUsageReadResult | null = null;
      let usageReadFailed = false;
      try {
        const usageResultUnknown = await client.request('account/usage/read', undefined);
        usageResult = accountUsageReadResultSchema.parse(usageResultUnknown);
      } catch {
        // Keep the usage section explicitly unavailable while retaining valid quota data.
        usageResult = null;
        usageReadFailed = true;
      }

      // Convert validated protocol input into the renderer-safe domain at one boundary.
      const nowDate = this.#now();
      const normalizedBase = normalizeOverviewData(accountResult, rateLimitsResult);
      const { usage } = normalizeUsageData(usageResult);
      const credits = normalizeCreditsData(rateLimitsResult, Math.floor(nowDate.getTime() / 1_000));
      const successfulSnapshot = createSuccessfulOverviewSnapshot(
        { ...normalizedBase, usage, credits },
        nowDate.toISOString(),
      );

      // A failed endpoint marks the whole snapshot partial without erasing successful sections.
      const snapshotWithEndpointState =
        usageReadFailed && successfulSnapshot.state === 'ready'
          ? overviewSnapshotSchema.parse({ ...successfulSnapshot, state: 'partial' })
          : successfulSnapshot;

      // Derive in-memory session deltas against the process baseline before publishing.
      const observation = this.#buildSessionObservation(snapshotWithEndpointState);
      const snapshotWithObservation = overviewSnapshotSchema.parse({
        ...snapshotWithEndpointState,
        sessionObservation: observation,
      });

      // Store, broadcast, and return the successful normalized snapshot.
      this.#recordSuccess(snapshotWithObservation);
      return snapshotWithObservation;
    } catch (error) {
      // Convert Zod, process, timeout, and other internal failures into a closed safe category.
      const category = this.#categorizeError(error);

      // Tear down a failed connection so a later bounded attempt starts from known state.
      this.#removeRateLimitNotification?.();
      this.#removeRateLimitNotification = null;
      this.#client?.stop();
      this.#client = null;

      // Increase the bounded failure count and calculate capped exponential backoff.
      this.#consecutiveFailures = Math.min(
        this.#consecutiveFailures + 1,
        MAXIMUM_CONSECUTIVE_RESTARTS,
      );
      const delayMilliseconds =
        this.#consecutiveFailures >= MAXIMUM_CONSECUTIVE_RESTARTS
          ? MAXIMUM_RESTART_DELAY_MILLISECONDS
          : Math.min(
              1_000 * 2 ** (this.#consecutiveFailures - 1),
              MAXIMUM_RESTART_DELAY_MILLISECONDS,
            );
      this.#nextRestartAtMilliseconds = this.#now().getTime() + delayMilliseconds;

      // Preserve a previous valid snapshot as stale instead of erasing useful information.
      const failureState: OverviewSnapshot['state'] =
        this.#snapshot.lastSuccessfulRefreshAt !== null
          ? 'stale'
          : category === 'codex-incompatible'
            ? 'unsupported'
            : category === 'codex-not-found' || category === 'codex-unavailable'
              ? 'unavailable'
              : 'error';

      // Validate the sanitized failure snapshot before storage and broadcast.
      const failedSnapshot = overviewSnapshotSchema.parse({
        ...this.#snapshot,
        state: failureState,
        refreshAttemptedAt: attemptedAt,
        errorCategory: category,
      });
      this.#setSnapshot(failedSnapshot);
      return failedSnapshot;
    }
  }

  // Return a compatible active client or start exactly one new owned process.
  async #getOrStartClient(): Promise<OverviewProcessClient> {
    // Reuse the initialized connection for steady-state refreshes.
    if (this.#client !== null) {
      return this.#client;
    }

    // Enforce the restart budget for automatic or repeated calls in one failure run.
    if (this.#consecutiveFailures >= MAXIMUM_CONSECUTIVE_RESTARTS) {
      throw new CodexProcessError('codex-unavailable');
    }

    // Create and retain one client before starting so shutdown can still own it during initialization.
    const client = this.#createClient();
    this.#client = client;
    await client.start();

    // Treat sparse update notifications as a trigger for a full approved read because merge completeness is
    // uncertain across versions; malformed update input is ignored and cannot mutate the current snapshot.
    this.#removeRateLimitNotification = client.onNotification(
      'account/rateLimits/updated',
      (params) => {
        if (rateLimitsUpdatedParamsSchema.safeParse(params).success) {
          void this.refresh();
        }
      },
    );

    // Return only after initialization and subscription setup complete.
    return client;
  }

  // Store a successful snapshot and reset connection failure backoff.
  #recordSuccess(snapshot: OverviewSnapshot): void {
    // Clear the failure run only after a complete approved request cycle succeeds.
    this.#consecutiveFailures = 0;
    this.#nextRestartAtMilliseconds = 0;
    this.#setSnapshot(snapshot);
  }

  // Derive the in-memory session observation and advance baselines for this process lifetime only.
  #buildSessionObservation(current: OverviewSnapshot): SessionObservation {
    // Establish the baseline at the first valid snapshot without persisting anything.
    if (this.#sessionBaseline === null) {
      this.#sessionBaseline = current;
      this.#validSnapshotCount = 1;
      return {
        startedAtIso: current.lastSuccessfulRefreshAt,
        validSnapshotCount: this.#validSnapshotCount,
        quotaDeltas: [],
        counterDeltas: [],
        resetTransitions: [],
      };
    }

    // Count each subsequent valid snapshot for honest observation-depth display.
    this.#validSnapshotCount += 1;

    // Derive deltas against the retained baseline using shared exact-arithmetic rules.
    const derived = deriveSessionDeltas(this.#sessionBaseline, current);

    // Rebase each reset-transitioned window so no cross-reset delta can ever be displayed later.
    let rebasedBaseline = this.#sessionBaseline;
    if (derived.resetTransitions.length > 0) {
      const transitionedIds = new Set(
        derived.resetTransitions.map(
          (transition) => `${transition.bucketId}:${transition.windowKind}`,
        ),
      );
      rebasedBaseline = overviewSnapshotSchema.parse({
        ...this.#sessionBaseline,
        quotas: this.#sessionBaseline.quotas.map((bucket) => ({
          ...bucket,
          windows: bucket.windows.filter(
            (window) => !transitionedIds.has(`${bucket.id}:${window.kind}`),
          ),
        })),
      });
    }

    // Retain the possibly rebased baseline in memory only; it clears when the process exits.
    this.#sessionBaseline = rebasedBaseline;

    // Return the immutable observation attached to the outgoing snapshot response.
    return {
      startedAtIso: this.#sessionBaseline.lastSuccessfulRefreshAt,
      validSnapshotCount: this.#validSnapshotCount,
      quotaDeltas: [...derived.quotaDeltas],
      counterDeltas: [...derived.counterDeltas],
      resetTransitions: [...derived.resetTransitions],
    };
  }

  // Validate, store, and broadcast one complete snapshot.
  #setSnapshot(snapshot: OverviewSnapshot): void {
    // Parse again at the storage boundary so internal refactors cannot introduce extra fields.
    this.#snapshot = overviewSnapshotSchema.parse(snapshot);

    // Notify each listener with the same immutable logical snapshot.
    for (const listener of this.#listeners) {
      listener(this.#snapshot);
    }
  }

  // Convert unknown internal failures into stable renderer-safe categories.
  #categorizeError(error: unknown): ApplicationErrorCategory {
    // Preserve only the already closed category from the process client.
    if (error instanceof CodexProcessError) {
      return error.category;
    }

    // Treat all schema and unexpected errors as invalid responses without exposing their messages.
    return 'invalid-response';
  }
}
