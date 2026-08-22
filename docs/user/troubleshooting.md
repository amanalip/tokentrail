# Troubleshooting Token Trail

**Status:** Phase 5 user guide; corrective steps are being followed against release-candidate packages in plan section 9.6 and corrected from observed results
**Last updated:** August 21, 2026

This guide covers the failures people actually hit: Codex not detected, sign-in problems, AppImage issues, desktop integration, and reading unavailable metrics honestly.

## Contents

- [Token Trail cannot find the Codex CLI](#token-trail-cannot-find-the-codex-cli)
- [Signed-out state](#signed-out-state)
- [Codex version or capability problems](#codex-version-or-capability-problems)
- [AppImage will not start (FUSE errors)](#appimage-will-not-start-fuse-errors)
- [Missing menu entry, icon, or window association](#missing-menu-entry-icon-or-window-association)
- [Reading unavailable values correctly](#reading-unavailable-values-correctly)
- [Exporting diagnostics for help](#exporting-diagnostics-for-help)
- [Resetting Token Trail's own data](#resetting-token-trails-own-data)

## Token Trail cannot find the Codex CLI

Token Trail starts `codex` as its own child process and must resolve it from your normal `PATH`.

1. Confirm the CLI works in a terminal:

   ```bash
   which codex && codex --version
   ```

2. If that fails, install the Codex CLI or fix your shell profile so `codex` is on `PATH`, then log in with `codex login`.
3. If it works in a terminal but not from the application **menu**, your desktop session's `PATH` differs from your shell's. Menu launches do not read `.bashrc`. Make sure the directory containing `codex` is linked into a standard location such as `/usr/local/bin`, then refresh.

## Signed-out state

The Overview reports a signed-out state when Codex itself has no authenticated session. Fix it through Codex, never through Token Trail:

```bash
codex login
```

Then press refresh. Token Trail never asks for, stores, or transmits credentials, so there is nothing to re-enter inside this application.

## Codex version or capability problems

If your installed Codex version does not support an approved read, the affected metric shows as **unavailable** with a reason instead of failing the whole dashboard. Upgrading your Codex CLI usually restores the missing values. Everything else keeps working; one unsupported endpoint never erases unrelated valid sections.

## AppImage will not start (FUSE errors)

Classic AppImages need FUSE 2 (`libfuse2`) to run without extraction:

```bash
# Debian/Ubuntu
sudo apt install libfuse2

# Fedora
sudo dnf install fuse

# Arch family
sudo pacman -S --needed fuse2
```

As a fallback you can extract and run without FUSE:

```bash
./tokentrail-<version>-linux-x86_64.AppImage --appimage-extract-and-run
```

## Missing menu entry, icon, or window association

Native packages install a launcher at `/usr/share/applications/tokentrail.desktop` with `StartupWMClass=tokentrail`, so running windows associate with the menu entry on Wayland and X11 alike. If your menu lacks the entry:

```bash
# deb/rpm/pacman installs
ls /usr/share/applications/tokentrail.desktop
update-desktop-database ~/.local/share/applications 2>/dev/null || true
```

Reinstalling the package restores the entry if a cleanup tool removed it. On X11 sessions you can confirm what a running window reports with `xprop WM_CLASS`; it should contain `tokentrail`.

## Reading unavailable values correctly

An empty-looking value can mean three different things, and Token Trail distinguishes them deliberately:

- **Reported zero** — Codex said the value is zero.
- **Missing** — Codex did not include the field.
- **Unavailable (reason shown)** — invalid, unsupported, or failed input.

None of these is ever silently converted to zero. If something looks wrong, expand the value's provenance note before assuming data loss.

## Exporting diagnostics for help

Settings & Diagnostics builds a redacted support document containing only approved fields — versions, platform, theme, connection category, sanitized health counters. You see the complete preview before anything is written, choose the destination yourself, and no account identifiers, paths, prompts, or usage values can appear in it.

Attach that exported file when asking for help; it is designed to be safe to share.

## Resetting Token Trail's own data

Clear-data in Settings removes only Token Trail-owned preferences (after confirmation). Usage history does not exist to clear — it was never stored. See [Privacy](privacy.md) for exactly what lives where.
