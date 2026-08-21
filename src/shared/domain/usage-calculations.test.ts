// Import Vitest assertions and grouping helpers.
import { describe, expect, it } from 'vitest';

// Import the usage calculations under test.
import {
  classifyHeatmapCell,
  computePeriodComparison,
  computeUsageCoverage,
  computeUsageStatistics,
  sortUsageDaysChronologically,
} from './usage-calculations';

// Import shared calendar helpers so comparison fixtures use the same date semantics as production.
import { enumerateConsecutiveDateKeys, parseCalendarDateKey } from './calendar-date';

// Import the normalized day type for fixture construction.
import type { UsageDay } from '../contracts/usage-data';

// Construct one valid day bucket with a canonical decimal counter.
function day(date: string, tokens: string): UsageDay {
  return { date, tokens, provenance: 'codex-reported' };
}

// Group behavior around coverage computation.
describe('computeUsageCoverage', () => {
  it('reports zero counts and absent bounds when no bucket was accepted', () => {
    const coverage = computeUsageCoverage([], 2);
    expect(coverage).toEqual({
      validDateCount: 0,
      rejectedRecordCount: 2,
      reportedZeroCount: 0,
      missingDates: [],
      missingDatesTruncated: false,
      firstValidDate: null,
      lastValidDate: null,
    });
  });

  it('lists missing dates inside the supplied span without inventing outer gaps', () => {
    // Supply August 1, 2, and 4 so only August 3 is missing inside the span.
    const coverage = computeUsageCoverage(
      [day('2026-08-01', '10'), day('2026-08-02', '0'), day('2026-08-04', '30')],
      0,
    );
    expect(coverage.validDateCount).toBe(3);
    expect(coverage.reportedZeroCount).toBe(1);
    expect(coverage.missingDates).toEqual(['2026-08-03']);
    expect(coverage.missingDatesTruncated).toBe(false);
    expect(coverage.firstValidDate).toBe('2026-08-01');
    expect(coverage.lastValidDate).toBe('2026-08-04');
  });

  it('records truncation honestly when the missing list exceeds its bound', () => {
    // Build a span of 100 days supplying only the endpoints so 98 dates are missing.
    const days = [day('2026-01-01', '5'), day('2026-04-10', '5')];
    const coverage = computeUsageCoverage(days, 0);
    expect(coverage.missingDates.length).toBe(64);
    expect(coverage.missingDatesTruncated).toBe(true);
  });
});

