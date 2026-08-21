// Import the normalized sections the combined-capacity presentation group summarizes.
import type { OverviewSnapshot } from '../contracts/overview-snapshot';

// Describe one fixed factual clause selected for the combined-capacity summary.
export interface CapacityClause {
  // Name the stable local key so the renderer renders reviewed copy only.
  readonly clauseKey:
    | 'no-reached-limit-reported'
    | 'reached-limit-reported'
    | 'no-quota-data'
    | 'credit-balance-reported'
    | 'credit-unlimited-reported'
    | 'no-credit-information'
    | 'spending-control-remaining-reported'
    | 'spending-control-reached'
    | 'reset-credits-available'
    | 'reset-credit-expires-within-seven-days'
    | 'no-reset-credit-information';
  // Carry optional bounded interpolation values already formatted by exact calculation code.
  readonly values?: Readonly<Record<string, string>>;
}

/**
 * Select summary clauses from a fixed factual set whose conditions map to reported or directly calculated
 * states. The result never states that the user has enough capacity, never estimates task outcomes, never
 * translates credits into quota, and never produces a score. When every independent source is unavailable the
 * clauses say exactly that instead of synthesizing a conclusion.
 */
export function buildCombinedCapacityClauses(
  snapshot: Pick<OverviewSnapshot, 'quotas' | 'credits'>,
  nowUnixSeconds: number,
): readonly CapacityClause[] {
  // Collect at most one reached-state clause from explicit bucket-level reports.
  const anyReached = snapshot.quotas.some((bucket) => bucket.reached);
  const hasQuotaData = snapshot.quotas.length > 0;
  const reachedClause: CapacityClause = !hasQuotaData
    ? { clauseKey: 'no-quota-data' }
    : anyReached
      ? { clauseKey: 'reached-limit-reported' }
      : { clauseKey: 'no-reached-limit-reported' };

  // Select the credit-balance clause from explicitly reported states only.
  const credits = snapshot.credits;
  let creditClause: CapacityClause;
  if (credits.state === 'unavailable') {
    creditClause = { clauseKey: 'no-credit-information' };
  } else if (credits.balanceUnlimited) {
    creditClause = { clauseKey: 'credit-unlimited-reported' };
  } else if (credits.balanceAmount !== null) {
    creditClause = {
      clauseKey: 'credit-balance-reported',
      values: { amount: credits.balanceAmount },
    };
  } else {
    creditClause = { clauseKey: 'no-credit-information' };
  }

  // Select the spending-control clause from reported remaining percentage or reached state.
  let controlClause: CapacityClause = { clauseKey: 'no-credit-information' };
  if (credits.spendingControl !== null) {
    const remaining = credits.spendingControl.remainingPercent.value;
    if (credits.spendingControl.reached) {
      controlClause = { clauseKey: 'spending-control-reached' };
    } else if (remaining !== null && Number.isFinite(remaining)) {
      controlClause = {
        clauseKey: 'spending-control-remaining-reported',
        values: { percent: `${Math.round(remaining * 10) / 10}` },
      };
    }
  }

  // Select reset-credit clauses from the authoritative count and classified detail rows.
  const resetClauses: CapacityClause[] = [];
  if (credits.resetCreditsAvailableCount !== null) {
    resetClauses.push({
      clauseKey: 'reset-credits-available',
      values: { count: `${credits.resetCreditsAvailableCount}` },
    });

    // Surface at most one seven-day expiry notice using exact countdown classification.
    const withinSevenDays = credits.resetCreditDetails.some(
      (detail) =>
        detail.state === 'available' &&
        detail.expiresAtSeconds !== null &&
        detail.expiresAtSeconds > nowUnixSeconds &&
        detail.expiresAtSeconds - nowUnixSeconds <= 604_800,
    );
    if (withinSevenDays) {
      resetClauses.push({ clauseKey: 'reset-credit-expires-within-seven-days' });
    }
  } else {
    resetClauses.push({ clauseKey: 'no-reset-credit-information' });
  }

  // Assemble the immutable reviewed clause list in stable display order.
  return Object.freeze([reachedClause, creditClause, controlClause, ...resetClauses]);
}
