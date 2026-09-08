// Import React state, refs, memoization, and effects for the chart lifecycle.
import { useEffect, useMemo, useRef, useState } from 'react';

// Import only the required ECharts chart type and components per the reviewed dependency scope.
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';

// Register exactly the imported pieces so unused chart families stay out of the bundle.
echarts.use([BarChart, GridComponent, TooltipComponent, SVGRenderer]);

// Import shared usage calculations so the route derives everything from one normalized source.
import {
  computePeriodComparison,
  computeUsageCoverage,
  computeUsageStatistics,
} from '../../shared/domain/usage-calculations';

// Import shared calendar helpers for exact span enumeration and formatting.
import {
  calendarDayDifference,
  enumerateConsecutiveDateKeys,
  parseCalendarDateKey,
} from '../../shared/domain/calendar-date';

// Import exact bigint formatting for chart values within safe visual ranges.
import { parseDecimalCounter } from '../../shared/domain/bigint-format';

// Import the normalized snapshot and preference contracts.
import type { OverviewSnapshot } from '../../shared/contracts/overview-snapshot';
import type { Preferences } from '../../shared/contracts/preferences';

// Import reviewed display formatters.
import {
  formatCounter,
  formatCounterCompact,
  formatCounterDifference,
  formatStatistic,
} from '../formatting';

// Convert one canonical decimal counter into a number for chart geometry when exactly representable.
function toChartNumber(tokens: string): number | null {
  // Parse exactly first so oversized values can be excluded rather than silently distorted.
  const parsed = parseDecimalCounter(tokens);
  if (parsed === null) return null;
  // Chart geometry tolerates safe numbers; larger values are clamped to the safe maximum with a note.
  return parsed <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(parsed) : Number.MAX_SAFE_INTEGER;
}

/** The resolved theme colors one daily chart consumes for series, axes, and tooltip surfaces. */
export interface DailyChartPalette {
  /** Series fill; reuses the same data hue as progress tracks and heatmap cells. */
  readonly series: string;
  /** Axis tick label text. */
  readonly axisLabel: string;
  /** Axis baseline strokes. */
  readonly axisLine: string;
  /** Horizontal grid lines kept quieter than baselines. */
  readonly splitLine: string;
  /** Tooltip surface fill. */
  readonly tooltipBackground: string;
  /** Tooltip surface border. */
  readonly tooltipBorder: string;
  /** Tooltip text color. */
  readonly tooltipText: string;
}

/**
 * Resolve the chart palette from the reviewed CSS custom properties so the chart, tracks, and
 * heatmap always describe the same data in the same theme language. Reading computed properties
 * keeps this component declarative: themes change by updating document attributes only.
 */
export function resolveDailyChartPalette(): DailyChartPalette {
  const token = (name: string): string =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return {
    series: token('--chart-series-b'),
    axisLabel: token('--muted-strong'),
    axisLine: token('--border'),
    splitLine: token('--border-soft'),
    tooltipBackground: token('--surface-raised'),
    tooltipBorder: token('--border'),
    tooltipText: token('--text'),
  };
}

/**
 * Build the complete ECharts option for the daily bar chart from exact values and a resolved
 * palette. Animation stays off permanently: a dashboard refresh must not replay decorative
 * motion on every snapshot update, which serves both the reduced-motion contract and the idle
 * CPU budget. Color independence holds by construction: one series means hue never separates
 * categories, axis labels identify every bar, and the equivalent table view carries all values.
 */
