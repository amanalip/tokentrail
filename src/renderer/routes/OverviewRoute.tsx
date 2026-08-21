// Import shared domain orderings so the Overview derives every summary from one normalized source.
import {
  buildResetTimeline,
  orderQuotaAttention,
  selectPrimaryWindow,
} from '../../shared/domain/quota-ordering';
import { buildCombinedCapacityClauses } from '../../shared/domain/combined-capacity';

// Import the normalized snapshot and preference contracts for presentation.
import type { OverviewSnapshot, QuotaBucket } from '../../shared/contracts/overview-snapshot';
import type { Preferences } from '../../shared/contracts/preferences';

// Import the render-safe clock hook for countdown and timeline classification.
import { useCurrentUnixSeconds } from '../hooks';

// Import reviewed display formatters instead of duplicating formatting rules per route.
import {
  formatCounter,
  formatDuration,
  formatPercentage,
  formatRefreshTime,
  formatResetCountdown,
  formatResetTime,
} from '../formatting';

// Map safe error categories to local reviewed copy without displaying upstream exception text.
const ERROR_COPY: Readonly<Record<NonNullable<OverviewSnapshot['errorCategory']>, string>> =
  Object.freeze({
    'codex-not-found': 'Codex was not found on this computer.',
    'codex-unavailable': 'Codex is temporarily unavailable.',
    'codex-incompatible': 'This Codex version does not support the required read-only data.',
    'request-timeout': 'Codex did not answer the read request in time.',
    'invalid-response': 'Codex returned data Token Trail could not safely understand.',
    'permission-denied': 'The requested read was not permitted.',
    'internal-error': 'Token Trail could not complete this local read.',
  });

// Render one normalized metric with its provenance available as visible supporting text.
function MetricLine({
  label,
  value,
  provenance,
}: {
  label: string;
  value: string;
  provenance: string;
}) {
  // Keep the semantic name, value, and provenance adjacent for visual and screen-reader users.
  return (
    <div className="metric-line">
      <dt>{label}</dt>
      <dd>
        <span>{value}</span>
        <small>{provenance}</small>
      </dd>
    </div>
  );
}

