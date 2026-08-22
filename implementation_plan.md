# Token Trail Implementation Plan

**Status:** Approved plan; Phases 1 through 4 complete at the machine-verifiable level with recorded evidence — Phase 4's automated scope closed at commit `21327f2` with the versioned `tests/test_reports/0.4.0/test_report.md` record (`preview-only`), and formal Phase 4 closure remains gated on the operator-held Orca screen-reader session plus environment-bound desktop matrices
**Controlling specification:** [product_spec_electron.md](product_spec_electron.md)
**Current phase:** Phase 5 opened August 21, 2026 with section 9.2 complete: all four Linux package formats configured and contract-tested, x64 and arm64 artifacts assembled locally for AppImage, deb, and Pacman (rpm assembly awaits the host `rpmbuild` tool), AppStream metadata shipping in native packages, a packaged-contents inspection gate, and the desktop-entry identity fix (`StartupWMClass=tokentrail`); sections 9.3 through 9.7 remain open
**Target completion:** Public-ready Linux v1.0.0 after Phase 6
**Last updated:** August 21, 2026

This plan turns the approved Electron product specification into an executable six-phase delivery sequence. It tracks how Token Trail moves from an empty application repository to a tested Linux v1.0.0 release. The product specification controls behavior, security, privacy, and acceptance requirements. This plan controls sequencing, evidence, and completion tracking. If the two documents conflict, implementation stops until they are reconciled.

## Contents

