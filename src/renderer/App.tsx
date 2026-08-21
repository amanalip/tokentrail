// Import React hooks for hash-based navigation and preference-driven theming.
import { useEffect, useRef, useState } from 'react';

// Import the icon-only export sized for the 44-pixel brand tile at two-times density so the
// renderer bundle carries kilobytes instead of the full installer-scale master.
import logoUrl from '../../assets/branding/exports/tokentrail-icon-88.png';

// Import the shared snapshot and preference hooks used by every route.
import { useOverviewSnapshot, usePreferences } from './hooks';

// Import the six approved v1 destinations.
import { OverviewRoute } from './routes/OverviewRoute';
import { QuotaWindowsRoute } from './routes/QuotaWindowsRoute';
import { UsageRoute } from './routes/UsageRoute';
import { CreditsRoute } from './routes/CreditsRoute';
import { LEARN_ENTRY_IDS, LearnRoute } from './routes/LearnRoute';
import { SettingsDiagnosticsRoute } from './routes/SettingsDiagnosticsRoute';

// Enumerate the closed route identifiers mapped one-to-one onto navigation hashes.
const ROUTES = Object.freeze([
  'overview',
  'windows',
  'usage',
  'credits',
  'learn',
  'settings',
] as const);

// Derive the route identifier union from the reviewed constant.
export type RouteId = (typeof ROUTES)[number];

// Describe one navigation destination with its label and accessible description.
const NAV_ITEMS: Readonly<Record<RouteId, { readonly label: string; readonly hint: string }>> =
  Object.freeze({
    overview: { label: 'Overview', hint: 'Current capacity summary' },
    windows: { label: 'Quota Windows', hint: 'All reported quota windows' },
    usage: { label: 'Usage', hint: 'Aggregate token activity' },
    credits: { label: 'Credits', hint: 'Balance and spending controls' },
    learn: { label: 'Learn', hint: 'Explanations and provenance' },
    settings: { label: 'Settings & Diagnostics', hint: 'Preferences and local diagnostics' },
  });

// Describe one resolved navigation target: the route plus an optional validated Learn entry focus.
interface ResolvedRoute {
  readonly route: RouteId;
  readonly learnEntryId: string | null;
}

/**
 * Parse the current location hash into a known route, defaulting to Overview. Deep links of the form
 * `#learn/<entry-id>` are accepted only when the entry identifier exactly matches the reviewed list, so
 * protocol or user data can never select arbitrary content.
 */
function parseRoute(hash: string): ResolvedRoute {
  // Strip the leading fragment marker and split the optional two-segment form.
  const candidate = hash.replace(/^#/u, '');
  const [routePart, entryPart] = candidate.split('/');

  // Reject unknown routes entirely; every fallback lands on Overview with no focused entry.
  if (!ROUTES.some((route) => route === routePart)) {
    return { route: 'overview', learnEntryId: null };
  }

  // Accept a Learn deep link only when its identifier is on the closed reviewed list.
  const learnEntryCandidate = routePart === 'learn' ? (entryPart ?? '') : '';
  if (LEARN_ENTRY_IDS.some((id) => id === learnEntryCandidate)) {
    return { route: 'learn', learnEntryId: learnEntryCandidate };
  }

  // Return the exact known route without carrying unvalidated segment data.
  return { route: routePart as RouteId, learnEntryId: null };
}

/** Render the accessible application shell with stable navigation and the active route. */
export function App() {
  // Track the active route from the location hash so navigation works without a router dependency.
  const [target, setTarget] = useState<ResolvedRoute>(() => parseRoute(window.location.hash));

  // Share one snapshot subscription and one preferences document across all routes.
  const { snapshot, refresh, isRefreshing } = useOverviewSnapshot();
  const { preferences, savePreferences, adoptPreferences } = usePreferences();

  // Follow hash changes so keyboard and assistive navigation stay first-class.
  useEffect(() => {
    const onHashChange = (): void => setTarget(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Move keyboard and assistive-technology focus to the new route's heading after every
  // intentional route change, so users land on the content they asked for instead of wherever
  // focus happened to sit. The initial render keeps the document's natural focus start, and
  // Learn deep links delegate attention to their targeted entry card inside the route.
  const previousRouteRef = useRef<RouteId | null>(null);
  useEffect(() => {
    const isFirstRender = previousRouteRef.current === null;
    previousRouteRef.current = target.route;
    if (isFirstRender || target.learnEntryId !== null) return;

    const heading = document.querySelector<HTMLElement>('#overview h1');
    if (heading === null) return;
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  }, [target]);

  // Apply the explicit theme attribute at the document root so the reviewed palettes activate.
  useEffect(() => {
    // System defers to the packaged media-query defaults without an explicit attribute.
    if (preferences.theme === 'system') {
      delete document.documentElement.dataset['theme'];
    } else {
      document.documentElement.dataset['theme'] = preferences.theme;
    }
  }, [preferences.theme]);

  // Resolve the effective motion class for reduced-motion overrides beyond the media query.
  const motionClass = `motion-${preferences.reducedMotion}`;

  // Navigation relies on standard fragment links; the hashchange listener owns route state updates.

  // Render one application shell with stable navigation, status, and content landmarks.
  return (
    <div className={`app-shell ${motionClass}`}>
      {/* Offer keyboard users an immediate bypass of the navigation rail. Activation moves focus
          into the content landmark without rewriting the hash, so a deep-linked route survives. */}
      <a
        className="skip-link"
        href="#overview"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('overview')?.focus();
        }}
      >
        Skip to content
      </a>
      <aside className="sidebar" aria-label="Primary navigation">
        <a className="brand" href="#overview" aria-label="Token Trail Overview">
          <img src={logoUrl} alt="" width="44" height="44" />
          <span>Token Trail</span>
        </a>
        <nav aria-label="Token Trail sections">
          {ROUTES.map((id) => (
            <a
              key={id}
              className={`nav-item ${target.route === id ? 'nav-item--active' : ''}`}
              href={`#${id}`}
              aria-current={target.route === id ? 'page' : undefined}
            >
              <span aria-hidden="true">{target.route === id ? '◉' : '○'}</span>
              {NAV_ITEMS[id].label}
            </a>
          ))}
        </nav>
        <div className="privacy-note">
          <span aria-hidden="true">◇</span>
          <p>Local and read-only. No Token Trail telemetry.</p>
        </div>
      </aside>

      {/* The negative tab index lets the skip link move focus here without joining Tab order. */}
      <main className="overview" id="overview" tabIndex={-1}>
        {target.route === 'overview' && (
          <OverviewRoute
            snapshot={snapshot}
            preferences={preferences}
            refresh={refresh}
            isRefreshing={isRefreshing}
          />
        )}
        {target.route === 'windows' && (
          <QuotaWindowsRoute snapshot={snapshot} preferences={preferences} />
        )}
        {target.route === 'usage' && <UsageRoute snapshot={snapshot} preferences={preferences} />}
        {target.route === 'credits' && <CreditsRoute snapshot={snapshot} />}
        {target.route === 'learn' && <LearnRoute focusEntryId={target.learnEntryId} />}
        {target.route === 'settings' && (
          <SettingsDiagnosticsRoute
            snapshot={snapshot}
            preferences={preferences}
            savePreferences={savePreferences}
            adoptPreferences={adoptPreferences}
          />
        )}
      </main>
    </div>
  );
}
