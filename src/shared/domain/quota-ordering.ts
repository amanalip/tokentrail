// Import the normalized quota contracts these deterministic orderings consume.
import type { QuotaBucket, QuotaWindow } from '../contracts/overview-snapshot';

// Describe one future reset entry for the Overview timeline with its stable source identity.
export interface ResetTimelineEntry {
  // Preserve the bucket identity so the entry can link back to its detail view.
  readonly bucketId: string;
  readonly bucketName: string;
  // Distinguish the reported primary and secondary slots inside the entry label.
  readonly windowKind: QuotaWindow['kind'];
  // Carry the validated future Unix reset timestamp in seconds.
  readonly resetsAtSeconds: number;
}

// Describe the complete timeline model including the separate unknown-time group.
export interface ResetTimeline {
  // List valid future resets sorted by timestamp then stable window identity.
  readonly entries: readonly ResetTimelineEntry[];
  // Keep windows without a usable reset time visible instead of dropping them silently.
  readonly unknownTimeEntries: readonly {
    readonly bucketId: string;
    readonly bucketName: string;
    readonly windowKind: QuotaWindow['kind'];
  }[];
}

/**
 * Build the chronological reset timeline from every normalized window. Only strictly future timestamps enter
 * the ordered list; a timestamp at or before the current moment does not prove a reset occurred, so it is not
 * presented as an upcoming change. Missing or invalid times land in the visible unknown-time group.
 */
export function buildResetTimeline(
  quotas: readonly QuotaBucket[],
  nowUnixSeconds: number,
): ResetTimeline {
  // Collect candidate entries from every supported window of every retained bucket.
  const entries: ResetTimelineEntry[] = [];
  const unknownTimeEntries: {
    bucketId: string;
    bucketName: string;
    windowKind: QuotaWindow['kind'];
  }[] = [];

  // Walk buckets in their stable normalized order so ties resolve deterministically.
  for (const bucket of quotas) {
    for (const window of bucket.windows) {
      // Accept only a positive safe integer timestamp that is still in the future.
      const resetsAt = window.resetsAt.value;
      if (resetsAt !== null && Number.isSafeInteger(resetsAt) && resetsAt > nowUnixSeconds) {
        entries.push({
          bucketId: bucket.id,
          bucketName: bucket.name,
          windowKind: window.kind,
          resetsAtSeconds: resetsAt,
        });
        continue;
      }

      // Keep every window without a usable future time visible in the unknown group.
      unknownTimeEntries.push({
        bucketId: bucket.id,
        bucketName: bucket.name,
        windowKind: window.kind,
      });
    }
  }

  // Sort by timestamp first, then by stable bucket and window identity for reproducible order.
  entries.sort((left, right) => {
    if (left.resetsAtSeconds !== right.resetsAtSeconds) {
      return left.resetsAtSeconds < right.resetsAtSeconds ? -1 : 1;
    }
    const identityCompare = `${left.bucketId}:${left.windowKind}`.localeCompare(
      `${right.bucketId}:${right.windowKind}`,
    );
    return identityCompare === 0 ? 0 : identityCompare < 0 ? -1 : 1;
  });

  // Freeze both groups so presentation code cannot reorder or mutate the reviewed model.
  return Object.freeze({
    entries: Object.freeze(entries),
    unknownTimeEntries: Object.freeze(unknownTimeEntries),
  });
}

// Describe one attention-ordered window row with its computed sort inputs preserved for display.
export interface AttentionWindow {
  readonly window: QuotaWindow;
  // Preserve the valid used percentage used for ordering; null when unavailable or outside range.
  readonly usedPercent: number | null;
  // Preserve the earliest valid future reset among this window's own timestamp only.
  readonly resetsAtSeconds: number | null;
}

// Describe one attention-ordered bucket group containing its ordered windows.
export interface AttentionBucketGroup {
  readonly bucket: QuotaBucket;
  // Report whether Codex explicitly reported this bucket as reached.
  readonly reached: boolean;
  // Carry the highest valid used percentage among this bucket's windows for cross-bucket ordering.
  readonly highestUsedPercent: number | null;
  // List this bucket's windows in their own attention order.
  readonly windows: readonly AttentionWindow[];
}

/**
 * Order quota buckets and their windows exactly as Interface 8.19 requires:
 * reached-state buckets first, then by highest valid used percentage, windows descending by used percentage,
 * equal percentages by earliest valid future reset, remaining ties by stable identifiers, and entries missing
 * a valid percentage after entries that contain one. The result is a display ordering only; it never predicts
 * exhaustion and never assigns a bucket-level reached state to one window.
 */
