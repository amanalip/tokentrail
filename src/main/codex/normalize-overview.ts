// Import the renderer-safe normalized shapes and boundary validator.
import {
  overviewSnapshotSchema,
  type NumericMetric,
  type OverviewSnapshot,
  type QuotaBucket,
  type QuotaWindow,
} from '../../shared/contracts/overview-snapshot';

// Import only the already validated privileged protocol input types.
import type {
  AccountReadResult,
  RateLimitSnapshotInput,
  RateLimitsReadResult,
} from './protocol-schemas';

// Describe normalization output before local freshness state is attached by the snapshot controller.
export interface NormalizedOverviewData {
  // Preserve only a non-identifying account category.
  readonly accountKind: OverviewSnapshot['accountKind'];
  // Preserve the safe plan label when the account or quota response supplies one.
  readonly planType: string | null;
  // Carry bounded normalized quota buckets and never their raw protocol counterparts.
  readonly quotas: readonly QuotaBucket[];
  // Record whether supported input was incomplete or contained invalid fields.
  readonly isPartial: boolean;
}

// Construct one immutable numeric metric through a small reviewed helper.
function metric(
  value: number | null,
  provenance: NumericMetric['provenance'],
  explanation: string,
): NumericMetric {
  // Freeze each metric so privileged state cannot be mutated after validation.
  return Object.freeze({ value, provenance, explanation });
}

// Return a trimmed non-empty string or a local safe fallback without performing markup interpretation.
function safeLabel(value: string | null, fallback: string): string {
  // Ignore empty or whitespace-only server labels that provide no useful identity.
  const trimmedValue = value?.trim();

  // Use the bounded protocol string when meaningful, otherwise use local reviewed copy.
  return trimmedValue ? trimmedValue : fallback;
}

