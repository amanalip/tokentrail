# Token Trail Data Inventory

**Status:** Phase 3 implemented inventory
**Last updated:** August 21, 2026

| Data class | Source | State | Approved v1 purpose | Lifetime | Renderer treatment | Diagnostic treatment |
| --- | --- | --- | --- | --- | --- | --- |
| Bundled branding | Repository assets | Loaded | Product identity | Package lifetime | Local image only | Excluded |
| Theme preference | User | Implemented | Light, dark, or system selection | Persisted until cleared | Validated enum | Safe enum may be included |
| Refresh preference | User | Implemented | Conservative refresh behavior | Persisted until cleared | Validated bounded setting | Safe setting may be included |
| Account summary | Codex app-server | Implemented | Connection, account kind, and plan context | Memory only | Normalized minimal fields; email stripped | Identifiers excluded |
| Quota snapshots | Codex app-server | Implemented | Quota windows and derived explanations | Memory only | Validated domain DTO with provenance | Values excluded by default |
| Aggregate usage | Codex app-server | Phase 3 implemented | Daily and lifetime usage display | Memory only | Validated domain DTO; exact decimal strings | Values excluded by default |
| Credit state | Codex app-server | Phase 3 implemented | Read-only credit explanation | Memory only | Validated domain DTO; original units kept | Values excluded by default |
| Reset-credit details | Codex app-server | Phase 3 implemented | Read-only expiry visibility | Memory only | Safe selected fields with expiry classification | IDs excluded |
| Current-session baseline | Locally observed | Phase 3 implemented | Changes since process start | Process memory only | Calculated DTO | Always excluded |
| Refresh time | Locally observed | Implemented | Attempt and success freshness display | Process memory | Timestamp DTO | Coarsened safe state only |
| Sanitized health counters | Token Trail main process | Phase 3 implemented | Local troubleshooting support | Process memory only | Not exposed; diagnostics document only | Allowlisted counters and categories only |
| Sanitized health event | Token Trail | Superseded by counters above | Local troubleshooting | Process memory only | User-facing category | Allowlisted category only |
| Diagnostic preview | Token Trail | Implemented | User review before export | Memory until dismissed | Safe allowlisted object | It is the diagnostic output |
| Diagnostic file | User-selected export | Implemented | User-controlled support sharing | Until user deletes | Not re-read automatically | Contains allowlisted safe object |

## Always excluded

- Credentials, authentication tokens, browser cookies, and environment variables.
- Prompts, responses, tasks, turns, tool calls, model content, and workspace messages.
- Repository, branch, file, project, and private path data.
- Raw protocol objects, raw exception text, unknown fields, and subprocess details.
- Current-session baselines and deltas from persistence, logs, and diagnostics.

Any added field updates this table before implementation. A field without a documented source, purpose, lifetime, renderer treatment, and diagnostic treatment is denied by default.
