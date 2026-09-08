import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { createDefaultPreferences } from '../shared/contracts/preferences';
import { createLoadingOverviewSnapshot } from '../shared/contracts/overview-snapshot';
import { useOverviewSnapshot, usePreferences } from './hooks';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

it('ignores late initial and refresh replies after pushed snapshots', async () => {
  const initial = deferred<ReturnType<typeof createLoadingOverviewSnapshot>>();
  const refresh = deferred<ReturnType<typeof createLoadingOverviewSnapshot>>();
  let emit!: (snapshot: ReturnType<typeof createLoadingOverviewSnapshot>) => void;
  Object.defineProperty(window, 'tokenTrail', {
    configurable: true,
    value: {
      getOverviewSnapshot: () => initial.promise,
      onOverviewChanged: (listener: typeof emit) => {
        emit = listener;
        return () => undefined;
      },
      refreshOverview: () => refresh.promise,
    },
  });
  const { result } = renderHook(useOverviewSnapshot);
  const newer = createLoadingOverviewSnapshot('2026-09-07T12:00:00.000Z');
  act(() => emit(newer));
  await act(async () => initial.resolve(createLoadingOverviewSnapshot(null)));
  expect(result.current.snapshot).toEqual(newer);
  let pending!: Promise<void>;
  act(() => {
    pending = result.current.refresh();
  });
  const latest = createLoadingOverviewSnapshot('2026-09-07T13:00:00.000Z');
  act(() => emit(latest));
  await act(async () => {
    refresh.resolve(newer);
    await pending;
  });
  expect(result.current.snapshot).toEqual(latest);
});

it('keeps rapid preference edits and rolls back a failed save with visible error', async () => {
  const first = deferred<ReturnType<typeof createDefaultPreferences>>();
  const setPreferences = vi
    .fn()
    .mockReturnValueOnce(first.promise)
    .mockImplementation(async (value) => value);
  Object.defineProperty(window, 'tokenTrail', {
    configurable: true,
    value: {
      getPreferences: async () => createDefaultPreferences(),
      setPreferences,
    },
  });
  const { result } = renderHook(usePreferences);
  await act(async () => undefined);
  let saveFirst!: Promise<void>;
  act(() => {
    saveFirst = result.current.savePreferences({ ...result.current.preferences, theme: 'dark' });
  });
  let saveSecond!: Promise<void>;
  act(() => {
    saveSecond = result.current.savePreferences({
      ...result.current.preferences,
      timeFormat: '24h',
    });
  });
  await act(async () => {
    first.resolve({ ...createDefaultPreferences(), theme: 'dark' });
    await Promise.all([saveFirst, saveSecond]);
  });
  expect(result.current.preferences).toMatchObject({ theme: 'dark', timeFormat: '24h' });
  expect(setPreferences.mock.calls[1]?.[0]).toMatchObject({ theme: 'dark', timeFormat: '24h' });
  setPreferences.mockRejectedValueOnce(new Error('private filesystem path'));
  await act(async () =>
    result.current.savePreferences({ ...result.current.preferences, theme: 'light' }),
  );
  expect(result.current.preferences.theme).toBe('dark');
  expect(result.current.error).toContain('Could not save preferences');
  expect(result.current.error).not.toContain('private');
});

it('catches failed snapshot loads and refreshes and recovers on retry', async () => {
  const refreshOverview = vi
    .fn()
    .mockRejectedValueOnce(new Error('private'))
    .mockResolvedValue(createLoadingOverviewSnapshot(null));
  Object.defineProperty(window, 'tokenTrail', {
    configurable: true,
    value: {
      getOverviewSnapshot: async () => {
        throw new Error('private');
      },
      onOverviewChanged: () => () => undefined,
      refreshOverview,
    },
  });
  const { result } = renderHook(useOverviewSnapshot);
  await waitFor(() => expect(result.current.error).toContain('Could not load'));
  await act(async () => result.current.refresh());
  expect(result.current.error).toContain('Could not refresh');
  expect(result.current.isRefreshing).toBe(false);
  await act(async () => result.current.refresh());
  expect(result.current.error).toBeNull();
});
