# Rollback and Incident Response

**Status:** Policy implemented for the release model in use; execution steps rehearsed through candidate failures
**Last updated:** August 22, 2026

## Principles

1. Published releases are immutable. Nothing — not a fix, not a retraction, not a tag move — edits a published release or its assets.
2. Every correction is a new patch version with its own evidence record.
3. Evidence is preserved before anything else during an incident.

## Defective published artifact

1. Record the defect with reproduction, affected artifacts, and severity in the tracker.
2. Mark the release's notes with a visible warning via a new patch version's notes (the broken release's text stays as published history).
3. Build and validate a patch candidate through the full pipeline; publish it after review.
4. Users verify checksums from `SHA256SUMS.txt`; a mismatched download is always user-detectable.

## Compromised artifact or signing event

- Until signing exists (LIM-007), compromise detection relies on checksum divergence and repository-audit trails: provenance records bind every artifact to commit, runner, and time.
- Response: revoke the draft/publish path by fixing the pipeline first, rebuild from a reviewed commit under a fresh version, and document the complete timeline in the tracker.

## Failed or stuck release

- The candidate model makes this cheap: a failed tag creates nothing. Cut a new candidate version; never repoint the old tag.
- The `v0.5.0`–`v0.5.3` sequence demonstrates the procedure: three failed candidates, zero release objects, full evidence trail.

## Advisory handling

- Dependency advisories gate releases (`npm audit --omit=dev` must be clean); advisories arriving after publication are assessed for exploitability through Token Trail's bundled-only runtime, fixed in a patch, and disclosed in that patch's notes.

## Communication

- Release notes and changelog carry all user-visible corrections; the tracker preserves internal timelines; no status page exists because there is no server.
