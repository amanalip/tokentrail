# Preferences and Storage

**Status:** Implemented in Phase 3
**Last updated:** August 21, 2026

This document explains the implemented preferences model, its persistence boundary, validation rules, corruption behavior, and what Token Trail deliberately never stores. The product specification (sections 5.7, 14.5, 15.8, and 16.3) controls required behavior.

## Scope

- The versioned preferences document and its closed schema.
- The privileged preference store: atomic writes, restrictive permissions, quarantine-on-corruption.
- The preferences IPC surface and renderer adoption flow.
- Persistence exclusions: usage data, session observations, and diagnostics never touch disk.

## Schema

`src/shared/contracts/preferences.ts` defines one strictly validated document:

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `version` | literal `1` | `1` | Bumped only when a migration becomes necessary |
| `theme` | `system` \| `light` \| `dark` | `system` | Applied as a document-root attribute by the renderer |
| `timeFormat` | `system` \| `12h` \| `24h` | `system` | Presentation only; source timestamps are never rewritten |
| `automaticRefreshEnabled` | boolean | `false` | Off by default pending evidence |
| `refreshIntervalMinutes` | integer 5–120 | `5` | Bounded at validation time |
| `reducedMotion` | `system` \| `reduced` \| `full` | `system` | Forces reduced motion independently of the OS |

The schema is `.strict()`: unknown fields fail validation on both read and write paths, so a future field cannot silently enter storage before the schema accepts it.

## Storage location and format

- One JSON document at `<user-data directory>/preferences.json`, resolved from Electron's trusted user-data location, never from the launch directory.
- Writes serialize the complete validated document with two-space indentation for offline inspectability.

## Write path

`PreferenceStore.save()` (src/main/preferences/preference-store.ts):

1. Re-validates through the schema so internal callers cannot bypass the contract.
2. Serializes writes through an internal promise queue so concurrent saves cannot interleave.
3. Creates the parent directory if needed.
4. Writes to a temporary sibling (`preferences.json.tmp`) then renames atomically.
5. Updates the in-memory cache only after a durable successful write.

## Read path

`load()` reads once per process, validates strictly, and caches. Any failure — missing file, malformed JSON, schema drift — follows the same path:

1. Quarantine: rename the unreadable file to `preferences.json.corrupt`, preserving evidence without trusting it.
2. Reset to reviewed defaults and persist them immediately.
3. Return defaults; the application never crashes or invents partial truth from corrupt input.

## IPC surface

Two purpose-specific handlers installed by `installApplicationIpc` (src/main/ipc/application-ipc.ts):

- `getPreferences`: returns the current validated document to the approved top-level frame only.
- `setPreferences`: accepts a **complete replacement document**, validates it, persists it, and returns the stored result. Partial updates are rejected by design so every stored document is fully schema-valid.

Both handlers validate sender frame identity exactly like Overview IPC. The renderer adopts the returned document as state (`usePreferences` hook), so UI state always equals persisted state after a save.

## Persistence exclusions

Token Trail stores no secret and no usage-derived value:

- Usage snapshots, daily buckets, quota values, credit strings, and session deltas exist only in memory.
- Session observation baselines clear when the process exits and have no persistence path.
- Diagnostic documents are written only when the user explicitly exports through the native save dialog.
- No `safeStorage` encryption is used because nothing stored warrants it (specification 15.8).

## Clear-data behavior

Clearing data removes only Token Trail-owned files: the preferences document (and any quarantined sibling). Codex-owned files, credentials, and unrelated application data are out of scope by construction because Token Trail never writes outside its own user-data file set.

## Test evidence

- `preference-store.test.ts`: valid loads, corrupt-file quarantine with defaults reset, schema-invalid rejection (out-of-range interval), atomic temp-file rename, concurrent-write serialization.
- `routes.test.tsx`: settings route persists a complete replacement through the bridge and asserts the exact stored document.

## Known limitations

- Version migrations are not yet exercised: version 1 is the only version. The migration path will be implemented and tested when a schema change first requires it.
- File permissions use mode 0o600 where the platform permits; Windows ACLs are not specially configured.
