// Import the normalized reset-credit contracts the expiry rules operate on.
import type { ResetCreditDetail } from '../contracts/credits-data';

// Name the fixed seven-day notice boundary from Interface 8.23: exactly 604,800 seconds.
export const SEVEN_DAY_NOTICE_SECONDS = 604_800;

// Describe one expiry-ordered credit row with its reviewed notice classification.
export interface ExpiryOrderedCredit {
  readonly detail: ResetCreditDetail;
  // Classify the row into exactly one closed display group.
  readonly expiryGroup:
    'expires-within-seven-days' | 'expires-later' | 'already-expired' | 'no-expiry-reported';
  // Carry the exact remaining seconds for a future expiry so countdown text is calculated once.
  readonly remainingSeconds: number | null;
}

/**
 * Order available reset credits by valid reported expiry time and classify each against the fixed seven-day
 * display rule. Expired, non-expiring, and unknown-expiry rows remain distinct states. Sorting places future
 * expiries earliest first, then non-expiring, then unknown-expiry; already-expired rows keep their own visible
 * group without being silently removed.
 */
export function orderResetCreditsByExpiry(
  details: readonly ResetCreditDetail[],
  nowUnixSeconds: number,
): readonly ExpiryOrderedCredit[] {
  // Convert every detail row into its classified comparable form.
  const classified = details.map<ExpiryOrderedCredit>((detail) => {
    // Treat an absent timestamp as its own no-expiry state rather than estimating one.
    if (detail.expiresAtSeconds === null) {
      return { detail, expiryGroup: 'no-expiry-reported', remainingSeconds: null };
    }

    // Separate already-invalid expiries before any countdown arithmetic runs.
    if (detail.expiresAtSeconds <= nowUnixSeconds) {
      return { detail, expiryGroup: 'already-expired', remainingSeconds: null };
    }

    // Apply the fixed seven-day boundary as an interface rule, not a claim from Codex.
    const remainingSeconds = detail.expiresAtSeconds - nowUnixSeconds;
    const expiryGroup =
      remainingSeconds <= SEVEN_DAY_NOTICE_SECONDS ? 'expires-within-seven-days' : 'expires-later';
    return { detail, expiryGroup, remainingSeconds };
  });

  // Sort future expiries earliest first while keeping the other groups in stable relative order.
  return classified.sort((left, right) => {
    const groupOrder: Record<ExpiryOrderedCredit['expiryGroup'], number> = {
      'expires-within-seven-days': 0,
      'expires-later': 1,
      'no-expiry-reported': 2,
      'already-expired': 3,
    };

    // Compare group precedence first so each display block stays contiguous.
    const groupCompare = groupOrder[left.expiryGroup] - groupOrder[right.expiryGroup];
    if (groupCompare !== 0) return groupCompare;

    // Inside future groups order by exact expiry time.
    if (
      left.detail.expiresAtSeconds !== null &&
      right.detail.expiresAtSeconds !== null &&
      left.detail.expiresAtSeconds !== right.detail.expiresAtSeconds
    ) {
      return left.detail.expiresAtSeconds < right.detail.expiresAtSeconds ? -1 : 1;
    }

    // Break remaining ties on bounded titles for deterministic output.
    return left.detail.title.localeCompare(right.detail.title);
  });
}
