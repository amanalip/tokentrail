# Token Trail Data Inventory

**Status:** Phase 2 vertical slice inventory
**Last updated:** August 14, 2026 at 11:01 AM EDT

| Data class | Source | Phase 1 state | Approved v1 purpose | Lifetime | Renderer treatment | Diagnostic treatment |
| --- | --- | --- | --- | --- | --- | --- |
| Bundled branding | Repository assets | Loaded | Product identity | Package lifetime | Local image only | Excluded |
| Theme preference | User | Not implemented | Light, dark, or system selection | Persisted until cleared | Validated enum | Safe enum may be included |
| Refresh preference | User | Not implemented | Conservative refresh behavior | Persisted until cleared | Validated bounded setting | Safe setting may be included |
| Account summary | Codex app-server | Phase 2 implemented | Connection, account kind, and plan context | Memory only | Normalized minimal fields; email stripped | Identifiers excluded |
| Quota snapshots | Codex app-server | Phase 2 implemented | Quota windows and derived explanations | Memory only | Validated domain DTO with provenance | Values excluded by default |
| Aggregate usage | Codex app-server | Not accessed | Daily and lifetime usage display | Memory only | Validated domain DTO | Values excluded by default |
| Credit state | Codex app-server | Not accessed | Read-only credit explanation | Memory only | Validated domain DTO | Values excluded by default |
| Reset-credit details | Codex app-server | Not accessed | Read-only expiry visibility | Memory only | Safe selected fields | IDs excluded |
| Current-session baseline | Locally observed | Not implemented | Changes since process start | Process memory only | Calculated DTO | Always excluded |
| Refresh time | Locally observed | Phase 2 implemented | Attempt and success freshness display | Process memory | Timestamp DTO | Coarsened safe state only |
| Sanitized health event | Token Trail | Not implemented | Local troubleshooting | Bounded local retention if approved | User-facing category | Allowlisted category only |
| Diagnostic preview | Token Trail | Not implemented | User review before export | Memory until dismissed | Safe allowlisted object | It is the diagnostic output |
| Diagnostic file | User-selected export | Not implemented | User-controlled support sharing | Until user deletes | Not re-read automatically | Contains allowlisted safe object |

## Always excluded

- Credentials, authentication tokens, browser cookies, and environment variables.
- Prompts, responses, tasks, turns, tool calls, model content, and workspace messages.
- Repository, branch, file, project, and private path data.
- Raw protocol objects, raw exception text, unknown fields, and subprocess details.
- Current-session baselines and deltas from persistence, logs, and diagnostics.

Any added field updates this table before implementation. A field without a documented source, purpose, lifetime, renderer treatment, and diagnostic treatment is denied by default.
