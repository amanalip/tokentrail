# Repository review: September 7, 2026

Baseline: `dd137a011019a1fe7a4ba791651f8a78c89eeef2` (main, version 1.0.0).

This is a documentation-only review. No application fixes are included. Findings distinguish code-supported bugs from improvement opportunities; suggested tests are acceptance criteria, not claims that those tests already ran. Line references refer to the baseline. This is a broad review, not a guarantee that every possible defect has been discovered.

Priorities: **P1** = crash, serious lifecycle/data correctness issue; **P2** = functional/reliability defect; **P3** = smaller correctness or maintainability issue. Verification evidence and coverage are recorded at the end as the review progresses.

## Bug fix status

Last reconciled: September 8, 2026. **36 fixed, 4 open, 40 total.**

This table tracks current implementation status. The original findings below describe the review baseline; their evidence/status bullets are historical. **Fixed** means a source fix was committed with the verification recorded below and in the fix-progress section, not that every environment or manual workflow has been tested. Existing desktop, packaging, installation, and assistive-technology validation limits still apply.

Update the affected row whenever a bug is worked on: use **Open**, **In progress**, **Fixed**, or **Reopened**; record the fix commit and actual verification evidence before marking it Fixed. Keep the totals, reconciliation date, fix-progress notes, and remaining-work list consistent. A reopened bug must be included in the release-blocking open work.

| Bug | Priority | Finding | Status | Fix commit(s) | Verification / remaining work |
| --- | --- | --- | --- | --- | --- |
| BUG-001 | P1 | Child stdin errors can escape as uncaught stream errors | Fixed | `fa28ecf` | Sanitized pipe-error rejection; transport regression. |
| BUG-002 | P1 | Stop during executable discovery can still spawn an unowned child | Fixed | `fa28ecf` | Deferred discovery shutdown and concurrent-start regressions. |
| BUG-003 | P2 | Shutdown gives up ownership before confirming child termination | Fixed | `fa28ecf` | Owned-child escalation and exit-cancellation regressions. |
| BUG-004 | P2 | Valid framed messages can exceed the aggregate-buffer check | Fixed | `fa28ecf` | Per-line bounds tested across chunk partitions. |
| BUG-005 | P2 | Notifications received during refresh do not schedule a follow-up read | Fixed | `e40db5d` | Coalesced follow-up notification-read regression. |
| BUG-006 | P2 | Quota session deltas disappear permanently after a reset | Fixed | `e40db5d` | Post-reset deltas and repeated-reset regression. |
| BUG-007 | P2 | Session observations survive an explicit sign-out boundary | Fixed | `e40db5d` | Sign-out resets observations. Same-kind switches without visible sign-out remain unidentifiable. |
| BUG-008 | P3 | Protocol client advertises an obsolete application version | Fixed | `fa28ecf` | Handshake version checked against the manifest. |
| BUG-009 | P1 | A tiny sparse usage response can allocate millions of dates | Fixed | `476dc4b` | Bounded sparse coverage and 366-cell heatmap regressions. |
| BUG-010 | P2 | Positive safe timestamps can still crash date formatting | Fixed | `476dc4b` | Timestamp normalization and formatter boundary regressions. |
| BUG-011 | P2 | Metadata accepted by protocol schemas can reject the whole public snapshot | Fixed | `476dc4b` | Oversized metadata preserves usable quota values. |
| BUG-012 | P2 | A standalone spending-control reached flag is discarded | Fixed | `476dc4b` | Reached-state regressions with absent, null, and empty controls. |
| BUG-013 | P2 | Empty credit fields in one bucket hide usable credits in later buckets | Fixed | `476dc4b` | Empty-first-bucket and independent credit-field regression. |
| BUG-014 | P2 | Duplicate-date ambiguity does not disable affected comparisons | Fixed | `476dc4b` | Duplicates excluded; both comparison periods tested. |
| BUG-015 | P2 | Missing days do not mark the usage section partial | Fixed | `476dc4b` | Gapped dates now classify usage as partial. |
| BUG-016 | P2 | Automatic refresh preferences have no implementation | Fixed | `ec6e8d4` | Timer enable, interval change, disable, and shutdown regression. |
| BUG-017 | P2 | Falling usage displays “Unavailable tokens” instead of its signed difference | Fixed | `10e979f` | Signed counter-formatting regression. |
| BUG-018 | P2 | UTC-noon date formatting shifts bucket labels in UTC+12 and later zones | Fixed | `10e979f` | Calendar-label regressions across extreme timezones. |
| BUG-019 | P2 | Stale-data warnings exist only on Overview | Fixed | `10e979f` | Shared stale warning added for the other data routes; core suite passed. |
| BUG-020 | P2 | Initial snapshot reads can overwrite a newer pushed snapshot | Fixed | `ec6e8d4` | Deferred initial and refresh replies cannot overwrite pushed data. |
| BUG-021 | P2 | Oversized chart values silently become the same false tooltip value | Fixed | `10e979f` | Exact oversized tooltip regression; capped geometry disclosed. |
| BUG-022 | P2 | The daily chart does not resize with its container | Fixed | `10e979f` | Resize observer and chart-disposal regression. |
| BUG-023 | P3 | Time-format preference is ignored on Credits and Diagnostics | Fixed | `10e979f` | Credits and Diagnostics receive the time preference; core suite passed. |
| BUG-024 | P2 | Rapid edits to different preferences lose earlier changes | Fixed | `ec6e8d4` | Rapid edits persist in order; failed saves roll back. |
| BUG-025 | P2 | Bridge failures are not converted into visible workflow errors | Fixed | `ec6e8d4` | Sanitized workflow errors and snapshot/save retry regressions; core suite passed. |
| BUG-026 | P2 | Concurrent first preference loads can quarantine a valid replacement | Fixed | `ec6e8d4` | Concurrent initialization and queued-save regression. |
| BUG-027 | P2 | Read failures are treated as corruption and may overwrite recoverable preferences | Fixed | `ec6e8d4` | Read and quarantine failure preservation/recovery regressions. |
| BUG-028 | P3 | Clear-data copy promises deletion but the store recreates preferences | Fixed | `ec6e8d4` | Clear-data file-inventory and cached-defaults regression. |
| BUG-029 | P2 | Diagnostics count snapshot phases as separate attempts and miss failures | Fixed | `ec6e8d4` | Actual controller completion counts tested with identical timestamps. |
| BUG-030 | P2 | Diagnostic capability and discovery claims are fabricated from UI state | Fixed | `196113c`, `99e34cd`, `5b695a2`, `3fc4d3a` | Unknown, missing, unsupported, and empty-data cases tested; CLI version remains unknown. |
| BUG-031 | P2 | Development readiness can accept old bundles and launch after shutdown | Open | Pending | Pending: current-run build readiness and shutdown/startup race checks. |
| BUG-032 | P2 | The release-notes parser includes subsequent version sections | Fixed | `9ade471` | Three isolated script integration cases verify section boundaries. |
| BUG-033 | P2 | Package-content inspection misses files outside app.asar | Open | Pending | Pending: recursive and extracted package-payload inspection. |
| BUG-034 | P3 | Provenance records arbitrary matching files and loses the npm version in CI | Open | Pending | Pending: exact artifact inventory and explicit npm-version capture. |
| BUG-035 | P2 | Negative percentage changes are formatted as malformed decimal strings | Fixed | `10e979f` | Negative whole, fractional, halfway, and rounded-zero regressions. |
| BUG-036 | P2 | Website copy buttons report success when copying fails or is unavailable | Fixed | `2d737d0` | Confirmed writes alone show success; four script tests cover success, rejection, missing API, and synchronous failure. |
| BUG-037 | P3 | Website menu's accessible label stays “Close menu” after closing | Fixed | `5797011` | Script regression verifies toggle, link, and Escape closes, including Escape focus restoration. |
| BUG-038 | P2 | Advertised usage date-range controls are absent | Open | Pending | Pending: usage range controls or corrected scope claims. |
| BUG-039 | P2 | Searching after a Learn deep link steals focus after each matching keystroke | Fixed | `10e979f` | Multi-character search retains focus after a deep link. |
| BUG-040 | P3 | Learn navigation forces smooth scrolling despite reduced-motion preferences | Fixed | `10e979f` | Reduced-motion navigation regression; no compositor validation claimed. |

