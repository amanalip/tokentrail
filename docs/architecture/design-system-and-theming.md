# Token Trail Design System and Theming

**Status:** Implementation-in-progress (Phase 4 opened August 21, 2026)
**Implemented so far:** design-token layer, production vector identity with raster export pipeline, typography stack and licensing decision, icon and glyph policy, complete light/dark/system palettes with a programmatic WCAG audit and theme-aware status tints, automated width-and-zoom layout sweep, theme-wired chart presentation, completed motion and idle-CPU review
**Still open inside this document's scope:** curated theme-matrix screenshots for the versioned report (captured at phase close); later revisions from the section 8.3 accessibility campaign
**Controlling documents:** [product_spec_electron.md](../../product_spec_electron.md), [implementation_plan.md](../../implementation_plan.md) section 8.2, [dependency-rationale.md](dependency-rationale.md)
**Last updated:** August 21, 2026

This document records the implemented visual system and the decisions behind it. It describes only behavior that exists in the repository; items still under construction stay listed above until their evidence exists.

## 1. Design tokens

All renderer presentation values live in one reviewed token layer at the top of [`src/renderer/styles.css`](../../src/renderer/styles.css). Component rules reference tokens instead of raw values so theme palettes, focus geometry, chart semantics, and state colors can be reviewed and changed in one place.

| Group | Tokens | Contract |
| --- | --- | --- |
| Color primitives | `--background`, `--sidebar`, `--surface`, `--surface-raised`, `--border`, `--border-soft`, `--text`, `--muted`, `--muted-strong`, `--violet`, `--mint`, `--warning`, `--focus`, `--shadow` | Every palette (dark default, explicit light, system light fallback) overrides exactly these fourteen roles |
| Typography | `--font-sans`, `--display-number-size`, `--display-number-tracking` | Display numerals use explicit tracking and tabular figures so dense pairs such as `48%` and `88%` stay distinct |
| Status semantics | `--status-success`, `--status-warning`, `--status-accent` | Aliases onto mint, warning, and violet primitives; state colors cannot drift apart between components or themes |
| Chart semantics | `--chart-series-a`, `--chart-series-b`, `--chart-track` | Progress tracks and heatmap intensity reuse the same series roles that bar charts will consume |
| Spacing scale | `--space-3xs` through `--space-2xl` | Eight reviewed steps; values outside the scale remain deliberate exceptions |
| Radius scale | `--radius-cell` through `--radius-circle` | Component-role naming; pixel-era literals were converted to rem so every length tracks root scaling |
| Elevation | `--shadow`, `--glow-brand` | One ambient card shadow; the glow is reserved for the brand tile |
| Focus ring | `--focus-ring-width`, `--focus-ring-offset` | Keyboard visibility is an accessibility contract, not a styling detail |

Invariants:

- Component rules outside the token layer must not declare raw radii; every `border-radius` references a token or `inherit`.
- The three palettes declare identical color-role sets. A role missing from one theme would silently fall back to another theme's value.
- Statuses and charts alias primitives rather than redefining hex values.

Failure behavior: violations fail the renderer unit suite (`src/renderer/design-tokens.test.ts`), which locks required groups, exact alias wiring, palette parity, radius and color-literal discipline, the programmatic WCAG contrast audit, the absence of any remote reference, and the literal `--mint: #54e5c1;` development smoke-test replacement contract used by `tests/development/development-renderer.spec.ts`.

## 2. Themes

Three modes exist and are driven by the validated preferences document:

- Dark is the authored default palette on `:root`.
- Light applies through `[data-theme='light']`, set by the settings route from persisted preferences.
- System follows `prefers-color-scheme: light` through a duplicated media-query block for users without an explicit preference.

The duplication between the explicit light theme and the system fallback is deliberate CSS: an attribute selector cannot share declarations with a media query without preprocessors. The token-contract test enforces byte-identical synchronization instead of hoping two hand-maintained lists agree.

