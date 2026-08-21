# Renderer State Model

**Status:** Phase 3 routes implemented  
**Last updated:** August 21, 2026

## Principle

React presents normalized state; it does not infer protocol meaning. Main decides whether data is ready, partial, stale, signed out, unsupported, unavailable, or failed.

## Route composition

Six destinations share one snapshot subscription through the `useOverviewSnapshot` hook; no route holds divergent privileged data. Derived summaries (reset timeline, attention order, capacity clauses) are recomputed at render time from the same snapshot through shared domain functions. Clock-dependent classifications use a render-safe bounded-interval hook so React rendering stays pure while countdowns stay current.

Preferences load once through `usePreferences`; saves persist complete validated replacements and adopt the stored result.

## States

| State | Meaning | Data treatment | Primary user action |
| --- | --- | --- | --- |
| `not-started` | No read attempt yet | No fabricated values | Wait for initial read |
| `loading` | First read in progress | No fabricated values | Wait |
| `ready` | Complete valid snapshot | Show all normalized fields | Optional refresh |
| `partial` | Snapshot valid but some fields unavailable (including a failed usage read beside valid quota data) | Show valid fields and explicit gaps | Review or refresh |
| `stale` | Refresh failed after an earlier success | Keep prior data and mark age/error | Retry |
| `signed-out` | Codex reports no account | No quota request or fake data | Sign into Codex |
| `unsupported` | Required method/schema is incompatible | No raw compatibility error | Update/check Codex |
| `unavailable` | Executable missing or process unavailable | No raw process detail | Install/start/retry |
| `error` | Invalid response or bounded local failure | Sanitized explanation only | Retry |

Each data-bearing route renders its own empty and failure panels with reviewed copy, so a missing section never appears as blank space.

## Refresh sequence

On mount, React reads the current snapshot and subscribes before presenting steady state. A manual refresh gives immediate button feedback, calls the no-argument bridge method, and shares controller work with concurrent requests. Snapshot events update the complete state rather than merging arbitrary renderer fragments.

The previous successful snapshot remains visible during a transient failure. Its successful timestamp does not change, while the attempted timestamp and safe error category describe the failed refresh.

## Provenance and calculations

Used percentage, duration, reset timestamp, daily token buckets, credit strings, and reset-credit metadata are Codex-reported. Remaining percentage, countdowns, statistics, comparisons, coverage, attention order, timeline order, expiry groups, and session deltas are calculated or locally observed by Token Trail. Labels name these origins directly.

Quota percentage and token activity are different measurements. The renderer never converts between them or invents a combined score.

## Presentation invariants

- Every reported bucket remains visible.
- Missing duration or reset data says unavailable; it never displays zero minutes or an epoch date.
- Reported zero days, positive days, and missing dates remain distinct in charts, tables, statistics, and accessible text.
- Protocol-derived strings render as React text, never injected markup.
- Status is expressed with text as well as color.
- Progress bars include accessible values and names.
- Loading and status changes avoid repeated noisy announcements.

## Identity presentation

The native window receives the Token Trail icon explicitly at creation; package metadata alone does not correct Electron's development window icon. Large primary percentages use a dedicated display token with explicit numeral spacing because glyph combinations such as `48%` can look merged at display size. The required visual matrix covers `11%`, `47%`, `48%`, `88%`, and `100%` across themes, zoom, and compact width; capturing that evidence remains scheduled Phase 3 verification work.
