# Token Trail 2.0.0 verification report

Status: release preparation in progress. Evidence checkpoint: September 08, 2026 at 9:51:28 AM EDT (America/Toronto, UTC-0400).

## Scope and authorization

The user requested release 2.0.0, detailed bug-fix and improvement notes, all artifacts, a matching website update, and separate understandable commits. This explicitly authorizes tagging, pushing, and publication. No new publication confirmation is required by this report.

The release incorporates all 40 September audit fixes and IMP-008. [The changelog](../../../CHANGELOG.md) enumerates each finding; [the audit](../../../bug_audits/bugs_sept7.md) records fix commits. The preference schema is unchanged. No dependencies were upgraded for this release.

## Preparation findings

- Hosted CI on `299e021` failed because the Debian canary's host `ar` process timed out. The regression now builds its small ar envelope directly. Nine package tests passed locally after this correction.
- The initial BUG-034 fix used generic architecture suffixes. Released 1.0.0 asset names and installed electron-builder code showed the format-specific suffixes. The corrected script has seven passing provenance cases covering x64, arm64, wrong tags, stale artifacts, missing formats, unrelated files, and direct npm version capture.
- The tag workflow now verifies source and inspects unpacked and extracted artifacts for both architectures before draft assembly.

## Validation

Full local and hosted validation is running. Individual start and finish times not yet captured are recorded as not captured rather than reconstructed. No pending check is claimed as passed.

## Remaining limitations

Unsigned packages, unexecuted arm64 binaries, native package install/upgrade/uninstall campaigns, broader desktop/distribution coverage, and human screen-reader checks remain named limitations. Package extraction does not prove installation behavior. See [Known limitations](../../../docs/support/known-limitations.md).

## Artifact and publication evidence

Pending tagged pipeline execution, draft download/checksum validation, publication, and public re-download verification.
