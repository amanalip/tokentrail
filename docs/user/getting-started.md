# Getting started with Token Trail

**Status:** Phase 5 user guide; installation steps are being followed against release-candidate packages in plan section 9.6 and corrected from observed results
**Last updated:** August 21, 2026

Token Trail is a read-only desktop dashboard for understanding your local OpenAI Codex usage: quota windows, token activity, reset times, credits, and related metrics. It reads only approved account-level data through a locally installed Codex CLI, keeps everything in memory, and never sends your data anywhere.

This guide covers prerequisites, first launch, what you will see, and how Token Trail behaves day to day. Installation is described separately per package format in [Installing](installing.md).

## Contents

- [Prerequisites](#prerequisites)
- [First launch](#first-launch)
- [Understanding provenance labels](#understanding-provenance-labels)
- [Navigation and refresh](#navigation-and-refresh)
- [Privacy expectations](#privacy-expectations)

## Prerequisites

1. A Linux desktop environment. See the [compatibility and support matrix](../support/compatibility-and-support-matrix.md) for which environments have verified evidence versus untested status.
2. A working OpenAI Codex CLI installation:

   ```bash
   codex --version
   ```

   Token Trail must be able to find and run the `codex` executable from your normal `PATH`. If this command does not work in your terminal, Token Trail cannot discover it either.
3. A signed-in Codex account. Authentication belongs entirely to Codex:

   ```bash
   codex login
   ```

   Token Trail never sees, copies, stores, or refreshes your credentials. If you are signed out, Token Trail reports a signed-out state instead of asking for any credential itself.
4. For AppImage users: FUSE support on your system (see [troubleshooting](troubleshooting.md#appimage-will-not-start-fuse-errors)) or the extraction fallback documented there.

## First launch

1. Start Token Trail the way you installed it: from your application menu ("Token Trail", category Utility) or by running the executable (`tokentrail`, or the AppImage file you downloaded).
2. The Overview opens. Connection states you may see:
   - **Connecting/loading** — the owned Codex app-server process is starting.
   - **Fresh data** — quota and usage values were read successfully; each value shows when it was read.
   - **Signed out** — Codex reported no authenticated session; run `codex login` and refresh.
   - **Unavailable** — the Codex CLI could not be found or did not answer compatibly; see [troubleshooting](troubleshooting.md).
3. Values appear only when Codex actually reports them. Missing values stay visibly unavailable rather than showing zero.

## Understanding provenance labels

Every displayed value states where it came from:

| Label | Meaning |
| --- | --- |
| Reported | Read directly from Codex |
| Observed | Measured locally by Token Trail |
| Calculated | Derived by Token Trail from complete source ranges |
| Calculated (partial range) | Derived from an incomplete range; the covered dates are shown |
| Unavailable | Not present, invalid, or not supported by your Codex version |

Token totals and quota percentages measure different things and are never blended into one number. Calculated summaries over partial date ranges say so explicitly.

## Navigation and refresh

- Six routes: Overview, Quota Windows, Usage, Credits, Learn, and Settings & Diagnostics. Keyboard-only navigation works everywhere; press `Tab` after loading to reach the skip-to-content link.
- Contextual links inside metrics and errors take you to the relevant explanation or corrective action.
- Refresh is manual: use the refresh control to re-read current values. v1 performs no automatic background polling and no network requests of its own.

## Privacy expectations

All usage values live only in memory while Token Trail runs. Nothing about your usage is persisted, logged, transmitted, or included in exported diagnostics beyond the sanitized fields you can preview. Details: [Privacy](privacy.md).
