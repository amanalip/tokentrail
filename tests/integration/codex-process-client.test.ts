// Import the Node executable path so tests launch only the checked-in fixture without a shell.
import process from 'node:process';

// Import URL conversion for a stable fixture path.
import { fileURLToPath } from 'node:url';

// Import Vitest assertions and generated-case helpers.
import { describe, expect, it } from 'vitest';

// Import the real owned process client and its safe error type.
import { CodexProcessClient, CodexProcessError } from '../../src/main/codex/codex-process-client';

// Import the same schemas and normalizer used by the controller.
import { normalizeOverviewData } from '../../src/main/codex/normalize-overview';
import {
  accountReadResultSchema,
  rateLimitsReadResultSchema,
} from '../../src/main/codex/protocol-schemas';

// Import the approved method type only to demonstrate runtime denial of a deliberately widened test value.
import type { ApprovedCodexRequestMethod } from '../../src/main/codex/approved-methods';

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

// Read the two Phase 2 endpoints through the real transport and runtime schemas.
async function readFixture(client: CodexProcessClient) {
  // Complete compatibility initialization before account reads.
  await client.start();

  // Request account state without proactive credential refresh.
  const account = accountReadResultSchema.parse(
    await client.request('account/read', { refreshToken: false }),
  );

  // Stop before quota read when the explicit state is signed out.
  if (account.account === null) return { account, rateLimits: null };

  // Validate the quota response before returning it to the test.
  const rateLimits = rateLimitsReadResultSchema.parse(
    await client.request('account/rateLimits/read', undefined),
  );
  return { account, rateLimits };
}

// Group complete process and protocol behavior around the checked-in scenario matrix.
describe('CodexProcessClient fixture integration', () => {
  // Exercise full, single, multiple, null, and unknown-field success variants.
  it.each([
    ['full', 1, false],
    ['single-bucket', 1, false],
    ['multiple-buckets', 2, false],
    ['null-fields', 1, true],
    ['unknown-fields', 1, false],
  ] as const)('normalizes the %s scenario', async (scenario, expectedBuckets, expectedPartial) => {
    // Create an isolated process for this scenario.
    const client = createFixtureClient(scenario);

    try {
      // Read both approved endpoints and require a signed-in fixture result.
      const result = await readFixture(client);
      expect(result.rateLimits).not.toBeNull();

      // Normalize through the same domain boundary used by Electron main.
      const normalized = normalizeOverviewData(result.account, result.rateLimits!);
      expect(normalized.quotas).toHaveLength(expectedBuckets);
      expect(normalized.isPartial).toBe(expectedPartial);

      // Confirm unknown raw fields and email never survive normalized JSON.
      expect(JSON.stringify(normalized)).not.toContain('futureSecret');
      expect(JSON.stringify(normalized)).not.toContain('fixture@example.invalid');
    } finally {
      // Stop only the exact fixture process owned by this test.
      client.stop();
    }
  });

  // Exercise the explicit missing-account state without issuing a quota request.
  it('preserves the missing-account scenario', async () => {
    // Start one signed-out fixture connection.
    const client = createFixtureClient('missing-account');

    try {
      // Confirm account absence is explicit and non-identifying.
      const result = await readFixture(client);
      expect(result.account.account).toBeNull();
      expect(result.rateLimits).toBeNull();
    } finally {
      // Stop the exact fixture process.
      client.stop();
    }
  });

  // Exercise malformed, oversized, unsupported-method, and exit outcomes.
  it.each([
    ['malformed', 'invalid-response'],
    ['oversized', 'invalid-response'],
    ['method-not-found', 'codex-incompatible'],
    ['app-server-exit', 'codex-unavailable'],
  ] as const)('sanitizes the %s failure', async (scenario, expectedCategory) => {
    // Start an isolated failure fixture.
    const client = createFixtureClient(scenario);

    try {
      // Initialize and read the safe account response first.
      await client.start();
      await client.request('account/read', { refreshToken: false });

      // Require the quota boundary to reject with only the safe category.
      await expect(client.request('account/rateLimits/read', undefined)).rejects.toMatchObject({
        category: expectedCategory,
      });
    } finally {
      // Stop any still-live fixture handle.
      client.stop();
    }
  });

  // Confirm a widened caller cannot serialize an unapproved method to transport.
  it('rejects a denied method before transport', async () => {
    // Start one healthy fixture so denial is not caused by connection state.
    const client = createFixtureClient('full');

    try {
      // Complete initialization first.
      await client.start();

      // Deliberately bypass TypeScript only in the test to exercise the runtime guard.
      const deniedMethod = 'thread/list' as ApprovedCodexRequestMethod;
      await expect(client.request(deniedMethod, undefined)).rejects.toEqual(
        new CodexProcessError('permission-denied'),
      );
    } finally {
      // Stop the exact fixture process.
      client.stop();
    }
  });

  // Confirm bounded timeout and explicit shutdown both settle an unanswered request.
  it('times out and cancels unanswered requests safely', async () => {
    // Start a fixture that deliberately leaves quota requests unanswered.
    const timeoutClient = createFixtureClient('timeout');
    await timeoutClient.start();

    // Require a short test-specific deadline to produce only the safe timeout category.
    await expect(
      timeoutClient.request('account/rateLimits/read', undefined, 25),
    ).rejects.toMatchObject({ category: 'request-timeout' });
    timeoutClient.stop();

    // Start a second isolated client to verify shutdown cancellation independently.
    const cancellationClient = createFixtureClient('timeout');
    await cancellationClient.start();
    const unansweredRequest = cancellationClient.request(
      'account/rateLimits/read',
      undefined,
      5_000,
    );

    // Stop only the exact owned client and require immediate sanitized rejection.
    cancellationClient.stop();
    await expect(unansweredRequest).rejects.toMatchObject({ category: 'codex-unavailable' });
  });
});