export function orderQuotaAttention(
  quotas: readonly QuotaBucket[],
  nowUnixSeconds: number,
): readonly AttentionBucketGroup[] {
  // Convert one window into its comparable attention row.
  const toAttentionWindow = (window: QuotaWindow): AttentionWindow => {
    // Accept the reported percentage only when finite and within the expected zero-to-hundred range.
    const used = window.usedPercent.value;
    const usedPercent =
      used !== null && Number.isFinite(used) && used >= 0 && used <= 100 ? used : null;

    // Accept only a positive safe integer reset timestamp for tie-breaking purposes.
    const resetsAt = window.resetsAt.value;
    const resetsAtSeconds =
      resetsAt !== null && Number.isSafeInteger(resetsAt) && resetsAt > nowUnixSeconds
        ? resetsAt
        : null;

    // Return the immutable comparable row.
    return Object.freeze({ window, usedPercent, resetsAtSeconds });
  };

  // Compare two optional percentages so entries with values precede entries without one.
  const compareOptionalPercent = (left: number | null, right: number | null): number => {
    if (left === null && right === null) return 0;
    if (left === null) return 1;
    if (right === null) return -1;
    return right - left;
  };

  // Compare two optional reset timestamps so earlier futures precede later ones and missing sorts last.
  const compareOptionalReset = (left: number | null, right: number | null): number => {
    if (left === null && right === null) return 0;
    if (left === null) return 1;
    if (right === null) return -1;
    return left - right;
  };

  // Build every bucket group with its windows already individually ordered.
  const groups = quotas.map<AttentionBucketGroup>((bucket) => {
    const windows = bucket.windows.map(toAttentionWindow).sort((left, right) => {
      // Rule 3: descending valid used percentage.
      const percentCompare = compareOptionalPercent(left.usedPercent, right.usedPercent);
      if (percentCompare !== 0) return percentCompare;

      // Rule 4: earliest valid future reset.
      const resetCompare = compareOptionalReset(left.resetsAtSeconds, right.resetsAtSeconds);
      if (resetCompare !== 0) return resetCompare;

      // Rule 5: stable normalized window identifier.
      return left.window.kind.localeCompare(right.window.kind);
    });

    // Rule 2 input: the highest valid used percentage among this bucket's windows.
    const highestUsedPercent = windows.reduce<number | null>(
      (highest, entry) =>
        entry.usedPercent !== null && (highest === null || entry.usedPercent > highest)
          ? entry.usedPercent
          : highest,
      null,
    );

    // Return the immutable group shell before global ordering.
    return Object.freeze({ bucket, reached: bucket.reached, highestUsedPercent, windows });
  });

  // Apply the global bucket ordering rules to a sorted copy.
  return groups.sort((left, right) => {
    // Rule 1: reached-state buckets first.
    if (left.reached !== right.reached) return left.reached ? -1 : 1;

    // Rule 2: highest valid used percentage across windows, descending.
    const percentCompare = compareOptionalPercent(
      left.highestUsedPercent,
      right.highestUsedPercent,
    );
    if (percentCompare !== 0) return percentCompare;

    // Rule 4 continuation: earliest valid future reset among each bucket's windows.
    const leftEarliestReset = left.windows.reduce<number | null>(
      (earliest, entry) =>
        entry.resetsAtSeconds !== null && (earliest === null || entry.resetsAtSeconds < earliest)
          ? entry.resetsAtSeconds
          : earliest,
      null,
    );
    const rightEarliestReset = right.windows.reduce<number | null>(
      (earliest, entry) =>
        entry.resetsAtSeconds !== null && (earliest === null || entry.resetsAtSeconds < earliest)
          ? entry.resetsAtSeconds
          : earliest,
      null,
    );
    const resetCompare = compareOptionalReset(leftEarliestReset, rightEarliestReset);
    if (resetCompare !== 0) return resetCompare;

    // Rule 5: stable normalized bucket identifier.
    return left.bucket.id.localeCompare(right.bucket.id);
  });
}

/**
 * Select the deterministic primary presentation window. Prefer the first server-designated primary window in
 * stable bucket order; otherwise fall back to the first available window and let the caller state the rule.
 */
export function selectPrimaryWindow(
  quotas: readonly QuotaBucket[],
): { readonly bucket: QuotaBucket; readonly window: QuotaWindow } | null {
  // Prefer an explicit primary slot in stable bucket order.
  for (const bucket of quotas) {
    const primaryWindow = bucket.windows.find((window) => window.kind === 'primary');
    if (primaryWindow) return { bucket, window: primaryWindow };
  }

  // Fall back deterministically to the first supported window when no primary slot exists.
  const firstBucket = quotas.find((bucket) => bucket.windows.length > 0);
  const firstWindow = firstBucket?.windows[0];
  return firstBucket && firstWindow ? { bucket: firstBucket, window: firstWindow } : null;
}
