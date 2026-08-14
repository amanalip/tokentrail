// Import React state and lifecycle helpers for the renderer-only Overview presentation.
import { useEffect, useMemo, useState } from 'react';

// Import the icon-only Phase 2 asset so the product name remains accessible live text.
import logoUrl from '../../assets/branding/tokentrail-icon-v2-dark.png';

// Import only renderer-safe public snapshot types and the honest initial state factory.
import {
  createLoadingOverviewSnapshot,
  type OverviewSnapshot,
  type QuotaBucket,
  type QuotaWindow,
} from '../shared/contracts/overview-snapshot';

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

// Format a finite percentage for concise visible and accessible output.
function formatPercentage(value: number | null): string {
  // Preserve absence as plain language instead of displaying zero.
  return value === null ? 'Unavailable' : `${Math.round(value * 10) / 10}%`;
}

// Format a reported duration without naming an unsupported weekly or daily period.
function formatDuration(minutes: number | null): string {
  // Preserve missing duration as an explicit unavailable value.
  if (minutes === null) return 'Duration unavailable';

  // Present exact whole-day durations when the source divides evenly.
  if (minutes % 1_440 === 0) {
    const days = minutes / 1_440;
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  }

  // Present exact whole-hour durations when possible.
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  // Fall back to the reported minute unit without rounding.
  return `${minutes} minutes`;
}

// Format a Unix timestamp in the user's local timezone without changing its meaning.
function formatResetTime(timestampSeconds: number | null): string {
  // Preserve absence honestly.
  if (timestampSeconds === null) return 'Reset time unavailable';

  // Convert the validated seconds value only at presentation time.
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestampSeconds * 1_000));
}

// Calculate a conservative reset countdown from the reported timestamp and current local clock.
function formatResetCountdown(timestampSeconds: number | null): string {
  // Preserve absence instead of inventing a countdown.
  if (timestampSeconds === null) return 'Countdown unavailable';

  // Calculate whole remaining seconds only for presentation; do not infer that a passed reset occurred.
  const remainingSeconds = Math.floor(timestampSeconds - Date.now() / 1_000);
  if (remainingSeconds <= 0) return 'Reset time passed';

  // Prefer the largest practical unit while keeping the wording explicitly approximate.
  const days = Math.floor(remainingSeconds / 86_400);
  if (days > 0) return `About ${days} ${days === 1 ? 'day' : 'days'} remaining`;

  // Fall back to whole hours or minutes for shorter windows.
  const hours = Math.floor(remainingSeconds / 3_600);
  if (hours > 0) return `About ${hours} ${hours === 1 ? 'hour' : 'hours'} remaining`;
  const minutes = Math.max(1, Math.floor(remainingSeconds / 60));
  return `About ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} remaining`;
}

// Format an ISO refresh timestamp as a concise local time.
function formatRefreshTime(timestamp: string | null): string {
  // Avoid implying a successful refresh before one occurred.
  if (timestamp === null) return 'Not refreshed yet';

  // Present the already validated timestamp in the user's locale.
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(timestamp));
}

// Choose the first server primary window, then the first available window, without concealing other buckets.
function selectPrimaryWindow(
  quotas: readonly QuotaBucket[],
): { readonly bucket: QuotaBucket; readonly window: QuotaWindow } | null {
  // Prefer an explicitly primary server slot in stable bucket order.
  for (const bucket of quotas) {
    const primaryWindow = bucket.windows.find((window) => window.kind === 'primary');
    if (primaryWindow) return { bucket, window: primaryWindow };
  }

  // Fall back deterministically to the first supported window when no primary slot exists.
  const firstBucket = quotas.find((bucket) => bucket.windows.length > 0);
  const firstWindow = firstBucket?.windows[0];
  return firstBucket && firstWindow ? { bucket: firstBucket, window: firstWindow } : null;
}

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
        {bucket.reached ? <span className="pill pill--warning">Limit reached</span> : null}
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
            credentials.
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
        </div>
      </section>
    );
  }

  // Data-bearing states render their details in the parent Overview sections.
  return null;
}

