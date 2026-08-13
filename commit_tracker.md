# TokenTrail Commit Tracker

This document records the important outcome of each project commit in reverse chronological order. It complements Git history: Git remains the authoritative source for exact file changes, while this tracker explains why a change mattered and what was learned.

All displayed times use the `America/Toronto` timezone. Lessons are recorded only when supported by the project history or conversation; unknown lessons are marked as not recorded rather than invented.

## Contents

- [What each entry tracks](#what-each-entry-tracks)
- [Tracking rules](#tracking-rules)
- [Verification standards](#verification-standards)
- [Current uncommitted work](#current-uncommitted-work)
- [Commit 010 - Linked references and verification reports added](#commit-010---linked-references-and-verification-reports-added)
- [Commit 009 - Markdown contents navigation added](#commit-009---markdown-contents-navigation-added)
- [Commit 008 - Tracked Trail logo direction documented](#commit-008---tracked-trail-logo-direction-documented)
- [Commit 007 - Tracker filename normalized](#commit-007---tracker-filename-normalized)
- [Commit 006 - Tracker expanded and reordered](#commit-006---tracker-expanded-and-reordered)
- [Commit 005 - Commit tracker introduced](#commit-005---commit-tracker-introduced)
- [Commit 004 - README aligned with TokenTrail](#commit-004---readme-aligned-with-tokentrail)
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

A sanity-check report should confirm that the change makes sense within TokenTrail as a whole. It should look for:

- Conflicts with approved decisions, privacy rules, security boundaries, or current planning status.
- Broken navigation, duplicated information, stale terminology, and inconsistent filenames.
- Unnecessary scope growth or language that implies unapproved implementation.
- Usability problems, confusing metaphors, unsupported claims, and missing edge cases.
- Verification gaps that should remain visible to future readers.

---

## Current uncommitted work

**First recorded:** August 13, 2026 at 5:44:25 PM EDT (`America/Toronto`, UTC-04:00)
**Last updated:** August 13, 2026 at 5:54:27 PM EDT (`America/Toronto`, UTC-04:00)
**State:** Pending; not yet a Git commit when this entry was written

### Intent

Record Electron as the approved framework and create a complete Electron product specification covering product behavior, interface design, Linux compatibility, implementation choices, security architecture, testing, packaging, and release requirements.

### Important changes

- Created `product_spec_electron.md` as a separate Electron specification instead of overwriting the inherited KDE specification.
- Defined the complete product vision, v1 requirements, optional features, later opt-in ideas, and rejected privacy-expanding scope.
- Added 18 ASCII interface and state sketches covering the application shell, onboarding, errors, every primary screen, settings, diagnostics, dialogs, and optional tray behavior.
- Selected Electron, TypeScript, React, Vite, React Aria Components, Apache ECharts, Zod, TanStack Query, electron-builder, Vitest, React Testing Library, Playwright, and axe-core with reasons and alternatives.
- Specified main, preload, renderer, Codex adapter, IPC, trust, and data boundaries.
- Added a detailed threat model, BrowserWindow policy, Content Security Policy, custom protocol, IPC controls, Codex read allowlist, fuse posture, supply-chain rules, release integrity, and security gates.
- Defined Linux support honestly as a tested mainstream 64-bit matrix rather than every possible Linux system.
- Added AppImage, deb, rpm, and Pacman as initial package candidates while deferring Flatpak and Snap until host Codex access is designed safely.
- Updated the chronological decision log with approved Decision 005 and marked the KDE implementation direction as superseded.
- Added the new Electron specification to the README planning links.
- Finalized the preceding verification work as Commit 010 in this tracker.

### Decisions and assumptions

- Electron is approved as the application framework, but implementation remains separately gated.
- The Renderer is treated as untrusted and receives no Node, Electron, filesystem, shell, environment, credential, or raw protocol access.
- The first release is read-only and stores no usage history.
- The installed Codex app-server bindings are experimental evidence, not a permanent compatibility contract.
- Rich visuals never replace text, tables, provenance, keyboard behavior, or screen-reader access.
- “All possible features” is documented as a catalog with release labels so later ideas do not silently expand v1 data access.
- Exact dependency versions and final visual tokens will be decided during authorized implementation and verified through prototypes.

### Verification

- Primary or project-maintained documentation was researched for Electron security, process isolation, fuses, ASAR integrity, releases, Wayland, theming, tray, notifications, packaging, charting, accessible controls, runtime validation, and testing.
- The installed `codex-cli 0.146.1` generated experimental TypeScript bindings into a temporary directory. The observed read and denied method families were checked directly without adding generated files to the repository.
- All 61 unique external URLs across the repository Markdown files returned HTTP 200 during the final link check.
- All local Markdown file targets and heading anchors passed an automated check across the five Markdown documents.
- Markdown whitespace, prohibited dash characters, stale pending-framework language, and Git diff formatting passed their final checks.
- The latest Git history and working tree were reconciled again at the end of the work. Commit `f16d999` remained the latest commit and the four intended documentation files were the only changes.

### Fact-check report

- Electron's official security checklist supports local secure content, context isolation, process sandboxing, restrictive CSP, blocked navigation and windows, current framework versions, IPC sender validation, custom protocols, fuses, and narrowly exposed APIs.
- Electron's official ASAR integrity guide pairs embedded ASAR validation with the only-load-from-ASAR fuse.
- Electron's official release policy supports only the latest three stable major lines. The specification therefore avoids pinning a future version and requires current security updates at release time.
- Electron's official Wayland article states that Wayland works out of the box in version 38.2 and newer.
- Electron's Tray documentation says Linux uses StatusNotifierItem when available, with a GtkStatusIcon fallback. Its notification guide says `libnotify` works with KDE and other conforming desktops.
- electron-builder documents AppImage, deb, rpm, Pacman, Flatpak, and Snap targets plus Linux update support. The specification chooses only the formats whose access model fits the current design.
- Electron Forge's own documentation marks its Vite plugin experimental. This supports choosing separate Vite builds and electron-builder rather than depending on that plugin.
- ECharts documentation confirms SVG and Canvas renderers, selective imports, ARIA descriptions, and decal patterns. It does not prove TokenTrail's accessibility without manual testing, which the specification requires.
- React Aria documents unstyled accessibility-focused components and internationalization behavior. It is selected for interaction behavior, not as proof that every assembled screen is accessible.
- Playwright documents Electron support as experimental and notes limitations around native dialogs and fuse settings. Packaged smoke and direct integration tests remain required.
- The locally generated Codex bindings include `account/read`, `account/rateLimits/read`, `account/usage/read`, rate-limit updates, quota windows, credits, and aggregate daily and summary usage types. They also include many mutation and content operations that TokenTrail explicitly denies.
- The installed CLI labels app-server tooling and generated bindings experimental. Official public OpenAI documentation did not provide a stable schema guarantee in the research results, so the specification states that uncertainty instead of claiming support.
- Memory, startup, and interaction values are labeled initial budgets that require measurement. Comparative framework statements remain reasoned judgments rather than benchmark results.
- The final external-link pass checked 61 unique destinations and received HTTP 200 from each one. A successful response confirms availability, while the claim review above records whether a page supports the statement made from it.

### Sanity-check report

- The original KDE specification remains intact for historical comparison, while the new root-level Electron specification is clearly identified as the approved direction.
- The decision log preserves the earlier uncertainty and records approval in a new chronological entry rather than rewriting history.
- Framework approval is not described as implementation, dependency installation, publishing, signing, or update authorization.
- The privacy boundary remains narrower than the available Codex protocol: no credentials, content, tasks, projects, files, Git data, mutations, telemetry, or usage history enter v1.
- Optional tray, notifications, startup behavior, updates, local history, Windows, macOS, Flatpak, and Snap are separated from required v1 behavior.
- The interface includes loading, signed-out, unsupported, partial, stale, and error states instead of specifying only successful screens.
- Accessibility is built into library selection, chart alternatives, interface behavior, test layers, and acceptance criteria rather than relying on a final scanner.
- Security requirements cover development, runtime, process launch, IPC, storage, diagnostics, dependencies, packaging, updates, and release artifacts.
- The support statement does not promise flawless behavior on every Linux distribution. It defines a testable matrix and requires documentation of unsupported systems.
- README navigation, both product specifications, the decision log, and the tracker remain mutually discoverable.
- The new Electron specification contains a contents section whose targets, along with every other internal Markdown target in the repository, passed the final anchor check.
- No em dash or en dash appears in the repository Markdown files, and `git diff --check` reports no whitespace error.

### Why this work matters

This work turns a framework preference into a testable product and security plan. It gives future implementation a clear answer for what may be read, which process owns each privilege, how every major screen behaves, which libraries are justified, and what must pass before a public release.

### User lessons so far

- Electron can behave well on KDE without being a KDE-native Kirigami application.
- Cross-Linux quality comes from a defined distribution, desktop, display-server, architecture, and scaling matrix, not from claiming one package is universal.
- A hardened Electron renderer should be designed like an untrusted webpage with almost no bridge surface.
- Electron's larger capability set is manageable only when privileges are concentrated in small main-process services and denied everywhere else.
- Feature ideas can be documented fully without committing all of them to v1 or broadening privacy access.
- Generated protocol types are useful evidence, but an experimental label changes the compatibility strategy from hard version promises to detection and graceful fallback.
- Accessible charting requires tables, text, patterns, keyboard behavior, and manual tests in addition to a library's ARIA option.

### Agent lessons so far

- A chronological decision log should add the approval as a new decision while preserving the earlier evaluation language in context.
- Product, trust, protocol, and release boundaries must be designed together because a UI feature can change data access and attack surface.
- The most useful tool comparison explains both why a choice fits and what evidence could cause it to be revisited.
- Renderer, preload, main, adapter, and app-server responsibilities need separate statements to keep Electron security reviewable.
- A specification should distinguish observed local Codex bindings from public support guarantees.
- Packaging tool selection affects security, signing, update, and Linux format strategy, so it is an architectural decision rather than a late build detail.
- Performance targets must be framed as budgets until a packaged prototype provides measurements.

### Follow-up

Review the specification and resolve the open questions. If the user later authorizes implementation, begin with the security and compatibility prototypes in Phase 0. After this documentation is committed, replace this pending entry with its real Git metadata.

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
- Comparative claims remain judgments until a TokenTrail prototype measures them.

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
- Fact checking asks whether a claim is supported; sanity checking asks whether the result fits TokenTrail.
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
- Repository prose should be natural, direct, specific to TokenTrail, and free of em dashes.

### Verification

- Git records three new PNG files and changes to three Markdown files.
- The commit contains 271 inserted lines and 57 removed lines across the text files.
- The combined board and both split images were inspected before the commit.
- Both split images are 887 × 887 pixels.
- Markdown whitespace and banned punctuation were checked before handoff.

### Why this commit matters

This commit gives TokenTrail its first approved visual identity and preserves the reasoning behind it. It also turns several documentation preferences into written project conventions, reducing the chance that future work loses the context established during ideation.

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

## Commit 004 - README aligned with TokenTrail

**Commit:** `319d60b` - `Document TokenTrail project vision and planning status`
**Timestamp:** August 13, 2026 at 4:24:14 PM EDT (`America/Toronto`, UTC-04:00)
**Author:** Aman Ali

### Intent

Replace the old project name in the repository landing page and give visitors a concise, accurate explanation of TokenTrail.

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

The README is the repository's front door. This small change makes the visible project identity match TokenTrail and tells a new visitor what the project is trying to achieve without falsely suggesting that an application already exists. It also routes readers to deeper documents instead of leaving important context discoverable only through conversation history.

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
- No executable prototype or performance benchmark was produced, so resource and development-speed comparisons remain informed expectations rather than measured TokenTrail results.

### Why this commit matters

This commit prevents the inherited KDE proposal from becoming an unquestioned implementation choice. It puts two credible approaches beside each other and makes their trade-offs reviewable. It also preserves why a future framework was chosen, which will matter when contributors later ask why the project accepts that framework's dependencies, security model, packaging work, or visual constraints.

### User lessons

- “More visual libraries” and “better application” are different questions.
- Electron offers a broader ready-made visual ecosystem, while KDE/Kirigami offers stronger native Linux and Plasma integration.
- A toolkit does not create good design automatically; layout, hierarchy, typography, accessibility, and coherent interaction still require deliberate work.
- Electron's cross-platform promise reduces UI duplication, but it does not remove platform-specific testing, packaging, signing, or Codex compatibility work.
- Native KDE development can still produce rich custom visuals through QML, Qt Quick, Qt Graphs, and KQuickCharts; the difference is largely ecosystem breadth and effort.
- Electron usually carries a larger runtime footprint because it bundles Chromium and Node.js, but TokenTrail should measure packaged size, memory, and startup time rather than rely only on general reputation.
- Security must be considered while choosing the framework, not attached after the UI is built.
- A small disposable prototype can answer visual and performance questions more reliably than a long abstract debate.
- Changing the framework later would require updating the product specification, acceptance criteria, packaging plan, and terminology consistently.

### Agent lessons

- Framework recommendations must be tied to explicit product priorities rather than personal preference or library counts.
- For TokenTrail, visual-library breadth, KDE identity, resource use, contributor learning curve, security boundaries, and possible cross-platform distribution pull the choice in different directions.
- Electron requires a deliberately narrow main/preload/renderer architecture; the visual renderer must never gain generic process, filesystem, shell, or protocol access.
- `contextIsolation`, renderer sandboxing, disabled Node integration, a restrictive Content Security Policy, and validated purpose-specific IPC are baseline requirements if Electron is selected.
- The Codex protocol adapter and its read-only allowlist should remain conceptually independent of the UI framework, even though their implementations would differ.
- Current official documentation should be used for framework comparisons because Electron, Qt, Kirigami, and packaging practices evolve.
- Claims such as “lighter,” “faster,” or “easier” should be labeled as expectations until TokenTrail-specific prototypes provide measurements.
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

Turn the inherited TokenTrail handoff into a reviewable first-release product specification without beginning application implementation.

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

This is the first commit that explains what TokenTrail is supposed to become. It converts a broad handoff into testable product boundaries and makes future implementation review possible. It is also a guardrail: contributors can compare a proposed feature with documented goals, non-goals, privacy rules, and acceptance criteria before adding it.

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

- TokenTrail must distinguish OpenAI-reported values, locally observed values, TokenTrail calculations, and unavailable values throughout its data model and UI.
- The Codex app-server is experimental, so raw protocol behavior must be isolated behind a compatibility adapter.
- Protocol fields and methods cannot be assumed to exist forever; capability detection, optional parsing, unknown values, and partial failure are core requirements.
- The initial integration must remain read-only. Displaying a reset credit does not authorize consuming it.
- Authentication must stay owned by Codex; TokenTrail must never copy, expose, or store Codex or ChatGPT credentials.
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
- Established the baseline from which TokenTrail planning could proceed.

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
