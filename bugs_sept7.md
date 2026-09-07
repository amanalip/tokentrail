# Repository review : September 7, 2026

Baseline: `dd137a011019a1fe7a4ba791651f8a78c89eeef2` (main, version 1.0.0).

This is a documentation-only review. No application fixes are included. Findings distinguish code-supported bugs from improvement opportunities; suggested tests are acceptance criteria, not claims that those tests already ran. Line references refer to the baseline. This is a broad review, not a guarantee that every possible defect has been discovered.

Priorities: **P1** = crash, serious lifecycle/data correctness issue; **P2** = functional/reliability defect; **P3** = smaller correctness or maintainability issue. Verification evidence and coverage are recorded at the end as the review progresses.

## Process transport and controller

### BUG-001 : P1: Child stdin errors can escape as uncaught stream errors

- **Evidence:** `src/main/codex/codex-process-client.ts:189-204,361` installs an error handler on the child process, but none on `child.stdin`; writes have no callback.
- **Trigger/impact:** An app-server that closes its input while remaining alive can make a subsequent write emit an asynchronous `EPIPE` error on stdin. The surrounding synchronous try/catch in `request()` cannot catch that event. An unhandled stream error can terminate the Electron main process.
- **Improvement/verification:** Handle stdin errors through the sanitized connection-failure path. Exercise a fixture that closes fd 0 before an approved request and assert safe rejection without an uncaught exception.
- **Status:** Code-supported; crash fixture not yet executed.

### BUG-002 : P1: Stop during executable discovery can still spawn an unowned child

- **Evidence:** `src/main/codex/codex-process-client.ts:168-189` checks stopped state before awaiting executable resolution, then spawns without rechecking. `stop()` sets the stopped flag and clears the child reference.
- **Trigger/impact:** Stop the client while filesystem-based PATH discovery is pending. Discovery resumes and spawns a child despite shutdown; the initialization request rejects because the client is stopped, while subsequent `stop()` calls return immediately. The child can survive without normal cleanup.
- **Improvement/verification:** Recheck lifecycle state after asynchronous discovery and before spawn. Add a controlled delayed-discovery shutdown test that verifies no child starts after stop.
- **Status:** Code-supported race; not dynamically reproduced.

### BUG-003 : P2: Shutdown gives up ownership before confirming child termination

- **Evidence:** `src/main/codex/codex-process-client.ts:317-340,462-483` sends SIGTERM and immediately clears the handle; there is no exit wait or bounded escalation.
- **Trigger/impact:** A hung or SIGTERM-ignoring app-server remains running after stop/failure. Repeated refresh recovery can create additional surviving processes.
- **Improvement/verification:** Retain ownership until exit, use a bounded termination policy, and verify shutdown with a fixture that ignores SIGTERM.
- **Status:** Code-supported; hostile-shutdown fixture not executed.

### BUG-004 : P2: Valid framed messages can exceed the aggregate-buffer check

- **Evidence:** `src/main/codex/codex-process-client.ts:364-400` checks the entire accumulated buffer against one message's limit before extracting newline-delimited messages.
- **Trigger/impact:** A near-limit partial line followed by a chunk containing its end and another valid message is rejected even though every individual line is within the configured maximum. Failure depends on stream chunk boundaries.
- **Improvement/verification:** Apply the limit per complete line and to the remaining incomplete line. Test the same valid NDJSON sequence across multiple chunk partitions, including a near-limit line followed immediately by a notification.
- **Status:** Code-supported framing defect.

### BUG-005 : P2: Notifications received during refresh do not schedule a follow-up read

- **Evidence:** `src/main/overview/overview-controller.ts:132-134,331-337` routes notifications to `refresh()`, which returns the current in-flight promise without recording pending work.
- **Trigger/impact:** A rate-limit update arrives after the refresh has already fetched rate limits but while usage is pending. Its requested refresh is absorbed, and the older quota response is published without another read.
- **Improvement/verification:** Track a pending refresh trigger and perform one coalesced follow-up. Inject the notification between the rate-limit response and usage response, then verify a fresh quota read occurs.
- **Status:** Code-supported ordering defect.

### BUG-006 : P2: Quota session deltas disappear permanently after a reset

