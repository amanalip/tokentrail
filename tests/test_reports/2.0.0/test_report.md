# Token Trail 2.0.0 verification report

Status: published with all eight draft and public package downloads verified. Evidence checkpoint: September 08, 2026 at 9:51:28 AM EDT (America/Toronto, UTC-0400).

## Scope and authorization

The user requested release 2.0.0, detailed bug-fix and improvement notes, all artifacts, a matching website update, and separate understandable commits. This explicitly authorizes tagging, pushing, and publication. No new publication confirmation is required by this report.

The release incorporates all 40 September audit fixes and IMP-008. [The changelog](../../../CHANGELOG.md) enumerates each finding; [the audit](../../../bug_audits/bugs_sept7.md) records fix commits. The preference schema is unchanged. No dependencies were upgraded for this release.

## Preparation findings

- Hosted CI on `299e021` failed because the Debian canary's host `ar` process timed out. The regression now builds its small ar envelope directly. Nine package tests passed locally after this correction.
- The initial BUG-034 fix used generic architecture suffixes. Released 1.0.0 asset names and installed electron-builder code showed the format-specific suffixes. The corrected script has seven passing provenance cases covering x64, arm64, wrong tags, stale artifacts, missing formats, unrelated files, and direct npm version capture.
- The tag workflow now verifies source and inspects unpacked and extracted artifacts for both architectures before draft assembly.

## Validation

The local core verification passed: formatting, lint, all five TypeScript projects, 277 unit/component tests, and initially 59 integration tests. The final package regressions add arm64-directory and clean AppImage coverage, bringing the integration inventory to 61 tests; the complete 61-test integration inventory passed locally after the additions. Production build and bundle budgets passed. Documentation links passed across 58 files.

The complete existing desktop matrix passed 46 tests: end-to-end, accessibility, security, packaged identity/launch, and performance. Automated axe scans reported zero violations. Both development tests then passed with `ELECTRON_RUN_AS_NODE` removed from the inherited environment. This covers real Vite startup, hot CSS updates, and the unavailable state.

Hosted CI run [34234576046](https://github.com/amanalip/tokentrail/actions/runs/34234576046) passed source quality and built security on the preparation checkpoint. Tagged source verification also passed on `87c793cf8bf38ea35faab0ea48af899c3c19bc13` before the user asked to stop CI monitoring. No subsequent CI monitoring is part of this record.

The existing 2.0.0 unpacked runtime passed inspection of 74 files. Preflight against all four published 1.0.0 x64 formats found expected native metadata and AppImage support libraries absent from the new allowlist. After adding only those reviewed paths, all four extracted formats passed: five ASAR listings and 402 files including the unpacked runtime. This is packaging-tool validation, not a claim about 2.0.0 distributable bytes.

Individual local suite start and finish times: not captured in the required fully timezone-qualified format. Hosted times remain available in the linked workflow. Evidence checkpoint: September 08, 2026 at 9:56:54 AM EDT (America/Toronto, UTC-0400).

The website home and FAQ pages both fit a 390-pixel viewport without horizontal document overflow after fixing long-content sizing. Mobile menu close paths and theme switching were exercised in the browser.

## Remaining limitations

Unsigned packages, unexecuted arm64 binaries, native package install/upgrade/uninstall campaigns, broader desktop/distribution coverage, and human screen-reader checks remain named limitations. Package extraction does not prove installation behavior. See [Known limitations](../../../docs/support/known-limitations.md).

## Artifact and publication evidence

Release [v2.0.0](https://github.com/amanalip/tokentrail/releases/tag/v2.0.0) was published at September 09, 2026 at 12:25:04 AM EDT (America/Toronto, UTC-04:00). Verification completed at September 09, 2026 at 12:25:31 AM EDT (America/Toronto, UTC-0400). All eight draft downloads and all eight public re-downloads match the checksum manifest and both provenance records, with the expected commit and a CycloneDX SBOM declaring 2.0.0. Exact sizes and SHA-256 values are preserved in [artifact-verification.json](artifact-verification.json). No artifact was replaced during publication.

GitHub confirms this release is immutable. All four public metadata files also match their downloaded draft bytes exactly.