// Render a compact supporting bucket without hiding either reported window.
function QuotaBucketCard({ bucket }: { bucket: QuotaBucket }) {
  // Keep the bucket name as text so protocol strings are escaped by React automatically.
  return (
    <article className="quota-card" aria-labelledby={`quota-${bucket.id}`}>
      <header className="quota-card__header">
        <div>
          <p className="eyebrow">Reported quota</p>
          <h3 id={`quota-${bucket.id}`}>{bucket.name}</h3>
        </div>
        {bucket.reached ? (
          <span className="pill pill--warning">
            Limit reached ·{' '}
            {
              <a href="#learn/when-a-limit-is-hit" className="pill-link">
                what this means
              </a>
            }
          </span>
        ) : null}
      </header>

      {bucket.windows.length === 0 ? (
        <p className="empty-detail">Codex reported this bucket without a supported window.</p>
      ) : (
        <div className="window-list">
          {bucket.windows.map((window) => {
            // Clamp only the visual bar while preserving the normalized textual source value.
            const remaining = window.remainingPercent.value;
            const visualRemaining = remaining === null ? 0 : Math.min(100, Math.max(0, remaining));

            // Render one semantic window section.
            return (
              <section
                className="window-row"
                key={window.kind}
                aria-label={`${window.kind} window`}
              >
                <div className="window-row__summary">
                  <span className="window-kind">{window.kind}</span>
                  <strong>{formatPercentage(remaining)} remaining</strong>
                </div>
                <div
                  className="progress-track progress-track--small"
                  role="progressbar"
                  aria-label={`${bucket.name} ${window.kind} remaining`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={remaining === null ? undefined : visualRemaining}
                  aria-valuetext={formatPercentage(remaining)}
                >
                  <span style={{ width: `${visualRemaining}%` }} />
                </div>
                <p>
                  {formatDuration(window.durationMinutes.value)} ·{' '}
                  {formatResetTime(window.resetsAt.value)}
                </p>
              </section>
            );
          })}
        </div>
      )}
    </article>
  );
}

// Render state-specific guidance while keeping the global header and privacy explanation stable.
function StatePanel({ snapshot }: { snapshot: OverviewSnapshot }) {
  // Render the first-load skeleton with meaningful accessible text.
  if (snapshot.state === 'loading' || snapshot.state === 'not-started') {
    return (
      <section className="state-panel" aria-labelledby="loading-title">
        <div className="spinner" aria-hidden="true" />
        <div>
          <h2 id="loading-title">Reading Codex usage</h2>
          <p>
            Token Trail is requesting approved account and quota fields from the local Codex
            app-server.
          </p>
        </div>
      </section>
    );
  }

  // Explain that authentication remains owned by Codex when no account is available.
  if (snapshot.state === 'signed-out') {
    return (
      <section className="state-panel" aria-labelledby="signed-out-title">
        <span className="state-icon" aria-hidden="true">
          ○
        </span>
        <div>
          <h2 id="signed-out-title">Codex is not signed in</h2>
          <p>
            Sign in through Codex, then return here and refresh. Token Trail never handles your
            credentials. After signing in, use the Refresh button above or read{' '}
            <a href="#learn/what-is-read">what Token Trail reads</a>.
          </p>
        </div>
      </section>
    );
  }

  // Explain unavailable, incompatible, and generic safe failures with local copy only.
  if (
    snapshot.state === 'unavailable' ||
    snapshot.state === 'unsupported' ||
    snapshot.state === 'error'
  ) {
    const heading =
      snapshot.state === 'unsupported'
        ? 'Codex compatibility needs attention'
        : snapshot.state === 'unavailable'
          ? 'Codex data is unavailable'
          : 'The latest read did not complete';
    return (
      <section className="state-panel state-panel--warning" aria-labelledby="error-title">
        <span className="state-icon" aria-hidden="true">
          !
        </span>
        <div>
          <h2 id="error-title">{heading}</h2>
          <p>
            {snapshot.errorCategory
              ? ERROR_COPY[snapshot.errorCategory]
              : 'No supported quota window was returned for this account.'}
          </p>
          {/* Offer the corrective path: sanitized connection facts live in the diagnostics tab. */}
          <p className="state-actions">
            Check connection details in <a href="#settings">Settings &amp; Diagnostics</a>, or read{' '}
            <a href="#learn/what-is-read">what Token Trail reads</a>.
          </p>
        </div>
      </section>
    );
  }

  // Data-bearing states render their details in the parent Overview sections.
  return null;
}

/** Render the accessible read-only Overview with all Phase 3 derived summaries. */
export function OverviewRoute({
  snapshot,
  preferences,
  refresh,
  isRefreshing,
}: {
  snapshot: OverviewSnapshot;
  preferences: Preferences;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}) {
  // Derive every ordering from the same normalized snapshot at render time only.
  const nowSeconds = useCurrentUnixSeconds();
  const primarySelection = selectPrimaryWindow(snapshot.quotas);
  const timeline = buildResetTimeline(snapshot.quotas, nowSeconds);
  const attention = orderQuotaAttention(snapshot.quotas, nowSeconds);
  const capacityClauses = buildCombinedCapacityClauses(snapshot, nowSeconds);

  // Derive one compact connection label from the explicit state machine.
  const connectionLabel =
    snapshot.state === 'ready' || snapshot.state === 'partial'
      ? 'Codex connected'
      : snapshot.state === 'stale'
        ? 'Showing saved snapshot'
        : snapshot.state === 'loading' || snapshot.state === 'not-started'
          ? 'Connecting locally'
          : 'Codex attention needed';

  // Render the complete Overview route.
  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Your Codex capacity</p>
          <h1>Overview</h1>
        </div>
        <div className="header-actions">
          <span className={`connection connection--${snapshot.state}`} role="status">
            <span aria-hidden="true" />
            {connectionLabel}
          </span>
          <button
            className="refresh-button"
            type="button"
            onClick={() => void refresh()}
            disabled={isRefreshing}
          >
            <span aria-hidden="true">↻</span>
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      {snapshot.state === 'stale' ? (
        <section className="stale-banner" role="alert">
          <div>
            <strong>Showing the last successful snapshot</strong>
            <span>
              Updated {formatRefreshTime(snapshot.lastSuccessfulRefreshAt, preferences.timeFormat)}.
              The latest refresh failed.
            </span>
          </div>
          <button type="button" onClick={() => void refresh()} disabled={isRefreshing}>
            Try again
          </button>
        </section>
      ) : null}
      {snapshot.state === 'partial' ? (
        <section className="partial-banner" role="status">
          Some Codex fields were unavailable. Valid reported values are still shown below.
        </section>
      ) : null}

      <StatePanel snapshot={snapshot} />

      {primarySelection ? (
        <section className="primary-card" aria-labelledby="primary-quota-title">
          <div className="primary-card__top">
            <div>
              <p className="eyebrow">Primary reported window</p>
              <h2 id="primary-quota-title">{primarySelection.bucket.name}</h2>
              <p className="selection-note">
                Selected from the first server-designated primary window.
              </p>
            </div>
            {primarySelection.bucket.planType ? (
              <span className="pill">{primarySelection.bucket.planType} plan</span>
            ) : null}
          </div>
          <div className="primary-metric">
            <div className="remaining-value">
              <strong className="display-number">
                {formatPercentage(primarySelection.window.remainingPercent.value)}
              </strong>
              <span>remaining</span>
            </div>
            <div className="progress-group">
              <div
                className="progress-track"
                role="progressbar"
                aria-label={`${primarySelection.bucket.name} remaining quota`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={
                  primarySelection.window.remainingPercent.value === null
                    ? undefined
                    : Math.min(100, Math.max(0, primarySelection.window.remainingPercent.value))
                }
                aria-valuetext={formatPercentage(primarySelection.window.remainingPercent.value)}
              >
                <span
                  style={{
                    width: `${Math.min(100, Math.max(0, primarySelection.window.remainingPercent.value ?? 0))}%`,
                  }}
                />
              </div>
              <p>
                {formatPercentage(primarySelection.window.usedPercent.value)} used ·{' '}
                {formatDuration(primarySelection.window.durationMinutes.value)} window
              </p>
            </div>
          </div>
          <dl className="metric-grid">
            <MetricLine
              label="Used"
              value={formatPercentage(primarySelection.window.usedPercent.value)}
              provenance="Codex-reported"
            />
            <MetricLine
              label="Remaining"
              value={formatPercentage(primarySelection.window.remainingPercent.value)}
              provenance="Calculated by Token Trail"
            />
            <MetricLine
              label="Resets"
              value={formatResetTime(
                primarySelection.window.resetsAt.value,
                preferences.timeFormat,
              )}
              provenance="Codex-reported"
            />
            <MetricLine
              label="Countdown"
              value={formatResetCountdown(primarySelection.window.resetsAt.value)}
              provenance="Calculated by Token Trail"
            />
            <MetricLine
              label="Updated"
              value={formatRefreshTime(snapshot.lastSuccessfulRefreshAt, preferences.timeFormat)}
              provenance="Locally observed"
            />
          </dl>
        </section>
      ) : null}

      {timeline.entries.length > 0 || timeline.unknownTimeEntries.length > 0 ? (
        <section className="panel" aria-labelledby="next-changes-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Timeline</p>
              <h2 id="next-changes-title">Next changes</h2>
            </div>
            <span>Calculated ordering from reset times</span>
          </div>
          <ol className="timeline-list">
            {timeline.entries.map((entry) => (
              <li key={`${entry.bucketId}:${entry.windowKind}`}>
                <strong>{entry.bucketName}</strong>
                <span>{entry.windowKind} resets</span>
                <span>{formatResetTime(entry.resetsAtSeconds, preferences.timeFormat)}</span>
                <span>{formatResetCountdown(entry.resetsAtSeconds)}</span>
              </li>
            ))}
            {timeline.unknownTimeEntries.map((entry) => (
              <li key={`unknown:${entry.bucketId}:${entry.windowKind}`}>
                <strong>{entry.bucketName}</strong>
                <span>{entry.windowKind}</span>
                <span>No reset time was reported</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {attention.length > 0 ? (
        <section className="panel" aria-labelledby="attention-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Deterministic ordering</p>
              <h2 id="attention-title">Quota attention</h2>
            </div>
          </div>
          <p className="panel-note">
            Ordered to make the most constrained reported windows easy to find. This order does not
            predict future use or guarantee that a task will run. A reached state applies to its
            reported bucket, not an assumed window.
          </p>
          <ol className="attention-list">
            {attention.map((group) => (
              <li key={group.bucket.id}>
                <h3>
                  {group.bucket.name}
                  {group.reached ? (
                    <span className="pill pill--warning">
                      Reached state reported ·{' '}
                      <a href="#learn/when-a-limit-is-hit" className="pill-link">
                        what this means
                      </a>
                    </span>
                  ) : null}
                </h3>
                <ul>
                  {group.windows.map((entry) => (
                    <li key={entry.window.kind}>
                      <span>{entry.window.kind} window</span>
                      <span>{formatPercentage(entry.usedPercent)} used</span>
                      <span>{formatResetCountdown(entry.resetsAtSeconds)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="panel" aria-labelledby="capacity-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Separate account signals shown together</p>
            <h2 id="capacity-title">Current reported capacity</h2>
          </div>
        </div>
        <ul className="clause-list">
          {capacityClauses.map((clause, index) => {
            // Resolve the reviewed follow-up destination for this clause family, when one exists.
            const clauseTarget = CLAUSE_TARGETS[clause.clauseKey] ?? null;
            return (
              <li key={`${clause.clauseKey}:${index}`}>
                {(CLAUSE_COPY[clause.clauseKey] ?? CLAUSE_FALLBACK)(clause.values ?? {})}{' '}
                {clauseTarget === null ? null : (
                  <a href={`#${clauseTarget.route}`}>
                    {clauseTarget.route === 'windows' ? 'See window details' : 'See credit details'}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
        <p className="panel-note">
          Quota, credits, spending controls, and reset credits are displayed together but never
          added together.
        </p>
      </section>

      {snapshot.sessionObservation.startedAtIso !== null &&
      (snapshot.sessionObservation.quotaDeltas.length > 0 ||
        snapshot.sessionObservation.counterDeltas.length > 0 ||
        snapshot.sessionObservation.resetTransitions.length > 0) ? (
        <section className="panel" aria-labelledby="session-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">In-memory local observation</p>
              <h2 id="session-title">Changes since Token Trail opened</h2>
            </div>
            <span>
              {snapshot.sessionObservation.validSnapshotCount} valid snapshots since{' '}
              {formatRefreshTime(snapshot.sessionObservation.startedAtIso, preferences.timeFormat)}
            </span>
          </div>
          <ul className="session-list">
            {snapshot.sessionObservation.quotaDeltas.map((delta) => (
              <li key={`${delta.bucketId}:${delta.windowKind}`}>
                <strong>{delta.bucketName}</strong> {delta.windowKind} used{' '}
                {formatPercentage(delta.baselinePercent)} → {formatPercentage(delta.currentPercent)}{' '}
                ({delta.changePercentagePoints} percentage points)
              </li>
            ))}
            {snapshot.sessionObservation.counterDeltas.map((delta) => (
              <li key={delta.counterId}>
                <strong>Lifetime tokens</strong> {formatCounter(delta.baselineTokens)} →{' '}
                {formatCounter(delta.currentTokens)}{' '}
                {delta.increaseTokens !== null
                  ? `(+${formatCounter(delta.increaseTokens)} tokens)`
                  : '(source value changed)'}
              </li>
            ))}
            {snapshot.sessionObservation.resetTransitions.map((transition) => (
              <li key={`${transition.bucketId}:${transition.windowKind}:reset`}>
                <strong>{transition.bucketName}</strong> {transition.windowKind} reset timestamp
                changed; comparison restarted
              </li>
            ))}
          </ul>
          <p className="panel-note">
            Local observation only. This is not retained account history. Values clear when Token
            Trail exits. <a href="#learn/session-changes-vs-history">Why this is not history</a>.
          </p>
        </section>
      ) : null}

      {snapshot.quotas.length > 0 ? (
        <section className="all-quotas" aria-labelledby="all-quotas-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Complete snapshot</p>
              <h2 id="all-quotas-title">All reported quota buckets</h2>
            </div>
            <span>{snapshot.quotas.length} reported</span>
          </div>
          <div className="quota-grid">
            {snapshot.quotas.map((bucket) => (
              <QuotaBucketCard bucket={bucket} key={bucket.id} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="explanation" aria-labelledby="measurement-title">
        <span className="explanation__icon" aria-hidden="true">
          i
        </span>
        <div>
          <h2 id="measurement-title">Tokens and quota percentage measure different things</h2>
          <p>
            Token totals describe activity. Quota percentages are reported separately by Codex, so
            Token Trail never converts one into the other.{' '}
            <a href="#learn/tokens-vs-quota">Learn more</a>.
          </p>
        </div>
      </section>
    </>
  );
}

// Reviewed clause copy selected by stable key; interpolation values are pre-formatted exact strings.
const CLAUSE_COPY: Readonly<Record<string, (values: Readonly<Record<string, string>>) => string>> =
  Object.freeze({
    'no-reached-limit-reported': () => 'No reached limit was reported.',
    'reached-limit-reported': () => 'A reached limit was reported.',
    'no-quota-data': () => 'No quota windows were reported.',
    'credit-balance-reported': (values) => `Credit balance ${values['amount'] ?? ''} was reported.`,
    'credit-unlimited-reported': () => 'Codex reports an unlimited credit balance.',
    'no-credit-information': () => 'No credit information was reported.',
    'spending-control-remaining-reported': (values) =>
      `Spending control reports ${values['percent'] ?? ''}% remaining.`,
    'spending-control-reached': () => 'A spending control was reported as reached.',
    'reset-credits-available': (values) => `${values['count'] ?? '0'} reset credits available.`,
    'reset-credit-expires-within-seven-days': () => 'One reset credit expires within 7 days.',
    'no-reset-credit-information': () => 'No reset-credit count was reported.',
  });

// Map each clause family to the route holding its full detail so every summary offers a follow-up path.
const CLAUSE_TARGETS: Readonly<Record<string, { readonly route: 'windows' | 'credits' }>> =
  Object.freeze({
    'no-reached-limit-reported': { route: 'windows' },
    'reached-limit-reported': { route: 'windows' },
    'no-quota-data': { route: 'windows' },
    'credit-balance-reported': { route: 'credits' },
    'credit-unlimited-reported': { route: 'credits' },
    'no-credit-information': { route: 'credits' },
    'spending-control-remaining-reported': { route: 'credits' },
    'spending-control-reached': { route: 'credits' },
    'reset-credits-available': { route: 'credits' },
    'reset-credit-expires-within-seven-days': { route: 'credits' },
    'no-reset-credit-information': { route: 'credits' },
  });

// Render an explicit fallback for any future clause key so unknown values cannot render as blank.
const CLAUSE_FALLBACK = (): string => 'Reported capacity information is unavailable.';
