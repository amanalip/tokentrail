# Testing Architecture

**Status:** Phase 3 evidence model implemented  
**Last updated:** August 21, 2026

## Evidence principle

Token Trail tests behavior at the lowest useful layer and repeats security or runtime properties at the real boundary where they could change. A unit policy string, jsdom component, built Electron window, and packaged executable answer different questions.

## Layers

| Layer | Proves | Does not prove alone |
| --- | --- | --- |
| Unit | Pure validation, normalization, authorization, state transitions | Real child or Chromium behavior |
| Component | Accessible React output and user interactions, contextual navigation, chart/table honesty | CSP, Electron isolation, native chrome |
| Integration | Real owned fixture process, NDJSON framing, timeouts, cancellation, full section 21.2 catalog | Renderer presentation |
| Development | Actual Vite CSS/HMR and Electron development orchestration | Packaged fuses or ASAR |
| Built Electron E2E | Complete fixture-to-UI path, state matrix, keyboard-only route sweep, live preference application, runtime window identity, numeric readability matrix | Installed package metadata |
| Security | Production CSP, navigation, popup, renderer globals, sender authorization including fragment rules | Broad desktop compatibility |
| Accessibility | Landmarks, names, keyboard-visible behavior, reflow | Full manual screen-reader conformance (Phase 4) |
| Packaged | Fused executable, custom protocol, isolation, packaged icon asset, native launch | Installer formats not yet built |
| Performance | Measured startup, CPU, memory, process tree | Unavailable hardware/environments |

## Fixture strategy

The checked-in app-server fixture contains synthetic data only. Scenarios cover the complete product-spec section 21.2 catalog: full data, no account, one/multiple buckets, primary-only/secondary-only/no-window shapes, nulls, unknown plan and limit values, unknown fields with markup-shaped text, sparse updates before and after a full snapshot, credit unlimited/zero/decimal states, reset-credit count-only and expiry mixes, gapped/zero/duplicate daily buckets, sixty-date spans with a zero preceding period, counters beyond safe integer range, shared and missing reset timestamps, reached-state reports beside high percentages, malformed/oversized output, missing methods, timeout, and process exit. Parameterized `typography-<value>` scenarios expose exactly one primary window for the readability matrix. A fixture path is fixed in main and is available only to unpackaged tests against an exact scenario allowlist.

Packaged tests replace `PATH` and `HOME` with a disposable empty directory. This ensures a smoke test cannot discover a real Codex executable or account. Full screenshots use synthetic fixtures; unavailable packaged screenshots use the isolated no-Codex state.

## Screenshot evidence

Routine failures may create transient screenshots and traces. Curated evidence is written only when an explicit versioned environment path is supplied. Every version report identifies whether a screenshot uses a fixture or isolated unavailable state and must not contain real account data.

Phase 3 adds dedicated runtime-window icon evidence (main-process evaluation that the application-owned asset decodes in every locally testable launch mode), a numeric readability matrix for `11%`, `47%`, `48%`, `88%`, and `100%` across light/dark themes, 100/200 percent zoom, and the narrowest supported width, plus geometry assertions that detect clipped glyphs and inactive typography tokens. Native window chrome may require compositor-specific capture; unavailable automation is recorded rather than converted into a pass.

## Command gates

`npm run verify` covers format, lint, type checks, unit/component tests, and process integration. Separate commands cover development, E2E, security, accessibility, packaged smoke, performance, coverage, and `check:docs` (local-link and terminology sweep) because each may require GUI or child-process permissions.

## Reporting

Each executable version receives `tests/test_reports/<version>/test_report.md` with source state, environment, exact results, failures, security/privacy evidence, screenshots, performance, unavailable coverage, limitations, and recommendation. Coverage percentages supplement behavior evidence; they do not replace it or justify tests that merely increase a number.