Improvement opportunities (`IMP-*`) are tracked separately in the original findings and fix-progress notes; they are not included in the 40-bug totals.

## Process transport and controller

### BUG-001: P1: Child stdin errors can escape as uncaught stream errors

- **Evidence:** `src/main/codex/codex-process-client.ts:189-204,361` installs an error handler on the child process, but none on `child.stdin`; writes have no callback.
- **Trigger/impact:** An app-server that closes its input while remaining alive can make a subsequent write emit an asynchronous `EPIPE` error on stdin. The surrounding synchronous try/catch in `request()` cannot catch that event. An unhandled stream error can terminate the Electron main process.
- **Improvement/verification:** Handle stdin errors through the sanitized connection-failure path. Exercise a fixture that closes fd 0 before an approved request and assert safe rejection without an uncaught exception.
- **Status:** Code-supported; crash fixture not yet executed.

### BUG-002: P1: Stop during executable discovery can still spawn an unowned child

- **Evidence:** `src/main/codex/codex-process-client.ts:168-189` checks stopped state before awaiting executable resolution, then spawns without rechecking. `stop()` sets the stopped flag and clears the child reference.
- **Trigger/impact:** Stop the client while filesystem-based PATH discovery is pending. Discovery resumes and spawns a child despite shutdown; the initialization request rejects because the client is stopped, while subsequent `stop()` calls return immediately. The child can survive without normal cleanup.
- **Improvement/verification:** Recheck lifecycle state after asynchronous discovery and before spawn. Add a controlled delayed-discovery shutdown test that verifies no child starts after stop.
- **Status:** Code-supported race; not dynamically reproduced.

### BUG-003: P2: Shutdown gives up ownership before confirming child termination

- **Evidence:** `src/main/codex/codex-process-client.ts:317-340,462-483` sends SIGTERM and immediately clears the handle; there is no exit wait or bounded escalation.
- **Trigger/impact:** A hung or SIGTERM-ignoring app-server remains running after stop/failure. Repeated refresh recovery can create additional surviving processes.
- **Improvement/verification:** Retain ownership until exit, use a bounded termination policy, and verify shutdown with a fixture that ignores SIGTERM.
- **Status:** Code-supported; hostile-shutdown fixture not executed.

### BUG-004: P2: Valid framed messages can exceed the aggregate-buffer check

- **Evidence:** `src/main/codex/codex-process-client.ts:364-400` checks the entire accumulated buffer against one message's limit before extracting newline-delimited messages.
- **Trigger/impact:** A near-limit partial line followed by a chunk containing its end and another valid message is rejected even though every individual line is within the configured maximum. Failure depends on stream chunk boundaries.
- **Improvement/verification:** Apply the limit per complete line and to the remaining incomplete line. Test the same valid NDJSON sequence across multiple chunk partitions, including a near-limit line followed immediately by a notification.
- **Status:** Code-supported framing defect.

### BUG-005: P2: Notifications received during refresh do not schedule a follow-up read

- **Evidence:** `src/main/overview/overview-controller.ts:132-134,331-337` routes notifications to `refresh()`, which returns the current in-flight promise without recording pending work.
- **Trigger/impact:** A rate-limit update arrives after the refresh has already fetched rate limits but while usage is pending. Its requested refresh is absorbed, and the older quota response is published without another read.
- **Improvement/verification:** Track a pending refresh trigger and perform one coalesced follow-up. Inject the notification between the rate-limit response and usage response, then verify a fresh quota read occurs.
- **Status:** Code-supported ordering defect.

### BUG-006: P2: Quota session deltas disappear permanently after a reset

- **Evidence:** `src/main/overview/overview-controller.ts:375-394` calls its operation a rebase but removes transitioned windows from the baseline. `src/shared/domain/session-deltas.ts:42-49` skips windows absent from that baseline.
- **Trigger/impact:** Observe a reset timestamp change, then two later snapshots in the new window. No further delta or reset transition can be generated for that window during the process lifetime.
- **Improvement/verification:** Replace the transitioned baseline window with the new observed window, preserving the intended session-start metadata. Verify changes and a second reset after the first transition.
- **Status:** Reproduced with the actual controller and an injected client: one reset transition was observed, then the next snapshot produced zero quota deltas for the removed window.

### BUG-007: P2: Session observations survive an explicit sign-out boundary

- **Evidence:** `src/main/overview/overview-controller.ts:211-222,354-398` publishes signed-out state without clearing `#sessionBaseline` or `#validSnapshotCount`; future signed-in snapshots compare against the old baseline. `src/shared/domain/session-deltas.ts` matches quota bucket/window identities and lifetime counters, not account identity.
- **Trigger/impact:** Account A is observed, signs out, and account B signs in while Token Trail stays open. B's counters/quotas can be presented as changes since A's baseline when identifiers overlap.
- **Improvement/verification:** Clear observations on explicit sign-out and define a safe account-change policy. Test A → signed out → B with overlapping bucket IDs and increasing counters.
- **Status:** Code-supported; account switching without a visible sign-out also needs a defined identity strategy.

### BUG-008: P3: Protocol client advertises an obsolete application version

- **Evidence:** `src/main/codex/codex-process-client.ts:215` hardcodes client version `0.2.0`, while `package.json` declares `1.0.0`.
- **Impact:** Upstream compatibility diagnostics identify the wrong application release.
- **Improvement/verification:** Supply the build's application version from one authoritative source and assert that the initialization request agrees with the manifest.
- **Status:** Confirmed source mismatch.

## Review setup

- Initial working tree was clean; review started on `main`.
- Environment: Node.js 24.20.0, npm 12.0.2.
- Final executed checks and review limits are recorded at the end of this document.

## Normalization and calculations

### BUG-009: P1: A tiny sparse usage response can allocate millions of dates

