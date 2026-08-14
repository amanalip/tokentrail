# Codex Protocol Compatibility Baseline

**Status:** Phase 2 owned-process adapter implemented and tested
**Observed Codex CLI:** 0.146.1
**Observed date:** August 14, 2026

## Tooling evidence

The installed CLI exposes the experimental `codex app-server` command with stdio, Unix socket, and WebSocket listen modes. It also exposes experimental TypeScript and JSON Schema generation. Phase 1 generated temporary TypeScript bindings with:

```text
codex app-server generate-ts --experimental --out <temporary-directory>
```

The generated directory remained under `/tmp` and was not copied into the application. Token Trail will define narrow runtime schemas for approved fields instead of importing the entire broad protocol surface.

## Approved application methods

| Method | Purpose | Phase |
| --- | --- | --- |
| `initialize` | Capability and compatibility handshake | Implemented |
| `account/read` | Minimal signed-in and account context needed by visible state | Implemented |
| `account/rateLimits/read` | Current quota snapshot used by Overview | Implemented |
| `account/rateLimits/updated` | Valid sparse notification triggers a complete approved read | Implemented |
| `account/usage/read` | Aggregate lifetime and daily usage data | Phase 3 |

The method allowlist will be a closed constant. A method absent from that constant cannot be serialized to transport.

## Confirmed current field shapes

- `RateLimitWindow` contains `usedPercent`, nullable `windowDurationMins`, and nullable `resetsAt`.
- `RateLimitSnapshot` contains nullable identity, primary and secondary windows, credit state, spending control, reached state, and plan type.
- `GetAccountRateLimitsResponse` contains a primary snapshot, optional snapshots by limit ID, and nullable reset-credit summary.
- Reset-credit `availableCount` is a `bigint`, while detail rows may be null.
- Usage summaries use nullable `bigint` fields for lifetime tokens, peak daily tokens, longest-running turn, and streak values.
- Daily buckets contain a date string and `bigint` token value.
- Rate-limit update notifications instruct clients to merge supplied values into the most recent full read.

## Denied surface examples

The generated protocol also contains task, turn, filesystem, shell, process, configuration-write, login, logout, reset-credit consumption, feedback, plugin, app, workspace-message, and remote-control methods. Their presence is evidence for a deny-by-default adapter, not authorization to use them.

## Initial connection lifecycle decision

Phase 2 starts and owns one `codex app-server --stdio` child. Token Trail resolves a trusted executable without a shell, passes a fixed argument array and allowlisted environment, retains the exact child handle, bounds message parsing, discards stderr, and stops only that owned child during shutdown or recovery. Requests have local safe-integer IDs, deadlines, cancellation, and a capped restart policy.

The existing daemon or proxy path is not an automatic fallback in v1. Supporting it would add endpoint discovery, shared lifecycle, authorization, ownership, and compatibility behavior before the direct read-only path is proven. It can be reconsidered only if owned stdio fails measured compatibility or lifecycle requirements.

No browser authentication scraping, credential copying, non-loopback listener, generic method forwarding, or shared-secret handling is approved.

## Phase 2 compatibility evidence

The checked-in process fixture covers success, missing account, single and multiple buckets, null and unknown fields, malformed and oversized output, missing method, timeout, and process exit. Runtime schemas intentionally strip email and unknown fields before normalization.

A privacy-safe read-only probe against the installed `codex-cli 0.146.1` completed initialization, `account/read`, and `account/rateLimits/read`. It reported compatibility booleans and a bucket count only; no account identity, quota value, raw payload, stderr, token, or local path was emitted. Automatic polling remains disabled. Sparse notifications trigger a full read because cross-version merge completeness is not yet proven.
