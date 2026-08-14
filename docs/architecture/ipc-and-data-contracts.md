# IPC and Data Contract Architecture

**Status:** Phase 2 Overview bridge implemented  
**Last updated:** August 14, 2026 at 11:16 AM EDT

## Public bridge

The renderer receives one frozen `window.tokenTrail` object with exactly three capabilities:

| Method | Direction | Input | Output |
| --- | --- | --- | --- |
| `getOverviewSnapshot()` | Renderer to main | None | Current validated snapshot |
| `refreshOverview()` | Renderer to main | None | Resulting validated snapshot |
| `onOverviewChanged(listener)` | Main to renderer event | Local callback only | Exact unsubscribe function |

Channel names remain an internal shared constant imported only by privileged code. The bridge exposes no `send`, `invoke`, generic event subscription, Electron object, protocol method, path, or arbitrary payload.

## Sender authorization

Every invoke requires a live top-level frame and one exact root document:

- packaged: `tokentrail://app/`;
- development: `http://127.0.0.1:5173/`.

Subframes, malformed URLs, lookalike hosts, alternate ports, non-root paths, queries, and fragments fail closed. Authorization uses parsed URL components and Electron frame identity, not string prefixes supplied by the caller.

## Snapshot contract

`OverviewSnapshot` is a discriminated runtime-validated DTO. It contains only connection state, safe account kind/plan labels, normalized quota buckets, provenance, availability reasons, refresh timestamps, and a closed error category.

Raw protocol envelopes, emails, request IDs, executable details, stderr, filesystem paths, unknown fields, and exception messages are absent by construction. Both main and preload parse outgoing snapshots, so an internal refactor cannot silently widen the renderer object.

## Subscription lifecycle

Preload wraps the Electron event listener and validates each event payload before invoking React's callback. The returned cleanup removes that exact wrapper. React installs one subscription during its effect and removes it during teardown, preventing duplicate listeners across remounts.

## Pressure control

Both renderer-to-main methods accept no payload. The controller deduplicates simultaneous refresh requests into one promise, and its backoff prevents repeated failed process starts. This is the Phase 2 rate-control mechanism; future payload-bearing methods require explicit size and frequency limits.

## Change rules

Any new bridge method requires updates to the shared type, runtime schemas, threat model, data inventory, sender tests, preload surface tests, renderer isolation tests, and this document. A feature may not bypass the bridge by importing Electron into renderer code.
