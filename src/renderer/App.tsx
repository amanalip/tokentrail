// Import React hooks for hash-based navigation and preference-driven theming.
import { useEffect, useState } from 'react';

// Import the icon-only asset so the product name remains accessible live text.
import logoUrl from '../../assets/branding/tokentrail-icon-v2-dark.png';

// Import the shared snapshot and preference hooks used by every route.
import { useOverviewSnapshot, usePreferences } from './hooks';

// Import the six approved v1 destinations.
import { OverviewRoute } from './routes/OverviewRoute';
import { QuotaWindowsRoute } from './routes/QuotaWindowsRoute';
import { UsageRoute } from './routes/UsageRoute';
import { CreditsRoute } from './routes/CreditsRoute';
import { LearnRoute } from './routes/LearnRoute';
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

// Parse the current location hash into a known route, defaulting to Overview.
function parseRoute(hash: string): RouteId {
  // Strip the leading fragment marker and compare exact route identifiers.
  const candidate = hash.replace(/^#/u, '');
  return ROUTES.some((route) => route === candidate) ? (candidate as RouteId) : 'overview';
}

/** Render the accessible application shell with stable navigation and the active route. */
export function App() {
  // Track the active route from the location hash so navigation works without a router dependency.
  const [route, setRoute] = useState<RouteId>(() => parseRoute(window.location.hash));

  // Share one snapshot subscription and one preferences document across all routes.
  const { snapshot, refresh, isRefreshing } = useOverviewSnapshot();
  const { preferences } = usePreferences();

  // Follow hash changes so keyboard and assistive navigation stay first-class.
  useEffect(() => {
    const onHashChange = (): void => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

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
      <aside className="sidebar" aria-label="Primary navigation">
        <a className="brand" href="#overview" aria-label="Token Trail Overview">
          <img src={logoUrl} alt="" width="44" height="44" />
          <span>Token Trail</span>
        </a>
        <nav aria-label="Token Trail sections">
          {ROUTES.map((id) => (
            <a
              key={id}
              className={`nav-item ${route === id ? 'nav-item--active' : ''}`}
              href={`#${id}`}
              aria-current={route === id ? 'page' : undefined}
            >
              <span aria-hidden="true">{route === id ? '◉' : '○'}</span>
              {NAV_ITEMS[id].label}
            </a>
          ))}
        </nav>
        <div className="privacy-note">
          <span aria-hidden="true">◇</span>
          <p>Local and read-only. No Token Trail telemetry.</p>
        </div>
      </aside>

      <main className="overview" id="overview">
        {route === 'overview' && (
          <OverviewRoute
            snapshot={snapshot}
            preferences={preferences}
            refresh={refresh}
            isRefreshing={isRefreshing}
          />
        )}
        {route === 'windows' && <QuotaWindowsRoute snapshot={snapshot} preferences={preferences} />}
        {route === 'usage' && <UsageRoute snapshot={snapshot} preferences={preferences} />}
        {route === 'credits' && <CreditsRoute snapshot={snapshot} />}
        {route === 'learn' && <LearnRoute />}
        {route === 'settings' && (
          <SettingsDiagnosticsRoute snapshot={snapshot} preferences={preferences} />
        )}
      </main>
    </div>
  );
}
