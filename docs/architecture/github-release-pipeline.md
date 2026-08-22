# GitHub Release Pipeline Architecture

**Status:** Implemented in Phase 5 (workflows `.github/workflows/ci.yml` and `.github/workflows/release.yml`); first CI run green; draft-release path exercised only by review so far
**Last updated:** August 21, 2026

## Scope

How changes are verified on shared infrastructure, and how an approved version tag becomes a reviewable draft release — without ever letting ordinary pushes publish or replace one.

## Continuous integration (`ci.yml`)

- **Triggers:** every pull request and every push to `main`. Superseded runs on the same ref cancel.
- **Permissions:** explicit `contents: read`; no job can write repository content. Untrusted pull-request runs therefore receive no release-relevant capability.
- **Jobs:**
  1. `quality` — frozen `npm ci`, formatting check, lint, five-project strict typecheck, unit/component suites, fixture integration suites.
  2. `built-security` — Electron runtime libraries mirroring the deb Depends set plus Xvfb, then the production build (bundle-budget gate) followed by the packaged security suite against the built application.
- **Determinism:** Node 24 with npm pinned to the manifest's `packageManager` version (`npm@12.0.2`) installed before any install step.

## Release pipeline (`release.yml`)

- **Trigger:** exactly a pushed `v*` tag. Branch pushes and pull requests cannot reach it, whatever their contents change.
- **Guard:** each build job first asserts tag equals `v<manifest version>` and fails closed on mismatch, so a draft can never mix versions.
- **Environments:** all build/SBOM jobs declare the protected `release` environment; required-reviewer configuration is a named operator task in repository settings.
- **Build jobs:** distinct x64 and arm64 jobs run the production build first (the bundles must exist before archiving), then package all four formats through the single reviewed configuration with an explicit `--publish never` — without that flag electron-builder attempts implicit GitHub publishing whenever a git tag is present. Runner tooling: Ubuntu's `rpm` package for rpmbuild plus `libarchive-tools` for fpm's Pacman backend. Each job emits per-format SHA-256 checksums and records machine-readable provenance (`scripts/write-build-provenance.mjs`, schema `tokentrail-build-provenance/1`: arch, tag, commit, runner identity, toolchain, UTC capture time, per-artifact sizes and digests).
- **SBOM job:** emits a CycloneDX document from the lockfile using npm's built-in generator — supply-chain metadata adds no new dependency to audit.
- **Draft assembly:** the only write-capable step (scoped `contents: write`) downloads all uploads, merges per-arch checksums into one `SHA256SUMS.txt`, writes honest notes labeling the artifacts unsigned previews, and creates a **draft prerelease** through GitHub's own CLI with the target repository named explicitly (`GH_REPO`) because this job checks out no git context. Nothing publishes automatically.

## Invariants

1. Publication requires a maintainer viewing the draft and choosing to publish; automation cannot cross that line.
2. Third-party actions are pinned to reviewed commit SHAs verified live from the GitHub API at authoring time (checkout v7.0.1, setup-node v7.0.0, upload-artifact v7.0.1, download-artifact v8.0.1); floating tags are prohibited.
3. Release immutability ("published tags cannot be repointed") is a repository setting that must be enabled by the operator; the workflow creates drafts only and cannot weaken it.
4. Signatures are absent pending an approved Linux signing plan; drafts say so in their notes instead of implying authenticity guarantees that do not exist.

## Failure behavior

Frozen install fails on lockfile drift; budget gate fails oversized bundles; security suite fails isolation regressions; provenance refuses empty artifact sets; checksum generation fails if a format is missing; the draft job fails rather than publishing partial file sets (`if-no-files-found: error`).

## Evidence

First shared-runner CI execution completed green in 56 seconds on `ubuntu-24.04` (quality + built-security), recorded in commit tracker entry for `a9e9c36`. The tag-driven path was then proven end to end: candidate tags `v0.5.0`, `v0.5.1`, and `v0.5.2` each failed fast on distinct runner-environment defects (missing build step, implicit-publish attempt, absent `bsdtar`) with zero release objects created, and `v0.5.3` completed successfully — all eight artifacts across four formats and both architectures assembled, checksums merged, provenance recorded, SBOM attached, and one draft prerelease created containing exactly the reviewed file set.

## Known limitations

- Required reviewers on the `release` environment and tag-immutability settings are operator actions that must be completed before any real candidate.
- Failed candidate tags (`v0.5.0`–`v0.5.2`) remain as immutable history; none ever produced a draft or release object.