- **Evidence:** `src/shared/domain/calendar-date.ts:47-48` accepts years 1000–9999. `src/shared/domain/usage-calculations.ts:89-95` enumerates the entire first-to-last span before truncating missing dates to 64. `src/renderer/routes/UsageRoute.tsx:581-624` independently enumerates and renders that entire span.
- **Trigger/impact:** Two valid buckets dated `1000-01-01` and `9999-12-31` pass input checks, then produce over three million date keys in main and potentially millions of DOM cells in the renderer. The 366-record input cap does not bound the date span. A malformed source response can freeze the application or exhaust memory.
- **Improvement/verification:** Bound span processing and visible heatmap dates before allocation; compute missing-count/truncation metadata without expanding the full range. Test distant endpoints with bounded time and output size.
- **Status:** Code-supported resource amplification; extreme DOM rendering deliberately not executed.

### BUG-010: P2: Positive safe timestamps can still crash date formatting

- **Evidence:** `src/main/codex/normalize-overview.ts:85-91` and `src/main/codex/normalize-usage.ts` accept any positive safe integer seconds. `src/renderer/formatting.ts:49-59` multiplies by 1000 and calls `Intl.DateTimeFormat.format` without checking Date validity. The credit schemas also accept these values.
- **Trigger/impact:** `Number.MAX_SAFE_INTEGER` seconds is valid under normalization but outside JavaScript Date's range. Rendering it throws `RangeError`; there is no application error boundary in `src/renderer/App.tsx` to contain the failed route.
- **Improvement/verification:** Reject timestamps outside the supported date range at normalization and guard formatters. Test quota resets, spending-control resets, and credit expiries at and beyond the supported boundary.
- **Status:** Reproduced against the actual formatter: `formatResetTime(Number.MAX_SAFE_INTEGER)` throws `RangeError`.

### BUG-011: P2: Metadata accepted by protocol schemas can reject the whole public snapshot

- **Evidence:** `src/main/codex/protocol-schemas.ts:8-11` permits metadata strings up to 512 characters. `src/main/codex/normalize-overview.ts` copies IDs, names, and plans through; `src/shared/contracts/overview-snapshot.ts:39-43,80` limits IDs/names to 128 and plans to 64, with nonempty constraints.
- **Trigger/impact:** A 129-character quota label, 65-character plan, or empty plan passes the upstream schema and then makes the public snapshot parse fail. Valid quota and usage values are discarded and the connection is restarted for a display-label problem.
- **Improvement/verification:** Normalize each display field to the destination contract with safe fallback/unavailable behavior. Exercise oversized and empty metadata while asserting useful values survive.
- **Status:** Reproduced against the actual normalizer and snapshot builder with a 129-character quota label: public snapshot construction throws `ZodError`.

### BUG-012: P2: A standalone spending-control reached flag is discarded

- **Evidence:** `src/main/codex/normalize-usage.ts:281-284` applies `spendControlReached === true` only when `normalizeSpendingControl(individualLimit)` returned a non-null control.
- **Trigger/impact:** A response containing `spendControlReached: true` and no usable `individualLimit` produces no reached control. The Credits route can say “None reported” or show no credit information despite an explicit reached signal.
- **Improvement/verification:** Represent the reported reached state independently of optional amounts and percentages. Test true with absent, null, and empty individual-limit objects.
- **Status:** Reproduced against the actual normalizer: a standalone true flag produced an unavailable credit section with null spending control.

### BUG-013: P2: Empty credit fields in one bucket hide usable credits in later buckets

- **Evidence:** `src/main/codex/normalize-usage.ts:246-261` selects the first snapshot with a credit-related property that is not undefined and breaks before checking whether the field is usable.
- **Trigger/impact:** First keyed bucket has `credits: null` or `spendControlReached: false`, while a later bucket/fallback has a valid balance. The normalized result loses the valid balance.
- **Improvement/verification:** Define precedence over usable fields and preserve compatible independently reported credit fields. Test empty first bucket followed by a balance/control-bearing bucket.
- **Status:** Reproduced against the actual normalizer: null credits in the first keyed bucket hid a later balance of `25`.

### BUG-014: P2: Duplicate-date ambiguity does not disable affected comparisons

- **Evidence:** `src/main/codex/normalize-usage.ts:55-59,93-99` claims duplicate rejections make affected comparisons unavailable, but keeps the first row. `src/renderer/routes/UsageRoute.tsx:129-132` passes only accepted days to `computePeriodComparison`; that function never sees rejected-date metadata.
- **Trigger/impact:** Supply 14 consecutive days plus a conflicting duplicate within the compared range. The section becomes partial, yet still publishes a complete comparison based on whichever duplicate appeared first.
- **Improvement/verification:** Track ambiguous dates or exclude them from completeness checks. Test conflicting duplicates in both periods and verify the affected comparison is unavailable.
- **Status:** Reproduced against the actual normalizer and comparison function: 14 consecutive dates plus one conflicting duplicate yielded rejection count 1 and comparison available true.

### BUG-015: P2: Missing days do not mark the usage section partial

- **Evidence:** `src/main/codex/normalize-usage.ts:123-142` computes coverage but chooses ready/partial using only rejected records and whether any buckets exist.
- **Trigger/impact:** Valid buckets for Monday and Wednesday with Tuesday absent produce nonempty `coverage.missingDates` but `usage.state: ready`. The incomplete-source banner is absent despite a known hole in the supplied span.
- **Improvement/verification:** Include missing-date coverage in completeness classification, or explicitly revise the UI meaning of ready. Test gapped dates without malformed records.
- **Status:** Reproduced against the actual normalizer: August 1 and August 3 yielded state ready with August 2 listed as missing.

## Renderer and user workflows

### BUG-016: P2: Automatic refresh preferences have no implementation

- **Evidence:** `src/renderer/routes/SettingsDiagnosticsRoute.tsx:140-178` exposes enabled/interval controls. Repository-wide searches for `automaticRefreshEnabled` and `refreshIntervalMinutes` find storage, schemas, diagnostics, and tests, but no scheduler consuming them. The only renderer interval updates a display clock.
- **Trigger/impact:** Enable automatic refresh, choose an interval, and wait. No periodic account/usage refresh is scheduled. Persisted settings imply a working feature that does nothing.
- **Improvement/verification:** Implement the bounded lifecycle-aware scheduler or disable the controls with honest availability text until it exists. Verify enabling, interval changes, disabling, and shutdown with a fake clock.
- **Status:** Confirmed missing implementation from source-wide search.

### BUG-017: P2: Falling usage displays “Unavailable tokens” instead of its signed difference

- **Evidence:** `src/renderer/routes/UsageRoute.tsx:431-437` passes signed `absoluteDifference` into `formatCounter`. `src/renderer/formatting.ts:129-134` delegates to a nonnegative counter parser.
- **Trigger/impact:** Latest period is 70 tokens below the preceding period. `formatCounter('-70')` returns `Unavailable`, even though the underlying signed difference is valid. Relative-change formatting has a separate defect recorded in BUG-035.
- **Improvement/verification:** Format signed differences separately from nonnegative reported counters. Test rising, falling, and unchanged period totals in the rendered comparison.
- **Status:** Formatter result reproduced directly against source.