/** Render the accessible Phase 2 read-only Overview from normalized preload data. */
export function App() {
  // Begin with an honest loading state until preload returns its current snapshot.
  const [snapshot, setSnapshot] = useState<OverviewSnapshot>(() =>
    createLoadingOverviewSnapshot(null),
  );

  // Track only local button feedback; the privileged controller owns refresh deduplication.
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Subscribe once to validated preload snapshots and read the current state.
  useEffect(() => {
    // Prevent a late initial promise from updating an unmounted renderer.
    let isMounted = true;

    // Subscribe before reading so an immediate refresh update cannot be missed.
    const unsubscribe = window.tokenTrail.onOverviewChanged((nextSnapshot) => {
      if (isMounted) setSnapshot(nextSnapshot);
    });

    // Read the controller's current snapshot without initiating another refresh.
    void window.tokenTrail.getOverviewSnapshot().then((currentSnapshot) => {
      if (isMounted) setSnapshot(currentSnapshot);
    });

    // Remove the exact preload listener and reject late updates during unmount.
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Select one deterministic primary presentation while preserving the complete bucket grid below.
  const primarySelection = useMemo(() => selectPrimaryWindow(snapshot.quotas), [snapshot.quotas]);

  // Request one purpose-specific refresh and show immediate local feedback.
  const refresh = async () => {
    // Ignore duplicate button activation while the first bridge promise is unresolved.
    if (isRefreshing) return;

    // Disable the button immediately for visible and assistive feedback.
    setIsRefreshing(true);
    try {
      // Replace state only with the schema-validated result returned by preload.
      setSnapshot(await window.tokenTrail.refreshOverview());
    } finally {
      // Re-enable the control regardless of the safe resulting state.
      setIsRefreshing(false);
    }
  };

  // Derive one compact connection label from the explicit state machine.
  const connectionLabel =
    snapshot.state === 'ready' || snapshot.state === 'partial'
      ? 'Codex connected'
      : snapshot.state === 'stale'
        ? 'Showing saved snapshot'
        : snapshot.state === 'loading' || snapshot.state === 'not-started'
          ? 'Connecting locally'
          : 'Codex attention needed';

  // Render one application shell with stable navigation, status, and content landmarks.
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <a className="brand" href="#overview" aria-label="Token Trail Overview">
          <img src={logoUrl} alt="" width="44" height="44" />
          <span>Token Trail</span>
        </a>
        <nav aria-label="Token Trail sections">
          <a className="nav-item nav-item--active" href="#overview" aria-current="page">
            <span aria-hidden="true">◉</span>Overview
          </a>
          <span className="nav-caption">More views arrive in Phase 3</span>
        </nav>
        <div className="privacy-note">
          <span aria-hidden="true">◇</span>
          <p>Local and read-only. No Token Trail telemetry.</p>
        </div>
      </aside>

      <main className="overview" id="overview">
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
              onClick={refresh}
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
                Updated {formatRefreshTime(snapshot.lastSuccessfulRefreshAt)}. The latest refresh
                failed.
              </span>
            </div>
            <button type="button" onClick={refresh} disabled={isRefreshing}>
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
                <strong>{formatPercentage(primarySelection.window.remainingPercent.value)}</strong>
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
                value={formatResetTime(primarySelection.window.resetsAt.value)}
                provenance="Codex-reported"
              />
              <MetricLine
                label="Countdown"
                value={formatResetCountdown(primarySelection.window.resetsAt.value)}
                provenance="Calculated by Token Trail"
              />
              <MetricLine
                label="Updated"
                value={formatRefreshTime(snapshot.lastSuccessfulRefreshAt)}
                provenance="Locally observed"
              />
            </dl>
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
              Token Trail never converts one into the other.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
