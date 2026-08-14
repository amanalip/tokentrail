# Error Taxonomy and Recovery

**Status:** Phase 2 implemented behavior
**Last updated:** August 14, 2026 at 11:28 AM EDT

## Principle

Token Trail separates internal causes from renderer-safe categories. Upstream messages, stderr, paths, payloads, and stack traces stay inside privileged code. The renderer receives enough information to explain the state without receiving sensitive diagnostic detail.

## Safe categories

| Category | Typical privileged cause | Renderer meaning | Recovery |
| --- | --- | --- | --- |
| `codex-not-found` | No executable in reviewed absolute PATH entries | Codex is unavailable on this computer | Install or correct local Codex setup, then retry |
| `codex-unavailable` | Spawn failure, process exit, pipe loss, or owned shutdown | Codex cannot answer now | Bounded retry after backoff |
| `codex-incompatible` | Initialization or approved method is unsupported | Installed Codex needs compatibility attention | Update/check supported Codex version |
| `request-timeout` | Approved request exceeded its deadline | Codex did not answer in time | Preserve prior data and retry later |
| `invalid-response` | Malformed, oversized, unsafe, or schema-invalid response | Latest read could not be trusted | Discard connection and retry safely |
| `permission-denied` | Method failed the closed allowlist | Operation is not authorized | No transport and no automatic retry |
| `internal-error` | Local invariant or invalid lifecycle use | Token Trail could not complete locally | Sanitized failure; investigate through tests |

## Error conversion

Only `CodexProcessError` carries a recognized category through privileged orchestration. Schema failures and unexpected values become `invalid-response`; raw JavaScript error messages do not cross IPC. Main validates the final snapshot, and preload validates it again before React can store it.

## State selection

- Before any success, incompatibility becomes `unsupported`.
- Missing or unavailable Codex becomes `unavailable`.
- Other first-read failures become `error`.
- After a successful snapshot, any transient refresh failure becomes `stale` and preserves the last valid data.
- A null account is not an error; it becomes the explicit `signed-out` state.
- Missing individual fields are not errors or zeros; they make a valid snapshot `partial`.

## Retry and circuit behavior

Concurrent refreshes share one in-flight promise. Failed connections are stopped and discarded before retry. Consecutive failures use capped exponential delays and a maximum restart budget. After the maximum cooldown, one recovery attempt is allowed; otherwise the circuit breaker could permanently prevent recovery.

Manual refresh respects active backoff. Automatic periodic polling is disabled. A valid rate-limit notification requests a complete refresh, which uses the same deduplication and retry rules.

## Shutdown and cancellation

Stopping the controller removes listeners, stops only the retained child, and settles pending requests with a safe unavailable category. Request timers are cleared on response, connection failure, or shutdown. Repeated cleanup calls are harmless.

## Logging and diagnostics boundary

Phase 2 has no diagnostic export and does not persist health events. Stderr is discarded. Phase 3 diagnostics must build a new allowlisted safe object from categories rather than serialize errors or reuse raw logs.

## Evidence

Fixtures cover missing method, malformed and oversized output, timeout, process exit, and absent account. Controller tests cover stale preservation, deduplication, backoff, restart budget, and post-cooldown recovery. Renderer tests confirm raw fixture messages do not appear.
