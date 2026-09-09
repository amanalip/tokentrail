# Changelog

All notable changes to Token Trail are documented here. Versions appear newest-first; planned work never appears in this file.

## 2.0.0

Published September 9, 2026; the release tag and candidate were prepared September 8. A reliability and correctness release resolving all **40 findings** in the [September 7 audit](bug_audits/bugs_sept7.md), plus the related credit-row improvement IMP-008. This release includes the fixes delivered after 1.0.0; it does not claim that every possible defect or untested environment has been covered.

### Highlights and improvements

- **Choose a Usage date range.** Inclusive start/end controls and an “All supplied dates” reset now drive the chart, table, heatmap, statistics, comparisons, and coverage together. Blank boundaries are unrestricted. Empty, reversed, and incomplete ranges have explicit feedback; the selection survives refreshes. Source-level lifetime and streak summaries remain clearly distinguished from selected-range calculations (BUG-038).
- **Automatic refresh works.** The main process schedules the selected refresh interval, responds to preference changes, and cancels the timer on shutdown (BUG-016).
- **More reliable recovery and diagnostics.** Overlapping reads and preference saves preserve newer state; failures are sanitized and visible; diagnostics report observed capabilities and actual completed refresh attempts.
- **More accurate usage and credit displays.** Signed differences, calendar dates, large counters, credit controls, and missing-day coverage now retain their intended meaning.
- **Stronger package evidence.** Recursive inspection checks application resources and extracted Linux package payloads; provenance requires the exact version/architecture/format inventory and records the installed npm version.

### Fixed: Codex transport and lifecycle

- **BUG-001:** Handle child-stdin pipe errors as sanitized connection failures instead of uncaught stream errors.
- **BUG-002:** Recheck lifecycle ownership after executable discovery so stopping during discovery cannot spawn an unowned child; concurrent starts share startup ownership.
- **BUG-003:** Retain ownership during termination and escalate to SIGKILL after a bounded grace period, cancelling escalation when the child exits.
- **BUG-004:** Apply NDJSON message limits per line so valid messages remain valid across different stream chunk boundaries.
- **BUG-005:** Coalesce a follow-up read when update notifications arrive during a refresh, preventing an absorbed notification from leaving stale quotas.
- **BUG-006:** Rebase quota observations after resets so later deltas and repeated reset transitions remain visible.
- **BUG-007:** Clear session observations across explicit sign-out and observable account-kind changes. Same-kind switches without visible sign-out remain unidentifiable under the non-identifying account contract.
- **BUG-008:** Advertise the manifest application version in the protocol handshake.

### Fixed: normalization, calculations, and credits

- **BUG-009:** Bound sparse-date coverage work and heatmap rendering; long spans show at most 366 heatmap dates with a truncation explanation.
- **BUG-010:** Validate timestamp bounds so positive but unrepresentable dates cannot crash date formatting.
- **BUG-011:** Bound display metadata without discarding otherwise usable quota measurements.
- **BUG-012:** Preserve a standalone spending-control reached flag when control details are absent, null, or empty.
- **BUG-013:** Select usable credit fields independently across buckets so empty early fields cannot hide later balances or controls.
- **BUG-014:** Exclude ambiguous duplicate dates from comparisons and require unambiguous data in both compared periods.
- **BUG-015:** Mark usage with missing dates as partial rather than implying complete coverage.
- **BUG-017:** Display falling token usage as an exact signed difference instead of “Unavailable tokens.”
- **BUG-018:** Format date-only usage buckets in UTC so labels retain their source calendar date in UTC+12 and later timezones.
- **BUG-021:** Retain exact oversized token values in tooltips and tables while disclosing capped chart geometry.
- **BUG-035:** Correct negative whole, fractional, halfway, and rounded-zero percentage formatting.
- **IMP-008:** Preserve reset-only credit controls and use stable keys for duplicate-looking credit rows.

### Fixed: renderer, preferences, and accessibility

- **BUG-019:** Show stale-data warnings on all data routes, not only Overview.
- **BUG-020:** Prevent late initial/refresh replies from overwriting a newer pushed snapshot.
- **BUG-022:** Resize daily charts with their containers and dispose observers, listeners, and chart instances on cleanup.
- **BUG-023:** Honor the time-format preference on Credits and Diagnostics.
- **BUG-024:** Queue rapid preference edits in order, render them optimistically, and roll back failed saves.
- **BUG-025:** Convert bridge failures into sanitized visible workflow errors with retry behavior for snapshot and save operations.
- **BUG-026:** Deduplicate initial preference loading and coordinate queued saves so a concurrent load cannot quarantine a valid replacement.
- **BUG-027:** Distinguish absence, malformed data, and transient I/O failures; preserve recoverable preference files when reading or quarantining fails.
- **BUG-028:** Clearing local data removes the preferences file and uses cached defaults without immediately recreating it.
- **BUG-029:** Count actual completed refresh attempts and outcomes, including failures with identical timestamps, instead of counting snapshot phases.
- **BUG-030:** Report observed executable discovery and endpoint outcomes, distinguishing unknown, unsupported, and discovered-but-empty states. CLI version remains explicitly unknown when the validated handshake provides no version field.
- **BUG-039:** Keep search focus while typing after a Learn deep link.
- **BUG-040:** Respect reduced-motion preferences when navigating to Learn explanations.

### Fixed: development, release tooling, and website

