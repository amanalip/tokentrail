# Navigation and Route Composition

**Status:** Implemented in Phase 3
**Last updated:** August 21, 2026

This document explains the implemented route tree, navigation mechanics, data dependencies, and contextual links. The product specification (sections 7 and 8) controls required behavior.

## Route tree

Six destinations match the approved information architecture. Settings and Diagnostics share one destination with two tabs because both concern local application state.

```text
Token Trail (#overview default)
|
+-- #overview   OverviewRoute          — primary quota, timeline, attention, capacity, session changes
+-- #windows    QuotaWindowsRoute      — every reported bucket with per-field provenance
+-- #usage      UsageRoute             — chart/table, heatmap, statistics, comparisons, coverage
+-- #credits    CreditsRoute           — balance, spending control, reset credits
+-- #learn      LearnRoute             — searchable local explanations
`-- #settings   SettingsDiagnosticsRoute
                       |-- Preferences tab
                       `-- Diagnostics tab
```

## Navigation mechanics

- Navigation uses standard fragment links (`href="#overview"` and so on) handled by the `hashchange` event; there is no router dependency and no history API usage that could navigate away from the local origin.
- `parseRoute` accepts only exact identifiers from the closed `ROUTES` constant; any other hash falls back to Overview. User or protocol data can never select an arbitrary destination.
- Links are real anchors with `aria-current="page"` on the active item, so middle-click, keyboard, and assistive navigation behave like plain web navigation.
- No link triggers a remote request: fragments resolve locally under the packaged custom protocol.

## Data composition rules

Every route renders from the single normalized snapshot delivered by the shared `useOverviewSnapshot` hook:

- One preload subscription feeds all routes; no screen holds divergent privileged data.
- Derived summaries (timeline, attention order, capacity clauses) are recomputed at render time from the same snapshot via shared domain functions — never cached as separate state.
- Clock-dependent classifications use the render-safe `useCurrentUnixSeconds` hook (bounded 30-second interval), keeping React rendering pure while countdowns stay current.
- Preferences load once through `usePreferences`; saves persist complete validated replacements and adopt the stored result.

## Loading and failure boundaries

- Global states (loading, signed-out, unavailable, unsupported, error, stale, partial) render inside each data route's own empty/failure panels with reviewed copy.
- A failed endpoint marks the whole snapshot partial without erasing successful sections (for example, a failed usage read keeps valid quota data visible).
- Stale snapshots keep prior valid values visible behind an alert banner with a retry action.

## Contextual navigation

- Overview explains that tokens and quota percentages measure different things and deep-links to the Learn entry (`#learn/tokens-vs-quota`).
- Every error and signed-out state offers a corrective action: a link to the Settings & Diagnostics connection details and to `#learn/what-is-read`.
- Reached-state pills on bucket cards and the attention list link to `#learn/when-a-limit-is-hit` instead of leaving an unexplained warning label.
- Capacity clauses reference their sections: quota details link to Quota Windows, credit clauses link to Credits.
- Usage links its token-vs-quota note and missing-day coverage notes to their exact Learn entries; Credits' reached spending control links to the limit explanation.
- The session-changes panel links to `#learn/session-changes-vs-history`.
- Deep-link hashes of the form `#learn/<entry-id>` are validated against the closed reviewed entry list before rendering; unknown identifiers fall back to the Learn top with no focused card. The matched entry card is highlighted and scrolled into view.

## Route-level behaviors

| Route | Key implemented behaviors |
| --- | --- |
| Overview | Primary card with selection rule note; Next-changes timeline with unknown-time group; deterministic attention list with non-prediction notice; combined-capacity clause list; session-changes panel with in-memory disclaimer |
| Quota Windows | Attention-ordered bucket cards; per-field provenance rows for used/remaining/duration/reset/countdown; chronological reset timeline |
| Usage | Chart/table toggle with equivalent data; ECharts SVG bar chart with accessible text alternative; calendar heatmap distinguishing zero/positive/missing; six statistic cards labeled by exact range; two complete-period comparison blocks; coverage panel with missing-date list |
| Credits | Balance or unlimited state; spending-control detail with original units; authoritative reset-credit count with capped-detail explanation; expiry-grouped credit list |
| Learn | Local search over packaged text only; three topic groups; no remote fetch |
| Settings & Diagnostics | Theme/motion/time-format radios; bounded automatic-refresh interval; diagnostics tab requiring preview before export |

## Security notes

- Routes receive only schema-validated normalized types; no route can widen the bridge surface.
- The Learn search string stays in renderer state and is never sent anywhere.
- Settings persistence goes through the validated complete-replacement IPC contract described in [preferences-and-storage.md](preferences-and-storage.md).

## Test evidence

- `routes.test.tsx`: fragment-link navigation between routes, validated Learn deep links with focus fallback, contextual clause/error/reached/coverage links, Usage statistics/table/comparison honesty, chart-and-table same-source consistency, unavailable-never-zero statistics, Credits balance and capping copy, settings persistence payload, preview-before-export flow, clear-data confirmation, local Learn filtering, and a keyboard-only sweep activating all six destinations.
- `tests/e2e/fixture-catalog.spec.ts`: fixture-backed end-to-end coverage of the section 21.2 catalog including reached-state explanations, gapped usage, huge counters, sparse updates, and the keyboard route sweep in real Electron.
- `tests/e2e/preferences.spec.ts`: live theme application through real radio controls plus persistence across restart.
- `tests/e2e/window-identity.spec.ts` and `tests/e2e/typography.spec.ts`: runtime icon and numeric readability matrix evidence.

## Known limitations

- Route transitions do not yet move focus to the new heading (scheduled Phase 4 accessibility work); screen users currently rely on landmark navigation.
