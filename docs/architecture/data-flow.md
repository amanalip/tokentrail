# TokenTrail Data Flow

**Status:** Phase 1 foundation baseline
**Last updated:** August 14, 2026

## Phase 1 flow

```mermaid
flowchart LR
    A["Packaged app.asar"] -->|"tokentrail://app/ GET"| B["Main protocol handler"]
    B -->|"validated local response + CSP"| C["Sandboxed renderer"]
    D["Isolated preload"] -->|"empty frozen tokenTrail bridge"| C
    E["Electron main"] -->|"creates hardened BrowserWindow"| C
    C -. "denied" .-> F["Node, Electron, filesystem, permissions, downloads, remote navigation"]
```

The Phase 1 application displays only bundled branding and static foundation text. It has no Codex transport, account snapshot, preference storage, diagnostic export, telemetry, or update request.

## Planned approved v1 flow

```mermaid
flowchart LR
    R["Sandboxed React renderer"] <-->|"typed domain DTOs"| P["Isolated preload"]
    P <-->|"fixed IPC methods"| M["Electron main"]
    M <-->|"normalized snapshots"| S["In-memory snapshot store"]
    M -->|"approved method identifiers only"| A["Codex adapter"]
    A <-->|"bounded local JSON protocol"| C["Codex app-server"]
    M -->|"non-sensitive settings only"| T["Local preference store"]
    M -->|"allowlisted preview and export"| D["User-selected diagnostic file"]
```

## Boundary rules

1. The Codex adapter validates protocol data before normalization.
2. The main process sends domain DTOs, not raw protocol objects, through fixed IPC handlers.
3. Preload exposes individual functions, not channel names or generic message functions.
4. The renderer never receives credentials, subprocess handles, filesystem paths, environment variables, or raw errors.
5. Usage snapshots and current-session changes stay in memory and disappear at process exit.
6. Preferences contain only validated non-sensitive user choices.
7. Diagnostic export constructs an allowlisted safe object and shows it before writing.
8. Normal v1 operation sends no TokenTrail telemetry.

## Future network boundary

GitHub Releases is the fixed planned distribution provider. v1 preview uses manual downloads. Any application-initiated update request remains disabled until a separate network and consent decision is approved.