- [1. Completion definition](#1-completion-definition)
- [2. Scope and authority](#2-scope-and-authority)
- [3. Working rules](#3-working-rules)
- [4. Six-phase roadmap](#4-six-phase-roadmap)
- [5. Phase 1 - Foundation](#5-phase-1---foundation)
- [6. Phase 2 - Core read-only slice](#6-phase-2---core-read-only-slice)
- [7. Phase 3 - Complete v1 product](#7-phase-3---complete-v1-product)
- [8. Phase 4 - Product quality](#8-phase-4---product-quality)
- [9. Phase 5 - Packaging and release engineering](#9-phase-5---packaging-and-release-engineering)
- [10. Phase 6 - Release validation and publication](#10-phase-6---release-validation-and-publication)
- [11. Cross-phase quality gates](#11-cross-phase-quality-gates)
- [12. Test-report system](#12-test-report-system)
- [13. Documentation deliverables](#13-documentation-deliverables)
- [14. Open-question resolution schedule](#14-open-question-resolution-schedule)
- [15. Risks and stop conditions](#15-risks-and-stop-conditions)
- [16. Post-v1 follow-up tracker](#16-post-v1-follow-up-tracker)
- [17. Final v1 handoff checklist](#17-final-v1-handoff-checklist)
- [18. Plan maintenance](#18-plan-maintenance)

## 1. Completion definition

The approved v1 project scope is complete only when all six phases have passed their exit criteria and the following conditions are true:

- Every v1-required feature in section 4.2 of the product specification is implemented or is explicitly returned for a new scope decision.
- Every acceptance criterion in section 25 has evidence, including product correctness, security, privacy, accessibility, Linux compatibility, and performance.
- The application reads only the approved Codex account, rate-limit, rate-limit-update, and aggregate-usage data.
- The renderer remains sandboxed, isolated from Node.js and Electron privileges, and limited to narrow validated preload methods.
- AppImage, deb, rpm, and Pacman artifacts are built for each architecture that has passed the required verification. Unsupported or preview-quality combinations are labeled honestly.
- Installation, upgrade, checksum verification, troubleshooting, and uninstall instructions are complete.
- The release workflow produces immutable draft GitHub Releases from approved version tags, and ordinary branch pushes cannot publish an application update.
- `tests/test_reports/1.0.0/test_report.md` contains the full evidence record and a `ready` recommendation.
- Known limitations and incomplete environment coverage are visible in the test report and release notes.
- The user separately approves publication, then the reviewed v1.0.0 draft is published without replacing its tag or assets afterward.

Project completion at v1.0.0 does not include the post-v1 tracker in section 16. Maintenance and separately approved follow-up features continue as new work after the approved v1 scope is complete.

## 2. Scope and authority

### 2.1 Authorized now

- Phase 1 through Phase 5 implementation within the approved read-only specification.
- Dependency research, selection, installation, locking, auditing, and license review.
- Local development, tests, fixtures, packaging experiments, and CI workflow implementation.
- Creation of draft artifacts and prerelease candidates that are not publicly published.
- Documentation and versioned test-report generation.

### 2.2 Still gated

- Publishing a GitHub Release or presenting an artifact as stable.
- Signing with a real release identity or adding signing secrets.
- Enabling automatic or user-initiated network update checks.
- Adding telemetry or remote logging.
- Reading prompts, responses, tasks, repositories, files, tool calls, or any other denied Codex data.
- Adding write operations, reset-credit redemption, account changes, or Codex task control.
- Persisting usage history or session deltas.
- Starting any post-v1 follow-up that changes privacy, security, lifecycle, platform, or network behavior.

Phase 6 may be prepared and fully validated without publication. Its final publication task requires explicit user approval after the release evidence is available.

## 3. Working rules

### 3.1 Small, reviewable increments

- Each commit has one coherent purpose and keeps the application buildable where practical.
- Security boundaries, protocol contracts, and data calculations are introduced with tests in the same change.
- No large feature is merged as an untested final block.
- Temporary prototypes are clearly labeled and removed or promoted deliberately.
- Meaningful commits update `commit_tracker.md` with facts, verification, risks, and follow-up work.

### 3.2 Teaching-style code

- Authored executable statements are explained directly or by a small adjacent comment block.
- Module comments identify responsibility, trust level, dependencies, side effects, and denied behavior.
- Public functions document inputs, outputs, errors, invariants, and security assumptions.
- Security, IPC, validation, redaction, precision, date, provenance, and platform logic receive detailed rationale.
- Comments explain intent and constraints instead of translating syntax into English.
- Generated files, lockfiles, snapshots, vendored code, and formats that do not support comments remain exempt and are identified from nearby authored documentation.
- A behavior change that leaves a stale comment is incomplete.

### 3.3 Dependency discipline

- Use the smallest dependency set that meets the approved stack.
- Select current supported versions at implementation time and record the exact selection reasoning.
- Commit the lockfile and use frozen installation in CI.
- Review package ownership, maintenance, license, install scripts, transitive size, advisories, and Electron compatibility.
- Avoid native modules unless a measured requirement justifies the packaging and security cost.
- Do not add a dependency to avoid a small, clearer local function.

### 3.4 Evidence before status

- A checklist item becomes complete only after its output exists and its verification passes.
- A test that was not run is `not run` or `skipped`, never `passed`.
- Environment limitations remain visible.
- Performance and compatibility claims name the tested environment.
- A phase cannot close with a hidden critical failure or an unexplained security exception.

## 4. Six-phase roadmap

| Phase | Outcome | Primary evidence | Exit state |
| --- | --- | --- | --- |
| 1. Foundation | Hardened Electron shell and validated project structure | Build, unit tests, security configuration tests, threat model, packaged-shell measurements | Safe base exists |
| 2. Core read-only slice | One complete Codex-to-Overview path with failure states | Fixtures, adapter and IPC tests, component tests, isolation tests | Architecture proven vertically |
| 3. Complete v1 product | All required screens, calculations, diagnostics, and preferences | Full feature tests and domain fixtures | Functional scope complete |
| 4. Product quality | Accessible, polished, resilient, and measured Linux experience | Accessibility, performance, lifecycle, and desktop evidence | Product-quality scope complete |
| 5. Packaging and release engineering | Reproducible installers, CI, release drafts, and user documentation | Package smoke tests, checksums, SBOM, CI run, draft prerelease | Release system ready |
| 6. Release validation and publication | Fully tested v1.0.0 candidate and approved public release | Complete matrix, soak results, `tests/test_reports/1.0.0/test_report.md`, immutable release | Approved v1 scope complete |

Phases are sequential at the approval level. Work inside a phase may run in parallel only when its inputs are stable and the work does not bypass an earlier security or contract decision.

## 5. Phase 1 - Foundation

### 5.1 Objective

Create a minimal, measurable, hardened Electron application foundation. This phase proves that the selected stack can build, package, launch, and enforce the intended trust boundaries before product features create complexity.

### 5.2 Repository and tooling

- [x] Create the Node.js package manifest and select an explicit package-manager version.
- [x] Select and pin supported versions of Electron, TypeScript, React, Vite, electron-builder, Vitest, React Testing Library, Playwright, and Zod needed by the foundation; defer axe-core, TanStack Query, React Aria Components, and ECharts until their feature phases.
- [x] Record dependency selection reasoning and licenses.
- [x] Create strict TypeScript configurations for shared, main, preload, renderer, tests, and build tooling.
- [x] Create separate Vite builds for main, preload, and renderer without an experimental Electron-specific Vite abstraction.
- [x] Add formatting, linting, type-checking, unit-test, integration-test, security-test, packaging, packaged-smoke, and performance command entry points.
- [x] Add `.gitignore`, editor-neutral formatting rules, and deterministic line endings.
- [x] Ensure verification commands do not modify tracked files; keep the explicit `format` command maintainer-initiated.

### 5.3 Secure process foundation

- [x] Create small main, preload, renderer, and shared entry points.
- [x] Create one BrowserWindow with renderer sandboxing, context isolation, and Node integration disabled.
- [x] Load only packaged local content through the approved application scheme.
- [x] Define the initial restrictive Content Security Policy.
- [x] Deny unapproved navigation, popup creation, permissions, downloads, webviews, iframes, and remote content.
- [x] Define the preload API as an empty frozen surface until a reviewed domain method is introduced.
- [x] Configure Electron fuses and ASAR loading posture for development and packaged verification.
- [x] Enforce single-instance behavior and safe shutdown structure.
- [x] Establish typed error categories that do not expose raw exceptions to the renderer.

### 5.4 Protocol and data-boundary research

- [x] Confirm the currently installed Codex app-server command, transport options, method names, and generated bindings.
- [x] Inventory only the approved v1 fields and mark each as reported, observed, calculated, or unavailable.
- [x] Select an owned stdio child process as the initial Codex connection lifecycle and document why daemon fallback is deferred.
- [x] Create the deny-by-default request and notification method allowlists in one privileged module.
- [x] Define runtime size, nesting, string, array, number, decimal, and timeout limits before accepting protocol data.
- [x] Define bounded decimal-string to `bigint` handling for values beyond JavaScript safe integer precision.
- [x] Record capability and version-mismatch behavior.

### 5.5 Threat and privacy design

- [x] Create a data-flow diagram covering renderer, preload, main, adapter, Codex app-server, settings, diagnostics, and future update checks.
- [x] Create a threat model covering malicious renderer content, IPC misuse, protocol injection, path traversal, subprocess ownership, dependency compromise, diagnostic leakage, and release compromise.
- [x] Create a data inventory naming source, purpose, trust boundary, in-memory lifetime, persistence, renderer exposure, and diagnostic treatment.
- [x] Define the allowlist-based diagnostic schema and recursive canary-test strategy.
- [x] Confirm that usage snapshots and session deltas have no persistence path.

### 5.6 Test foundation

- [x] Configure unit, fixture, integration, component, Electron end-to-end, security, accessibility, performance, and packaged-smoke test locations.
- [x] Add tests that confirm the renderer has no `require`, raw `process`, Electron object, filesystem access, environment access, or generic IPC.
- [x] Add navigation, popup, permission, custom-scheme, and CSP tests.
- [x] Add a minimal fixture app-server harness without real account data.
- [x] Establish V8 coverage reporting as evidence alongside behavior tests.
- [x] Establish the versioned test-report structure through `tests/test_reports/0.1.0/test_report.md` and require phase screenshots.

### 5.7 Minimal shell and measurement

- [x] Render a local branded shell with a visible development status and no fabricated usage values.
- [x] Verify light, dark, and system theme plumbing at the shell level.
- [x] Produce a development package and launch it outside the Vite development server.
- [x] Measure cold launch, warm launch, idle CPU, idle memory, and initial bundle size on the available KDE Wayland environment; record GNOME as unavailable.
- [x] Record unavailable GNOME, X11, arm64, clean-distribution, and installer evidence in the Phase 1 test report.

### 5.8 Phase 1 deliverables

- Project manifest, lockfile, build configuration, lint and test configuration.
- Hardened main, preload, renderer, and shared source skeleton.
- Threat model, data-flow review, data inventory, and dependency rationale.
- Initial test suites and fixture server harness.
- Minimal packaged shell and baseline measurements.
- Updated README development instructions and commit tracker.

### 5.9 Phase 1 exit criteria

- [x] Frozen installation, formatting check, lint, type check, unit tests, fixture integration, and security foundation tests pass.
- [x] The development and packaged shells launch without remote content.
- [x] The renderer cannot access privileged Electron or Node capabilities.
- [x] Unexpected navigation, windows, permissions, and downloads are blocked.
- [x] The Codex allowlist contains no mutation, task, prompt, repository, or filesystem method.
- [x] Threat, data-flow, dependency, and baseline performance evidence is reviewable.
- [x] No unresolved critical security finding remains; the open provisional memory miss remains Phase 4 performance work.

## 6. Phase 2 - Core read-only slice

### 6.1 Objective

Prove one complete vertical path from approved Codex data to an accessible Overview without weakening process isolation or passing raw protocol data into the renderer.

### 6.2 Product identity correction

- [x] Change every user-visible application label from `TokenTrail` to `Token Trail`, including the logo, renderer, HTML title, window title, status copy, and accessibility names.
- [x] Set electron-builder's user-facing product name and Linux desktop metadata to `Token Trail`.
- [x] Keep the repository, npm package name, executable slug, custom protocol, filesystem-safe artifact stem, and application identifiers machine-safe as `tokentrail` where required.
- [x] Permit conventional `TokenTrail` spelling only inside source identifiers such as TypeScript types; never render those identifiers as product copy.
- [x] Update component, Electron, accessibility, packaged-app, and metadata tests to assert the spaced product name.
- [x] Rebuild the package and replace Phase 2 screenshot evidence after visually confirming `Token Trail` appears everywhere visible.

### 6.3 Development renderer parity and CSP

- [x] Reproduce the unstyled `npm run dev` shell and identify the exact renderer-console CSP violation before changing policy or Vite behavior; the user screenshot remains the original visual defect record.
- [x] Document the root cause: Vite's development CSS transform injects an inline `<style>`, while the shared `style-src 'self'` policy rejected it.
- [x] Separate development CSP construction from the packaged production policy instead of weakening one shared policy for both environments.
- [x] Evaluate self-hosting and nonce propagation, then document why reliable Vite HMR requires the narrowly scoped development-only inline-style exception.
- [x] Limit the development exception to the exact validated `http://127.0.0.1:5173` origin and keep it unreachable from packaged content.
- [x] Keep production `script-src 'self'` and `style-src 'self'` unchanged, with no `unsafe-inline`, `unsafe-eval`, remote style, remote script, or wildcard source.
- [x] Verify initial CSS loading and CSS hot updates through the real development orchestration.
- [x] Add a development-mode smoke test that fails when representative computed styles fall back to browser defaults.
- [x] Add policy tests proving the packaged CSP remains strict and any development difference is explicit and minimal.
- [x] Capture and visually compare development and packaged screenshots; embed the reviewed Phase 2 evidence in the versioned test report.

### 6.4 Codex adapter

- [x] Implement owned-process discovery and lifecycle behavior selected in Phase 1.
- [x] Implement request IDs, bounded timeouts, cancellation, backoff, restart limits, and safe shutdown.
- [x] Validate initialization and capability results before enabling reads.
- [x] Implement only the approved account and rate-limit reads plus rate-limit update handling needed by the slice; retain aggregate usage as an unused Phase 3 allowlist entry.
- [x] Reject unknown method requests before transport.
- [x] Validate all inbound payloads with Zod and size guards.
- [x] Convert valid protocol data into normalized domain objects with field-level provenance.
- [x] Preserve missing, null, invalid, unknown, and unsupported states instead of converting them to zero.
- [x] Redact errors before they leave the privileged boundary.

### 6.5 IPC and preload contract

- [x] Define narrow request and event contracts in shared code.
- [x] Validate sender frame, exact origin, no-argument calls, response, and subscription lifecycle.
- [x] Expose only purpose-specific frozen preload methods.
- [x] Keep raw IPC channel names, Electron objects, protocol method names, subprocess details, and raw JSON out of the renderer.
- [x] Prevent duplicate listeners and guarantee unsubscribe behavior.
- [x] Deduplicate renderer refresh calls; the bridge accepts no payload whose size could create pressure.

### 6.6 Snapshot and refresh model

- [x] Create one in-memory normalized snapshot store.
- [x] Distinguish never loaded, loading, fresh, stale, partial, unsupported, signed out, unavailable, and failed states.
- [x] Keep the previous valid snapshot visible during a transient refresh failure.
- [x] Implement manual refresh with immediate feedback and bounded concurrency.
- [x] Leave automatic refresh disabled pending evidence.
- [x] Treat a valid sparse update as a full-read trigger so unrelated valid data cannot be silently deleted.

### 6.7 Overview slice

- [x] Implement first-run connection guidance and connection status.
- [x] Implement the Overview shell and normalized quota presentation.
- [x] Show used percentage, calculated remaining percentage, reset timestamp, countdown, provenance, and freshness when valid.
- [x] Implement loading, partial, stale, signed-out, unsupported, unavailable, and error states.
- [x] Explain that tokens and quota percentages are different measurements.
- [x] Provide keyboard access, semantic headings, accessible names, and text alternatives.
- [x] Use fixture data only in tests and explicit development fixtures, never as an unexplained production fallback.

### 6.8 Phase 2 verification

- [x] Run full, missing-account, single-bucket, multiple-bucket, null-field, unknown-field, malformed, oversized, method-not-found, app-server-exit, and timeout fixtures.
- [x] Attempt a deliberately widened denied method before transport and prove the renderer has no generic IPC path.
- [x] Attempt markup injection in the displayed protocol-derived quota name and strip unknown protocol fields.
- [x] Attempt unexpected-frame, malformed URL, alternate-port, lookalike-host, and wrong-path IPC authorization.
- [x] Verify refresh cancellation, timeout, deduplication, backoff, restart budget, recovery, and shutdown behavior.
- [x] Complete component and end-to-end tests for every Overview state.
- [x] Repeat renderer-isolation, popup, and navigation tests in a packaged build.
- [x] Verify visible copy, accessibility names, window metadata, desktop metadata, and Phase 2 screenshots consistently use `Token Trail`.
- [x] Verify the real development shell and packaged shell both load intended CSS while packaged CSP rejects inline styles.

### 6.9 Phase 2 deliverables

- Validated Codex adapter and normalized snapshot contracts.
- Narrow preload API and authenticated IPC handlers.
- Fixture-backed onboarding, connection, refresh, and Overview experience.
- Vertical-slice tests and security evidence.
- Updated protocol inventory, threat model, and compatibility notes.
- Correct `Token Trail` product naming across the tested application and package metadata.
- Documented development CSP design plus matching styled development and packaged screenshot evidence.

### 6.10 Phase 2 exit criteria

- [x] A fixture app-server can drive every specified Overview state end to end.
- [x] A compatible real local Codex app-server can be detected and read without exposing authentication material.
- [x] All denied calls fail before reaching transport or have no callable renderer surface.
- [x] Raw protocol objects and raw errors cannot reach the renderer.
- [x] Renderer isolation still passes in development and packaged builds.
- [x] Every visible value identifies its provenance or unavailable reason.
- [x] No user-visible label incorrectly displays `TokenTrail` or the `tokentrail` repository slug.
- [x] `npm run dev` renders the reviewed interface styling, supports a CSS edit without restart, and cannot weaken the packaged CSP.
- [x] No Phase 2 critical or high-severity defect remains open.

## 7. Phase 3 - Complete v1 product

### 7.1 Objective

Implement every required v1 screen, domain calculation, preference, and diagnostic workflow using the proven Phase 2 boundaries.

### 7.2 Shared domain model

- [x] Complete account, quota bucket, quota window, usage, credit, reset-credit, coverage, diagnostics, preferences, and provenance contracts.
- [x] Implement exact precision-safe arithmetic and formatting.
- [x] Implement deterministic primary-window selection and explain the selection.
- [x] Implement reset timeline ordering.
- [x] Implement quota attention ordering without forecasting or invented severity.
- [x] Implement in-memory session baselines, reset transitions, counter decreases, and process-lifetime clearing.
- [x] Implement complete-period 7-day and 30-day comparisons with strict date coverage.
- [x] Implement calendar heatmap states that distinguish positive, reported zero, and missing dates.
- [x] Implement total, daily average, active-day average, median, highest supplied day, and active-day count.
- [x] Implement coverage reporting and calculation availability reasons.
- [x] Implement reset-credit expiry ordering and the exact seven-day display rule.
- [x] Implement combined-capacity clauses without cross-unit arithmetic or a synthetic score.

### 7.3 Product routes

- [x] Complete Overview with all reported buckets and approved derived summaries.
- [x] Build Quota Windows with grouping, sorting, raw-safe detail, provenance, timeline, attention ordering, and session change.
- [x] Build Usage with date-range controls, chart, calendar heatmap, accessible table, summaries, statistics, comparisons, and coverage.
- [x] Build Credits with balance, unlimited state, spending limits, reached state, reset credits, expiry, and read-only explanations.
- [x] Build Learn with quota, token, credit, provenance, privacy, statistics, and completeness explanations.
- [x] Build Settings and Diagnostics with themes, refresh choices, redacted preview, export, clear-data confirmation, and support information.
- [x] Add contextual navigation from metrics and errors to the relevant explanation or corrective action.

### 7.4 Phase 3 identity and metric readability corrections

- [x] Set the main `BrowserWindow` icon explicitly to a Token Trail icon so development launches do not display Electron's default lightning-bolt icon in the title bar, task switcher, dock, or desktop shell.
- [x] Resolve the icon from an application-owned path that works in development, built-content tests, and packaged execution without reading the launch directory.
- [x] Keep electron-builder and Linux desktop metadata pointed at the same Token Trail identity while preserving the machine-safe executable name `tokentrail`.
- [x] Test the runtime window icon independently from package metadata because a correct installer icon does not prove the live development window uses it.
- [x] Capture window-chrome or desktop-shell evidence where the available compositor exposes the icon; record environments where automated capture cannot include native chrome.
- [x] Improve large-percentage typography so adjacent digits and the percent sign remain visually distinct, especially for dense shapes such as `48%` and `88%`.
- [x] Use explicit numeric typography tokens, tabular numerals where suitable, and reviewed letter spacing rather than relying on the font's default display-size kerning.
- [x] Test representative values `11%`, `47%`, `48%`, `88%`, and `100%` in light and dark themes, at normal scaling and 200 percent zoom, and at the narrowest supported Overview width.
- [x] Add visual-regression or screenshot evidence that detects merged, clipped, overlapping, or ambiguous primary metric glyphs.

### 7.5 State and preference behavior

- [x] Use TanStack Query only for bounded asynchronous state where it improves freshness and retry clarity.
- [x] Keep sensitive or usage-derived values out of persisted preferences.
- [x] Validate every preference before storage and after loading.
- [x] Quarantine corrupt preference data and explain reset behavior.
- [x] Keep session observations only in memory and clear them on exit.
- [x] Handle local timezone changes without corrupting source timestamps or comparisons.

### 7.6 Diagnostics

- [x] Construct diagnostic output from an explicit safe schema.
- [x] Provide a complete preview before export.
- [x] Exclude email, IDs, paths, prompts, responses, raw protocol data, environment variables, session baselines, and unknown fields.
- [x] Seed canaries for every sensitive class and fail tests if any canary appears.
- [x] Use a user-selected export destination and safe file-writing behavior.
- [x] Record only sanitized local health categories needed for troubleshooting.

### 7.7 Architecture documentation expansion

- [x] Maintain `docs/architecture/README.md` as the entry point, current-system map, document ownership table, and recommended reading order.
- [x] Keep separate detailed documents for the Electron process model, Codex adapter/lifecycle, normalization and data contracts, IPC/preload boundary, renderer state model, development-versus-production runtime, and testing architecture.
- [x] Create `docs/architecture/calculations-and-precision.md` with the implemented arithmetic, coverage, date, bigint/decimal, unavailable-state, and formula-test contracts.
- [x] Create `docs/architecture/preferences-and-storage.md` with the implemented schema, defaults, migrations, corruption behavior, persistence exclusions, and clear-data ownership.
- [x] Create `docs/architecture/diagnostics-and-redaction.md` with the implemented safe schema, canary strategy, preview/export flow, filesystem boundary, and prohibited fields.
- [x] Create `docs/architecture/navigation-and-route-composition.md` with the implemented route tree, data dependencies, loading boundaries, focus behavior, and contextual navigation.
- [x] Create `docs/architecture/accessibility-architecture.md` with the implemented semantic, keyboard, focus, announcement, chart/table, zoom, theme, and reduced-motion contracts.
- [x] Keep those five documents marked planned or implementation-in-progress until their corresponding Phase 3 systems and tests exist; never present intended behavior as current evidence.
- [x] Record packaging/release/update architecture in Phase 5 rather than describing unimplemented release behavior as current behavior.
- [x] Give each architecture document status, scope, invariants, failure behavior, security/privacy boundaries, test evidence, known limitations, and links to controlling decisions.
- [x] Update architecture documents in the same change as any material boundary or lifecycle modification; stale architecture text is a defect.
- [x] Include compact diagrams where process ownership, data transformation, event order, or failure recovery would otherwise be difficult to reconstruct.
- [x] Run local-link and terminology checks across the architecture set before Phase 3 closes.

### 7.8 Phase 3 verification

- [x] Run every required fixture listed in product-spec section 21.2.
- [x] Test every formula at boundary, missing, zero, duplicate, invalid, reset, and oversized cases.
- [x] Test all routes through keyboard-visible user behavior.
- [x] Confirm chart and table values match from the same normalized source.
- [x] Confirm no unavailable state becomes zero or an invented label.
- [x] Confirm clear-data removes only Token Trail-owned data.
- [x] Confirm diagnostics contain no seeded sensitive value.
- [x] Verify the native runtime window uses the Token Trail icon rather than Electron's default icon in every locally testable launch mode.
- [x] Review the primary percentage values `11%`, `47%`, `48%`, `88%`, and `100%` for readable glyph separation in the required theme, zoom, and width matrix.
- [x] Review the architecture index and linked topic documents against the implemented Phase 3 system; no current boundary may exist only in source code.

### 7.9 Phase 3 deliverables

- Complete required v1 route set.
- Complete normalized domain and calculation library.
- Validated preferences and redacted diagnostics.
- Full fixture catalog and behavior-focused automated tests.
- Updated Learn content and source/provenance explanations.
- Correct runtime window identity and readable large-number typography with visual evidence.
- Expanded, indexed architecture documentation covering the complete implemented system.

### 7.10 Phase 3 exit criteria

- [x] Every v1-required feature has a working implementation and automated coverage at the appropriate layer.
- [x] All product-correctness rules in section 25.1 pass against fixtures.
- [x] All diagnostics and privacy canary tests pass.
- [x] All routes support normal, loading, partial, stale, unavailable, and error behavior where applicable.
- [x] No feature reads or stores data beyond the approved inventory.
- [x] Optional background features have not entered scope without an explicit decision.
- [x] Development, built, and packaged windows use Token Trail identity wherever the tested desktop environment exposes it.
- [x] Primary metric numerals remain distinct and unclipped across the representative-value visual matrix.
- [x] The architecture index gives a new contributor a complete path through every implemented trust boundary, process, state model, and test layer.

## 8. Phase 4 - Product quality

### 8.1 Objective

Turn the functionally complete application into a coherent, accessible, resilient, and measured Linux desktop product.

### 8.2 Visual system and responsiveness

- [x] Finalize production vector logo and required raster exports.
- [x] Select and document production font and icon licenses.
- [x] Implement design tokens for color, spacing, type, radius, elevation, focus, chart, and status semantics.
- [x] Complete light, dark, and system themes without remote fonts or assets.
- [x] Support compact widths, typical laptop sizes, large screens, and zoom without clipped core actions.
- [x] Keep charts legible with color-independent patterns and equivalent tables.
- [x] Remove continuous or decorative animation that conflicts with reduced motion or idle CPU budgets.

### 8.3 Accessibility

- [x] Complete keyboard-only navigation for onboarding, routes, refresh, settings, diagnostics, dialogs, tables, and chart alternatives.
- [x] Provide visible focus and logical focus movement.
- [ ] Verify semantic landmarks, headings, names, descriptions, errors, live updates, and status announcements.
- [x] Run axe-core and review every serious result.
- [ ] Perform manual screen-reader testing on representative Linux environments.
- [x] Verify light and dark contrast, 200 percent zoom, high-contrast observation, and reduced motion.
- [x] Ensure countdowns and refresh updates do not create noisy repeated announcements.

### 8.4 Resilience and lifecycle

- [x] Test offline, signed-out, missing Codex, unsupported Codex, malformed response, slow response, process exit, and repeated restart behavior.
- [ ] Test suspend, resume, timezone change, display change, window close, reopen, and application shutdown.
- [x] Verify that child termination targets only a process owned by Token Trail.
- [x] Verify that listener, timer, query, and process counts remain bounded across repeated use.
- [x] Ensure one endpoint failure does not erase unrelated valid sections.

### 8.5 Performance

- [x] Measure cold and warm startup in packaged builds.
- [x] Measure idle CPU and resident memory after settling.
- [x] Measure Overview interaction feedback and chart updates.
- [x] Measure repeated refresh and window lifecycle for leaks.
- [x] Set and enforce a renderer bundle budget from Phase 1 and Phase 4 evidence.
- [x] Profile ECharts imports and render only visible routes.
- [x] Record approved budget revisions with evidence instead of silently weakening targets.

### 8.6 Linux behavior

- [x] Test KDE Plasma Wayland and available KDE X11 behavior.
- [ ] Test GNOME Wayland and representative Cinnamon or Xfce behavior.
- [ ] Test fractional scaling, multiple displays, system themes, window restoration, and desktop notifications only if later approved.
- [x] Avoid forbidden Wayland assumptions about focus or window positioning.
- [x] Verify application name, icon, WM class, and desktop identity in packaged prototypes.

### 8.7 Product-quality and compatibility documentation

- [ ] Create `docs/architecture/design-system-and-theming.md` from the implemented tokens, assets, typography, themes, responsive rules, motion, chart language, and license decisions.
- [ ] Create `docs/architecture/performance-and-resource-model.md` from measured startup, CPU, memory, bundle, chart, polling, and lifecycle budgets, including the profiling method and approved revisions.
- [ ] Create `docs/architecture/resilience-and-lifecycle.md` from implemented suspend/resume, timezone, display, window, Codex restart, retry, cleanup, and leak-prevention behavior.
- [ ] Create `docs/architecture/linux-desktop-integration.md` from tested Wayland/X11, KDE/GNOME, scaling, window identity, theme, desktop-entry, and compositor behavior.
- [x] Create `docs/support/compatibility-and-support-matrix.md` from actual distribution, architecture, desktop, display-server, package, and quality-level evidence.
- [ ] Expand `docs/architecture/accessibility-architecture.md` with actual automated and manual Phase 4 evidence instead of creating a duplicate accessibility document.
- [ ] Keep each file planned until its relevant implementation or test campaign begins; convert claims to implemented/tested only from recorded evidence.

### 8.8 Phase 4 deliverables

- Production visual assets and documented licenses.
- Accessibility review and remediation record.
- Performance measurements and enforced budgets.
- Linux desktop, lifecycle, and scaling evidence.
- Updated known limitations and support matrix draft.
- Implemented design-system, performance, resilience, Linux-integration, accessibility, and compatibility/support documentation.

### 8.9 Phase 4 exit criteria

- [x] Every primary workflow completes by keyboard.
- [x] No unreviewed serious automated accessibility violation remains.
- [ ] Manual screen-reader, zoom, contrast, and reduced-motion checks are recorded.
  - Partially satisfied: contrast, zoom, reduced-motion, and forced-colors observations are recorded through automated suites, but this criterion stays open because its manual screen-reader portion requires operator judgment and has not been performed yet.
- [x] Performance targets pass or have explicit evidence-based revisions.
- [x] Repeated refresh and lifecycle tests show no unbounded resource growth.
- [x] The UI is complete at supported widths and themes without remote assets.
- [x] Available KDE and GNOME packaged-shell checks pass.
  - KDE Plasma Wayland plus X11-through-XWayland packaged checks pass; no GNOME environment was available to test, recorded honestly in the support matrix rather than claimed.
- [x] Phase 4 architecture and support documents match the tested product-quality behavior and identify unavailable environments honestly.

## 9. Phase 5 - Packaging and release engineering

### 9.1 Objective

Create reproducible Linux packages, protected GitHub release automation, complete user installation documentation, and verifiable release artifacts.

### 9.2 electron-builder packaging

- [x] Enable ASAR with an explicit packaged-file allowlist.
- [x] Exclude development files and public production source maps.
- [x] Configure product name, executable, application ID, icons, desktop entry, categories, startup WM class, and AppStream metadata.
  - Verified inside built artifacts: `StartupWMClass=tokentrail` desktop entries (deb and AppImage payload), `tokentrail.desktop` file name via `syncDesktopName`, hicolor icons, and `/usr/share/metainfo/com.tokentrail.app.metainfo.xml` in deb and Pacman payloads. AppImage-embedded AppStream stays deferred because electron-builder 26 offers no per-target mapping for that format; recorded in decision 011 rather than shipped as a stray duplicate.
- [x] Configure AppImage, deb, rpm, and Pacman targets.
  - All four targets are configured and contract-tested; AppImage, deb, and Pacman artifacts were assembled locally on x64. rpm assembly reached fpm but requires the host `rpmbuild` tool (rpm-tools), which was not installed on the reference machine during this session; local rpm output and full install verification belong to section 9.6 and CI.
- [x] Declare format-specific dependencies and uninstall behavior.
  - Dependency sets remain owned by electron-builder's maintained per-format defaults and were verified in generated control files (deb `Depends`, Pacman `depend` list). No post-install or post-remove hooks are declared because v1 ships no tray, autostart, MIME daemon, or service; package removal takes only its own files and leaves user preferences untouched.
- [x] Build x64 and arm64 separately without relabeling architecture output.
  - Separate `--x64`/`--arm64` invocations produced correctly labeled artifacts for AppImage (`x86_64`/`arm64`), deb (`amd64`/`arm64`), and Pacman (`x86_64`/`aarch64`) using each format's native machine labels; rpm follows once the host tool above is available.
- [x] Use artifact names containing product, version, platform, architecture, and format.
  - Machine-safe template `${name}-${version}-${os}-${arch}.${ext}` verified as e.g. `tokentrail-0.5.0-linux-amd64.deb`.
- [x] Inspect unpacked and packaged contents for accidental secrets or unnecessary files.
  - New `npm run check:package-contents` gate parses the ASAR header listing, enforces an exact unpacked-entry allowlist plus Electron license presence, and scans the archive and every release artifact for credential-shaped markers. It passed after catching one real defect: its own initial allowlist omitted Electron's license artifacts, which it flagged before any release use.
- [x] Verify Electron fuses, ASAR integrity posture, and only-load-from-ASAR behavior.
  - Fuse flags are pinned by unit contract tests; runtime posture continues to be exercised by the packaged suites on both display-server backends.

### 9.3 GitHub Actions

- [ ] Add pull-request and branch CI for frozen install, formatting, lint, type check, unit, integration, component, security, and build checks.
- [ ] Add an immutable version-tag release workflow.
- [ ] Use standard GitHub-hosted runners and least-privilege permissions.
- [ ] Pin third-party Actions to reviewed commit SHAs.
- [ ] Prevent untrusted pull-request workflows from receiving release permissions or secrets.
- [ ] Build each architecture in a distinct job and preserve machine-readable provenance.
- [ ] Generate checksums, SBOM, release metadata, and signatures only when a signing plan is approved.
- [ ] Upload user-facing files to a draft GitHub Release rather than treating temporary Actions artifacts as distribution.
- [ ] Require the protected release environment and maintainer review before publication.
- [ ] Confirm that ordinary pushes cannot create or replace a published release.

### 9.4 Installation and support documentation

- [ ] Create `docs/user/getting-started.md` with Codex prerequisites, first launch, connection states, navigation, refresh behavior, provenance, and privacy expectations.
- [ ] Create `docs/user/installing.md` covering architecture selection and verified AppImage, deb, rpm, and Pacman installation paths.
- [ ] Create `docs/user/upgrading.md` covering manual v1 upgrades, version checks, settings compatibility, checksum verification, and downgrade limitations.
- [ ] Create `docs/user/troubleshooting.md` covering Codex detection, sign-in, compatibility, FUSE, package dependencies, desktop identity, unavailable metrics, and diagnostic export.
- [ ] Create `docs/user/uninstalling.md` covering each package format, Token Trail-owned files, retained user choices, and verification of removal.
- [ ] Create `docs/user/privacy.md` covering local reads, memory-only usage data, settings, diagnostics, network behavior, explicit exclusions, and clear-data behavior.
- [ ] Explain how to select x64 versus arm64.
- [ ] Document AppImage download, checksum verification, executable permission, launch, integration choices, FUSE issues, upgrade, and removal.
- [ ] Document deb download, checksum verification, installation, dependency resolution, upgrade, and uninstall.
- [ ] Document rpm download, checksum verification, installation, upgrade, and uninstall.
- [ ] Document Pacman package download, checksum verification, installation, upgrade, and uninstall.
- [ ] Document the difference between application packages and source archives automatically shown by GitHub.
- [ ] Document supported and preview-quality distributions, desktops, architectures, and display servers.
- [ ] Document Codex prerequisites, signed-out behavior, diagnostics export, and safe troubleshooting.
- [ ] Document manual update behavior and clearly state that v1 does not silently install updates.
- [ ] Add release-note structure for highlights, security, fixes, known limitations, installation links, checksums, and upgrade notes.

### 9.5 Packaging, release, and upgrade architecture documentation

- [ ] Create `docs/architecture/packaging-architecture.md` alongside implemented electron-builder targets, covering inputs, ASAR/fuses, artifact naming, architecture separation, metadata, icons, dependencies, and package verification.
- [ ] Create `docs/architecture/github-release-pipeline.md` alongside the implemented Actions workflow, covering triggers, permissions, protected environments, pinned actions, build jobs, provenance, draft creation, immutability, and publication approval.
- [ ] Create `docs/architecture/installation-and-upgrade-model.md` alongside verified packages, covering format selection, install locations, checksums/signatures, upgrade behavior, settings compatibility, rollback limits, uninstall ownership, and manual v1 updates.
- [ ] Create `docs/architecture/software-supply-chain-security.md` from the implemented dependency, lockfile, action pinning, SBOM, checksum, provenance, signing, permission, and artifact-review controls.
- [ ] Create `docs/architecture/artifact-and-versioning-model.md` from the implemented version source, tag rules, artifact names, architecture labels, checksums, source archives, immutability, prereleases, and patch-release policy.
- [ ] Mark each document planned until its workflow exists, then update it from actual workflow files, packages, and verification evidence before Phase 5 closes.

### 9.6 Package verification

- [ ] Install, launch, exercise the core workflow, close, reopen, upgrade, and uninstall every package format in a clean suitable environment.
- [ ] Verify icons, desktop entry, WM class, dependencies, menus, and removed files.
- [ ] Verify AppImage on at least two distribution families.
- [ ] Verify one Debian or Ubuntu family deb install, one Fedora family rpm install, and one Arch family Pacman install.
- [ ] Verify x64 and arm64 on real hardware or clearly document the approved equivalent and quality label.
- [ ] Confirm that package installation does not create tray or autostart files when those features are not included.

### 9.7 Release security review

- [ ] Review direct and transitive dependencies, licenses, advisories, install scripts, and unused packages.
- [ ] Produce and inspect the SBOM.
- [ ] Run the complete security suite against packaged output.
- [ ] Inspect CSP, IPC surface, fuses, ASAR, navigation, permissions, scheme handling, and diagnostic redaction.
- [ ] Document the Linux signing identity and verification plan, or explicitly document unsigned preview status.
- [ ] Resolve every critical and high-severity finding before a release candidate.
- [ ] Obtain external security review where available and record scope and remediation.

### 9.8 Phase 5 deliverables

- AppImage, deb, rpm, and Pacman release-candidate artifacts.
- Protected CI and tag-driven draft release workflows.
- Checksums, SBOM, artifact inventory, and signing-plan status.
- Complete installation, upgrade, troubleshooting, and uninstall documentation.
- Package smoke-test evidence and a draft prerelease.
- Versioned prerelease test report under `tests/test_reports/<version>/test_report.md`.
- Implemented packaging, GitHub release pipeline, installation/upgrade, supply-chain, and artifact/versioning architecture documents.
- Complete getting-started, installation, upgrade, troubleshooting, uninstall, and privacy user guides.

### 9.9 Phase 5 exit criteria

- [ ] A version tag produces only a draft release with correctly named artifacts.
- [ ] Every claimed package and architecture has build and smoke-test evidence.
- [ ] Checksums match downloaded draft artifacts.
- [ ] Installation and uninstall instructions have been followed from a clean environment.
- [ ] CI permissions, pinned Actions, protected environment, and untrusted-fork behavior pass review.
- [ ] No critical or high release-security finding remains.
- [ ] The prerelease test report recommends `preview-only` or better and names all missing stable-release evidence.
- [ ] The five Phase 5 architecture documents match the actual workflows and tested package behavior and are no longer marked merely planned.
- [ ] Every Phase 5 user guide has been followed against the relevant release-candidate package and corrected from observed results.

## 10. Phase 6 - Release validation and publication

### 10.1 Objective

Validate the complete v1 candidate across the required matrix, correct release-blocking defects, obtain publication approval, and publish an immutable v1.0.0 GitHub Release.

### 10.2 Release-candidate freeze

- [ ] Freeze feature scope at v1 required behavior.
- [ ] Set the v1.0.0 version consistently across package metadata and documentation.
- [ ] Regenerate the lockfile only for an explained dependency change.
- [ ] Complete release notes, changelog, installation links, support statement, privacy statement, and known limitations.
- [ ] Create the v1.0.0 candidate tag only from the reviewed release commit.
- [ ] Build the candidate through the protected release workflow.

### 10.3 Full validation matrix

- [ ] Run all unit, fixture, integration, preload, component, end-to-end, security, accessibility, and packaged-smoke suites.
- [ ] Run KDE Plasma Wayland on a current rolling or recent distribution.
- [ ] Run KDE Plasma X11 where the selected test distribution supports it.
- [ ] Run GNOME Wayland on current Ubuntu or Fedora.
- [ ] Run the required deb, rpm, Pacman, and two-family AppImage tests.
- [ ] Test 100, 125, 150, and 200 percent scaling where supported.
- [ ] Test light, dark, system, high-contrast observation, and reduced motion.
- [ ] Test x64 and verified arm64 coverage, or label arm64 preview quality if the approved hardware gate is not met.
- [ ] Run packaged performance, memory-growth, suspend, resume, timezone, offline, proxy, and lifecycle tests.
- [ ] Capture a normal-use network trace proving no Token Trail telemetry and only approved network behavior.

### 10.4 Soak and remediation

- [ ] Make the candidate available only as an explicitly labeled prerelease or private draft during the soak period.
- [ ] Exercise repeated launches, refreshes, sleeps, resumes, Codex restarts, and long idle periods.
- [ ] Triage every finding by severity, affected package, reproducibility, and release impact.
- [ ] Fix blockers in a new candidate commit and version tag when immutability requires it.
- [ ] Rerun the affected tests plus all security and packaging gates after a release-blocking fix.
- [ ] Keep deferred non-blocking issues in known limitations with a follow-up identifier.

### 10.5 Final evidence and approval

- [ ] Complete `tests/test_reports/1.0.0/test_report.md` from actual local, CI, and manual evidence.
- [ ] Confirm the report contains commit, tag, environments, commands, results, skipped coverage, checksums, limitations, and a `ready` recommendation.
- [ ] Confirm the draft release contains exactly the reviewed artifacts, notes, metadata, checksums, and approved signatures.
- [ ] Confirm release immutability is enabled and the published tag cannot be repointed or its assets replaced.
- [ ] Present the final evidence and unresolved limitations to the user.
- [ ] Obtain explicit user approval to publish.

### 10.6 Publication and immediate verification

- [ ] Publish the reviewed GitHub Release without changing the approved assets.
- [ ] Download each published artifact and checksum from the public release page.
- [ ] Verify public checksums and at least one clean install from the published location.
- [ ] Verify release notes, links, architecture labels, and source-archive explanation.
- [ ] Record publication time, release URL, final commit, tag, and verification result in the commit tracker and test report.
- [ ] If a published defect is found, create a new patch version. Never replace the immutable v1.0.0 tag or assets.

### 10.7 Release, support, and maintenance documentation

- [ ] Create `docs/release/release-validation-process.md` from the actual freeze, matrix, soak, remediation, evidence, approval, publication, and public-verification workflow.
- [ ] Create `docs/support/support-policy.md` defining supported versions, environments, response boundaries, security-report handling, compatibility labels, and end-of-support rules.
- [ ] Create `docs/maintenance/maintenance-and-compatibility.md` defining Electron/Chromium and Codex upgrade cadence, dependency review, fixture updates, migrations, regression scope, and patch-release triggers.
- [ ] Create `docs/release/rollback-and-incident-response.md` defining immutable-release correction, patch versions, compromised artifact response, advisory handling, rollback limits, communication, and evidence preservation.
- [ ] Create `docs/support/known-limitations.md` from final observed limitations, unavailable environments, preview-quality targets, workarounds, and linked follow-up identifiers.
- [ ] Create `docs/release/release-checklist.md` as the executable human checklist for candidate creation, evidence review, approval, publication, checksum download, clean installation, and handoff.
- [ ] Finalize `CHANGELOG.md` and version-specific release notes from verified changes rather than planned features.
- [ ] Keep support and maintenance promises no broader than the final verified compatibility matrix.

### 10.8 Phase 6 deliverables

- Complete `tests/test_reports/1.0.0/test_report.md`.
- Final release notes, known limitations, installation documentation, checksums, SBOM, and approved signatures if available.
- Immutable public v1.0.0 GitHub Release.
- Final compatibility and support statement.
- Closed v1 implementation checklist and initialized post-v1 tracker state.
- Final release-validation, support, maintenance, rollback/incident, known-limitations, and release-checklist documents.
- Final changelog and version-specific release notes.

### 10.9 Phase 6 exit criteria

- [ ] Every required acceptance criterion has evidence or an explicitly approved exception.
- [ ] The v1.0.0 test report recommends `ready`.
- [ ] The user has explicitly approved publication.
- [ ] Public artifacts match reviewed checksums and install successfully from the release page.
- [ ] No unresolved critical or high-severity defect remains.
- [ ] All known limitations and deferred work have identifiers and are visible.
- [ ] Release, support, maintenance, incident-response, and user documentation match the exact published artifacts and verified support scope.
- [ ] A new maintainer can reproduce the release-validation and public-verification process from the completed documentation without relying on undocumented project knowledge.
- [ ] The approved v1 project scope is declared complete.

## 11. Cross-phase quality gates

Every phase closes with the following checks, adjusted to the code that exists:

| Gate | Required evidence |
| --- | --- |
| Formatting | Formatting check exits successfully without modifying tracked files |
| Static quality | Lint and strict TypeScript checks pass |
| Unit behavior | Relevant unit and fixture tests pass |
| Boundary safety | IPC, validation, allowlist, redaction, and isolation tests pass |
| User behavior | Relevant component and end-to-end workflows pass |
| Accessibility | New interactive behavior has semantic, keyboard, and automated evidence |
| Packaging | Packaged smoke tests run when packaging behavior changes |
| Documentation | Comments, README, decisions, tracker, and user instructions match behavior |
| Privacy | Data inventory and persistence assumptions remain accurate |
| Security | No unexplained critical or high-severity finding remains |
| Git hygiene | Diff is scoped, generated output is intentional, and no secret is present |

A later test failure can reopen an earlier phase gate. Phase completion is evidence about a known commit, not a permanent waiver.

## 12. Test-report system

### 12.1 Location and lifecycle

- Each tested application version uses `tests/test_reports/<version>/test_report.md`.
- Prerelease identifiers remain part of the folder name, such as `tests/test_reports/1.0.0-preview.1/test_report.md`.
- The report begins when the version candidate is created and is updated as CI and manual evidence arrives.
- Every local, CI, and manual execution records exact start and finish times in a human-readable 12-hour form such as `August 14, 2026 at 1:20 PM EDT`, followed by the IANA timezone and numeric UTC offset; the report separately records its evidence-finalization time.
- Historical timestamps are never guessed from memory or file modification times. Missing timing evidence is labeled `not captured` and remains a visible reporting limitation.
- Each implementation phase updates the active version report and adds curated screenshots under `tests/test_reports/<version>/screenshots/` from the real tested application.
- If a candidate changes code, it receives a new prerelease identifier or patch version. Evidence from an older commit is not silently reused.
- Reports are committed before the corresponding release is published.

### 12.2 Required report sections

1. Version, commit, tag, report status, release recommendation, and human-readable timezone-aware evidence-finalization time.
2. Scope tested and changes since the preceding tested version.
3. Local and CI environments, including architecture and desktop details.
4. Artifact inventory with sizes and SHA-256 checksums.
5. Exact commands, workflow run identifiers, and human-readable per-execution start and finish times with timezone abbreviation, UTC offset, and IANA timezone.
6. Summary table for every test layer.
7. Detailed failures, warnings, retries, flakes, and skipped checks.
8. Security and privacy verification.
9. Accessibility verification.
10. Linux distribution, desktop, display-server, scaling, and package matrix.
11. Performance measurements and comparison with budgets.
12. Installation, upgrade, and uninstall results.
13. Known limitations and deferred issue identifiers.
14. Final release recommendation and approver state.
15. Embedded phase-by-phase screenshots with build, environment, tested state, and privacy-safe captions.

### 12.3 Integrity rules

- Reports contain observed evidence only.
- Failures are not deleted after a rerun. The report records the initial result, remediation, and final result.
- A flaky test is not treated as passing until its cause and retry behavior are understood.
- Secrets, account data, private paths, prompts, responses, raw protocol messages, and identifying diagnostics are excluded.
- Manual checks name the tester role, environment, procedure, and observed outcome without collecting unnecessary identity data.
- CI links support the report but do not replace durable summarized evidence in the repository.
- Routine CI screenshots remain transient. A screenshot becomes durable evidence only after visual inspection confirms that it shows the intended build and contains no sensitive or unrelated desktop data.

## 13. Documentation deliverables

### 13.1 Development documentation

- README with prerequisites, install, local development, quality commands, architecture summary, and project status.
- Indexed architecture guide with system overview, process/lifecycle, adapter, IPC/contracts, renderer state, runtime/CSP, and testing documents.
- Threat model and data-flow review.
- Data inventory and retention table.
- Dependency and license rationale.
- Protocol compatibility and fixture guide.
- Security architecture and IPC contract guide.
- Testing guide and versioned report template.
- Phase-specific domain, preferences, diagnostics, navigation, accessibility, visual-system, performance, resilience, Linux-integration, packaging, supply-chain, versioning, release, installation, and upgrade architecture added when those systems become implemented rather than described as current prematurely.

### 13.2 User documentation

- Getting started and Codex prerequisites.
- AppImage, deb, rpm, and Pacman installation.
- Architecture selection.
- Checksum and signature verification.
- Upgrade and uninstall.
- Privacy and local-data explanation.
- Diagnostics preview and export.
- Troubleshooting for Codex detection, sign-in, FUSE, desktop integration, unsupported versions, and unavailable metrics.
- Support matrix and known limitations.
- Individually testable getting-started, installation, upgrade, troubleshooting, uninstall, and privacy guides under `docs/user/`.

### 13.3 Release documentation

- Maintain one root `CHANGELOG.md` in newest-version-first order. Each released version records its ISO release date and only evidence-backed user-visible additions, changes, fixes, security corrections, deprecations, and removals.
- Keep an `Unreleased` section only for implemented, verified work. Planned work never appears as shipped, and empty headings are omitted.
- Build changelog entries from the commit tracker and verified diff, then reconcile them against the versioned test report; do not copy internal agent/user lessons, implementation trivia, or raw commit subjects into user-facing prose.
- Create version-specific GitHub Release notes from the matching changelog entry, adding artifact/install links, checksums, supported platforms, upgrade notes, and known limitations. Release notes may be more operational but must not contradict the changelog.
- Link each released changelog version to its immutable tag or GitHub Release after publication. Corrections to a published immutable release use a new patch version rather than silently rewriting its historical entry.
- Artifact and checksum inventory.
- SBOM and signing status.
- Versioned test report.
- Upgrade compatibility and settings-migration notes.
- Clear stable versus preview labels.
- Release validation, rollback/incident response, and executable release checklist under `docs/release/`.
- Support policy and known limitations under `docs/support/`.
- Recurring maintenance and compatibility policy under `docs/maintenance/`.

## 14. Open-question resolution schedule

| Product-spec question | Resolve by | Required evidence or decision |
| --- | --- | --- |
| Codex app-server stability commitment | Phase 1 | Current official documentation, generated bindings, capability behavior |
| Existing daemon versus owned child | Phase 1 | Security, lifecycle, reliability, and compatibility prototype |
| Refresh interval | Phase 2, finalize Phase 4 | Response timing, upstream behavior, idle CPU, laptop impact |
| Exact Linux distributions and versions | Phase 4 | Current supported distributions and available test environments |
| arm64 stable versus preview quality | Phase 5 | Real hardware or explicitly approved equivalent evidence |
| Tray and notifications in v1 | Before Phase 3 closes | Explicit scope decision; default is post-v1 |
| Production font and icon licenses | Phase 4 | Visual prototype, license review, bundle effect |
| Linux release identity and signing | Phase 5 | Available identity, verification usability, CI secret handling |
| No update check versus user-initiated check | Phase 5 | Explicit network and consent decision; default is no check in v1 preview |
| Achievable memory ceiling | Phase 4 | Packaged measurements on the minimum reference machine |

An unresolved question blocks only the phase or feature named here unless it changes the approved security, privacy, or architecture boundary.

## 15. Risks and stop conditions

Implementation pauses for a user or architecture decision when any of these conditions occurs:

- Required Codex data cannot be accessed through the approved read-only methods.
- A proposed solution requires prompts, tasks, credentials, browser cookies, arbitrary files, or another denied data source.
- Renderer functionality requires Node integration, disabled sandboxing, generic IPC, remote UI code, or weakened CSP.
- A dependency introduces an unacceptable license, install script, native packaging burden, maintenance risk, or unresolved severe advisory.
- Required Linux packaging cannot access the host Codex process safely.
- Performance misses the approved budget enough to reopen the Electron framework decision.
- Accessibility requires a product interaction change that materially alters approved behavior.
- A release candidate cannot be reproduced, verified, or safely distinguished by architecture.
- Publication, signing, or network behavior is needed without the required approval.

Ordinary defects, incomplete tests, or difficult implementation work do not trigger a scope expansion. They are fixed or recorded transparently within the current phase.

## 16. Post-v1 follow-up tracker

The items below are not required for v1.0.0. They remain visible so project completion does not erase future ideas. Each item requires fresh prioritization after v1, and items marked privacy, lifecycle, platform, or network sensitive require a separate decision before implementation.

### 16.1 Background and desktop behavior

| ID | Follow-up | Gate | Initial status |
| --- | --- | --- | --- |
| FUP-001 | System tray status icon | Consent, lifecycle, KDE and GNOME behavior | Deferred |
| FUP-002 | Native threshold notifications | Consent, notification rules, rate limiting, cross-desktop tests | Deferred |
| FUP-003 | Start at login | Explicit opt-in, uninstall cleanup, desktop compatibility | Deferred |
| FUP-004 | Compact window mode | Accessible responsive design and saved-preference behavior | Deferred |

### 16.2 Update experience

| ID | Follow-up | Gate | Initial status |
| --- | --- | --- | --- |
| FUP-005 | User-initiated update check | Explicit network decision, fixed HTTPS provider, privacy text | Deferred |
| FUP-006 | Consent-based artifact download | Signature or verification design, proxy and partial-download tests | Deferred |
| FUP-007 | Optional automatic update checks | Visible setting, no silent installation, offline and proxy behavior | Deferred |
| FUP-008 | Staged rollout and rollback | Signed metadata, migration safety, rollback and downgrade tests | Deferred |

### 16.3 Platforms and package formats

| ID | Follow-up | Gate | Initial status |
| --- | --- | --- | --- |
| FUP-009 | Signed Windows release | Windows integration, code-signing identity, installer and updater tests | Later opt-in |
| FUP-010 | Notarized macOS release | macOS integration, signing, notarization, universal architecture tests | Later opt-in |
| FUP-011 | Flatpak | Safe sandbox-to-host Codex connection and portal or daemon design | Research required |
| FUP-012 | Snap | Confinement, store, host-process access, and lifecycle review | Research required |
| FUP-013 | Tar archive fallback | Support need, metadata expectations, manual upgrade documentation | Optional |

### 16.4 Local data and advanced insights

| ID | Follow-up | Gate | Initial status |
| --- | --- | --- | --- |
| FUP-014 | User-controlled local history | Separate privacy decision, retention choice, deletion, migration, encryption review | Later opt-in |
| FUP-015 | Long-term trends and period comparisons | Approved retained history with complete coverage rules | Blocked by FUP-014 |
| FUP-016 | Burn rate, forecasts, and confidence ranges | Sufficient real history, disclosed model, uncertainty and reliability tests | Blocked by FUP-014 |
| FUP-017 | Encrypted backup and import or export | Key handling, schema migration, recovery, explicit user action | Later opt-in |

### 16.5 Customization and reach

| ID | Follow-up | Gate | Initial status |
| --- | --- | --- | --- |
| FUP-018 | Custom dashboard card ordering | Accessible keyboard reordering and preference migration | Later opt-in |
| FUP-019 | Additional languages | Translation workflow, locale formats, layout and support plan | Later opt-in |
| FUP-020 | Right-to-left layout | Bidirectional design, charts, tables, focus, and manual testing | Blocked by language work |
| FUP-021 | Plasma widget | Separate minimal-client architecture and safe data bridge | Separate project decision |
| FUP-022 | Browser companion | Separate minimal-client threat model and authentication boundary | Separate project decision |

### 16.6 Maintenance after v1

| ID | Follow-up | Gate | Initial status |
| --- | --- | --- | --- |
| FUP-023 | Electron and Chromium security upgrades | Supported-version policy, regression and packaged tests | Recurring maintenance |
| FUP-024 | Codex protocol compatibility updates | Binding and fixture changes, capability fallback, regression tests | Recurring maintenance |
| FUP-025 | Linux distribution refresh | Updated support matrix and package smoke tests | Recurring maintenance |
| FUP-026 | Patch releases | Reproduced defect, regression test, new immutable version | As needed |
| FUP-027 | Dependency and license review | Advisory monitoring, lockfile review, SBOM comparison | Recurring maintenance |

Rejected v1 areas do not automatically become follow-ups. Prompt analysis, task analytics, Codex control, credential access, telemetry, advertising, and fabricated forecasts require a new product-purpose decision rather than a backlog promotion.

## 17. Final v1 handoff checklist

- [ ] All six phases show completed exit criteria.
- [ ] Product-spec acceptance criteria map to evidence in the final report.
- [ ] Source, tests, comments, and documentation describe the same behavior.
- [ ] Clean-clone installation and quality commands pass.
- [ ] All release artifacts and checksums match.
- [ ] Install, upgrade, and uninstall instructions are verified.
- [ ] Security, privacy, accessibility, compatibility, and performance limitations are visible.
- [ ] GitHub release workflow is least-privilege and tag-driven.
- [ ] Release immutability is enabled.
- [ ] `tests/test_reports/1.0.0/test_report.md` recommends `ready`.
- [ ] User publication approval is recorded.
- [ ] Public v1.0.0 artifacts are downloaded and verified after publication.
- [ ] Follow-up items remain deferred unless separately approved.

## 18. Plan maintenance

- Update task checkboxes only from repository or test evidence.
- Record a phase start date, completion date, and controlling commit when work begins and ends.
- Add newly discovered work to the correct phase instead of silently expanding a nearby task.
- Update the product specification first when behavior, privacy, security, or acceptance requirements change.
- Update the design decision log when a trade-off or boundary changes.
- Update the commit tracker for each meaningful commit.
- Keep post-v1 work separate from v1 completion unless the user explicitly changes scope.
- Never mark Phase 6 complete merely because artifacts were built. Completion requires validated public artifacts after approved publication.
