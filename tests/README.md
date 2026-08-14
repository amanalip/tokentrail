# Token Trail Tests

This directory separates executable test suites from durable version evidence.

## Executable suites

- `accessibility/` — landmarks, accessible names, keyboard-visible behavior, and reflow.
- `development/` — real Vite/Electron development behavior and CSS hot updates.
- `e2e/` — built-content Electron flows driven by synthetic fixtures.
- `fixtures/` — checked-in account-free Codex app-server scenarios.
- `helpers/` — bounded launch and cleanup harnesses.
- `integration/` — real child-process transport and protocol behavior.
- `packaged/` — fused packaged-executable smoke and isolation.
- `performance/` — packaged startup, CPU, memory, and process measurements.
- `security/` — renderer capability, navigation, popup, and production CSP tests.

## Durable reports

`test_reports/<version>/` contains the human-readable report, curated screenshots, and metrics for one tested application version. For example:

```text
tests/test_reports/0.2.0/
├── test_report.md
├── metrics/
└── screenshots/
```

Routine test output, traces, transient screenshots, and coverage remain outside these version folders. A file enters `test_reports/` only when it is deliberately reviewed as privacy-safe durable evidence.
