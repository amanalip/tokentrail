# Security Boundaries

**Status:** Phase 2 implemented controls
**Last updated:** August 14, 2026 at 11:28 AM EDT

## Security objective

A compromised renderer must not become arbitrary access to the user's machine or Codex account. A broad experimental Codex protocol must not become broad Token Trail authority. Release and development conveniences must not silently weaken production.

## Trust map

| Boundary | Trust posture | Allowed | Denied |
| --- | --- | --- | --- |
| React renderer | Untrusted | Render validated DTOs; request named no-argument refresh | Node, Electron, filesystem, environment, raw IPC, raw protocol |
| Preload | Narrowly trusted | Validate and expose three reviewed methods | Generic invoke/send, channel names, arbitrary payloads |
| Electron main | Privileged | Window policy, IPC authorization, controller and child ownership | Renderer-selected methods, paths, executables, or origins |
| Codex adapter | Most sensitive | Closed read allowlist and bounded local transport | Prompts, tasks, mutations, credentials, shell forwarding |
| Development server | Local development only | Exact loopback renderer assets and HMR | LAN binding, arbitrary URL, production activation |
| Packaged origin | Application-owned content | Reviewed ASAR renderer assets | HTTP UI, remote content, inline production style/script |

## Renderer containment

Every window uses sandboxing and context isolation with Node integration and webviews disabled. The global web-content policy denies navigation, popups, permissions, downloads, and unreviewed content attachment. The renderer has no `require`, Node `process`, Electron module, or generic bridge method.

## IPC authorization

Main accepts Overview invokes only from the live top-level frame at the exact packaged or development root URL. Parsed component checks reject subframes, malformed URLs, lookalike hosts, alternate ports, paths, queries, and fragments. Handlers accept no renderer payload and validate responses before serialization.

## Protocol containment

Outbound methods pass a runtime allowlist immediately before transport. The child launches without a shell, fixed production arguments, and an allowlisted environment. Inbound bytes pass message, nesting, collection, string, and numeric limits before method schemas. Unknown and identifying fields are stripped.

## Content and origin controls

Packaged content uses `tokentrail://app/` and a strict CSP with self-owned scripts/styles and no eval, objects, forms, or frames. Development has a separately constructed exact-loopback policy for Vite inline CSS and HMR only. Packaged execution ignores the development URL and fixture controls.

## Data and persistence controls

Account and quota snapshots exist only in process memory. Phase 2 writes no usage history or identifying diagnostic. Packaged tests isolate `PATH` and `HOME` so test execution cannot discover the maintainer's real Codex account.

## Build and release boundary

Dependencies are locked and production bundles omit raw dependency trees. Fuses disable Electron-as-Node and Node debugging and require code loading from ASAR. GitHub publishing, signing, update checks, and package installation are not current capabilities; Phase 5 must document and test them before use.

## Relationship to the threat model

This document explains boundary composition. [threat-model.md](threat-model.md) remains the enumerated threat/control register and must be updated whenever a capability changes. A new bridge method, Codex method, stored field, external URL, permission, diagnostic, or update path requires review in both documents.
