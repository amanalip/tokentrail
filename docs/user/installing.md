# Installing Token Trail

**Status:** Phase 5 user guide; installation steps are being followed against release-candidate packages in plan section 9.6 and corrected from observed results
**Last updated:** August 21, 2026

Token Trail ships as four package formats for two architectures. All artifacts are **unsigned development previews** until an approved signing plan exists; verify checksums before running anything.

## Contents

- [Choose your architecture](#choose-your-architecture)
- [Download and verify](#download-and-verify)
- [AppImage](#appimage)
- [deb (Debian, Ubuntu, Mint)](#deb-debian-ubuntu-mint)
- [rpm (Fedora, openSUSE)](#rpm-fedora-opensuse)
- [Pacman package (Arch, CachyOS, Manjaro)](#pacman-package-arch-cachyos-manjaro)
- [Packages versus source archives](#packages-versus-source-archives)
- [Supported configurations](#supported-configurations)

## Choose your architecture

Check your machine's architecture:

```bash
uname -m
```

| Output | Choose | Deb suffix | Pacman suffix |
| --- | --- | --- | --- |
| `x86_64` | x64 | `amd64` | `x86_64` |
| `aarch64` | arm64 | `arm64` | `aarch64` |

Each format labels architectures in its own native vocabulary; the table above maps them.

## Download and verify

1. Open the project's GitHub Releases page and locate the version you want. Drafts are visible only to maintainers; published versions are public.
2. Download the artifact for your architecture and the `SHA256SUMS.txt` file.
3. Verify before installing:

   ```bash
   sha256sum -c SHA256SUMS.txt --ignore-missing
   ```

   The check must print `OK` for every file you downloaded. A mismatch means the file is not the reviewed build — do not run it.

Artifact names follow `tokentrail-<version>-linux-<arch>.<format>`, for example `tokentrail-0.5.0-linux-amd64.deb`.

## AppImage

The AppImage is a single portable file; no installation step is required.

```bash
chmod +x tokentrail-<version>-linux-x86_64.AppImage
./tokentrail-<version>-linux-x86_64.AppImage
```

- Requires FUSE 2 (`libfuse2`) on most distributions. If it will not start, see [troubleshooting](troubleshooting.md#appimage-will-not-start-fuse-errors).
- Desktop-menu integration depends on your environment's AppImage handling; without it, launch from a terminal or create your own launcher.
- To remove: delete the file. Token Trail creates no other AppImage-owned files.

## deb (Debian, Ubuntu, Mint)

```bash
sudo apt install ./tokentrail-<version>-linux-amd64.deb
```

`apt` resolves the runtime libraries Token Trail needs automatically. Removing the package later removes exactly its own files (see [Uninstalling](uninstalling.md)).

Installed locations: application files under `/opt/Token Trail/`, launcher at `/usr/share/applications/tokentrail.desktop`, icon under `/usr/share/icons/hicolor/`, and AppStream metadata at `/usr/share/metainfo/com.tokentrail.app.metainfo.xml`.

## rpm (Fedora, openSUSE)

Fedora-family:

```bash
sudo dnf install ./tokentrail-<version>-linux-x86_64.rpm
```

openSUSE-family:

```bash
sudo zypper install ./tokentrail-<version>-linux-x86_64.rpm
```

## Pacman package (Arch, CachyOS, Manjaro)

```bash
sudo pacman -U tokentrail-<version>-linux-x86_64.pacman
```

## Packages versus source archives

GitHub also shows "Source code (zip/tar.gz)" links on every release. Those are automatic snapshots of the repository text — they are **not** the application, they do not contain a runnable build, and they have no checksums in `SHA256SUMS.txt`. Install only the `tokentrail-*` artifacts described above.

## Supported configurations

Quality labels for distributions, desktop environments, display servers, and architectures live in the [compatibility and support matrix](../support/compatibility-and-support-matrix.md). Configurations marked untested there may still work; they simply have no recorded evidence yet.
