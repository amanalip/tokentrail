# Release Checklist

For the current release, see [the 2.0.0 checklist and artifact inventory](2.0.0-release.md). The record below preserves the 1.0.0 publication evidence.

**Status:** Executable checklist for the v1.0.0 candidate and every later release; items are checked only from recorded evidence
**Last updated:** August 22, 2026

## Candidate creation

- [x] Feature scope frozen at approved v1 behavior; no open plan item silently absorbed.
- [x] Manifest version set to the candidate version in one reviewed commit; lockfile changes explained.
- [x] `CHANGELOG.md` entry written from verified diffs; no planned work listed as shipped.
- [x] Release notes drafted: highlights, security posture, installation links, upgrade notes, known limitations, unsigned-preview statement.
- [x] `docs/support/known-limitations.md` current; support statement matches the compatibility matrix.
- [x] All local gates green on the exact release commit: `verify`, build budget, packaged, accessibility, performance.
- [ ] Annotated `v<version>` tag pushed from the reviewed commit.

Evidence notes for the checked candidate-creation items: the manifest was frozen at `1.0.0` alongside the finalized `1.0.0` changelog entry and website go-live copy on August 22, 2026; draft notes are generated from the tagged changelog by `scripts/write-release-notes.mjs` (proven across candidate tags `v0.5.0`–`v0.5.3`). The local gate sweep executed green on the freeze tree before tagging: format/lint/five-project typecheck, 229 unit tests, 32 integration tests, budget-gated production build, 32 e2e, 8 accessibility/development, 3 security, 4 packaged, and the performance gate.

## Pipeline evidence

- [ ] Draft-release run completed green; exactly one draft prerelease created.
- [ ] Eight artifacts present with correct names (4 formats × 2 architectures).
- [ ] `SHA256SUMS.txt`, both provenance records, and SBOM attached.
- [ ] Failed candidates (if any) documented as having produced zero release objects.

## Validation

- [ ] Full checksum verification of every downloaded draft artifact.
- [ ] Executed install/launch/close/reopen/upgrade/uninstall per format in matching clean environments.
- [ ] AppImage verified on a second distribution family.
- [ ] Soak campaign completed: repeated launches, refreshes, sleeps, resumes, Codex restarts, long idle.
- [ ] Network trace captured during normal use proving no Token Trail-initiated connections.
- [ ] Versioned test report complete with `ready` recommendation and named limitations.

## Approval and publication — requires explicit user approval

- [x] Evidence and unresolved limitations presented to the user.
- [x] User approval to publish recorded.
- [x] Protected environment reviewers configured; repository tag immutability enabled.
- [x] Draft published without asset changes; immutability confirmed afterward.
- [x] Every artifact re-downloaded from the public page and checksum-verified.
- [x] One clean install performed from the public location.
- [ ] Publication time, URL, final commit, and tag recorded in tracker and report.

Publication evidence (August 22, 2026): `v1.0.0` published at 22:25:44 UTC from draft without asset changes at https://github.com/amanalip/tokentrail/releases/tag/v1.0.0; GitHub reports the release `isImmutable: true` under ruleset `21213599`. All twelve public files were re-downloaded and all eight package artifacts verified OK against the merged `SHA256SUMS.txt`. The clean install is the AppImage format executed twice on the reference machine from the downloaded public artifact with the window observed on screen; deb/rpm/Pacman clean-environment installs remain owed under LIM-004. Tracker recording is complete in Commit 047; the versioned `1.0.0` report awaits the Validation-section campaign above, which is why this final item stays open.

Evidence notes for the checked publication items: the operator issued the explicit go-live approval on August 22, 2026, and the two repository settings that workflows cannot set themselves were completed through the API before publication — required reviewer `amanalip` on the `release` environment, and ruleset `21213599` ("Immutable release tags") actively blocking deletion and non-fast-forward updates of `refs/tags/v*` with zero bypass actors. Former limitation LIM-002 is recorded as cleared in the known-limitations document.
