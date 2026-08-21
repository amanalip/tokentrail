# Token Trail Architecture Guide

**Status:** Phase 3 implemented-system index; later documents scheduled by phase
**Last updated:** August 21, 2026

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
13. Phase 3 system documents: [calculations and precision](calculations-and-precision.md), [preferences and storage](preferences-and-storage.md), [diagnostics and redaction](diagnostics-and-redaction.md), [navigation and route composition](navigation-and-route-composition.md), and [accessibility architecture](accessibility-architecture.md).
14. Phase 4 product-quality documents as they enter implementation: [design system and theming](design-system-and-theming.md), [resilience and lifecycle](resilience-and-lifecycle.md), and [performance and resource model](performance-and-resource-model.md) are now implementation-in-progress.
15. Existing reference documents: [data flow](data-flow.md), [data inventory](data-inventory.md), [threat model](threat-model.md), [protocol compatibility](protocol-compatibility.md), and [dependency rationale](dependency-rationale.md).

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
| `calculations-and-precision.md` | Phase 3 calculation and ordering library | Formula, precision, ordering, or availability-rule change |
| `preferences-and-storage.md` | Phase 3 preferences schema and store | Schema field, migration, storage path, or write-path change |
| `diagnostics-and-redaction.md` | Phase 3 diagnostics document and export | Schema field, preview/export flow, or canary change |
| `navigation-and-route-composition.md` | Phase 3 route tree and data composition | Route, navigation rule, or contextual-link change |
| `accessibility-architecture.md` | Implemented semantic/keyboard/chart contracts | Semantic, focus, announcement, chart-alternative, or motion change |
| `design-system-and-theming.md` | Phase 4 implementation-in-progress: tokens, identity, typography licensing | Token, palette, asset, typography, or motion-policy change |
| `resilience-and-lifecycle.md` | Phase 4 implementation-in-progress: failure isolation, bounds, clocks, restart | Lifecycle, retry, bound, or recovery-behavior change |
| `performance-and-resource-model.md` | Phase 4 implementation-in-progress: runtime gates, bundle budgets, interaction timing | Budget, measurement method, or resource-behavior change |
| `data-flow.md` | Trust-boundary diagram | Data source, destination, or persistence change |
| `data-inventory.md` | Approved data classes | Any new field or storage path |
| `threat-model.md` | Threats and controls | New capability or trust boundary |
| `protocol-compatibility.md` | Observed Codex protocol | Codex version or schema observation change |
| `dependency-rationale.md` | Dependency decisions | Dependency add, remove, or major upgrade |

## Current system boundary

Phase 3 implements the complete v1 route set over the Phase 2 boundary. Electron main owns the Codex child process and all raw protocol input, performs the three approved reads plus the sparse-update notification, and derives in-memory session deltas. Preload exposes eight purpose-specific methods (three Overview, two preferences, two diagnostics, one clear-data). The renderer receives normalized in-memory snapshots and cannot access Node, Electron, raw IPC, the filesystem, environment variables, or arbitrary Codex methods.

Token Trail persists only the validated preferences document. Usage snapshots, session deltas, and diagnostics content stay in memory; diagnostics export writes only a user-previewed document through a native save dialog. There is no telemetry and no application-initiated update request. Packaging formats and GitHub release automation remain Phase 5.

## Planned documents by implementation phase

The five Phase 3 documents listed above are now implemented-system records maintained alongside their code.

Phase 4 creates the following from implemented product-quality behavior and test evidence:

- `design-system-and-theming.md` (opened; tracks the implemented token layer, visual identity, and typography licensing);
- `resilience-and-lifecycle.md` (opened; tracks failure isolation, owned-process boundaries, resource bounds, clocks, and restart behavior);
- `performance-and-resource-model.md` (opened; tracks runtime gates, bundle budgets, and interaction timings);
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