- **BUG-031:** Require successful builds from the current development run before launching Electron; check shutdown state at launch and stop startup when a service exits.
- **BUG-032:** Isolate the requested changelog section so generated notes cannot include later version sections.
- **BUG-033:** Inspect runtime directories recursively, reject unreviewed unpacked resources, and extract AppImage, deb, rpm, and Pacman payloads before scanning; extraction failures fail the gate. Debian control archives are inspected too.
- **BUG-034:** Reject stale versions, other architectures, unexpected files, and missing formats in provenance. Match native artifact filename suffixes and capture npm directly outside npm-managed invocations.
- **BUG-036:** Website copy buttons announce success only after a confirmed clipboard write; failures and unavailable APIs show manual-copy guidance.
- **BUG-037:** Keep the mobile menu label, expanded state, and Escape focus behavior consistent across every close path.
- Release preparation also removes dependence on host `ar` plugins when constructing the Debian test canary, validates both architecture inventories, and gates tagged release assembly on verification and extracted-package inspection.

### Upgrade and compatibility

- Close 1.0.0, verify the new artifact against `SHA256SUMS.txt`, then replace the AppImage or upgrade with your package manager. No automatic updater or network update check is introduced.
- The preferences schema and storage location are unchanged. Usage and session observations remain in memory and restart with the process. No history migration is required.
- Packages remain available in four Linux formats for x64 and arm64. Filenames use each format's actual architecture suffix; consult the download table in the release notes.
- No dependency upgrade, telemetry, additional Codex read surface, artifact signing, or persistent usage storage is introduced by this release.

### Verification and known limitations

- Focused regressions accompany the fixes; the audit records fix commits and actual verification evidence. Release-specific local, hosted, artifact, and publication evidence is recorded in `tests/test_reports/2.0.0/test_report.md`.
- Artifacts remain **unsigned**. arm64 execution, native deb/rpm/Pacman install/upgrade/uninstall campaigns, broader desktop/distribution coverage, and human screen-reader validation remain outside the verified coverage. See [Known limitations](docs/support/known-limitations.md).

## 1.0.0

Released August 22, 2026. The complete v1 read-only product scope, implemented and verified across development versions 0.1.0 through 0.5.3 with evidence recorded under `tests/test_reports/`, and re-validated green on the full automated matrix against this release commit.

### Added

- Read-only Overview dashboard fed by an owned local Codex app-server process: quota windows with used/remaining percentages, reset times, countdowns, provenance labels, and freshness states.
- Quota Windows route with grouping, sorting, raw-safe details, reset timeline, attention ordering, and session-change observations kept in memory only.
- Usage route with date-range controls, daily chart (lazy-loaded), calendar heatmap distinguishing positive/reported-zero/missing days, accessible table, statistics, strict complete-period comparisons, and coverage reporting.
- Credits route with balance, unlimited state, spending limits, reached state, and reset-credit expiry overview using the exact seven-day display rule.
- Learn route explaining quotas, tokens, credits, provenance, privacy, and statistics with contextual navigation from metrics and errors.
- Settings & Diagnostics with light/dark/system themes, refresh choices, fully previewed redacted diagnostics export through a native save dialog, clear-data confirmation, and sanitized health counters.
- Hardened Electron shell: sandboxed renderer, context isolation, strict self-hosted CSP, deny-by-default navigation/popup/permission/download policy, single-instance enforcement, and Electron fuses.
- Linux distribution as four package formats (AppImage, deb, rpm, Pacman) for x64 and arm64 with desktop entries whose names match runtime window identity (`tokentrail`), hicolor icons, and AppStream metadata in native packages.
- Continuous integration on every pull request and main push; tag-driven pipeline assembling checksums, build provenance, and a CycloneDX SBOM onto one maintainer-reviewed draft prerelease.
- User guides for getting started, installing, upgrading, troubleshooting, uninstalling, and privacy; architecture records covering the full system including packaging and release engineering.
- Structured draft-release notes generated from the tagged changelog, carrying highlights, security posture, fixes, download inventory with per-format architecture labels, checksum verification steps, documentation links pinned to the release tag, upgrade notes, and known-limitation references.

### Security

- Renderer isolation verified in development, built, and packaged modes on both display-server backends; no Node, Electron, or generic IPC surface reaches web content.
- Codex access restricted to three approved reads plus one update notification, allowlisted before transport, size-guarded, validated with closed schemas, and normalized with field-level provenance; errors are redacted before crossing the privileged boundary.
- No telemetry, no update checks, no network clients; usage data exists only in memory and never persists.

### Fixed

- Aggregate token activity (the Usage route) now renders against current Codex CLI installations. Real Codex app-server responses name the usage bucket array `dailyUsageBuckets` with `startDate` keys and the longest-turn counter `longestRunningTurnSec`, while Token Trail validated only the originally reviewed spellings: so every real read failed schema validation and the section showed as permanently unavailable while quota windows kept working. Both observed spellings now validate to one internal shape, a missing bucket array reads as honest unavailable content rather than a failed read, and one malformed bucket record is counted as a rejection instead of erasing its valid neighbors.
- Navigating to the Usage route now reliably moves keyboard and assistive-technology focus onto the route heading. The move was previously skipped whenever the Usage screen's lazy-loaded chunk was still mounting behind its loading fallback, leaving keyboard users on the navigation link they had activated.

### Known limitations

- See `docs/support/known-limitations.md`; unsigned artifacts and untested environments are named there rather than implied away.
