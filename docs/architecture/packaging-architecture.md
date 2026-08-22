# Packaging Architecture

**Status:** Phase 5 implementation-in-progress; configuration and local builds verified, clean-environment installation verification scheduled for plan section 9.6
**Last updated:** August 21, 2026
**Controlling decisions:** [008 - product identity split](../../design_decisions.md), [011 - four-format packaging identity and metadata ownership](../../design_decisions.md)

## Scope

How Token Trail's reviewed source tree becomes four Linux release artifacts: which inputs enter a package, how each format is assembled, what metadata ships inside them, and how output is verified before anything is called a candidate.

## Inputs

| Input | Source | Trust |
| --- | --- | --- |
| Main/preload/renderer bundles | Vite production builds with source maps disabled | Built from reviewed TypeScript by frozen CI |
| Runtime window icon | `assets/branding/exports/tokentrail-icon-256.png` via the ASAR allowlist | Checked-in reviewed asset |
| Package manifest | `package.json` (name, productName, version, desktopName, homepage, author) | Single identity source |
| AppStream metainfo | `build/metainfo/com.tokentrail.app.metainfo.xml` | Content-tested honest-description guard |
| Electron runtime | Pinned dev dependency 43.4.0, downloaded at package time | Version-pinned, fuse-hardened |

Everything else — sources, tests, documentation, VCS data, `node_modules` (dependencies are bundled by Vite) — is excluded by an explicit allowlist.

## Assembly

`electron-builder.config.cjs` builds one reviewed configuration into four formats:

- **AppImage** — self-contained portable image; embedded desktop entry carries `StartupWMClass=tokentrail`.
- **deb / rpm / Pacman** — fpm-assembled native packages installing to `/opt/Token Trail/`, launcher `/usr/share/applications/tokentrail.desktop`, hicolor icon, and `/usr/share/metainfo/com.tokentrail.app.metainfo.xml`.
- Artifact names use the machine-safe stem: `${name}-${version}-${os}-${arch}.${ext}` → e.g. `tokentrail-0.5.0-linux-amd64.deb`. Each format labels architectures natively (`amd64`/`arm64`; `x86_64`/`aarch64`); x64 and arm64 build through separate invocations without relabeling.
- Desktop window association is wired by manifest `desktopName: "tokentrail.desktop"` plus `linux.syncDesktopName`, so Electron's derived WM_CLASS and Wayland app_id match the installed entry name exactly.
- Dependency sets are owned by electron-builder's maintained per-format defaults and verified post-build in generated control files; no post-install or post-remove hooks exist because v1 ships no tray, autostart, MIME handler, or daemon.

## Hardening posture

ASAR on, `onlyLoadAppFromAsar` on; `runAsNode`, Node options env var, and CLI inspect fuses disabled; file protocol privileges removed. Embedded ASAR integrity validation stays **off** because Electron supports it only on macOS and Windows today; the only-load fuse still blocks unpacked overrides. This is recorded as an honest platform limitation, not a claim of integrity checking.

## Verification

- Contract unit tests (`src/build/packaging-config.test.ts`) pin targets, naming template, slug/category, desktop wiring, payload allowlist, fuse flags, and metainfo delivery against the live config file.
- `npm run check:package-contents` parses the ASAR header listing (rejecting development paths), enforces an exact unpacked-entry allowlist including Electron license artifacts, and scans archive plus every artifact for credential-shaped markers.
- Payload inspection performed on real x64 builds: deb control fields, Pacman `.PKGINFO`, and extracted AppImage desktop entry were read directly and matched expectations.

## Failure behavior

Missing or drifted inputs fail closed: contract tests fail before builds; the contents gate fails on unexpected files or secret markers; the release pipeline's tag/version guard refuses mismatched versions before building anything.

## Known limitations

- rpm assembly requires host `rpmbuild` (Ubuntu `rpm` package); not yet exercised locally or in CI.
- AppImage lacks embedded AppStream metadata (no per-target mapping in electron-builder 26); deferred rather than duplicated into `/opt`.
- Install/upgrade/uninstall execution evidence belongs to section 9.6 and later phases.