- **Evidence:** `src/main/overview/overview-controller.ts:375-394` calls its operation a rebase but removes transitioned windows from the baseline. `src/shared/domain/session-deltas.ts:42-49` skips windows absent from that baseline.
- **Trigger/impact:** Observe a reset timestamp change, then two later snapshots in the new window. No further delta or reset transition can be generated for that window during the process lifetime.
- **Improvement/verification:** Replace the transitioned baseline window with the new observed window, preserving the intended session-start metadata. Verify changes and a second reset after the first transition.
- **Status:** Code-supported data correctness defect.

### BUG-007 : P2: Session observations survive an explicit sign-out boundary

- **Evidence:** `src/main/overview/overview-controller.ts:211-222,354-398` publishes signed-out state without clearing `#sessionBaseline` or `#validSnapshotCount`; future signed-in snapshots compare against the old baseline. `src/shared/domain/session-deltas.ts` matches quota bucket/window identities and lifetime counters, not account identity.
- **Trigger/impact:** Account A is observed, signs out, and account B signs in while Token Trail stays open. B's counters/quotas can be presented as changes since A's baseline when identifiers overlap.
- **Improvement/verification:** Clear observations on explicit sign-out and define a safe account-change policy. Test A → signed out → B with overlapping bucket IDs and increasing counters.
- **Status:** Code-supported; account switching without a visible sign-out also needs a defined identity strategy.

### BUG-008 : P3: Protocol client advertises an obsolete application version

- **Evidence:** `src/main/codex/codex-process-client.ts:215` hardcodes client version `0.2.0`, while `package.json` declares `1.0.0`.
- **Impact:** Upstream compatibility diagnostics identify the wrong application release.
- **Improvement/verification:** Supply the build's application version from one authoritative source and assert that the initialization request agrees with the manifest.
- **Status:** Confirmed source mismatch.

## Verification and coverage

- Initial working tree was clean; review started on `main`.
- Environment: Node.js 24.20.0, npm 12.0.2.
- Review is in progress; subsequent commits extend this document with additional areas and executed checks.

## Normalization and calculations

### BUG-009 : P1: A tiny sparse usage response can allocate millions of dates

- **Evidence:** `src/shared/domain/calendar-date.ts:47-48` accepts years 1000–9999. `src/shared/domain/usage-calculations.ts:89-95` enumerates the entire first-to-last span before truncating missing dates to 64. `src/renderer/routes/UsageRoute.tsx:581-624` independently enumerates and renders that entire span.
- **Trigger/impact:** Two valid buckets dated `1000-01-01` and `9999-12-31` pass input checks, then produce over three million date keys in main and potentially millions of DOM cells in the renderer. The 366-record input cap does not bound the date span. A malformed source response can freeze the application or exhaust memory.
- **Improvement/verification:** Bound span processing and visible heatmap dates before allocation; compute missing-count/truncation metadata without expanding the full range. Test distant endpoints with bounded time and output size.
- **Status:** Code-supported resource amplification; extreme DOM rendering deliberately not executed.

### BUG-010 : P2: Positive safe timestamps can still crash date formatting

- **Evidence:** `src/main/codex/normalize-overview.ts:85-91` and `src/main/codex/normalize-usage.ts` accept any positive safe integer seconds. `src/renderer/formatting.ts:49-59` multiplies by 1000 and calls `Intl.DateTimeFormat.format` without checking Date validity. The credit schemas also accept these values.
- **Trigger/impact:** `Number.MAX_SAFE_INTEGER` seconds is valid under normalization but outside JavaScript Date's range. Rendering it throws `RangeError`; there is no application error boundary in `src/renderer/App.tsx` to contain the failed route.
- **Improvement/verification:** Reject timestamps outside the supported date range at normalization and guard formatters. Test quota resets, spending-control resets, and credit expiries at and beyond the supported boundary.
- **Status:** Code-supported; the underlying Intl failure is directly reproducible with Node.

### BUG-011 : P2: Metadata accepted by protocol schemas can reject the whole public snapshot

