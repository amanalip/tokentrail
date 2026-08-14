# Token Trail Architecture Guide

**Status:** Phase 2 implemented-system index; Phase 3 expansion scheduled  
**Last updated:** August 14, 2026 at 11:16 AM EDT

This directory explains how Token Trail works as a complete system. The product specification defines required behavior, the implementation plan defines delivery order, and these documents explain the implemented technical boundaries and why they exist.

## Recommended reading order

1. [System overview](system-overview.md) — components, ownership, and one complete refresh.
2. [Process and lifecycle](process-and-lifecycle.md) — Electron processes, the owned Codex child, startup, and shutdown.
3. [Codex adapter](codex-adapter.md) — discovery, transport, allowlists, validation, normalization, and recovery.
4. [IPC and data contracts](ipc-and-data-contracts.md) — what may cross into the renderer and how senders are authorized.
5. [Renderer state model](renderer-state-model.md) — Overview states, refresh behavior, provenance, and presentation rules.
6. [Runtime modes and CSP](runtime-modes-and-csp.md) — development, built-content, and packaged differences.
7. [Testing architecture](testing-architecture.md) — which test layer proves each boundary.
8. Existing reference documents: [data flow](data-flow.md), [data inventory](data-inventory.md), [threat model](threat-model.md), [protocol compatibility](protocol-compatibility.md), and [dependency rationale](dependency-rationale.md).

## Document ownership and status

| Document | Current scope | Update trigger |
| --- | --- | --- |
| `system-overview.md` | Phase 2 complete system | New process, store, route, or external boundary |
| `process-and-lifecycle.md` | Main/preload/renderer/Codex ownership | Startup, shutdown, retry, or window lifecycle change |
| `codex-adapter.md` | Approved account and quota transport | Protocol method, schema, limit, or compatibility change |
| `ipc-and-data-contracts.md` | Overview snapshot bridge | IPC method, event, origin, or DTO change |
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

## Phase 3 documentation backlog

The following documents are created alongside their implementations, not speculatively presented as current architecture:

- domain calculations and precision;
- preferences and storage;
- diagnostics and redaction;
- navigation and route composition;
- accessibility architecture.

Phase 5 adds packaging, release, installation, upgrade, and update-boundary documents. Every new document must name its status, invariants, failure behavior, privacy/security effect, tests, limitations, and controlling decisions.
