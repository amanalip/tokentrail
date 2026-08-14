# Renderer State Model

**Status:** Phase 2 Overview implemented  
**Last updated:** August 14, 2026 at 11:16 AM EDT

## Principle

React presents normalized state; it does not infer protocol meaning. Main decides whether data is ready, partial, stale, signed out, unsupported, unavailable, or failed.

## States

| State | Meaning | Data treatment | Primary user action |
| --- | --- | --- | --- |
| `not-started` | No read attempt yet | No fabricated values | Wait for initial read |
| `loading` | First read in progress | No fabricated values | Wait |
| `ready` | Complete valid snapshot | Show all normalized fields | Optional refresh |
| `partial` | Snapshot valid but some fields unavailable | Show valid fields and explicit gaps | Review or refresh |
| `stale` | Refresh failed after an earlier success | Keep prior data and mark age/error | Retry |
| `signed-out` | Codex reports no account | No quota request or fake data | Sign into Codex |
| `unsupported` | Required method/schema is incompatible | No raw compatibility error | Update/check Codex |
| `unavailable` | Executable missing or process unavailable | No raw process detail | Install/start/retry |
| `error` | Invalid response or bounded local failure | Sanitized explanation only | Retry |

## Refresh sequence

On mount, React reads the current snapshot and subscribes before presenting steady state. A manual refresh gives immediate button feedback, calls the no-argument bridge method, and shares controller work with concurrent requests. Snapshot events update the complete state rather than merging arbitrary renderer fragments.

The previous successful snapshot remains visible during a transient failure. Its successful timestamp does not change, while the attempted timestamp and safe error category describe the failed refresh.

## Provenance and calculations

Used percentage, duration, and reset timestamp are Codex-reported. Remaining percentage and countdown are calculated by Token Trail. Refresh time is locally observed. Labels name these origins directly.

Quota percentage and token activity are different measurements. The renderer never converts between them or invents a combined score.

## Presentation invariants

- Every reported bucket remains visible.
- Missing duration or reset data says unavailable; it never displays zero minutes or an epoch date.
- Protocol-derived strings render as React text, never injected markup.
- Status is expressed with text as well as color.
- Progress bars include accessible values and names.
- Loading and status changes avoid repeated noisy announcements.

## Phase 3 presentation corrections

The native window must receive the Token Trail icon explicitly; package metadata alone does not correct Electron's development window icon. Large primary percentages also receive a dedicated numeral-spacing review because glyph combinations such as `48%` can look merged at display size. The required test matrix covers `11%`, `47%`, `48%`, `88%`, and `100%` across themes, zoom, and compact width.
