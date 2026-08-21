// Import Vitest grouping and assertion helpers.
import { describe, expect, it } from 'vitest';

// Import the recorder under test.
import { DiagnosticsHealthRecorder } from './health-record';

// Import the loading factory so every observed snapshot is schema-valid without hand-building sections.
import {
  createLoadingOverviewSnapshot,
  overviewSnapshotSchema,
} from '../../shared/contracts/overview-snapshot';

// Build one schema-valid snapshot with the requested state and attempt marker.
function createSnapshot(state: string, attemptedAt: string) {
  // Start from the honest loading factory so every section exists with valid defaults.
  const base = createLoadingOverviewSnapshot('2026-08-14T07:00:00.000Z');
  return overviewSnapshotSchema.parse({
    ...base,
    state,
    refreshAttemptedAt: attemptedAt,
  });
}

// Group behavior around sanitized local health counters.
describe('DiagnosticsHealthRecorder', () => {
  it('starts at reviewed neutral defaults before any observation', () => {
    const recorder = new DiagnosticsHealthRecorder();
    expect(recorder.toSection()).toEqual({
      refreshAttemptCount: 0,
      refreshSuccessCount: 0,
      refreshFailureCount: 0,
      refreshNoDataCount: 0,
      lastRefreshOutcome: 'none',
      lastRefreshDurationBucket: 'not-measured',
    });
  });

  it('counts each distinct attempt once and classifies outcomes through the state machine', () => {
    const recorder = new DiagnosticsHealthRecorder();

    // One successful read, one replayed broadcast of the same attempt, then one failure.
    recorder.observeSnapshot(createSnapshot('ready', '2026-08-14T07:00:01.000Z'));
    recorder.observeSnapshot(createSnapshot('ready', '2026-08-14T07:00:01.000Z'));
    recorder.observeSnapshot(createSnapshot('stale', '2026-08-14T07:00:02.000Z'));

    expect(recorder.toSection()).toMatchObject({
      refreshAttemptCount: 2,
      refreshSuccessCount: 1,
      refreshFailureCount: 1,
      refreshNoDataCount: 0,
      lastRefreshOutcome: 'failed',
    });
  });

  it('records signed-out and unsupported reads as no-data rather than failures', () => {
    const recorder = new DiagnosticsHealthRecorder();
    recorder.observeSnapshot(createSnapshot('signed-out', '2026-08-14T07:00:01.000Z'));
    recorder.observeSnapshot(createSnapshot('unsupported', '2026-08-14T07:00:02.000Z'));

    expect(recorder.toSection()).toMatchObject({
      refreshAttemptCount: 2,
      refreshSuccessCount: 0,
      refreshFailureCount: 0,
      refreshNoDataCount: 2,
      lastRefreshOutcome: 'no-data',
    });
  });

  it('coarsens measured durations into bounded buckets without retaining exact values', () => {
    const recorder = new DiagnosticsHealthRecorder();
    recorder.observeRefreshDuration(120);
    expect(recorder.toSection().lastRefreshDurationBucket).toBe('under-250ms');

    recorder.observeRefreshDuration(900);
    expect(recorder.toSection().lastRefreshDurationBucket).toBe('250ms-to-1s');

    recorder.observeRefreshDuration(2_500);
    expect(recorder.toSection().lastRefreshDurationBucket).toBe('1s-to-3s');

    recorder.observeRefreshDuration(9_000);
    expect(recorder.toSection().lastRefreshDurationBucket).toBe('over-3s');

    // Nonsensical measurements fall back to the honest not-measured bucket.
    recorder.observeRefreshDuration(Number.NaN);
    expect(recorder.toSection().lastRefreshDurationBucket).toBe('not-measured');
  });
});
