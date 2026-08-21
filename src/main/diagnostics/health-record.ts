// Import the renderer-safe health section produced by this recorder.
import type { DiagnosticsHealthSection } from '../../shared/contracts/diagnostics';
// Import the snapshot type whose transitions are the only observed input.
import type { OverviewSnapshot } from '../../shared/contracts/overview-snapshot';

/**
 * Accumulate sanitized local health counters from snapshot transitions. The recorder observes only
 * already-normalized snapshots: it counts refresh attempts by comparing `refreshAttemptedAt` values and
 * classifies outcomes through the closed snapshot state machine. No timestamp, identifier, path, or raw
 * protocol value is retained, so the recorded document can never become an activity history.
 */
export class DiagnosticsHealthRecorder {
  // Retain the last seen attempt marker so repeated renders of one attempt count exactly once.
  #lastSeenAttemptedAt: string | null = null;

  // Keep bounded integer counters for each reviewed outcome family.
  #attemptCount = 0;
  #successCount = 0;
  #failureCount = 0;
  #noDataCount = 0;

  // Carry the most recent outcome as one closed category for support conversations.
  #lastOutcome: DiagnosticsHealthSection['lastRefreshOutcome'] = 'none';

  // Coarsen measured refresh timing into reviewed magnitude buckets; unmeasured stays explicit.
  #lastDurationBucket: DiagnosticsHealthSection['lastRefreshDurationBucket'] = 'not-measured';

  /**
   * Observe one normalized snapshot. Attempts are recognized only when `refreshAttemptedAt` advances, so
   * duplicate broadcasts of the same logical snapshot never inflate counters.
   */
  observeSnapshot(snapshot: OverviewSnapshot): void {
    // Ignore replays of an already-counted attempt.
    if (snapshot.refreshAttemptedAt === this.#lastSeenAttemptedAt) return;
    this.#lastSeenAttemptedAt = snapshot.refreshAttemptedAt;

    // Count every newly observed attempt before classifying its outcome family.
    this.#attemptCount += 1;

    // Classify through the closed state machine instead of interpreting error strings.
    if (snapshot.state === 'ready' || snapshot.state === 'partial') {
      this.#successCount += 1;
      this.#lastOutcome = 'succeeded';
      return;
    }

    // Stale and error states mean the read itself failed even though prior data may still be visible.
    if (snapshot.state === 'stale' || snapshot.state === 'error') {
      this.#failureCount += 1;
      this.#lastOutcome = 'failed';
      return;
    }

    // Signed-out, unsupported, and unavailable states completed without producing account data.
    this.#noDataCount += 1;
    this.#lastOutcome = 'no-data';
  }

  /** Record one measured refresh duration coarsened into the reviewed magnitude buckets. */
  observeRefreshDuration(durationMilliseconds: number): void {
    // Clamp nonsensical measurements to the honest not-measured bucket instead of inventing a range.
    if (!Number.isFinite(durationMilliseconds) || durationMilliseconds < 0) {
      this.#lastDurationBucket = 'not-measured';
      return;
    }

    // Select the first matching reviewed bound; no finer timing granularity is retained.
    this.#lastDurationBucket =
      durationMilliseconds < 250
        ? 'under-250ms'
        : durationMilliseconds < 1_000
          ? '250ms-to-1s'
          : durationMilliseconds < 3_000
            ? '1s-to-3s'
            : 'over-3s';
  }

  /** Build the validated health section for inclusion in one diagnostics preview. */
  toSection(): DiagnosticsHealthSection {
    // Return a frozen plain object so callers cannot mutate accumulated counters.
    return Object.freeze({
      refreshAttemptCount: this.#attemptCount,
      refreshSuccessCount: this.#successCount,
      refreshFailureCount: this.#failureCount,
      refreshNoDataCount: this.#noDataCount,
      lastRefreshOutcome: this.#lastOutcome,
      lastRefreshDurationBucket: this.#lastDurationBucket,
    });
  }
}
