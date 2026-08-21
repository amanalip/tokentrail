# Calculations and Precision

**Status:** Implemented in Phase 3
**Last updated:** August 21, 2026

This document explains every calculation Token Trail performs, the exactness rules it follows, and how unavailability is preserved end to end. The product specification (sections 14.6 through 14.10 and interfaces 8.19 through 8.23) controls required behavior; this document describes the implemented system that satisfies it.

## Scope

- Exact integer arithmetic for aggregate token counters.
- Calendar-date semantics independent of timezone-shifted instants.
- Descriptive statistics, complete-period comparisons, heatmap classification, and coverage accounting.
- Deterministic orderings: reset timeline, quota attention, primary-window selection, reset-credit expiry.
- In-memory session deltas with reset-transition rebasing.
- Combined-capacity clause selection without cross-unit arithmetic.

## Module ownership

| Module | Responsibility |
| --- | --- |
| `src/shared/domain/calendar-date.ts` | Strict calendar-key parsing, ordering, day arithmetic, span enumeration |
| `src/shared/domain/bigint-format.ts` | Canonical decimal parsing, exact ratio formatting, grouped display |
| `src/shared/domain/usage-calculations.ts` | Coverage, statistics, comparisons, heatmap classification, chronological sorting |
| `src/shared/domain/quota-ordering.ts` | Reset timeline, attention ordering, primary-window selection |
| `src/shared/domain/session-deltas.ts` | Baseline-vs-current delta derivation rules |
| `src/shared/domain/reset-credit-expiry.ts` | Expiry classification against the fixed seven-day rule |
| `src/shared/domain/combined-capacity.ts` | Fixed factual clause selection |

All modules are shared renderer/main code: dependency-free, side-effect free, and deterministic given their inputs plus an explicit clock value supplied by the caller.

## Counter representation and precision

- Protocol counters cross IPC as canonical unsigned decimal strings (`/^(0|[1-9]\d*)$/`, bounded at 128 characters). JSON numbers are accepted only when they are non-negative safe integers; the privileged adapter converts them to strings at normalization time (`normalize-usage.ts`).
- Arithmetic uses `bigint` exclusively (`parseDecimalCounter`). No counter passes through a binary floating-point value at any layer.
- Ratios (averages, medians of even counts, relative change) are formatted by `formatBigintRatio`, which scales once and rounds half-up using integer arithmetic only, then trims trailing zeros. Display grouping (`formatDecimalCounterWithSeparators`) inserts separators on the digit string without numeric conversion.
- Chart geometry is the only sanctioned lossy boundary: `toChartNumber` converts a counter to a number only when it is within `Number.MAX_SAFE_INTEGER`; larger values clamp to the safe maximum while all textual values remain exact.

## Calendar-date rules

- Date keys are strict `YYYY-MM-DD` strings validated against real calendar semantics including leap years (`parseCalendarDateKey`). Impossible dates are rejected, never coerced to neighbors.
- Keys are compared as calendar dates (`compareCalendarDates`), not as timestamp instants, so a local-timezone change cannot shift which bucket a key names.
- Comparison periods enumerate consecutive keys ending on the latest valid supplied date (`enumerateConsecutiveDateKeys`), walking month and year boundaries exactly.

## Statistics (Interface 8.22)

Given the supplied range only:

- **Total**: exact bigint sum of valid buckets.
- **Daily average**: total divided by all supplied buckets, including reported zeros.
- **Active-day average**: total divided only by positive buckets; unavailable when no active day exists.
- **Median**: all valid values sorted including zeros; even counts use the exact mean of the two middle values via ratio formatting.
- **Highest supplied day**: maximum valid value; ties keep the earliest date in the compact card and expose all tied dates.
- **Active-day count**: number of positive buckets.

Every statistic carries `available` plus a stable explanation key. An empty range yields unavailable statistics, never zeros.

## Complete-period comparisons (Interface 8.21)

- A 7-day comparison requires 14 consecutive dated buckets ending on the latest valid date; a 30-day comparison requires 60.
- Totals and absolute differences use exact bigint subtraction.
- Relative change appears only when the preceding total is strictly positive; a zero preceding total with positive latest total shows the absolute difference and marks relative change unavailable.
- Both-zero periods produce the dedicated "no activity" case rather than a misleading 0% change.

## Coverage (Interface 8.22)

Coverage records the accepted distinct date count, rejected-record count, reported-zero count, missing dates inside the observed supplied span (bounded list of 64 with explicit truncation flag), and first/last valid dates. Missing dates outside the supplied span are never invented. The coverage model determines availability before calculations run.

## Orderings

- **Reset timeline**: strictly future valid timestamps only; sorted by timestamp then stable bucket/window identity. Missing or already-passed times appear in a visible unknown-time group. A passed timestamp never implies a completed reset.
- **Quota attention** (Interface 8.19): reached-state buckets first, then highest valid used percentage across windows, windows descending by used percentage, equal percentages by earliest future reset, remaining ties by stable identifiers, entries lacking a valid percentage last. Percentages outside 0–100 are treated as invalid for ordering while remaining visible as reported values.
- **Primary window**: first server-designated primary window in stable bucket order, else the first available window; callers state which rule applied.
- **Reset-credit expiry**: available rows with future expiry sorted earliest first; expired, non-expiring, and unknown-expiry remain separate groups. The seven-day notice boundary is exactly 604,800 seconds applied to the reported timestamp.

## Session deltas (Interface 8.20)

- The baseline is the first valid snapshot of the current process, held in memory only.
- Quota movement is expressed in percentage points rounded to one decimal through integer tenths.
- A changed reset timestamp produces a reset transition and suppresses that window's percentage delta; the controller rebases its baseline for transitioned windows so later comparisons stay within one reset era.
- Lifetime token counters compare by exact bigint subtraction; increases display exactly, decreases surface as "source value changed" without interpretation.
- Deltas clear when the process exits; they are never persisted, logged, or exported.

## Combined capacity (Interface 8.23)

Clauses are selected from a fixed factual set mapped to reported or directly calculated states: reached status, credit balance/unlimited/unavailable, spending-control state, authoritative reset-credit count, and at most one seven-day expiry notice. No clause claims sufficiency, estimates task capacity, converts units, or produces a score. When every source is unavailable the clauses say so explicitly.

## Failure behavior

- Invalid records are counted in coverage and excluded from all calculations; they never participate silently.
- Unavailable inputs produce explicitly unavailable outputs with stable explanation keys.
- All ordering functions are total: they never throw on validated input and always produce deterministic output.

## Security and privacy boundaries

- Calculation modules contain no I/O, no clock reads (callers supply time), and no persistence.
- Session deltas exist only inside the controller's memory and the outgoing snapshot response.

## Test evidence

- `src/shared/domain/*.test.ts`: 57 tests covering parsing, rounding, statistics, comparisons, ordering, expiry, clauses, and delta rules including huge-value cases.
- `src/main/codex/normalize-usage.test.ts`: rejection counting, duplicate handling, zero-vs-missing distinction, capped detail rows.
- `src/main/overview/overview-controller.test.ts`: baseline establishment, percentage-point deltas, counter decreases, reset transitions.

## Known limitations

- Heatmap intensity bands are coarse thirds of the range maximum; per-cell exact values live in accessible text and the table view.
- Statistics cover only the supplied range; lifetime figures come solely from Codex-reported summary fields.
