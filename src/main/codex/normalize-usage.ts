// Import the renderer-safe usage and credits sections produced by this boundary.
import {
  createUnavailableUsageSection,
  usageSectionSchema,
  type UsageDay,
  type UsageSection,
} from '../../shared/contracts/usage-data';
import {
  createUnavailableCreditsSection,
  creditsSectionSchema,
  type CreditsSection,
  type ResetCreditDetail,
} from '../../shared/contracts/credits-data';

// Import exact calendar-date validation so invalid dates are rejected instead of coerced.
import { parseCalendarDateKey } from '../../shared/domain/calendar-date';

// Import chronological sorting and coverage computation from the shared calculation library.
import {
  computeUsageCoverage,
  sortUsageDaysChronologically,
} from '../../shared/domain/usage-calculations';

// Import only the already validated privileged protocol input types.
import type { AccountUsageReadResult, RateLimitsReadResult } from './protocol-schemas';

// Accept a counter as a canonical decimal string or an exact non-negative safe integer.
function normalizeCounterToken(value: unknown): string | null {
  // Preserve canonical decimal strings without conversion because they may exceed safe integer range.
  if (typeof value === 'string' && /^(0|[1-9]\d*)$/u.test(value) && value.length <= 128) {
    return value;
  }

  // Convert safe non-negative integers to their canonical string form exactly.
  if (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) {
    return `${value}`;
  }

  // Reject negative, fractional, unsafe, or otherwise unusable counters instead of clamping them.
  return null;
}

// Accept a reported streak or duration integer with the shared availability rules.
function normalizeReportedInteger(value: unknown): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

// Accept a bounded display string or null without interpreting markup or inventing units.
function normalizeDisplayString(value: unknown, maximumLength: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > maximumLength) return null;
  return trimmed;
}

/**
 * Normalize the approved aggregate-usage read into the renderer-safe usage section. Invalid records are
 * counted in coverage diagnostics and never silently participate in calculations. Duplicate dates are rejected
 * deterministically by keeping the first supplied record for a key, matching the coverage rule that duplicates
 * make affected comparisons unavailable through their rejection count.
 */
export function normalizeUsageData(usageResult: AccountUsageReadResult | null): {
  readonly usage: UsageSection;
  readonly rejectedRecordCount: number;
} {
  // Return the honest unavailable section when no result exists or the server returned null content.
  if (usageResult === null || (usageResult.summary === null && usageResult.dailyBuckets === null)) {
    return { usage: createUnavailableUsageSection(), rejectedRecordCount: 0 };
  }

  // Validate each bucket independently so one malformed record cannot erase valid neighbors.
  const acceptedDays: UsageDay[] = [];
  const seenDates = new Set<string>();
  let rejectedRecordCount = 0;

  // Walk raw buckets in supplied order while enforcing the renderer's bounded day count.
  for (const bucket of usageResult.dailyBuckets ?? []) {
    // Stop accepting beyond the contract bound and count every discarded record honestly.
    if (acceptedDays.length >= 366) {
      rejectedRecordCount += 1;
      continue;
    }

    // Validate the calendar key against real calendar semantics before accepting it.
    const parsedDate = parseCalendarDateKey(bucket.date);
    const tokens = normalizeCounterToken(bucket.tokens);
    if (parsedDate === null || tokens === null) {
      rejectedRecordCount += 1;
      continue;
    }

    // Reformat through the parsed fields so keys like 2026-08-04 are canonical.
    const canonicalKey = `${parsedDate.year}-${`${parsedDate.month}`.padStart(2, '0')}-${`${parsedDate.day}`.padStart(2, '0')}`;

    // Reject duplicate dates deterministically instead of merging or silently overwriting.
    if (seenDates.has(canonicalKey)) {
      rejectedRecordCount += 1;
      continue;
    }
    seenDates.add(canonicalKey);

    // Freeze one accepted immutable day bucket with Codex provenance.
    acceptedDays.push(
      Object.freeze({
        date: canonicalKey,
        tokens,
        provenance: 'codex-reported',
      }),
    );
  }

  // Normalize each reported summary field independently so one invalid field cannot erase others.
  const summary = usageResult.summary;
  const lifetimeTokens = summary === null ? null : normalizeCounterToken(summary.lifetimeTokens);
  const peakDailyTokens = summary === null ? null : normalizeCounterToken(summary.peakDailyTokens);
  const currentStreakDays =
    summary === null ? null : normalizeReportedInteger(summary.currentStreakDays);
  const longestStreakDays =
    summary === null ? null : normalizeReportedInteger(summary.longestStreakDays);
  const longestTurnSeconds =
    summary === null ? null : normalizeReportedInteger(summary.longestTurnSeconds);

  // Sort accepted days chronologically before coverage computation and display.
  const sortedDays = sortUsageDaysChronologically(acceptedDays);

  // Compute the honest coverage record including missing dates inside the supplied span.
  const coverage = computeUsageCoverage(sortedDays, rejectedRecordCount);

  // Classify completeness: rejections or absent buckets mark the section partial rather than hiding gaps.
  const hasBuckets = sortedDays.length > 0;
  const hasAnySummary =
    lifetimeTokens !== null ||
    peakDailyTokens !== null ||
    currentStreakDays !== null ||
    longestStreakDays !== null ||
    longestTurnSeconds !== null;
  const state: UsageSection['state'] =
    !hasBuckets && !hasAnySummary
      ? 'unavailable'
      : rejectedRecordCount > 0 || !hasBuckets
        ? 'partial'
        : 'ready';

  // Parse the complete section through its boundary schema before returning it.
  return {
    rejectedRecordCount,
    usage: usageSectionSchema.parse({
      state,
      days: sortedDays,
      summary: {
        lifetimeTokens,
        peakDailyTokens,
        currentStreakDays,
        longestStreakDays,
        longestTurnSeconds,
      },
      coverage,
    }),
  };
}

