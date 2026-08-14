# Domain Model and Provenance

**Status:** Phase 2 Overview domain implemented; Phase 3 extensions planned
**Last updated:** August 14, 2026 at 11:28 AM EDT

## Purpose

The domain model is the vocabulary Token Trail trusts after raw protocol validation. It prevents renderer components from depending on experimental Codex envelopes and requires every visible metric to explain where it came from.

## Current model

```mermaid
classDiagram
    OverviewSnapshot "1" --> "0..*" QuotaBucket
    QuotaBucket "1" --> "0..1" PrimaryWindow
    QuotaBucket "1" --> "0..1" SecondaryWindow
    PrimaryWindow --> MetricValue
    SecondaryWindow --> MetricValue
    MetricValue --> Provenance
```

An Overview snapshot contains state, minimal non-identifying account context, normalized quota buckets, refresh timestamps, partial-state information, and one closed error category. Each bucket has safe identity/display metadata and independently optional primary and secondary windows.

## Metric value states

A metric is not represented as an unqualified number. It carries either a valid value and provenance or an explicit unavailable condition. This preserves distinctions among:

- a reported zero;
- a missing field;
- an explicit null;
- a rejected invalid or unsafe value;
- a field unsupported by the current server.

Those distinctions are necessary for honest calculations, accessibility text, diagnostics, and future comparisons.

## Provenance

| Provenance | Meaning | Current examples |
| --- | --- | --- |
| `reported` | Directly supplied by validated Codex data | Used percentage, duration, reset timestamp |
| `calculated` | Deterministically derived by Token Trail | Remaining percentage, reset countdown |
| `observed` | Recorded from the local application environment | Refresh attempt and success timestamps |

Calculated values retain their source dependency. Remaining percentage exists only when used percentage is valid and bounded. Countdown exists only when a valid reset timestamp exists. Token Trail never combines unlike units or converts token activity into quota percentage.

## Boundary conversion

Protocol schemas retain only approved fields and strip email and unknown keys. Normalization performs field-level validation, deduplicates or selects bucket sources deterministically, constructs availability-aware windows, and produces a runtime-validated snapshot. No raw protocol object is stored alongside the domain value.

## Identity and privacy

The renderer may receive a broad account kind and bounded plan label needed for presentation. It does not receive email, credential state beyond signed-in requirements, account IDs, request IDs, reset-credit identifiers, paths, or unknown future fields.

## Phase 3 extension rule

Usage, credits, reset-credit details, coverage, session baselines, preferences, and diagnostics receive their own closed contracts when implemented. Before adding a field, update the data inventory with source, purpose, lifetime, renderer exposure, persistence, and diagnostic treatment. Precision-sensitive integer or decimal values must not pass through unsafe JavaScript number conversion.

Planned detailed calculations belong in `calculations-and-precision.md`, created during Phase 3 when those calculations exist. This document remains the shared vocabulary and provenance authority rather than duplicating every formula.

## Evidence and limitations

Unit fixtures cover valid, null, missing, invalid, multiple-bucket, and unknown-field inputs. React tests verify explicit unavailable text and provenance labels. Aggregate usage and credit models are not implemented and are not described here as current.
