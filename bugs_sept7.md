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
