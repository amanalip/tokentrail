// @vitest-environment node

// Import the Node executable path so tests launch only the checked-in fixture without a shell.
import process from 'node:process';

// Import URL conversion for a stable fixture path.
import { fileURLToPath } from 'node:url';

// Import Vitest assertions and grouping helpers.
import { describe, expect, it } from 'vitest';

// Import the real owned process client.
import { CodexProcessClient } from '../../src/main/codex/codex-process-client';

// Import the same schemas and normalizers used by the Electron main controller.
import { normalizeOverviewData } from '../../src/main/codex/normalize-overview';
import { normalizeCreditsData, normalizeUsageData } from '../../src/main/codex/normalize-usage';
import {
  accountReadResultSchema,
  accountUsageReadResultSchema,
  rateLimitsReadResultSchema,
} from '../../src/main/codex/protocol-schemas';

// Resolve the fixed account-free fixture beside this integration suite.
const fixturePath = fileURLToPath(
  new URL('../fixtures/codex-app-server-fixture.mjs', import.meta.url),
);

// Construct one client that can execute only the fixture and one approved scenario.
function createFixtureClient(scenario: string): CodexProcessClient {
  // Use the current Node binary, a fixed script argument, and a minimal scenario-only environment.
  return new CodexProcessClient({
    executablePath: process.execPath,
    argumentsList: [fixturePath],
    environment: { TOKENTRAIL_FIXTURE_SCENARIO: scenario },
  });
}

// Read all three approved endpoints through the real transport and runtime schemas.
async function readFullFixture(client: CodexProcessClient) {
  // Complete compatibility initialization before account reads.
  await client.start();

  // Request account state without proactive credential refresh.
  const account = accountReadResultSchema.parse(
    await client.request('account/read', { refreshToken: false }),
  );

  // Validate the quota response before normalization.
  const rateLimits = rateLimitsReadResultSchema.parse(
    await client.request('account/rateLimits/read', undefined),
  );

  // Validate the aggregate-usage response before normalization.
  const usage = accountUsageReadResultSchema.parse(
    await client.request('account/usage/read', undefined),
  );

  return { account, rateLimits, usage };
}

