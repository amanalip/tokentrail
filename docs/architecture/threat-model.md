# Token Trail Threat Model

**Status:** Phase 2 vertical-slice review
**Reviewed scope:** Electron shell, Codex transport, normalization, IPC/preload, renderer, packaging, and development tooling
**Last updated:** August 14, 2026 at 11:01 AM EDT

This threat model records what the Phase 1 foundation protects before Codex data access exists. It expands as later phases add IPC, subprocess ownership, settings, diagnostics, updates, and releases.

## Assets to protect

- The user's Codex authentication, account identity, usage data, prompts, responses, tasks, and local projects.
- The user's filesystem, environment variables, processes, shell, clipboard, browser sessions, and desktop permissions.
- Token Trail preferences and future redacted diagnostic exports.
- Application integrity, release artifacts, tags, checksums, and update metadata.
- The accuracy and provenance of values displayed by Token Trail.

## Trust boundaries

| Boundary | Trust level | Allowed capability | Explicit denial |
| --- | --- | --- | --- |
| Renderer | Untrusted web content | Render validated domain data and request named operations through preload | Node.js, Electron, filesystem, environment, raw IPC, raw Codex JSON |
| Preload | Narrow bridge | Expose frozen, purpose-specific typed methods | Generic send, invoke, channel names, Electron objects |
| Main | Privileged orchestrator | Windows, protocol, IPC authorization, lifecycle, local preferences | Dashboard rendering and unrestricted method forwarding |
| Codex adapter | Most sensitive application module | Approved read methods and owned process transport | Prompts, tasks, mutations, credentials, arbitrary protocol calls |
| Packaged renderer origin | Local application resources | Reviewed HTML, CSS, JavaScript, images | HTTP UI, remote fonts, plugins, frames, navigation, downloads |
| Build and release | Maintainer and protected CI | Frozen install, tests, packaging, draft releases | Untrusted publication, mutable published assets, unpinned release actions |

## Threats and controls

| ID | Threat | Current controls | Required later evidence |
| --- | --- | --- | --- |
| T-001 | Renderer obtains Node or Electron capability | `nodeIntegration` off, sandbox on, context isolation on, three-method frozen bridge with no generic IPC | Packaged capability tests for every bridge expansion |
| T-002 | Renderer navigates to attacker content | `will-navigate` and redirect denial, fixed local origin, no external link feature | Injection and navigation regression tests |
| T-003 | Renderer creates a privileged child window | `setWindowOpenHandler` denies all windows | Test each future external-link design before approval |
| T-004 | Webview bypasses the main window policy | `webviewTag` off and attachment prevented | Packaged assertion and dependency review |
| T-005 | Renderer obtains desktop permission | Permission request and check handlers deny all | Review any future notification permission separately |
| T-006 | Browser download writes an unreviewed file | `will-download` prevents browser downloads | Diagnostics must use a typed native save workflow |
| T-007 | Custom protocol escapes into privileged files | Fixed host, GET-only handler, decode-once path resolution, traversal and null-byte rejection | Encoded traversal and packaged scheme tests |
| T-008 | Inline or remote code runs in renderer | Restrictive CSP, local resources only, no eval, no remote content | CSP and network-capture tests |
| T-009 | Environment input becomes arbitrary navigation | Exact loopback development URL validation; packaged builds ignore it | Malformed and deceptive URL tests |
| T-010 | Second process creates conflicting state | Single-instance lock and existing-window focus | Lifecycle tests after preferences and adapter exist |
| T-011 | Package loads code outside reviewed archive | ASAR on and `OnlyLoadAppFromAsar` fuse enabled | Fuses inspection and packaged smoke test |
| T-012 | Environment variables enable Node execution or debugging | Run-as-Node, Node options, and Node inspect fuses disabled | Inspect every packaged architecture |
| T-013 | Package contains unused dependency source | Vite bundles runtime code and electron-builder excludes raw `node_modules` | Inspect ASAR file list for every release candidate |
| T-014 | Dependency compromise enters application | Exact versions, committed lockfile, frozen CI install, advisory and license review | SBOM and recurring release audit |
| T-015 | Raw Codex data or secrets leak to renderer | Bounded Zod schemas strip email/unknown fields; normalizer creates closed DTOs; bridge revalidates responses | Extend canary coverage with Phase 3 diagnostics |
| T-016 | A denied Codex method is called | Closed request/notification allowlists, runtime pre-transport check, no generic IPC or renderer-selected method | Repeat denial review whenever allowlists change |
| T-017 | Test tooling weakens production fuses | Packaged tests attach through Chromium CDP because Node inspect is disabled | Confirm Node inspect remains disabled in every package |
| T-018 | Published binary changes under an existing version | GitHub release immutability enabled and tag-driven drafts planned | Protected workflow, checksum, and public-download verification |
| T-019 | Development-tool compatibility encourages weakening production CSP | Separate policies: exact loopback development permits Vite inline CSS/HMR; packaged production remains self-hosted and strict | Real development computed-style/HMR test, paired screenshots, policy tests, and packaged inline-style rejection pass |
| T-020 | Renderer spoofs an authorized IPC sender | Main checks exact top-level frame and exact packaged/development root URL; handlers accept no renderer payload | Wrong-frame, lookalike-host, alternate-port, path, query, fragment, and malformed URL tests pass |
| T-021 | Child lifecycle affects another process or leaks a fixture | Main retains the exact shell-free child handle; development harness owns the direct orchestrator; shutdown cancels pending work | Timeout, cancellation, process-exit, packaged isolation, and orchestrator cleanup tests pass |

## Current assumptions

- The renderer bundle is authored by Token Trail and still treated as untrusted because a renderer compromise must not become machine compromise.
- The local Vite server exists only during development on `127.0.0.1:5173`.
- The Phase 2 bridge has three frozen purpose-specific methods and no generic IPC capability.
- Account and rate-limit data are read only through the owned adapter and are never persisted.
- Chromium remote debugging is used only by the external packaged smoke harness. A normal user launch does not add the debugging switch.
- Embedded ASAR integrity validation is not claimed on Linux because current Electron support is limited to macOS and Windows. Loading only from ASAR remains enabled.

## Review triggers

Update this model before merging any new IPC method, Codex method, stored field, diagnostic field, external URL, permission, download, notification, tray behavior, autostart behavior, update check, package format, signing identity, or platform target.