// Normalize one nullable numeric protocol field without converting absence or invalidity into zero.
function finiteNumber(value: unknown): number | null {
  // Accept only finite numbers because JSON-like strings are not valid percentage or timestamp fields.
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

// Normalize one quota window and report whether any field required an unavailable or invalid representation.
function normalizeWindow(
  kind: QuotaWindow['kind'],
  input: NonNullable<RateLimitSnapshotInput['primary']>,
): { readonly window: QuotaWindow; readonly isPartial: boolean } {
  // Preserve a finite reported used percentage even when it falls outside the expected range.
  const usedPercent = finiteNumber(input.usedPercent);

  // Treat an out-of-range percentage as invalid for derived arithmetic while retaining the reported value.
  const isExpectedPercentage = usedPercent !== null && usedPercent >= 0 && usedPercent <= 100;

  // Calculate remaining percentage only from a valid expected source percentage.
  const remainingPercent = isExpectedPercentage ? 100 - usedPercent : null;

  // Accept duration only as a positive safe whole number of minutes.
  const durationCandidate = finiteNumber(input.windowDurationMins);
  const durationMinutes =
    durationCandidate !== null && Number.isSafeInteger(durationCandidate) && durationCandidate > 0
      ? durationCandidate
      : null;

  // Accept reset time only as a positive safe whole Unix timestamp in seconds.
  const resetCandidate = finiteNumber(input.resetsAt);
  const resetsAt =
    resetCandidate !== null && Number.isSafeInteger(resetCandidate) && resetCandidate > 0
      ? resetCandidate
      : null;

  // Validate and freeze the normalized window before it can enter the shared snapshot.
  const window: QuotaWindow = Object.freeze({
    kind,
    usedPercent: metric(
      usedPercent,
      usedPercent === null ? 'unavailable' : 'codex-reported',
      usedPercent === null
        ? 'used-percentage-unavailable'
        : isExpectedPercentage
          ? 'used-percentage-reported'
          : 'used-percentage-outside-expected-range',
    ),
    remainingPercent: metric(
      remainingPercent,
      remainingPercent === null ? 'unavailable' : 'calculated',
      remainingPercent === null
        ? 'remaining-percentage-unavailable'
        : 'remaining-is-one-hundred-minus-used',
    ),
    durationMinutes: metric(
      durationMinutes,
      durationMinutes === null ? 'unavailable' : 'codex-reported',
      durationMinutes === null ? 'duration-unavailable' : 'duration-reported-in-minutes',
    ),
    resetsAt: metric(
      resetsAt,
      resetsAt === null ? 'unavailable' : 'codex-reported',
      resetsAt === null ? 'reset-time-unavailable' : 'reset-time-reported',
    ),
  });

  // Mark the window partial whenever any required or supporting field could not be represented soundly.
  return {
    window,
    isPartial:
      usedPercent === null ||
      !isExpectedPercentage ||
      durationMinutes === null ||
      resetsAt === null,
  };
}

// Normalize one server bucket with a deterministic local identity fallback.
function normalizeBucket(
  input: RateLimitSnapshotInput,
  fallbackId: string,
  fallbackOrdinal: number,
): { readonly bucket: QuotaBucket; readonly isPartial: boolean } {
  // Collect supported windows in the server-defined primary-before-secondary order.
  const windows: QuotaWindow[] = [];

  // Start partial tracking when no supported window is present.
  let isPartial = input.primary === null && input.secondary === null;

  // Normalize the primary slot independently so one malformed supporting field cannot erase the bucket.
  if (input.primary !== null) {
    const normalizedPrimary = normalizeWindow('primary', input.primary);
    windows.push(normalizedPrimary.window);
    isPartial ||= normalizedPrimary.isPartial;
  }

  // Normalize the optional secondary slot with the same field-level availability rules.
  if (input.secondary !== null) {
    const normalizedSecondary = normalizeWindow('secondary', input.secondary);
    windows.push(normalizedSecondary.window);
    isPartial ||= normalizedSecondary.isPartial;
  }

  // Prefer a supplied limit ID, then the response map key, then a deterministic local fallback.
  const id = safeLabel(input.limitId, safeLabel(fallbackId, `quota-${fallbackOrdinal}`));

  // Validate the public bucket before returning it to the snapshot builder.
  const bucket: QuotaBucket = Object.freeze({
    id,
    name: safeLabel(input.limitName, `Quota ${fallbackOrdinal}`),
    planType: input.planType,
    reached: input.rateLimitReachedType !== null,
    windows,
  });

  // Return the safe bucket together with its completeness signal.
  return { bucket, isPartial };
}

/** Normalize approved account and rate-limit reads into the stable renderer domain. */
export function normalizeOverviewData(
  accountResult: AccountReadResult,
  rateLimitsResult: RateLimitsReadResult,
): NormalizedOverviewData {
  // Map the account union into a non-identifying renderer category.
  const accountKind: OverviewSnapshot['accountKind'] =
    accountResult.account?.type === 'chatgpt'
      ? 'chatgpt'
      : accountResult.account?.type === 'apiKey'
        ? 'api-key'
        : accountResult.account?.type === 'amazonBedrock'
          ? 'amazon-bedrock'
          : null;

  // Prefer keyed multi-bucket data because it represents the current complete server view.
  const keyedSnapshots = rateLimitsResult.rateLimitsByLimitId
    ? Object.entries(rateLimitsResult.rateLimitsByLimitId)
    : [];

  // Fall back to the backward-compatible single bucket only when no keyed view is available.
  const sourceSnapshots: ReadonlyArray<readonly [string, RateLimitSnapshotInput]> =
    keyedSnapshots.length > 0
      ? keyedSnapshots
      : rateLimitsResult.rateLimits === null
        ? []
        : [['primary-quota', rateLimitsResult.rateLimits]];

  // Enforce the renderer contract's bucket bound while keeping the truncation visible as partial data.
  const boundedSnapshots = sourceSnapshots.slice(0, 64);

  // Normalize every retained bucket without exposing the original map or object references.
  const normalizedBuckets = boundedSnapshots.map(([fallbackId, snapshot], index) =>
    normalizeBucket(snapshot, fallbackId, index + 1),
  );

  // Prefer the account plan, then the first safe quota plan, without deriving an account identity.
  const planType =
    accountResult.account?.type === 'chatgpt'
      ? accountResult.account.planType
      : (normalizedBuckets.find(({ bucket }) => bucket.planType !== null)?.bucket.planType ?? null);

  // Return an immutable normalized result for the controller to timestamp and classify.
  return Object.freeze({
    accountKind,
    planType,
    quotas: Object.freeze(normalizedBuckets.map(({ bucket }) => bucket)),
    isPartial: sourceSnapshots.length > 64 || normalizedBuckets.some(({ isPartial }) => isPartial),
  });
}

/** Attach freshness and availability state to normalized data through the public boundary validator. */
export function createSuccessfulOverviewSnapshot(
  normalized: NormalizedOverviewData,
  observedAt: string,
): OverviewSnapshot {
  // Select an explicit state without treating a signed-in empty response as a successful quota snapshot.
  const state: OverviewSnapshot['state'] =
    normalized.accountKind === null
      ? 'signed-out'
      : normalized.quotas.length === 0
        ? 'unavailable'
        : normalized.isPartial
          ? 'partial'
          : 'ready';

  // Parse the complete public object to prevent privileged-only fields from crossing IPC accidentally.
  return overviewSnapshotSchema.parse({
    state,
    accountKind: normalized.accountKind,
    planType: normalized.planType,
    quotas: normalized.quotas,
    lastSuccessfulRefreshAt: observedAt,
    refreshAttemptedAt: observedAt,
    errorCategory: null,
  });
}
