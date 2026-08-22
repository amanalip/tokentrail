# Artifact and Versioning Model

**Status:** Implemented in Phase 5; first tag-driven execution awaits the Phase 6 release candidate
**Last updated:** August 21, 2026

## Scope

How versions are chosen, expressed in tags, encoded into artifact file names, and kept immutable once public — plus the honest labeling rules for prereleases and source archives.

## Version source

`package.json` `version` is the single version authority. The working version advances whenever code changes after a tested record (currently 0.5.0). Release tags must match: pushing `v0.5.0` requires the manifest to say exactly `0.5.0`, enforced fail-closed inside every build job before compilation.

## Tag rules

- Only `v*` tags trigger release automation; branch pushes cannot.
- Tags are expected to be created by maintainers from reviewed commits during candidate work (Phase 6), never by automation.

## Artifact naming

Template `${name}-${version}-${os}-${arch}.${ext}` produces machine-safe names:

| Format | x64 example | arm64 example |
| --- | --- | --- |
| AppImage | `tokentrail-0.5.0-linux-x86_64.AppImage` | `tokentrail-0.5.0-linux-arm64.AppImage` |
| deb | `tokentrail-0.5.0-linux-amd64.deb` | `tokentrail-0.5.0-linux-arm64.deb` |
| rpm | `tokentrail-0.5.0-linux-x86_64.rpm` | `tokentrail-0.5.0-linux-arm64.rpm` |
| Pacman | `tokentrail-0.5.0-linux-x86_64.pacman` | `tokentrail-0.5.0-linux-aarch64.pacman` |

The people-facing name "Token Trail" never appears in file names; the machine slug `tokentrail` never appears in visible product copy (decision 008's split).

## Checksums, provenance, SBOM

Each tagged build emits per-architecture SHA-256 lists merged into one `SHA256SUMS.txt`, provenance JSON records (`tokentrail-build-provenance/1`) binding artifacts to commit/runner/toolchain/time, and a CycloneDX SBOM from the lockfile.

## Prerelease and immutability rules

1. Everything this pipeline creates is a **draft prerelease**; publication is an explicit maintainer act after review.
2. Once published, a release is immutable by repository policy: its tag never moves, its assets never change. Corrections ship as new patch versions (FUP-026) with their own evidence records.
3. GitHub's automatic "Source code (zip/tar.gz)" links are repository snapshots without checksums or runnable builds; user guides say so explicitly so nobody installs them by mistake.

## Failure behavior

Tag/version mismatch fails before builds; missing formats fail checksum assembly; empty artifact sets fail provenance; partial uploads fail the draft job rather than publishing incomplete sets.

## Known limitations

- Immutability enforcement is a repository setting pending operator completion before any candidate.
- Patch-release cadence and triggers follow FUP-026 and the Phase 6 maintenance documentation.