// Describe the credit-shaped fields one quota snapshot may carry beside its windows.
interface SnapshotCreditInput {
  readonly credits?: unknown;
  readonly individualLimit?: unknown;
  readonly spendControlReached?: unknown;
}

// Normalize one optional spending-control object from unknown protocol input.
function normalizeSpendingControl(input: unknown): CreditsSection['spendingControl'] {
  // Treat absence as absence rather than synthesizing an empty control.
  if (typeof input !== 'object' || input === null) return null;

  // Read candidate fields defensively because the container was validated only structurally.
  const record = input as Record<string, unknown>;
  const limitAmount = normalizeDisplayString(record['limitAmount'], 64);
  const usedAmount = normalizeDisplayString(record['usedAmount'], 64);
  const remainingPercentValue =
    typeof record['remainingPercent'] === 'number' &&
    Number.isFinite(record['remainingPercent']) &&
    record['remainingPercent'] >= 0 &&
    record['remainingPercent'] <= 100
      ? record['remainingPercent']
      : null;
  const reached = record['reached'] === true;
  const resetsCandidate =
    typeof record['resetsAt'] === 'number' &&
    Number.isSafeInteger(record['resetsAt']) &&
    record['resetsAt'] > 0
      ? record['resetsAt']
      : null;

  // Require at least one usable field before representing a control at all.
  if (
    limitAmount === null &&
    usedAmount === null &&
    remainingPercentValue === null &&
    resetsCandidate === null &&
    !reached
  ) {
    return null;
  }

  // Return the frozen normalized control with per-field availability preserved.
  return {
    limitAmount,
    usedAmount,
    remainingPercent: {
      value: remainingPercentValue,
      provenance: remainingPercentValue === null ? 'unavailable' : 'codex-reported',
      explanation:
        remainingPercentValue === null
          ? 'spending-control-remaining-unavailable'
          : 'spending-control-remaining-reported',
    },
    reached,
    resetsAtSeconds: resetsCandidate,
  };
}

// Normalize reset-credit detail rows from unknown protocol input with bounded plain-text fields.
function normalizeResetCreditDetails(input: unknown): ResetCreditDetail[] {
  // Treat absence as no rows; availableCount remains authoritative upstream of this function.
  if (!Array.isArray(input)) return [];

  // Accept at most the contracted row count and ignore anything beyond it as capped input.
  const details: ResetCreditDetail[] = [];
  for (const row of input.slice(0, 32)) {
    if (typeof row !== 'object' || row === null) continue;
    const record = row as Record<string, unknown>;

    // Keep backend text bounded and plain; rendering never interprets it as markup.
    const title = normalizeDisplayString(record['title'], 128);
    const description = normalizeDisplayString(record['description'], 512);

    // Accept a positive safe integer expiry or explicit absence; expired classification happens later.
    const expiresCandidate =
      typeof record['expiresAt'] === 'number' &&
      Number.isSafeInteger(record['expiresAt']) &&
      record['expiresAt'] > 0
        ? record['expiresAt']
        : null;

    // Skip rows without any displayable content instead of fabricating placeholders.
    if (title === null && description === null && expiresCandidate === null) continue;

    // Classify availability now so later ordering code can trust the closed state field.
    details.push({
      title: title ?? 'Reset credit',
      description: description ?? 'No description was reported.',
      expiresAtSeconds: expiresCandidate,
      state: 'available',
    });
  }
  return details;
}

