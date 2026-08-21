// Import Vitest's deterministic assertions and mock helper.
import { describe, expect, it, vi } from 'vitest';

// Import the safe local error used to simulate connection failures without raw messages.
import { CodexProcessError } from '../codex/codex-process-client';

// Import the controller and its narrow structural client seam.
import { OverviewController, type OverviewProcessClient } from './overview-controller';

// Return one complete synthetic response set with no real account identifiers.
function createSuccessfulResponses(): Readonly<Record<string, unknown>> {
  return {
    'account/read': {
      account: { type: 'chatgpt', planType: 'plus' },
      requiresOpenaiAuth: true,
    },
    'account/rateLimits/read': {
      rateLimits: {
        limitId: 'codex',
        limitName: 'Codex',
        primary: { usedPercent: 37, windowDurationMins: 300, resetsAt: 1_800_000_000 },
        secondary: null,
        planType: 'plus',
        rateLimitReachedType: null,
      },
      rateLimitsByLimitId: null,
    },
    'account/usage/read': {
      summary: { lifetimeTokens: '4201400', currentStreakDays: 8 },
      dailyBuckets: [
        { date: '2026-08-12', tokens: '91210' },
        { date: '2026-08-13', tokens: '124500' },
      ],
    },
  };
}

// Build one structural fake that supports success, failure, or a deliberately deferred account read.
function createFakeClient(
  options: {
    readonly failure?: CodexProcessError;
    readonly accountGate?: Promise<void>;
  } = {},
): OverviewProcessClient & {
  readonly request: ReturnType<typeof vi.fn<OverviewProcessClient['request']>>;
  readonly start: ReturnType<typeof vi.fn<OverviewProcessClient['start']>>;
  readonly stop: ReturnType<typeof vi.fn<OverviewProcessClient['stop']>>;
} {
  // Retain the reviewed synthetic response map inside the test only.
  const responses = createSuccessfulResponses();

  return {
    start: vi.fn<OverviewProcessClient['start']>(async () => undefined),
    request: vi.fn<OverviewProcessClient['request']>(async (method) => {
      // Pause the first read when a test is proving in-flight deduplication.
      if (method === 'account/read') await options.accountGate;
      // Fail with a closed category when requested by a lifecycle test.
      if (options.failure !== undefined) throw options.failure;
      return responses[method];
    }),
    onNotification: vi.fn(() => () => undefined),
    stop: vi.fn<OverviewProcessClient['stop']>(),
  };
}

