# Support Policy

**Status:** Proposed for v1.0.0 publication; boundaries follow the verified compatibility matrix
**Last updated:** August 22, 2026

## Supported versions

Only the most recent published release receives fixes. Because releases are immutable, corrections ship as new patch versions; users upgrade manually (v1 has no update channel).

## Supported environments

Support claims follow `docs/support/compatibility-and-support-matrix.md` exactly:

- **Verified:** environments with executed evidence (today: KDE Plasma Wayland and X11-through-XWayland on x64; AppImage/deb/Pacman/rpm payload behavior).
- **Untested:** environments without recorded evidence may work but receive no support promises until someone records results.
- arm64 is build-verified only until execution evidence exists.

## Response boundaries

Token Trail reads no account data beyond approved Codex methods and keeps no user history, so support starts from the redacted diagnostics export:

1. Reproduce with the exported diagnostics attached.
2. Classify against known limitations first; limitations are not bugs.
3. Fix defects in new patch versions with regression tests and fresh evidence.

## Security reports

Report suspected vulnerabilities privately to the maintainer identity declared in package metadata. Do not open public issues containing exploit detail. Acknowledgement, remediation, and disclosure happen before any public release notes mention the issue.

## End of support

A release stops receiving fixes when a newer version publishes. Compatibility breaks caused by upstream Codex protocol changes are handled under the maintenance policy's compatibility-update process.
