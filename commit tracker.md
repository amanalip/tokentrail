# TokenTrail Commit Tracker

This document records the important outcome of each project commit in chronological order. It complements Git history: Git remains the authoritative source for exact file changes, while this tracker explains why a change mattered and what was learned.

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

- Entries follow Git's oldest-to-newest order.
- Commit hashes, timestamps, subjects, and changed files come from Git, not memory.
- A documentation commit is still tracked when it materially changes project scope or understanding.
- Uncommitted work is kept in a separate section and is never presented as a commit.
- The commit that creates or edits this tracker cannot reliably contain its own final hash without amending history. It starts as pending work and should be finalized by a later tracker update.
- A lesson describes what became clearer; it does not assign blame.
- Approval to document a future action does not authorize implementation, publication, pushing, or release.

---

## Commit 001 — Repository initialization

**Commit:** `346798b` — `Initial commit`  
**Timestamp:** August 13, 2026 at 1:53:44 AM EDT (`America/Toronto`, UTC−04:00)  
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

### Lessons

**User:** Starting with Git makes later planning and implementation inspectable and reversible.  
**Agent:** The initial README name was historical context, not a permanent product decision; repository metadata and public-facing documentation must be checked after a rename.

### Risks or limitations

- The README retained the old project name.
- The repository did not yet explain the product's purpose or status.

### Follow-up

Document the product direction before implementation.

---

## Commit 002 — Product specification created

**Commit:** `3067331` — `Create PRODUCT_SPEC.md`  
**Timestamp:** August 13, 2026 at 4:10:49 PM EDT (`America/Toronto`, UTC−04:00)  
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

### Lessons

**User:** Planning can define privacy boundaries, non-goals, and success criteria before code makes those choices expensive to change. A product-spec discussion does not itself authorize building the product.  
**Agent:** TokenTrail must distinguish quota percentage from token totals, treat the Codex app-server as experimental, and keep all initial integration read-only and capability-aware.

### Risks or limitations

- The technology stack remained provisional.
- The broad v1 specification may need revision after the final framework and visual direction are chosen.
- Protocol expectations were based on the handoff and still require fixture and live compatibility validation during an approved implementation phase.

### Follow-up

Review and approve or revise the major scope decisions before application code is created.

---

## Commit 003 — KDE and Electron directions compared

**Commit:** `2eaa34c` — `Create design_decisions.md`  
**Timestamp:** August 13, 2026 at 4:17:54 PM EDT (`America/Toronto`, UTC−04:00)  
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

### Lessons

**User:** “More visual libraries” and “better application” are different questions. Electron offers more visual choices, while KDE offers a more native Linux identity and integration.  
**Agent:** Framework recommendations must be tied to product priorities. For TokenTrail, visuals, KDE identity, resource use, security boundaries, and possible cross-platform distribution pull the choice in different directions.

### Risks or limitations

- Library breadth does not guarantee coherent design or accessibility.
- Native-toolkit use does not automatically guarantee visual polish or low resource use.
- The comparison needs real prototype measurements if the trade-off remains unclear.

### Follow-up

The user should choose KDE/Kirigami, choose Electron, or explicitly approve a disposable comparison prototype. Until then, planning continues without application implementation.

---

## Commit 004 — README aligned with TokenTrail

**Commit:** `319d60b` — `Document TokenTrail project vision and planning status`  
**Timestamp:** August 13, 2026 at 4:24:14 PM EDT (`America/Toronto`, UTC−04:00)  
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

### Lessons

**User:** A repository rename should be followed by a small documentation audit so the public landing page does not retain the old identity. A planning-stage project still benefits from a concise explanation.  
**Agent:** Keep the README approachable and use dedicated documents for detail; repeating the full specification in several places creates future consistency problems.

### Risks or limitations

- The README will need another review after the framework, exact v1 scope, installation process, and release status are approved.

### Follow-up

Keep the README synchronized with major approved decisions without allowing it to become a second product specification.

---

## Current uncommitted work

**Observed:** August 13, 2026 at 4:29:38 PM EDT (`America/Toronto`, UTC−04:00)  
**State:** Pending; not yet a Git commit when this entry was written

### Intent

Create this commit tracker and reconstruct the important context of the repository's existing commits.

### Important changes

- Added a durable format for commit purpose, verification, lessons, limitations, and follow-up work.
- Reconstructed commits `346798b`, `3067331`, `2eaa34c`, and `319d60b` from Git metadata and project documents.
- Explicitly separated factual history from uncommitted work and unknown information.

### Verification

- Commit order, hashes, subjects, authors, timestamps, and file statistics were read from Git.
- Toronto timestamps retain the applicable EDT abbreviation and UTC−04:00 offset.
- Markdown formatting and whitespace should be checked before handoff.

### Lessons so far

**User:** A commit tracker can preserve the reasoning and learning that a normal one-line Git subject cannot capture.  
**Agent:** A tracker must not fabricate personal lessons or call pending work a commit. Self-tracking needs a later update because a file cannot know the final hash of the commit that contains it without rewriting that commit.

### Follow-up

After this file is committed, a later tracker update should replace this pending section with the actual commit hash, timestamp, message, and verified statistics.
