// Import the normalized snapshot contract for presentation.
import type { OverviewSnapshot } from '../../shared/contracts/overview-snapshot';

// Import the shared expiry ordering so display groups stay factual and deterministic.
import { orderResetCreditsByExpiry } from '../../shared/domain/reset-credit-expiry';

// Import reviewed display formatters.
import { formatPercentage, formatRemainingSeconds, formatResetTime } from '../formatting';

// Import the render-safe clock hook for expiry classification.
import { useCurrentUnixSeconds } from '../hooks';

/** Render credit balance, spending controls, and reset credits as read-only reported information. */
export function CreditsRoute({ snapshot }: { snapshot: OverviewSnapshot }) {
  // Bind the credits section once for readable JSX below.
  const credits = snapshot.credits;

  // Classify reset-credit rows against the fixed seven-day rule at render time.
  const nowSeconds = useCurrentUnixSeconds();
  const orderedCredits = orderResetCreditsByExpiry(credits.resetCreditDetails, nowSeconds);

  // Explain honest unavailability instead of fabricating balance cards.
  if (credits.state === 'unavailable') {
    return (
      <>
        <header className="page-header">
          <div>
            <p className="eyebrow">Read-only account information</p>
            <h1>Credits and spending</h1>
          </div>
        </header>
        <section className="state-panel" aria-labelledby="credits-empty-title">
          <span className="state-icon" aria-hidden="true">
            ○
          </span>
          <div>
            <h2 id="credits-empty-title">No credit information was reported</h2>
            <p>
              This account does not currently report credit or spending-control information. That is
              a neutral state, not an error.
            </p>
          </div>
        </section>
      </>
    );
  }

  // Render the complete Credits route.
  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Read-only information reported for this account</p>
          <h1>Credits and spending</h1>
        </div>
      </header>

      {credits.state === 'partial' ? (
        <section className="partial-banner" role="status">
          Some credit fields were unavailable. Valid reported values are still shown below.
        </section>
      ) : null}

      <div className="summary-cards" role="group" aria-label="Credit summary">
        <div className="summary-card">
          <p className="eyebrow">Credit balance</p>
          <strong>
            {credits.balanceUnlimited ? 'Unlimited' : (credits.balanceAmount ?? 'Unavailable')}
          </strong>
          <small>
            {credits.balanceUnlimited ? 'Codex-reported unlimited state' : 'Codex-reported string'}
          </small>
        </div>
        <div className="summary-card">
          <p className="eyebrow">Individual spending control</p>
          <strong>
            {credits.spendingControl === null
              ? 'None reported'
              : credits.spendingControl.remainingPercent.value === null
                ? 'Unavailable'
                : `${formatPercentage(credits.spendingControl.remainingPercent.value)} remaining`}
          </strong>
          <small>
            {credits.spendingControl === null
              ? 'No spending control was reported'
              : credits.spendingControl.reached
                ? 'Reached state reported · '
                : 'Codex-reported percentage'}
            {credits.spendingControl !== null && credits.spendingControl.reached ? (
              <a href="#learn/when-a-limit-is-hit">what this means</a>
            ) : null}
          </small>
        </div>
        <div className="summary-card">
          <p className="eyebrow">Reset credits available</p>
          <strong>{credits.resetCreditsAvailableCount ?? 'Unavailable'}</strong>
          <small>Authoritative count from Codex</small>
        </div>
      </div>

      {credits.spendingControl !== null &&
      (credits.spendingControl.limitAmount !== null ||
        credits.spendingControl.usedAmount !== null) ? (
        <section className="panel" aria-labelledby="control-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Reported amounts keep their original units</p>
              <h2 id="control-title">Spending control detail</h2>
            </div>
          </div>
          <dl className="metric-grid">
            <div className="metric-line">
              <dt>Limit amount</dt>
              <dd>
                <span>{credits.spendingControl.limitAmount ?? 'Unavailable'}</span>
                <small>Codex-reported string</small>
              </dd>
            </div>
            <div className="metric-line">
              <dt>Used amount</dt>
              <dd>
                <span>{credits.spendingControl.usedAmount ?? 'Unavailable'}</span>
                <small>Codex-reported string</small>
              </dd>
            </div>
            <div className="metric-line">
              <dt>Resets</dt>
              <dd>
                <span>{formatResetTime(credits.spendingControl.resetsAtSeconds)}</span>
                <small>Codex-reported timestamp</small>
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      <section className="panel" aria-labelledby="reset-credits-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Sorted by valid reported expiry time</p>
            <h2 id="reset-credits-title">Reset credits</h2>
          </div>
          {credits.resetCreditDetailsCapped ? (
            <span>
              Codex supplied fewer detail rows than the authoritative count of{' '}
              {credits.resetCreditsAvailableCount}.
            </span>
          ) : null}
        </div>

        {orderedCredits.length === 0 ? (
          <p className="empty-detail">No reset-credit details were reported.</p>
        ) : (
          <ul className="credit-list">
            {orderedCredits.map((entry) => (
              <li key={`${entry.detail.title}:${entry.detail.expiresAtSeconds ?? 'none'}`}>
                <div>
                  <strong>{entry.detail.title}</strong>
                  <p>{entry.detail.description}</p>
                </div>
                <span
                  className={`pill ${entry.expiryGroup === 'already-expired' ? 'pill--warning' : ''}`}
                >
                  {entry.expiryGroup === 'expires-within-seven-days'
                    ? `Expires in ${formatRemainingSeconds(entry.remainingSeconds)}`
                    : entry.expiryGroup === 'expires-later'
                      ? `Expires ${formatResetTime(entry.detail.expiresAtSeconds)}`
                      : entry.expiryGroup === 'already-expired'
                        ? 'Already expired'
                        : 'No expiry reported'}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="panel-note">
          “Expires within 7 days” is a fixed display rule applied to the reported timestamp. Token
          Trail cannot purchase, transfer, or redeem credits.
        </p>
      </section>
    </>
  );
}