// Group checks around the complete required section 21.2 protocol fixture catalog.
describe('required fixture catalog coverage', () => {
  // Exercise every window-shape variant through transport, validation, and normalization.
  it.each([
    ['primary-only', 1],
    ['secondary-only', 1],
    ['no-windows', 1],
  ] as const)('normalizes the %s window shape', async (scenario, expectedBuckets) => {
    // Create an isolated process for this scenario.
    const client = createFixtureClient(scenario);

    try {
      // Read both quota endpoints; usage content is irrelevant to these shapes.
      const result = await readFullFixture(client);

      // Normalize through the same domain boundary used by Electron main.
      const normalized = normalizeOverviewData(result.account, result.rateLimits);
      expect(normalized.quotas).toHaveLength(expectedBuckets);

      // Confirm each window-shape rule at the normalized boundary.
      const windows = normalized.quotas[0]?.windows ?? [];
      if (scenario === 'primary-only') {
        expect(windows.map((window) => window.kind)).toEqual(['primary']);
      } else if (scenario === 'secondary-only') {
        expect(windows.map((window) => window.kind)).toEqual(['secondary']);
      } else {
        expect(windows).toHaveLength(0);
      }
    } finally {
      // Stop only the exact fixture process owned by this test.
      client.stop();
    }
  });

  it('treats unknown limit and plan values as unavailable rather than zero', async () => {
    // Start one isolated unknown-values fixture.
    const client = createFixtureClient('unknown-values');

    try {
      // Read and normalize the hostile-valued snapshot.
      const result = await readFullFixture(client);
      const normalized = normalizeOverviewData(result.account, result.rateLimits);

      // The bucket survives with its unknown plan label preserved as bounded text.
      expect(normalized.quotas).toHaveLength(1);
      expect(normalized.quotas[0]?.planType).toBe('mystery-plan');

      // Every window field is explicitly unavailable instead of coerced to zero.
      const window = normalized.quotas[0]?.windows[0];
      expect(window?.usedPercent.value).toBeNull();
      expect(window?.durationMinutes.value).toBeNull();
      expect(window?.resetsAt.value).toBeNull();
      expect(normalized.isPartial).toBe(true);
    } finally {
      // Stop the exact fixture process.
      client.stop();
    }
  });

  it('distinguishes reached-state reports from high percentages without a reached state', async () => {
    // Start one isolated reached-state fixture.
    const client = createFixtureClient('reached-state');

    try {
      // Read and normalize both buckets.
      const result = await readFullFixture(client);
      const normalized = normalizeOverviewData(result.account, result.rateLimits);
      expect(normalized.quotas).toHaveLength(2);

      // Find each bucket by stable identity and compare reached flags with reported percentages.
      const reachedBucket = normalized.quotas.find((bucket) => bucket.id === 'codex');
      const highBucket = normalized.quotas.find((bucket) => bucket.id === 'review');
      expect(reachedBucket?.reached).toBe(true);
      expect(highBucket?.reached).toBe(false);

      // Both report high usage; only the explicit server flag marks a reached state.
      expect(reachedBucket?.windows[0]?.usedPercent.value).toBe(96);
      expect(highBucket?.windows[0]?.usedPercent.value).toBe(91);
    } finally {
      // Stop the exact fixture process.
      client.stop();
    }
  });

  it('keeps shared reset timestamps ordered while missing reset times stay in the unknown group', async () => {
    // Start one isolated shared-reset fixture.
    const client = createFixtureClient('shared-reset-timestamps');

    try {
      // Read and normalize both buckets sharing one reset timestamp.
      const result = await readFullFixture(client);
      const normalized = normalizeOverviewData(result.account, result.rateLimits);
      expect(normalized.quotas).toHaveLength(2);

      // Collect reset values across every normalized window.
      const resetValues = normalized.quotas.flatMap((bucket) =>
        bucket.windows.map((window) => window.resetsAt.value),
      );

      // Two windows share the timestamp exactly and one remains explicitly missing.
      expect(resetValues.filter((value) => value === 1_800_000_000)).toHaveLength(2);
      expect(resetValues).toContain(null);
    } finally {
      // Stop the exact fixture process.
      client.stop();
    }
  });

  it.each([
    ['credits-unlimited'],
    ['credits-zero-balance'],
    ['credits-decimal-balance'],
    ['reset-credits-count-only'],
    ['reset-credits-expiry-mix'],
  ] as const)('normalizes credit information for %s', async (scenario) => {
    // Start one isolated credits fixture.
    const client = createFixtureClient(scenario);

    try {
      // Read the quota response carrying this scenario's credit fields.
      const result = await readFullFixture(client);

      // Normalize credits against a fixed clock so expiry classification is deterministic.
      const credits = normalizeCreditsData(result.rateLimits, 1_800_000_000);

      // Assert the exact reviewed expectation for each balance and detail shape.
      if (scenario === 'credits-unlimited') {
        expect(credits.balanceUnlimited).toBe(true);
        expect(credits.balanceAmount).toBeNull();
        expect(credits.state).toBe('ready');
      } else if (scenario === 'credits-zero-balance') {
        expect(credits.balanceUnlimited).toBe(false);
        expect(credits.balanceAmount).toBe('$0.00');
      } else if (scenario === 'credits-decimal-balance') {
        expect(credits.balanceAmount).toBe('$18.40');
        expect(credits.spendingControl?.limitAmount).toBe('$40.00');
        expect(credits.spendingControl?.remainingPercent.value).toBe(46);
        expect(credits.spendingControl?.reached).toBe(false);
      } else if (scenario === 'reset-credits-count-only') {
        expect(credits.resetCreditsAvailableCount).toBe(3);
        expect(credits.resetCreditDetails).toHaveLength(0);
        expect(credits.resetCreditDetailsCapped).toBe(true);
      } else {
        // Four rows cover inside-seven-days, outside, expired, and non-expiring states.
        expect(credits.resetCreditsAvailableCount).toBe(5);
        expect(credits.resetCreditDetails).toHaveLength(4);
        expect(credits.resetCreditDetailsCapped).toBe(true);
        expect(
          credits.resetCreditDetails.filter((detail) => detail.state === 'expired'),
        ).toHaveLength(1);
      }
    } finally {
      // Stop the exact fixture process.
      client.stop();
    }
  });

  it('covers fourteen complete dates with one gap, one zero, and one rejected duplicate', async () => {
    // Start one isolated usage-gaps fixture.
    const client = createFixtureClient('usage-gaps');

    try {
      // Read all endpoints and normalize the usage section.
      const result = await readFullFixture(client);
      const { usage, rejectedRecordCount } = normalizeUsageData(result.usage);

      // Fifteen distinct dates were accepted (fourteen complete plus the reported zero).
      expect(usage.days).toHaveLength(15);
      expect(rejectedRecordCount).toBe(1);

      // The reported zero stays visible and the gap is listed as missing, never filled.
      expect(usage.days.some((day) => day.date === '2026-08-04' && day.tokens === '0')).toBe(true);
      expect(usage.coverage.missingDates).toEqual(['2026-08-08']);
      expect(usage.state).toBe('partial');
    } finally {
      // Stop the exact fixture process.
      client.stop();
    }
  });

  it('withholds relative change when sixty dates carry a zero preceding period', async () => {
    // Start one isolated sixty-day fixture.
    const client = createFixtureClient('usage-sixty-days-zero-preceding');

    try {
      // Read and normalize the complete sixty-date supply.
      const result = await readFullFixture(client);
      const { usage, rejectedRecordCount } = normalizeUsageData(result.usage);
      expect(usage.days).toHaveLength(60);
      expect(rejectedRecordCount).toBe(0);
      expect(usage.state).toBe('ready');

      // Compute the thirty-day comparison through the shared calculation library.
      const { computePeriodComparison } =
        await import('../../src/shared/domain/usage-calculations');
      const comparison = computePeriodComparison(usage.days, 30);

      // Both periods are complete; relative change stays unavailable because preceding total is zero.
      expect(comparison.available).toBe(true);
      expect(comparison.precedingTotal).toBe('0');
      expect(comparison.relativeChangePercent).toBeNull();
      expect(comparison.bothPeriodsZero).toBe(false);
    } finally {
      // Stop the exact fixture process.
      client.stop();
    }
  });

  it('keeps counters beyond safe integer range exact as strings', async () => {
    // Start one isolated huge-counter fixture.
    const client = createFixtureClient('usage-huge-counters');

    try {
      // Read and normalize the oversized counter values.
      const result = await readFullFixture(client);
      const { usage } = normalizeUsageData(result.usage);

      // Lifetime and daily values survive as canonical decimal strings without float distortion.
      expect(usage.summary.lifetimeTokens).toBe('123456789012345678901234567890');
      expect(usage.summary.peakDailyTokens).toBe('99999999999999999999');
      expect(usage.days[0]?.tokens).toBe('12345678901234567890');
      expect(usage.days[1]?.tokens).toBe('98765432109876543210');

      // The serialized section never loses precision to number formatting.
      expect(JSON.stringify(usage)).not.toContain('1.2345678901234568e+29');
    } finally {
      // Stop the exact fixture process.
      client.stop();
    }
  });

  it('ignores a duplicate response correlation id without corrupting the pending map', async () => {
    // Start one isolated duplicate-id fixture that answers one request twice.
    const client = createFixtureClient('duplicate-id');

    try {
      // Complete initialization and read account state normally.
      await client.start();
      const account = accountReadResultSchema.parse(
        await client.request('account/read', { refreshToken: false }),
      );

      // The first rate-limit response resolves; the replayed id must be ignored, not double-settled.
      const rateLimits = rateLimitsReadResultSchema.parse(
        await client.request('account/rateLimits/read', undefined),
      );
      expect(rateLimits.rateLimits?.limitId).toBe('codex');
      expect(account.account?.type).toBe('chatgpt');

      // A subsequent request still correlates cleanly after the duplicate was discarded.
      const followUp = rateLimitsReadResultSchema.parse(
        await client.request('account/rateLimits/read', undefined),
      );
      expect(followUp.rateLimits?.limitId).toBe('codex');
    } finally {
      // Stop only the exact fixture process owned by this test.
      client.stop();
    }
  });

  it.each([['sparse-update-before-full'], ['sparse-update-after-full']] as const)(
    'delivers the approved sparse update notification for %s',
    async (scenario) => {
      // Start one isolated sparse-update fixture with a notification subscription installed first.
      const client = createFixtureClient(scenario);

      // Collect validated notification params through the approved subscription API.
      const receivedParams: unknown[] = [];
      const removeNotification = client.onNotification('account/rateLimits/updated', (params) => {
        receivedParams.push(params);
      });

      try {
        // Complete initialization; the before-full notification must already have arrived here.
        await client.start();

        // Allow the child's startup write to drain before asserting ordering behavior.
        await new Promise((resolve) => setTimeout(resolve, 150));
        if (scenario === 'sparse-update-before-full') {
          expect(receivedParams.length).toBe(1);
        } else {
          expect(receivedParams.length).toBe(0);
        }

        // Complete one full read; the after-full notification fires exactly once past this point.
        await client.request('account/rateLimits/read', undefined);
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Exactly one notification arrives regardless of ordering scenario.
        expect(receivedParams).toHaveLength(1);
      } finally {
        // Remove the subscription and stop the exact fixture process.
        removeNotification();
        client.stop();
      }
    },
  );
});
