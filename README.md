# Token Trail

> **Project status:** Phase 2 core read-only Overview complete locally

## Contents

- [About](#about)
- [Development](#development)
- [Project documents](#project-documents)

## About

Token Trail is a privacy-first desktop dashboard intended to help people understand their Codex usage. It aims to present available quota windows, token activity, reset times, credits, and related metrics in a clear and approachable way.

The user-facing product name is **Token Trail**. The repository, npm package, executable slug, custom protocol, and code identifiers may use the machine-safe form `tokentrail` or `TokenTrail`; those identifiers must never replace the spaced product name in visible interface copy.

The approved Electron application now has a tested Phase 2 read-only Codex-to-Overview slice. Publication, signing, update deployment, telemetry, and broader Codex access remain separately gated.

## Development

Token Trail currently requires Node.js 24.15 or newer and npm 12 or newer.

```bash
npm install
npm run dev
```

The development command builds main and preload in watch mode, serves the renderer only on `127.0.0.1:5173`, and launches Electron after all three are ready.

Development uses an explicitly separate loopback-only CSP so Vite CSS and hot updates work. Packaged production keeps the stricter self-hosted style policy.

Core verification commands:

```bash
npm run verify
npm run test:coverage
npm run test:integration
npm run test:development
npm run test:accessibility
npm run test:e2e
npm run test:security
npm run test:packaged
npm run test:performance
```

Electron security and packaged tests may need to run outside a restricted container because Chromium's Linux sandbox requires operating-system capabilities that some containers deny.

## Project documents

- [Original KDE product specification](docs/PRODUCT_SPEC.md)
- [Approved Electron product specification](product_spec_electron.md)
- [Detailed implementation plan](implementation_plan.md)
- [Design decision log](design_decisions.md)
- [Commit tracker](commit_tracker.md)
- [Architecture guide and reading order](docs/architecture/README.md)
- [Threat model](docs/architecture/threat-model.md)
- [Data flow](docs/architecture/data-flow.md)
- [Data inventory](docs/architecture/data-inventory.md)
- [Dependency rationale](docs/architecture/dependency-rationale.md)
- [Codex protocol compatibility](docs/architecture/protocol-compatibility.md)

The current screenshot-backed development evidence is recorded in [tests/test_reports/0.2.0/test_report.md](tests/test_reports/0.2.0/test_report.md). Each later executable version receives its own `tests/test_reports/<version>/test_report.md`.