export function buildDailyChartOption(
  palette: DailyChartPalette,
  days: OverviewSnapshot['usage']['days'],
) {
  // Map each day into category/value pairs using safe numbers for geometry only.
  const categories = days.map((day) => formatDateKey(day.date));
  const values = days.map((day) => toChartNumber(day.tokens) ?? 0);
  return {
    animation: false as const,
    tooltip: {
      trigger: 'axis' as const,
      renderMode: 'richText' as const,
      formatter: (params: unknown): string => {
        const point = Array.isArray(params) ? params[0] : params;
        const index =
          typeof point === 'object' && point !== null
            ? (point as { dataIndex?: unknown }).dataIndex
            : undefined;
        const day = typeof index === 'number' ? days[index] : undefined;
        return day ? `${formatDateKey(day.date)}\n${formatCounter(day.tokens)} tokens` : '';
      },
      backgroundColor: palette.tooltipBackground,
      borderColor: palette.tooltipBorder,
      textStyle: { color: palette.tooltipText },
    },
    grid: { left: 8, right: 8, top: 16, bottom: 8, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: categories,
      axisLabel: { color: palette.axisLabel },
      axisLine: { lineStyle: { color: palette.axisLine } },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { color: palette.axisLabel },
      splitLine: { lineStyle: { color: palette.splitLine } },
    },
    series: [{ type: 'bar' as const, data: values, itemStyle: { color: palette.series } }],
  };
}