### BUG-018: P2: UTC-noon date formatting shifts bucket labels in UTC+12 and later zones

- **Evidence:** `src/renderer/routes/UsageRoute.tsx:554-563` creates a UTC-noon Date but formats it without a fixed timezone.
- **Trigger/impact:** In `Pacific/Kiritimati`, source key `2026-09-07` displays as September 8. Tables, chart labels, comparisons, coverage labels, and heatmap descriptions can name the wrong calendar day. Noon does not protect against all timezone offsets.
- **Improvement/verification:** Format plain calendar keys with an explicit UTC timezone or a date-only formatter. Include UTC+12, UTC+14, negative offsets, and daylight-saving zones in route tests.
- **Status:** Identical Intl expression reproduced with `TZ=Pacific/Kiritimati`; output was `Sep 8, 2026`.

### BUG-019: P2: Stale-data warnings exist only on Overview

- **Evidence:** `src/renderer/App.tsx` renders sibling routes without a shared freshness banner. `UsageRoute`, `QuotaWindowsRoute`, and `CreditsRoute` do not check `snapshot.state === 'stale'`; only `OverviewRoute` renders the stale alert.
- **Trigger/impact:** Refresh successfully, fail a later refresh, then open Usage, Quota Windows, or Credits. Preserved historical values are shown without the warning or failed-refresh context visible on Overview.
- **Improvement/verification:** Put freshness context in the shared shell or each data route. Test navigation among all data routes with a stale snapshot and retained values.
- **Status:** Code-supported presentation omission.

### BUG-020: P2: Initial snapshot reads can overwrite a newer pushed snapshot

- **Evidence:** `src/renderer/hooks.ts:35-46` subscribes first, then unconditionally adopts the eventual `getOverviewSnapshot()` result. There is no revision comparison or guard recording whether a push arrived after the read started.
- **Trigger/impact:** Delay the initial read's promise, deliver a newer snapshot through the subscription, then resolve the old read. The UI rolls back to older data and can stay there until another update.
- **Improvement/verification:** Order snapshots by a monotonic revision or ignore an obsolete initial response after a newer event. Test deferred IPC resolution with an intervening pushed snapshot.
- **Status:** Code-supported ordering risk; deferred-bridge reproduction is a proposed check. This entry replaces a withdrawn countdown finding after confirming that Overview already subscribes to a display timer.

### BUG-021: P2: Oversized chart values silently become the same false tooltip value

- **Evidence:** `src/renderer/routes/UsageRoute.tsx:34-40,92-120` clamps every counter above `Number.MAX_SAFE_INTEGER` to that maximum and supplies those values to the default chart tooltip. The promised clamping note is absent from rendered copy.
- **Trigger/impact:** Different huge exact counters appear as equal-height bars and tooltips show 9,007,199,254,740,991 instead of the source totals. The exact table remains available, but the chart presents its approximation as factual.
- **Improvement/verification:** Use exact source strings in tooltips and visibly explain or avoid capped geometry. Verify two distinct oversized values using the huge-counter fixture.
- **Status:** Code-supported chart accuracy defect.

### BUG-022: P2: The daily chart does not resize with its container

- **Evidence:** `src/renderer/routes/UsageRoute.tsx:522-537` initializes/disposes ECharts on option changes but registers neither a resize observer nor a window resize handler and never calls `instance.resize()`.
- **Trigger/impact:** Resize the desktop window or cross a responsive layout breakpoint while Usage remains open. The container changes width but the SVG chart retains its initialization dimensions, leaving clipping or unused space until remount/update.
- **Improvement/verification:** Observe container size and resize the owned chart with cleanup. Assert SVG dimensions after narrowing and widening the same mounted chart.
- **Status:** Code-supported missing chart lifecycle step; live resize not yet executed.

### BUG-023: P3: Time-format preference is ignored on Credits and Diagnostics

- **Evidence:** `src/renderer/App.tsx` passes only `snapshot` to Credits. `src/renderer/routes/CreditsRoute.tsx` calls `formatResetTime` with its default system format; `SettingsDiagnosticsRoute.tsx` similarly omits the preference when formatting last refresh.
- **Trigger/impact:** Choose 24-hour time on a system using 12-hour time. Overview/Quota Windows follow the preference while Credits and Diagnostics continue using the system default.
- **Improvement/verification:** Pass the shared preference to every timestamp formatter. Test all routes under an explicit format opposite to the system default.
- **Status:** Confirmed inconsistent formatter arguments.

### IMP-001: P3: Replace internal explanation keys and ambiguous summary labels with user copy

- **Evidence:** `src/renderer/routes/UsageRoute.tsx:278-306,404-410` renders keys such as `statistics-total-exact-sum` directly in summary cards. The card labeled “Peak supplied day” uses upstream `summary.peakDailyTokens`, while a separate statistic calculates the actual highest supplied day. `longestStreakDays` is normalized but never displayed.
- **Impact:** Users see implementation identifiers and can mistake a reported historical peak for the highest day in the visible range; one available summary field is unused.
- **Improvement/verification:** Map explanations to readable copy, distinguish reported peak from calculated range peak, and decide whether to expose longest streak. Review with a fixture whose reported peak exceeds every supplied day.
- **Status:** Improvement opportunity based on rendered source.

## Preferences, diagnostics, and error recovery

### BUG-024: P2: Rapid edits to different preferences lose earlier changes

- **Evidence:** `src/renderer/hooks.ts:124-126` updates local preferences only after persistence resolves. Settings controls spread the current `preferences` object into each full replacement, for example `SettingsDiagnosticsRoute.tsx:100,118,133`.
- **Trigger/impact:** With a slow save, choose Dark and immediately choose reduced motion. Both requests use the old preference object; the second replacement restores the old theme. The filesystem write queue serializes stale documents but does not merge their changes.
- **Improvement/verification:** Serialize edits against the latest intended state or apply optimistic, rollback-aware updates. Test two distinct field edits before resolving the first bridge promise and verify both persist.
- **Status:** Code-supported lost-update race.

### BUG-025: P2: Bridge failures are not converted into visible workflow errors

- **Evidence:** `src/renderer/hooks.ts:44-46,60-64,115-117,124-126` lacks rejection handling for load/save/refresh operations. `src/renderer/routes/SettingsDiagnosticsRoute.tsx:36-60` also awaits clear/preview/export without catches, while click handlers discard the promises with `void`.
- **Trigger/impact:** Deny preference writes, fail a diagnostics preview, or reject IPC during startup. The renderer produces unhandled promise rejections and either remains at defaults/loading or leaves the workflow without a useful failure message. `dialog.showSaveDialog` is outside the catch in `src/main/ipc/application-ipc.ts` as well.
- **Improvement/verification:** Handle each failure with sanitized user feedback and retry/busy state while preserving the last confirmed state. Mock rejected bridge promises and verify recovery on the next successful attempt.
- **Status:** Code-supported error-path omission.

### BUG-026: P2: Concurrent first preference loads can quarantine a valid replacement