### Contrast audit

The audit computes WCAG 2 relative-luminance contrast for every functional pair from the authored palettes, and the same computation runs as a unit test so future value revisions cannot silently regress:

- Text roles (`--text`, `--muted`, `--muted-strong`, `--violet`, `--mint`, `--warning`) require at least 4.5:1 against all four surfaces in every theme. Small accent labels such as the eyebrow (0.72rem) and provenance pills render through these roles, so they are text, not decoration.
- The focus indicator requires at least 3:1 against all four surfaces.

The audit's one remediation: light-theme mint was revised from `#0a9f7e` (3.1–3.4:1, below the 4.5:1 text requirement) to `#087c68` (at least 4.77:1 on every light surface). The dark palette already passed everywhere; its worst pair is muted-on-surface-raised at 6.7:1. After the revision, the tightest remaining pair is light muted-on-background at 5.06:1.

### Theme-aware status tints

Translucent tints behind warnings, provenance pills, banners, state icons, connection halos, the privacy note, and the primary-card glow are computed with `color-mix()` from status roles and palette primitives instead of fixed rgba literals, so each theme derives its tints from its own colors. A component-discipline test strips the three palette layers and fails if any raw hex literal or rgb/rgba function appears in a component rule.

## 3. Typography stack and license decision

The renderer uses a locally resolved family stack declared once in `--font-sans`: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`.

Decision and rationale:

- **No font file is bundled and none is fetched.** The application never loads remote assets, and the CSP forbids them. If the user happens to have Inter installed, the UI improves; otherwise a native system font renders the interface. Either way there is no network request, no bundling obligation, and therefore **no font license obligation** attached to this project.
- Bundling a typeface later would be a new dependency decision subject to the [addition rule](dependency-rationale.md): written purpose, alternatives check, maintenance review, license review (an SIL Open Font License release would be the minimum acceptable posture), install-script review, bundle-size effect, and tests. Nothing in v1 requires it.
- Numeric presentation relies on `font-variant-numeric: tabular-nums` and reviewed tracking rather than a purchased or specialized numeric face.

## 4. Icons and glyphs

Token Trail deliberately ships **no icon library, icon font, or symbol sprite**:

- Interface glyphs (`◉`, `○`, `◇`, the explanation `i`) are Unicode text styled by CSS and hidden from assistive technology where decorative, so screen readers announce meaning carried by adjacent text instead of glyph names.
- The brand mark is project-owned original artwork: [`assets/branding/tokentrail-icon.svg`](../../assets/branding/tokentrail-icon.svg) is the single vector master, reconstructed faithfully from the approved historical raster `tokentrail-icon-v2-dark.png` (under one percent pixel difference beyond an eight percent tolerance at 512×512, concentrated in anti-aliased edges; side-by-side 48-pixel renders reviewed during fitting).
- Required rasters (16–512 px) are generated deterministically into `assets/branding/exports/` by `npm run export:branding` ([`scripts/export-brand-rasters.mjs`](../../scripts/export-brand-rasters.mjs)) using the system `rsvg-convert` binary. librsvg is a maintainer-invoked build-time tool, deliberately not an npm dependency; the exported PNG files are plain data assets with no third-party licensing claim. All branding files carry the repository's GPL-3.0-only license.

Canonical asset wiring:

| Consumer | Asset |
| --- | --- |
| Renderer brand tile (44 CSS px, 2× density) | `exports/tokentrail-icon-88.png` |
| Runtime window icon (`createMainWindow`, packaged archive) | `exports/tokentrail-icon-256.png` |
| electron-builder Linux installer metadata | `exports/tokentrail-icon-512.png` |

Historical approved art stays untouched as provenance for versioned test-report screenshots and is never referenced by runtime code.

Security boundary: the SVG master must never reference remote resources, scripts, or animations. It is inert static markup parsed by librsvg and Chromium image decoders only; it is never fetched over the network because it ships inside the application.

### Responsive and zoom behavior

The shell supports compact widths, laptop sizes, large screens, and window zoom through two breakpoints (52rem collapses the navigation rail into a top row; 34rem stacks header controls) plus fluid clamps on display text. `tests/e2e/responsive.spec.ts` sweeps the enforced minimum window through large desktop sizes at 100/150/200 percent zoom — including the minimum window at 200 percent, which lays out near 360 CSS pixels — asserting no horizontal document overflow, visible unclipped navigation, a usable refresh control, and an unclipped page heading. The initial sweep found no layout defects; the suite now guards that result.

### Chart legibility

The Usage route's daily bar chart consumes the design tokens instead of ECharts defaults:

- The series fill reuses `--chart-series-b`, the same data hue as progress tracks and heatmap cells, so one measurement speaks one visual language across the product.
- Axis labels, axis lines, grid lines, and tooltip surfaces resolve from muted, border, surface, and text tokens, keeping the chart legible in dark, light, and live-switching system themes (including OS scheme flips while the "system" preference is active).
- Animation is disabled outright: a dashboard refresh never replays decorative motion, which serves reduced motion and idle-CPU budgets simultaneously.
- Color independence holds by construction: a single series means hue never separates categories; every bar is identified by its axis label; exact values live in the tooltip and in the equivalent accessible table view rendered from the same normalized source. Heatmap intensity adds a legend distinguishing positive, reported-zero, and missing states.
- `src/renderer/routes/daily-chart.test.ts` locks palette wiring, disabled animation, day-to-category mapping, reported-zero behavior, and safe-integer clamping as pure-function contracts.

## 5. Motion

The idle-CPU and reduced-motion review is complete. Findings:

- The stylesheet declares exactly one animation: the loading spinner's bounded rotation, which is functional feedback while a refresh is in flight rather than decoration. It unmounts with the loading state, so it never runs at idle.
- Under `prefers-reduced-motion: reduce` the spinner stops entirely and a static two-tone ring communicates loading; under an explicit reduced preference the renderer applies near-zero duration overrides even when the system allows motion, and the media-query kill switch also covers the system and full classes.
- No CSS transition shorthand exists anywhere in the stylesheet.
- ECharts animation is disabled outright (section 4), so snapshot refreshes never replay entrance motion.
- The only script-driven timer in renderer code is a 30-second clock sample backing countdown freshness; it is cleared on unmount and costs one small state update per interval.

A four-case motion contract in `src/renderer/design-tokens.test.ts` locks these findings: exactly one animation declaration plus its reduced-motion `none`, both neutralization mechanisms, and zero transition shorthands. Any future animation must join that contract deliberately with its own reduced-motion story and idle-CPU justification.

## 6. Test evidence

- Unit: `src/renderer/design-tokens.test.ts` — token groups, alias wiring, palette parity, radius and color-literal discipline, the programmatic WCAG contrast audit, offline-only references, and the development smoke contract.
- End-to-end: `tests/e2e/typography.spec.ts` — display-numeral geometry across the theme, zoom, and width matrix; `tests/e2e/window-identity.spec.ts` — runtime icon resolution from the canonical export; `tests/e2e/preferences.spec.ts` — live theme switching and persistence.
- Development: `tests/development/development-renderer.spec.ts` — proves live theming by replacing the literal `--mint` declaration and observing computed style changes.
- Packaged: `tests/packaged/foundation-packaged.spec.ts` — proves the window icon asset ships inside the ASAR archive.

Final theme verification screenshots across the full matrix remain part of the Phase 4 exit evidence and will be attached to the versioned test report when captured.

## 7. Known limitations

- Curated theme-matrix screenshots for the versioned test report are captured at phase close; automated suites already exercise both themes continuously.

When any item above lands, this document and its controlling tests change in the same commit, per the architecture-maintenance rule.
