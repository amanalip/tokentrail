# Known Limitations

**Status:** Living record from recorded evidence; updated whenever a limitation is confirmed or cleared
**Last updated:** August 22, 2026
**Evidence base:** `tests/test_reports/0.4.0` and `0.5.0`, the compatibility and support matrix, and the commit tracker

This page lists every known limitation honestly. Items are removed only when evidence shows they no longer hold.

## Operator-held verification

| ID | Limitation | Why it is open |
| --- | --- | --- |
| LIM-001 | Human Orca screen-reader session has not been performed | Requires operator judgment; all automated accessibility gates pass |
| LIM-002 | Protected release environment lacks required reviewers; repository tag immutability not yet enabled | Operator repository settings that workflows cannot set themselves |

## Environment coverage

| ID | Limitation | Recorded state |
| --- | --- | --- |
| LIM-003 | GNOME Wayland, Cinnamon, Xfce, and native X11 sessions untested | No environments available; XWayland coverage is the recorded proxy |
| LIM-004 | deb/rpm/Pacman install, upgrade, and uninstall never executed | Needs matching distributions; payloads were inspected instead |
| LIM-005 | AppImage verified on one distribution family only (CachyOS reference machine) | Second family owed |
| LIM-006 | arm64 artifacts build correctly but have never executed | No arm64 execution environment |

## Product behavior

| ID | Limitation | Recorded state |
| --- | --- | --- |
| LIM-007 | Artifacts are unsigned previews | No Linux signing identity approved; checksums are the verification mechanism |
| LIM-008 | AppImage carries no embedded AppStream metadata | electron-builder 26 has no per-target mapping for that format (decision 011) |
| LIM-009 | One transient packaged-launch stall observed once under heavy load; cause unproven | Diagnostic hook added to self-report any recurrence (0.5.0 report §7) |
| LIM-010 | v1 performs no update checks by design | Manual upgrades only; see [Upgrading](../user/upgrading.md) |

Deferred feature ideas live in the implementation plan's post-v1 tracker and are deliberately absent from this product.