- **Evidence:** `src/main/preferences/preference-store.ts:72-94` caches only completed reads and has no shared in-flight load promise. Each failed read independently quarantines the path and enqueues a default save. Renderer startup and diagnostics can both call `load()`.
- **Trigger/impact:** Two initial reads observe a missing file; one writes defaults (or is followed by a user save) before the other's catch renames the live path. The second load can quarantine a newly valid file and replace it with defaults. Concurrent successful reads can likewise race later saves when updating the cache.
- **Improvement/verification:** Deduplicate initial load and coordinate it with the write queue. Use a filesystem seam to delay the second read failure until after the first save; ensure only one initialization occurs and later edits survive.
- **Status:** Code-supported concurrency risk; controlled filesystem reproduction proposed.

### BUG-027: P2: Read failures are treated as corruption and may overwrite recoverable preferences

- **Evidence:** `src/main/preferences/preference-store.ts:77-94,131-139` uses one catch for read I/O failure, JSON failure, and schema failure, attempts quarantine, ignores any rename failure, then saves defaults.
- **Trigger/impact:** An existing file cannot be read temporarily but its directory permits replacement. Even though its contents have not been proved corrupt, the load path can replace valid settings with defaults. A failed quarantine does not stop the overwrite.
- **Improvement/verification:** Distinguish absence, content corruption, and transient/access errors; preserve files when quarantine fails. Test read failure and failed rename against an existing valid document.
- **Status:** Code-supported destructive recovery policy.

### BUG-028: P3: Clear-data copy promises deletion but the store recreates preferences

- **Evidence:** `src/renderer/routes/SettingsDiagnosticsRoute.tsx:198-199` says clearing deletes the preferences document. `src/main/preferences/preference-store.ts:147-172` removes it and immediately writes a new default document; related renderer comments claim it is not recreated.
- **Trigger/impact:** A user clears application data and still has a preferences file on disk. Actual behavior is reset-to-defaults, not the deletion described in the confirmation.
- **Improvement/verification:** Align the operation and copy around one explicit contract; if retaining a default file is intended, call the action a reset and describe it accurately. Verify the resulting owned file inventory.
- **Status:** Confirmed implementation/copy mismatch, not a claim that usage data is persisted.

### BUG-029: P2: Diagnostics count snapshot phases as separate attempts and miss failures

- **Evidence:** `src/main/diagnostics/health-record.ts:34-57` counts every new `refreshAttemptedAt` and classifies immediately. The controller broadcasts loading or preserved ready state at attempt start, then success with completion time; failures reuse the attempt-start time.
- **Trigger/impact:** One initial successful refresh can count as two attempts (loading/no-data plus success). A failed refresh after ready can be counted as success at its start, while the stale completion is ignored because its timestamp matches. Diagnostic health totals and last outcome are therefore misleading.
- **Improvement/verification:** Observe explicit attempt-start/completion events with a stable attempt ID, or classify terminal states separately from start markers. Connect the actual controller to the recorder in tests for startup success, subsequent success, and failure.
- **Status:** Reproduced with the actual controller connected to the recorder: the first successful refresh counted two attempts; after a later failed refresh, failure count remained zero and last outcome remained succeeded.

### BUG-030: P2: Diagnostic capability and discovery claims are fabricated from UI state

- **Evidence:** `src/main/index.ts:223-234` sets discovery to `snapshot.state !== 'unavailable'`, always lists all three reads as supported, always leaves unsupported capabilities empty, and always reports a null Codex version.
- **Trigger/impact:** Before discovery completes, loading is reported as discovered. A discovered server returning no data is reported as not discovered. A rejected usage method is still declared supported, hiding the exact compatibility problem diagnostics should explain.
- **Improvement/verification:** Feed observed adapter discovery/handshake/method outcomes into diagnostics; use unknown when not observed. Test startup, missing executable, no-data, and method-not-found separately.
- **Status:** Confirmed hardcoded/inferred diagnostic facts.

### IMP-002: P2: Tighten IPC authorization to the active application window and runtime mode

- **Evidence:** `src/main/security/ipc-sender.ts:27-40` accepts both production and development roots unconditionally. IPC installers check URL and top-level frame status, but not the owning BrowserWindow/webContents identity or packaged mode.
- **Impact:** The helper's comment promises a development exception only during unpackaged development, but its implementation is broader. Current navigation restrictions reduce exposure; this review does not establish a reachable external exploit.
- **Improvement/verification:** Bind handlers to the actual application webContents and approved URL for its runtime mode. Add negative tests for a different top-level webContents and the development origin in packaged mode.
- **Status:** Defense-in-depth improvement, not a demonstrated authorization bypass.

### IMP-003: P3: Give clear-data confirmation complete keyboard and busy-state behavior

- **Evidence:** `src/renderer/routes/SettingsDiagnosticsRoute.tsx:194-218` creates an `alertdialog` without focus management, Escape handling, or pending-operation disabling.
- **Impact:** Keyboard focus can be lost when the initiating button is replaced, and repeated confirmation clicks can enqueue multiple clears while I/O is pending.
- **Improvement/verification:** Move focus deliberately into the confirmation, restore it on cancel/completion, provide Escape cancellation, and disable repeated submission while clearing. Verify a complete keyboard-only workflow.
- **Status:** Accessibility/reliability improvement based on component structure; assistive-technology interaction not executed.

## Build, release, and verification tooling

### BUG-031: P2: Development readiness can accept old bundles and launch after shutdown

- **Evidence:** `scripts/dev.mjs:70-86,172-210` waits for output-file existence without requiring a build from the current run. It also launches Electron after the readiness promises resolve without rechecking `isShuttingDown`.
- **Trigger/impact:** Keep old `dist/main/index.cjs` and preload output, then restart development while a new build is slow or broken. Existing files satisfy readiness and Electron can execute old code. If a service exits during readiness, shutdown can signal the existing children and the resumed startup can still create a new Electron process afterward.
- **Improvement/verification:** Use current-build completion signals and check shutdown state immediately before launch. Test stale outputs, compilation failure, and a service exit while waiting for renderer readiness.
- **Status:** Code-supported startup races.

### BUG-032: P2: The release-notes parser includes subsequent version sections

- **Evidence:** `scripts/write-release-notes.mjs:99-105` searches the remaining changelog with `/^## /` without multiline mode, starting immediately after the current heading. It therefore fails to locate the next section and uses end-of-file as the boundary.
- **Trigger/impact:** Add another `##` version section to the currently single-version changelog. Notes for the earlier selected section include every following release, misattributing historical changes to the selected version.
- **Improvement/verification:** Determine boundaries from consecutive heading matches or a multiline next-heading search. Test a changelog with Unreleased and at least two releases, asserting exact section isolation.
- **Status:** Reproduced using the actual extracted parser with an injected two-version changelog: the selected 2.0.0 body included the subsequent 1.0.0 heading and old change. Normal generation with the current one-version changelog also passed.

### BUG-033: P2: Package-content inspection misses files outside app.asar

