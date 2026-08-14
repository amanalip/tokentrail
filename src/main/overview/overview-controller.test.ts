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
});
