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
| x64 | Verified (reference machine only) | All Phase 4 runtime, packaged, and performance evidence; Phase 5 artifact builds and AppImage launch |
| arm64 | Untested (builds verified) | Separate arm64 builds assemble correctly for three formats with native labels; no arm64 execution environment exists yet |

## Package formats

| Format | Quality | Notes |
| --- | --- | --- |
| Unpacked directory output (`linux-unpacked`) | Verified | Hardened-launch, ASAR-content, icon, and identity suites run against it |
| AppImage | Verified (reference machine only); payload-inspected | x64/arm64 artifacts built, contents-gated; x64 image launches on the reference desktop with a clean exit. Second distribution family still owed |
| deb | Payload-inspected only | Control fields, paths, and dependency set read back from the built package; no install execution yet |
| Pacman | Payload-inspected only | `.PKGINFO` and file list read back from the built package; no install execution yet |
| rpm | Payload-inspected (runner-built) | Local assembly skipped by operator decision; release runners build both rpm architectures, verified in the `v0.5.3` draft run. No install execution yet |
| Installation, upgrade, uninstall execution | Deferred | Clean-environment campaign named in plan section 9.6 |

## Development environments

| Flow | Quality | Evidence |
| --- | --- | --- |
| From-git flow: `git clone` → `npm ci` → `npm run verify` → `npm run build` | Verified | Executed from a fresh clone at `3343e64` and mirrored by shared-runner CI with frozen installs |

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
