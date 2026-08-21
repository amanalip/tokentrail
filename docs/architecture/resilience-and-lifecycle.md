# Token Trail Resilience and Lifecycle

**Status:** Implementation-in-progress (Phase 4 opened August 21, 2026)
**Implemented and evidenced so far:** owned-child termination boundaries, mid-session exit handling, bounded resources under repeated use, timezone-change presentation, restart persistence, failure isolation across sections, offline/no-network posture
**Still open inside this document's scope:** true suspend/resume, display-change, and long-idle soak observations, which require desktop-session control and belong to the Phase 6 soak campaign
**Controlling documents:** [product_spec_electron.md](../../product_spec_electron.md), [implementation_plan.md](../../implementation_plan.md) section 8.4, [process-and-lifecycle.md](process-and-lifecycle.md), [error-taxonomy-and-recovery.md](error-taxonomy-and-recovery.md)
**Last updated:** August 21, 2026

This document records how Token Trail behaves when the world misbehaves: failing endpoints, exiting children, changing clocks, repeated use, and shutdown. Every claim below names its evidence; anything not yet observed is listed as open scope instead of described as behavior.

## 1. Owned-process lifecycle

Token Trail owns exactly one Codex app-server child, spawned without a shell and addressed through a retained private handle:

- Graceful shutdown signals that exact handle (`SIGTERM`); no code path derives a process id from outside the owned handle.
- Termination ownership is proven by an integration test that spawns an unrelated long-lived process, runs a full client start/stop cycle, and requires the unrelated process to still be alive afterward.
- When the owned child exits mid-session, pending work rejects with the safe `codex-unavailable` category, subsequent requests keep rejecting against the dead connection rather than half-working, and no upstream stderr or payload text reaches the error surface.

Invariants: at most one owned child exists per application instance; shutdown is idempotent; every rejection crosses the IPC boundary as a closed category, never raw process detail.

## 2. Failure isolation across sections

One endpoint's failure never erases unrelated valid sections. The normalizer preserves partial results with explicit `isPartial` marking, missing/null/unknown fields stay distinct from zero, and renderer state distinguishes fresh, stale, partial, unavailable, and failed so a quota failure cannot blank usage data or vice versa. Evidence lives in the fixture catalog (`tests/integration/fixture-catalog.test.ts`) and normalization unit suites.

Timeout, malformed, oversized, method-not-found, duplicate-response, and slow-response behaviors are exercised through checked-in fixture scenarios over the real transport rather than mocked transports.

## 3. Bounded resources under repeated use

| Resource | Bound | Evidence |
| --- | --- | --- |
| ECharts chart instances | Exactly one while Usage is mounted; zero after leaving | `tests/e2e/resilience.spec.ts` route-churn sweep (four Overview↔Usage rounds) |
| Browser windows | One for the application lifetime, including after refresh storms | Same suite, asserted after five consecutive refreshes |
| Loading spinner | Unmounts with loading state; animation contract confined to one keyframe | `src/renderer/design-tokens.test.ts` motion cases |
| Clock interval | Cleared on unmount; thirty-second cadence | `src/renderer/hooks.ts` cleanup plus component suites |
| Bridge subscriptions | Duplicate listeners prevented; unsubscribe guaranteed | Preload boundary unit suites |
| In-flight queries | Deduplicated; cancelled on timeout; backoff with restart limits | Adapter integration suites (`tests/integration/codex-process-client.test.ts`, `tests/integration/codex-app-server-fixture.test.ts`) |

## 4. Clocks and time zones

- Snapshot instants are stored as exact timestamps; presentation formats through UTC-noon anchoring so calendar dates cannot shift across zone boundaries.
- A timezone change between sessions re-renders the same fixture instant differently (observed thirteen hours apart) while persisted state stays intact: `tests/e2e/timezone.spec.ts`.
- In-session timezone changes are handled by the same render-safe clock hook; classification uses sampled wall-clock state rather than impure reads during rendering.

## 5. Restart, persistence, and data lifetime

- Preferences persist per profile and survive application restarts; live-applied theme changes re-read correctly after relaunch (`tests/e2e/preferences.spec.ts`).
- Usage snapshots, session deltas, and diagnostics previews remain memory-only; clearing data deletes only Token Trail-owned files and adopts returned defaults immediately (see [preferences-and-storage.md](preferences-and-storage.md) and [diagnostics-and-redaction.md](diagnostics-and-redaction.md)).

## 6. Offline and network posture

The application has no network client code: the renderer cannot fetch under CSP, main speaks only stdio to the owned Codex child, and there are no update checks or telemetry endpoints. "Offline" is therefore the steady state, not an error path; Codex unavailability surfaces through the signed-out/unavailable/failed states documented in the error taxonomy. Structural evidence: the token-contract suite forbids remote references in styling, the CSP suite pins script/style sources, and the data-flow document inventories every byte path.

## 7. Security and privacy boundaries

Resilience work adds no capability: termination targets stay inside the owned handle tree, safe categories prevent process details from reaching the renderer, and all observations in this document came from read-only inspection plus normal user input against checked-in fixtures.

## 8. Test evidence map

- `tests/integration/codex-process-client.test.ts`: timeout/cancel, mid-session exit category, decoy-survival termination ownership.
- `tests/integration/codex-app-server-fixture.test.ts` and `tests/integration/fixture-catalog.test.ts`: malformed, oversized, unknown fields, sparse updates, duplicate responses, missing account, unsupported methods.
- `tests/e2e/resilience.spec.ts`: resource bounds under churn and refresh storms.
- `tests/e2e/timezone.spec.ts`: cross-zone presentation without corruption.
- `tests/e2e/preferences.spec.ts`: persistence across restarts.
- `src/renderer/design-tokens.test.ts`: motion bounds.

## 9. Known limitations

- True suspend/resume, display hot-plug, multi-day idle soak, and compositor-driven window events are not reproducible in this repository's automation; they are scheduled as Phase 6 soak-campaign and manual evidence and must not be claimed as tested until recorded there.
- Repeated-restart coverage currently spans two launches sharing a profile; longer restart sequences join the soak campaign.
