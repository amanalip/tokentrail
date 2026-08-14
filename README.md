# TokenTrail

> **Project status:** Phase 1 foundation complete; Phase 2 is next

## Contents

- [About](#about)
- [Development](#development)
- [Project documents](#project-documents)

## About

TokenTrail is a privacy-first desktop dashboard intended to help people understand their Codex usage. It aims to present available quota windows, token activity, reset times, credits, and related metrics in a clear and approachable way.

The approved Electron application has completed its Phase 1 secure foundation. Phase 2 will implement the first read-only Codex-to-Overview slice. Publication, signing, update deployment, telemetry, and broader Codex access remain separately gated.

## Development

TokenTrail currently requires Node.js 24.15 or newer and npm 12 or newer.

```bash
npm install
npm run dev
```

The development command builds main and preload in watch mode, serves the renderer only on `127.0.0.1:5173`, and launches Electron after all three are ready.

Core verification commands:

```bash
npm run verify
npm run test:coverage
npm run test:integration
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
- [Threat model](docs/architecture/threat-model.md)
- [Data flow](docs/architecture/data-flow.md)
- [Data inventory](docs/architecture/data-inventory.md)
- [Dependency rationale](docs/architecture/dependency-rationale.md)
- [Codex protocol compatibility](docs/architecture/protocol-compatibility.md)

The current screenshot-backed development evidence is recorded in [tests/0.1.0/test_report.md](tests/0.1.0/test_report.md). Later executable versions receive their own `tests/<version>/test_report.md`.
