# Upgrading Token Trail

**Status:** Phase 5 user guide; upgrade steps are being followed against release-candidate packages in plan section 9.6 and corrected from observed results
**Last updated:** August 21, 2026

Token Trail performs **no automatic update checks and never installs anything by itself**. There is no background network activity looking for new versions. Upgrading is always a manual act you decide on.

## Contents

- [Check your current version](#check-your-current-version)
- [Manual upgrade per format](#manual-upgrade-per-format)
- [Settings compatibility](#settings-compatibility)
- [Downgrade limitations](#downgrade-limitations)

## Check your current version

1. Open **Settings & Diagnostics**.
2. Expand the diagnostics preview; the application version is listed there alongside the Electron and Chromium versions it runs on.

Alternatively, for package installs:

```bash
# deb
dpkg -s tokentrail | grep Version

# rpm
rpm -q tokentrail

# Pacman
pacman -Qi tokentrail | grep Version
```

## Manual upgrade per format

Download the new version's artifact and `SHA256SUMS.txt`, verify checksums as described in [Installing](installing.md#download-and-verify), then install over the old one:

| Format | Command |
| --- | --- |
| AppImage | Replace your AppImage file with the new one (same `chmod +x`) |
| deb | `sudo apt install ./tokentrail-<new>-linux-amd64.deb` |
| rpm | `sudo dnf install ./tokentrail-<new>-linux-x86_64.rpm` or `sudo zypper install ...` |
| Pacman | `sudo pacman -U tokentrail-<new>-linux-x64.pacman` |

Package managers replace the application files in place. Your preferences survive upgrades because they live in your user profile, not inside the package (see below).

Close Token Trail before upgrading. Single-instance enforcement prevents a second application window; it does not prevent a package manager from replacing files while the first process is running.

## Settings compatibility

2.0.0 retains the 1.0.0 preference schema and storage location, so existing valid preferences are reused. Preferences are validated when loaded. Malformed files are quarantined only when they can be preserved successfully; transient read errors do not overwrite recoverable settings. Compatibility with hypothetical future schemas is not guaranteed.

Your usage data itself cannot "survive" an upgrade because it was never stored: it exists only while Token Trail runs.

## Downgrade limitations

Rolling back to an older version is not a supported path: preferences written by a newer version may use fields the older one does not understand, and the older build will quarantine-and-reset them safely but visibly. If you must downgrade, expect your settings to reset to defaults.

Published releases are immutable: once a version is published, its files never change under the same name. Corrections ship as new versions.
