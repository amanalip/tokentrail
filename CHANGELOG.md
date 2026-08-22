# Changelog

All notable changes to Token Trail are documented here. Versions appear newest-first; planned work never appears in this file.

## 1.0.0

Released August 22, 2026. The complete v1 read-only product scope, implemented and verified across development versions 0.1.0 through 0.5.3 with evidence recorded under `tests/test_reports/`, and re-validated green on the full automated matrix against this release commit.

### Added

- Read-only Overview dashboard fed by an owned local Codex app-server process: quota windows with used/remaining percentages, reset times, countdowns, provenance labels, and freshness states.
- Quota Windows route with grouping, sorting, raw-safe details, reset timeline, attention ordering, and session-change observations kept in memory only.
- Usage route with date-range controls, daily chart (lazy-loaded), calendar heatmap distinguishing positive/reported-zero/missing days, accessible table, statistics, strict complete-period comparisons, and coverage reporting.
- Credits route with balance, unlimited state, spending limits, reached state, and reset-credit expiry overview using the exact seven-day display rule.
- Learn route explaining quotas, tokens, credits, provenance, privacy, and statistics with contextual navigation from metrics and errors.
- Settings & Diagnostics with light/dark/system themes, refresh choices, fully previewed redacted diagnostics export through a native save dialog, clear-data confirmation, and sanitized health counters.
- Hardened Electron shell: sandboxed renderer, context isolation, strict self-hosted CSP, deny-by-default navigation/popup/permission/download policy, single-instance enforcement, and Electron fuses.
- Linux distribution as four package formats (AppImage, deb, rpm, Pacman) for x64 and arm64 with desktop entries whose names match runtime window identity (`tokentrail`), hicolor icons, and AppStream metadata in native packages.
- Continuous integration on every pull request and main push; tag-driven pipeline assembling checksums, build provenance, and a CycloneDX SBOM onto one maintainer-reviewed draft prerelease.
- User guides for getting started, installing, upgrading, troubleshooting, uninstalling, and privacy; architecture records covering the full system including packaging and release engineering.
- Structured draft-release notes generated from the tagged changelog, carrying highlights, security posture, fixes, download inventory with per-format architecture labels, checksum verification steps, documentation links pinned to the release tag, upgrade notes, and known-limitation references.

### Security

- Renderer isolation verified in development, built, and packaged modes on both display-server backends; no Node, Electron, or generic IPC surface reaches web content.
- Codex access restricted to three approved reads plus one update notification, allowlisted before transport, size-guarded, validated with closed schemas, and normalized with field-level provenance; errors are redacted before crossing the privileged boundary.
- No telemetry, no update checks, no network clients; usage data exists only in memory and never persists.

### Fixed

- Aggregate token activity (the Usage route) now renders against current Codex CLI installations. Real Codex app-server responses name the usage bucket array `dailyUsageBuckets` with `startDate` keys and the longest-turn counter `longestRunningTurnSec`, while Token Trail validated only the originally reviewed spellings — so every real read failed schema validation and the section showed as permanently unavailable while quota windows kept working. Both observed spellings now validate to one internal shape, a missing bucket array reads as honest unavailable content rather than a failed read, and one malformed bucket record is counted as a rejection instead of erasing its valid neighbors.
- Navigating to the Usage route now reliably moves keyboard and assistive-technology focus onto the route heading. The move was previously skipped whenever the Usage screen's lazy-loaded chunk was still mounting behind its loading fallback, leaving keyboard users on the navigation link they had activated.

### Known limitations

- See `docs/support/known-limitations.md`; unsigned artifacts and untested environments are named there rather than implied away.
