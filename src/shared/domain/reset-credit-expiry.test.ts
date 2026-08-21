// Import Vitest assertions and grouping helpers.
import { describe, expect, it } from 'vitest';

// Import the expiry ordering under test and the fixed seven-day boundary constant.
import { SEVEN_DAY_NOTICE_SECONDS, orderResetCreditsByExpiry } from './reset-credit-expiry';

// Import the normalized detail type for fixture construction.
import type { ResetCreditDetail } from '../contracts/credits-data';

// Construct one available credit detail row.
function detail(title: string, expiresAtSeconds: number | null): ResetCreditDetail {
  return {
    title,
    description: `${title} description`,
    expiresAtSeconds,
    state: 'available',
  };
}

// Use one fixed current time so classification is deterministic.
const NOW = 1_000_000;

// Group behavior around the fixed seven-day display rule and ordering.
describe('orderResetCreditsByExpiry', () => {
  it('classifies future expiries against the exact 604,800-second boundary', () => {
    const inside = detail('inside', NOW + SEVEN_DAY_NOTICE_SECONDS);
    const outside = detail('outside', NOW + SEVEN_DAY_NOTICE_SECONDS + 1);
    const ordered = orderResetCreditsByExpiry([outside, inside], NOW);

    // The boundary second itself is inside the notice window per the fixed interface rule.
    expect(ordered.map((entry) => entry.expiryGroup)).toEqual([
      'expires-within-seven-days',
      'expires-later',
    ]);
    expect(ordered[0]?.remainingSeconds).toBe(SEVEN_DAY_NOTICE_SECONDS);
  });

  it('keeps expired, non-expiring, and unknown-expiry rows as separate visible states', () => {
    const expired = { ...detail('expired', NOW - 10), state: 'expired' as const };
    const neverExpires = detail('never', null);
    const future = detail('future', NOW + 100);
    const ordered = orderResetCreditsByExpiry([neverExpires, expired, future], NOW);

    // Future expiries sort first, then non-expiring, then already-expired rows.
    expect(ordered.map((entry) => entry.expiryGroup)).toEqual([
      'expires-within-seven-days',
      'no-expiry-reported',
      'already-expired',
    ]);
    expect(ordered[2]?.detail.title).toBe('expired');
  });

  it('sorts equal-group credits earliest first with stable title tiebreaks', () => {
    const later = detail('later', NOW + 5_000);
    const earlier = detail('earlier', NOW + 1_000);
    const tieA = detail('tie-a', NOW + 3_000);
    const tieB = detail('tie-b', NOW + 3_000);
    const ordered = orderResetCreditsByExpiry([later, tieB, tieA, earlier], NOW);

    expect(ordered.map((entry) => entry.detail.title)).toEqual([
      'earlier',
      'tie-a',
      'tie-b',
      'later',
    ]);
  });
});
