// Import React state for the diagnostics preview lifecycle.
import { useState } from 'react';

// Import the validated contracts rendered by this route.
import type { OverviewSnapshot } from '../../shared/contracts/overview-snapshot';
import type { Preferences } from '../../shared/contracts/preferences';
import type { DiagnosticsDocument } from '../../shared/contracts/diagnostics';
import { REFRESH_INTERVAL_LIMITS } from '../../shared/contracts/preferences';

// Import reviewed display formatters.
import { formatRefreshTime } from '../formatting';

/** Render preferences with validated persistence and the redacted diagnostics preview/export flow. */
export function SettingsDiagnosticsRoute({
  snapshot,
  preferences,
  savePreferences,
}: {
  snapshot: OverviewSnapshot;
  preferences: Preferences;
  // Adopt the shared hook updater so every save applies immediately instead of waiting for a restart.
  savePreferences: (next: Preferences) => Promise<void>;
}) {
  // Track which tab is visible; both concern local application state.
  const [tab, setTab] = useState<'preferences' | 'diagnostics'>('preferences');

  // Track the diagnostics preview document and export outcome for honest feedback.
  const [preview, setPreview] = useState<DiagnosticsDocument | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Track the two-step clear-data confirmation so a single click can never delete data.
  const [confirmingClear, setConfirmingClear] = useState(false);

  // Clear only Token Trail-owned data after explicit confirmation and adopt returned defaults.
  const clearOwnedData = async (): Promise<void> => {
    await window.tokenTrail.clearApplicationData();
    setConfirmingClear(false);
  };

  // Build a fresh redacted preview before any save is possible.
  const buildPreview = async (): Promise<void> => {
    setExportMessage(null);
    setPreview(await window.tokenTrail.previewDiagnostics());
  };

  // Export exactly the retained previewed document through the native save dialog.
  const exportPreviewed = async (): Promise<void> => {
    const result = await window.tokenTrail.exportDiagnostics();
    setExportMessage(
      result.saved
        ? 'Diagnostics saved to the location you chose.'
        : result.errorCategory === 'canceled'
          ? 'Export canceled.'
          : 'Export failed. Preview the diagnostics and try again.',
    );
  };

  // Render the two-tab local state route.
  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Local application state</p>
          <h1>Settings &amp; Diagnostics</h1>
        </div>
        <div className="view-toggle" role="group" aria-label="Settings sections">
          <button
            type="button"
            aria-pressed={tab === 'preferences'}
            onClick={() => setTab('preferences')}
          >
            Preferences
          </button>
          <button
            type="button"
            aria-pressed={tab === 'diagnostics'}
            onClick={() => setTab('diagnostics')}
          >
            Diagnostics
          </button>
        </div>
      </header>

      {tab === 'preferences' ? (
        <>
          <section className="panel" aria-labelledby="appearance-title">
            <div className="section-heading">
              <h2 id="appearance-title">Appearance</h2>
            </div>
            <fieldset className="preference-fieldset">
              <legend>Theme</legend>
              {(['system', 'light', 'dark'] as const).map((theme) => (
                <label key={theme}>
                  <input
                    type="radio"
                    name="theme"
                    checked={preferences.theme === theme}
                    onChange={() => void savePreferences({ ...preferences, theme })}
                  />
                  {theme[0]?.toUpperCase()}
                  {theme.slice(1)}
                </label>
              ))}
            </fieldset>
            <fieldset className="preference-fieldset">
              <legend>Motion</legend>
              {(['system', 'reduced', 'full'] as const).map((motion) => (
                <label key={motion}>
                  <input
                    type="radio"
                    name="reducedMotion"
                    checked={preferences.reducedMotion === motion}
                    onChange={() => void savePreferences({ ...preferences, reducedMotion: motion })}
                  />
                  {motion[0]?.toUpperCase()}
                  {motion.slice(1)}
                </label>
              ))}
            </fieldset>
            <fieldset className="preference-fieldset">
              <legend>Time format</legend>
              {(['system', '12h', '24h'] as const).map((format) => (
                <label key={format}>
                  <input
                    type="radio"
                    name="timeFormat"
                    checked={preferences.timeFormat === format}
                    onChange={() => void savePreferences({ ...preferences, timeFormat: format })}
                  />
                  {format === 'system' ? 'System default' : format}
                </label>
              ))}
            </fieldset>
          </section>

          <section className="panel" aria-labelledby="refresh-title">
            <div className="section-heading">
              <h2 id="refresh-title">Refresh</h2>
            </div>
            <label className="preference-toggle">
              <input
                type="checkbox"
                checked={preferences.automaticRefreshEnabled}
                onChange={(event) =>
                  void savePreferences({
                    ...preferences,
                    automaticRefreshEnabled: event.target.checked,
                  })
                }
              />
              Automatic refresh
            </label>
            <label className="preference-toggle">
              Interval (minutes)
              <input
                type="number"
                min={REFRESH_INTERVAL_LIMITS.minimumMinutes}
                max={REFRESH_INTERVAL_LIMITS.maximumMinutes}
                value={preferences.refreshIntervalMinutes}
                disabled={!preferences.automaticRefreshEnabled}
                onChange={(event) => {
                  // Clamp into the enforced safe range before persistence validates it again.
                  const candidate = Number(event.target.value);
                  if (!Number.isFinite(candidate)) return;
                  const clamped = Math.min(
                    REFRESH_INTERVAL_LIMITS.maximumMinutes,
                    Math.max(REFRESH_INTERVAL_LIMITS.minimumMinutes, Math.round(candidate)),
                  );
                  void savePreferences({ ...preferences, refreshIntervalMinutes: clamped });
                }}
              />
            </label>
            <p className="panel-note">Automatic refresh remains off by default pending evidence.</p>
          </section>

          <section className="panel" aria-labelledby="data-title">
            <div className="section-heading">
              <h2 id="data-title">Local data</h2>
            </div>
            <p className="panel-note">
              Token Trail stores these preferences only. Usage history and session observations are
              never persisted. Clearing data removes only Token Trail-owned files.
            </p>
            {confirmingClear ? (
              <div role="alertdialog" aria-labelledby="clear-confirm-title" className="panel">
                <h3 id="clear-confirm-title">Clear Token Trail data?</h3>
                <p className="panel-note">
                  This deletes the preferences document and restores defaults. Codex and its data
                  are not touched. This cannot be undone.
                </p>
                <div className="header-actions">
                  <button type="button" onClick={() => void clearOwnedData()}>
                    Clear data
                  </button>
                  <button type="button" onClick={() => setConfirmingClear(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmingClear(true)}>
                Clear data
              </button>
            )}
          </section>
        </>
      ) : (
        <>
          <section className="panel" aria-labelledby="connection-title">
            <div className="section-heading">
              <h2 id="connection-title">Connection</h2>
            </div>
            <dl className="metric-grid">
              <div className="metric-line">
                <dt>Codex connection</dt>
                <dd>
                  <span>{snapshot.state}</span>
                  <small>Last refresh category</small>
                </dd>
              </div>
              <div className="metric-line">
                <dt>Last successful refresh</dt>
                <dd>
                  <span>{formatRefreshTime(snapshot.lastSuccessfulRefreshAt)}</span>
                  <small>Locally observed</small>
                </dd>
              </div>
            </dl>
          </section>

          <section className="panel" aria-labelledby="diagnostics-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Redacted preview before any save</p>
                <h2 id="diagnostics-title">Diagnostics</h2>
              </div>
              <div className="header-actions">
                <button type="button" onClick={() => void buildPreview()}>
                  Build preview
                </button>
                <button
                  type="button"
                  onClick={() => void exportPreviewed()}
                  disabled={preview === null}
                >
                  Export…
                </button>
              </div>
            </div>

            {exportMessage !== null ? (
              <p className="panel-note" role="status">
                {exportMessage}
              </p>
            ) : null}

            {preview === null ? (
              <p className="empty-detail">
                Build a preview first. Exports write exactly the previewed document.
              </p>
            ) : (
              <div
                className="table-scroll"
                tabIndex={0}
                role="region"
                aria-label="Diagnostics preview"
              >
                <pre className="diagnostic-preview">{JSON.stringify(preview, null, 2)}</pre>
              </div>
            )}
            <p className="panel-note">
              The preview contains no paths, identifiers, prompts, raw protocol data, or environment
              values. The destination is chosen through your operating system's save dialog.
            </p>
          </section>
        </>
      )}
    </>
  );
}
