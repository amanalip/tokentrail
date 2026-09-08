import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { createLoadingOverviewSnapshot } from '../../shared/contracts/overview-snapshot';
import { createDefaultPreferences } from '../../shared/contracts/preferences';
import { UsageRoute, formatDateKey } from './UsageRoute';

const chart = vi.hoisted(() => ({ resize: vi.fn(), dispose: vi.fn(), setOption: vi.fn() }));
vi.mock('echarts/core', () => ({ use: vi.fn(), init: () => chart }));

it('applies inclusive ranges to chart, table, heatmap, statistics and coverage across refreshes', () => {
  const base = createLoadingOverviewSnapshot(null);
  const snapshot = {
    ...base,
    usage: {
      ...base.usage,
      state: 'ready' as const,
      days: [
        { date: '2026-09-01', tokens: '100', provenance: 'codex-reported' as const },
        { date: '2026-09-02', tokens: '0', provenance: 'codex-reported' as const },
        { date: '2026-09-04', tokens: '4', provenance: 'codex-reported' as const },
      ],
    },
  };
  const { rerender } = render(
    <UsageRoute snapshot={snapshot} preferences={createDefaultPreferences()} />,
  );
  fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-09-02' } });
  fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2026-09-04' } });
  expect(chart.setOption.mock.lastCall?.[0].series[0].data).toEqual([0, 4]);
  expect(screen.getAllByRole('listitem')).toHaveLength(3);
  expect(screen.getByText(/Missing dates inside the supplied span/).textContent).toContain(
    '2026-09-03',
  );
  expect(
    within(screen.getByRole('group', { name: 'Activity statistics' }))
      .getByText('Total')
      .parentElement?.querySelector('strong')?.textContent,
  ).toBe('4');
  fireEvent.click(screen.getByRole('button', { name: 'Table' }));
  const table = screen.getByRole('table');
  expect(within(table).queryByText(formatDateKey('2026-09-01'))).toBeNull();
  expect(within(table).getByText('0 (reported zero)')).toBeTruthy();
  expect(within(table).getAllByRole('row')).toHaveLength(3);
  rerender(
    <UsageRoute
      snapshot={{
        ...snapshot,
        usage: {
          ...snapshot.usage,
          days: [
            ...snapshot.usage.days,
            { date: '2026-09-05', tokens: '500', provenance: 'codex-reported' },
          ],
        },
      }}
      preferences={createDefaultPreferences()}
    />,
  );
  expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(3);
  fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-09-05' } });
  expect(screen.getByRole('alert')).toBeTruthy();
  expect(screen.queryByRole('table')).toBeNull();
  fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2026-09-05' } });
  expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'All supplied dates' }));
  expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(5);
  fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2027-01-01' } });
  expect(screen.queryByRole('table')).toBeNull();
  expect(screen.getByText('No dated buckets were supplied in the selected range.')).toBeTruthy();
});

it('restricts complete-period comparisons to the selection', () => {
  const base = createLoadingOverviewSnapshot(null);
  render(
    <UsageRoute
      preferences={createDefaultPreferences()}
      snapshot={{
        ...base,
        usage: {
          ...base.usage,
          state: 'ready',
          days: Array.from({ length: 14 }, (_, index) => ({
            date: `2026-09-${String(index + 1).padStart(2, '0')}`,
            tokens: '1',
            provenance: 'codex-reported',
          })),
        },
      }}
    />,
  );
  expect(screen.getByText('+0 tokens')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-09-02' } });
  expect(screen.queryByText('+0 tokens')).toBeNull();
  expect(screen.getAllByText(/Unavailable: the source does not yet cover/)).toHaveLength(2);
});