/**
 * Normalize credit balance, spending control, and reset credits from the approved rate-limit response. The
 * authoritative `availableCount` is retained even when detail rows are absent or capped, and unlimited is kept
 * distinct from unavailable everywhere the interface presents these values.
 */
export function normalizeCreditsData(
  rateLimitsResult: RateLimitsReadResult,
  nowUnixSeconds: number,
): CreditsSection {
  // Gather credit-shaped fields from the keyed view first, then the single-bucket fallback.
  const snapshots: readonly RateLimitsReadResult['rateLimits'][] = [
    ...Object.values(rateLimitsResult.rateLimitsByLimitId ?? {}),
    ...(rateLimitsResult.rateLimits !== null ? [rateLimitsResult.rateLimits] : []),
  ];

  // Select the first snapshot carrying any credit information so multi-bucket responses stay deterministic.
  let creditInput: SnapshotCreditInput | null = null;
  for (const snapshot of snapshots) {
    if (
      snapshot !== null &&
      (snapshot.credits !== undefined ||
        snapshot.individualLimit !== undefined ||
        snapshot.spendControlReached !== undefined)
    ) {
      creditInput = snapshot;
      break;
    }
  }

  // Interpret the balance field across the tolerated shapes: object, unlimited marker, or display string.
  let balanceUnlimited = false;
  let balanceAmount: string | null = null;
  let spendingControl: CreditsSection['spendingControl'] = null;
  if (creditInput !== null) {
    const creditsField = creditInput.credits;
    if (typeof creditsField === 'string') {
      balanceAmount = normalizeDisplayString(creditsField, 64);
    } else if (typeof creditsField === 'object' && creditsField !== null) {
      const creditsRecord = creditsField as Record<string, unknown>;
      balanceUnlimited = creditsRecord['unlimited'] === true;
      balanceAmount = normalizeDisplayString(creditsRecord['balance'], 64);
    }

    // Merge the explicit spend-control reached flag with the structured control object.
    spendingControl = normalizeSpendingControl(creditInput.individualLimit);
    if (creditInput.spendControlReached === true && spendingControl !== null) {
      spendingControl = { ...spendingControl, reached: true };
    }
  }

  // Normalize reset credits from either accepted response spellings.
  const resetCreditsContainer =
    rateLimitsResult.rateLimitResetCredits ?? rateLimitsResult.resetCredits;
  let resetCreditsAvailableCount: number | null = null;
  let resetCreditDetails: ResetCreditDetail[] = [];
  if (typeof resetCreditsContainer === 'object' && resetCreditsContainer !== null) {
    const resetRecord = resetCreditsContainer as Record<string, unknown>;
    resetCreditsAvailableCount = normalizeReportedInteger(resetRecord['availableCount']);
    resetCreditDetails = normalizeResetCreditDetails(resetRecord['details']);
  }

  // Detect whether any credit information existed at all before classifying section completeness.
  const hasAnyCreditInformation =
    balanceUnlimited ||
    balanceAmount !== null ||
    spendingControl !== null ||
    resetCreditsAvailableCount !== null ||
    resetCreditDetails.length > 0;
  if (!hasAnyCreditInformation) {
    return createUnavailableCreditsSection();
  }

  // Mark detail rows expired relative to the controller's clock so display groups stay factual.
  const classifiedDetails = resetCreditDetails.map((detail) =>
    detail.expiresAtSeconds !== null && detail.expiresAtSeconds <= nowUnixSeconds
      ? ({ ...detail, state: 'expired' } satisfies ResetCreditDetail)
      : detail,
  );

  // Record capping honestly whenever fewer rows arrived than the authoritative count claims.
  const resetCreditDetailsCapped =
    resetCreditsAvailableCount !== null && classifiedDetails.length < resetCreditsAvailableCount;

  // A partial section keeps valid data visible while explaining that some fields were unavailable.
  const state: CreditsSection['state'] =
    balanceAmount === null && !balanceUnlimited ? 'partial' : 'ready';

  // Parse the complete section through its boundary schema before returning it.
  return creditsSectionSchema.parse({
    state,
    balanceUnlimited,
    balanceAmount,
    spendingControl,
    resetCreditsAvailableCount,
    resetCreditDetails: classifiedDetails,
    resetCreditDetailsCapped,
  });
}
