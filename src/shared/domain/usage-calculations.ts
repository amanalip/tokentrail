// Import exact calendar-date helpers so period arithmetic never depends on timezone-shifted instants.
import {
  calendarDayDifference,
  compareCalendarDates,
  enumerateConsecutiveDateKeys,
  parseCalendarDateKey,
} from './calendar-date';

// Import exact bigint formatting so averages and medians never pass through lossy floats.
import { formatBigintRatio, parseDecimalCounter } from './bigint-format';

// Import the normalized usage contracts these calculations consume.
import type { UsageCoverage, UsageDay } from '../contracts/usage-data';

// Describe one availability-aware statistic value with its exact display string and provenance.
export interface UsageStatistic {
  // Report whether the statistic could be calculated from complete valid input.
  readonly available: boolean;
  // Carry the exact formatted value when available; null otherwise without substituting zero.
  readonly displayValue: string | null;
  // Name the stable local explanation key describing how this number was derived.
  readonly explanationKey: string;
}

// Describe one complete-period comparison with exact totals and honest relative-change availability.
export interface PeriodComparison {
  // Report whether both periods had complete consecutive coverage.
  readonly available: boolean;
  // Explain unavailability with a stable local key when the comparison cannot run.
  readonly unavailableReasonKey:
    'comparison-requires-more-dates' | 'comparison-has-no-valid-dates' | null;
  // Carry inclusive start and end keys for each labeled period.
  readonly latestRange: { readonly start: string; readonly end: string } | null;
  readonly precedingRange: { readonly start: string; readonly end: string } | null;
  // Preserve exact bigint totals as canonical strings for display and testing.
  readonly latestTotal: string | null;
  readonly precedingTotal: string | null;
  // Preserve the exact signed difference as a canonical decimal string including a minus sign when negative.
  readonly absoluteDifference: string | null;
  // Present relative change only when the preceding total is strictly positive.
  readonly relativeChangePercent: string | null;
  // Distinguish the reviewed special case where neither complete period contained activity.
  readonly bothPeriodsZero: boolean;
}

/**
 * Build the coverage record from accepted buckets and the adapter's rejected-record count. Missing dates are
 * computed inside the observed supplied span only, because Token Trail cannot know about dates Codex never
 * claimed to cover. The missing list is bounded and its truncation is recorded rather than hidden.
 */
export function computeUsageCoverage(
  days: readonly UsageDay[],
  rejectedRecordCount: number,
): UsageCoverage {
  // Return the empty record unchanged when no bucket was accepted.
  if (days.length === 0) {
    return {
      validDateCount: 0,
      rejectedRecordCount,
      reportedZeroCount: 0,
      missingDates: [],
      missingDatesTruncated: false,
      firstValidDate: null,
      lastValidDate: null,
    };
  }

  // Count reported zeros exactly as supplied without treating them as missing.
  const reportedZeroCount = days.filter((day) => day.tokens === '0').length;

  // Parse endpoint dates once; adapter validation guarantees these parse, so treat failure as unreachable.
  const first = parseCalendarDateKey(days[0]?.date);
  const last = parseCalendarDateKey(days[days.length - 1]?.date);
  if (first === null || last === null) {
    return {
      validDateCount: days.length,
      rejectedRecordCount,
      reportedZeroCount,
      missingDates: [],
      missingDatesTruncated: false,
      firstValidDate: days[0]?.date ?? null,
      lastValidDate: days[days.length - 1]?.date ?? null,
    };
  }

  // Index accepted keys for constant-time membership checks while building the span.
  const acceptedKeys = new Set(days.map((day) => day.date));

  // Enumerate every calendar key in the span and collect the ones the source did not supply.
  const spanLength = calendarDayDifference(last, first) + 1;
  const allSpanKeys = enumerateConsecutiveDateKeys(last, spanLength);
  const missingKeys = allSpanKeys.filter((key) => !acceptedKeys.has(key));

  // Bound the visible missing list and record truncation honestly instead of hiding gaps.
  const maximumVisibleMissingDates = 64;
  return {
    validDateCount: days.length,
    rejectedRecordCount,
    reportedZeroCount,
    missingDates: missingKeys.slice(0, maximumVisibleMissingDates),
    missingDatesTruncated: missingKeys.length > maximumVisibleMissingDates,
    firstValidDate: days[0]?.date ?? null,
    lastValidDate: days[days.length - 1]?.date ?? null,
  };
}

/**
 * Calculate descriptive statistics over exactly the supplied range. Every rule follows Interface 8.22: total is
 * an exact bigint sum, daily average divides by all supplied buckets including reported zeros, active-day
 * average divides only by positive buckets, median includes zeros, and ties for highest keep the earliest date.
 */
