# Accessibility Architecture

**Status:** Implemented Phase 3 scope; Phase 4 keyboard and layout evidence recorded, screen-reader/axe-core campaigns in progress
**Last updated:** August 21, 2026

This document explains the implemented semantic, keyboard, focus, announcement, chart/table, zoom, theme, and reduced-motion contracts. The product specification (sections 8 and 10) controls required behavior; Phase 4 adds the full manual screen-reader campaign and axe-core review evidence.

## Semantic structure

- One `main` landmark contains the active route; one navigation landmark holds the six destinations with `aria-current="page"` on the active link.
- Each route exposes exactly one level-one heading; section headings follow hierarchical order (`h2` sections, `h3` entries).
- Data uses semantic elements: description lists for metric grids, ordered lists for timeline/attention order, real tables with caption, scoped column headers, and row headers for the usage table.
- Status regions announce connection state changes (`role="status"`); the stale banner is an alert (`role="alert"`) so a failed refresh is announced without stealing focus.
- Progress bars expose `aria-valuemin/max/now` plus `aria-valuetext` carrying the exact reported percentage, so the accessible value never depends on bar geometry.

## Keyboard behavior

- All primary workflows are operable by keyboard: fragment-link navigation, radio groups, number input, buttons, and the chart/table toggle are native or button elements with visible focus.
- The scrollable table region is focusable (`tabindex="0"`) with an accessible name so keyboard users can reach scrolled content.
- Focus indicators use a 3-pixel high-contrast outline with offset on every interactive element.

## Charts, tables, and text alternatives

- The ECharts bar chart container carries `role="img"` with a label stating what it shows and pointing to the table view as the equivalent.
- The chart/table toggle presents the same daily values in both forms; the table additionally marks reported zeros explicitly ("0 (reported zero)") so they cannot be confused with missing dates.
- Heatmap cells pair visual states with visually-hidden per-cell text: "missing date, activity unknown", "reported zero", or the exact token count. Color never carries meaning alone: zero cells are dashed outlines, positive cells fill, missing cells stay hollow and dimmed.

## Numeric presentation

- Large primary percentages use the dedicated `.display-number` token: explicit letter spacing so dense glyph pairs such as 48% and 88% remain distinct, tabular numerals for stable reading, and nowrap at supported widths so 100% never clips.
- Counters render through exact bigint formatting with thousands separators; compact card values carry exact values in adjacent small text.

## Theme, contrast, and motion

- Three theme states (system/light/dark) apply a document-root attribute consumed by reviewed palettes; system mode follows the packaged media-query defaults.
- Motion respects three states: system follows the OS reduced-motion media query, reduced forces minimal animation regardless of OS, full allows packaged defaults. No looping ambient animation exists on dashboard screens.
- Warning and reached states pair color with text pills ("Limit reached", "Reached state reported") and icons, satisfying color-independence.

## Announcements

- Refresh feedback updates the visible button label immediately ("Refreshing…") inside the existing status region rather than adding noisy live regions.
- Session-change and capacity panels are static text sections read as normal document flow; countdowns do not create repeated announcements because they re-render text only on user-visible refreshes or the bounded clock tick.

## Zoom and reflow

- Layout grids collapse responsively; the accessibility suite verifies no horizontal overflow at 200 percent zoom (reflow test in `tests/accessibility/foundation-accessibility.spec.ts`).
- Minimum supported width keeps core actions reachable without clipping.

## Security interaction

- Accessibility markup renders only schema-validated normalized strings through React text nodes; protocol-derived labels remain inert text regardless of content (verified by e2e markup-injection tests).

## Test evidence

- `tests/accessibility/foundation-accessibility.spec.ts`: landmark structure, unique level-one heading, 200 percent zoom reflow.
- `routes.test.tsx`: role-based queries throughout (searchbox, radios, regions, pressed toggles) exercise the accessible tree continuously.
- `tests/e2e/overview.spec.ts`: state headings and banners verified through accessible roles.
- `tests/e2e/responsive.spec.ts` (Phase 4): core actions stay visible and unclipped across the width and zoom matrix, including the minimum window at 200 percent zoom.
- `tests/e2e/keyboard-workflows.spec.ts` (Phase 4): every primary workflow — skip link, refresh, Usage chart/table toggle, focusable scroll regions, theme and motion preference changes via arrow keys, automatic-refresh toggle plus numeric interval, diagnostics preview build, and the two-step clear-data confirmation including its Cancel escape — completes through raw keyboard events alone on the built application.
- Phase 4 keyboard additions: a first-in-document "Skip to content" link that moves focus into the main landmark without rewriting the hash (protecting deep links), covered in `routes.test.tsx`; focus remains visibly outlined through the reviewed focus-ring tokens.
- Clear-data adoption fix (Phase 4): confirming the dialog now applies returned defaults immediately, so the visible interface matches the promised reset instead of waiting for a restart.

## Known limitations

- Route changes do not yet programmatically move focus to the new route heading; landmark navigation currently covers this. Focus management lands with the remaining Phase 4 keyboard campaign work.
- Manual screen-reader verification (Orca), high-contrast observation, and axe-core automated review are scheduled Phase 4 evidence and have not been recorded yet.
- Live-region announcements for background snapshot pushes are not yet distinguished from user-triggered refreshes.