/** Render aggregate token activity with chart, accessible table, heatmap, statistics, and coverage. */
export function UsageRoute({
  snapshot,
  preferences,
}: {
  snapshot: OverviewSnapshot;
  preferences: Preferences;
}) {
  // Track whether the daily detail is presented as a chart or an equivalent table.
  const [view, setView] = useState<'chart' | 'table'>('chart');

  // Derive statistics and both complete-period comparisons once per snapshot change.
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const invalidRange =
    (startDate !== '' && parseCalendarDateKey(startDate) === null) ||
    (endDate !== '' && parseCalendarDateKey(endDate) === null) ||
    (startDate !== '' && endDate !== '' && startDate > endDate);
  const days = useMemo(
    () =>
      invalidRange
        ? []
        : snapshot.usage.days.filter(
            (day) =>
              (startDate === '' || day.date >= startDate) &&
              (endDate === '' || day.date <= endDate),
          ),
    [snapshot.usage.days, startDate, endDate, invalidRange],
  );
  const coverage = useMemo(() => computeUsageCoverage(days, 0), [days]);
  const statistics = useMemo(() => computeUsageStatistics(days), [days]);
  const sevenDay = useMemo(() => computePeriodComparison(days, 7), [days]);
  const thirtyDay = useMemo(() => computePeriodComparison(days, 30), [days]);

  // Explain honest empty states instead of rendering fabricated charts.
  if (snapshot.usage.state === 'unavailable') {
    return (
      <>
        <header className="page-header">
          <div>
            <p className="eyebrow">Aggregate token activity</p>
            <h1>Usage</h1>
          </div>
        </header>
        <section className="state-panel" aria-labelledby="usage-empty-title">
          <span className="state-icon" aria-hidden="true">
            ○
          </span>
          <div>
            <h2 id="usage-empty-title">Aggregate usage is unavailable</h2>
            <p>
              Connect to Codex and refresh to read approved aggregate token activity. Token totals
              do not directly determine quota percentage;{' '}
              <a href="#learn/tokens-vs-quota">read why these measurements differ</a>.
            </p>
          </div>
        </section>
      </>
    );
  }

  // Render the complete Usage route.
  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Aggregate token activity reported by Codex</p>
          <h1>Usage</h1>
        </div>
      </header>

      {snapshot.usage.state === 'partial' ? (
        <section className="partial-banner" role="status">
          The source covered this data incompletely. Values below reflect only valid supplied
          records.
        </section>
      ) : null}

      <section className="panel" aria-label="Usage date range">
        <div className="section-heading">
          <label>
            Start date
            <input
              type="date"
              min="1000-01-01"
              max="9999-12-31"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              aria-invalid={invalidRange}
              aria-describedby="usage-range-note"
            />
          </label>
          <label>
            End date
            <input
              type="date"
              min="1000-01-01"
              max="9999-12-31"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              aria-invalid={invalidRange}
              aria-describedby="usage-range-note"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
          >
            All supplied dates
          </button>
        </div>
        {invalidRange && (
          <p role="alert">Choose valid dates with the start on or before the end.</p>
        )}
        <p id="usage-range-note" className="panel-note">
          Dates are inclusive; a blank boundary is unrestricted. Daily views, statistics,
          comparisons, and coverage use only supplied buckets in this range. Missing dates are
          identified only between supplied bounds; dates outside them have unknown coverage.
          Codex-reported summary values below describe the full source response.
        </p>
      </section>

      <div className="summary-cards" role="group" aria-label="Usage summary cards">
        <SummaryCard
          label="Lifetime"
          value={formatCounterCompact(snapshot.usage.summary.lifetimeTokens)}
          exact={formatCounter(snapshot.usage.summary.lifetimeTokens)}
        />
        <SummaryCard
          label="Peak supplied day"
          value={formatCounterCompact(snapshot.usage.summary.peakDailyTokens)}
          exact={formatCounter(snapshot.usage.summary.peakDailyTokens)}
        />
        <SummaryCard
          label="Current streak"
          value={
            snapshot.usage.summary.currentStreakDays === null
              ? 'Unavailable'
              : `${snapshot.usage.summary.currentStreakDays} days`
          }
          exact="Codex-reported streak"
        />
        <SummaryCard
          label="Longest turn"
          value={
            snapshot.usage.summary.longestTurnSeconds === null
              ? 'Unavailable'
              : `${Math.round(snapshot.usage.summary.longestTurnSeconds / 60)} min`
          }
          exact="Codex-reported duration"
        />
      </div>

      <section className="panel" aria-labelledby="daily-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Supplied aggregate daily buckets only</p>
            <h2 id="daily-title">Daily activity</h2>
          </div>
          <div className="view-toggle" role="group" aria-label="Daily view format">
            <button type="button" aria-pressed={view === 'chart'} onClick={() => setView('chart')}>
              Chart
            </button>
            <button type="button" aria-pressed={view === 'table'} onClick={() => setView('table')}>
              Table
            </button>
          </div>
        </div>

        {days.length === 0 ? (
          <p className="empty-detail">No dated buckets were supplied in the selected range.</p>
        ) : view === 'chart' ? (
          <DailyChart days={days} theme={preferences.theme} />
        ) : (
          <div className="table-scroll" tabIndex={0} role="region" aria-label="Daily usage table">
            <table className="data-table">
              <caption>Daily token totals as reported by Codex</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Tokens</th>
                  <th scope="col">Provenance</th>
                </tr>
              </thead>
              <tbody>
                {[...days].reverse().map((day) => (
                  <tr key={day.date}>
                    <th scope="row">{formatDateKey(day.date)}</th>
                    <td>{day.tokens === '0' ? '0 (reported zero)' : formatCounter(day.tokens)}</td>
                    <td>{day.provenance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="panel-note">
          Token totals do not directly determine quota percentage.{' '}
          <a href="#learn/tokens-vs-quota">Learn why</a>.
        </p>
      </section>

      <section className="panel" aria-labelledby="heatmap-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Reported zero, positive, and missing are distinct</p>
            <h2 id="heatmap-title">Calendar heatmap</h2>
          </div>
        </div>
        <CalendarHeatmap days={days} />
      </section>

      <section className="panel" aria-labelledby="stats-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              Selected supplied range: {days.length > 0 ? `${days.length} days` : 'none'}
            </p>
            <h2 id="stats-title">Activity statistics</h2>
          </div>
        </div>
        <div className="summary-cards" role="group" aria-label="Activity statistics">
          <SummaryCard
            label="Total"
            value={formatStatistic(statistics.total.displayValue)}
            exact={statistics.total.explanationKey}
          />
          <SummaryCard
            label="Daily average"
            value={formatStatistic(statistics.dailyAverage.displayValue)}
            exact={statistics.dailyAverage.explanationKey}
          />
          <SummaryCard
            label="Active-day average"
            value={formatStatistic(statistics.activeDayAverage.displayValue)}
            exact={statistics.activeDayAverage.explanationKey}
          />
          <SummaryCard
            label="Median day"
            value={formatStatistic(statistics.median.displayValue)}
            exact={statistics.median.explanationKey}
          />
          <SummaryCard
            label={`Highest supplied day${statistics.highestSuppliedDay.tiedDates.length > 1 ? ' (tie)' : ''}`}
            value={formatStatistic(statistics.highestSuppliedDay.displayValue)}
            exact={statistics.highestSuppliedDay.explanationKey}
          />
          <SummaryCard
            label="Active days"
            value={`${statistics.activeDayCount.displayValue ?? '0'} of ${days.length}`}
            exact={statistics.activeDayCount.explanationKey}
          />
        </div>
        <p className="panel-note">
          Highest supplied day is not necessarily the lifetime peak day. Statistics describe exactly
          the labeled supplied range.
        </p>
      </section>

      <section className="panel" aria-labelledby="comparison-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Complete consecutive periods only</p>
            <h2 id="comparison-title">Complete period comparison</h2>
          </div>
        </div>
        <ComparisonBlock
          title="Latest complete 7-day period"
          comparison={sevenDay}
          timeFormat={preferences.timeFormat}
        />
        <ComparisonBlock
          title="Latest complete 30-day period"
          comparison={thirtyDay}
          timeFormat={preferences.timeFormat}
        />
      </section>

      <section className="panel" aria-labelledby="coverage-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">What the source supplied in the selected range</p>
            <h2 id="coverage-title">Data coverage</h2>
          </div>
        </div>
        <dl className="metric-grid">
          <div className="metric-line">
            <dt>Valid dated buckets</dt>
            <dd>
              <span>{coverage.validDateCount}</span>
              <small>Accepted records</small>
            </dd>
          </div>
          <div className="metric-line">
            <dt>Reported zero days</dt>
            <dd>
              <span>{coverage.reportedZeroCount}</span>
              <small>Distinct from missing</small>
            </dd>
          </div>
          <div className="metric-line">
            <dt>Rejected invalid records (full response)</dt>
            <dd>
              <span>{snapshot.usage.coverage.rejectedRecordCount}</span>
              <small>Cannot be assigned reliably to the selected range</small>
            </dd>
          </div>
          <div className="metric-line">
            <dt>Supplied span</dt>
            <dd>
              <span>
                {coverage.firstValidDate === null
                  ? 'No dates supplied'
                  : `${formatDateKey(coverage.firstValidDate)} to ${formatDateKey(
                      coverage.lastValidDate ?? '',
                    )}`}
              </span>
              <small>Codex-reported bounds</small>
            </dd>
          </div>
        </dl>
        {coverage.missingDates.length > 0 ? (
          <p className="panel-note">
            Missing dates inside the supplied span: {coverage.missingDates.join(', ')}
            {coverage.missingDatesTruncated ? ' … (list truncated)' : ''}{' '}
            <a href="#learn/missing-days-statistics">How missing days are handled</a>.
          </p>
        ) : null}
        <p className="panel-note">
          Coverage describes supplied bounds within the selected range. It does not inspect tasks.
        </p>
      </section>
    </>
  );
}

// Render one compact summary card with an exact accessible description.
function SummaryCard({ label, value, exact }: { label: string; value: string; exact: string }) {
  return (
    <div className="summary-card">
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <small>{exact}</small>
    </div>
  );
}

// Render one complete-period comparison block with honest availability language.
function ComparisonBlock({
  title,
  comparison,
}: {
  title: string;
  comparison: ReturnType<typeof computePeriodComparison>;
  timeFormat: Preferences['timeFormat'];
}) {
  // Explain unavailability with the stable reason instead of partial numbers.
  if (!comparison.available) {
    return (
      <div className="comparison-block">
        <h3>{title}</h3>
        <p className="empty-detail">
          {comparison.unavailableReasonKey === 'comparison-requires-more-dates'
            ? 'Unavailable: the source does not yet cover two complete consecutive periods.'
            : 'Unavailable: no valid dates were supplied.'}
        </p>
      </div>
    );
  }

  // Select the reviewed sentence for the both-zero case.
  const differenceText =
    comparison.bothPeriodsZero && comparison.absoluteDifference === '0'
      ? 'No activity in either complete period.'
      : `${comparison.absoluteDifference?.startsWith('-') ? '' : '+'}${formatCounterDifference(
          comparison.absoluteDifference,
        )} tokens`;

  // Render the labeled periods with exact totals and conditional relative change.
  return (
    <div className="comparison-block">
      <h3>{title}</h3>
      <dl className="metric-grid metric-grid--compact">
        <div className="metric-line">
          <dt>Latest period</dt>
          <dd>
            <span>
              {formatDateKey(comparison.latestRange?.start ?? '')} to{' '}
              {formatDateKey(comparison.latestRange?.end ?? '')}
            </span>
            <small>{formatCounter(comparison.latestTotal)} tokens</small>
          </dd>
        </div>
        <div className="metric-line">
          <dt>Preceding period</dt>
          <dd>
            <span>
              {formatDateKey(comparison.precedingRange?.start ?? '')} to{' '}
              {formatDateKey(comparison.precedingRange?.end ?? '')}
            </span>
            <small>{formatCounter(comparison.precedingTotal)} tokens</small>
          </dd>
        </div>
        <div className="metric-line">
          <dt>Difference</dt>
          <dd>
            <span>{differenceText}</span>
            <small>Exact integer arithmetic</small>
          </dd>
        </div>
        <div className="metric-line">
          <dt>Relative change</dt>
          <dd>
            <span>
              {comparison.relativeChangePercent === null
                ? 'Unavailable'
                : `${comparison.relativeChangePercent.startsWith('-') ? '' : '+'}${comparison.relativeChangePercent}%`}
            </span>
            <small>Requires a positive preceding total</small>
          </dd>
        </div>
      </dl>
    </div>
  );
}

// Render the daily bar chart through ECharts with an SVG renderer and a text alternative nearby.
function DailyChart({
  days,
  theme,
}: {
  days: OverviewSnapshot['usage']['days'];
  theme: Preferences['theme'];
}) {
  // Own the chart container through a stable ref for deterministic lifecycle management.
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Re-resolve theme colors when the explicit preference changes and when the operating system
  // flips its scheme under the "system" preference. The memo derives during render from the
  // theme input; the effect only subscribes to the external media-query system, never calling
  // setState synchronously in its body.
  const [systemSchemeChangeCount, bumpSystemScheme] = useState(0);
  useEffect(() => {
    // jsdom-based component suites provide no matchMedia; live scheme flips are a real-browser
    // capability, so absence simply means the explicit-preference path still re-resolves.
    if (theme !== 'system' || typeof window.matchMedia !== 'function') return;
    const scheme = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (): void => bumpSystemScheme((count) => count + 1);
    scheme.addEventListener('change', onChange);
    return () => scheme.removeEventListener('change', onChange);
  }, [theme]);
  const palette = useMemo(() => {
    // Reference both inputs so an explicit preference change or a live scheme flip re-reads
    // computed tokens even though neither value is used directly in the body.
    void systemSchemeChangeCount;
    void theme;
    return resolveDailyChartPalette();
  }, [theme, systemSchemeChangeCount]);

  // Construct the option object from exact values and the resolved palette.
  const option = useMemo(() => buildDailyChartOption(palette, days), [palette, days]);

  // Attach one ECharts instance to the container with deterministic cleanup.
  useEffect(() => {
    // Skip until the ref resolves to the rendered container.
    const container = containerRef.current;
    if (container === null) return;

    // Initialize with the SVG renderer for crisp scaling and lower memory on small charts.
    const instance = echarts.init(container, undefined, { renderer: 'svg' });
    instance.setOption(option);

    const resize = (): void => {
      instance.resize();
    };
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
    observer?.observe(container);
    window.addEventListener('resize', resize);

    // Dispose deterministically so repeated views cannot leak instances.
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', resize);
      instance.dispose();
    };
  }, [option]);

  const hasCappedValues = days.some((day) => BigInt(day.tokens) > BigInt(Number.MAX_SAFE_INTEGER));

  // Provide the canvas-free text alternative directly beneath the chart region.
  return (
    <div>
      {hasCappedValues && (
        <p>
          Bar heights are capped at the largest safe chart value. Tooltips and the table show exact
          totals.
        </p>
      )}
      <div
        ref={containerRef}
        role="img"
        aria-label={`Bar chart of daily token totals across ${days.length} supplied days. The accessible table view contains the same values.`}
        style={{ width: '100%', height: 260 }}
      />
    </div>
  );
}

// Format one calendar key as a medium local date without shifting its calendar meaning.
export function formatDateKey(dateKey: string): string {
  // Parse the strict key into validated fields before formatting.
  const parsed = parseCalendarDateKey(dateKey);
  if (parsed === null) return dateKey;

  // Fix the formatting timezone because calendar keys represent dates, not local instants.
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day, 12)),
  );
}

// Render the calendar heatmap as an accessible CSS grid with distinct cell states.
function CalendarHeatmap({ days }: { days: OverviewSnapshot['usage']['days'] }) {
  // Index supplied days by their calendar key for constant-time classification.
  const byKey = useMemo(() => new Map(days.map((day) => [day.date, day])), [days]);

  // Determine the rendered month span from the supplied bounds.
  const first = days[0]?.date;
  const last = days[days.length - 1]?.date;
  if (first === undefined || last === undefined) {
    return <p className="empty-detail">No dated buckets were supplied.</p>;
  }

  // Enumerate every calendar key in the supplied span so missing cells render explicitly.
  const start = parseCalendarDateKey(first)!;
  const end = parseCalendarDateKey(last)!;
  const spanLength = calendarDayDifference(end, start) + 1;
  const keys = enumerateConsecutiveDateKeys(end, Math.min(spanLength, 366));

  // Classify each cell into the closed visual states.
  const cells = keys.map((key) => {
    const day = byKey.get(key);
    if (day === undefined) return { key, state: 'missing' as const, value: null };
    const parsed = parseDecimalCounter(day.tokens);
    if (parsed === null || parsed === 0n) return { key, state: 'zero' as const, value: '0' };
    return { key, state: 'positive' as const, value: day.tokens };
  });

  // Render the grid with per-cell accessible labels that never confuse zero with missing.
  return (
    <>
      {spanLength > 366 && (
        <p>Heatmap shows the latest 366 calendar dates in the supplied range.</p>
      )}
      <div className="heatmap-grid" role="list" aria-label="Calendar heatmap of daily activity">
        {cells.map((cell) => (
          <div
            key={cell.key}
            role="listitem"
            className={`heatmap-cell heatmap-cell--${cell.state}`}
            title={`${formatDateKey(cell.key)}: ${
              cell.state === 'missing'
                ? 'missing date, activity unknown'
                : cell.state === 'zero'
                  ? 'reported zero'
                  : `${formatCounter(cell.value)} tokens`
            }`}
          >
            <span className="visually-hidden">
              {formatDateKey(cell.key)}:{' '}
              {cell.state === 'missing'
                ? 'missing date, activity unknown'
                : cell.state === 'zero'
                  ? 'reported zero'
                  : `${formatCounter(cell.value)} tokens`}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