export function computeUsageStatistics(days: readonly UsageDay[]): {
  readonly total: UsageStatistic;
  readonly dailyAverage: UsageStatistic;
  readonly activeDayAverage: UsageStatistic;
  readonly median: UsageStatistic;
  readonly highestSuppliedDay: UsageStatistic & { readonly tiedDates: readonly string[] };
  readonly activeDayCount: UsageStatistic;
} {
  // Convert every supplied bucket to exact bigint once; adapter validation makes failures unreachable.
  const values = days.map((day) => ({
    date: day.date,
    tokens: parseDecimalCounter(day.tokens) ?? 0n,
  }));

  // Report every statistic unavailable when no valid bucket exists in the selected range.
  if (values.length === 0) {
    const unavailable = (explanationKey: string): UsageStatistic => ({
      available: false,
      displayValue: null,
      explanationKey,
    });
    return {
      total: unavailable('statistics-total-unavailable'),
      dailyAverage: unavailable('statistics-daily-average-unavailable'),
      activeDayAverage: unavailable('statistics-active-day-average-unavailable'),
      median: unavailable('statistics-median-unavailable'),
      highestSuppliedDay: { ...unavailable('statistics-highest-unavailable'), tiedDates: [] },
      activeDayCount: unavailable('statistics-active-day-count-unavailable'),
    };
  }

  // Sum exactly across all supplied buckets using bigint addition.
  const total = values.reduce((sum, entry) => sum + entry.tokens, 0n);

  // Partition positive buckets once for active-day rules.
  const activeValues = values.filter((entry) => entry.tokens > 0n);

  // Daily average divides by every supplied bucket, including reported zeros.
  const dailyAverageDisplay = formatBigintRatio(total, BigInt(values.length), 1);

  // Active-day average exists only when at least one positive bucket was supplied.
  const activeAverage =
    activeValues.length > 0 ? formatBigintRatio(total, BigInt(activeValues.length), 1) : null;

  // Sort a copy of all values, zeros included, for the median rule.
  const sorted = [...values.map((entry) => entry.tokens)].sort((left, right) =>
    left < right ? -1 : left > right ? 1 : 0,
  );
  const middleIndex = Math.floor(sorted.length / 2);
  const medianDisplay =
    sorted.length % 2 === 1
      ? sorted[middleIndex]!.toString()
      : formatBigintRatio(sorted[middleIndex - 1]! + sorted[middleIndex]!, 2n, 1);

  // Find the maximum supplied value and collect every date that reached it, keeping order stable.
  const highestValue = sorted[sorted.length - 1]!;
  const tiedDates = values
    .filter((entry) => entry.tokens === highestValue)
    .map((entry) => entry.date);

  // Assemble the reviewed statistic objects with stable explanation keys.
  return {
    total: {
      available: true,
      displayValue: total.toString(),
      explanationKey: 'statistics-total-exact-sum',
    },
    dailyAverage: {
      available: true,
      displayValue: dailyAverageDisplay,
      explanationKey: 'statistics-daily-average-over-supplied-days',
    },
    activeDayAverage: {
      available: activeAverage !== null,
      displayValue: activeAverage,
      explanationKey: 'statistics-active-day-average-over-positive-days',
    },
    median: {
      available: true,
      displayValue: medianDisplay,
      explanationKey: 'statistics-median-includes-reported-zeros',
    },
    highestSuppliedDay: {
      available: true,
      displayValue: highestValue.toString(),
      explanationKey: 'statistics-highest-within-selected-range',
      tiedDates,
    },
    activeDayCount: {
      available: true,
      displayValue: `${activeValues.length}`,
      explanationKey: 'statistics-active-day-count-of-supplied',
    },
  };
}

/**
 * Compare two complete consecutive periods ending on the latest valid supplied date. A seven-day comparison
 * requires fourteen consecutive dated buckets and a thirty-day comparison requires sixty. Totals and
 * differences use exact integer arithmetic; relative change appears only with a positive preceding total.
 */
