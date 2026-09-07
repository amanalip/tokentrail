import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { createLoadingOverviewSnapshot } from '../../shared/contracts/overview-snapshot';
import { createDefaultPreferences } from '../../shared/contracts/preferences';
import { UsageRoute, formatDateKey } from './UsageRoute';
import { LearnRoute } from './LearnRoute';

const chart = vi.hoisted(() => ({ resize: vi.fn(), dispose: vi.fn(), setOption: vi.fn() }));
vi.mock('echarts/core', () => ({ use: vi.fn(), init: () => chart }));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it('bounds extreme heatmaps and resizes/disposes the owned chart', () => {
  const base = createLoadingOverviewSnapshot(null);
  let resize: () => void = () => undefined;
  const disconnect = vi.fn();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe = vi.fn();
      disconnect = disconnect;
    },
  );
  const { unmount } = render(
    <UsageRoute
      preferences={createDefaultPreferences()}
      snapshot={{
        ...base,
        usage: {
          ...base.usage,
          state: 'partial',
          days: [
            { date: '1000-01-01', tokens: '1', provenance: 'codex-reported' },
            { date: '9999-12-31', tokens: '12345678901234567890', provenance: 'codex-reported' },
          ],
        },
      }}
    />,
  );
  expect(screen.getAllByRole('listitem')).toHaveLength(366);
  expect(screen.getByText(/Heatmap shows the latest 366/)).toBeTruthy();
  expect(screen.getByText(/Bar heights are capped/)).toBeTruthy();
  act(() => resize());
  expect(chart.resize).toHaveBeenCalledTimes(1);
  unmount();
  expect(disconnect).toHaveBeenCalledTimes(1);
  expect(chart.dispose).toHaveBeenCalledTimes(1);
});

it.each(['Pacific/Kiritimati', 'Pacific/Auckland', 'America/New_York', 'Pacific/Honolulu'])(
  'preserves source calendar dates in %s',
  (timezone) => {
    vi.stubEnv('TZ', timezone);
    expect(formatDateKey('2026-09-07')).toBe(
      new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' }).format(
        new Date('2026-09-07T00:00:00Z'),
      ),
    );
  },
);

it('keeps focus in Learn search after a deep link and honors reduced motion', async () => {
  const scroll = vi.fn();
  const original = HTMLElement.prototype.scrollIntoView;
  HTMLElement.prototype.scrollIntoView = scroll;
  try {
    render(<LearnRoute focusEntryId="tokens-vs-quota" reducedMotion="reduced" />);
    expect(scroll).toHaveBeenCalledWith({ block: 'start', behavior: 'instant' });
    const user = userEvent.setup();
    const search = screen.getByRole('searchbox');
    await user.type(search, 'tokens');
    expect(document.activeElement).toBe(search);
    expect(search).toHaveProperty('value', 'tokens');
    expect(scroll).toHaveBeenCalledTimes(1);
  } finally {
    HTMLElement.prototype.scrollIntoView = original;
  }
});
