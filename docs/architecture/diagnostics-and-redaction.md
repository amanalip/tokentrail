# Diagnostics and Redaction

**Status:** Implemented in Phase 3
**Last updated:** August 21, 2026

This document explains how Token Trail builds, previews, and exports diagnostic output without exposing sensitive data. The product specification (sections 5.8, 15.6, and 22) controls required behavior.

## Scope

- The closed diagnostics document schema.
- The allowlist-built preview flow (preview before save is mandatory).
- The export path through a native save dialog with safe file writing.
- The canary strategy that proves sensitive classes cannot enter the document.

## Document schema

`src/shared/contracts/diagnostics.ts` defines one strictly validated document (`schemaVersion: 1`) with five closed sections:

| Section | Fields |
| --- | --- |
| `application` | Token Trail version, Electron version, Chromium version, Node version |
| `platform` | Operating system family, architecture, session type (`wayland`/`x11`/`unknown` or null), theme mode |
| `connection` | Codex discovered boolean, reported CLI version (nullable), supported capabilities, unsupported capabilities, last refresh category, last successful refresh time |
| `coverage` | Valid date count, rejected record count, first/last valid dates — counts and bounds only |
| `session` | Observation start time, valid snapshot count — no snapshot bodies |

The schema is `.strict()`: any field not explicitly named cannot survive parsing. There is no free-form text field anywhere in the document.

## Build path

`buildDiagnosticsDocument()` (src/main/diagnostics/build-diagnostics.ts) assembles the document from reviewed inputs:

- Environment facts come from process metadata (`app.getVersion()`, `process.versions`, `process.platform`, `process.arch`) and the safely detectable `XDG_SESSION_TYPE`.
- Connection facts come from controller state: discovery booleans and capability names from the closed allowlist — never paths.
- Coverage and session facts come from the normalized snapshot's counters; raw buckets, quota values, credit strings, and delta bodies have no input parameter at all.

Because sensitive values are absent from the function's inputs, they cannot leak through formatting bugs. The final parse through the boundary schema prevents privileged-only fields from being added later without a schema change.

## Preview-before-export

FR-009 requires a redacted preview before saving. The IPC layer enforces this structurally:

1. `previewDiagnostics` builds a fresh document, validates it, and retains it as the **only** exportable content.
2. `exportDiagnostics` writes exactly the retained previewed document. If no preview exists in the session, export fails closed with a safe category rather than generating unreviewed content.
3. The renderer displays the full JSON preview before enabling the export control.

## Export path

`exportDiagnostics` (src/main/ipc/application-ipc.ts):

1. Offers a native save dialog so the destination is always user-chosen; the renderer never supplies a path.
2. Writes JSON with mode 0o600 where the platform permits.
3. Returns only a closed result category (`saved` boolean plus `canceled`/`write-failed`). Filesystem paths and error text never cross back to the renderer.
4. A canceled dialog is an explicit non-error outcome.

## Canary strategy

Canary tests seed representative sensitive classes and assert their absence from serialized output:

- Credentials and tokens (`secret-canary`, `token=`, `sk-`, `password`, `api_key`)
- Identifying content (`user@example`, `email`)
- Local filesystem structure (`/home/`)
- Denied data classes (`prompt`, `environment`)

`build-diagnostics.test.ts` runs these against the real builder output through the boundary schema, so any future field that could carry a sensitive value fails the canary scan before it ships.

## Security boundaries

- Both handlers validate exact sender-frame identity like all Token Trail IPC.
- Diagnostics construction happens entirely in the privileged main process; the renderer requests a preview by name and receives the closed document.
- Rate limiting applies to refresh, diagnostics, and preference writes per specification 15.6; export writes are user-initiated single actions through the OS dialog.

## Test evidence

- `build-diagnostics.test.ts`: schema-valid assembly, section values, recursive canary absence.
- `routes.test.tsx`: preview required before export enables, export uses the no-payload bridge call, honest status copy for saved/canceled outcomes.

## Known limitations

- The connection section reports discovery state but not yet the observed CLI version string; wiring it to initialization metadata is scheduled follow-up work within Phase 3 verification.
- Local health-event categories (specification 22.1) are represented by the last refresh category only; broader sanitized health counters arrive with lifecycle soak testing in Phase 4.
