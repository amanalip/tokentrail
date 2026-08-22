# Software Supply Chain Security

**Status:** Implemented controls as of Phase 5 section 9.3; SBOM inspection and packaged-output security review scheduled with plan sections 9.6–9.7
**Last updated:** August 21, 2026

## Scope

The layered controls that keep Token Trail's build and release path from becoming an attack surface: dependency selection, installation integrity, CI/CD authorization, artifact verification, and the honest gaps that remain.

## Dependency controls

- Smallest viable runtime set (`echarts`, `react`, `react-dom`, `zod`); every addition requires recorded license, maintenance, install-script, transitive-size, advisory, and Electron-compatibility review in the [dependency rationale](dependency-rationale.md).
- Lockfile committed; all automation installs frozen (`npm ci`), so CI can never resolve newer transitive versions than a maintainer reviewed.
- `npm audit --omit=dev`: zero known vulnerabilities at the 0.4.0 record.
- No native modules (no rebuild step, no compiler toolchain in the package path); no postinstall scripts are tolerated among direct dependencies.

## Build integrity

- Single version source (`package.json`); release builds assert tag/version agreement before compiling anything.
- Production bundles exclude source maps and development paths; the ASAR allowlist plus header-parsing contents gate reject unexpected files, and credential-marker scans run over archive bytes and every artifact.
- Electron fuses disable Node-in-place execution, environment-variable Node options, inspector arguments, and file-protocol privilege grants; only-load-from-ASAR stays enforced.

## CI/CD authorization

- Explicit least-privilege tokens: `contents: read` everywhere except the single draft-creation step scoped to `contents: write`.
- Untrusted fork pull requests execute with no access to release capability or secrets — the workflows request none.
- Third-party actions pinned to exact commit SHAs verified live from the GitHub API at review time; SHA changes require a new reviewed commit.
- Release builds run inside the protected `release` environment; draft creation is first-party CLI rather than another third-party action.

## Artifact verification

- Combined `SHA256SUMS.txt` per release plus per-artifact digests embedded in machine-readable provenance records (`tokentrail-build-provenance/1`) capturing commit, runner, toolchain, and UTC capture time.
- CycloneDX SBOM generated from the lockfile by npm's built-in emitter for every tagged candidate.
- Signatures: intentionally absent until an approved Linux signing plan exists; documentation labels artifacts unsigned previews instead of implying unverifiable guarantees.

## Invariants

1. Nothing publishes without maintainer action on a draft; branch pushes cannot create or replace releases.
2. Every claim about artifact contents must trace to an executed inspection (payload listings, contents gate, contract tests) — never to configuration intent alone.
3. Supply-chain documents may not promise controls that are still operator settings (release-environment reviewers, tag immutability) without naming them pending.

## Failure behavior

Lockfile drift fails install; budget overrun fails build; isolation regression fails the security suite; missing artifacts fail provenance and checksum steps; mismatched tag/version fails before any compile.

## Known limitations

- Repository-side settings (required reviewers, immutability) remain operator actions to complete before any candidate.
- Transitive-dependency behavioral review is periodic (FUP-027), not continuous.
