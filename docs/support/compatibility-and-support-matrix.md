# Token Trail Compatibility and Support Matrix

**Status:** Phase 4 draft from recorded evidence; expanded per release candidate in later phases
**Last updated:** August 21, 2026
**Evidence base:** `tests/test_reports/0.4.0/test_report.md` and the architecture documents it cites

This matrix states what Token Trail's v1 development actually verified versus what remains untested. It promises nothing beyond recorded observation. Quality labels:

| Label | Meaning |
| --- | --- |
| Verified | Executed against real builds or packages in named environments with recorded results |
| Verified (reference machine only) | Verified on the single development reference system; broader confirmation pending |
| Emulated | Observed through standards-based media emulation rather than physical configuration |
| Untested | No recorded execution; must not be presented as supported |
| Deferred | Intentionally out of scope until a named phase or separate approval |

## Platforms and display servers

| Environment | Quality | Evidence |
| --- | --- | --- |
| KDE Plasma on Wayland, x64 Linux | Verified (reference machine only) | Every automated suite in the repository ran here, including packaged launches |
| X11 through XWayland (`ELECTRON_OZONE_PLATFORM_HINT=x11`), x64 | Verified (reference machine only) | Packaged identity launches render reviewed content and identity |
| Native X11 sessions | Untested | No bare-X11 session available; XWayland coverage is the recorded proxy |
| GNOME Wayland | Untested | No GNOME environment available during Phase 4 |
| Cinnamon / Xfce | Untested | No environments available during Phase 4 |

## Architectures

| Architecture | Quality | Notes |
| --- | --- | --- |
| x64 | Verified (reference machine only) | All Phase 4 runtime, packaged, and performance evidence |
| arm64 | Untested | Builds are configured for Phase 5; hardware verification is gated there |

## Package formats

| Format | Quality | Notes |
| --- | --- | --- |
| Unpacked directory output (`linux-unpacked`) | Verified | Hardened-launch, ASAR-content, icon, and identity suites run against it |
| AppImage / deb / rpm / Pacman artifacts | Deferred | Build targets are configured; installation, upgrade, and uninstall verification belongs to Phase 5 |

## Accessibility

| Area | Quality | Evidence |
| --- | --- | --- |
| Keyboard-only operation of every primary workflow | Verified | End-to-end keyboard sweeps on built and fixture applications |
| Automated accessibility rules (axe-core) | Verified | Zero serious or critical violations across nine scans |
| Contrast, zoom reflow, reduced motion, forced colors | Verified / Emulated | Programmatic WCAG audit plus media emulation on real renders |
| Human screen-reader interaction (Orca) | Outstanding | Requires operator judgment; recorded separately when performed |

## Performance budgets

All Phase 4 budgets pass on the reference machine (startup, idle CPU, proportional memory, bundle sizes, interaction feedback). Low-end hardware confirmation is deferred to the release campaign. See [performance-and-resource-model](../architecture/performance-and-resource-model.md).

## Known limitations

Recorded limitations live in the versioned test report and the architecture documents' limitation sections. Support claims never exceed this matrix; anything labeled untested here must be treated as unsupported until evidence exists.
