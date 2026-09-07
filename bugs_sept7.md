# Repository review — September 7, 2026

Baseline: `dd137a011019a1fe7a4ba791651f8a78c89eeef2` (main, version 1.0.0).

This is a documentation-only review. No application fixes are included. Findings distinguish code-supported bugs from improvement opportunities; suggested tests are acceptance criteria, not claims that those tests already ran. Line references refer to the baseline. This is a broad review, not a guarantee that every possible defect has been discovered.

Priorities: **P1** = crash, serious lifecycle/data correctness issue; **P2** = functional/reliability defect; **P3** = smaller correctness or maintainability issue. Verification evidence and coverage are recorded at the end as the review progresses.

## Process transport and controller

### BUG-001 — P1: Child stdin errors can escape as uncaught stream errors

- **Evidence:** `src/main/codex/codex-process-client.ts:189-204,361` installs an error handler on the child process, but none on `child.stdin`; writes have no callback.
- **Trigger/impact:** An app-server that closes its input while remaining alive can make a subsequent write emit an asynchronous `EPIPE` error on stdin. The surrounding synchronous try/catch in `request()` cannot catch that event. An unhandled stream error can terminate the Electron main process.
- **Improvement/verification:** Handle stdin errors through the sanitized connection-failure path. Exercise a fixture that closes fd 0 before an approved request and assert safe rejection without an uncaught exception.
- **Status:** Code-supported; crash fixture not yet executed.

### BUG-002 — P1: Stop during executable discovery can still spawn an unowned child

- **Evidence:** `src/main/codex/codex-process-client.ts:168-189` checks stopped state before awaiting executable resolution, then spawns without rechecking. `stop()` sets the stopped flag and clears the child reference.
- **Trigger/impact:** Stop the client while filesystem-based PATH discovery is pending. Discovery resumes and spawns a child despite shutdown; the initialization request rejects because the client is stopped, while subsequent `stop()` calls return immediately. The child can survive without normal cleanup.
- **Improvement/verification:** Recheck lifecycle state after asynchronous discovery and before spawn. Add a controlled delayed-discovery shutdown test that verifies no child starts after stop.
- **Status:** Code-supported race; not dynamically reproduced.

### BUG-003 — P2: Shutdown gives up ownership before confirming child termination

- **Evidence:** `src/main/codex/codex-process-client.ts:317-340,462-483` sends SIGTERM and immediately clears the handle; there is no exit wait or bounded escalation.
- **Trigger/impact:** A hung or SIGTERM-ignoring app-server remains running after stop/failure. Repeated refresh recovery can create additional surviving processes.
- **Improvement/verification:** Retain ownership until exit, use a bounded termination policy, and verify shutdown with a fixture that ignores SIGTERM.
- **Status:** Code-supported; hostile-shutdown fixture not executed.

### BUG-004 — P2: Valid framed messages can exceed the aggregate-buffer check

- **Evidence:** `src/main/codex/codex-process-client.ts:364-400` checks the entire accumulated buffer against one message's limit before extracting newline-delimited messages.
- **Trigger/impact:** A near-limit partial line followed by a chunk containing its end and another valid message is rejected even though every individual line is within the configured maximum. Failure depends on stream chunk boundaries.
- **Improvement/verification:** Apply the limit per complete line and to the remaining incomplete line. Test the same valid NDJSON sequence across multiple chunk partitions, including a near-limit line followed immediately by a notification.
- **Status:** Code-supported framing defect.

### BUG-005 — P2: Notifications received during refresh do not schedule a follow-up read

- **Evidence:** `src/main/overview/overview-controller.ts:132-134,331-337` routes notifications to `refresh()`, which returns the current in-flight promise without recording pending work.
- **Trigger/impact:** A rate-limit update arrives after the refresh has already fetched rate limits but while usage is pending. Its requested refresh is absorbed, and the older quota response is published without another read.
- **Improvement/verification:** Track a pending refresh trigger and perform one coalesced follow-up. Inject the notification between the rate-limit response and usage response, then verify a fresh quota read occurs.
- **Status:** Code-supported ordering defect.

