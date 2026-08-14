# Token Trail Commit Tracker

This document records the important outcome of each project commit in reverse chronological order. It complements Git history: Git remains the authoritative source for exact file changes, while this tracker explains why a change mattered and what was learned.

All displayed times use the `America/Toronto` timezone. Lessons are recorded only when supported by the project history or conversation; unknown lessons are marked as not recorded rather than invented.

## Contents

- [What each entry tracks](#what-each-entry-tracks)
- [Tracking rules](#tracking-rules)
- [Verification standards](#verification-standards)
- [Current uncommitted work](#current-uncommitted-work)
- [Commit 020 - Architecture documentation expanded](#commit-020---architecture-documentation-expanded)
- [Commit 019 - Phase 3 requirements and test evidence reorganized](#commit-019---phase-3-requirements-and-test-evidence-reorganized)
- [Commit 018 - Phase 2 core read-only slice completed](#commit-018---phase-2-core-read-only-slice-completed)
- [Commit 017 - Development CSP repair planned](#commit-017---development-csp-repair-planned)
- [Commit 016 - Token Trail branding clarified](#commit-016---token-trail-branding-clarified)
- [Commit 015 - Phase 1 secure Electron foundation completed](#commit-015---phase-1-secure-electron-foundation-completed)
- [Commit 014 - Commit history reconciled](#commit-014---commit-history-reconciled)
- [Commit 013 - GitHub release workflow documented](#commit-013---github-release-workflow-documented)
- [Commit 012 - Privacy-safe v1 insights approved](#commit-012---privacy-safe-v1-insights-approved)
- [Commit 011 - Electron product specification and security plan approved](#commit-011---electron-product-specification-and-security-plan-approved)
- [Commit 010 - Linked references and verification reports added](#commit-010---linked-references-and-verification-reports-added)
- [Commit 009 - Markdown contents navigation added](#commit-009---markdown-contents-navigation-added)
- [Commit 008 - Tracked Trail logo direction documented](#commit-008---tracked-trail-logo-direction-documented)
- [Commit 007 - Tracker filename normalized](#commit-007---tracker-filename-normalized)
- [Commit 006 - Tracker expanded and reordered](#commit-006---tracker-expanded-and-reordered)
- [Commit 005 - Commit tracker introduced](#commit-005---commit-tracker-introduced)
- [Commit 004 - README aligned with Token Trail](#commit-004---readme-aligned-with-token-trail)
- [Commit 003 - KDE and Electron directions compared](#commit-003---kde-and-electron-directions-compared)
- [Commit 002 - Product specification created](#commit-002---product-specification-created)
- [Commit 001 - Repository initialization](#commit-001---repository-initialization)

## What each entry tracks

| Field | Purpose |
| --- | --- |
| Commit | Short hash linked to the exact Git change when a repository URL is available |
| Timestamp | Commit author time converted to Toronto local time, including timezone abbreviation and UTC offset |
| Intent | Why the change was made |
| Important changes | The meaningful outcome rather than a line-by-line file list |
| Decisions and assumptions | Product or technical direction introduced or affected |
| Verification | Checks performed and checks still missing |
| Fact check | Sources consulted, links checked, claims confirmed, and any remaining uncertainty |
| Sanity check | Consistency, scope, usability, security, and project-fit review |
| User learning | Useful understanding established for the project owner |
| Agent learning | Context the agent should carry into later work |
| Risks or limitations | Known gaps, uncertainty, or debt introduced by the commit |
| Follow-up | The safest useful next step; it is not automatic authorization to perform it |

Commit-message quality, related decision-log entries, and whether a change affects privacy, security, compatibility, packaging, or user-visible behavior should also be noted when relevant.

## Tracking rules

- Committed entries follow Git's newest-to-oldest order so the latest commit appears first.
- Current uncommitted work appears before committed history but remains clearly separated from actual commits.
- Commit hashes, timestamps, subjects, and changed files come from Git, not memory.
- A documentation commit is still tracked when it materially changes project scope or understanding.
- Uncommitted work is kept in a separate section and is never presented as a commit.
- The commit that creates or edits this tracker cannot reliably contain its own final hash without amending history. It starts as pending work and should be finalized by a later tracker update.
- A lesson describes what became clearer; it does not assign blame.
- Every new current and committed entry includes decisions, verification, fact check, sanity check, user learning, agent learning, risks, and follow-up. If a section has no new information, it says `No new learning` or `None identified` instead of being omitted. Older entries retain their historical schema unless they are otherwise reconciled.
- Historical commit subjects, hashes, and quoted wording remain exact even when later naming decisions use different product copy.
- Fact-check and sanity-check reports are included for every meaningful change moving forward.
- A fact check names the evidence used and distinguishes confirmed facts from estimates, opinions, or untested assumptions.
- A sanity check asks whether the change is coherent with project scope, privacy, security, naming, navigation, and existing decisions.
- Approval to document a future action does not authorize implementation, publication, pushing, or release.

## Verification standards

### Fact-check report

A fact-check report should cover the claims that could be verified for that change. Depending on the work, this may include:

- Git hashes, authors, timestamps, subjects, and file statistics read from Git.
- Technical behavior checked against primary or project-maintained documentation.
- External links checked for a successful response and corrected when they fail.
- Local paths, dimensions, formats, calculations, and version observations checked with appropriate tools.
- Estimates and judgments labeled honestly when they cannot be proven by the available evidence.

### Sanity-check report

A sanity-check report should confirm that the change makes sense within Token Trail as a whole. It should look for:

- Conflicts with approved decisions, privacy rules, security boundaries, or current planning status.
- Broken navigation, duplicated information, stale terminology, and inconsistent filenames.
- Unnecessary scope growth or language that implies unapproved implementation.
- Usability problems, confusing metaphors, unsupported claims, and missing edge cases.
- Verification gaps that should remain visible to future readers.

---

## Current uncommitted work

**First recorded:** August 14, 2026 after commit `39f4d13`
**Last updated:** August 14, 2026 at 12:08 PM EDT (`America/Toronto`, UTC-04:00)
**State:** Pending; not yet a Git commit when this entry was written

### Intent

Complete the planned documentation lifecycle through Phases 4, 5, and 6 so the final project explains product quality, distribution, user operation, support, release validation, and maintenance in addition to source architecture.

### Important changes

- Added five Phase 4 product-quality/support documents plus the required evidence update to accessibility architecture.
- Expanded Phase 5 to include supply-chain and artifact/versioning architecture.
- Added six exact user guides for getting started, installation, upgrading, troubleshooting, uninstalling, and privacy.
- Added Phase 6 release validation, support policy, maintenance/compatibility, rollback/incident response, known-limitations, and release-checklist documents.
- Required final changelog and version-specific release notes from verified changes.
- Expanded the specification's planned repository shape and documentation timing rules.
- Moved the superseded KDE product proposal to `docs/kde_alternate_ideation/PRODUCT_SPEC.md`, labeled it historical, and updated active references while preserving the Electron specification as controlling.

### Decisions and assumptions

- Documentation completeness covers developers, users, release maintainers, support, and incident handling—not only component architecture.
- Files are created during their owning phase and promoted from planned to implemented/tested only from evidence.
- Accessibility receives one evolving architecture document rather than duplicate Phase 3 and Phase 4 files.
- Support promises cannot exceed the verified compatibility matrix.
- Historical alternate specifications remain available for context but are physically separated from active architecture and controlling product documents.

### Verification

- Phase heading numbering, planned filenames, document ownership, local Markdown links, and whitespace are checked.
- Application tests are not rerun because this change modifies Markdown only.

### Fact-check report

- Git confirms the prior architecture expansion was committed as `39f4d13` before this work began.
- The added tasks map directly to existing Phase 4 quality, Phase 5 packaging/release, and Phase 6 validation/publication responsibilities.
- No future document is presented as an existing file or implemented capability.
- The KDE specification's content remains present at its new path, and active links now resolve there.

### Sanity-check report

- The expanded documentation scope does not add product features, network behavior, release authority, or support claims.
- Documents are assigned to the phase that can produce their evidence, avoiding speculative current-state prose.
- User documentation and operational documentation are separated from architecture while remaining part of the final completion gate.
- Moving the KDE proposal does not change the approved Electron framework decision or revive KDE scope.

### User lessons

- A complete project record includes how users install and recover, how maintainers release and patch, what is supported, and how incidents are handled.
- Documentation can be comprehensive without being speculative when every file has an owning phase and evidence gate.
- Separating alternate ideation prevents a historical product specification from appearing to be the active document at the `docs/` root.

### Agent lessons

- Audit documentation coverage across the whole lifecycle: design, implementation, quality, distribution, operation, support, incident response, and maintenance.
- Do not satisfy documentation completeness by placing every topic in architecture; use user, support, release, and maintenance collections where appropriate.
- Treat documentation walkthroughs as verification for installation, upgrade, uninstall, and release procedures.
- When moving a historical document, preserve its context, update active links and repository maps, and retain exact old paths only where describing historical Git facts.

### Risks or limitations

- The larger documentation set creates maintenance cost; phase exit checks must prevent stale or contradictory files.
- Final support and incident-response detail depends on actual packages, workflows, and observed compatibility and therefore remains planned.

### Follow-up

Review and commit this phase-wide documentation plan. Create and validate each file only during its assigned phase.

---

## Commit 020 - Architecture documentation expanded

**Commit:** `39f4d13` - `Expand architecture documentation and phase-gate planned documents`
**Timestamp:** August 14, 2026 at 11:39:42 AM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Complete the currently implemented architecture picture without describing future systems as built, and schedule exact Phase 3 and Phase 5 architecture documents alongside their implementations.

### Important changes

- Added detailed implemented-system documents for repository/build, error/recovery, domain/provenance, security boundaries, and configuration/environments.
- Expanded the architecture reading order and ownership/update-trigger table to include all five documents.
- Added exact Phase 3 filenames for calculations, preferences, diagnostics, navigation, and accessibility architecture.
- Added exact Phase 5 filenames for packaging, GitHub release pipeline, and installation/upgrade architecture.
- Updated the specification and implementation plan to require future documents to remain planned until backed by actual systems and tests.

### Decisions and assumptions

- Current architecture documents may explain only implemented behavior and explicit present limitations.
- Planned documents are created during their owning phase, then promoted from planned to implemented only after code/workflow and evidence exist.
- Topic documents complement rather than replace the data inventory, threat model, compatibility record, and design-decision log.

### Verification

- Local Markdown links, expected architecture files, old status wording, heading numbering, and whitespace are checked.
- Application tests are not rerun because this change modifies documentation only.

### Fact-check report

- Git confirms commit `39f4d13`, author Aman Ali, timestamp August 14, 2026 at 11:39:42 AM EDT, 9 changed files, 387 insertions, and 28 deletions.
- Repository source and Phase 2 tests were used to describe current build, lifecycle, categories, domain DTOs, trust boundaries, configuration inputs, and known limitations.
- No packaging workflow, update client, preference store, diagnostic export, or Phase 3 route is described as currently implemented.

### Sanity-check report

- The five new documents fill current-system gaps without duplicating future Phase 3 or Phase 5 implementation detail.
- Future document creation is tied to existing phase gates, so documentation work cannot silently expand product capability.
- No code, test evidence, report location, privacy boundary, or release state changes in this work.

### User lessons

- The architecture set now covers how the repository builds, how errors recover, what the trusted domain means, how security controls compose, and which environment inputs are accepted.
- Future architecture can be tracked in detail without presenting planned behavior as fact.

### Agent lessons

- A complete architecture picture needs cross-cutting documents in addition to component documents.
- Every future-looking architecture file needs an owning phase and an evidence-based transition from planned to implemented.
- Keep errors, configuration, and build systems documented explicitly; they are architecture, not incidental implementation detail.

### Risks or limitations

- The architecture set will become stale if Phase 3 changes are implemented without completing their paired documents.
- Phase 5 document detail remains intentionally absent until real workflows and packages exist.

### Follow-up

The architecture expansion is committed. Create the planned Phase 3 and Phase 5 documents only during their scheduled implementation work.

---

## Commit 019 - Phase 3 requirements and test evidence reorganized

**Commit:** `b614cdd` - `Document Phase 3 requirements and reorganize test evidence`
**Timestamp:** August 14, 2026 at 11:24:53 AM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Record the user's Phase 3 native-window icon and primary-number readability requirements, expand the implemented-system architecture guide, and organize durable test evidence under `tests/test_reports/<version>/`.

### Important changes

- Added Phase 3 tasks and acceptance checks for the live `BrowserWindow` icon independently from installed package metadata.
- Added a representative glyph matrix for `11%`, `47%`, `48%`, `88%`, and `100%` across themes, zoom, and compact layout.
- Added an architecture index plus detailed system, lifecycle, adapter, IPC, renderer-state, runtime/CSP, and testing documents.
- Moved the 0.1.0 and 0.2.0 reports, screenshots, and metrics into `tests/test_reports/<version>/` and updated every documented path convention.
- Added `tests/README.md` so contributors can distinguish executable suites from durable version evidence immediately.

### Decisions and assumptions

- The default Electron lightning-bolt icon is a product-identity defect wherever a desktop exposes it.
- Runtime-window identity and package/desktop-entry identity are separate layers and require separate evidence.
- Current architecture documents describe implemented behavior; future subsystem documents arrive with their implementation.
- Executable suites stay at `tests/<suite>/`; durable version evidence belongs at `tests/test_reports/<version>/`.

### Verification

- Git status and history were re-read before tracker reconciliation.
- Local Markdown targets, stale old report paths, document structure, and whitespace are checked after the move.
- Application tests are not rerun because this work changes Markdown and evidence locations only; no executable source changed.

### Fact-check report

- Git confirms commit `b614cdd`, author Aman Ali, timestamp August 14, 2026 at 11:24:53 AM EDT, 23 changed files, 571 insertions, and 32 deletions.
- The supplied screenshots visibly show Electron's default window icon and dense large-number spacing.
- Both version directories now exist below `tests/test_reports/` with their reports, metrics, and screenshots intact.

### Sanity-check report

- The new UI requirements remain Phase 3 work and do not reopen or mislabel Phase 2 evidence.
- Final vector assets and broad Linux desktop certification remain Phase 4.
- Documentation expansion introduces no new runtime, data, network, or release capability.

### User lessons

- A packaged icon does not automatically set the live Electron window icon during development.
- Numeric display quality must be tested with difficult digit combinations, not one convenient fixture value.
- Architecture documents are now connected through a recommended reading order and ownership/update table.

### Agent lessons

- Test native window chrome and installed desktop metadata independently.
- Treat typography as data-dependent: representative glyphs, width, theme, and zoom belong in acceptance evidence.
- Re-read Git before updating a pending tracker entry because the user may have committed the prior work.
- Directory conventions must be updated everywhere when evidence moves, including historical links and future examples.

### Risks or limitations

- Automated screenshots may omit compositor-owned window chrome; Phase 3 may need explicit manual icon evidence.
- The new architecture documents require ongoing synchronization as Phase 3 adds routes, preferences, and diagnostics.

### Follow-up

The requirements and evidence layout are committed. Use them during Phase 3; do not publish a release.

---

## Commit 018 - Phase 2 core read-only slice completed

**Commit:** `f8d1b9b` - `Refactor token tracking workflows and supporting components`
**Timestamp:** August 14, 2026 at 11:08:04 AM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Implement and verify the complete Phase 2 read-only Codex-to-Overview slice, repair development styling without weakening production, correct visible product identity, and create the screenshot-backed 0.2.0 evidence record.

### Important changes

- Added the owned Codex stdio client, runtime limits/schemas, normalization, in-memory controller, exact IPC authorization, and frozen three-method preload bridge.
- Replaced the Phase 1 placeholder with a responsive accessible Overview covering complete, partial, stale, signed-out, unsupported, unavailable, and error states.
- Added the `Token Trail` package/window/HTML/accessibility identity and a new single-mark icon without the duplicate corner mark or embedded wordmark.
- Separated exact-loopback development CSP from strict packaged CSP and added real CSS-load/HMR testing through the development orchestrator.
- Expanded fixture, unit, integration, Electron, packaged, security, accessibility, performance, and screenshot evidence.
- Added `tests/test_reports/0.2.0/test_report.md` and updated the controlling plan, specification, architecture, decisions, README, and this tracker.

### Decisions and assumptions

- Raw app-server values stop in main. Renderer data is a closed, provenance-aware DTO and is held in memory only.
- Missing and invalid values are unavailable, never zero. Sparse notifications trigger a safe full read instead of an uncertain merge.
- Development alone permits the Vite inline-style/HMR mechanisms. Packaged CSP remains strict and independently tested.
- Automatic polling stays disabled pending evidence. Phase 3 extends the proven boundary; it does not bypass it.

### Verification

- 77 unit/component tests and 13 real-process integration tests pass.
- 10 Electron end-to-end, 2 real-development, 3 security, 2 accessibility, 1 packaged, and 1 performance test pass.
- Type checking, formatting during development, package creation, and npm audit pass; audit reported zero known vulnerabilities.
- A privacy-safe probe confirms installed `codex-cli 0.146.1` supports initialization, account read, and rate-limit read.
- Full command results, screenshots, performance, coverage, environment, and unavailable coverage are recorded in `tests/test_reports/0.2.0/test_report.md`.

### Fact-check report

- Git confirms commit `f8d1b9b`, author Aman Ali, timestamp August 14, 2026 at 11:08:04 AM EDT, 61 changed files, 4,578 insertions, and 423 deletions.
- The real Codex probe disclosed only compatibility booleans/counts, and packaged tests used an empty isolated `PATH` and `HOME`.
- The 0.2.0 fixtures are synthetic and contain no real account values. The report identifies the exact fixture and no-account origin of each screenshot.

### Sanity-check report

- No write, prompt, task, repository, filesystem, credential, telemetry, update, or release capability was added.
- `Token Trail` is visible; `tokentrail` remains machine-facing; `TokenTrail` remains only in conventional source symbols.
- The package is a local test artifact only. No GitHub Release, signing action, update deployment, or publication occurred.
- Phase 2 is complete locally; Phase 3 and later follow-up work remain clearly separate.

### User lessons

- Electron development, built-content, and packaged-executable paths are materially different and each needs direct evidence.
- The Overview now reads local Codex account/quota state through a privacy boundary rather than reading a website or GitHub-hosted page.
- A GitHub release is still a later packaging/publication mechanism; completing Phase 2 does not publish or update anyone's installation.
- Synthetic screenshot fixtures make the interface reviewable without exposing the user's real account.

### Agent lessons

- JSON has no `undefined` value. Optional request parameters must be omitted from the envelope, not sent through a generic JSON-value validator; the expanded fixture exposed and now protects this distinction.
- Starting tests through an npm wrapper obscured ownership of the real development children and once left the exact orchestrator on port 5173. Starting `scripts/dev.mjs` directly gives the harness one owned process whose cleanup terminates its children.
- A CSP string test and a successful HTTP readiness check cannot prove authored development CSS loaded. Computed styles and a real HMR edit are required.
- Packaged tests must isolate executable discovery and the home directory so a test cannot accidentally read the maintainer's Codex account.
- Experimental protocol schemas must strip known sensitive fields and unknown future fields before normalization. Missing data is not evidence of zero.
- A circuit breaker must provide a recovery opportunity after cooldown; otherwise a restart-limit check can permanently prevent its own recovery.
- Coverage percentages fell when the process adapter entered the unit coverage denominator because its transport behavior lives in a separate integration project. Coverage is reported honestly alongside behavior-layer results rather than optimized cosmetically.
- Re-read Git before tracker edits: the prior documentation was committed while work paused and must be recorded as Commit 017.

### Risks or limitations

- Packaged proportional memory is 303.8 MB and resident memory is 757.1 MB across seven processes; Phase 4 must profile and set the final budget.
- GNOME, X11, arm64, installer formats, screen reader, lifecycle soak, and release CI remain untested here and are scheduled later.
- Aggregate usage is approved but unused until Phase 3. No automatic periodic refresh is enabled.

### Follow-up

Phase 2 is committed. Review the 0.2.0 evidence before beginning Phase 3; do not publish a release.

---

## Commit 017 - Development CSP repair planned

**Commit:** `4fba55e` - `Document development CSS/CSP limitation and Phase 2 remediation plan`
**Timestamp:** August 14, 2026 at 2:53:43 AM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Record the unstyled development defect, its Phase 1 test gap, and a secure Phase 2 repair plan before executable work resumed.

### Important changes

- Added the development CSP parity plan to the specification and implementation plan.
- Added Decision 009 and threat T-019.
- Corrected the Phase 1 test report and README so packaged styling was not mistaken for development styling.
- Reconciled the preceding branding documentation in the tracker.

### Decisions and assumptions

Production CSP stays strict. Any Vite compatibility behavior must be development-only, exact-loopback, explicit, and covered by real development and packaged tests.

### Verification

The commit changed 7 files with 180 insertions and 42 deletions. Documentation whitespace, local links, and the Vite/CSP causal chain were checked before commit; application tests were not required for that documentation-only change.

### Fact check and sanity check

Git confirms hash, subject, author, timestamp, and statistics. The change did not start Phase 2, modify executable policy, publish, or weaken production.

### User learning

Packaged and development styling use different delivery mechanisms and require separate evidence.

### Agent learning

HTTP readiness, semantic accessibility, and packaged screenshots do not prove development CSS compatibility. Test each materially different runtime path.

### Risks or limitations

The executable defect remained open until the next uncommitted Phase 2 implementation.

### Follow-up

Implement the planned repair without weakening production; this is now included in the current Phase 2 work above.

---

## Commit 016 - Token Trail branding clarified

**Commit:** `fa82dd2` - `Clarify Token Trail branding and update commit tracker`
**Timestamp:** August 14, 2026 at 2:41:19 AM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Separate the visible **Token Trail** product name from the `tokentrail` repository and machine identifiers, schedule the executable correction, and restore complete learning records.

### Important changes

- Updated active documentation to use **Token Trail** while preserving exact machine identifiers, source identifiers, and historical Git wording.
- Added a detailed Phase 2 naming checklist for the logo wordmark, interface, titles, accessibility names, package metadata, tests, and screenshots.
- Added Design Decision 008 and amended the Phase 1 report to record the visible missing-space defect honestly.
- Reconciled Phase 1 as Commit 015 and made learning and other tracker sections mandatory for new entries.

### Decisions and assumptions

- People see **Token Trail**; repository, package, executable, protocol, artifact, and application identifiers may use `tokentrail`.
- `TokenTrail` may appear in conventional source symbols but cannot become interface copy automatically.
- Phase 1 screenshot evidence remains unchanged and records the tested defect until Phase 2 replaces it.
- Phase 2 was planned but not started.

### Verification

- The commit changed Markdown only.
- Documentation whitespace and local file-link targets were checked before commit.
- Active prose used **Token Trail** except for deliberate machine, source, historical, and defect references.

### Fact-check report

- Git records commit `fa82dd2`, author Aman Ali, timestamp August 14, 2026 at 2:41:19 AM EDT, 12 changed files, 367 insertions, and 214 deletions.
- The Phase 1 screenshot visibly contains the old `TokenTrail` heading and logo wordmark.

### Sanity-check report

- The change did not rename repository or protocol identifiers unnecessarily.
- It did not claim that the tested Phase 1 binary already displays the corrected name.
- It did not start Phase 2 or change executable behavior.

### User lessons

- Repository identity and product identity serve different purposes: `tokentrail` is machine-facing, while **Token Trail** is the visible application name.
- Screenshot evidence can reveal naming defects and should remain honest until a corrected build is tested.

### Agent lessons

- Never derive visible product copy from repository, package, executable, or source identifiers.
- Audit naming separately across text, logo wordmarks, accessibility names, window metadata, desktop metadata, tests, and screenshots.
- Never omit learning sections; use `No new learning` when there is genuinely nothing new to record.
- Reconcile Git after the user commits so finalized work is not left in the pending section.

### Risks or limitations

- The executable and screenshot still use `TokenTrail` until Phase 2 implements and verifies the correction.
- Exact historical commit subjects and old quoted labels may retain the previous spelling.

### Follow-up

Implement and visually verify the naming correction at the start of Phase 2 after the user authorizes development to continue.

---

## Commit 015 - Phase 1 secure Electron foundation completed

**Commit:** `75bb8f5` - `Complete Phase 1 secure Electron foundation`
**Timestamp:** August 14, 2026 at 2:29:26 AM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Build and verify the hardened Electron foundation before introducing real Codex data or a renderer privilege surface.

### Important changes

- Added exact dependencies, lockfile, strict TypeScript projects, separate Vite builds, formatting, linting, coverage, fixture integration, Playwright, and electron-builder configuration.
- Implemented the sandboxed Electron window, restrictive `tokentrail://app/` protocol, CSP, denied navigation and permissions, empty frozen preload bridge, single-instance lifecycle, ASAR packaging, and production fuses.
- Added closed Codex request and notification allowlists, protocol bounds, exact large-decimal handling, renderer-safe errors, and allowlist-built diagnostics with secret canaries.
- Added unit, component, fixture, end-to-end, accessibility, security, packaged, coverage, and performance suites.
- Added architecture, threat, data, dependency, and protocol records plus a screenshot-backed `tests/test_reports/0.1.0/test_report.md`.
- Replaced the duplicate-mark logo asset and captured the tested packaged shell.

### Decisions and assumptions

- Phase 1 reads no real Codex account data and exposes no renderer IPC method.
- Phase 2 will use an owned `codex app-server` stdio child unless later evidence requires revisiting the lifecycle.
- Production fuses remain strict even though packaged testing therefore needs a normal process plus test-only loopback CDP.
- Unavailable GNOME, X11, arm64, installer, and clean-distribution evidence stays visible rather than being inferred.

### Verification

- `npm run verify` passed formatting, lint, strict type checks, 46 unit and component tests, and one fixture integration test.
- V8 coverage recorded 97.91 percent statements, 96.96 percent branches, 100 percent functions, and 97.82 percent lines.
- Two development Electron, two accessibility, two security, one packaged-smoke, and one packaged-performance test passed.
- `npm audit` reported zero known vulnerabilities.
- The package used a 704,181-byte explicit ASAR and the reviewed fuse posture.

### Fact-check report

- Git records commit `75bb8f5`, author Aman Ali, timestamp August 14, 2026 at 2:29:26 AM EDT, 74 changed files, 10,673 insertions, and 67 deletions.
- Packaged evidence recorded 1,002.7 ms cold startup, 909.3 ms warm startup, 0.57 percent idle CPU, 717.7 MB summed RSS, and 276.2 MB proportional memory on KDE Wayland x64.
- The commit contains no GitHub workflow, public release, installer matrix, signing secret, telemetry, or real Codex connection.

### Sanity-check report

- Renderer isolation, navigation denial, the closed Codex allowlist, bounded fixtures, and package fuses align with the threat model.
- The foundation remains inside the approved read-only scope.
- The provisional memory miss is visible and not converted into a passing target.

### User lessons

- Electron application upgrades will use versioned packages and future GitHub Releases, not GitHub Pages deployment.
- Phase 1 is a secure development foundation rather than a public release or completed dashboard.
- Versioned reports contain screenshots from the app actually tested and retain visible limitations.
- Startup met the provisional target, while Electron memory remained above the provisional ceiling.

### Agent lessons

- Production Electron fuses can invalidate Playwright's ordinary Electron launcher assumptions; packaged tests need the reviewed normal-process plus local CDP strategy.
- Both summed RSS and proportional memory must be reported because shared Chromium pages affect their interpretation.
- Protocol methods, bounds, error categories, and diagnostic fields must be centralized and deny unknown values by default.
- Teaching-style comments still require focused functions and precise names; comments cannot compensate for unclear design.
- Phase evidence is incomplete until the final tested screenshot is visually inspected and embedded in the versioned report.
- Packaged rendering evidence does not cover `npm run dev`; Vite's development-time CSS injection must be tested under the actual development CSP.

### Risks or limitations

- KDE Wayland x64 is the only measured desktop and architecture.
- The provisional memory target is missed and remains Phase 4 work.
- No real Codex connection, installer matrix, release workflow, signing, update behavior, or public artifact exists.
- The committed Phase 1 build displays the unspaced `TokenTrail` label; Decision 008 schedules correction for Phase 2.
- The committed `npm run dev` path blocks authored CSS because Vite injects development styles inline while CSP permits only self-hosted styles; the production package remains styled because it extracts CSS to a file.

### Follow-up

Complete the approved product-name correction before the Phase 2 read-only Overview implementation, after the user authorizes Phase 2 to start.

---

## Commit 014 - Commit history reconciled

**Commit:** `ed54725` - `Reconcile commit tracker with latest documentation commits`
**Timestamp:** August 14, 2026 at 1:11:35 AM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Finalize the commit-tracker records for the approved privacy-safe insights and GitHub release workflow using exact Git evidence.

### Important changes

- Added finalized records for Commit 012 and Commit 013.
- Preserved their decisions, verification, fact checks, sanity checks, lessons, risks, and follow-up work.

### Decisions and assumptions

- Git remains authoritative for commit identity and file statistics.
- Reconciliation documents already committed decisions without changing their scope.

### Verification

- Git records 105 insertions and 3 deletions in `commit_tracker.md`.
- Commit hash, author, timestamp, subject, changed file, and statistics were read directly from Git.

### Fact-check report

- The commit changed only the tracker and did not alter the Electron specification or application behavior.
- The recorded Commit 012 and Commit 013 metadata matches the repository history.

### Sanity-check report

- The change improved project history without implying that planned application or release work had already occurred.

### User lessons

- Documentation-only commits still matter when they change approved product or release behavior.
- The tracker explains why a commit matters, while Git retains the exact patch and metadata.

### Agent lessons

- Finalize pending tracker entries promptly after the user commits so committed work is not left labeled uncommitted.
- A reconciliation entry must preserve earlier decisions and learnings rather than reducing them to file statistics.

### Risks or limitations

- A tracker reconciliation can describe only evidence available in Git and the recorded conversation; it must not invent missing intent.
- The reconciliation commit could not record its own final hash until a later update, which Commit 015 now supplies through repository history.

### Follow-up

Record the next meaningful project change as current uncommitted work, then finalize this entry through the normal later reconciliation process.

---

## Commit 013 - GitHub release workflow documented

**Commit:** `f7e97a2` - `Document GitHub release workflow and update phases`
**Timestamp:** August 14, 2026 at 1:08:12 AM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Define how approved Token Trail versions become reviewable Linux release artifacts without allowing ordinary pushes to publish application updates.

### Important changes

- Selected standard GitHub-hosted Actions runners for release builds and GitHub Releases for public distribution.
- Required an approved version commit and matching immutable tag such as `v0.1.0` to begin a release.
- Required frozen dependency installation, quality and security checks, architecture-specific builds, checksums, and draft releases.
- Added maintainer review before publication and separated stable releases from prereleases.
- Clarified that v1 uses manual GitHub Release downloads and does not install updates automatically.

### Decisions and assumptions

- Normal branch pushes do not publish application updates.
- User-facing installers are GitHub Release assets rather than committed repository files or temporary Actions artifacts.
- Release workflows use least privilege, reviewed pinned Actions, and a protected release environment.
- GitHub release immutability is enabled at the repository level, so a published tag and its assets are replaced only by publishing a new version.

### Verification

- Git records 14 insertions and 4 deletions in `product_spec_electron.md`.
- Commit hash, author, timestamp, subject, changed file, and statistics were read directly from Git.
- The documentation diff passed `git diff --check` before the commit.

### Fact-check report

- The repository was confirmed public through an unauthenticated GitHub request.
- GitHub documentation confirmed that standard hosted runners are free for public repositories and that GitHub Releases supports downloadable binary assets.
- No workflow file or installer existed in this commit; the change remained a release plan.

### Sanity-check report

- The workflow is consistent with the specification's manual-first update policy and release-integrity requirements.
- Draft review plus immutable published releases prevents silently replacing an installer under an existing version.
- The change does not resolve the separate signing-identity decision or authorize implementation.

### User lessons

- A version tag initiates the future packaging workflow; an ordinary code push does not update installed applications.
- GitHub Actions will build the artifacts, while GitHub Releases will present them for download.
- Published immutable releases require fixes to use a new version such as `v0.1.1`.

### Agent lessons

- Release documentation must distinguish temporary CI artifacts from durable user-facing release assets.
- Repository release settings, workflow permissions, and human publication review are part of the packaging design.

### Risks or limitations

- The Electron application and release workflow are not implemented yet.
- Linux signing identity, exact runner matrix, update-check behavior, and packaged smoke testing remain future work.

### Follow-up

After the Electron scaffold exists, implement and test the packaging workflow under separate authorization.

---

## Commit 012 - Privacy-safe v1 insights approved

**Commit:** `a13e6b8` - `Document approved TokenTrail insights and product requirements`
**Timestamp:** August 13, 2026 at 6:16:08 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Add only reliable, secure v1 insights that can be derived from Token Trail's already approved account, rate-limit, and aggregate-usage reads. Define detailed interfaces, exact formulas, unavailable states, privacy boundaries, and tests before implementation.

### Important changes

- Added nine required v1 insights: reset timeline, quota attention ordering, current-session changes, complete-period comparison, calendar heatmap, descriptive activity statistics, data coverage, reset-credit expiry visibility, and combined capacity summary.
- Added five detailed ASCII interface groups for the new features.
- Added functional requirements FR-011 through FR-019.
- Added exact calculation, ordering, completeness, precision, reset-transition, expiry, and availability rules.
- Added protocol fixtures, security assertions, privacy assertions, and product acceptance criteria for the new behavior.
- Updated the Codex evidence section to link the current official App Server documentation.
- Added Design Decision 006 while preserving the earlier Electron decision as historical context.
- Kept workspace messages, model catalogs, thread monitoring, forecasts, and retained analytics outside this approval.
- Finalized the previous Electron specification work as Commit 011.

### Decisions and assumptions

- No new Codex method is approved.
- Missing daily dates remain unknown and never become zero.
- Period comparisons require complete consecutive dates for both periods.
- Current-session baselines exist only in memory and clear when Token Trail exits.
- Reached-state text requires a Codex-reported reached state and remains at bucket scope unless Codex identifies a narrower scope.
- Quota attention ordering is deterministic but is not a forecast.
- “Highest supplied day” is limited to the selected supplied range.
- Reset-credit expiry uses a valid reported timestamp and a disclosed seven-day display threshold.
- Quota, currency or credit strings, spending controls, and reset-credit counts remain separate units.
- Combined capacity has no score and makes no claim that capacity is sufficient for another task.

### Verification

- The official Codex App Server page was opened and checked for the rate-limit, aggregate-usage, reset-credit, transport, and experimental-status claims.
- Experimental TypeScript bindings were regenerated locally from `codex-cli 0.146.1` into a temporary directory.
- The local bindings confirmed the relevant account structures and also confirmed that no thread-level type is needed by the added features.
- Markdown structure, fenced blocks, local links, and table-of-contents anchors were checked across all five Markdown documents and passed.
- `git diff --check` passed with no whitespace errors.
- A repository-wide Markdown punctuation scan found no em dash or en dash characters.
- The newly cited official Codex App Server page returned HTTP 200 on August 13, 2026.
- The final Git review found only the three intended documentation files modified: `product_spec_electron.md`, `design_decisions.md`, and `commit_tracker.md`.

### Fact-check report

- The official App Server documentation describes `account/rateLimits/read`, multi-bucket quota windows, reset timestamps, credit fields, reached state, and reset-credit count and details.
- The official page states that a reset-credit detail list can be absent or capped while `availableCount` remains authoritative.
- The official page describes `account/usage/read` summary fields and optional dated daily usage buckets.
- The locally generated bindings match the required rate-limit, credit, daily-bucket, and aggregate-summary shapes.
- The official documentation also exposes workspace messages, models, threads, and live thread token usage. None of those broader methods was added to the v1 allowlist by this work.
- The documentation states that the app-server command and WebSocket transport are experimental and unsupported for production workloads. Capability detection, strict validation, fixtures, and explicit unsupported states therefore remain required.
- The seven-day expiry label, attention ordering, comparison periods, statistics, and interface layouts are Token Trail product rules. They are documented as calculations or presentation rules rather than Codex-reported facts.

### Sanity-check report

- Every added feature can operate from the current approved account-level data boundary.
- No prompt, response, thread, task, workspace message, model catalog, path, Git value, credential, or mutation enters the feature design.
- Missing and invalid source data disables a calculation instead of producing a plausible guess.
- A bucket-level reached state is not falsely attributed to one quota window.
- A current-session delta cannot be mistaken for retained account history because its start time, local provenance, and process-lifetime boundary are visible.
- Cross-reset quota deltas are prevented.
- A heatmap cannot make missing activity look like zero activity.
- The combined capacity view avoids arithmetic across unrelated units.
- Reset credits remain read-only.
- The scope change is documented as planning and does not imply implementation authorization.

### Why this work matters

These additions make Token Trail more useful without weakening its privacy-first purpose. The interface can reveal timing, recent supplied activity patterns, source completeness, and current reported capacity while remaining honest about what Codex did not provide.

### User lessons so far

- Useful insights do not require broader access when current account data is validated carefully.
- A comparison is trustworthy only when its source periods are complete.
- Missing and zero are different facts.
- A grouped summary can help without inventing one score from unrelated units.
- Session-only observation provides immediate context without creating a history database.
- A display threshold must be disclosed as a product rule rather than attributed to Codex.

### Agent lessons so far

- Derived features need availability rules before formulas.
- Calendar comparisons require date-set validation, not only array length.
- Quota deltas need explicit reset-boundary handling.
- Exact integer arithmetic matters for large token totals and medians.
- A visual heatmap needs a separate missing-data encoding and accessible equivalent.
- New official documentation can improve evidence without removing the need for runtime compatibility defenses.
- Broader locally available methods should not enter scope merely because they exist.

### Risks or limitations

- Daily buckets may not cover enough dates for either comparison.
- Session deltas disappear by design and cannot explain activity before Token Trail opened.
- Attention ordering helps scanning but cannot predict whether Codex will accept future work.
- The official protocol and local bindings can change while app-server remains experimental.
- The seven-day expiry threshold may need usability review, but changing it would be an explicit product decision.

### Follow-up

Implement the approved insights only under separate authorization, with the documented schema, privacy, completeness, and security tests.

---

## Commit 011 - Electron product specification and security plan approved

**Commit:** `b1e71e2` - `Document approved Electron product specification and security plan`
**Timestamp:** August 13, 2026 at 5:56:09 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Record Electron as the approved Token Trail framework and preserve a complete implementation-ready product, interface, security, Linux, testing, packaging, and release plan without starting application development.

### Important changes

- Created the 1,655-line `product_spec_electron.md` document.
- Added the complete feature catalog, 18 interface and state specifications, framework selection, process architecture, Codex compatibility layer, threat model, privacy model, Linux matrix, packaging plan, tests, performance budgets, phases, and acceptance criteria.
- Added Design Decision 005 and marked KDE as the superseded implementation direction while preserving its historical specification.
- Updated README navigation to distinguish the original KDE and approved Electron specifications.
- Reconciled Commit 010 into the tracker.

### Decisions and assumptions

- Electron is approved, but implementation and dependency installation remain separately gated.
- The sandboxed renderer receives only normalized domain data through a narrow preload contract.
- v1 remains read-only, local, without task content, credentials, telemetry, or persisted usage history.
- Linux is the primary release target, tested through an explicit desktop and packaging matrix.
- Security requirements apply from process launch through release artifact integrity.

### Verification

- Git records 1,917 insertions and 50 deletions across four files.
- The commit added `product_spec_electron.md` and changed `README.md`, `design_decisions.md`, and `commit_tracker.md`.
- Commit hash, author, timestamp, subject, files, and statistics were read directly from Git.
- The preceding pending entry recorded 61 successful external-link checks and passing Markdown structure, internal-link, punctuation, and whitespace checks.

### Fact-check report

- Git metadata matches Commit `b1e71e2`.
- The committed specification cited project-maintained documentation for Electron, Linux integration, packaging, UI libraries, and testing.
- The local Codex binding observations were correctly labeled experimental evidence at commit time.
- Performance values remained budgets awaiting packaged measurements rather than achieved claims.

### Sanity-check report

- The commit changed planning documents only.
- Framework approval did not become implementation, publication, signing, update deployment, or broader Codex access.
- The inherited KDE specification remained available for historical context.
- Security, privacy, accessibility, partial-data behavior, and Linux compatibility were integrated throughout the plan.

### Why this commit matters

This commit established the controlling Electron plan and a reviewable security boundary before application code or dependencies existed. It gives future contributors a concrete standard against which implementation can be checked.

### User lessons

- A framework decision includes process, packaging, testing, and maintenance consequences, not only visual capability.
- Electron can target KDE well without pretending to be Kirigami-native.
- Security can be expressed as enforceable architecture and release gates.
- A historical alternative can remain useful after another direction is approved.

### Agent lessons

- A large specification needs explicit approval boundaries so planning is not confused with execution.
- Trust boundaries are clearer when main, preload, renderer, adapter, and app-server responsibilities are separate.
- Runtime and packaging tool decisions should be justified together.
- Commit-tracker reconciliation must use Git after the user commits.

### Risks or limitations

- No prototype had yet measured memory, startup, packaged size, or desktop behavior.
- App-server compatibility still required runtime validation and version fixtures.
- Production logo assets, exact dependency versions, signing identity, and update policy remained unresolved.

### Follow-up

Use the specification as the controlling plan, update it when approved scope changes, and begin the foundation phase, now Phase 1, only after the user explicitly authorizes implementation.

---
## Commit 010 - Linked references and verification reports added

**Commit:** `f16d999` - `Add linked references and verification reports`
**Timestamp:** August 13, 2026 at 5:27:42 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Make technical decisions easier to verify by putting direct documentation links beside the claims they support, and establish separate fact-check and sanity-check reports for meaningful project work.

### Important changes

- Added direct official and project-maintained links throughout the KDE and Electron comparison.
- Corrected a failed Recharts documentation link.
- Added guided reference sections and clickable local branding assets.
- Added verification fields, standards, and rules to the commit tracker.
- Documented the prior contents-navigation commit as Commit 009.

### Decisions and assumptions

- Technical claims should be linked at the point of use.
- A successful URL response and evidence that supports a claim are separate checks.
- Meaningful work includes both a factual evidence review and a product-level coherence review.
- Comparative claims remain judgments until a Token Trail prototype measures them.

### Verification

- Git records 197 insertions and 73 deletions across `commit_tracker.md` and `design_decisions.md`.
- Git metadata, file statistics, and commit subject were read directly from Commit `f16d999`.
- The commit's own tracker entry could not be finalized inside itself without rewriting history, so it is recorded here.

### Fact-check report

- The prior pending report records that 36 external destinations were checked, one initial Recharts URL returned HTTP 404, and the corrected second pass returned HTTP 200 for all 36 destinations.
- The report distinguishes link availability from claim verification and labels development-speed, resource-use, and ecosystem-fit comparisons as judgments.
- The commit author, timestamp, subject, changed files, and statistics match Git.

### Sanity-check report

- The change improved research navigation without selecting a framework or authorizing implementation.
- Reference lists remained as guided reading instead of becoming disconnected URL dumps.
- Internal links and branding paths stayed relative to the repository structure.
- Adding verification requirements to the tracker made future uncertainty more visible rather than presenting every statement as settled fact.

### Why this commit matters

The project moved from merely listing technologies to showing readers where to verify them and how verification should be recorded. This created the evidence standard used for the later Electron decision and detailed product specification.

### User lessons

- Inline links reduce friction when reviewing a technical comparison.
- Fact checking asks whether a claim is supported; sanity checking asks whether the result fits Token Trail.
- Recording a failed check and its correction gives future readers more confidence than hiding the failure.

### Agent lessons

- Project-maintained documentation should be preferred over vague landing pages when a specific technical claim is made.
- Link status automation must be followed by reading the relevant source.
- The current-work entry must be reconciled with Git after the user creates a commit.

### Risks or limitations

- External documentation can move or change after the check date.
- Comparative framework conclusions still required an explicit user decision and future measurements.

### Follow-up

Apply the verification standard to the next meaningful change and keep committed history in reverse chronological order.

---

## Commit 009 - Markdown contents navigation added

**Commit:** `64df0f8` - `Add contents navigation to Markdown documents`
**Timestamp:** August 13, 2026 at 5:17:45 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Add useful navigation to every Markdown document in the repository.

### Important changes

- Added a short contents section and clearer structure to `README.md`.
- Added decision and subsection links to `design_decisions.md`.
- Added a detailed numbered contents list to `docs/PRODUCT_SPEC.md`.
- Added newest-first commit navigation to `commit_tracker.md`.
- Finalized the previous logo work as Commit 008 in the tracker.

### Decisions and assumptions

- Every repository Markdown document should have navigation suited to its length and purpose.
- Contents lists are maintained by hand so their structure remains visible and intentional.
- The commit tracker contents follow the same reverse chronological order as the document.

### Verification

- Git records 183 insertions and 34 deletions across four Markdown files.
- All four Markdown files contained one `Contents` section at commit time.
- A heading-anchor check found no missing internal contents target.
- The no-em-dash and Markdown whitespace checks passed.

### Fact-check report

- Commit hash, subject, author, timestamp, changed files, and statistics were read directly from Git.
- All table-of-contents targets were derived from actual headings rather than assumed filenames or sections.
- No external technical claim was introduced by this commit.

### Sanity-check report

- README navigation stayed short, while the longer product specification received deeper links.
- The tracker remained newest first.
- The change improved navigation without changing product scope, framework status, privacy rules, or implementation approval.

### Why this commit matters

The planning documents had grown enough that scrolling was becoming a poor navigation method. This commit makes their structure visible and gives readers direct access to the section they need.

### User lessons

- Navigation depth should match document depth.
- Contents lists can make planning documents useful before any application code exists.
- A tracker contents list should reflect the tracker's reading order.

### Agent lessons

- Every Markdown file should be discovered from the repository rather than assumed from memory.
- Anchor links need validation because punctuation and numbering affect generated heading IDs.
- Duplicate subsection names should be avoided in contents lists when their generated anchors could be ambiguous.

### Risks or limitations

- Hand-written contents lists can become stale when headings change.
- Future commits must add their tracker entry to the contents list as well as the body.

### Follow-up

Keep contents links synchronized with future heading and commit changes.

---

## Commit 008 - Tracked Trail logo direction documented

**Commit:** `c4e586c` - `Document approved Tracked Trail logo direction`
**Timestamp:** August 13, 2026 at 5:13:29 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Save the approved logo concept, provide separate light and dark files, document the concept's evolution, and bring the project records up to date.

### Important changes

- Added the combined Tracked Trail concept board.
- Added separate 887 × 887 light-mode and dark-mode logo panels.
- Recorded the original Escaping Trail proposal and the reasoning that led to Tracked Trail.
- Recorded the approved theme palette and future production-asset requirements.
- Added a repository writing-style decision and removed em dashes from Markdown files.
- Added detailed entries for the tracker expansion and rename commits.

### Decisions and assumptions

- Tracked Trail is the approved logo direction.
- The full path remains inside the token to represent observed progress rather than usage escaping.
- Light and dark variants share identical geometry.
- The current PNG files are approved concept assets, not substitutes for a future vector master.
- Repository prose should be natural, direct, specific to Token Trail, and free of em dashes.

### Verification

- Git records three new PNG files and changes to three Markdown files.
- The commit contains 271 inserted lines and 57 removed lines across the text files.
- The combined board and both split images were inspected before the commit.
- Both split images are 887 × 887 pixels.
- Markdown whitespace and banned punctuation were checked before handoff.

### Why this commit matters

This commit gives Token Trail its first approved visual identity and preserves the reasoning behind it. It also turns several documentation preferences into written project conventions, reducing the chance that future work loses the context established during ideation.

### User lessons

- Testing a logo's metaphor can reveal whether the shape communicates the intended product purpose.
- Rejected ideas can remain valuable when their reasoning explains the approved direction.
- Theme variants should feel like one identity rather than separate logos.
- Concept approval and production-asset completion are separate milestones.
- Documentation tone and punctuation can be treated as project design decisions.

### Agent lessons

- The user's correction from escaping to tracked progress materially improved the product metaphor and needed to remain visible in the decision history.
- Exact crops are safer than regeneration when the user has approved the geometry of a combined concept board.
- Generated concept images must be described honestly as raster candidates until precise vectors and icon exports exist.
- Style rules should be applied across existing documents when the user says they apply to every file.
- Current-work entries must be converted into committed history after the user creates a commit.

### Risks or limitations

- The current assets include presentation backgrounds and wordmarks; icon-only transparent production files do not exist yet.
- Small-size legibility, monochrome rendering, accessibility contrast, and vector geometry still need formal checks.
- Hand-maintained documentation can drift unless future changes update all related files.

### Follow-up

Create and verify production logo assets when the user approves that work. Keep the decision log and tracker aligned with any later visual refinements.

---

## Commit 007 - Tracker filename normalized

**Commit:** `feb8faf` - `Remove outdated commit tracker`
**Timestamp:** August 13, 2026 at 4:37:14 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Replace the space-containing tracker filename with the requested underscore-based `commit_tracker.md` name.

### Important changes

- Renamed `commit tracker.md` to `commit_tracker.md`.
- Preserved the tracker content while updating its current-work notes to explain the filename choice.
- Retained historical mentions of the original filename where they describe what earlier commits actually contained.

### Decisions and assumptions

- The active filename uses an underscore for easier shell commands, Markdown links, and URLs.
- Historical entries preserve old names when changing them would make the record inaccurate.
- The commit subject emphasizes removal, while Git detects the actual content change as a 97%-similar rename.

### Verification

- Git records a rename from `commit tracker.md` to `commit_tracker.md` with 97% similarity.
- Five lines were added and one was removed as part of the rename commit.
- No application build or runtime checks applied.

### Why this commit matters

Filename conventions are small architectural hygiene decisions. Normalizing the tracker name reduces quoting and encoding friction in the commands and links that will be used throughout the project's lifetime.

### User lessons

- A clear, tool-friendly filename makes frequently referenced project documentation easier to use.
- Renaming a file does not require erasing its earlier name from historical records.
- Git can preserve rename history even when a commit message describes the change more simply.

### Agent lessons

- Repository searches should accompany documentation renames so active references do not break.
- Historical accuracy takes precedence over mechanically replacing every occurrence of an old filename.
- Git's rename detection and the user-facing intent can both be recorded when they illuminate different aspects of a change.
- Commit summaries should describe the effective outcome even when the original subject is less precise.

### Risks or limitations

- External links created before the rename could still point to the old path, although no repository-internal external references were found at the time.
- Future documentation must consistently use `commit_tracker.md`.

### Follow-up

Use the underscore-based filename in all new repository links and instructions.

---

## Commit 006 - Tracker expanded and reordered

**Commit:** `dbd3c03` - `Expand commit tracker with structured project lessons`
**Timestamp:** August 13, 2026 at 4:35:32 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Turn the initial tracker into a detailed project-memory document with multiple lessons per commit and reverse-chronological committed history.

### Important changes

- Expanded the original four commit entries with detailed user and agent lessons.
- Added “Why this commit matters” context.
- Reordered committed entries so the latest commit appears first.
- Added a committed-history entry for the tracker creation commit itself.
- Clarified the role and handling of current uncommitted work.

### Decisions and assumptions

- Tracker detail should scale with the importance of a commit rather than obey a fixed length.
- Multiple supported lessons are preferable to forcing each commit into one takeaway.
- Current work appears above committed entries but remains clearly labeled as uncommitted.
- Reverse chronology is a permanent tracker rule.

### Verification

- Git records 251 insertions and 78 deletions in the tracker.
- The committed history was arranged newest-first at the end of the change.
- Markdown whitespace and headings were checked.
- The change affected documentation only.

### Why this commit matters

This commit establishes the tracker as a substantive record of product understanding rather than a decorative changelog. It makes recent context easy to find while preserving deeper lessons for future contributors and agents.

### User lessons

- Important commits can teach several lessons and deserve enough space to preserve them.
- Reverse chronological order is more practical for a living project document because readers usually need the newest state first.
- Structured detail is easier to navigate than either a terse list or an unorganized diary.
- Documentation preferences can become durable project conventions.

### Agent lessons

- User feedback about documentation is part of the artifact requirements, not merely presentation preference.
- Expansion should add distinct insight rather than paraphrasing one lesson repeatedly.
- A tracker must distinguish knowledge supported by conversation from imagined personal reactions.
- Newest-first insertion needs to be maintained consistently with every later update.
- Self-referential tracker entries must be finalized after their containing commits exist.

### Risks or limitations

- Manual tracker maintenance can drift from Git unless metadata is re-read on each update.
- Detail can reduce scanability if headings and ordering conventions are not followed.
- This commit still preceded the later filename normalization.

### Follow-up

Maintain the detailed reverse-chronological format and reconcile pending entries after each commit.

---

## Commit 005 - Commit tracker introduced

**Commit:** `0648a2b` - `Create commit tracker.md`
**Timestamp:** August 13, 2026 at 4:30:58 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Create a durable document that explains the important work, reasoning, verification, lessons, limitations, and follow-up associated with each Git commit.

### Important changes

- Added `commit tracker.md` with entries for the first four repository commits.
- Defined a consistent entry structure covering intent, meaningful changes, decisions, verification, user learning, agent learning, risks, and follow-up.
- Added rules for separating committed history from pending work.
- Established Git as the factual source for hashes, timestamps, subjects, authors, order, and statistics.
- Recorded the tracker creation itself as pending because its final commit hash was not available while the file was being authored.

### Decisions and assumptions

- The tracker supplements Git history instead of copying complete diffs.
- Toronto local time is the standard display timezone for project history.
- User and agent lessons are recorded separately because they serve different future readers.
- Lessons must be grounded in repository evidence or conversation context.
- Documentation commits are considered important when they affect product direction, privacy, security, or shared understanding.
- Pending work cannot be labeled as a commit until Git contains it.

### Verification

- Git records one new file with 245 inserted lines.
- The final commit subject is `Create commit tracker.md`.
- The commit author time is August 13, 2026 at 4:30:58 PM EDT.
- The commit contains documentation only; no build or runtime tests applied.
- The first version correctly included commits `346798b`, `3067331`, `2eaa34c`, and `319d60b`, but initially ordered them oldest-first.

### Why this commit matters

This commit creates a long-term memory layer between terse Git messages and the much larger conversation that produced each change. It gives the project owner, future agents, and potential contributors a structured place to understand not just what changed, but why it changed, what was verified, what remained uncertain, and what understanding should carry forward.

### User lessons

- A one-line commit subject is useful for scanning but cannot preserve all important project reasoning.
- A dedicated tracker can record both technical work and the learning that occurred around it.
- Verification and limitations belong beside accomplishments so future readers do not overestimate what a commit proved.
- User and agent lessons benefit from separate treatment because the owner and the implementation assistant have different responsibilities.
- A tracker is most trustworthy when it acknowledges missing information rather than filling gaps with guesses.
- Pending work needs a separate status because a future commit hash cannot be known in advance without rewriting history.

### Agent lessons

- Git must be queried before documenting earlier commits; hashes, order, timestamps, authors, and statistics should never be reconstructed from memory.
- The user's internal experience must not be invented. User lessons should state project understanding supported by the conversation.
- The tracker should preserve reasoning without becoming a duplicate of `git show`.
- The applicable timezone abbreviation and numeric offset should accompany local times to remain unambiguous across daylight-saving changes.
- The file that introduces the tracker creates a self-reference problem; the next update must convert its pending description into a normal committed entry.
- Documentation maintenance is part of project quality, especially before application code exists.
- The first tracker structure was useful but too compact in its lesson sections and used oldest-first ordering, both of which were corrected by subsequent feedback.

### Risks or limitations

- The initial version used only one user lesson and one agent lesson per commit, which was less detailed than intended.
- The initial committed entries were ordered oldest-first rather than newest-first.
- Maintaining the tracker manually creates a risk of drift from Git history unless each update rechecks repository metadata.
- The tracker can become long; consistent headings and reverse chronology are necessary to keep recent context discoverable.

### Follow-up

Expand lessons where the history supports them, keep newest commits first, and finalize each pending entry after its containing commit exists.

---

## Commit 004 - README aligned with Token Trail

**Commit:** `319d60b` - `Document TokenTrail project vision and planning status`
**Timestamp:** August 13, 2026 at 4:24:14 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Replace the old project name in the repository landing page and give visitors a concise, accurate explanation of Token Trail.

### Important changes

- Changed the README title from `kodex_usage` to `TokenTrail`.
- Marked the project as being in design and planning.
- Added a short description of the intended privacy-first Codex usage dashboard.
- Linked the product specification and design-decision log.

### Decisions and assumptions

- The README remains intentionally brief while the project is still being designed.
- Detailed requirements belong in the specification and decision log rather than being duplicated in the landing page.

### Verification

- Git records nine inserted lines and two removed lines in `README.md`.
- Markdown links point to files present in the repository.
- No application tests applied.

### Why this commit matters

The README is the repository's front door. This small change makes the visible project identity match Token Trail and tells a new visitor what the project is trying to achieve without falsely suggesting that an application already exists. It also routes readers to deeper documents instead of leaving important context discoverable only through conversation history.

### User lessons

- A repository rename should be followed by a documentation audit so the public landing page does not retain the old identity.
- A planning-stage project still benefits from a concise, honest explanation of its purpose.
- The README does not have to contain the full product specification to be useful.
- Status labeling manages expectations: visitors can distinguish an idea under design from software ready to install.
- Linking specialized documents lets the README remain approachable while detailed decisions stay available.
- Small documentation inconsistencies are worth fixing early because they become more confusing as the repository grows.

### Agent lessons

- Lead a project README with the current product name, status, and purpose.
- Keep the README approachable and use dedicated documents for detail.
- Repeating the full specification in multiple places creates synchronization problems and contradictory future edits.
- User requests for “just a little” context should be respected; completeness does not always mean adding more prose.
- Documentation-only changes still deserve verification for names, relative links, Markdown formatting, and consistency with current decision status.
- Do not imply that planning documents represent completed features.
- When a major choice is still pending, wording such as “intended” and “currently being designed” is more accurate than definitive implementation claims.

### Risks or limitations

- The README will need another review after the framework, exact v1 scope, installation process, and release status are approved.

### Follow-up

Keep the README synchronized with major approved decisions without allowing it to become a second product specification.

---

## Commit 003 - KDE and Electron directions compared

**Commit:** `2eaa34c` - `Create design_decisions.md`
**Timestamp:** August 13, 2026 at 4:17:54 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Preserve the inherited KDE-native proposal and evaluate Electron as an alternative, with an explicit chronological decision record.

### Important changes

- Added `design_decisions.md`.
- Recorded the proposed KDE stack and its benefits, costs, visual options, packaging direction, and security model.
- Recorded a possible Electron/TypeScript/React architecture, including main/preload/renderer boundaries.
- Compared visual libraries, native integration, runtime footprint, cross-platform reach, packaging, learning curve, and security.
- Identified Electron as having the broader ready-made visualization ecosystem while KDE/Kirigami has stronger native Plasma integration.
- Left the framework choice pending and proposed a small prototype comparison as an evidence-gathering option.

### Decisions and assumptions

- Neither KDE nor Electron was approved for implementation.
- If Electron is later selected, its renderer must remain sandboxed and isolated behind a narrow, typed IPC bridge.
- If the framework changes, the product specification must be updated consistently rather than leaving conflicting KDE assumptions behind.

### Verification

- Git records one new design-decision file with 180 lines.
- Current official KDE, Qt, and Electron documentation was consulted for the comparison.
- No executable prototype or performance benchmark was produced, so resource and development-speed comparisons remain informed expectations rather than measured Token Trail results.

### Why this commit matters

This commit prevents the inherited KDE proposal from becoming an unquestioned implementation choice. It puts two credible approaches beside each other and makes their trade-offs reviewable. It also preserves why a future framework was chosen, which will matter when contributors later ask why the project accepts that framework's dependencies, security model, packaging work, or visual constraints.

### User lessons

- “More visual libraries” and “better application” are different questions.
- Electron offers a broader ready-made visual ecosystem, while KDE/Kirigami offers stronger native Linux and Plasma integration.
- A toolkit does not create good design automatically; layout, hierarchy, typography, accessibility, and coherent interaction still require deliberate work.
- Electron's cross-platform promise reduces UI duplication, but it does not remove platform-specific testing, packaging, signing, or Codex compatibility work.
- Native KDE development can still produce rich custom visuals through QML, Qt Quick, Qt Graphs, and KQuickCharts; the difference is largely ecosystem breadth and effort.
- Electron usually carries a larger runtime footprint because it bundles Chromium and Node.js, but Token Trail should measure packaged size, memory, and startup time rather than rely only on general reputation.
- Security must be considered while choosing the framework, not attached after the UI is built.
- A small disposable prototype can answer visual and performance questions more reliably than a long abstract debate.
- Changing the framework later would require updating the product specification, acceptance criteria, packaging plan, and terminology consistently.

### Agent lessons

- Framework recommendations must be tied to explicit product priorities rather than personal preference or library counts.
- For Token Trail, visual-library breadth, KDE identity, resource use, contributor learning curve, security boundaries, and possible cross-platform distribution pull the choice in different directions.
- Electron requires a deliberately narrow main/preload/renderer architecture; the visual renderer must never gain generic process, filesystem, shell, or protocol access.
- `contextIsolation`, renderer sandboxing, disabled Node integration, a restrictive Content Security Policy, and validated purpose-specific IPC are baseline requirements if Electron is selected.
- The Codex protocol adapter and its read-only allowlist should remain conceptually independent of the UI framework, even though their implementations would differ.
- Current official documentation should be used for framework comparisons because Electron, Qt, Kirigami, and packaging practices evolve.
- Claims such as “lighter,” “faster,” or “easier” should be labeled as expectations until Token Trail-specific prototypes provide measurements.
- A decision log must record alternatives and status clearly so “evaluated” is not later misread as “approved.”
- If Electron is selected, dependency count and visual-library selection should stay intentional; the availability of many npm packages is not a reason to adopt many packages.

### Risks or limitations

- Library breadth does not guarantee coherent design or accessibility.
- Native-toolkit use does not automatically guarantee visual polish or low resource use.
- The comparison needs real prototype measurements if the trade-off remains unclear.

### Follow-up

The user should choose KDE/Kirigami, choose Electron, or explicitly approve a disposable comparison prototype. Until then, planning continues without application implementation.

---

## Commit 002 - Product specification created

**Commit:** `3067331` - `Create PRODUCT_SPEC.md`
**Timestamp:** August 13, 2026 at 4:10:49 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Turn the inherited Token Trail handoff into a reviewable first-release product specification without beginning application implementation.

### Important changes

- Added `docs/PRODUCT_SPEC.md`.
- Defined v1 goals, explicit non-goals, screen structure, metric catalog, and provenance rules.
- Documented privacy, retention, Codex compatibility, and the read-only security boundary.
- Proposed packaging targets, quality expectations, acceptance criteria, and implementation phases.
- Kept task analytics, persistent history, forecasts, write actions, and publication outside the initial scope.

### Decisions and assumptions

- The document treated C++20, Qt 6, KDE Kirigami 6, and CMake as the proposed starting stack inherited from the handoff.
- No framework choice or implementation work was approved merely by documenting it.
- Reported, locally observed, calculated, and unavailable metrics must remain distinguishable.

### Verification

- Git records one new specification file with 449 lines.
- The specification was reviewed as Markdown content.
- No code, build, protocol, or packaging verification applied.

### Why this commit matters

This is the first commit that explains what Token Trail is supposed to become. It converts a broad handoff into testable product boundaries and makes future implementation review possible. It is also a guardrail: contributors can compare a proposed feature with documented goals, non-goals, privacy rules, and acceptance criteria before adding it.

### User lessons

- Planning can define privacy boundaries, non-goals, and success criteria before code makes those choices expensive to change.
- A product-spec discussion or specification commit does not itself authorize building the product.
- Explicit non-goals are as important as goals because they protect the first release from uncontrolled scope growth.
- “Display as many metrics as possible” still requires reliability, provenance, and privacy limits; more data is not automatically better data.
- Token totals and quota consumption answer different questions and must not be blended into one number.
- A useful first version can deliberately defer attractive features such as forecasts, task analytics, notifications, and historical databases.
- Acceptance criteria turn product ideas into observable outcomes that can later be tested.
- Packaging and distribution need early consideration, even though publishing remains a separate future decision.

### Agent lessons

- Token Trail must distinguish OpenAI-reported values, locally observed values, Token Trail calculations, and unavailable values throughout its data model and UI.
- The Codex app-server is experimental, so raw protocol behavior must be isolated behind a compatibility adapter.
- Protocol fields and methods cannot be assumed to exist forever; capability detection, optional parsing, unknown values, and partial failure are core requirements.
- The initial integration must remain read-only. Displaying a reset credit does not authorize consuming it.
- Authentication must stay owned by Codex; Token Trail must never copy, expose, or store Codex or ChatGPT credentials.
- Task titles, project paths, Git data, and turn details are privacy-sensitive and cannot silently enter the initial scope.
- Calculated totals must show incomplete source ranges instead of presenting partial data as complete.
- A specification should separate current product decisions from future implementation sequencing so a plan is not mistaken for authorization.
- Technical version observations from one machine are evidence for compatibility testing, not permanent minimum requirements.

### Risks or limitations

- The technology stack remained provisional.
- The broad v1 specification may need revision after the final framework and visual direction are chosen.
- Protocol expectations were based on the handoff and still require fixture and live compatibility validation during an approved implementation phase.

### Follow-up

Review and approve or revise the major scope decisions before application code is created.

---

## Commit 001 - Repository initialization

**Commit:** `346798b` - `Initial commit`
**Timestamp:** August 13, 2026 at 1:53:44 AM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Create the initial Git repository and establish its basic legal and documentation files.

### Important changes

- Added `.gitattributes`.
- Added the project license.
- Added the original two-line README using the earlier `kodex_usage` name.
- Established the baseline from which Token Trail planning could proceed.

### Decisions and assumptions

- A version-controlled repository was established before application development.
- No product architecture, implementation stack, or application behavior was introduced.

### Verification

- Git records three files and 678 inserted lines in this commit.
- No build or application tests applied because no application code existed.

### Why this commit matters

This commit is the repository's factual starting point. Later documents, names, architecture choices, and implementation work can all be compared with this clean baseline. It also establishes that the project began with almost no product definition, so later planning documents are intentional additions rather than descriptions of pre-existing code.

### User lessons

- Starting with Git makes later planning and implementation inspectable and reversible.
- A repository can exist before the product is fully defined; early commits do not need to pretend that unsettled decisions are final.
- Repository names, folder names, GitHub names, and README titles are separate pieces of project identity. Renaming one does not necessarily update the others.
- Even a minimal initial commit benefits from a clear license and predictable text-file settings.
- A clean baseline makes it easier to identify exactly when scope, branding, or technical assumptions entered the project.

### Agent lessons

- The initial `kodex_usage` README name was historical context, not a permanent product decision.
- Public-facing documentation must be audited after a project rename instead of assuming repository metadata changed every reference.
- A sparse repository should not be interpreted as permission to scaffold an application; the user's requested planning sequence still controls.
- Existing files belong to the user and must be preserved unless an explicit change is requested.
- Git history is the strongest source for reconstructing what existed at a particular point; later descriptions should not be projected backward onto this commit.

### Risks or limitations

- The README retained the old project name.
- The repository did not yet explain the product's purpose or status.

### Follow-up

Document the product direction before implementation.