- **Evidence:** `src/main/codex/protocol-schemas.ts:8-11` permits metadata strings up to 512 characters. `src/main/codex/normalize-overview.ts` copies IDs, names, and plans through; `src/shared/contracts/overview-snapshot.ts:39-43,80` limits IDs/names to 128 and plans to 64, with nonempty constraints.
- **Trigger/impact:** A 129-character quota label, 65-character plan, or empty plan passes the upstream schema and then makes the public snapshot parse fail. Valid quota and usage values are discarded and the connection is restarted for a display-label problem.
- **Improvement/verification:** Normalize each display field to the destination contract with safe fallback/unavailable behavior. Exercise oversized and empty metadata while asserting useful values survive.
- **Status:** Confirmed incompatible boundary constraints.

### BUG-012 : P2: A standalone spending-control reached flag is discarded

- **Evidence:** `src/main/codex/normalize-usage.ts:281-284` applies `spendControlReached === true` only when `normalizeSpendingControl(individualLimit)` returned a non-null control.
- **Trigger/impact:** A response containing `spendControlReached: true` and no usable `individualLimit` produces no reached control. The Credits route can say “None reported” or show no credit information despite an explicit reached signal.
- **Improvement/verification:** Represent the reported reached state independently of optional amounts and percentages. Test true with absent, null, and empty individual-limit objects.
- **Status:** Code-supported field-loss defect.

### BUG-013 : P2: Empty credit fields in one bucket hide usable credits in later buckets

- **Evidence:** `src/main/codex/normalize-usage.ts:246-261` selects the first snapshot with a credit-related property that is not undefined and breaks before checking whether the field is usable.
- **Trigger/impact:** First keyed bucket has `credits: null` or `spendControlReached: false`, while a later bucket/fallback has a valid balance. The normalized result loses the valid balance.
- **Improvement/verification:** Define precedence over usable fields and preserve compatible independently reported credit fields. Test empty first bucket followed by a balance/control-bearing bucket.
- **Status:** Code-supported selection defect.

### BUG-014 : P2: Duplicate-date ambiguity does not disable affected comparisons

- **Evidence:** `src/main/codex/normalize-usage.ts:55-59,93-99` claims duplicate rejections make affected comparisons unavailable, but keeps the first row. `src/renderer/routes/UsageRoute.tsx:129-132` passes only accepted days to `computePeriodComparison`; that function never sees rejected-date metadata.
- **Trigger/impact:** Supply 14 consecutive days plus a conflicting duplicate within the compared range. The section becomes partial, yet still publishes a complete comparison based on whichever duplicate appeared first.
- **Improvement/verification:** Track ambiguous dates or exclude them from completeness checks. Test conflicting duplicates in both periods and verify the affected comparison is unavailable.
- **Status:** Code-supported mismatch with the normalizer's documented rule.

### BUG-015 : P2: Missing days do not mark the usage section partial

- **Evidence:** `src/main/codex/normalize-usage.ts:123-142` computes coverage but chooses ready/partial using only rejected records and whether any buckets exist.
- **Trigger/impact:** Valid buckets for Monday and Wednesday with Tuesday absent produce nonempty `coverage.missingDates` but `usage.state: ready`. The incomplete-source banner is absent despite a known hole in the supplied span.
- **Improvement/verification:** Include missing-date coverage in completeness classification, or explicitly revise the UI meaning of ready. Test gapped dates without malformed records.
- **Status:** Code-supported completeness inconsistency.

## Renderer and user workflows

### BUG-016 : P2: Automatic refresh preferences have no implementation

- **Evidence:** `src/renderer/routes/SettingsDiagnosticsRoute.tsx:140-178` exposes enabled/interval controls. Repository-wide searches for `automaticRefreshEnabled` and `refreshIntervalMinutes` find storage, schemas, diagnostics, and tests, but no scheduler consuming them. The only renderer interval updates a display clock.
- **Trigger/impact:** Enable automatic refresh, choose an interval, and wait. No periodic account/usage refresh is scheduled. Persisted settings imply a working feature that does nothing.
- **Improvement/verification:** Implement the bounded lifecycle-aware scheduler or disable the controls with honest availability text until it exists. Verify enabling, interval changes, disabling, and shutdown with a fake clock.
- **Status:** Confirmed missing implementation from source-wide search.

### BUG-017 : P2: Falling usage displays “Unavailable tokens” instead of its signed difference

