// Import the validated session-observation contracts these derivations produce.
import type {
  SessionCounterDelta,
  SessionQuotaDelta,
  SessionResetTransition,
} from '../contracts/session-observation';

// Import the normalized snapshot and quota contracts that baselines and deltas compare.
import type { OverviewSnapshot, QuotaBucket } from '../contracts/overview-snapshot';

// Import exact decimal parsing so token counter subtraction never loses precision.
import { parseDecimalCounter } from './bigint-format';

// Re-export the observation factory so privileged callers have one import site for the shared model.
export { createEmptySessionObservation } from '../contracts/session-observation';

/**
 * Derive every displayable current-session delta from an in-memory baseline snapshot and the latest valid
 * snapshot. Deltas require matching stable identities and two valid endpoint values. A changed reset timestamp
 * produces a reset transition and suppresses that window's percentage delta so no cross-reset delta is ever
 * displayed. Counter decreases are surfaced as source changes, never as negative usage. All inputs come from
 * already validated snapshots; results stay in memory for the process lifetime only and are never persisted,
 * logged, or exported.
 */
export function deriveSessionDeltas(
  baseline: OverviewSnapshot,
  current: OverviewSnapshot,
): {
  readonly quotaDeltas: readonly SessionQuotaDelta[];
  readonly counterDeltas: readonly SessionCounterDelta[];
  readonly resetTransitions: readonly SessionResetTransition[];
} {
  // Compare every identified quota window between the two snapshots.
  const quotaDeltas: SessionQuotaDelta[] = [];
  const resetTransitions: SessionResetTransition[] = [];

  // Walk the current buckets so new windows appear while removed ones simply stop being compared.
  for (const currentBucket of current.quotas) {
    const baselineBucket: QuotaBucket | null =
      baseline.quotas.find((bucket) => bucket.id === currentBucket.id) ?? null;
    if (baselineBucket === null) continue;

    // Compare each supported window kind by name because kinds are closed and stable.
    for (const currentWindow of currentBucket.windows) {
      const baselineWindow = baselineBucket.windows.find(
        (window) => window.kind === currentWindow.kind,
      );
      if (baselineWindow === undefined) continue;

      // Detect a reset transition first: a changed reset timestamp starts a new comparison era.
      const baselineReset = baselineWindow.resetsAt.value;
      const currentReset = currentWindow.resetsAt.value;
      if (baselineReset !== currentReset) {
        resetTransitions.push({
          metricKind: 'quota-window-reset-transition',
          bucketId: currentBucket.id,
          bucketName: currentBucket.name,
          windowKind: currentWindow.kind,
          previousResetsAtSeconds: baselineReset,
          currentResetsAtSeconds: currentReset,
        });
        continue;
      }

      // Require two finite in-range percentages before expressing a percentage-point change.
      const baselineUsed = baselineWindow.usedPercent.value;
      const currentUsed = currentWindow.usedPercent.value;
      const isValidPercent = (value: number | null): value is number =>
        value !== null && Number.isFinite(value) && value >= 0 && value <= 100;
      if (!isValidPercent(baselineUsed) || !isValidPercent(currentUsed)) continue;

      // Round the point difference to one decimal through integer arithmetic on tenths.
      const differenceTenths = Math.round((currentUsed - baselineUsed) * 10);
      const changePercentagePoints = `${differenceTenths / 10}`;

      // Record the delta even at zero so the interface can show confirmed stability explicitly.
      quotaDeltas.push({
        metricKind: 'quota-window-used-percent',
        bucketId: currentBucket.id,
        bucketName: currentBucket.name,
        windowKind: currentWindow.kind,
        baselinePercent: baselineUsed,
        currentPercent: currentUsed,
        changePercentagePoints,
      });
    }
  }

  // Compare exact lifetime token counters when both snapshots carry them.
  const counterDeltas: SessionCounterDelta[] = [];
  const baselineLifetime = baseline.usage.summary.lifetimeTokens;
  const currentLifetime = current.usage.summary.lifetimeTokens;
  if (baselineLifetime !== null && currentLifetime !== null) {
    const baselineValue = parseDecimalCounter(baselineLifetime);
    const currentValue = parseDecimalCounter(currentLifetime);
    if (baselineValue !== null && currentValue !== null) {
      // Present an increase exactly; present a decrease as an uninterpreted source change.
      counterDeltas.push({
        metricKind: 'usage-counter-tokens',
        counterId: 'lifetime',
        baselineTokens: baselineLifetime,
        currentTokens: currentLifetime,
        increaseTokens:
          currentValue >= baselineValue ? (currentValue - baselineValue).toString() : null,
        sourceValueChanged: currentValue < baselineValue,
      });
    }
  }

  // Return the three immutable delta groups for attachment to the outgoing observation.
  return { quotaDeltas, counterDeltas, resetTransitions };
}
