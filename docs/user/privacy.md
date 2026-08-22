# Privacy

**Status:** Phase 5 user guide describing implemented behavior; the Phase 6 validation campaign adds a captured network trace to this evidence base
**Last updated:** August 21, 2026

Token Trail is built so that your usage data stays yours. This page states exactly what the application reads, keeps, writes, and — most importantly — never does.

## Contents

- [What Token Trail reads](#what-token-trail-reads)
- [What stays in memory](#what-stays-in-memory)
- [The only data on disk](#the-only-data-on-disk)
- [Diagnostics exports](#diagnostics-exports)
- [Network behavior](#network-behavior)
- [Explicit exclusions](#explicit-exclusions)

## What Token Trail reads

Token Trail starts one Codex app-server process (`codex app-server --stdio`) that it owns itself, and reads exactly three things plus one update notification:

1. Account information
2. Rate-limit / quota windows
3. Aggregate token usage
4. Rate-limit update notifications (which trigger a fresh approved read)

Nothing else is requested. Requests are checked against an allowlist before they ever reach Codex, and responses are validated and stripped of every field outside the approved set.

## What stays in memory

Usage snapshots, quota values, session-to-session deltas, and diagnostics content live only in RAM while Token Trail runs. Closing the application erases them completely. There is no history file, no cache, no crash dump containing them, and nothing for a future version to "sync".

## The only data on disk

Exactly one thing is ever written: your preferences document.

```
~/.config/Token Trail/
```

It contains display choices only — theme, refresh preferences, similar settings. No usage value, timestamp, account detail, or derived metric can appear in it. Preferences are validated on every load; corrupt files are quarantined and reset rather than trusted. Clearing data from Settings deletes this document after you confirm.

## Diagnostics exports

The support document built in Settings & Diagnostics comes from a fixed allowlist of fields: application/Electron/Chromium versions, platform, theme, connection category, and coarse sanitized health counters. Email addresses, identifiers, file paths, prompts, responses, raw protocol messages, and unknown fields are structurally excluded — automated tests plant canary values for every sensitive class and fail if any of them could leak. You preview the complete export before choosing where it is saved.

## Network behavior

Token Trail makes no network connections of its own: no telemetry, no crash reporting, no analytics, no update checks, no remote fonts or assets. The packaged build's Content Security Policy blocks remote script and style sources outright.

All network activity belonging to your Codex usage happens inside Codex's own processes under its own privacy terms; authentication material never passes through or rests inside Token Trail.

## Explicit exclusions

Token Trail cannot read, store, or display your prompts, responses, tasks, repositories, files, tool calls, agent transcripts, or browser sessions. It has no write access to your Codex account: no task control, no credit redemption, no account changes. These are enforced boundaries, not policies that a setting could loosen.