- **Evidence:** `src/renderer/routes/UsageRoute.tsx:431-437` passes signed `absoluteDifference` into `formatCounter`. `src/renderer/formatting.ts:129-134` delegates to a nonnegative counter parser.
- **Trigger/impact:** Latest period is 70 tokens below the preceding period. `formatCounter('-70')` returns `Unavailable`, while the relative change remains negative and valid, yielding inconsistent comparison output.
- **Improvement/verification:** Format signed differences separately from nonnegative reported counters. Test rising, falling, and unchanged period totals in the rendered comparison.
- **Status:** Formatter result reproduced directly against source.

### BUG-018 : P2: UTC-noon date formatting shifts bucket labels in UTC+12 and later zones

- **Evidence:** `src/renderer/routes/UsageRoute.tsx:554-563` creates a UTC-noon Date but formats it without a fixed timezone.
- **Trigger/impact:** In `Pacific/Kiritimati`, source key `2026-09-07` displays as September 8. Tables, chart labels, comparisons, coverage labels, and heatmap descriptions can name the wrong calendar day. Noon does not protect against all timezone offsets.
- **Improvement/verification:** Format plain calendar keys with an explicit UTC timezone or a date-only formatter. Include UTC+12, UTC+14, negative offsets, and daylight-saving zones in route tests.
- **Status:** Identical Intl expression reproduced with `TZ=Pacific/Kiritimati`; output was `Sep 8, 2026`.

### BUG-019 : P2: Stale-data warnings exist only on Overview

- **Evidence:** `src/renderer/App.tsx` renders sibling routes without a shared freshness banner. `UsageRoute`, `QuotaWindowsRoute`, and `CreditsRoute` do not check `snapshot.state === 'stale'`; only `OverviewRoute` renders the stale alert.
- **Trigger/impact:** Refresh successfully, fail a later refresh, then open Usage, Quota Windows, or Credits. Preserved historical values are shown without the warning or failed-refresh context visible on Overview.
- **Improvement/verification:** Put freshness context in the shared shell or each data route. Test navigation among all data routes with a stale snapshot and retained values.
- **Status:** Code-supported presentation omission.

### BUG-020 : P2: Initial snapshot reads can overwrite a newer pushed snapshot

- **Evidence:** `src/renderer/hooks.ts:35-46` subscribes first, then unconditionally adopts the eventual `getOverviewSnapshot()` result. There is no revision comparison or guard recording whether a push arrived after the read started.
- **Trigger/impact:** Delay the initial read's promise, deliver a newer snapshot through the subscription, then resolve the old read. The UI rolls back to older data and can stay there until another update.
- **Improvement/verification:** Order snapshots by a monotonic revision or ignore an obsolete initial response after a newer event. Test deferred IPC resolution with an intervening pushed snapshot.
- **Status:** Code-supported ordering risk; deferred-bridge reproduction is a proposed check. This entry replaces a withdrawn countdown finding after confirming that Overview already subscribes to a display timer.

### BUG-021 : P2: Oversized chart values silently become the same false tooltip value

- **Evidence:** `src/renderer/routes/UsageRoute.tsx:34-40,92-120` clamps every counter above `Number.MAX_SAFE_INTEGER` to that maximum and supplies those values to the default chart tooltip. The promised clamping note is absent from rendered copy.
- **Trigger/impact:** Different huge exact counters appear as equal-height bars and tooltips show 9,007,199,254,740,991 instead of the source totals. The exact table remains available, but the chart presents its approximation as factual.
- **Improvement/verification:** Use exact source strings in tooltips and visibly explain or avoid capped geometry. Verify two distinct oversized values using the huge-counter fixture.
- **Status:** Code-supported chart accuracy defect.

### BUG-022 : P2: The daily chart does not resize with its container

- **Evidence:** `src/renderer/routes/UsageRoute.tsx:522-537` initializes/disposes ECharts on option changes but registers neither a resize observer nor a window resize handler and never calls `instance.resize()`.
- **Trigger/impact:** Resize the desktop window or cross a responsive layout breakpoint while Usage remains open. The container changes width but the SVG chart retains its initialization dimensions, leaving clipping or unused space until remount/update.
- **Improvement/verification:** Observe container size and resize the owned chart with cleanup. Assert SVG dimensions after narrowing and widening the same mounted chart.
- **Status:** Code-supported missing chart lifecycle step; live resize not yet executed.

### BUG-023 : P3: Time-format preference is ignored on Credits and Diagnostics

