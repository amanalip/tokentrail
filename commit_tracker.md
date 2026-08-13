# TokenTrail Commit Tracker

This document records the important outcome of each project commit in reverse chronological order. It complements Git history: Git remains the authoritative source for exact file changes, while this tracker explains why a change mattered and what was learned.

All displayed times use the `America/Toronto` timezone. Lessons are recorded only when supported by the project history or conversation; unknown lessons are marked as not recorded rather than invented.

## What each entry tracks

| Field | Purpose |
| --- | --- |
| Commit | Short hash linked to the exact Git change when a repository URL is available |
| Timestamp | Commit author time converted to Toronto local time, including timezone abbreviation and UTC offset |
| Intent | Why the change was made |
| Important changes | The meaningful outcome rather than a line-by-line file list |
| Decisions and assumptions | Product or technical direction introduced or affected |
| Verification | Checks performed and checks still missing |
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
- Approval to document a future action does not authorize implementation, publication, pushing, or release.

---

## Current uncommitted work

**First recorded:** August 13, 2026 at 5:10:19 PM EDT (`America/Toronto`, UTC-04:00)
**Last updated:** August 13, 2026 at 5:12:13 PM EDT (`America/Toronto`, UTC-04:00)
**State:** Pending; not yet a Git commit when this entry was written

### Intent

Establish the approved TokenTrail logo direction, create convenient light- and dark-mode image files, and document how the brand metaphor evolved during ideation.

### Important changes

- Added the approved side-by-side Tracked Trail concept board at `assets/branding/tokentrail-logo-concept-v1.png`.
- Added exact 887 × 887 crops for light mode and dark mode at `assets/branding/tokentrail-logo-light.png` and `assets/branding/tokentrail-logo-dark.png`.
- Added Design Decision 003, recording the initial Escaping Trail proposal, the concern it raised, the Tracked Trail revision, the approved palette, and future production constraints.
- Recorded the user's approval of the Tracked Trail visual direction without misrepresenting the current raster concept as a finished vector asset set.
- Updated this tracker to include commits `dbd3c03` and `feb8faf`, which were created after the earlier tracker update.
- Added Design Decision 004, which establishes a natural repository writing style and bans em dashes.
- Removed every em dash found in the current Markdown files.

### Verification

- The source concept board is 1774 × 887 pixels.
- Each split image is exactly 887 × 887 pixels and was visually inspected after cropping.
- The split images preserve their corresponding complete panel without regenerating or changing logo geometry.
- Light and dark files both contain the standalone preview, main mark, and correctly spelled `TokenTrail` wordmark.
- Git metadata for the two newly documented tracker commits was read directly from the repository.
- Markdown formatting and whitespace were checked after the documentation changes.
- A repository-wide Markdown search returned no remaining em dash or en dash characters.

### Why this work matters

The logo is the first durable expression of TokenTrail's product personality. Recording the rejected metaphor alongside the approved one helps future readers understand that the final mark is not merely a rising line: it deliberately represents observed progress contained within TokenTrail, rather than usage escaping or leaking away.

### User lessons so far

- A logo metaphor should match what the product helps the user understand, not merely look dynamic.
- Keeping the path inside the token communicates tracked progress more clearly than a path leaving the boundary.
- Early concepts are worth documenting because the reason for rejecting one can clarify the principles behind the final identity.
- Light and dark modes need coordinated variants with consistent geometry, not unrelated marks.
- Separate theme files make review and later application integration easier than repeatedly cropping a presentation board.
- Approving a visual direction is different from declaring every production format complete.
- A project history is more useful when it sounds like the people who made the decisions instead of a generic template.

### Agent lessons so far

- Naming a visual metaphor is a useful test: the word “escaping” exposed a product-message mismatch that shape alone might have concealed.
- Ideation changes should be documented neutrally; an early rejected direction is evidence of refinement, not an error to hide.
- Once a user approves generated concept art, deterministic crops preserve the approved geometry better than regenerating separate variants.
- Generated raster concepts should not be mislabeled as precise vector masters.
- Theme variants need contrast and small-size testing before production use, even when a large concept board looks good.
- The tracker must be refreshed from Git whenever the user may have committed work between assistant turns.
- Writing preferences such as punctuation and tone should be recorded as project rules, then checked rather than left to memory.

### Follow-up

After this work is committed, replace this pending entry with the real commit metadata. Later brand work should create a precise vector master, transparent icon-only assets, monochrome variants, and verified application icon sizes.

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