// Group behavior around descriptive statistics.
describe('computeUsageStatistics', () => {
  it('marks every statistic unavailable without substituting zero', () => {
    const statistics = computeUsageStatistics([]);
    expect(statistics.total.available).toBe(false);
    expect(statistics.total.displayValue).toBeNull();
    expect(statistics.median.displayValue).toBeNull();
    expect(statistics.highestSuppliedDay.tiedDates).toEqual([]);
  });

  it('computes exact totals, averages, median, highest day, and active-day count', () => {
    // Values chosen so odd-count median is a member and active-day math is checkable.
    const days = [
      day('2026-08-11', '91210'),
      day('2026-08-12', '0'),
      day('2026-08-13', '124500'),
      day('2026-08-14', '180400'),
      day('2026-08-15', '47000'),
    ];
    const statistics = computeUsageStatistics(days);

    // Total is the exact bigint sum.
    expect(statistics.total.displayValue).toBe('443110');

    // Daily average divides by all five supplied buckets including the reported zero.
    expect(statistics.dailyAverage.displayValue).toBe('88622');

    // Active-day average divides by only the four positive buckets.
    expect(statistics.activeDayAverage.displayValue).toBe('110777.5');

    // Median includes the reported zero and sorts all values.
    expect(statistics.median.displayValue).toBe('91210');

    // Highest supplied day names the maximum within this range only.
    expect(statistics.highestSuppliedDay.displayValue).toBe('180400');
    expect(statistics.highestSuppliedDay.tiedDates).toEqual(['2026-08-14']);

    // Active-day count excludes the reported zero.
    expect(statistics.activeDayCount.displayValue).toBe('4');
  });

  it('uses the mean of middle values for even counts and lists every tied maximum date', () => {
    const days = [
      day('2026-08-11', '100'),
      day('2026-08-12', '300'),
      day('2026-08-13', '200'),
      day('2026-08-14', '300'),
    ];
    const statistics = computeUsageStatistics(days);

    // Even-count median is the exact arithmetic mean of 200 and 300.
    expect(statistics.median.displayValue).toBe('250');

    // Both tied maxima are exposed while the compact value stays single.
    expect(statistics.highestSuppliedDay.displayValue).toBe('300');
    expect(statistics.highestSuppliedDay.tiedDates).toEqual(['2026-08-12', '2026-08-14']);
  });

  it('marks active-day average unavailable when no bucket is positive', () => {
    const days = [day('2026-08-11', '0'), day('2026-08-12', '0')];
    const statistics = computeUsageStatistics(days);
    expect(statistics.activeDayAverage.available).toBe(false);
    expect(statistics.activeDayAverage.displayValue).toBeNull();
    expect(statistics.activeDayCount.displayValue).toBe('0');
    expect(statistics.total.displayValue).toBe('0');
  });

  it('collapses every statistic to the same supplied day at the one-day boundary', () => {
    // One positive day is the smallest complete statistics input.
    const statistics = computeUsageStatistics([day('2026-08-11', '42000')]);

    // Total, average, median, and highest all describe exactly that day without invention.
    expect(statistics.total.displayValue).toBe('42000');
    expect(statistics.dailyAverage.displayValue).toBe('42000');
    expect(statistics.activeDayAverage.displayValue).toBe('42000');
    expect(statistics.median.displayValue).toBe('42000');
    expect(statistics.highestSuppliedDay.displayValue).toBe('42000');
    expect(statistics.highestSuppliedDay.tiedDates).toEqual(['2026-08-11']);
    expect(statistics.activeDayCount.displayValue).toBe('1');
  });

  it('computes exact statistics for values beyond safe integer precision', () => {
    // Two huge odd values exercise bigint summation and even-count median division.
    const days = [
      day('2026-08-11', '123456789012345678901234567891'),
      day('2026-08-12', '123456789012345678901234567893'),
    ];
    const statistics = computeUsageStatistics(days);

    // The total and median keep full precision that JavaScript numbers would corrupt.
    expect(statistics.total.displayValue).toBe('246913578024691357802469135784');
    expect(statistics.median.displayValue).toBe('123456789012345678901234567892');
  });
});

