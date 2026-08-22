# Token Trail Commit Tracker

This document records the important outcome of each project commit in reverse chronological order. It complements Git history: Git remains the authoritative source for exact file changes, while this tracker explains why a change mattered and what was learned.

All displayed times use the `America/Toronto` timezone. Lessons are recorded only when supported by the project history or conversation; unknown lessons are marked as not recorded rather than invented.

## Contents

- [What each entry tracks](#what-each-entry-tracks)
- [Tracking rules](#tracking-rules)
- [Verification standards](#verification-standards)
- [Current uncommitted work](#current-uncommitted-work)
- [Commit 037 - Document the Phase 5 release-engineering architecture](#commit-037---document-the-phase-5-release-engineering-architecture)
- [Commit 036 - Add the six user guides and refresh the README for Phase 5](#commit-036---add-the-six-user-guides-and-refresh-the-readme-for-phase-5)
- [Commit 035 - Add least-privilege CI and tag-driven draft-release pipeline](#commit-035---add-least-privilege-ci-and-tag-driven-draft-release-pipeline)
- [Commit 034 - Open Phase 5 with the four-format Linux release packaging](#commit-034---open-phase-5-with-the-four-format-linux-release-packaging)
- [Commit 033 - Close Phase 4 automated scope with the 0.4.0 evidence record](#commit-033---close-phase-4-automated-scope-with-the-040-evidence-record)
- [Commit 032 - Verify desktop identity across backends and enforce Wayland conduct](#commit-032---verify-desktop-identity-across-backends-and-enforce-wayland-conduct)
- [Commit 031 - Move focus to new route content on navigation](#commit-031---move-focus-to-new-route-content-on-navigation)
- [Commit 030 - Open section 8.3 with keyboard-only workflow evidence](#commit-030---open-section-83-with-keyboard-only-workflow-evidence)
- [Commit 029 - Close section 8.2 with the motion and idle-CPU review](#commit-029---close-section-82-with-the-motion-and-idle-cpu-review)
- [Commit 028 - Wire the daily chart to design tokens with animation disabled](#commit-028---wire-the-daily-chart-to-design-tokens-with-animation-disabled)
- [Commit 027 - Add the responsive width and zoom layout sweep](#commit-027---add-the-responsive-width-and-zoom-layout-sweep)
- [Commit 026 - Complete theme verification with WCAG remediation and theme-aware tints](#commit-026---complete-theme-verification-with-wcag-remediation-and-theme-aware-tints)
- [Commit 025 - Document visual-system licensing decisions and open the design-system architecture record](#commit-025---document-visual-system-licensing-decisions-and-open-the-design-system-architecture-record)
- [Commit 024 - Finalize production vector logo and required raster exports](#commit-024---finalize-production-vector-logo-and-required-raster-exports)
- [Commit 023 - Open Phase 4 with the production design-token layer](#commit-023---open-phase-4-with-the-production-design-token-layer)
- [Commit 022 - Phase 3 verification gate closed with full evidence record](#commit-022---phase-3-verification-gate-closed-with-full-evidence-record)
- [Commit 021 - Documentation lifecycle expanded and KDE proposal relocated](#commit-021---documentation-lifecycle-expanded-and-kde-proposal-relocated)
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

**First recorded:** August 22, 2026 after commit `3343e64`
**Last updated:** August 22, 2026 at 1:30 AM EDT (`America/Toronto`, UTC-04:00)
**State:** Pending; not yet a Git commit when this entry was written

The pending architecture-records entry below was finalized as commit `3343e64`. This entry executes the locally available portion of plan sections 9.6 and 9.7: clean-clone git-flow proof, AppImage reference launch, dependency audit with SBOM inspection, packaged security re-verification, the versioned 0.5.0 test report with curated screenshot, support-matrix updates, and one harness hardening born from a transient failure.

### Intent

Prove everything Phase 5 can prove on this machine without a release tag, record what remains environment-bound honestly, and leave the tree ready for the tag-driven draft-release proof that closes section 9.9's first criterion.

### Important changes

- Clean-clone proof: fresh `git clone` of `3343e64` into an empty directory followed by `npm ci`, full `verify` (220 unit + 32 integration), and budget-gated `build`, all green — the from-git flow works exactly as users will run it.
- AppImage reference launch: x64 image started against a real desktop session, stayed stable, exited cleanly on SIGTERM; benign Wayland/GPU warnings only.
- Dependency review: `npm audit --omit=dev` zero vulnerabilities; CycloneDX SBOM generated via npm's built-in emitter and inspected (487 components; permissive license set).
- Packaged suite re-verified 4/4 across repeated runs after a configuration change.
- Created `tests/test_reports/0.5.0/test_report.md`: scope, environments, commands with honest run windows, six-artifact inventory with sizes and SHA-256 prefixes, per-layer summary, four-row defect-and-remediation table including two transient timeouts recorded with their investigation limits, security/accessibility/matrix/performance sections, limitations, and a `preview-only` recommendation.
- Captured curated packaged-launch screenshot (visually inspected: honest unavailable states, no synthetic data, correct branding) under `tests/test_reports/0.5.0/screenshots/`.
- Support matrix updated: arm64 relabeled builds-verified/untested-execution; per-format quality rows split (AppImage verified-reference/payload-inspected; deb and Pacman payload-inspected; rpm CI-bound); new from-git development-flow row.
- Plan sections 9.6 and 9.7 swept from evidence: payload-level and audit criteria completed; executed install campaigns stay open with named reasons.
- Harness hardening: the packaged hardened-launch test now fails with the live document URL instead of an opaque timeout, converting any recurrence of this session's transient stall into a diagnosable artifact.

### Decisions and assumptions

- The two packaged-test timeouts (~01:07–01:10, UI fully rendered, unreproducible across five subsequent runs) are characterized as environment-transient startup stalls under post-build system load rather than declared fixed — no root cause was provable because the green rerun cleaned retained traces; the report records both failures, the remediation attempts, and the diagnostic hook so any recurrence self-localizes.
- A test-created profile in the real user configuration directory (created by an earlier smoke run that bypassed the disposable-profile path) was removed to restore pre-session state.

### Verification

- All commands listed in §3 of the new report executed with recorded outcomes; documentation check extended to 51 files with zero broken links.
- Screenshot visually inspected before inclusion per evidence rules.

### Fact check

- Artifact hashes were computed fresh for the inventory table; CI run identifier taken from the workflow-run listing; component count read from the generated SBOM JSON.

### Sanity check

- No claim extends beyond local or runner evidence: install execution stays deferred, rpm stays CI-bound, and the transient failure remains visibly open in the report's defect table.

### User lessons

- A verification gate is most valuable at its own birth: both the contents gate and the provenance script caught their author's first mistakes during initial runs.
- Transient failures handled with diagnostics-plus-visibility preserve more trust than silent retries.

### Agent lessons

- Smoke tests of packaged applications ignore unpackaged-only environment seams; launching a packaged build touches the real user profile unless the harness isolates it explicitly.
- When a green rerun destroys failure artifacts (Playwright clears outputDir), capture traces to a persistent output directory first; post-mortems need the evidence before the pass wipes it.

### Risks or limitations

- Executed install/upgrade/uninstall campaigns, second-distribution-family AppImage coverage, and arm64 execution remain open and visible in plan section 9.6 and the support matrix.
- The transient-stall follow-up stays attached to the packaged suite until its cause is captured by the new diagnostic.

### Follow-up

The `v0.5.0` tag was pushed and its pipeline run failed fast with three real defects the local environment could not have exposed: release jobs never built the Vite bundles before packaging, electron-builder attempted implicit GitHub publishing because a tag was present, and the SBOM job wrote into an output directory nothing had created. All three were fixed and re-proven under `v0.5.1`, which surfaced a fourth runner-environment defect: fpm's Pacman target requires `bsdtar` (exit 127), provided on Ubuntu by `libarchive-tools`, now installed in both build jobs. Per the artifact-versioning model each failed candidate is superseded by a new patch version — `v0.5.0` and `v0.5.1` remain as recorded markers of those attempts since no release object of any kind was created from either. Next: push tag `v0.5.2` and observe the full pipeline through draft creation.

---

## Commit 037 - Document the Phase 5 release-engineering architecture

**Commit:** `3343e64` - `Document the Phase 5 release-engineering architecture`
**Timestamp:** August 22, 2026 at 1:05:43 AM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

The pending guides entry below was finalized as commit `6996bc2`. This entry implements plan section 9.5: five architecture records created from the implemented packaging and release systems, the architecture index updated to own them, and an operator decision recorded — local rpm assembly is skipped because installing host rpm tooling through pacman is not wanted; rpm artifacts remain the release CI's job on runners where that tooling installs cleanly.

### Intent

Document the implemented Phase 5 release-engineering system for future maintainers at the same evidence standard as the product architecture records, and settle the local-rpm question by operator decision instead of leaving it as an open loop.

### Important changes

- Created `docs/architecture/packaging-architecture.md`: inputs table, per-format assembly, identity wiring, hardening posture including the honest Linux ASAR-integrity gap, verification gates, failure behavior, limitations.
- Created `docs/architecture/github-release-pipeline.md`: CI job structure, least-privilege permission model, SHA-pinning invariant, tag-driven draft assembly, operator settings still owed.
- Created `docs/architecture/installation-and-upgrade-model.md`: format selection, install-location inventory from inspected payloads, manual-only upgrades with settings-compatibility reasoning, uninstall ownership.
- Created `docs/architecture/software-supply-chain-security.md`: dependency controls, build integrity, CI/CD authorization, artifact verification, invariants, named gaps.
- Created `docs/architecture/artifact-and-versioning-model.md`: version authority, tag rules, naming templates across both architectures and four formats, prerelease/immutability rules, source-archive labeling.
- Architecture README reading order and ownership table extended; Phase 5 document list marked opened rather than planned.
- Plan sections 9.3, 9.4, and 9.5 swept from evidence: only the protected-environment configuration (operator), the release-note structure (Phase 6 changelog dependency), and section 9.4's final guide-following remain open there.

### Decisions and assumptions

- Operator decision recorded verbatim: normal installation from git must keep working; if pacman-hosted tooling does not cooperate, local rpm building is skipped. Consequence: rpm build evidence comes exclusively from the Ubuntu-runner release pipeline until a clean rpm environment exists elsewhere.
- All five documents cite executed inspections (payload listings), observed CI runs, or contract tests for every current-state claim, keeping the no-aspirational-claims rule.

### Verification

- `npm run check:docs`: 50 files scanned, zero broken links after adding five cross-linked documents and index rows.
- Formatting gate clean.
- Honest limit: these documents describe implemented behavior; their status headers keep sections 9.6–9.7 evidence visibly owed.

### Fact check

- Install paths, artifact names, fuse flags, workflow triggers, and permission scopes were transcribed from this repository's actual files and earlier payload inspections, not from upstream documentation.

### Sanity check

- The operator's rpm decision is consistent with plan section 15 stop conditions (no scope expansion) and keeps support-matrix honesty intact: rpm stays labeled unverified-installed until CI or another environment proves it.
- No document claims signing, auto-update, or publication capabilities that remain gated.

### User lessons

- Tooling friction is a signal to record, not fight: choosing "CI builds it where tooling works" preserves momentum without faking local coverage.
- Architecture documents written from inspection artifacts double as regression checklists when formats change.

### Agent lessons

- When an environment lacks a tool, the honest move is recording the decision and rerouting evidence to where the tool exists, not softening language about what was tested.
- Index updates are part of document creation: an unindexed architecture file is invisible to the reading order contract.

### Risks or limitations

- rpm path remains entirely CI-dependent; any runner-image change affecting the `rpm` package would surface first during a real tag push.
- Protected-environment reviewer configuration and tag immutability remain operator settings before any candidate tag.

### Follow-up

Execute section 9.6 verification within available environments (AppImage reference launch plus clean-clone git flow proof), run the section 9.7 security review with SBOM generation, then assemble the 0.5.0 versioned test report and sweep Phase 5 exit criteria.

---

## Commit 036 - Add the six user guides and refresh the README for Phase 5

**Commit:** `6996bc2` - `Add the six user guides and refresh the README for Phase 5`
**Timestamp:** August 21, 2026 at 11:44:06 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

The pending pipeline entry below was finalized as commit `a9e9c36`, whose first CI run then completed green on shared runners. This entry implements plan section 9.4: the six user-facing guides under `docs/user/` plus a README refresh that finally reflects Phase 5 reality and links the guides.

### Intent

Give future users honest, per-format installation, upgrade, troubleshooting, uninstall, and privacy documentation that can be followed verbatim against release-candidate packages during verification.

### Important changes

- Added all six section 9.4 guides: getting-started (Codex prerequisites including PATH-visible CLI and Codex-owned sign-in), installing (architecture mapping table across each format's native labels, checksum verification, FUSE notes, installed-location inventory), upgrading (manual-only updates, version checks, settings compatibility, downgrade limits), troubleshooting (menu-versus-shell PATH differences, signed-out recovery through Codex, AppImage FUSE fallbacks, desktop-entry association checks, unavailable-value reading, diagnostics export), uninstalling (per-format removal, retained preferences location, removal verification), and privacy (approved reads, memory-only usage data, single preferences file on disk, redacted diagnostics, no-network statement, explicit exclusions).
- Every guide carries a status header stating it is being followed against release-candidate packages in plan section 9.6 before any stable release — instructions claim nothing beyond current evidence.
- README updated: project status now names Phases 1–4 machine-complete with Phase 5 in progress; user-guides index added; the stale 0.2.0 evidence pointer moved to 0.4.0.
- Documentation link checker extended coverage from 37 to 45 files with zero broken links.

### Decisions and assumptions

- Guides document the four-format artifact naming actually produced by the verified pipeline (`tokentrail-<version>-linux-<arch>.<format>`), including the per-format architecture vocabulary (`amd64`/`arm64`, `x86_64`/`aarch64`) that previously had no user-facing explanation anywhere.
- Draft-release visibility is described from the maintainer perspective honestly: drafts are maintainer-only until published.
- The privacy guide's network statement is written to the implemented boundary and explicitly marks the Phase 6 captured-trace campaign as the pending evidence upgrade rather than claiming it already happened.

### Verification

- `npm run check:docs`: 45 files scanned, no broken links after the new cross-links.
- Technical claims traced to implementation facts read from source during authoring: PATH-based discovery without shell invocation, `codex app-server --stdio` argument list, preferences under the `Token Trail` userData directory, `/opt/Token Trail` install prefix plus system paths confirmed earlier by direct deb/Pacman/AppImage payload inspection.
- Honest limit: package-manager commands in installing/upgrading/uninstalling have not yet been executed against real installs; their guides' headers mark that verification as scheduled work.

### Fact check

- Every quoted path in the uninstall guide was checked against electron-builder's fpm mappings recorded in Commit 034's inspection output rather than assumed.
- The `--appimage-extract-and-run` fallback is the documented AppImage runtime option matching the toolset version in use.

### Sanity check

- No guide promises signing, auto-update, notifications, or any other gated capability; preview status is stated at the top of every download instruction.
- Terminology matches the product-identity rules: people see "Token Trail"; machine paths use `tokentrail`.

### User lessons

- GUI applications inherit the desktop session's PATH, not a terminal's; documenting this early prevents the most common "works in terminal, not in app" support case.
- Uninstall documentation must cover both package-owned files and deliberately retained user state for trust to survive an uninstall/reinstall cycle.

### Agent lessons

- Write guides against inspected artifacts, not generic distribution conventions; every path claim here traces to a payload listing performed earlier.
- Status headers that name the exact scheduled verification turn aspirational docs into testable checklists for later phases.

### Risks or limitations

- Package-install command sequences remain unverified until clean-environment testing (section 9.6); corrections will be committed from observed results.
- The support matrix's untested rows mean some guide advice (for example GNOME specifics) has no environment evidence behind it yet.

### Follow-up

Create the five section 9.5 architecture records alongside the implemented systems, monitor CI on subsequent pushes, and build the local rpm once rpm-tools becomes available.

---

## Commit 035 - Add least-privilege CI and tag-driven draft-release pipeline

**Commit:** `a9e9c36` - `Add least-privilege CI and tag-driven draft-release pipeline`
**Timestamp:** August 21, 2026 at 11:33:49 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

The pending packaging entry below was finalized as commit `23dddba`, whose first CI run then completed green on shared runners. This entry implements plan section 9.3: a least-privilege continuous-integration workflow for pull requests and main-branch pushes, and an immutable tag-driven pipeline that assembles all four package formats for both architectures onto one draft GitHub Release.

### Intent

Make every future change independently verifiable on shared infrastructure and turn approved version tags into reviewable draft releases without granting ordinary pushes any release capability.

### Important changes

- Added `.github/workflows/ci.yml`: pull-request and main-push runs covering frozen install, formatting, lint, five-project type checks, unit/component tests, fixture integration tests, the production build with its bundle-budget gate, and the packaged security suite under Xvfb with exactly the runtime libraries Token Trail's own deb declares.
- Added `.github/workflows/release.yml`: triggered only by pushed `v*` tags; distinct x64 and arm64 build jobs plus an SBOM job feed one draft-creation job that publishes nothing on its own — files land on a draft prerelease for maintainer review.
- Release jobs declare the protected `release` environment; the tag must equal the manifest version before any build starts (fail-closed guard).
- Added `scripts/write-build-provenance.mjs`: per-build JSON provenance recording arch, tag, commit, runner identity, toolchain versions, UTC capture time, and per-artifact sizes plus SHA-256 digests; refuses to write when no artifacts exist.
- SBOM generation uses npm's built-in CycloneDX emitter from the lockfile, so supply-chain metadata adds no new dependency to audit.

### Decisions and assumptions

- Every third-party action is pinned to one reviewed commit SHA fetched live from the GitHub API during authoring (checkout v7.0.1 `3d3c42e5…`, setup-node v7.0.0 `82076278…`, upload-artifact v7.0.1 `043fb46d…`, download-artifact v8.0.1 `3e5f45b2…`); floating tags were rejected because upstream movement would silently change CI behavior.
- Draft creation uses GitHub's preinstalled CLI rather than another third-party release action, keeping the write-capable step first-party.
- Signatures are intentionally absent pending an approved Linux signing plan; drafts are labeled unsigned previews in their notes.
- CI deliberately covers only the plan's section 9.3 check list; e2e, accessibility, packaged smoke, and performance suites remain phase-evidence commands rather than every-push gates.
- Repository-side settings that workflows cannot set themselves (release environment required reviewers, tag immutability) are named operator follow-ups.

### Verification

- Both workflow files parse as valid YAML (`js-yaml`).
- The provenance script executed locally against the existing six built artifacts and produced correct schema-shaped output including hashes; it was also fixed during development after its own first run exposed a missing import.
- Formatting and lint pass.
- Observed after push: the pipeline's first shared-runner execution completed successfully in 56 seconds on `ubuntu-24.04` (run 32549322828), with both the quality and built-security jobs green — frozen install, all static gates, unit/component suites, integration fixtures, the bundle-budget-gated build, and the Xvfb-driven security suite.

### Fact check

- Action SHAs came from api.github.com tag refs showing `type: "commit"`, so pins point at exact commits rather than annotated-tag indirection.
- `npm sbom --sbom-format cyclonedx` confirmed available in npm 12 via local help output.
- Ubuntu 24.04 library names use the t64 suffix convention; the CI apt list mirrors the deb Depends set verified in Commit 034's artifact inspection.

### Sanity check

- No new capability crosses any product trust boundary: both files orchestrate existing reviewed commands; the renderer allowlist, CSP, IPC surface, and Codex scope are untouched.
- Ordinary branch pushes cannot reach the release workflow's trigger, and its only write permission is scoped to the single draft-creation step.

### User lessons

- Least privilege in CI means naming permissions explicitly even when defaults would do; explicit denials survive platform default changes.
- A tag-driven draft pipeline converts "releasing" from a risky act into reviewing a prepared draft — publication becomes the only human decision.

### Agent lessons

- Pin actions by fetching the tag ref from the API and checking it resolves to type "commit"; annotated tags would pin a tag object, not code.
- Test helper scripts against real inputs before wiring them into automation: the missing-import defect surfaced on first local execution, not in CI.

### Risks or limitations

- rpm assembly inside the release pipeline remains unexercised until rpm-tools-equivalent runners build it; the workflow installs Ubuntu's `rpm` package for that step.
- Runner-image drift (library names, npm global install behavior) could break CI in future Ubuntu refreshes; the first run surfaced no such issue.

### Follow-up

Push and observe the first CI run; then proceed to plan section 9.4 user documentation and 9.5 architecture records while monitoring CI results.

---

## Commit 034 - Open Phase 5 with the four-format Linux release packaging

**Commit:** `23dddba` - `Open Phase 5 with the four-format Linux release packaging`
**Timestamp:** August 21, 2026 at 11:18:39 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

The pending Phase 4 close-out entry was finalized as commit `21327f2`. This entry opens Phase 5 per the approved sequence and completes plan section 9.2 in one coherent increment: all four approved Linux package formats become configured, contract-tested release targets with AppStream metadata, machine-safe artifact names, corrected desktop window-association identity, and an automated packaged-contents inspection gate.

### Intent

Turn the single-target Phase 1 packaging prototype into the reviewed four-format release-candidate configuration — AppImage, deb, rpm, and Pacman — so every later packaging, CI, and verification task operates on the final artifact shape instead of a development placeholder.

### Important changes

- Bumped the working version to 0.5.0 in the manifest and lockfile because code changed after the tested 0.4.0 record.
- `electron-builder.config.cjs` now builds all four formats from one configuration; artifact names switched from the spaced product name to the machine-safe `${name}` stem, matching decision 008's filesystem-facing identity rule.
- Desktop window association fixed: manifest gains `desktopName: "tokentrail.desktop"` plus `linux.syncDesktopName`, so the installed `.desktop` file name matches Electron's derived WM_CLASS and Wayland app_id; verified inside the built deb (`StartupWMClass=tokentrail`, `/usr/share/applications/tokentrail.desktop`) and the AppImage payload.
- Added `build/metainfo/com.tokentrail.app.metainfo.xml` and shipped it into deb, rpm, and Pacman payloads at `/usr/share/metainfo/` through fpm's typed passthrough; AppImage-side AppStream embedding deferred with rationale (electron-builder 26 has no per-target mapping for that format).
- Manifest gains `homepage` and object-form `author` with email because fpm-based targets hard-require both for maintainer metadata.
- Added `npm run check:package-contents` (`scripts/verify-package-contents.mjs`): exact unpacked-entry allowlist, Electron license presence, parsed ASAR header listing rejecting development paths, and credential-marker scans across the archive and every release artifact.
- Added `src/build/packaging-config.test.ts`: fourteen contract tests pinning target set, artifact template, slug/category, syncDesktopName wiring, maintainer/vendor, payload allowlist, fuse posture, and metainfo delivery including its honest-description guard.
- Added `package:linux`, `package:x64`, and `package:arm64` commands building architectures separately.

### Decisions and assumptions

- Dependency sets stay owned by electron-builder's maintained per-format defaults (verified in generated deb `Depends` and Pacman `depend` lists) rather than hand-pinned lists that would silently drift across Electron upgrades.
- No post-install or post-remove hooks are declared because v1 ships no tray, autostart, MIME daemon, or service; uninstall takes only package-owned files.
- Maintainer identity mirrors the repository's established Git author (`Aman Ali <pamanalionline@gmail.com>`); confirmed with the operator when packages demanded a contact address.
- rpm assembly is configured but was not completed locally: fpm requires host `rpmbuild` (rpm-tools), which was not yet installed on the reference machine during this session; recorded honestly instead of claimed.

### Verification

- `npm run verify`: formatting, lint, strict type checks across five projects, unit tests 220 passed across 29 files (fourteen new), integration tests 32 passed.
- x64 builds assembled locally: `tokentrail-0.5.0-linux-x86_64.AppImage` (127.9 MB), `-linux-amd64.deb` (100.5 MB), `-linux-x64.pacman` (91.0 MB).
- Separate arm64 invocations produced correctly labeled `arm64`/`aarch64` AppImage, deb, and Pacman artifacts without relabeling.
- Artifact inspection: deb control fields (Package, Version, Maintainer, Depends, Homepage, License), data paths (desktop entry, hicolor icon, metainfo), Pacman `.PKGINFO`, and the AppImage embedded desktop entry all read back correct values.
- `npm run test:packaged`: four passed on both display-server backends after the configuration change.
- `npm run check:package-contents`: passed after it caught one real defect during development — its own initial allowlist omitted Electron's license artifacts.

### Fact check

- electron-builder 26.15.3 option surface verified from installed sources: `LinuxTargetSpecificOptions` carries no `extraFiles`; AppStream delivery uses `deb`/`rpm`/`pacman.fpm` mappings; `syncDesktopName`/manifest `desktopName` drive `getDesktopFileName` and `StartupWMClass`; FpmTarget errors without project homepage or author email; `--arm64` exists as a CLI flag.
- Generated control files were read directly (`ar p … control.tar.xz`, `tar -xOf .PKGINFO`, `--appimage-extract`) rather than inferred from logs.

### Sanity check

- No privacy, security, lifecycle, or network behavior changed: the Codex allowlist, IPC surface, CSP, and fuse posture are untouched; new tests pin exactly that posture.
- The metainfo document describes only implemented read-only behavior and its content test rejects telemetry/cloud/sync/update-check language, so packaged claims cannot outrun the product.

### User lessons

- Native package formats require maintainer accountability metadata before anything builds; identity decisions made casually early (author string without email) surface as hard build failures later.
- Window↔launcher association on Linux depends on three names agreeing: executable slug, installed desktop-file name, and WM_CLASS/app_id; one config pair (`desktopName` + `syncDesktopName`) keeps them aligned.
- Each package format labels architecture in its own native vocabulary (`amd64` versus `x86_64` versus `aarch64`); correct labeling means using each format's convention, not one global string.

### Agent lessons

- Read installed dependency sources instead of trusting memory: two assumed facts (per-target extraFiles support; built-in AppStream generation) were both false for electron-builder 26.
- An inspection gate earns its keep immediately when it flags its own author's mistakes; write gates to fail loudly before any release use.

### Risks or limitations

- rpm output is configured but unverified until the host `rpmbuild` tool exists; full install/upgrade/uninstall evidence remains section 9.6 and CI work regardless.
- AppImage lacks embedded AppStream metadata by design decision; store-style indexing of the image itself stays out of scope for v1.

### Follow-up

Build the local rpm once rpm-tools is available, then proceed to plan sections 9.3 (GitHub Actions CI and protected release workflow) and 9.4 (user installation documentation).

---

## Commit 033 - Close Phase 4 automated scope with the 0.4.0 evidence record

**Commit:** `21327f2` - `Close Phase 4 automated scope with the 0.4.0 evidence record`
**Timestamp:** August 21, 2026 at 8:18:14 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

The previously pending desktop-identity entry was finalized as commit `7b47f47`. This entry completes the remaining section 8.7 deliverable, records the Phase 4 evidence report as version `0.4.0`, and performs the exit-criteria sweep.

### Intent

Close out every machine-completable Phase 4 item in one pass: publish the compatibility-and-support-matrix draft from recorded evidence, promote the working version to 0.4.0 with a full versioned evidence record including curated screenshots, and sweep the exit criteria honestly — leaving the human screen-reader criterion visibly open rather than simulating it.

### Important changes

- Created `docs/support/compatibility-and-support-matrix.md` with explicit quality labels (Verified / Verified-reference-only / Emulated / Untested / Deferred) covering platforms, display servers, architectures, package formats, accessibility areas, and performance; support claims are bounded to evidence.
- Bumped the working version to 0.4.0 in the manifest and lockfile because code changed after the tested 0.3.0 record.
- Captured nine curated screenshots from the built application running the checked-in fixture scenario into `tests/test_reports/0.4.0/screenshots/`, visually inspected for intended states and privacy (synthetic data only), including true dark-palette captures after discovering the session default resolves light.
- Created `tests/test_reports/0.4.0/test_report.md`: scope, environments, commands with final counts, per-layer summaries, an eleven-row defect-and-remediation table honoring integrity rules, security/privacy verification, accessibility verification including outstanding items, the honest Linux matrix, performance-versus-budget tables, installation scope, limitations, and a `preview-only` recommendation.
- Swept plan section 8.9 exit criteria from evidence: seven criteria marked complete; the manual-checks criterion stays open with an indented note recording which portions are satisfied and why the manual screen-reader portion gates formal closure.
- Updated the plan status header to the substantially-complete state with the gating conditions named.

### Decisions and assumptions

- The versioned report records run windows honestly (evening of August 21, 2026) instead of inventing per-command wall-clock starts that were never captured.
- Screenshots use explicit theme overrides where the capture name names a palette, because this session's system preference resolves light and unnamed defaults would have mislabeled evidence.
- Formal Phase 4 closure is deliberately withheld pending only operator-held evidence; nothing else remains machine-completable.

### Verification

- `npm run verify` after all edits: formatting, lint, strict type checks, unit tests 206 passed across 28 files, integration tests 32 passed.
- Packaged suite 4 passed; performance suite 1 passed; interaction suite passed; documentation check clean at 37 files plus the new report.
- Screenshot set visually reviewed for correct states, palettes matching their filenames, and absence of real user data.

### Risks or limitations

- The report's environment matrix inherits every deferred item named above; no support claims extend beyond recorded evidence.
- Formal closure requires the operator Orca session plus, eventually, soak-campaign items that belong to later phases by plan design.

### Follow-up

Operator-performed Orca session closes the last Phase 4 exit criterion; then Phase 5 packaging begins per the approved sequence.

---

## Commit 032 - Verify desktop identity across backends and enforce Wayland conduct

**Commit:** `7b47f47` - `Verify desktop identity across backends and enforce Wayland conduct`
**Timestamp:** August 21, 2026 at 8:06:17 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Verify the packaged prototype's reviewed identity across the display-server backends available here, encode Wayland conduct as an enforced contract, and correct a runtime naming gap the verification exposed.

### Important changes

- Added `tests/packaged/desktop-identity.spec.ts`: two packaged launches assert real content, window title `Token Trail`, and an executable basename of exactly `tokentrail` read through `/proc/<pid>/exe` — once on the native Wayland backend and once forced onto X11 through XWayland via `ELECTRON_OZONE_PLATFORM_HINT`, with a user-agent check proving the hint actually reached Chromium so silent fallback cannot fake coverage.
- Fixed a runtime naming gap the new assertions found: the packaged manifest lacked a product name, so runtime name reporting used the machine slug. Added `"productName": "Token Trail"` beside `"name": "tokentrail"` in the manifest, keeping people-facing and machine-facing identities paired after install.
- Extended the packaged launch helper with an opt-in extra-environment merge, mirroring the built-application launcher.
- Added `src/main/windows/wayland-conduct.test.ts`: a static contract forbidding absolute window positioning, stacking manipulation, blur, and unsolicited focus; focus acquisition is allowed only on lines carrying a `conduct:focus` marker, currently the single second-instance raise that answers the user's own launch action.
- Created `docs/architecture/linux-desktop-integration.md` covering dual identities, backend coverage with honest environment limits (GNOME and other desktops remain unavailable), Wayland conduct, deferred scaling/display matrices, and Phase 5 desktop-entry scope.
- Marked three section 8.6 plan tasks complete; GNOME/Cinnamon/Xfce sessions and fractional-scaling/multi-display work stay honestly unchecked.

### Decisions and assumptions

- Executable basename through `/proc` is treated as the launcher-visible identity proxy because raw-process harnesses have no main-process evaluation surface; it matches how Wayland app ids derive from executables.
- The second-instance raise is classified as user-initiated rather than stolen focus, and the allowance is per-line marked so every future exception stays visible to review.

### Verification

- `npm run verify`: formatting, lint, strict type checks across five projects, unit tests 206 passed across 28 files including the three conduct cases, integration tests 32 passed.
- `npm run test:packaged`: four passed including both backend identity launches.
- `npm run check:docs`: 37 files scanned, no broken links.

### Risks or limitations

- Native window-chrome visual confirmation remains operator work for the versioned report.
- Installed desktop-entry verification waits for Phase 5 installer artifacts and clean installs.

### Follow-up

Complete section 8.7 with the compatibility-and-support-matrix draft, then close Phase 4 with curated evidence into the versioned report and an exit-criteria sweep.

---

---

## Commit 031 - Move focus to new route content on navigation and gate accessibility on axe-core

**Commit:** `cac92fb` - `Move focus to new route content on navigation` (combined commit also containing the axe-core gate described below)
**Timestamp:** August 21, 2026 at 6:51:22 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Complete two remaining accessibility-campaign gaps together: intentional route changes must move keyboard and assistive-technology focus onto the requested content, and the plan's axe-core review must become a permanent automated gate across routes, tabs, preview states, and themes.

### Important changes

- The application shell moves focus to the active route's level-one heading after every route change; the initial render keeps the document's natural focus start so the skip link remains first. Learn deep links focus their targeted explanation card directly alongside the existing highlight.
- Both keyboard-only sweeps release heading focus between legs because forward Tab order intentionally starts from the content now; unit and end-to-end assertions pin the new focus behavior.
- Added the pinned dev dependency `axe-core` 4.13.0 (MPL-2.0, test-context only, never bundled into application output) and documented it in the dependency rationale.
- Added `tests/e2e/accessibility-audit.spec.ts`: nine scans over the built fixture application gating on zero serious or critical violations while logging every lesser impact for review.
- Injection uses Playwright's debugger-channel init script plus one reload because the packaged CSP correctly blocks inline page scripts; the audit runs without weakening any production security property.
- Remediation of the single serious finding: a nested unfocusable scroll container around the diagnostics preview was fixed structurally by moving scrolling entirely to the already-focusable region.
- Updated the accessibility architecture evidence and limitations; marked the plan's axe-core task complete.

### Decisions and assumptions

- Heading-focused navigation is the standard SPA pattern; programmatic heading focus does not display an outline under Chromium's focus-visible heuristic, matching platform behavior.
- The gate asserts zero serious and critical findings while minor and moderate results remain visible in run output for future reviews.
- CSP bypass through the debugger channel is test-harness privilege, not an application change; the shipped policy is untouched.

### Verification

- `npm run verify`: formatting, lint, strict type checks, unit tests 203 passed across 27 files, integration tests 30 passed.
- Full e2e plus accessibility suites after a fresh build: 25 passed including the audit reporting zero violations across all scans.
- `npm run check:docs` clean; `npm audit --omit=dev` reports zero known vulnerabilities.

### Risks or limitations

- axe covers rendered states reachable in this suite; future interactive states should add scans when they land.
- Manual Orca screen-reader, high-contrast, and reduced-motion observations remain open Phase 4 evidence.

### Follow-up

Record the manual assistive-technology campaign, then continue to sections 8.4 onward.

---

## Current uncommitted work

**First recorded:** August 21, 2026 after commit `231d332`
**Last updated:** August 21, 2026 at 7:05 PM EDT (`America/Toronto`, UTC-04:00)
**State:** Pending; not yet a Git commit when this entry was written

The previously pending keyboard-evidence entry was finalized as commit `3d89ea8`, and the route-focus work was finalized as commit `231d332`. This entry records axe-core integration and its one remediation.

### Intent

Complete the plan's "run axe-core and review every serious result" task with a permanent automated gate across routes, tabs, preview states, and both themes, remediating whatever the engine found.

### Important changes

- Added the pinned dev dependency `axe-core` 4.13.0 (MPL-2.0, test-context only, never bundled into application output) and documented it in the dependency rationale.
- Added `tests/e2e/accessibility-audit.spec.ts`: nine scans over the built fixture application — all six routes, the settings diagnostics tab with a built preview, and light-theme rescans of Overview and Usage — gating on zero serious or critical violations while logging every lesser impact for review.
- Injection uses Playwright's debugger-channel init script plus one reload because the packaged CSP correctly blocks inline page scripts; the audit therefore runs without weakening any production security property.
- Remediation: the single serious finding (a nested unfocusable scroll container around the diagnostics preview) was fixed structurally by moving scrolling entirely to the already-focusable region, removing the duplicate overflow from the preview block itself.
- Updated the accessibility architecture evidence and limitations; marked the plan's axe-core task complete.

### Decisions and assumptions

- The gate asserts zero serious and critical findings; minor and moderate results remain visible in run output so future reviews see them without blocking on engine opinion.
- CSP bypass through the debugger channel is test-harness privilege, not an application change; the shipped policy is untouched.

### Verification

- `npm run check:docs` clean; `npm audit --omit=dev` reports zero known vulnerabilities.
- `npm run verify` passed end-to-end; full e2e plus accessibility suites after a fresh build: 25 passed including the audit suite reporting zero violations.

### Risks or limitations

- axe covers rendered states reachable in this suite; future interactive states should add scans when they land.

### Follow-up

Record the manual Orca screen-reader, high-contrast, and reduced-motion observations, then continue to sections 8.4 onward.

---

## Commit 031 - Move focus to new route content on navigation

**Commit:** `231d332` - `Move focus to new route content on navigation`
**Timestamp:** August 21, 2026 at 6:51:22 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Complete the remaining keyboard-campaign gap recorded in the accessibility architecture: intentional route changes must move keyboard and assistive-technology focus onto the requested content instead of leaving it on the activated control.

### Important changes

- The application shell now moves focus to the active route's level-one heading after every route change; the initial render keeps the document's natural focus start so the skip link remains the first stop.
- Learn deep links now focus their targeted explanation card directly (negative tab index, programmatic focus) so assistive technology announces the exact explanation a contextual link selected, alongside the existing highlight.
- Both keyboard-only sweeps (`routes.test.tsx` and `tests/e2e/fixture-catalog.spec.ts`) release heading focus between legs because forward Tab order intentionally starts from the content now.
- Added assertions: end-to-end focus lands on the Usage heading after activation; the unit Learn deep-link test asserts the targeted card is the active element.

### Decisions and assumptions

- Heading-focused navigation is the standard SPA pattern; the visible outline does not appear for programmatic heading focus under Chromium's focus-visible heuristic, matching platform behavior.
- Deep-link entries take precedence over the generic heading target because a specific card is the more precise announcement.

### Verification

- `npm run verify`: formatting, lint, strict type checks, unit tests 203 passed across 27 files, integration tests 30 passed.
- Full Playwright e2e suite after a fresh build: 22 passed.

### Risks or limitations

- None recorded beyond the standing screen-reader campaign follow-up.

---

## Commit 030 - Open section 8.3 with keyboard-only workflow evidence

**Commit:** `3d89ea8` - `Open section 8.3 with keyboard-only workflow evidence`
**Timestamp:** August 21, 2026 at 6:42:56 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Prove that every primary workflow completes through raw keyboard events alone on the real built application, add a first-class skip link for keyboard users, and fix the defect the new sweep exposed in the clear-data reset promise.

### Important changes

- Added `tests/e2e/keyboard-workflows.spec.ts`: one keyboard-only pass over skip link activation, Overview refresh completion, Usage chart/table toggling, focusable bounded scroll regions, theme and motion radio groups via arrow keys, automatic-refresh toggle plus numeric interval spin keys, diagnostics preview build, and the two-step clear-data flow including its Cancel escape. No pointer input occurs anywhere in the suite.
- Added a "Skip to content" bypass as the first control in document order; it moves focus into the main landmark without rewriting the hash, so deep-linked routes survive. The main landmark takes a negative tab index to receive that focus.
- Added regression coverage in `routes.test.tsx`: the skip link is first in document order, leaves a deep-linked hash untouched while moving focus, and route content stays put.
- Fixed a latent clear-data defect found by the sweep: the route ignored the defaults returned by `clearApplicationData`, so visible settings stayed stale until restart even though the dialog promised an immediate reset. The shared preferences hook now exposes an adoption path that applies validated defaults without recreating the deleted document; unit coverage asserts the live theme attribute and radio state return to System.
- Updated the accessibility architecture document's evidence and limitation sections for all of the above; marked the plan's keyboard-navigation and visible-focus tasks complete from this evidence.

### Decisions and assumptions

- Keyboard-only proof belongs at the end-to-end layer on the built application because jsdom cannot reproduce Electron focus semantics such as forward Tab order leaving the last landmark.
- Observable effects of asynchronous preference saves are asserted through polling rather than fixed sleeps so the suite stays fast and deterministic.

### Verification

- `npm run verify`: formatting, lint, strict type checks across five projects, unit tests 204 passed across 27 files including the new skip-link and clear-data adoption cases, integration tests 30 passed.
- Full Playwright e2e suite after a fresh build: 22 passed, including the new keyboard workflow sweep.
- `npm run check:docs`: 34 files scanned, no broken links.

### Risks or limitations

- Route-change focus management (moving focus to each new heading) remains open in the accessibility architecture limitations and lands next.
- The keyboard sweep exercises the fixture scenario's data shapes; denser lists use the same focusable containers verified here.

### Follow-up

Continue section 8.3: integrate axe-core into the automated suites and remediate serious findings, then record the manual screen-reader, high-contrast, and reduced-motion campaign.

---

---

## Commit 029 - Close section 8.2 with the motion and idle-CPU review

**Commit:** `f7c00b8` - `Close section 8.2 with the motion and idle-CPU review`
**Timestamp:** August 21, 2026 at 6:16:37 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Complete the final section 8.2 task by reviewing every continuous or decorative motion source against the reduced-motion contract and idle-CPU budgets, and locking the findings into automated guards instead of a one-time manual note.

### Important changes

- Inventoried all renderer motion: one CSS keyframe (the loading spinner's bounded rotation), zero transition shorthands, no ECharts entrance animation since the previous commit, and one 30-second clock interval backing countdown freshness with cleanup on unmount.
- Conclusion recorded in the design-system document: no decorative or continuous idle animation exists; the spinner is functional feedback that stops under reduced motion via both the system media query and the explicit preference classes.
- Added a four-case motion contract to `src/renderer/design-tokens.test.ts`: exactly one animation declaration plus its reduced-motion `none`, neutralization through the media query and the near-zero duration override classes, and a stylesheet-wide ban on transition shorthands so future movement needs a deliberate reduced-motion story.
- Marked the plan's final section 8.2 task complete; the design-system document now lists only phase-close screenshot capture and later accessibility-campaign revisions as open scope.

### Decisions and assumptions

- The loading spinner is classified as functional state feedback rather than decoration because it communicates an in-flight request and exists only while that request runs.
- A future transition or animation requires revising the motion contract in the same change, keeping the reduced-motion guarantee enforceable rather than aspirational.

### Verification

- `npm run verify`: formatting, lint, strict type checks across five projects, unit tests 202 passed across 27 files including the four new motion cases, integration tests 30 passed.
- Full Playwright e2e suite after a fresh build: 21 passed.
- `npm run check:docs`: 34 files scanned, no broken links after the document update.

### Risks or limitations

- Idle-CPU numbers are deferred to the Phase 5 packaged performance measurements; this review guarantees the absence of continuous idle motion rather than producing new CPU figures.

### Follow-up

Section 8.2 is closed. Begin section 8.3 accessibility work: axe-core integration into the component or end-to-end suites, then keyboard-only completion checks, then the manual screen-reader campaign record.

---

---

## Commit 028 - Wire the daily chart to design tokens with animation disabled

**Commit:** `de36e15` - `Wire the daily chart to design tokens with animation disabled`
**Timestamp:** August 21, 2026 at 6:08:16 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Complete the plan's "keep charts legible with color-independent patterns and equivalent tables" task by consuming the chart tokens inside the ECharts option, removing decorative animation, and locking the option contract in pure-function tests.

### Important changes

- Extracted `buildDailyChartOption` and `resolveDailyChartPalette` in the Usage route: the series fill reuses `--chart-series-b` (the same hue as progress tracks and heatmap cells), while axis labels, axis lines, grid lines, and tooltip surfaces resolve from muted, border, surface, and text tokens.
- Chart colors now follow live theme changes, including operating-system scheme flips while the "system" preference is active; the media-query subscription only updates state from its callback because synchronous effect-body updates are a cascading-render defect.
- Disabled ECharts animation outright so snapshot refreshes never replay entrance motion, serving reduced motion and idle-CPU budgets at once.
- Added bounded chart margins with contained axis labels for narrow widths.
- Added `src/renderer/routes/daily-chart.test.ts` with five cases: palette wiring, disabled animation, day mapping, reported-zero geometry, and safe-integer clamping.
- Guarded the system-scheme subscription against environments without matchMedia after jsdom component suites exposed that crash.
- Updated the design-system document's implemented scope and removed the completed item from limitations; marked the plan task done from this evidence.

### Decisions and assumptions

- Color independence is satisfied structurally for a single-series chart: hue never separates categories, axis labels identify bars, and exact values live in tooltips plus the equivalent table view rendered from one normalized source.
- Chart geometry clamps oversized counters at the safe integer maximum by prior design; the new unit test pins that behavior beside the exact bigint table presentation.
- jsdom's missing matchMedia is treated as an environment capability gap, not an application defect; absence only disables live scheme-flip re-resolution.

### Verification

- `npm run verify`: formatting, lint including the react-hooks set-state rule that caught the first draft, strict type checks, unit tests 198 passed across 27 files, integration tests 30 passed.
- Full Playwright e2e suite after a fresh build: 21 passed, confirming real chart rendering through the built application.

### Risks or limitations

- The tooltip surface uses opaque token fills; translucent blur styling was rejected as decoration with battery cost.
- Heatmap intensity bands remain opacity-based on one hue with legend and table alternatives rather than patterned fills; pattern textures can be revisited if manual Phase 4 accessibility review finds a need.

### Follow-up

Close section 8.2 with the animation/idle-CPU review, then begin section 8.3 accessibility work starting with axe-core integration.

---

---

## Commit 027 - Add the responsive width and zoom layout sweep

**Commit:** `5700f76` - `Add the responsive width and zoom layout sweep`
**Timestamp:** August 21, 2026 at 5:56:51 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Complete the plan's "support compact widths, typical laptop sizes, large screens, and zoom without clipped core actions" task with permanent automated evidence rather than a one-time manual pass.

### Important changes

- Added `tests/e2e/responsive.spec.ts`: an eight-combination matrix covering the enforced minimum window (720x560), laptop (1024), desktop (1440), and large-screen (1920) sizes at 100, 150, and 200 percent zoom, including the minimum window at 200 percent zoom which lays out near 360 CSS pixels.
- Each combination asserts zero horizontal document overflow, a visible brand link, all six navigation destinations visible inside the viewport, a refresh control with a usable target and unclipped label, and an unclipped page heading.
- Navigation queries scope to the navigation landmark with exact names because contextual content links share label prefixes with nav destinations; the first draft of the sweep hit that strict-mode collision and was corrected before anything passed falsely.
- The sweep found no layout defects in the existing breakpoint design; the suite now guards that result permanently.
- Updated `docs/architecture/design-system-and-theming.md` with the sweep description and moved the task out of open limitations; marked the plan's responsive-support task complete from this evidence.

### Decisions and assumptions

- Zoom is treated as a layout concern because Electron zoom scales CSS pixels inside a fixed window, so each zoom level is effectively a narrower viewport at the same window size.
- One application instance serves the whole matrix with per-combination geometry resets to keep runtime near two seconds; a failure still names its exact combination.

### Verification

- `npm run verify`: formatting, lint, strict type checks, unit tests 193 passed across 26 files, integration tests 30 passed.
- Full Playwright e2e suite after a fresh build: 21 passed, including the new responsive sweep.

### Risks or limitations

- The matrix exercises the loading-state shell plus Overview content; data-dense states such as full quota lists use the same containers and breakpoints but their densest layouts are additionally covered by component suites.
- Fractional OS display scaling is not simulated here; it behaves like an effective zoom factor and remains part of Phase 6 scaling coverage.

### Follow-up

Continue section 8.2: wire ECharts options to the chart tokens with color-independent legibility patterns, then the animation/idle-CPU cleanup before section 8.3 accessibility work.

---

---

## Commit 026 - Complete theme verification with WCAG remediation and theme-aware tints

**Commit:** `d17a25a` - `Complete theme verification with WCAG remediation and theme-aware tints`
**Timestamp:** August 21, 2026 at 5:50:35 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Complete the plan's "complete light, dark, and system themes" task by auditing WCAG contrast from the authored palettes, remediating the one failing pair, unifying all status tints into theme-aware color-mix expressions, and locking both outcomes into automated tests so future revisions cannot regress them silently.

### Important changes

- Computed WCAG 2 relative-luminance contrast for every functional pair across dark and light palettes: text roles against all four surfaces at 4.5:1, focus indicator at 3:1.
- Remediation applied: light-theme mint revised `#0a9f7e` to `#087c68`, raising small-text pairs (eyebrow labels, provenance pills) from about 3.1 to 4.8-5.1:1. The dark palette passed everywhere; its tightest pair is muted-on-surface-raised at 6.7:1.
- Replaced thirteen fixed rgba literals in component rules with color-mix() expressions derived from status roles and palette primitives, so banner washes, pill fills, state-icon backgrounds, connection halos, the privacy note, navigation washes, and the primary-card glow now follow each theme's own colors.
- Extended `src/renderer/design-tokens.test.ts` (now nine cases): a programmatic contrast audit over all three palettes and a component-discipline guard that strips palette layers and fails on any raw hex literal or rgb/rgba function.
- Updated `docs/architecture/design-system-and-theming.md`: audit results, remediation record, tint-unification note, and refreshed limitations; marked the plan's theme-completion task done from this evidence.

### Decisions and assumptions

- Accent-colored small text is treated as text requiring 4.5:1 rather than decoration; the audit encodes that interpretation so it stays deliberate.
- The light mint revision intentionally affects heatmap intensity, progress gradients, focus-adjacent accents, and success dots in light mode; all move toward better contrast and keep the same hue family.
- Dark-theme mint remains exactly `#54e5c1` because the development smoke test's replacement contract depends on that literal and the value already passes everywhere.

### Verification

- `npm run check:docs`: 34 files scanned, no broken links.
- `npm run verify`: formatting, lint, strict type checks, unit tests 193 passed across 26 files including the two new token cases, integration tests 30 passed.
- Full Playwright e2e plus development suites after a fresh build: 22 passed, including live theme switching, the typography matrix in both themes, and the packaged window-identity evidence.

### Risks or limitations

- The audit covers authored palette pairs; composite cases such as text over translucent tints are approximated by their near-white or near-dark effective backgrounds and were checked manually during remediation.
- Curated theme-matrix screenshots for the versioned report are still captured at phase close.

### Follow-up

Continue section 8.2: responsive and zoom sweep, ECharts wiring to chart tokens with color-independent patterns, then the animation/idle-CPU cleanup before moving to section 8.3 accessibility work.

---

---

## Commit 025 - Document visual-system licensing decisions and open the design-system architecture record

**Commit:** `ba98f23` - `Document visual-system licensing decisions and open the design-system architecture record`
**Timestamp:** August 21, 2026 at 5:36:24 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Resolve the plan's Phase 4 open question "production font and icon licenses" by documenting the deliberate no-obligation posture of the visual system, and open `docs/architecture/design-system-and-theming.md` as an implementation-in-progress record of the token layer, themes, typography stack, icon policy, motion state, and test evidence.

### Important changes

- Added `docs/architecture/design-system-and-theming.md` with honest implementation-in-progress status: implemented token groups and invariants, theme mechanics with recorded limitations (fixed rgba tints, pending contrast audit), the no-bundled-font decision and its license analysis, the no-icon-library policy, canonical asset wiring, current motion behavior, and the complete test-evidence map.
- Updated the architecture index reading order and ownership table for the new document and removed it from the planned list.
- Corrected stale dependency documentation: added the missing Phase 3 ECharts runtime row (tree-shaken core imports, Apache-2.0) and refreshed Zod's purpose to its actual boundary-validation role.
- Added a fonts/icons/branding section to `dependency-rationale.md` covering the unlicensed-font posture (no file bundled or fetched), the project-owned GPL-3.0-only brand artwork, and librsvg as a maintainer-invoked build-time tool whose PNG outputs carry no third-party claim.
- Marked the plan's "select and document production font and icon licenses" task complete.

### Decisions and assumptions

- The licensing question resolves to "no obligation by construction": nothing is bundled or fetched, so there is nothing to license; any future bundled typeface or icon set must pass the dependency addition rule including license review.
- The design-system document lists pending scope items explicitly rather than describing intended behavior as current.

### Verification

- `npm run check:docs` passed with 34 files scanned and no broken links after the new cross-links.
- `npm run verify` passed end-to-end: formatting, lint, strict type checks across five projects, unit tests 191 passed across 26 files, integration tests 30 passed.
- No application code changed in this entry's diff; runtime suites were rerun only as regression confirmation.

### Risks or limitations

- Palette values remain subject to the pending contrast audit; the licensing decision does not freeze specific colors.
- If a future revision bundles Inter or another face, the SIL Open Font License review path documented here becomes mandatory.

### Follow-up

Continue section 8.2: light/dark/system theme completion (rgba tint unification plus fresh screenshots), responsive and zoom sweep, chart-legibility patterns wired to chart tokens, and the animation/idle-CPU cleanup.

---

---

## Commit 024 - Finalize production vector logo and required raster exports

**Commit:** `cc8a666` - `Finalize production vector logo and required raster exports`
**Timestamp:** August 21, 2026 at 5:31:11 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Complete the plan's "finalize production vector logo and required raster exports" task by reconstructing the approved icon mark as a maintained vector master, deriving every required raster deterministically from it, and repointing all runtime and packaging consumers at the canonical exports so future brand edits have exactly one source.

### Important changes

- Added `assets/branding/tokentrail-icon.svg`, a vector reconstruction of the approved `tokentrail-icon-v2-dark.png` mark. Geometry was fitted from pixel scanlines and connected-component analysis of the approved raster; rendering the SVG at 512x512 and comparing against the original shows under one percent of pixels differing beyond an eight percent color tolerance, concentrated in anti-aliased edges. Side-by-side 48-pixel renders were visually reviewed during fitting.
- Added `scripts/export-brand-rasters.mjs` plus the `export:branding` command. The script renders sizes 16, 24, 32, 48, 64, 88, 128, 256, and 512 from the SVG through system `rsvg-convert`, deliberately kept outside npm so no package or install script is added for rarely run tooling, and fails loudly on partial export sets.
- Generated `assets/branding/exports/tokentrail-icon-<size>.png` for every required size; the 512 export is 19.7 KB versus 201 KB for the historical concept raster.
- Repointed consumers to canonical exports: the renderer brand tile now imports the 88-pixel export (44 CSS pixels at two-times density), `createMainWindow` resolves `exports/tokentrail-icon-256.png`, electron-builder's Linux metadata uses the 512 export, and the packaged-file allowlist ships only the runtime 256 asset.
- Updated the window-identity Electron evidence and the packaged ASAR-content assertion to the new canonical names.
- Historical approved art (`tokentrail-icon-v2-dark.png`, concept files) remains untouched as provenance for versioned test-report evidence.
- Marked the plan's vector-logo task complete with the verification below.

### Decisions and assumptions

- The vector file is a faithful reconstruction, not a redesign; any intentional visual change requires new user-visible evidence per the plan's evidence rules.
- librsvg is documented as a system requirement of a maintainer-invoked script rather than an npm dependency, honoring the smallest-dependency rule.
- The renderer bundle now carries a 3 KB brand asset instead of a 202 KB one, which also serves the later Phase 5 renderer budget work.
- The window icon ships inside the archive at 256 pixels because desktop shells scale window icons down; installer metadata reads the 512 export from build resources instead.

### Verification

- Pixel comparison: AE beyond eight percent fuzz = 2004 of 262144 pixels (0.76 percent) between the 512 render and the approved raster; RMSE recorded at 6.9 percent including anti-aliasing.
- Visual review: original and vector side-by-side at 48 pixels confirmed indistinguishable identity.
- `npm run verify` passed end-to-end: formatting, lint, strict type checks across five projects, unit tests 191 passed across 26 files, integration tests 30 passed.
- `npm run build` followed by the complete Playwright e2e suite: 20 passed, including window-identity resolution from `assets/branding/exports/tokentrail-icon-256.png`.
- `npm run test:packaged` passed: hardened unpackaged launch plus ASAR-header proof that `tokentrail-icon-256.png` ships inside the application archive.

### Risks or limitations

- KDE Wayland automation still cannot capture native window-chrome icons, so desktop-shell visual confirmation remains manual Phase 4 work.
- The remaining sub-one-percent pixel delta is anti-aliasing, but any future brand revision must regenerate exports and rerun this verification chain.

### Follow-up

Document font and icon licensing decisions, then continue section 8.2 theme completion, responsive/zoom sweep, chart legibility patterns, and animation-budget cleanup before sections 8.3 onward.

---

---

## Commit 023 - Open Phase 4 with the production design-token layer

**Commit:** `de3e336` - `Open Phase 4 with the production design-token layer`
**Timestamp:** August 21, 2026 at 5:07:53 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Open plan section 8.2 by converting the renderer stylesheet's scattered presentation values into one reviewed design-token layer without changing any computed appearance, so later theme, responsiveness, accessibility, and performance work revises named tokens instead of raw values.

### Important changes

- Restructured `src/renderer/styles.css` into documented token groups: typography (`--font-sans` and the display-number pair), an eight-step spacing scale, a component-role radius scale, elevation (`--shadow` plus a reserved `--glow-brand`), keyboard-focus ring geometry, chart series/track semantics, and status success/warning/accent aliases mapped onto palette primitives.
- Replaced every border-radius outside the token layer with scale references, moved structural gaps, margins, and one panel padding onto spacing steps, wired progress tracks and heatmap intensity to chart series roles, and routed connection, banner, pill, state-icon, and explanation-icon colors through status aliases; every replacement is value-identical to the verified Phase 3 appearance.
- Documented the three intentional remaining primitive-color uses inline (eyebrow brand flourish, spinner motion accent, Learn landing highlight) so no unexplained raw color survives in the file.
- Removed the duplicated display-number `:root` block by consolidating those tokens into the main token layer.
- Added `src/renderer/design-tokens.test.ts` locking required token groups, exact alias wiring, exact light/system palette parity against the fourteen dark color roles, radius-token discipline outside the layer, zero remote `url()`, `@import`, or protocol references, and the literal `--mint: #54e5c1;` development smoke-test contract.
- Excluded `*.test.ts` and `*.test.tsx` files from `tsconfig.renderer.json` so renderer production type checking keeps its deliberate Node-free boundary while test files retain Node types through `tsconfig.tests.json`.
- Recorded Phase 4 start (August 21, 2026, from commit `26f73fe`) in the implementation plan header and marked the section 8.2 design-token task complete.

### Decisions and assumptions

- Token values reproduce the tested Phase 3 appearance exactly; visual revisions belong to dedicated tasks with fresh screenshot evidence rather than riding along on this refactor.
- Pixel radii became rem-based tokens, identical at the default root size, so every length now tracks root font scaling uniformly.
- Light-theme rgba tints tied to fixed dark-palette literals remain literal because changing them would alter light-theme rendering; unifying them belongs to the theme-completion task with visual evidence.
- jsdom's `URL` global shadows Node's and resolves relative URLs against the jsdom page origin, so the new test resolves the stylesheet path by passing the module URL string directly to `fileURLToPath` instead of constructing a relative URL.

### Verification

- `npx prettier --write` was applied to the changed files before verification.
- `npm run verify` passed end-to-end: formatting check, lint, strict type checks across five projects, unit tests 191 passed across 26 files including the 7 new token-contract cases, and integration tests 30 passed.
- `npm run check:docs` passed with 33 files scanned and no broken links.
- Development smoke and packaged suites were not rerun because computed styles are unchanged by design; they run again when visual revisions land.

### Risks or limitations

- The token layer documents today's values; the upcoming contrast audit may still revise specific palette entries through the same tokens.
- Spacing values outside the reviewed scale, such as compact control gaps, stay intentionally literal until the responsive and zoom sweep normalizes them.

### Follow-up

Continue section 8.2: production logo vectorization and raster exports, font and icon licensing documentation, light/dark/system theme completion, the responsive and zoom sweep, chart legibility patterns, then sections 8.3 onward.

---

---

## Commit 022 - Phase 3 verification gate closed with full evidence record

**Commit:** `26f73fe` - `Close Phase 3 verification gate with full evidence record`
**Timestamp:** August 21, 2026 at 11:11:10 AM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Close the Phase 3 gate from the plan's section 7.8: execute the complete required fixture catalog, verify every formula edge-case family, prove keyboard-visible operation of all six routes, capture runtime window-identity and numeric-readability evidence, add sanitized diagnostics health categories, expand contextual navigation, refresh architecture documents to implemented-system status with diagrams and an automated link/terminology gate, and record everything in a versioned `0.3.0` test report.

### Important changes

- Extended the checked-in app-server fixture with sixteen new scenarios covering the remaining product-spec section 21.2 requirements: window-shape variants (`primary-only`, `secondary-only`, `no-windows`), unknown limit and plan values, sparse updates before and after a full snapshot, credit unlimited/zero/decimal states, reset-credit count-only and five-row expiry mixes, gapped/zero/duplicate daily buckets, sixty-date spans with a zero preceding period, counters beyond safe integer range, shared reset timestamps, reached-state reports, duplicate response correlation IDs, and parameterized `typography-*` scenarios.
- Added `tests/integration/fixture-catalog.test.ts` executing the whole catalog through the real owned-process transport plus six end-to-end renderer cases and a real-Electron keyboard-only route sweep.
- Added contextual navigation throughout the renderer: error panels offer corrective actions, capacity clauses link to Quota Windows/Credits detail, reached pills and coverage/session notes deep-link to reviewed Learn entries via validated `#learn/<entry-id>` hashes with safe fallback for unknown identifiers.
- Added the sanitized diagnostics `health` document section (bounded refresh attempt/success/failure/no-data counters, one closed outcome category, coarsened duration buckets) recorded in process memory only by observing snapshot transitions; wired through IPC timing and documented in contracts, inventory, and the IPC architecture page.
- Fixed three latent defects found by this verification (see Fact-check report): sender authorization denied all post-navigation IPC because it required an empty URL fragment; settings selections persisted but did not apply live; and `.remaining-value strong` overrode the display-number typography token with negative tracking.
- Isolated built-app tests from persisted state with disposable per-launch profile directories behind an unpackaged-only `TOKENTRAIL_TEST_USER_DATA_DIR` seam.
- Added `tests/e2e/window-identity.spec.ts` (runtime icon resolution proof) and `tests/e2e/typography.spec.ts` (geometry assertions plus twenty curated matrix captures across themes, zoom, and narrowest width).
- Added `scripts/check-doc-links.mjs` and the `check:docs` command validating local links, heading fragments, and Token Trail product-copy terminology across all Markdown.
- Updated seven architecture documents to implemented-system status, corrected stale facts (bridge method count, usage-read activation, data-inventory rows, fragment authorization rule), and added compact flow diagrams to the diagnostics and preferences pages.
- Produced `tests/test_reports/0.3.0/test_report.md` with timezone-aware execution times, the full matrix results, defect-disposition records, performance measurements, and curated evidence; bumped the package version to 0.3.0.

### Decisions and assumptions

- URL fragments are treated as client-side route state of the already-trusted top-level document, not an authorization component; scheme, host, path, query, subframe, and malformed-input checks remain strict.
- Diagnostics health recording observes only already-normalized snapshots so no timestamp history, identifier, or raw value can enter the export surface.
- The version moves to 0.3.0 now that the versioned evidence record exists, matching the tracker rule that candidates change version when their code changes.
- echarts was upgraded within its pinned exact-version policy from 6.0.0 to 6.1.0 to remediate moderate advisory GHSA-fgmj-fm8m-jvvx rather than documenting an accepted risk.

### Verification

- `npm run verify`: passed August 21, 2026 at 10:39:21–10:39:35 AM EDT — formatting, lint, five strict TypeScript projects, 184 unit/component tests across 25 files, 30 integration tests across 3 files using real fixture processes.
- Combined Playwright run (E2E, security, accessibility, development): 27 tests passed at 10:39:49–10:40:27 AM EDT.
- Packaged smoke and identity: 2 tests passed at 10:40:27–10:40:33 AM EDT; performance measurement passed at 10:40:33–10:40:50 AM EDT (cold 413.5 ms, warm 341.8 ms, idle CPU 0.39%, memory ceiling miss carried openly to Phase 4).
- Coverage: 77.6% statements / 70.32% branches / 80.93% functions / 79.09% lines.
- `npm audit`: zero known vulnerabilities after the echarts upgrade.
- `npm run check:docs`: 33 files scanned, zero broken local links or fragments, zero terminology violations.

### Fact-check report

- Defect 1 reproduced empirically before fixing: clicking Dark in Settings produced `Error invoking remote method 'token-trail:preferences:set': Denied Token Trail IPC sender.` in the built app; root cause was the `hash === ''` requirement colliding with hash navigation. The fix is covered by new unit cases accepting fragments on approved documents while still rejecting combined path/query+fragment variants.
- Defect 2 confirmed via probe: radio clicks never changed `document.documentElement.dataset.theme`; the settings route shadowed the hook updater. The fix is covered by a live-application E2E asserting computed background tokens change immediately and persist across restart.
- Defect 3 measured directly: computed letter-spacing on the primary metric was -5.6px from the `.remaining-value strong` override; after the fix the geometry assertions read positive token tracking in all twenty matrix positions.
- Dark-theme captures were verified as genuinely dark (mean pixel brightness ≈ 48/255) after regeneration.
- All counts and timestamps above come from captured run output recorded during execution, not reconstructed afterward.

### Sanity-check report

- No write capability, prompt/task/repository access, credential handling, telemetry, network behavior, update check, or publication entered the codebase; the Codex allowlist is unchanged.
- The sender-authorization relaxation is scoped exactly to the fragment component of the two approved root documents; lookalike hosts, ports, paths, queries, and subframes still fail closed, with tests proving both directions.
- Missing data never becomes zero anywhere in the newly exercised surfaces; unavailable statistics render explicit language.
- Phase 3 is declared closed locally against plan sections 7.8/7.10 with the `preview-only` recommendation recorded in the versioned report; nothing here publishes or releases anything.

### User lessons

- A security boundary written before a UI mechanism exists can silently deny the entire feature layer later; integration seams need one real end-to-end invocation per handler before they can be called proven.
- Persisted-state leakage between test suites only becomes visible once persistence actually works; isolation belongs in the harness, not in suite ordering luck.
- Typography tokens lose to higher-specificity legacy rules silently; computed-style assertions catch what screenshots hide.

### Agent lessons

- Playwright's Electron evaluate context has neither `require`, dynamic `import`, nor CJS globals like `__dirname`; destructure needed modules from the electron object and derive paths from `app.getAppPath()` instead.
- React controlled radios ignore clicks when the underlying state never updates; "it worked in jsdom" proves rendering, not live application.
- GitHub heading slugs do not collapse repeated spaces and deduplicate with numeric suffixes; link checkers must match that exact algorithm to avoid false findings.

### Risks or limitations

- Native window-chrome/desktop-shell icon capture remains impossible under KDE Wayland automation; visual desktop-shell confirmation is deferred honestly to Phase 4 manual work.
- Manual screen-reader, contrast, high-contrast, and reduced-motion evidence is absent until Phase 4.
- Provisional resident-memory ceiling is missed (~802.5 MB process-tree sum); budget profiling and revision belong to Phase 4.
- GNOME, X11, arm64, fractional scaling, clean-distribution, and installer-format coverage waits for Phases 4–6.

### Follow-up

Commit this work, then begin Phase 4 per the approved plan: design tokens and theming, the accessibility campaign with manual screen-reader evidence, performance budgets including the memory investigation, and Linux desktop compatibility coverage. No release activity is authorized by this entry.

---

---

## Commit 021 - Documentation lifecycle expanded and KDE proposal relocated

**Commit:** `92619a4` - `Expand documentation lifecycle coverage and relocate historical KDE spec`
**Timestamp:** August 14, 2026 at 12:12:46 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

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

- Phase heading numbering, planned filenames, document ownership, local Markdown links, and whitespace were checked.
- Application tests were not rerun because the change modified Markdown only.

### Fact-check report

- Git confirms commit `92619a4`, author Aman Ali, timestamp August 14, 2026 at 12:12:46 PM EDT, 7 changed files, 177 insertions, and 23 deletions.
- The added tasks map directly to existing Phase 4 quality, Phase 5 packaging/release, and Phase 6 validation/publication responsibilities.
- No future document is presented as an existing file or implemented capability.
- The KDE specification's content remains present at its new path, and active links resolve there.

### Sanity-check report

- The expanded documentation scope does not add product features, network behavior, release authority, or support claims.
- Documents are assigned to the phase that can produce their evidence, avoiding speculative current-state prose.
- User and operational documentation are separated from architecture while remaining part of the final completion gate.
- Moving the KDE proposal does not change the approved Electron framework decision or revive KDE scope.

### User lessons

- A complete project record includes how users install and recover, how maintainers release and patch, what is supported, and how incidents are handled.
- Documentation can be comprehensive without being speculative when every file has an owning phase and evidence gate.
- Separating alternate ideation prevents a historical product specification from appearing to be the active document at the `docs/` root.

### Agent lessons

- Audit documentation coverage across the whole lifecycle: design, implementation, quality, distribution, operation, support, incident response, and maintenance.
- Do not place every completeness topic in architecture; use user, support, release, and maintenance collections where appropriate.
- Treat documentation walkthroughs as verification for installation, upgrade, uninstall, and release procedures.
- When moving a historical document, preserve its context, update active links and repository maps, and retain exact old paths only where describing historical Git facts.

### Risks or limitations

- The larger documentation set creates maintenance cost; phase exit checks must prevent stale or contradictory files.
- Final support and incident-response detail depends on actual packages, workflows, and observed compatibility and therefore remains planned.

### Follow-up

Create and validate each planned file only during its assigned phase.

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
