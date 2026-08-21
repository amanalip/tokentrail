// Import shared domain orderings so the route derives every summary from one normalized source.
import { buildResetTimeline, orderQuotaAttention } from '../../shared/domain/quota-ordering';

// Import the normalized snapshot and preference contracts for presentation.
import type { OverviewSnapshot } from '../../shared/contracts/overview-snapshot';
import type { Preferences } from '../../shared/contracts/preferences';

// Import reviewed display formatters.
import {
  formatDuration,
  formatPercentage,
  formatResetCountdown,
  formatResetTime,
} from '../formatting';

// Import the render-safe clock hook for countdown and timeline classification.
import { useCurrentUnixSeconds } from '../hooks';

/** Render every reported quota bucket with per-field provenance and deterministic ordering. */
export function QuotaWindowsRoute({
  snapshot,
  preferences,
}: {
  snapshot: OverviewSnapshot;
  preferences: Preferences;
}) {
  // Derive the attention order and timeline from the same snapshot at render time only.
  const nowSeconds = useCurrentUnixSeconds();
  const attention = orderQuotaAttention(snapshot.quotas, nowSeconds);
  const timeline = buildResetTimeline(snapshot.quotas, nowSeconds);

  // Explain honest empty states instead of rendering a fabricated table.
  if (snapshot.quotas.length === 0) {
    return (
      <>
        <header className="page-header">
          <div>
            <p className="eyebrow">All reported windows</p>
            <h1>Quota Windows</h1>
          </div>
        </header>
        <section className="state-panel" aria-labelledby="windows-empty-title">
          <span className="state-icon" aria-hidden="true">
            ○
          </span>
          <div>
            <h2 id="windows-empty-title">No quota windows are available</h2>
            <p>Connect to Codex and refresh to read the reported quota buckets.</p>
          </div>
        </section>
      </>
    );
  }

  // Render the complete Quota Windows route in stable attention order.
  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Grouped by reported bucket</p>
          <h1>Quota Windows</h1>
        </div>
        <span className="connection">{snapshot.quotas.length} buckets reported</span>
      </header>

      <p className="panel-note">
        Buckets appear in deterministic attention order: reached-state reports first, then highest
        used percentage, earliest reset, then stable identifiers. This order does not predict future
        use or guarantee that a task will run.
      </p>

      <div className="quota-grid">
        {attention.map((group) => (
          <article
            className="quota-card"
            key={group.bucket.id}
            aria-labelledby={`windows-${group.bucket.id}`}
          >
            <header className="quota-card__header">
              <div>
                <p className="eyebrow">Reported bucket</p>
                <h2 id={`windows-${group.bucket.id}`}>{group.bucket.name}</h2>
                {group.bucket.planType ? (
                  <span className="pill">{group.bucket.planType} plan</span>
                ) : null}
              </div>
              {group.reached ? (
                <span className="pill pill--warning">Reached state reported</span>
              ) : null}
            </header>

            {group.windows.length === 0 ? (
              <p className="empty-detail">Codex reported this bucket without a supported window.</p>
            ) : (
              <div className="window-list">
                {group.windows.map(({ window }) => {
                  // Clamp only the visual bar while preserving the normalized textual value.
                  const remaining = window.remainingPercent.value;
                  const visualRemaining =
                    remaining === null ? 0 : Math.min(100, Math.max(0, remaining));

                  // Render one semantic window section with raw-safe detail rows.
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
                        aria-label={`${group.bucket.name} ${window.kind} remaining`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={remaining === null ? undefined : visualRemaining}
                        aria-valuetext={formatPercentage(remaining)}
                      >
                        <span style={{ width: `${visualRemaining}%` }} />
                      </div>
                      <dl className="metric-grid metric-grid--compact">
                        <div className="metric-line">
                          <dt>Used</dt>
                          <dd>
                            <span>{formatPercentage(window.usedPercent.value)}</span>
                            <small>{window.usedPercent.provenance}</small>
                          </dd>
                        </div>
                        <div className="metric-line">
                          <dt>Remaining</dt>
                          <dd>
                            <span>{formatPercentage(remaining)}</span>
                            <small>{window.remainingPercent.provenance}</small>
                          </dd>
                        </div>
                        <div className="metric-line">
                          <dt>Window duration</dt>
                          <dd>
                            <span>{formatDuration(window.durationMinutes.value)}</span>
                            <small>{window.durationMinutes.provenance}</small>
                          </dd>
                        </div>
                        <div className="metric-line">
                          <dt>Resets</dt>
                          <dd>
                            <span>
                              {formatResetTime(window.resetsAt.value, preferences.timeFormat)}
                            </span>
                            <small>{window.resetsAt.provenance}</small>
                          </dd>
                        </div>
                        <div className="metric-line">
                          <dt>Countdown</dt>
                          <dd>
                            <span>{formatResetCountdown(window.resetsAt.value)}</span>
                            <small>Calculated by Token Trail</small>
                          </dd>
                        </div>
                      </dl>
                    </section>
                  );
                })}
              </div>
            )}
          </article>
        ))}
      </div>

      <section className="panel" aria-labelledby="windows-timeline-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Chronological across all valid windows</p>
            <h2 id="windows-timeline-title">Reset timeline</h2>
          </div>
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
    </>
  );
}