// Group behavior around complete-period comparisons.
describe('computePeriodComparison', () => {
  // Build consecutive dated buckets ending on the anchor date with deterministic values.
  function buildConsecutiveDays(
    count: number,
    endKey: string,
    tokenForIndex: (index: number) => string,
  ): UsageDay[] {
    // Enumerate keys backwards from the parsed end date using the shared calendar helper.
    const end = parseCalendarDateKey(endKey)!;
    const keys = enumerateConsecutiveDateKeys(end, count);
    return keys.map((key, index) => day(key, tokenForIndex(index)));
  }

  it('requires the full doubled span before comparing', () => {
    const result = computePeriodComparison([day('2026-08-13', '5')], 7);
    expect(result.available).toBe(false);
    expect(result.unavailableReasonKey).toBe('comparison-requires-more-dates');
    expect(result.latestTotal).toBeNull();
  });

  it('compares two complete seven-day periods with exact arithmetic', () => {
    // Fourteen complete days ending Aug 13: preceding week totals 2,800 and latest week totals 7,700.
    const days = buildConsecutiveDays(14, '2026-08-13', (index) => `${(index + 1) * 100}`);
    const result = computePeriodComparison(days, 7);

    expect(result.available).toBe(true);
    expect(result.latestRange).toEqual({ start: '2026-08-07', end: '2026-08-13' });
    expect(result.precedingRange).toEqual({ start: '2026-07-31', end: '2026-08-06' });
    expect(result.latestTotal).toBe('7700');
    expect(result.precedingTotal).toBe('2800');
    expect(result.absoluteDifference).toBe('4900');

    // Relative change uses exact ratio arithmetic rounded to one decimal.
    expect(result.relativeChangePercent).toBe('175');
    expect(result.bothPeriodsZero).toBe(false);
  });

  it('anchors on the latest supplied date rather than today', () => {
    // End on an unusual historical date to prove today's clock is irrelevant.
    const days = buildConsecutiveDays(14, '2026-03-05', () => '10');
    const result = computePeriodComparison(days, 7);
    expect(result.latestRange?.end).toBe('2026-03-05');
    expect(result.absoluteDifference).toBe('0');
  });

  it('withholds relative change when the preceding total is zero but shows the absolute difference', () => {
    // Preceding week entirely zero, latest week positive.
    const days = buildConsecutiveDays(14, '2026-08-13', (index) =>
      index < 7 ? '0' : `${index * 100}`,
    );
    const result = computePeriodComparison(days, 7);
    expect(result.precedingTotal).toBe('0');
    expect(result.absoluteDifference).not.toBe('0');
    expect(result.relativeChangePercent).toBeNull();
  });

  it('detects the reviewed both-zero case', () => {
    const days = buildConsecutiveDays(14, '2026-08-13', () => '0');
    const result = computePeriodComparison(days, 7);
    expect(result.bothPeriodsZero).toBe(true);
    expect(result.absoluteDifference).toBe('0');
  });

  it('requires sixty consecutive dates for the thirty-day comparison', () => {
    // Fifty-nine days cannot support a thirty-day comparison.
    const shortDays = buildConsecutiveDays(59, '2026-08-13', () => '10');
    expect(computePeriodComparison(shortDays, 30).available).toBe(false);

    // Sixty complete days succeed.
    const fullDays = buildConsecutiveDays(60, '2026-08-13', () => '10');
    expect(computePeriodComparison(fullDays, 30).available).toBe(true);
  });
});

// Group behavior around heatmap classification.
describe('classifyHeatmapCell', () => {
  it('distinguishes missing, reported zero, and three intensity bands', () => {
    const days = [
      day('2026-08-10', '0'),
      day('2026-08-11', '10'),
      day('2026-08-12', '20'),
      day('2026-08-13', '30'),
    ];
    const byKey = new Map(days.map((entry) => [entry.date, entry]));

    // Absent dates stay missing and never become zero.
    expect(classifyHeatmapCell('2026-08-09', byKey)).toBe('missing');
    expect(classifyHeatmapCell('2026-08-10', byKey)).toBe('zero');
    expect(classifyHeatmapCell('2026-08-11', byKey)).toBe('low');
    expect(classifyHeatmapCell('2026-08-12', byKey)).toBe('medium');
    expect(classifyHeatmapCell('2026-08-13', byKey)).toBe('high');

    // A value beyond safe integer precision still classifies without float conversion.
    const oversized = new Map(
      [day('2026-08-11', '99999999999999999999')].map((entry) => [entry.date, entry]),
    );
    expect(classifyHeatmapCell('2026-08-11', oversized)).toBe('high');
  });
});

// Group behavior around chronological sorting.
describe('sortUsageDaysChronologically', () => {
  it('orders supplied buckets by calendar meaning rather than text or insertion order', () => {
    const sorted = sortUsageDaysChronologically([
      day('2026-08-13', '3'),
      day('2025-12-31', '1'),
      day('2026-01-02', '2'),
    ]);
    expect(sorted.map((entry) => entry.date)).toEqual(['2025-12-31', '2026-01-02', '2026-08-13']);
  });
});