- **Evidence:** `scripts/verify-package-contents.mjs` allowlists only top-level unpacked entries, then inspects `resources/app.asar`. It does not recursively inventory `resources/`, `locales/`, or `app.asar.unpacked`; distributable packages are searched as compressed raw bytes instead of extracted payloads.
- **Trigger/impact:** An unexpected file in `resources/` alongside the ASAR is not rejected. A credential marker present only inside compressed package content is not reliably detectable by the raw-byte search. The final claim that only reviewed runtime files shipped is stronger than the inspection.
- **Improvement/verification:** Recursively validate application-owned package payloads, including unpacked resources, and inspect extracted format contents. Use synthetic canary files outside ASAR and inside a compressed payload to prove the gate catches both.
- **Status:** Code-supported coverage gap; no real credential was introduced or searched for in personal data.

### BUG-034: P3: Provenance records arbitrary matching files and loses the npm version in CI

- **Evidence:** `scripts/write-build-provenance.mjs:50-73` hashes every file starting with `tokentrail-`, with no selected-version, architecture, extension, or exact inventory check. `npmVersion` comes solely from `npm_config_user_agent`; `.github/workflows/release.yml` invokes the script directly with `node`.
- **Trigger/impact:** A reused local release directory can associate stale versions, another architecture, or unrelated matching files with the current build. In a normal direct CI shell without npm's user-agent variable, the installed npm version is recorded as null.
- **Improvement/verification:** Require the exact expected format/architecture/version inventory and capture the actual toolchain version explicitly. Test stale artifacts, missing formats, and a direct node invocation with no npm user-agent variable.
- **Status:** Code-supported provenance accuracy gaps; hosted CI environment not inspected.

### IMP-004: P2: Gate tagged artifacts on the checks for the exact tagged commit

- **Evidence:** `.github/workflows/release.yml` builds and packages without running or requiring lint, types, unit, integration, security, or `check:package-contents`. `.github/workflows/ci.yml` triggers on pull requests and main pushes, not tags, and its security job uses the built development Electron launcher rather than a fused package.
- **Impact:** A tag can produce release artifacts without this workflow proving its exact source and packaged bytes passed the validation suite. Protected-environment review is a separate human control, not an executable quality gate.
- **Improvement/verification:** Add or reuse exact-ref verification jobs and validate produced artifacts before draft assembly. Test a tagged commit with an intentional failing test in an isolated workflow-validation exercise.
- **Status:** Pipeline improvement; no claim about current remote branch/environment protections.

### IMP-005: P2: Expand automated regression gates to cover exposed product behavior

- **Evidence:** `npm run verify` and CI's quality job omit docs, coverage, end-to-end, accessibility, development, packaged, and performance suites. `vitest.config.ts` declares no coverage thresholds. Existing timezone coverage compares refresh instants in New York/Tokyo, not date-only bucket labels; preferences restart coverage restores System before relaunch rather than proving a nondefault value survives.
- **Impact:** The green core suite does not verify automatic refresh scheduling, negative rendered differences, extreme timezone labels, delayed saves, or nondefault restart persistence. Several findings in this document pass all current core checks.
- **Improvement/verification:** Add focused regressions for documented failure cases and choose explicit PR/release gates appropriate to their cost. Preserve a nondefault preference through restart and compare exact date-only labels across extreme zones.
- **Status:** Test-quality improvement supported by the checked-in test/configuration paths and this review's passing core suite.

### IMP-006: P3: Make documentation-link checks robust to supported Markdown inputs

- **Evidence:** `scripts/check-doc-links.mjs` passes non-Markdown fragment targets to `collectHeadingSlugs` via an absent map entry, decodes URLs without handling malformed escapes, and claims to skip fenced code while only removing inline backtick spans. Its heading slug logic also does not account for collisions between duplicate headings and existing suffixed headings.
- **Impact:** A relative HTML link with a fragment or malformed percent escape can crash the sweep instead of reporting a finding; fenced examples and heading collisions can produce false results.
- **Improvement/verification:** Parse or explicitly scope supported links, handle decoding failures as findings, ignore fenced examples, and test duplicate-slug collisions. Keep current passing documentation checks as baseline evidence rather than assuming broader syntax is covered.
- **Status:** Tooling improvement from source review; current repository documentation check passes.

### IMP-007: P3: Pin Pages workflow actions to immutable commits and scope deployment triggers

- **Evidence:** `.github/workflows/static.yml` uses floating action tags, `ubuntu-latest`, and deploys on every main push without a site path filter. The CI/release workflows use commit-pinned actions and explicit runner versions.
- **Impact:** Website deployment has a different reproducibility policy and redeploys for unrelated source/documentation commits, including this audit's incremental pushes.
- **Improvement/verification:** Align action pinning with the other workflows, decide an explicit runner policy, and filter automatic deployment to website/workflow inputs while preserving manual dispatch.
- **Status:** Supply-chain and CI-efficiency improvement, not a demonstrated compromised action.

## Additional arithmetic, navigation, and website findings

### BUG-035: P2: Negative percentage changes are formatted as malformed decimal strings

- **Evidence:** `src/shared/domain/bigint-format.ts:29-45` applies positive half-up rounding and unsigned fractional assembly to negative numerators. `computePeriodComparison` passes a negative numerator when usage falls.
- **Trigger/impact:** `formatBigintRatio(-100n, 2n, 1)` returns `-49.-9` instead of `-50`; `formatBigintRatio(-1n, 2n, 1)` returns `0.-4` instead of `-0.5`. Falling period comparisons can show malformed percentages and incorrect rounding independently of BUG-017's absolute difference display.
- **Improvement/verification:** Round the magnitude, format whole/fractional parts, then apply the sign consistently. Test negative whole values, fractions below one, half-way rounding, and zero.
- **Status:** Reproduced against the actual shared formatter.

### BUG-036: P2: Website copy buttons report success when copying fails or is unavailable

- **Evidence:** `site/script.js:58-76` calls the same `done()` success handler for clipboard fulfillment and rejection; absence of the clipboard API also calls `done()` without copying.
- **Trigger/impact:** Deny clipboard permission or use a context without the API. The button says “Copied” while the clipboard still contains its previous contents. This affects installation command copying.
- **Improvement/verification:** Show success only after a confirmed write; present failure/manual-selection guidance or a working fallback. Test rejected and absent clipboard APIs.
- **Status:** Both failure branches reproduced with the actual script in jsdom; both displayed `Copied`.

### BUG-037: P3: Website menu's accessible label stays “Close menu” after closing

- **Evidence:** `site/script.js:37-49` removes the open class and resets `aria-expanded` when a link is activated or Escape is pressed, but only the toggle-button handler updates `aria-label`.
- **Trigger/impact:** Open the mobile menu and close it through a link or Escape. The closed menu's button announces “Close menu,” contradicting its collapsed state.
- **Improvement/verification:** Centralize the open/closed state update so CSS state, expanded state, label, and focus stay consistent across all close paths.
- **Status:** Link-close branch reproduced in jsdom: `aria-expanded="false"` alongside `aria-label="Close menu"`; Escape shares the same omission.

### BUG-038: P2: Advertised usage date-range controls are absent