- **Evidence:** `src/renderer/App.tsx` passes only `snapshot` to Credits. `src/renderer/routes/CreditsRoute.tsx` calls `formatResetTime` with its default system format; `SettingsDiagnosticsRoute.tsx` similarly omits the preference when formatting last refresh.
- **Trigger/impact:** Choose 24-hour time on a system using 12-hour time. Overview/Quota Windows follow the preference while Credits and Diagnostics continue using the system default.
- **Improvement/verification:** Pass the shared preference to every timestamp formatter. Test all routes under an explicit format opposite to the system default.
- **Status:** Confirmed inconsistent formatter arguments.

### IMP-001 : P3: Replace internal explanation keys and ambiguous summary labels with user copy

- **Evidence:** `src/renderer/routes/UsageRoute.tsx:278-306,404-410` renders keys such as `statistics-total-exact-sum` directly in summary cards. The card labeled “Peak supplied day” uses upstream `summary.peakDailyTokens`, while a separate statistic calculates the actual highest supplied day. `longestStreakDays` is normalized but never displayed.
- **Impact:** Users see implementation identifiers and can mistake a reported historical peak for the highest day in the visible range; one available summary field is unused.
- **Improvement/verification:** Map explanations to readable copy, distinguish reported peak from calculated range peak, and decide whether to expose longest streak. Review with a fixture whose reported peak exceeds every supplied day.
- **Status:** Improvement opportunity based on rendered source.

## Preferences, diagnostics, and error recovery

### BUG-024 : P2: Rapid edits to different preferences lose earlier changes

- **Evidence:** `src/renderer/hooks.ts:124-126` updates local preferences only after persistence resolves. Settings controls spread the current `preferences` object into each full replacement, for example `SettingsDiagnosticsRoute.tsx:100,118,133`.
- **Trigger/impact:** With a slow save, choose Dark and immediately choose reduced motion. Both requests use the old preference object; the second replacement restores the old theme. The filesystem write queue serializes stale documents but does not merge their changes.
- **Improvement/verification:** Serialize edits against the latest intended state or apply optimistic, rollback-aware updates. Test two distinct field edits before resolving the first bridge promise and verify both persist.
- **Status:** Code-supported lost-update race.

### BUG-025 : P2: Bridge failures are not converted into visible workflow errors

- **Evidence:** `src/renderer/hooks.ts:44-46,60-64,115-117,124-126` lacks rejection handling for load/save/refresh operations. `src/renderer/routes/SettingsDiagnosticsRoute.tsx:36-60` also awaits clear/preview/export without catches, while click handlers discard the promises with `void`.
- **Trigger/impact:** Deny preference writes, fail a diagnostics preview, or reject IPC during startup. The renderer produces unhandled promise rejections and either remains at defaults/loading or leaves the workflow without a useful failure message. `dialog.showSaveDialog` is outside the catch in `src/main/ipc/application-ipc.ts` as well.
- **Improvement/verification:** Handle each failure with sanitized user feedback and retry/busy state while preserving the last confirmed state. Mock rejected bridge promises and verify recovery on the next successful attempt.
- **Status:** Code-supported error-path omission.

### BUG-026 : P2: Concurrent first preference loads can quarantine a valid replacement

- **Evidence:** `src/main/preferences/preference-store.ts:72-94` caches only completed reads and has no shared in-flight load promise. Each failed read independently quarantines the path and enqueues a default save. Renderer startup and diagnostics can both call `load()`.
- **Trigger/impact:** Two initial reads observe a missing file; one writes defaults (or is followed by a user save) before the other's catch renames the live path. The second load can quarantine a newly valid file and replace it with defaults. Concurrent successful reads can likewise race later saves when updating the cache.
- **Improvement/verification:** Deduplicate initial load and coordinate it with the write queue. Use a filesystem seam to delay the second read failure until after the first save; ensure only one initialization occurs and later edits survive.
- **Status:** Code-supported concurrency risk; controlled filesystem reproduction proposed.

### BUG-027 : P2: Read failures are treated as corruption and may overwrite recoverable preferences

