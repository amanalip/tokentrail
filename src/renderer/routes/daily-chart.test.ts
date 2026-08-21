// Import Vitest's assertion and test-case helpers through explicit imports like every other suite.
import { describe, expect, it } from 'vitest';

// Import the chart option builder and palette contract under test.
import { buildDailyChartOption, type DailyChartPalette } from './UsageRoute';

// Import the normalized snapshot factory so fixtures pass the public boundary schema.
import {
  createLoadingOverviewSnapshot,
  overviewSnapshotSchema,
} from '../../shared/contracts/overview-snapshot';

/**
 * Daily chart option contract tests.
 *
 * Responsibility: lock how theme tokens map into ECharts options so charts stay legible in every
 * theme without raw colors leaking into component code. Trust level: pure function checks with no
 * DOM or Electron involvement. Dependencies: only the authored builder beside this test.
 * Side effects: none. Denied behavior: these tests never render ECharts itself; rendering is
 * proven by the component suites and end-to-end sweeps instead.
 */

// One fixed palette makes every assertion independent of whatever computed styles a test
// environment happens to expose.
const PALETTE: DailyChartPalette = Object.freeze({
  series: '#00aa00',
  axisLabel: '#111111',
  axisLine: '#222222',
  splitLine: '#333333',
  tooltipBackground: '#444444',
  tooltipBorder: '#555555',
  tooltipText: '#666666',
});

// Build a small valid day list through the real snapshot schema so fixtures stay honest.
function createDays(count: number) {
  const base = createLoadingOverviewSnapshot('2026-08-21T12:00:00.000Z');
  const days = Array.from({ length: count }, (_, index) => ({
    date: `2026-08-${String(index + 1).padStart(2, '0')}`,
    tokens: String((index + 1) * 1000),
    provenance: 'codex-reported' as const,
  }));
  return overviewSnapshotSchema.parse({ ...base, usage: { ...base.usage, days } }).usage.days;
}

describe('daily chart options', () => {
  it('wires the resolved palette into series, axes, and tooltip', () => {
    // Every color surface must come from the palette argument, never from an internal literal.
    const option = buildDailyChartOption(PALETTE, createDays(3));

    expect(option.series[0]?.itemStyle).toEqual({ color: PALETTE.series });
    expect(option.xAxis.axisLabel).toEqual({ color: PALETTE.axisLabel });
    expect(option.xAxis.axisLine).toEqual({ lineStyle: { color: PALETTE.axisLine } });
    expect(option.yAxis.splitLine).toEqual({ lineStyle: { color: PALETTE.splitLine } });
    expect(option.tooltip.backgroundColor).toBe(PALETTE.tooltipBackground);
    expect(option.tooltip.borderColor).toBe(PALETTE.tooltipBorder);
    expect(option.tooltip.textStyle).toEqual({ color: PALETTE.tooltipText });
  });

  it('keeps animation disabled so refreshes never replay decorative motion', () => {
    // The reduced-motion contract and idle-CPU budget both forbid replaying entrance animations
    // on every snapshot update.
    const option = buildDailyChartOption(PALETTE, createDays(2));
    expect(option.animation).toBe(false);
  });

  it('maps each supplied day into one labeled category with its safe numeric value', () => {
    // Category labels derive from calendar keys through the shared formatter; values use the
    // reviewed geometry-only conversion that clamps beyond the safe integer maximum.
    const option = buildDailyChartOption(PALETTE, createDays(3));

    expect(option.xAxis.data).toHaveLength(3);
    expect(option.series[0]?.data).toEqual([1000, 2000, 3000]);
  });

  it('maps reported zero days to zero geometry without inventing data', () => {
    // A reported zero is real data and must render as a zero-height bar; a missing day never
    // appears in the supplied list at all, so absence stays the table's honesty contract.
    const base = createLoadingOverviewSnapshot('2026-08-21T12:00:00.000Z');
    const days = overviewSnapshotSchema.parse({
      ...base,
      usage: {
        ...base.usage,
        days: [
          { date: '2026-08-01', tokens: '500', provenance: 'codex-reported' },
          { date: '2026-08-02', tokens: '0', provenance: 'codex-reported' },
        ],
      },
    }).usage.days;

    const option = buildDailyChartOption(PALETTE, days);
    expect(option.series[0]?.data).toEqual([500, 0]);
  });

  it('clamps counters beyond safe integer precision instead of distorting geometry', () => {
    // Exact values beyond Number.MAX_SAFE_INTEGER cannot be drawn; the reviewed conversion pins
    // them at the safe maximum while the table and totals remain exact bigint presentations.
    const huge = `${Number.MAX_SAFE_INTEGER}`.padEnd(40, '7');
    const base = createLoadingOverviewSnapshot('2026-08-21T12:00:00.000Z');
    const days = overviewSnapshotSchema.parse({
      ...base,
      usage: {
        ...base.usage,
        days: [{ date: '2026-08-01', tokens: huge, provenance: 'codex-reported' }],
      },
    }).usage.days;

    const option = buildDailyChartOption(PALETTE, days);
    expect(option.series[0]?.data).toEqual([Number.MAX_SAFE_INTEGER]);
  });
});