// Exercise state behavior that is not visible from a single transport success fixture.
describe('OverviewController', () => {
  // Require simultaneous renderer refresh calls to share one exact operation and one client.
  it('deduplicates concurrent refreshes', async () => {
    let releaseAccountRead: () => void = () => undefined;
    const accountGate = new Promise<void>((resolve) => {
      releaseAccountRead = resolve;
    });
    const client = createFakeClient({ accountGate });
    const controller = new OverviewController({ createClient: () => client });

    const firstRefresh = controller.refresh();
    const secondRefresh = controller.refresh();
    expect(secondRefresh).toBe(firstRefresh);

    releaseAccountRead();
    await expect(firstRefresh).resolves.toMatchObject({ state: 'ready' });
    expect(client.start).toHaveBeenCalledTimes(1);
  });

  // Require a transient failure to keep prior valid values and label them stale.
  it('preserves the previous successful snapshot as stale', async () => {
    const client = createFakeClient();
    let nowMilliseconds = Date.parse('2026-08-14T12:00:00.000Z');
    const controller = new OverviewController({
      createClient: () => client,
      now: () => new Date(nowMilliseconds),
    });

    const successfulSnapshot = await controller.refresh();
    expect(successfulSnapshot.state).toBe('ready');
    client.request.mockRejectedValueOnce(new CodexProcessError('request-timeout'));
    nowMilliseconds += 60_000;

    const staleSnapshot = await controller.refresh();
    expect(staleSnapshot).toMatchObject({
      state: 'stale',
      errorCategory: 'request-timeout',
      lastSuccessfulRefreshAt: successfulSnapshot.lastSuccessfulRefreshAt,
    });
    expect(staleSnapshot.quotas).toEqual(successfulSnapshot.quotas);
  });

  // Require capped restart delays and a real recovery opportunity after circuit-breaker cooldown.
  it('backs off repeated failures and recovers after the restart cooldown', async () => {
    let nowMilliseconds = Date.parse('2026-08-14T12:00:00.000Z');
    const clients = [
      createFakeClient({ failure: new CodexProcessError('codex-unavailable') }),
      createFakeClient({ failure: new CodexProcessError('codex-unavailable') }),
      createFakeClient({ failure: new CodexProcessError('codex-unavailable') }),
      createFakeClient(),
    ];
    let factoryCalls = 0;
    const controller = new OverviewController({
      createClient: () => clients[factoryCalls++]!,
      now: () => new Date(nowMilliseconds),
    });

    await expect(controller.refresh()).resolves.toMatchObject({ state: 'unavailable' });
    await controller.refresh();
    expect(factoryCalls).toBe(1);

    nowMilliseconds += 1_000;
    await controller.refresh();
    nowMilliseconds += 2_000;
    await controller.refresh();
    expect(factoryCalls).toBe(3);

    nowMilliseconds += 29_999;
    await controller.refresh();
    expect(factoryCalls).toBe(3);

    nowMilliseconds += 1;
    await expect(controller.refresh()).resolves.toMatchObject({ state: 'ready' });
    expect(factoryCalls).toBe(4);
  });

  // Require the approved aggregate-usage read to populate the usage section beside quota data.
  it('normalizes the aggregate-usage read into the usage section', async () => {
    const client = createFakeClient();
    const originalRequest = client.request.getMockImplementation();
    client.request.mockImplementation(async (method, params) => {
      if (method === 'account/usage/read') {
        return {
          summary: { lifetimeTokens: '4203910', currentStreakDays: 8 },
          dailyBuckets: [
            { date: '2026-08-12', tokens: '91210' },
            { date: '2026-08-13', tokens: '124500' },
          ],
        };
      }
      return originalRequest!(method, params);
    });
    const controller = new OverviewController({ createClient: () => client });

    const snapshot = await controller.refresh();
    expect(snapshot.usage.state).toBe('ready');
    expect(snapshot.usage.summary.lifetimeTokens).toBe('4203910');
    expect(snapshot.usage.days.map((day) => day.tokens)).toEqual(['91210', '124500']);
    expect(snapshot.usage.coverage.missingDates).toEqual([]);
  });

  // Require a failed usage read to keep valid quota data visible instead of erasing the snapshot.
  it('keeps quota data when only the aggregate-usage read fails', async () => {
    const client = createFakeClient();
    const originalRequest = client.request.getMockImplementation();
    client.request.mockImplementation(async (method, params) => {
      if (method === 'account/usage/read') {
        throw new CodexProcessError('request-timeout');
      }
      return originalRequest!(method, params);
    });
    const controller = new OverviewController({ createClient: () => client });

    const snapshot = await controller.refresh();
    expect(snapshot.state).toBe('partial');
    expect(snapshot.quotas).toHaveLength(1);
    expect(snapshot.quotas[0]?.windows[0]?.usedPercent.value).toBe(37);
    expect(snapshot.usage.state).toBe('unavailable');
  });

  // Require in-memory session deltas to appear from the second valid snapshot onward.
  it('derives session deltas against the first valid process baseline', async () => {
    let usedPercent = 28;
    let lifetimeTokens = '4201400';
    const client = createFakeClient();
    const originalRequest = client.request.getMockImplementation();
    client.request.mockImplementation(async (method, params) => {
      if (method === 'account/rateLimits/read') {
        const base = (await originalRequest!(method, params)) as {
          rateLimits: { primary: { usedPercent: number } };
        };
        return {
          ...base,
          rateLimits: { ...base.rateLimits, primary: { ...base.rateLimits.primary, usedPercent } },
        };
      }
      if (method === 'account/usage/read') {
        return { summary: { lifetimeTokens }, dailyBuckets: null };
      }
      return originalRequest!(method, params);
    });
    const controller = new OverviewController({ createClient: () => client });

    // The first valid snapshot establishes the baseline and reports no deltas.
    const firstSnapshot = await controller.refresh();
    expect(firstSnapshot.sessionObservation.validSnapshotCount).toBe(1);
    expect(firstSnapshot.sessionObservation.quotaDeltas).toEqual([]);

    // The second valid snapshot produces exact percentage-point and counter deltas.
    usedPercent = 32;
    lifetimeTokens = '4203910';
    const secondSnapshot = await controller.refresh();
    expect(secondSnapshot.sessionObservation.validSnapshotCount).toBe(2);
    expect(secondSnapshot.sessionObservation.quotaDeltas[0]).toMatchObject({
      bucketId: 'codex',
      baselinePercent: 28,
      currentPercent: 32,
      changePercentagePoints: '4',
    });
    expect(secondSnapshot.sessionObservation.counterDeltas[0]).toMatchObject({
      counterId: 'lifetime',
      increaseTokens: '2510',
      sourceValueChanged: false,
    });
  });

  // Require a reset transition to suppress cross-reset percentage deltas.
  it('reports reset transitions without displaying misleading negative usage', async () => {
    let resetsAt = 1_800_000_000;
    const client = createFakeClient();
    const originalRequest = client.request.getMockImplementation();
    client.request.mockImplementation(async (method, params) => {
      if (method === 'account/rateLimits/read') {
        const base = (await originalRequest!(method, params)) as {
          rateLimits: { primary: { resetsAt: number } };
        };
        return {
          ...base,
          rateLimits: { ...base.rateLimits, primary: { ...base.rateLimits.primary, resetsAt } },
        };
      }
      return originalRequest!(method, params);
    });
    const controller = new OverviewController({ createClient: () => client });

    await controller.refresh();

    // Advance the reset timestamp and drop the percentage to simulate a completed reset.
    resetsAt = 1_800_600_000;
    const afterReset = await controller.refresh();
    expect(afterReset.sessionObservation.resetTransitions).toHaveLength(1);
    expect(afterReset.sessionObservation.quotaDeltas).toHaveLength(0);
  });
});
