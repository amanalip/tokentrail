# Testing Architecture

**Status:** Phase 2 evidence model implemented  
**Last updated:** August 14, 2026 at 11:16 AM EDT

## Evidence principle

Token Trail tests behavior at the lowest useful layer and repeats security or runtime properties at the real boundary where they could change. A unit policy string, jsdom component, built Electron window, and packaged executable answer different questions.

## Layers

| Layer | Proves | Does not prove alone |
| --- | --- | --- |
| Unit | Pure validation, normalization, authorization, state transitions | Real child or Chromium behavior |
| Component | Accessible React output and user interactions | CSP, Electron isolation, native chrome |
| Integration | Real owned fixture process, NDJSON framing, timeouts, cancellation | Renderer presentation |
| Development | Actual Vite CSS/HMR and Electron development orchestration | Packaged fuses or ASAR |
| Built Electron E2E | Complete fixture-to-UI path and state matrix | Installed package metadata |
| Security | Production CSP, navigation, popup, and renderer globals | Broad desktop compatibility |
| Accessibility | Landmarks, names, keyboard-visible behavior, reflow | Full manual screen-reader conformance |
| Packaged | Fused executable, custom protocol, isolation, native launch | Installer formats not yet built |
| Performance | Measured startup, CPU, memory, process tree | Unavailable hardware/environments |

## Fixture strategy

The checked-in app-server fixture contains synthetic data only. Scenarios cover full data, no account, one/multiple buckets, nulls, unknown fields, markup-shaped text, malformed/oversized output, missing methods, timeout, and process exit. A fixture path is fixed in main and is available only to unpackaged tests with an exact scenario allowlist.

Packaged tests replace `PATH` and `HOME` with a disposable empty directory. This ensures a smoke test cannot discover a real Codex executable or account. Full screenshots use synthetic fixtures; unavailable packaged screenshots use the isolated no-Codex state.

## Screenshot evidence

Routine failures may create transient screenshots and traces. Curated evidence is written only when an explicit versioned environment path is supplied. Every version report identifies whether a screenshot uses a fixture or isolated unavailable state and must not contain real account data.

Phase 3 adds dedicated runtime-window icon evidence and a numeric readability matrix for `11%`, `47%`, `48%`, `88%`, and `100%`. Native window chrome may require compositor-specific capture; unavailable automation is recorded rather than converted into a pass.

## Command gates

`npm run verify` covers format, lint, type checks, unit/component tests, and process integration. Separate commands cover development, E2E, security, accessibility, packaged smoke, performance, and coverage because each may require GUI or child-process permissions.

## Reporting

Each executable version receives `tests/test_reports/<version>/test_report.md` with source state, environment, exact results, failures, security/privacy evidence, screenshots, performance, unavailable coverage, limitations, and recommendation. Coverage percentages supplement behavior evidence; they do not replace it or justify tests that merely increase a number.
