# Token Trail Performance and Resource Model

**Status:** Implementation-in-progress (Phase 4 opened August 21, 2026)
**Implemented and evidenced so far:** packaged startup/idle-CPU/memory gates, renderer bundle budgets enforced at build time, lazy chart-chunk loading, interaction-timing suite, resource bounds under repeated use
**Still open inside this document's scope:** multi-day soak trends and low-end reference-machine confirmation, which belong to the Phase 6 campaign
**Controlling documents:** [product_spec_electron.md](../../product_spec_electron.md), [implementation_plan.md](../../implementation_plan.md) section 8.5, [repository-and-build-system.md](repository-and-build-system.md)
**Last updated:** August 21, 2026

Every number below was measured on the development reference machine (`KDE Plasma Wayland, x64 Linux`) on August 21, 2026, against the packaged or built application as noted. Budgets are enforced by automation; raising one requires new measurements and a revision entry here.

## 1. Runtime budgets and measurements (packaged build)

| Metric | Budget | Measured | Enforcement |
| --- | --- | --- | --- |
| Cold startup | ≤ 3,000 ms | 410.6 ms | `tests/performance/foundation-performance.spec.ts` |
| Warm startup | ≤ 3,000 ms | 401.5 ms | same |
| Idle CPU after settling | ≤ 2 % of one core | 0 % over a 5-second window | same |
| Proportional set size (process tree) | ≤ 450 MB | 333.2 MB | same |
| Resident set size (informational ceiling) | ≤ 1,000 MB | 863.9 MB | same |

Method: the packaged harness launches the fused AppImage-style directory output twice (cold, then warm), samples every `/proc/<pid>` entry belonging to the application process tree across an explicit idle interval, converts kernel CPU ticks through `getconf CLK_TCK`, and sums resident plus proportional memory from kernel records.

## 2. Recorded budget revision: resident memory

Phase 1 carried a provisional RSS expectation that the process tree exceeded (~800 MB observed). The cause is measurement semantics, not growth: summing VmRSS across Chromium main, renderer, GPU, and utility processes double-counts shared pages several times. Phase 4 therefore splits the contract:

- **Enforcing gate moves to proportional set size**, which apportions shared pages once, at ≤ 450 MB against 333.2 MB measured.
- **RSS remains reported** under a revised 1,000 MB informational ceiling so regressions still surface, without pretending it measures unique memory.

## 3. Renderer bundle budgets (enforced at build time)

`scripts/check-bundle-budget.mjs` runs at the end of every `npm run build`. Budgets derive from post-lazy-split measurements with roughly ten percent headroom:

| Scope | Budget | Measured |
| --- | --- | --- |
| Initial renderer JavaScript (raw / gzip) | 350,000 / 110,000 bytes | 314,367 / 94,284 bytes |
| Lazy chart chunk (raw) | 560,000 bytes | 512,458 bytes |
| All renderer JavaScript (raw) | 920,000 bytes | 826,825 bytes |

## 4. Lazy chart runtime

The Usage route is the only consumer of ECharts, so it loads through a dynamic import: the chart runtime moved out of the initial path entirely, cutting first-paint JavaScript from 825,991 to 314,367 bytes (a 62 percent reduction). Other routes never download the chart code. The Suspense fallback is a bounded local panel with live-region semantics, rendered from local media with no network involvement.

## 5. Interaction timings (built application, fixture data)

Measured by role-based readiness polling at 25 ms granularity in `tests/e2e/performance-interactions.spec.ts`; no production timing hooks exist:

| Interaction | Budget | Measured |
| --- | --- | --- |
| First Usage visit, including lazy chart chunk and first render | ≤ 2,000 ms | 339.1 ms |
| Chart → table toggle | ≤ 500 ms | 29.8 ms |
| Table → chart toggle | ≤ 500 ms | 33.5 ms |
| Manual refresh round trip (each of five) | ≤ 5,000 ms | 118.8, then 44.1 / 21.2 / 20.6 / 23.9 ms |

Refresh feedback stays immediate because activation disables the control synchronously while the request crosses the owned-process boundary asynchronously.

## 6. Repeated-use bounds

Resource behavior under churn is proven separately in [resilience-and-lifecycle.md](resilience-and-lifecycle.md): exactly one chart instance while Usage mounts, zero leftover containers afterward, one window through refresh storms, and cleanup-backed timers and subscriptions throughout.

## 7. Test evidence map

- `tests/performance/foundation-performance.spec.ts`: packaged startup, idle CPU, PSS/RSS with enforcing gates.
- `scripts/check-bundle-budget.mjs` wired into `npm run build`: bundle ceilings.
- `tests/e2e/performance-interactions.spec.ts`: refresh feedback, lazy chart readiness, toggle latency.
- `tests/e2e/resilience.spec.ts`: instance and window bounds under repeated use.

## 8. Known limitations

- Measurements come from the development reference machine; Phase 6 confirms them on the supported matrix and any low-end reference hardware before release.
- Long-idle memory trend lines belong to the soak campaign; current evidence covers bounded short-interval observation.