- **Evidence:** `CHANGELOG.md:13` claims a Usage route with date-range controls; `site/index.html:144` advertises date ranges. `src/renderer/routes/UsageRoute.tsx` has only chart/table selection and always calculates over all `snapshot.usage.days`. Its “Selected supplied range” label has no corresponding selector.
- **Trigger/impact:** Open Usage to inspect a chosen subset or trailing period. No control exists to choose a date range, despite the release description and product specification's range selector mockup.
- **Improvement/verification:** Either provide the documented range controls with honest coverage semantics or correct the shipped scope claims. Verify that chart, table, heatmap, statistics, and coverage use the same chosen range.
- **Status:** Confirmed source/UI scope mismatch; not a request to implement it in this review.

### BUG-039: P2: Searching after a Learn deep link steals focus after each matching keystroke

- **Evidence:** `src/renderer/routes/LearnRoute.tsx:141-160` focuses the deep-linked article in an effect depending on both `focusEntryId` and `filtered`. Typing changes `filtered`.
- **Trigger/impact:** Follow `#learn/tokens-vs-quota`, focus Search explanations, and type `t`. The matching article takes focus immediately, interrupting further typing. Repeated matching queries repeat the focus move.
- **Improvement/verification:** Move focus only for a navigation intent, not ordinary filtering; define fallback behavior when a new deep link is hidden by an existing query. Test uninterrupted multi-character search after a deep link.
- **Status:** Reproduced by rendering the actual component with Testing Library/jsdom; active element became `ARTICLE` with `data-learn-entry="tokens-vs-quota"` after the first character.

### BUG-040: P3: Learn navigation forces smooth scrolling despite reduced-motion preferences

- **Evidence:** `src/renderer/routes/LearnRoute.tsx:153` explicitly passes `behavior: 'smooth'` to `scrollIntoView`. The component receives neither motion preferences nor an effective reduced-motion flag.
- **Trigger/impact:** Enable reduced motion and follow a contextual Learn link. Navigation still requests animated scrolling; CSS animation/transition overrides do not change this explicit JavaScript scroll request.
- **Improvement/verification:** Resolve effective motion preference for navigation and choose immediate scrolling when reduced motion is active. Test both explicit reduced mode and system preference.
- **Status:** Code-supported accessibility defect; actual compositor animation not observed in this review.

### IMP-008: P3: Give credit rows stable unique keys and preserve reset-only control details

- **Evidence:** `src/renderer/routes/CreditsRoute.tsx` keys rows by title and expiry, which are not unique identifiers in its schema. It renders the spending detail panel only when limit or used amount exists, even if a reset timestamp is available.
- **Impact:** Repeated title/expiry pairs can collide during reconciliation, and a valid reset-only spending control never exposes its reset time.
- **Improvement/verification:** Define stable row identity without exposing sensitive identifiers and render each available control field independently. Test duplicate-looking rows and a control carrying only `resetsAt`.
- **Status:** UI robustness/completeness improvement based on accepted input shapes.

### IMP-009: P3: Update release evidence indexing and make website claims match implemented behavior

- **Evidence:** README's evidence link still targets 0.4.0 and promises a separate report per later executable version. Checked-in report directories stop at 0.5.0, whose report contains some later build records; no dedicated 1.0.0 report exists. Website/release copy also advertises completed range controls and clear-data deletion, contradicted by BUG-038 and BUG-028.
- **Impact:** Reviewers cannot follow the stated per-version evidence convention to the released version, and users read stronger behavior claims than the implementation supports.
- **Improvement/verification:** Provide one accurate evidence index for the released commit, distinguish consolidated historical evidence from dedicated reports, and audit feature copy against actual controls. Carry forward the already documented open environment/install/Orca/arm64 validation limitations rather than claiming those were resolved here.
- **Status:** Documentation consistency improvement; does not dispute that historical commands may have run.

## Dependency maintenance

### IMP-010: P2: Triage and refresh vulnerable transitive build dependencies

