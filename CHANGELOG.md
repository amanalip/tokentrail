# Changelog

All notable changes to Token Trail are documented here. Versions appear newest-first once released; until the first publication, implemented and verified work lives under "Unreleased". Planned work never appears in this file.

## Unreleased

The complete v1 read-only product scope, implemented and verified across development versions 0.1.0 through 0.5.3 with evidence recorded under `tests/test_reports/`.

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

### Security

- Renderer isolation verified in development, built, and packaged modes on both display-server backends; no Node, Electron, or generic IPC surface reaches web content.
- Codex access restricted to three approved reads plus one update notification, allowlisted before transport, size-guarded, validated with closed schemas, and normalized with field-level provenance; errors are redacted before crossing the privileged boundary.
- No telemetry, no update checks, no network clients; usage data exists only in memory and never persists.

### Known limitations

- See `docs/support/known-limitations.md`; unsigned artifacts and untested environments are named there rather than implied away.