- **Evidence:** `src/main/preferences/preference-store.ts:77-94,131-139` uses one catch for read I/O failure, JSON failure, and schema failure, attempts quarantine, ignores any rename failure, then saves defaults.
- **Trigger/impact:** An existing file cannot be read temporarily but its directory permits replacement. Even though its contents have not been proved corrupt, the load path can replace valid settings with defaults. A failed quarantine does not stop the overwrite.
- **Improvement/verification:** Distinguish absence, content corruption, and transient/access errors; preserve files when quarantine fails. Test read failure and failed rename against an existing valid document.
- **Status:** Code-supported destructive recovery policy.

### BUG-028 : P3: Clear-data copy promises deletion but the store recreates preferences

- **Evidence:** `src/renderer/routes/SettingsDiagnosticsRoute.tsx:198-199` says clearing deletes the preferences document. `src/main/preferences/preference-store.ts:147-172` removes it and immediately writes a new default document; related renderer comments claim it is not recreated.
- **Trigger/impact:** A user clears application data and still has a preferences file on disk. Actual behavior is reset-to-defaults, not the deletion described in the confirmation.
- **Improvement/verification:** Align the operation and copy around one explicit contract; if retaining a default file is intended, call the action a reset and describe it accurately. Verify the resulting owned file inventory.
- **Status:** Confirmed implementation/copy mismatch, not a claim that usage data is persisted.

### BUG-029 : P2: Diagnostics count snapshot phases as separate attempts and miss failures

- **Evidence:** `src/main/diagnostics/health-record.ts:34-57` counts every new `refreshAttemptedAt` and classifies immediately. The controller broadcasts loading or preserved ready state at attempt start, then success with completion time; failures reuse the attempt-start time.
- **Trigger/impact:** One initial successful refresh can count as two attempts (loading/no-data plus success). A failed refresh after ready can be counted as success at its start, while the stale completion is ignored because its timestamp matches. Diagnostic health totals and last outcome are therefore misleading.
- **Improvement/verification:** Observe explicit attempt-start/completion events with a stable attempt ID, or classify terminal states separately from start markers. Connect the actual controller to the recorder in tests for startup success, subsequent success, and failure.
- **Status:** Code-supported producer/consumer mismatch; existing isolated recorder tests do not cover this sequence.

### BUG-030 : P2: Diagnostic capability and discovery claims are fabricated from UI state

- **Evidence:** `src/main/index.ts:223-234` sets discovery to `snapshot.state !== 'unavailable'`, always lists all three reads as supported, always leaves unsupported capabilities empty, and always reports a null Codex version.
- **Trigger/impact:** Before discovery completes, loading is reported as discovered. A discovered server returning no data is reported as not discovered. A rejected usage method is still declared supported, hiding the exact compatibility problem diagnostics should explain.
- **Improvement/verification:** Feed observed adapter discovery/handshake/method outcomes into diagnostics; use unknown when not observed. Test startup, missing executable, no-data, and method-not-found separately.
- **Status:** Confirmed hardcoded/inferred diagnostic facts.

### IMP-002 : P2: Tighten IPC authorization to the active application window and runtime mode

- **Evidence:** `src/main/security/ipc-sender.ts:27-40` accepts both production and development roots unconditionally. IPC installers check URL and top-level frame status, but not the owning BrowserWindow/webContents identity or packaged mode.
- **Impact:** The helper's comment promises a development exception only during unpackaged development, but its implementation is broader. Current navigation restrictions reduce exposure; this review does not establish a reachable external exploit.
- **Improvement/verification:** Bind handlers to the actual application webContents and approved URL for its runtime mode. Add negative tests for a different top-level webContents and the development origin in packaged mode.
- **Status:** Defense-in-depth improvement, not a demonstrated authorization bypass.

### IMP-003 : P3: Give clear-data confirmation complete keyboard and busy-state behavior

- **Evidence:** `src/renderer/routes/SettingsDiagnosticsRoute.tsx:194-218` creates an `alertdialog` without focus management, Escape handling, or pending-operation disabling.
- **Impact:** Keyboard focus can be lost when the initiating button is replaced, and repeated confirmation clicks can enqueue multiple clears while I/O is pending.
- **Improvement/verification:** Move focus deliberately into the confirmation, restore it on cancel/completion, provide Escape cancellation, and disable repeated submission while clearing. Verify a complete keyboard-only workflow.
- **Status:** Accessibility/reliability improvement based on component structure; assistive-technology interaction not executed.
