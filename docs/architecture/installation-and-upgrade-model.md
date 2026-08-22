# Installation and Upgrade Model

**Status:** Phase 5 implementation-in-progress; format behavior verified from built payloads and package-manager conventions, install execution evidence scheduled for plan section 9.6
**Last updated:** August 21, 2026
**User-facing guides:** [docs/user/installing.md](../user/installing.md), [upgrading.md](../user/upgrading.md), [uninstalling.md](../user/uninstalling.md)

## Scope

What installing, upgrading, and removing Token Trail does to a system: where files land per format, what persists across removal, and why v1 upgrades are manual.

## Format selection

| Need | Format |
| --- | --- |
| Portable single file, no root | AppImage (requires FUSE 2 or `--appimage-extract-and-run`) |
| Debian/Ubuntu family integration | deb via `apt install ./file` |
| Fedora/openSUSE family integration | rpm via `dnf`/`zypper` |
| Arch family integration | Pacman archive via `pacman -U` |

All formats come from one reviewed builder configuration, so behavior differences are limited to the package manager itself. Architecture selection maps `uname -m` output to each format's native label (`x86_64`→`amd64`/`x86_64`; `aarch64`→`arm64`/`aarch64`).

## Install locations (deb/rpm/Pacman)

| Path | Content |
| --- | --- |
| `/opt/Token Trail/` | Application runtime (Electron + bundled ASAR) |
| `/usr/share/applications/tokentrail.desktop` | Menu launcher; name matches WM_CLASS/app_id `tokentrail` |
| `/usr/share/icons/hicolor/512x512/apps/tokentrail.png` | Product icon |
| `/usr/share/metainfo/com.tokentrail.app.metainfo.xml` | AppStream metadata for software centers |

Packages declare no scripts that run at install or remove time; ownership is exactly these paths plus format bookkeeping.

## Upgrade behavior

- **Manual only in v1.** No update check exists anywhere in the application; there is no network code to update with.
- Package-manager installs replace `/opt` content in place when given a newer artifact (`apt`, `dnf`, `zypper`, `pacman -U`). AppImage users replace their file.
- Preferences live under `~/.config/Token Trail/` outside every package, validated on load with quarantine-and-reset for invalid values — so upgrades cannot corrupt settings and downgrades merely reset unrecognized ones.

## Checksums, signatures, and rollback limits

- Every release carries combined `SHA256SUMS.txt`; verification instructions are user-facing before any download instruction.
- Artifacts ship unsigned until an approved Linux signing identity exists; guides state this plainly.
- Published releases are immutable by repository policy once the operator enables it: corrections become new patch versions, never replaced files. Downgrade is not a supported path (older builds reset newer preference fields visibly).

## Uninstall ownership

Package removal takes only package-owned files. The preferences directory survives deliberately so reinstalling restores choices; its documented location and removal command appear in the uninstall guide. Verification steps (`which tokentrail`, path listings) let users confirm complete removal themselves.

## Failure behavior

Checksum mismatch aborts trust before execution; missing FUSE produces documented fallbacks; partial installs are impossible without post-install scripts, which do not exist.

## Known limitations

- No executed install/upgrade/uninstall evidence yet (section 9.6 campaign pending clean environments).
- Desktop-menu AppImage integration remains environment-dependent and is described as such rather than promised.