- **Evidence:** September 7 `npm audit --json` reports two affected packages: `fast-uri@3.1.5` (high) and `@xmldom/xmldom@0.8.14` (moderate). `npm ls` places both under `electron-builder@26.15.3 > app-builder-lib@26.15.3`: fast-uri through `ajv@8.20.0`, xmldom through `plist@3.1.0`.
- **Upstream evidence:** The [fast-uri maintainer advisory](https://github.com/fastify/fast-uri/security/advisories/GHSA-5jgf-p345-68v8) identifies host canonicalization problems affecting 3.1.5 and lists 3.1.6 as a patched version on that line. The [xmldom maintainer advisory](https://github.com/xmldom/xmldom/security/advisories/GHSA-6gmq-8vp8-gcm6) describes invalid entity-reference serialization affecting 0.8.14 and lists 0.8.15 as patched on that line. npm also groups three other URI normalization advisories under fast-uri.
- **Impact/scope:** These are observed dependency advisories, not demonstrated Token Trail exploits. Both are build-tool dependencies; `npm audit --omit=dev --json` reports zero production dependency vulnerabilities. The packaging config excludes node_modules from the application payload and Vite bundles the application sources.
- **Improvement/verification:** Triage whether affected operations process untrusted input in this build pipeline, update compatible locked transitive versions or their owning build dependencies, and rerun package/build validation and audit. Do not interpret npm's high severity as proof of a remotely exploitable desktop application bug.
- **Status:** Dependency versions and audit output verified locally; the two maintainer advisories were checked online. No dependency changes or automatic audit fixes were applied.

## Final verification and coverage

Review completed September 7, 2026. Inventory: **40 bug findings and 10 improvement opportunities**. Each entry includes a source location, impact or triggering input, proposed follow-up verification, and evidence status. Static races and defense-in-depth opportunities are explicitly distinguished from dynamically reproduced failures.

### Executed checks

| Check | Observed result |
| --- | --- |
| `npm ci --ignore-scripts` | Installed 507 packages from the existing lockfile; tracked package files unchanged |
| `npm run verify` | Passed formatting, lint, all five TypeScript projects, 229 tests across 30 unit/component files, and 32 tests across 3 integration files |
| `npm run build` | Passed main, preload, renderer, and bundle budgets; initial JS 314,669 bytes raw / 94,403 gzip; chart 512,458 raw; total 827,127 raw |
| `npm run check:docs` | Passed repository documentation link/naming checks |
| Release-notes generator with current v1.0.0 inputs | Passed; output written only to a temporary file |
| `npm audit --json` | Two affected development/build dependency packages, one high and one moderate; see IMP-010 |
| `npm audit --omit=dev --json` | Zero reported production dependency vulnerabilities |
| Temporary source probes | Reproduced BUG-006, BUG-010 through BUG-015, BUG-017, BUG-018, BUG-029, BUG-032, BUG-035 through BUG-037, and BUG-039 |
| Documentation-only diff and punctuation | Only `bugs_sept7.md` is changed from the review baseline; no em dashes in the document |

The unit/component run emitted jsdom canvas-not-implemented warnings but passed. The build emitted the existing generic 500 kB chunk warning while satisfying the repository's explicit bundle budgets. Neither warning is presented here as a failing check.

The temporary probes loaded actual TypeScript source through TypeScript transpilation, used injected clients/clocks for controller scenarios, and used Testing Library/jsdom for component or site-script behavior. The date-label probe executed the route's identical Intl expression under different `TZ` settings. The release-section probe extracted the actual parser and injected synthetic changelog text. These probes did not alter application source, checked-in tests, fixtures, dependency manifests, or lockfiles.

### Area coverage and remaining verification limits

| Area reviewed | Scope and limits |
| --- | --- |
| Main-process lifecycle and Codex transport | Startup/shutdown, executable discovery, environment allowlist, framing, requests, notifications, schemas, normalization, refresh state, and session baselines; no real account or external Codex process was used for the temporary probes |
| Data and calculations | Usage counters, date arithmetic, coverage, statistics, comparisons, quota/reset ordering, credit expiry, and combined-capacity clauses; extreme allocation and deliberate desktop-crash scenarios were assessed from source rather than run |
| Renderer and preload | Bridge contracts, subscriptions, preferences, all six routes, formatting, charts, focus, and theme/motion/time handling; no new live Electron/Playwright, screen-reader, visual screenshot, or compositor campaign was run |
| Storage, diagnostics, and security | Preference queue/recovery/clear, diagnostic generation/export/health, IPC sender checks, protocol paths, CSP, window policies, and packaging fuses; no security exploit or sensitive-data disclosure was demonstrated |
| Build and distribution | Package/configuration files, development/build/release scripts, CI/Pages/release workflows, and checked-in packaging/test harnesses; no distributable package was rebuilt, installed, signed, or published in this review |
| Website and documentation | Site navigation/copy/theme script, feature claims, release notes, evidence indexing, selected architecture/user/release/support records, and repository-wide Markdown link check; external download links and historical release execution claims were not independently revalidated |
| Dependencies | Locked build dependency paths and npm advisory output checked; maintainer sources verified for the two affected packages; no update or lockfile mutation |

Existing known limitations remain in `docs/support/known-limitations.md`, including native install cycles, broader desktop coverage, arm64 execution, and human screen-reader validation. This review does not claim to close those gaps or exhaustively prove the absence of other bugs.

### Delivery record

Findings were committed and pushed in separate batches covering transport/controller, normalization, renderer workflows, storage/diagnostics, build/release tooling, arithmetic/navigation/website, dependencies, and final evidence consolidation. Commit messages describe each batch's scope and findings. All changes are documentation only; no bugs were fixed.


## Fix progress (after review)

The review above describes the original baseline. Fixes below are incremental source changes; no release is being created.

- BUG-001, BUG-002, BUG-003, BUG-004, BUG-008: stdin failures use sanitized rejection, discovery cannot spawn after stop or a concurrent start, shutdown retains the child and escalates to SIGKILL after one second unless it exits, NDJSON limits apply per line, and initialization uses the manifest version. Eight deterministic transport regression tests pass, including deferred discovery, pipe errors, termination escalation/cancellation, and near-limit lines across chunk partitions.
- BUG-005, BUG-006, BUG-007: update notifications queue a coalesced follow-up read, reset windows adopt their new baseline, and explicit sign-out/account-kind changes start fresh observations. Nine controller tests pass; main TypeScript and targeted lint pass. Same-kind account switches without a visible sign-out remain unidentifiable under the existing non-identifying account contract.
- BUG-009 through BUG-015: coverage scans at most accepted-count + 64 dates and heatmaps show at most 366 dates with an explicit truncation note; date formatting and credit contracts bound Unix seconds; display metadata falls back within public bounds; usable balance/control sources are selected independently; standalone reached flags survive; ambiguous dates are excluded from comparisons and gaps mark usage partial. Core checks passed (248 unit/component tests before two additional duplicate-period regressions); updated normalization tests (18) and all 32 integration tests pass, and the production build meets bundle budgets.
- BUG-017, BUG-018, BUG-019, BUG-021, BUG-022, BUG-023, BUG-035, BUG-039, BUG-040 and IMP-008: signed differences/ratios format correctly; calendar labels use UTC; all data routes warn on stale values; capped charts disclose geometry and retain exact tooltips; resize observers/listeners are cleaned up; Credits/Diagnostics honor time format; Learn filtering preserves search focus and navigation respects reduced motion; reset-only credit controls remain visible and duplicate-looking rows have unique keys. Full formatting/lint/types/unit/component/integration checks pass, including new chart lifecycle, extreme-date rendering, timezone, arithmetic, and search regressions.
- BUG-016, BUG-020, BUG-024 through BUG-029: main owns the preference-driven automatic refresh timer; late IPC reads cannot replace pushed snapshots; preference edits render optimistically and persist in order with rollback; bridge workflows catch failures with sanitized feedback; initial preference loads are deduplicated and queued; transient I/O/quarantine failures preserve original files; clear removes owned files without rewriting defaults; diagnostics count explicit completed attempt IDs and measure every refresh source. Full verification passes: 271 unit/component tests, 32 integration tests, formatting, lint, all TypeScript projects, production build/bundle budgets, and documentation checks. Controlled regressions cover load/save races, failure recovery, scheduler changes/shutdown, and health counts at identical clock timestamps.
- BUG-030: diagnostics use observed executable discovery and endpoint outcomes, with null/empty values before observation. Missing methods are distinguished from other server errors. Codex version remains explicitly unknown because the validated handshake has no dedicated version field. Controller regressions cover initial unknown, missing executable, unsupported usage, and discovered-but-empty data; transport regressions distinguish method absence from generic errors.
- BUG-032: changelog section boundaries use multiline matching. Three isolated script-execution integration cases verify current, historical, and Unreleased fallback sections without publishing anything.

- BUG-036: Confirmed writes alone show success; four script tests cover success, rejection, missing API, and synchronous failure. Fix committed as `2d737d0`.

- BUG-037: Script regression verifies toggle, link, and Escape closes, including Escape focus restoration. Fix committed as `5797011`.

### Remaining work at the usage cutoff

Current status: 36 fixed, 4 open. Remaining bug findings: BUG-031, BUG-033, BUG-034, BUG-038. Other improvement opportunities remain outside this six-bug fixing scope. See the BUG-007 fix note for the account-identity limit.

No version bump, tag, or release was created. Implementation stopped when the next available five-hour usage reading showed 91% used (9% remaining), after the previous check showed 83%. Final verification completed with 275 unit/component tests and 35 integration tests passing, along with formatting, lint, and all TypeScript checks. Production build/bundle budgets and documentation checks also passed. The interruption left BUG-030 and BUG-032 verified but uncommitted; delivery was resumed on September 8 in separate commits. Existing live desktop, packaging, installation, and assistive-technology verification limits from the original review remain; this fixing session does not claim to close those environment coverage gaps.

### Release and website requirements

- Create a new release only after all bugs are fixed and the completed fixes have been verified. Do not create a release while any bug remains open.
- Before that release, check the website and update it to match the implemented application behavior, resolved bugs, feature availability, and release information. Verify affected website interactions and ensure its claims are accurate.
