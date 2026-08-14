# Token Trail Architecture Guide

**Status:** Phase 2 implemented-system index; later documents scheduled by phase
**Last updated:** August 14, 2026 at 12:08 PM EDT

This directory explains how Token Trail works as a complete system. The product specification defines required behavior, the implementation plan defines delivery order, and these documents explain the implemented technical boundaries and why they exist.

## Recommended reading order

1. [System overview](system-overview.md) — components, ownership, and one complete refresh.
2. [Repository and build system](repository-and-build-system.md) — source ownership, TypeScript projects, build graph, and packaging boundary.
3. [Process and lifecycle](process-and-lifecycle.md) — Electron processes, the owned Codex child, startup, and shutdown.
4. [Security boundaries](security-boundaries.md) — how renderer, IPC, protocol, content, data, and build controls compose.
5. [Configuration and environments](configuration-and-environments.md) — reviewed modes, environment inputs, precedence, and fail-closed behavior.
6. [Codex adapter](codex-adapter.md) — discovery, transport, allowlists, validation, normalization, and recovery.
7. [Domain model and provenance](domain-model-and-provenance.md) — trusted vocabulary, availability, origin labels, and extension rules.
8. [IPC and data contracts](ipc-and-data-contracts.md) — what may cross into the renderer and how senders are authorized.
9. [Error taxonomy and recovery](error-taxonomy-and-recovery.md) — safe categories, UI states, retry, cancellation, and diagnostics boundary.
10. [Renderer state model](renderer-state-model.md) — Overview states, refresh behavior, provenance, and presentation rules.
11. [Runtime modes and CSP](runtime-modes-and-csp.md) — development, built-content, and packaged differences.
12. [Testing architecture](testing-architecture.md) — which test layer proves each boundary.
13. Existing reference documents: [data flow](data-flow.md), [data inventory](data-inventory.md), [threat model](threat-model.md), [protocol compatibility](protocol-compatibility.md), and [dependency rationale](dependency-rationale.md).

## Document ownership and status

| Document | Current scope | Update trigger |
| --- | --- | --- |
| `system-overview.md` | Phase 2 complete system | New process, store, route, or external boundary |
| `repository-and-build-system.md` | Current repository and build graph | Source layout, compiler, bundler, package, or dependency-policy change |
| `process-and-lifecycle.md` | Main/preload/renderer/Codex ownership | Startup, shutdown, retry, or window lifecycle change |
| `security-boundaries.md` | Composed Phase 2 trust controls | Capability, origin, IPC, protocol, data, or build-boundary change |
| `configuration-and-environments.md` | Current runtime modes and inputs | Environment, argument, preference, secret, or deployment configuration change |
| `codex-adapter.md` | Approved account and quota transport | Protocol method, schema, limit, or compatibility change |
| `domain-model-and-provenance.md` | Overview domain vocabulary | Domain type, availability, provenance, calculation source, or privacy change |
| `ipc-and-data-contracts.md` | Overview snapshot bridge | IPC method, event, origin, or DTO change |
| `error-taxonomy-and-recovery.md` | Safe categories and retry behavior | Error category, state mapping, timeout, backoff, or diagnostics change |
| `renderer-state-model.md` | Overview UI states | State, provenance, refresh, or presentation change |
| `runtime-modes-and-csp.md` | Development, built, packaged modes | Vite, CSP, protocol, packaging, or harness change |
| `testing-architecture.md` | Phase 2 evidence layers | Test command, fixture, environment, or gate change |
| `data-flow.md` | Trust-boundary diagram | Data source, destination, or persistence change |
| `data-inventory.md` | Approved data classes | Any new field or storage path |
| `threat-model.md` | Threats and controls | New capability or trust boundary |
| `protocol-compatibility.md` | Observed Codex protocol | Codex version or schema observation change |
| `dependency-rationale.md` | Dependency decisions | Dependency add, remove, or major upgrade |

## Current system boundary

Phase 2 implements a local, read-only Overview. Electron main owns the Codex child process and all raw protocol input. Preload exposes three purpose-specific methods. The renderer receives normalized in-memory snapshots and cannot access Node, Electron, raw IPC, the filesystem, environment variables, or arbitrary Codex methods.

Token Trail currently persists no account, quota, or usage snapshot. It performs no telemetry and no application-initiated update request. Aggregate usage and the remaining product routes begin in Phase 3. Packaging formats and GitHub release automation remain Phase 5.

## Planned documents by implementation phase

The following documents are created alongside their implementations, not speculatively presented as current architecture:

- `calculations-and-precision.md`;
- `preferences-and-storage.md`;
- `diagnostics-and-redaction.md`;
- `navigation-and-route-composition.md`;
- `accessibility-architecture.md`.

Phase 4 creates the following from implemented product-quality behavior and test evidence:

- `design-system-and-theming.md`;
- `performance-and-resource-model.md`;
- `resilience-and-lifecycle.md`;
- `linux-desktop-integration.md`;
- `docs/support/compatibility-and-support-matrix.md` outside this directory;
- evidence updates to `accessibility-architecture.md` rather than a duplicate accessibility file.

Phase 5 creates the following alongside implemented packaging and release-candidate workflows:

- `packaging-architecture.md`;
- `github-release-pipeline.md`;
- `installation-and-upgrade-model.md`;
- `software-supply-chain-security.md`;
- `artifact-and-versioning-model.md`.

Phase 5 also creates the user-facing `docs/user/getting-started.md`, `installing.md`, `upgrading.md`, `troubleshooting.md`, `uninstalling.md`, and `privacy.md` guides.

Phase 6 creates:

- `docs/release/release-validation-process.md`;
- `docs/support/support-policy.md`;
- `docs/maintenance/maintenance-and-compatibility.md`;
- `docs/release/rollback-and-incident-response.md`;
- `docs/support/known-limitations.md`;
- `docs/release/release-checklist.md`;
- the finalized root `CHANGELOG.md` and version-specific release notes.

Until their owning phase begins, these filenames are planned work, not descriptions of current capabilities. Every new document must name its status, invariants, failure behavior, privacy/security effect, tests, limitations, and controlling decisions.
