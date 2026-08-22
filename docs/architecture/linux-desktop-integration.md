# Token Trail Linux Desktop Integration

**Status:** Implementation-in-progress (Phase 4 opened August 21, 2026)
**Implemented and evidenced so far:** reviewed desktop identity on packaged prototypes across Wayland and X11 (XWayland) backends, Wayland conduct guard against forbidden window APIs, runtime window icon resolution, machine-safe executable slug
**Still open inside this document's scope:** GNOME and other-desktop sessions, fractional-scaling and multi-display matrices, installed desktop-entry verification, all of which require environments or installer artifacts from later phases
**Controlling documents:** [product_spec_electron.md](../../product_spec_electron.md), [implementation_plan.md](../../implementation_plan.md) section 8.6, [design-system-and-theming.md](design-system-and-theming.md)
**Last updated:** August 21, 2026

## 1. Desktop identity

Token Trail deliberately carries two identities that must never blur:

| Identity | Value | Where it lives |
| --- | --- | --- |
| People-facing product name | `Token Trail` | Window title, renderer copy, electron-builder `productName`, packaged manifest `productName` |
| Machine-facing slug | `tokentrail` | Executable name, package name, app id base, artifact stems |

Evidence (`tests/packaged/desktop-identity.spec.ts`): the running executable resolves through `/proc/<pid>/exe` to a basename of exactly `tokentrail`, the window title is exactly `Token Trail` over rendered Overview content, and the packaged manifest inside ASAR contains both `"name": "tokentrail"` and `"productName": "Token Trail"` so runtime and installer metadata agree after install. The runtime window icon resolves from an application-owned path independent of the launch directory (`tests/e2e/window-identity.spec.ts`) and ships inside the archive (`tests/packaged/foundation-packaged.spec.ts`).

## 2. Display-server coverage

This development environment is KDE Plasma on Wayland; the packaged binary additionally runs under Chromium's X11 ozone backend through XWayland when `ELECTRON_OZONE_PLATFORM_HINT=x11` is set:

- Both backends are asserted to render real content and carry identical reviewed identity.
- The X11 run proves the hint actually reached Chromium by checking the renderer user agent, so a silent fallback to Wayland cannot masquerade as coverage.
- GNOME and other desktop sessions remain unavailable in this environment and stay honestly unchecked rather than claimed.

## 3. Wayland conduct

The main process treats the compositor as the owner of geometry and focus. A source-scanning contract (`src/main/windows/wayland-conduct.test.ts`) forbids absolute positioning (`setPosition`, `moveTop`, `moveAbove`, `center`) and blur, requires the frame-ready `show()` lifecycle to exist, and permits focus acquisition only on lines carrying the `conduct:focus` marker — currently the single second-instance raise that responds to the user's own launch action. The one BrowserWindow appears only after its first local frame; no code path repositions or restacks windows.

## 4. Themes and scaling posture

System light/dark themes follow the platform preference through the reviewed palettes without remote assets; zoom and width behavior is bounded by the responsive sweep in the design-system document. Fractional-scaling ratios beyond emulated zoom, multi-display hot-plug, and compositor-specific window restoration remain Phase 6 soak/manual scope because this repository's automation cannot move physical displays or session configuration.

## 5. Desktop entries, mime, and notifications

Installed `.desktop` files, AppStream metadata, MIME associations, and icon-theme installation are produced by Phase 5 packaging formats and will be verified there against installed systems — describing them now would be premature. Token Trail includes no tray, no desktop notifications, and no autostart; those remain post-v1 follow-ups gated behind separate decisions, so nothing in this phase may create their files.

## 6. Test evidence map

- `tests/packaged/desktop-identity.spec.ts`: identity across Wayland and forced-X11 backends, manifest dual-identity check.
- `tests/packaged/foundation-packaged.spec.ts`: hardened launch, window icon inside ASAR.
- `tests/e2e/window-identity.spec.ts`: runtime icon resolution from application-owned paths.
- `src/main/windows/wayland-conduct.test.ts`: static Wayland conduct contract.
- `tests/accessibility/foundation-accessibility.spec.ts`: system theme following and landmark structure.

## 7. Known limitations

- Native window-chrome capture remains impossible under automated KDE Wayland runs; visual shell confirmation is operator work recorded in the versioned report.
- Installed-package desktop integration (entries, icons, AppStream) awaits Phase 5 artifacts and clean-environment installs.
