// Import Vitest assertions and grouping helpers.
import { describe, expect, it } from 'vitest';

// Import the ordering functions under test.
import { buildResetTimeline, orderQuotaAttention, selectPrimaryWindow } from './quota-ordering';

// Import normalized contract types for fixture construction.
import type { QuotaBucket, QuotaWindow } from '../contracts/overview-snapshot';
import { createNumericMetric } from '../contracts/metric';

// Construct one valid window with explicit metric values.
function window(
  kind: 'primary' | 'secondary',
  usedPercent: number | null,
  resetsAt: number | null,
): QuotaWindow {
  return {
    kind,
    usedPercent: createNumericMetric(
      usedPercent,
      usedPercent === null ? 'unavailable' : 'codex-reported',
      usedPercent === null ? 'used-percentage-unavailable' : 'used-percentage-reported',
    ),
    remainingPercent: createNumericMetric(
      usedPercent === null ? null : 100 - usedPercent,
      'calculated',
      'remaining-is-one-hundred-minus-used',
    ),
    durationMinutes: createNumericMetric(300, 'codex-reported', 'duration-reported-in-minutes'),
    resetsAt: createNumericMetric(
      resetsAt,
      resetsAt === null ? 'unavailable' : 'codex-reported',
      resetsAt === null ? 'reset-time-unavailable' : 'reset-time-reported',
    ),
  };
}

// Construct one bucket with deterministic identity fields.
function bucket(
  id: string,
  name: string,
  windows: readonly QuotaWindow[],
  reached = false,
): QuotaBucket {
  return { id, name, planType: 'plus', reached, windows: [...windows] };
}

// Use one fixed current time so future-reset classification is deterministic.
const NOW = 1_000_000;

// Group behavior around reset-timeline construction.
describe('buildResetTimeline', () => {
  it('orders valid future resets chronologically then by stable identity', () => {
    const quotas = [
      bucket('b', 'B', [window('primary', 10, NOW + 200)]),
      bucket('a', 'A', [window('primary', 20, NOW + 100), window('secondary', 30, NOW + 100)]),
    ];
    const timeline = buildResetTimeline(quotas, NOW);

    // Equal timestamps fall back to stable bucket-then-window identity.
    expect(timeline.entries.map((entry) => `${entry.bucketId}:${entry.windowKind}`)).toEqual([
      'a:primary',
      'a:secondary',
      'b:primary',
    ]);
    expect(timeline.unknownTimeEntries).toEqual([]);
  });

  it('keeps missing and past timestamps in the unknown-time group without treating them as upcoming', () => {
    const quotas = [
      bucket('a', 'A', [window('primary', 10, null)]),
      bucket('b', 'B', [window('primary', 20, NOW - 1)]),
      bucket('c', 'C', [window('primary', 30, NOW + 50)]),
    ];
    const timeline = buildResetTimeline(quotas, NOW);

    // Only the strictly future timestamp enters the ordered list.
    expect(timeline.entries.map((entry) => entry.bucketId)).toEqual(['c']);

    // Missing and already-passed times stay visible as unknown rather than disappearing.
    expect(timeline.unknownTimeEntries.map((entry) => entry.bucketId)).toEqual(['a', 'b']);
  });
});

// Group behavior around attention ordering.
describe('orderQuotaAttention', () => {
  it('places reached buckets first, then orders by highest used percentage', () => {
    const low = bucket('low', 'Low', [window('primary', 10, NOW + 300)]);
    const high = bucket('high', 'High', [window('primary', 96, NOW + 200)]);
    const reached = bucket('reached', 'Reached', [window('primary', 40, NOW + 100)], true);
    const ordered = orderQuotaAttention([low, high, reached], NOW);

    // Rule 1 precedes rule 2 regardless of percentage.
    expect(ordered.map((group) => group.bucket.id)).toEqual(['reached', 'high', 'low']);
  });

  it('orders windows descending by percentage, ties by earliest reset, then identifier', () => {
    const group = bucket('g', 'G', [
      window('secondary', 50, NOW + 900),
      window('primary', 50, NOW + 100),
    ]);
    const ordered = orderQuotaAttention([group], NOW);

    // Equal percentages order by earliest valid future reset.
    expect(ordered[0]?.windows.map((entry) => entry.window.kind)).toEqual(['primary', 'secondary']);
  });

  it('sorts entries lacking a valid percentage after entries that contain one', () => {
    const unavailable = bucket('u', 'U', [window('primary', null, NOW + 100)]);
    const available = bucket('a', 'A', [window('primary', 5, NOW + 900)]);
    const ordered = orderQuotaAttention([unavailable, available], NOW);

    // Rule 6 keeps unavailable percentages visible but last.
    expect(ordered.map((group) => group.bucket.id)).toEqual(['a', 'u']);
  });

  it('breaks full ties by stable bucket identifier', () => {
    const second = bucket('beta', 'Beta', [window('primary', 50, NOW + 100)]);
    const first = bucket('alpha', 'Alpha', [window('primary', 50, NOW + 100)]);
    const ordered = orderQuotaAttention([second, first], NOW);
    expect(ordered.map((group) => group.bucket.id)).toEqual(['alpha', 'beta']);
  });
});

// Group behavior around primary-window selection.
describe('selectPrimaryWindow', () => {
  it('prefers the first server-designated primary window in stable bucket order', () => {
    const quotas = [
      bucket('a', 'A', [window('secondary', 10, NOW)]),
      bucket('b', 'B', [window('primary', 20, NOW)]),
    ];
    const selection = selectPrimaryWindow(quotas);
    expect(selection?.bucket.id).toBe('b');
    expect(selection?.window.kind).toBe('primary');
  });

  it('falls back to the first available window when no primary slot exists', () => {
    const quotas = [bucket('a', 'A', [window('secondary', 10, NOW)])];
    const selection = selectPrimaryWindow(quotas);
    expect(selection?.bucket.id).toBe('a');
    expect(selection?.window.kind).toBe('secondary');
  });

  it('returns null without fabricating a window', () => {
    expect(selectPrimaryWindow([])).toBeNull();
    expect(selectPrimaryWindow([bucket('a', 'A', [])])).toBeNull();
  });
});
