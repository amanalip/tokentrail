// Import Vitest assertions and grouping helpers.
import { describe, expect, it } from 'vitest';

// Import runtime protocol schemas so tests model the actual privileged boundary.
import { accountReadResultSchema, rateLimitsReadResultSchema } from './protocol-schemas';

// Import the normalization functions under test.
import { createSuccessfulOverviewSnapshot, normalizeOverviewData } from './normalize-overview';

// Construct one valid synthetic quota bucket without genuine account data.
function createRawQuota() {
  // Return the current narrow field shape plus an unknown field that must be stripped by schema parsing.
  return {
    limitId: 'codex',
    limitName: 'Codex',
    primary: { usedPercent: 37, windowDurationMins: 300, resetsAt: 1_800_000_000 },
    secondary: null,
    planType: 'plus',
    rateLimitReachedType: null,
    email: 'must-not-survive@example.invalid',
  };
}

// Group behavior around the protocol-to-renderer trust boundary.
describe('normalizeOverviewData', () => {
  // Confirm derived percentage and provenance are explicit and account identity is discarded.
  it('normalizes one valid quota without exposing identifying fields', () => {
    // Parse a synthetic account response that contains an email the narrow schema strips.
    const account = accountReadResultSchema.parse({
      account: { type: 'chatgpt', email: 'must-not-survive@example.invalid', planType: 'plus' },
      requiresOpenaiAuth: true,
    });

    // Parse a valid single-bucket response.
    const rateLimits = rateLimitsReadResultSchema.parse({
      rateLimits: createRawQuota(),
      rateLimitsByLimitId: null,
      rateLimitResetCredits: null,
    });

    // Normalize and attach one deterministic observation timestamp.
    const snapshot = createSuccessfulOverviewSnapshot(
      normalizeOverviewData(account, rateLimits),
      '2026-08-14T07:00:00.000Z',
    );

    // Confirm complete state and exact complement arithmetic.
    expect(snapshot.state).toBe('ready');
    expect(snapshot.quotas[0]?.windows[0]?.usedPercent.value).toBe(37);
    expect(snapshot.quotas[0]?.windows[0]?.remainingPercent).toEqual({
      value: 63,
      provenance: 'calculated',
      explanation: 'remaining-is-one-hundred-minus-used',
    });

    // Confirm JSON serialization contains no identifying account field or unknown raw field.
    expect(JSON.stringify(snapshot)).not.toContain('must-not-survive');
    expect(JSON.stringify(snapshot)).not.toContain('email');
  });

  // Confirm null and invalid fields become partial unavailable metrics instead of zero.
  it('preserves missing and invalid values as partial', () => {
    // Use a valid non-identifying account category.
    const account = accountReadResultSchema.parse({
      account: { type: 'apiKey' },
      requiresOpenaiAuth: false,
    });

    // Supply an out-of-range percentage and missing supporting fields.
    const rateLimits = rateLimitsReadResultSchema.parse({
      rateLimits: {
        ...createRawQuota(),
        primary: { usedPercent: 130, windowDurationMins: null, resetsAt: null },
      },
      rateLimitsByLimitId: null,
    });

    // Normalize through the complete snapshot boundary.
    const snapshot = createSuccessfulOverviewSnapshot(
      normalizeOverviewData(account, rateLimits),
      '2026-08-14T07:00:00.000Z',
    );

    // Keep the reported invalid source visible but refuse unsound derived arithmetic.
    expect(snapshot.state).toBe('partial');
    expect(snapshot.quotas[0]?.windows[0]?.usedPercent.value).toBe(130);
    expect(snapshot.quotas[0]?.windows[0]?.remainingPercent.value).toBeNull();
    expect(snapshot.quotas[0]?.windows[0]?.durationMinutes.value).toBeNull();
    expect(JSON.stringify(snapshot)).not.toContain('"value":0');
  });

  // Confirm a missing account and a signed-in empty quota response remain distinct states.
  it('distinguishes signed-out from signed-in unavailable data', () => {
    // Create one signed-out response.
    const signedOutAccount = accountReadResultSchema.parse({
      account: null,
      requiresOpenaiAuth: true,
    });
    const emptyRateLimits = rateLimitsReadResultSchema.parse({
      rateLimits: null,
      rateLimitsByLimitId: null,
    });

    // Confirm no account maps to the explicit signed-out state.
    expect(
      createSuccessfulOverviewSnapshot(
        normalizeOverviewData(signedOutAccount, emptyRateLimits),
        '2026-08-14T07:00:00.000Z',
      ).state,
    ).toBe('signed-out');

    // Confirm a present account with no quota maps to unavailable rather than signed-out.
    const signedInAccount = accountReadResultSchema.parse({
      account: { type: 'apiKey' },
      requiresOpenaiAuth: false,
    });
    expect(
      createSuccessfulOverviewSnapshot(
        normalizeOverviewData(signedInAccount, emptyRateLimits),
        '2026-08-14T07:00:00.000Z',
      ).state,
    ).toBe('unavailable');
  });
});
