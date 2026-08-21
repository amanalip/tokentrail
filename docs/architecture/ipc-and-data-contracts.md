# IPC and Data Contract Architecture

**Status:** Phase 3 bridge implemented  
**Last updated:** August 21, 2026

## Public bridge

The renderer receives one frozen `window.tokenTrail` object with exactly eight capabilities:

| Method | Direction | Input | Output |
| --- | --- | --- | --- |
| `getOverviewSnapshot()` | Renderer to main | None | Current validated snapshot |
| `refreshOverview()` | Renderer to main | None | Resulting validated snapshot |
| `onOverviewChanged(listener)` | Main to renderer event | Local callback only | Exact unsubscribe function |
| `getPreferences()` | Renderer to main | None | Validated preferences document |
| `setPreferences(preferences)` | Renderer to main | Complete validated document | Stored validated document |
| `previewDiagnostics()` | Renderer to main | None | Closed redacted diagnostics document |
| `exportDiagnostics()` | Renderer to main | None | Saved boolean plus closed error category, never a path |
| `clearApplicationData()` | Renderer to main | None | Returned reviewed defaults |

Channel names remain an internal shared constant imported only by privileged code. The bridge exposes no `send`, `invoke`, generic event subscription, Electron object, protocol method, path, or arbitrary payload.

## Sender authorization

Every invoke requires a live top-level frame and one exact root document:

- packaged: `tokentrail://app/`;
- development: `http://127.0.0.1:5173/`.

Subframes, malformed URLs, lookalike hosts, alternate ports, non-root paths, queries, and fragments fail closed. Authorization uses parsed URL components and Electron frame identity, not string prefixes supplied by the caller.

## Snapshot contract

`OverviewSnapshot` is a discriminated runtime-validated DTO. It contains only connection state, safe account kind/plan labels, normalized quota buckets, the normalized usage section (daily buckets as exact decimal strings plus reported summary fields and coverage), the normalized credits section (balance or unlimited state, spending control, authoritative reset-credit count with bounded detail rows), the in-memory session observation (percentage-point quota deltas, exact counter deltas, reset transitions), provenance, availability reasons, refresh timestamps, and a closed error category.

Raw protocol envelopes, emails, request IDs, executable details, stderr, filesystem paths, unknown fields, and exception messages are absent by construction. Both main and preload parse outgoing snapshots, so an internal refactor cannot silently widen the renderer object.

## Preference and diagnostics contracts

- Preferences cross IPC only as complete schema-valid documents; partial updates are rejected so every stored document is fully valid.
- Diagnostics cross IPC only through the closed preview/export flow: export writes exactly the retained previewed document and returns no filesystem path.
- Clear-data accepts no argument and returns reviewed defaults; it removes only Token Trail-owned preference files.

## Subscription lifecycle

Preload wraps the Electron event listener and validates each event payload before invoking React's callback. The returned cleanup removes that exact wrapper. React installs one subscription during its effect and removes it during teardown, preventing duplicate listeners across remounts.

## Pressure control

All renderer-to-main methods accept either no payload or one small bounded schema-validated document. The controller deduplicates simultaneous refresh requests into one promise, and its backoff prevents repeated failed process starts. Payload-bearing methods (`setPreferences`) are bounded by the strict preferences schema rather than free-form size limits.

## Change rules

Any new bridge method requires updates to the shared type, runtime schemas, threat model, data inventory, sender tests, preload surface tests, renderer isolation tests, and this document. A feature may not bypass the bridge by importing Electron into renderer code.