### BUG-006 — P2: Quota session deltas disappear permanently after a reset

- **Evidence:** `src/main/overview/overview-controller.ts:375-394` calls its operation a rebase but removes transitioned windows from the baseline. `src/shared/domain/session-deltas.ts:42-49` skips windows absent from that baseline.
- **Trigger/impact:** Observe a reset timestamp change, then two later snapshots in the new window. No further delta or reset transition can be generated for that window during the process lifetime.
- **Improvement/verification:** Replace the transitioned baseline window with the new observed window, preserving the intended session-start metadata. Verify changes and a second reset after the first transition.
- **Status:** Code-supported data correctness defect.

### BUG-007 — P2: Session observations survive an explicit sign-out boundary

- **Evidence:** `src/main/overview/overview-controller.ts:211-222,354-398` publishes signed-out state without clearing `#sessionBaseline` or `#validSnapshotCount`; future signed-in snapshots compare against the old baseline. `src/shared/domain/session-deltas.ts` matches quota bucket/window identities and lifetime counters, not account identity.
- **Trigger/impact:** Account A is observed, signs out, and account B signs in while Token Trail stays open. B's counters/quotas can be presented as changes since A's baseline when identifiers overlap.
- **Improvement/verification:** Clear observations on explicit sign-out and define a safe account-change policy. Test A → signed out → B with overlapping bucket IDs and increasing counters.
- **Status:** Code-supported; account switching without a visible sign-out also needs a defined identity strategy.

### BUG-008 — P3: Protocol client advertises an obsolete application version

- **Evidence:** `src/main/codex/codex-process-client.ts:215` hardcodes client version `0.2.0`, while `package.json` declares `1.0.0`.
- **Impact:** Upstream compatibility diagnostics identify the wrong application release.
- **Improvement/verification:** Supply the build's application version from one authoritative source and assert that the initialization request agrees with the manifest.
- **Status:** Confirmed source mismatch.

## Verification and coverage

- Initial working tree was clean; review started on `main`.
- Environment: Node.js 24.20.0, npm 12.0.2.
- Review is in progress; subsequent commits extend this document with additional areas and executed checks.

## Normalization and calculations

### BUG-009 — P1: A tiny sparse usage response can allocate millions of dates

- **Evidence:** `src/shared/domain/calendar-date.ts:47-48` accepts years 1000–9999. `src/shared/domain/usage-calculations.ts:89-95` enumerates the entire first-to-last span before truncating missing dates to 64. `src/renderer/routes/UsageRoute.tsx:581-624` independently enumerates and renders that entire span.
- **Trigger/impact:** Two valid buckets dated `1000-01-01` and `9999-12-31` pass input checks, then produce over three million date keys in main and potentially millions of DOM cells in the renderer. The 366-record input cap does not bound the date span. A malformed source response can freeze the application or exhaust memory.
- **Improvement/verification:** Bound span processing and visible heatmap dates before allocation; compute missing-count/truncation metadata without expanding the full range. Test distant endpoints with bounded time and output size.
- **Status:** Code-supported resource amplification; extreme DOM rendering deliberately not executed.

### BUG-010 — P2: Positive safe timestamps can still crash date formatting

- **Evidence:** `src/main/codex/normalize-overview.ts:85-91` and `src/main/codex/normalize-usage.ts` accept any positive safe integer seconds. `src/renderer/formatting.ts:49-59` multiplies by 1000 and calls `Intl.DateTimeFormat.format` without checking Date validity. The credit schemas also accept these values.
- **Trigger/impact:** `Number.MAX_SAFE_INTEGER` seconds is valid under normalization but outside JavaScript Date's range. Rendering it throws `RangeError`; there is no application error boundary in `src/renderer/App.tsx` to contain the failed route.
- **Improvement/verification:** Reject timestamps outside the supported date range at normalization and guard formatters. Test quota resets, spending-control resets, and credit expiries at and beyond the supported boundary.
- **Status:** Code-supported; the underlying Intl failure is directly reproducible with Node.

