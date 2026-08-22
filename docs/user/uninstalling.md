# Uninstalling Token Trail

**Status:** Phase 5 user guide; uninstall steps are being followed against release-candidate packages in plan section 9.6 and corrected from observed results
**Last updated:** August 21, 2026

Token Trail installs no tray icon, autostart entry, background service, or daemon — so there is nothing hiding beyond the files listed here.

## Contents

- [Per format](#per-format)
- [What stays behind](#what-stays-behind)
- [Verifying removal](#verifying-removal)

## Per format

**AppImage:** delete the AppImage file. That is the entire installation.

```bash
rm tokentrail-<version>-linux-x86_64.AppImage
```

**deb:**

```bash
sudo apt remove tokentrail
```

**rpm:**

```bash
sudo dnf remove tokentrail      # Fedora family
sudo zypper remove tokentrail   # openSUSE family
```

**Pacman:**

```bash
sudo pacman -R tokentrail
```

The packages declare no post-remove scripts: your package manager removes exactly the files it installed (application directory, launcher, icon, AppStream metadata) and nothing else.

## What stays behind

Your preferences intentionally survive uninstalling, in case you reinstall later:

```
~/.config/Token Trail/
```

This directory contains only the validated preferences document (theme, refresh choices, and similar settings) and Electron's local storage scaffolding for those preferences. No usage data exists in it — usage values were never persisted.

To remove everything:

```bash
rm -rf ~/.config/"Token Trail"
```

Alternatively, clear preferences from inside the application first (Settings & Diagnostics → Clear data), then uninstall.

## Verifying removal

After uninstalling, all of these should come up empty:

```bash
which tokentrail
ls /opt/Token\ Trail 2>/dev/null
ls /usr/share/applications/tokentrail.desktop 2>/dev/null
ls ~/.config/"Token Trail" 2>/dev/null   # only if you also removed preferences
```

If `/usr/share/metainfo/com.tokentrail.app.metainfo.xml` still exists on a deb/rpm/Pacman system, force your package database to refresh its file lists (`sudo ldconfig` is not required; `dpkg -L tokentrail` / `rpm -ql tokentrail` / `pacman -Ql tokentrail` show what the package owns).