export function computePeriodComparison(
  days: readonly UsageDay[],
  periodDays: 7 | 30,
): PeriodComparison {
  // Describe the honest unavailable result shape used by every early return.
  const unavailable = (
    reasonKey: NonNullable<PeriodComparison['unavailableReasonKey']>,
  ): PeriodComparison => ({
    available: false,
    unavailableReasonKey: reasonKey,
    latestRange: null,
    precedingRange: null,
    latestTotal: null,
    precedingTotal: null,
    absoluteDifference: null,
    relativeChangePercent: null,
    bothPeriodsZero: false,
  });

  // Require the full doubled span before any comparison can be attempted.
  const requiredDates = periodDays * 2;
  if (days.length < requiredDates) {
    return unavailable('comparison-requires-more-dates');
  }

  // Anchor the comparison on the latest valid supplied date, not on today's local calendar.
  const endDate = parseCalendarDateKey(days[days.length - 1]?.date);
  if (endDate === null) {
    return unavailable('comparison-has-no-valid-dates');
  }

  // Build the exact expected key sequence ending on that anchor date.
  const requiredKeys = enumerateConsecutiveDateKeys(endDate, requiredDates);

  // Index supplied keys to values so completeness and lookup share one pass.
  const suppliedByKey = new Map(days.map((day) => [day.date, day.tokens]));

  // Verify every required date exists exactly once in the supplied model.
  const isComplete = requiredKeys.every((key) => suppliedByKey.has(key));
  if (!isComplete) {
    return unavailable('comparison-requires-more-dates');
  }

  // Slice the two adjacent complete periods from the verified key sequence.
  const latestKeys = requiredKeys.slice(periodDays);
  const precedingKeys = requiredKeys.slice(0, periodDays);

  // Sum each period exactly with bigint arithmetic.
  const sumKeys = (keys: readonly string[]): bigint =>
    keys.reduce((sum, key) => sum + (parseDecimalCounter(suppliedByKey.get(key) ?? '0') ?? 0n), 0n);
  const latestTotal = sumKeys(latestKeys);
  const precedingTotal = sumKeys(precedingKeys);

  // Compute the exact signed difference without any floating-point conversion.
  const difference = latestTotal - precedingTotal;

  // Present relative change only when the preceding total is strictly positive per Interface 8.21.
  const relativeChangePercent =
    precedingTotal > 0n ? formatBigintRatio(difference * 100n, precedingTotal, 1) : null;

  // Detect the reviewed both-zero case so the interface can use its dedicated sentence.
  const bothPeriodsZero = latestTotal === 0n && precedingTotal === 0n;

  // Return the complete comparison with canonical string forms for safe IPC transport.
  return {
    available: true,
    unavailableReasonKey: null,
    latestRange: { start: latestKeys[0]!, end: latestKeys[latestKeys.length - 1]! },
    precedingRange: { start: precedingKeys[0]!, end: precedingKeys[precedingKeys.length - 1]! },
    latestTotal: latestTotal.toString(),
    precedingTotal: precedingTotal.toString(),
    absoluteDifference: difference.toString(),
    relativeChangePercent,
    bothPeriodsZero,
  };
}

/**
 * Classify one calendar key against the supplied range for heatmap rendering. Reported zero, positive, and
 * missing are separate states so a gap can never be mistaken for a quiet day.
 */
export function classifyHeatmapCell(
  dateKey: string,
  daysByKey: ReadonlyMap<string, UsageDay>,
): 'missing' | 'zero' | 'low' | 'medium' | 'high' {
  // Look up the supplied bucket; absence is its own state and never becomes zero.
  const day = daysByKey.get(dateKey);
  if (day === undefined) return 'missing';

  // Parse the exact counter; adapter validation makes failure unreachable but stay defensive.
  const tokens = parseDecimalCounter(day.tokens);
  if (tokens === null || tokens === 0n) return 'zero';

  // Rank intensity relative to the maximum positive value in the same selected range.
  let maximum = 0n;
  for (const candidate of daysByKey.values()) {
    const candidateTokens = parseDecimalCounter(candidate.tokens);
    if (candidateTokens !== null && candidateTokens > maximum) maximum = candidateTokens;
  }

  // Guard the degenerate all-zero case even though the zero branch already handled it.
  if (maximum === 0n) return 'zero';

  // Compare ratios with cross-multiplied integers so no float conversion is needed.
  const ratioTimesThree = tokens * 3n;
  if (ratioTimesThree <= maximum) return 'low';
  if (ratioTimesThree <= maximum * 2n) return 'medium';
  return 'high';
}

/**
 * Order supplied days chronologically by their validated calendar meaning. Duplicate keys are preserved here;
 * rejection of duplicates happened in the privileged adapter, so this sort stays total and deterministic.
 */
export function sortUsageDaysChronologically(days: readonly UsageDay[]): UsageDay[] {
  // Sort by parsed calendar fields with a stable tiebreak on the raw key text.
  return [...days].sort((left, right) => {
    const leftDate = parseCalendarDateKey(left.date);
    const rightDate = parseCalendarDateKey(right.date);
    if (leftDate === null || rightDate === null) return left.date.localeCompare(right.date);
    return compareCalendarDates(leftDate, rightDate);
  });
}
