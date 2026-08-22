# Maintenance and Compatibility

**Status:** Policy for post-v1.0.0 maintenance; recurring items mirror the plan's follow-up tracker
**Last updated:** August 22, 2026

## Electron and Chromium upgrades (FUP-023)

- Track Electron's supported line; upgrade within a minor series first, then across majors with full regression evidence.
- Every upgrade reruns: frozen install, all suites, packaged smoke on both backends, performance gates, and one packaging run per architecture.
- Fuse posture and CSP are re-verified after every upgrade; silent drift is a defect.

## Codex protocol compatibility (FUP-024)

- The adapter isolates protocol churn; compatibility work means fixture updates, capability fallback checks, and schema observations in `docs/architecture/protocol-compatibility.md`.
- Unsupported new upstream fields stay unavailable-and-labeled until approved into scope; nothing auto-expands the data inventory.

## Dependency review (FUP-027)

- Recurring `npm audit --omit=dev`, license review, and lockfile inspection; SBOM regenerated each release for comparison.
- Additions require the recorded rationale standard; removals are preferred when bundling makes them redundant.

## Distribution refresh (FUP-025)

- The support matrix is revisited per release cycle; untested rows graduate only through recorded executions.

## Patch releases (FUP-026)

- Triggered by reproduced defects with regression tests.
- Each patch: new immutable version, fresh test report addendum, changelog entry from verified diffs, and re-tagged pipeline run.

## Regression scope

Any change to IPC contracts, validation, redaction, precision math, lifecycle bounds, or packaging metadata reruns the entire relevant gate set — these boundaries never rely on spot checks alone.
