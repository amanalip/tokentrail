# Release Validation Process

**Status:** Executed through v1.0.0 publication on August 22, 2026: candidate frozen, tagged, built by the pipeline, and published after review with public checksums verified; per-format clean-environment installs, second-family AppImage coverage, and the soak campaign remain recorded-open work
**Last updated:** August 22, 2026

This document describes how a Token Trail release candidate is created, validated, corrected, and (only with explicit user approval) published. The `v0.5.0`–`v0.5.3` sequence is the worked example cited throughout.

## 1. Freeze

- Feature scope locks to the approved v1 behavior; new features wait for post-v1 prioritization.
- The manifest version becomes the candidate version in one reviewed commit; lockfile regenerates only for explained dependency changes.
- Release notes, changelog entry, installation links, support statement, privacy statement, and known limitations must exist before the tag is cut.

## 2. Tag and build

- A maintainer pushes an annotated `v<version>` tag from a reviewed commit; automation refuses any mismatch between tag and manifest.
- Distinct x64 and arm64 jobs build all four formats after compiling production bundles, then emit per-artifact checksums and machine-readable provenance. Runner tooling (`rpmbuild`, `bsdtar`) is installed by the workflow itself.
- Everything lands on exactly one **draft prerelease**. Failed candidates create nothing: three of four exercised candidates produced zero release objects while their defects were fixed forward under fresh versions.

## 3. Validate

Run, against the draft artifacts and the tagged commit:

1. Every local suite (`verify`, packaged, security, accessibility, performance) on the reference machine.
2. Shared-runner CI on the tagged commit.
3. Downloaded-draft checksum verification (`sha256sum -c`) — sampled during Phase 5, full-set at publication time.
4. Executed install/launch/close/reopen/upgrade/uninstall cycles per format in matching clean environments.
5. The soak campaign: repeated launches, refreshes, sleeps, resumes, Codex restarts, long idle windows.

Findings are triaged by severity; release blockers force a new candidate version and tag — never a mutation of the failed one.

## 4. Evidence and approval

- Complete `tests/test_reports/<version>/test_report.md` from actual local, CI, and manual evidence with a final recommendation.
- Present evidence and unresolved limitations to the user; publication happens only after explicit approval.

## 5. Publication and verification

- Publish the reviewed draft without altering assets; enable/confirm immutability so the tag cannot be repointed afterward.
- Re-download every artifact from the public page, verify full checksums, perform one clean install from the public location, and record publication time, URL, commit, tag, and results in the tracker and report.
- A defect found after publication becomes a new patch version; the published release is never edited or replaced.