### BUG-011 — P2: Metadata accepted by protocol schemas can reject the whole public snapshot

- **Evidence:** `src/main/codex/protocol-schemas.ts:8-11` permits metadata strings up to 512 characters. `src/main/codex/normalize-overview.ts` copies IDs, names, and plans through; `src/shared/contracts/overview-snapshot.ts:39-43,80` limits IDs/names to 128 and plans to 64, with nonempty constraints.
- **Trigger/impact:** A 129-character quota label, 65-character plan, or empty plan passes the upstream schema and then makes the public snapshot parse fail. Valid quota and usage values are discarded and the connection is restarted for a display-label problem.
- **Improvement/verification:** Normalize each display field to the destination contract with safe fallback/unavailable behavior. Exercise oversized and empty metadata while asserting useful values survive.
- **Status:** Confirmed incompatible boundary constraints.

### BUG-012 — P2: A standalone spending-control reached flag is discarded

- **Evidence:** `src/main/codex/normalize-usage.ts:281-284` applies `spendControlReached === true` only when `normalizeSpendingControl(individualLimit)` returned a non-null control.
- **Trigger/impact:** A response containing `spendControlReached: true` and no usable `individualLimit` produces no reached control. The Credits route can say “None reported” or show no credit information despite an explicit reached signal.
- **Improvement/verification:** Represent the reported reached state independently of optional amounts and percentages. Test true with absent, null, and empty individual-limit objects.
- **Status:** Code-supported field-loss defect.

### BUG-013 — P2: Empty credit fields in one bucket hide usable credits in later buckets

- **Evidence:** `src/main/codex/normalize-usage.ts:246-261` selects the first snapshot with a credit-related property that is not undefined and breaks before checking whether the field is usable.
- **Trigger/impact:** First keyed bucket has `credits: null` or `spendControlReached: false`, while a later bucket/fallback has a valid balance. The normalized result loses the valid balance.
- **Improvement/verification:** Define precedence over usable fields and preserve compatible independently reported credit fields. Test empty first bucket followed by a balance/control-bearing bucket.
- **Status:** Code-supported selection defect.

### BUG-014 — P2: Duplicate-date ambiguity does not disable affected comparisons

- **Evidence:** `src/main/codex/normalize-usage.ts:55-59,93-99` claims duplicate rejections make affected comparisons unavailable, but keeps the first row. `src/renderer/routes/UsageRoute.tsx:129-132` passes only accepted days to `computePeriodComparison`; that function never sees rejected-date metadata.
- **Trigger/impact:** Supply 14 consecutive days plus a conflicting duplicate within the compared range. The section becomes partial, yet still publishes a complete comparison based on whichever duplicate appeared first.
- **Improvement/verification:** Track ambiguous dates or exclude them from completeness checks. Test conflicting duplicates in both periods and verify the affected comparison is unavailable.
- **Status:** Code-supported mismatch with the normalizer's documented rule.

### BUG-015 — P2: Missing days do not mark the usage section partial

- **Evidence:** `src/main/codex/normalize-usage.ts:123-142` computes coverage but chooses ready/partial using only rejected records and whether any buckets exist.
- **Trigger/impact:** Valid buckets for Monday and Wednesday with Tuesday absent produce nonempty `coverage.missingDates` but `usage.state: ready`. The incomplete-source banner is absent despite a known hole in the supplied span.
- **Improvement/verification:** Include missing-date coverage in completeness classification, or explicitly revise the UI meaning of ready. Test gapped dates without malformed records.
- **Status:** Code-supported completeness inconsistency.
