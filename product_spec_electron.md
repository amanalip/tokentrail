# Token Trail Electron Product Specification

**Status:** Approved controlling implementation specification
**Product stage:** Phase 2 core read-only slice complete locally
**Primary release:** Linux desktop
**Framework:** Hardened Electron application
**Tagline:** Understand your Codex usage.
**Last updated:** August 14, 2026 at 11:01 AM EDT (`America/Toronto`, UTC-04:00)

This document defines the controlling Electron direction and implementation boundary for Token Trail. Phases 1 and 2 are complete locally: the hardened foundation now carries a tested, normalized, read-only Codex-to-Overview path. Publication, signing, update deployment, telemetry, and access beyond the listed read-only Codex methods remain separately gated.

**Naming rule:** The product name shown to people is **Token Trail**, with a space. The repository and machine-facing identifiers may remain `tokentrail`, while conventional source identifiers may use `TokenTrail`. Window titles, headings, menus, onboarding, logo wordmarks, accessibility names, desktop metadata, documentation, screenshots, and release copy must use **Token Trail**.

The inherited KDE proposal remains in [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) as a historical alternative. The approved framework decision and its reasoning are recorded in [design_decisions.md](design_decisions.md).

## Contents

- [1. Executive summary](#1-executive-summary)
- [2. Product principles](#2-product-principles)
- [3. Intended users and jobs](#3-intended-users-and-jobs)
- [4. Scope model](#4-scope-model)
- [5. Feature catalog](#5-feature-catalog)
- [6. Product requirements](#6-product-requirements)
- [7. Information architecture](#7-information-architecture)
- [8. Interface specifications](#8-interface-specifications)
- [9. Visual design system](#9-visual-design-system)
- [10. Accessibility and internationalization](#10-accessibility-and-internationalization)
- [11. Technical stack and selection reasoning](#11-technical-stack-and-selection-reasoning)
- [12. Application architecture](#12-application-architecture)
- [13. Codex integration and compatibility](#13-codex-integration-and-compatibility)
- [14. Domain model and metric rules](#14-domain-model-and-metric-rules)
- [15. Security specification](#15-security-specification)
- [16. Privacy and data retention](#16-privacy-and-data-retention)
- [17. Linux compatibility and desktop integration](#17-linux-compatibility-and-desktop-integration)
- [18. Packaging, updates, and release integrity](#18-packaging-updates-and-release-integrity)
- [19. Performance and resource budgets](#19-performance-and-resource-budgets)
- [20. Error handling and resilience](#20-error-handling-and-resilience)
- [21. Testing strategy](#21-testing-strategy)
- [22. Observability and diagnostics](#22-observability-and-diagnostics)
- [23. Development workflow and repository shape](#23-development-workflow-and-repository-shape)
- [24. Delivery phases](#24-delivery-phases)
- [25. Acceptance criteria](#25-acceptance-criteria)
- [26. Risks and mitigations](#26-risks-and-mitigations)
- [27. Open questions](#27-open-questions)
- [28. Reference links](#28-reference-links)
- [29. Approval boundary](#29-approval-boundary)

## 1. Executive summary

Token Trail is a privacy-first desktop dashboard that helps a person understand locally available Codex usage information. It answers four practical questions:

1. How much of each reported quota window has been used?
2. When will each reported window reset?
3. What token activity and credit information is available?
4. Which values came from Codex, which were observed locally, and which were calculated by Token Trail?

Electron is the approved application framework because Token Trail benefits from a highly visual, branded analytics interface and broad Linux desktop coverage. The choice does not mean the renderer receives desktop privileges. The renderer is treated like an untrusted web page, even though its files are bundled locally.

The v1 application is read-only. It does not send prompts, operate on tasks, change an account, consume credits, collect credentials, upload analytics, or retain usage history. Codex authentication remains owned by Codex.

The first public target is mainstream 64-bit Linux on x64 and arm64, covering KDE Plasma, GNOME, Cinnamon, and Xfce on current distributions using Wayland or X11. “Works on Linux” is a tested compatibility promise, not a claim that every distribution, architecture, compositor, or security policy can be supported.

## 2. Product principles

### 2.1 Report facts without pretending to know more

Every metric carries one of four provenance states:

- **Codex-reported:** received from the local Codex app-server.
- **Locally observed:** produced by Token Trail from local runtime state, such as the refresh time.
- **Calculated:** deterministically calculated from named inputs.
- **Unavailable:** missing, invalid, unsupported, or not safe to infer.

Token Trail does not rename a quota window “weekly” merely because one current account happens to report a similar duration. It displays the reported duration and uses a friendly label only when the duration supports it.

### 2.2 Local and minimal by default

The app requests only the account, rate-limit, and aggregate usage fields needed for visible features. It does not request task lists, prompts, responses, repository data, or file paths. Nothing is sent to the Token Trail project.

### 2.3 Security is an architecture property

Security is not a final audit added after development. Process separation, a deny-by-default method allowlist, runtime validation, narrow IPC, local-only content, dependency review, and release integrity are part of the initial design.

### 2.4 Rich visuals must remain understandable

Charts support the explanation but never become the only representation of a value. Tables, labels, keyboard interaction, textual summaries, and reduced-motion behavior remain first-class.

### 2.5 Missing data is a valid state

The interface explains partial, delayed, incompatible, signed-out, and unavailable states. It does not replace missing values with zero or hide important gaps.

### 2.6 The user remains in control

Refresh, diagnostic export, clearing settings, background behavior, notifications, and any future local history are explicit user choices. Destructive actions require confirmation. No future feature silently broadens data collection.

## 3. Intended users and jobs

### 3.1 Primary user

The primary user runs Codex on Linux and wants a clear view of usage without studying protocol payloads or interpreting several rolling limits manually. The interface assumes basic desktop familiarity but no knowledge of APIs, token accounting, or rate-limit terminology.

### 3.2 Secondary users

- A developer troubleshooting why Codex appears limited.
- A team member trying to understand a reported spend control without changing it.
- A privacy-conscious user who wants a local dashboard and inspectable diagnostic export.
- A future Windows or macOS user, after platform-specific integration and packaging are verified.

### 3.3 Core jobs

- Check current status in less than ten seconds.
- See every reported quota bucket without one being silently selected as the truth.
- Understand reset timing in local time and as a countdown.
- Compare recent aggregate token activity without equating tokens to quota percentage.
- Distinguish included usage, spending controls, and reset credits.
- Understand why a value is unavailable.
- Produce a redacted diagnostic snapshot when asking for help.

## 4. Scope model

### 4.1 Release labels

| Label | Meaning |
| --- | --- |
| v1 required | Must be complete before the first public-ready release. |
| v1 optional | May ship in v1 only if required behavior is already stable and tested. |
| Later opt-in | Valuable after v1, but requires a separate decision or explicit consent. |
| Rejected | Conflicts with the current product purpose or privacy boundary. |

### 4.2 v1 required scope

- Onboarding and Codex connection status.
- Overview, Quota Windows, Usage, Credits, Learn, and Settings and Diagnostics screens.
- Read-only account, rate-limit, and aggregate usage access.
- Provenance for displayed metrics.
- Manual refresh and conservative automatic refresh.
- Light, dark, and system theme modes.
- Keyboard and screen-reader access.
- Redacted, previewable diagnostic export.
- Linux x64 and arm64 release artifacts where build infrastructure supports them.
- AppImage, deb, rpm, and Pacman packages, subject to release verification.
- Strict Electron security settings and security acceptance tests.
- A reset timeline, quota attention ordering, and combined capacity summary derived only from valid current rate-limit and credit fields.
- Current-session change tracking held only in memory.
- Complete-period comparisons, calendar activity heatmap, descriptive activity statistics, and source-coverage reporting derived only from supplied daily buckets.
- Reset-credit expiry visibility derived from valid reported expiry timestamps.

### 4.3 v1 optional scope

- A system tray status icon.
- Native notifications for meaningful threshold changes.
- Start at login.
- A compact window mode.

These features are optional because background processes, notifications, and autostart introduce lifecycle, consent, packaging, and desktop-environment work. Their absence must not weaken the main dashboard.

### 4.4 Later opt-in scope

- User-controlled local history with an explicit retention period.
- Long-term trend comparison, burn rate, forecast, and confidence ranges based on separately approved retained history.
- Local encrypted backups and user-initiated import or export.
- Custom dashboard card ordering.
- Additional languages and right-to-left layout testing.
- Signed Windows and notarized macOS releases.
- Flatpak after a safe host Codex connection design is proven.
- A Plasma widget or browser companion only as separate, minimal clients.

### 4.5 Rejected or separately governed scope

- Reading, showing, storing, or analyzing prompts and responses.
- Task, project, repository, branch, file, tool-call, or subagent analytics in v1.
- Sending prompts or controlling Codex tasks.
- Redeeming reset credits or changing account settings.
- Browser-cookie scraping.
- Reading or copying authentication secrets.
- Developer telemetry, advertising, tracking pixels, remote fonts, or remote UI code.
- Claiming OpenAI API billing coverage or treating Codex plan limits as API rate limits.
- Forecasts based on fabricated or insufficient history.

## 5. Feature catalog

### 5.1 Overview

- Plain-language status sentence.
- Primary quota card with an explanation of how it was selected.
- Compact cards for all other reported buckets.
- Used and remaining percentage, reset time, and countdown.
- Today and lifetime token summaries when available.
- Credit or spending warning when reported.
- Last successful refresh, freshness state, and connection state.
- Direct links to details and contextual explanations.
- A “Next changes” timeline containing only valid future reset timestamps reported by Codex.
- A quota attention list grouped by reported bucket and ordered by explicit bucket-level reached state, window percentage, and reset time without predicting exhaustion.
- A combined capacity summary that keeps quota, spending controls, credit balance, and reset credits in their original units.
- Changes observed since the current Token Trail process opened, clearly labeled as an in-memory local observation.

### 5.2 Quota Windows

- Group by reported `limitId`.
- Preserve reported primary and secondary designations.
- Sort deterministically without hiding unknown buckets.
- Show window duration, used percentage, calculated remaining percentage, reset timestamp, and countdown.
- Explain reached-limit and spend-control states.
- Show per-field provenance and raw-safe detail, not raw protocol payloads.
- Provide a chronological reset timeline across all valid windows.
- Provide deterministic bucket and window attention ordering without inventing severity or assigning a bucket-level reached state to one window.
- Show the current-session percentage change for a window only after Token Trail has observed two valid snapshots of that same identified window.

### 5.3 Usage

- Daily token activity chart for the range supplied by Codex.
- Accessible table containing the same daily values.
- Today, current local calendar week, current local calendar month, trailing 7-day, and trailing 30-day totals when source coverage is sufficient.
- Lifetime tokens, peak daily tokens, current streak, longest streak, and longest-running turn when reported.
- Range selection limited to source coverage.
- Persistent explanation that token totals and quota usage are different measurements.
- A calendar heatmap in which reported zero, reported positive activity, and missing dates are visually and textually distinct.
- Latest complete 7-day period versus the preceding complete 7-day period.
- Latest complete 30-day period versus the preceding complete 30-day period when at least 60 consecutive dated buckets are supplied.
- Descriptive statistics for the selected supplied range: total, daily average, active-day average, median, highest supplied day, and active-day count.
- A data-coverage card that lists requested dates, supplied dates, missing dates, and which calculations are available.
- Changes in aggregate token totals observed since Token Trail opened, kept only in memory and never presented as account history.

### 5.4 Credits and spending controls

- Credit availability, balance, and unlimited state.
- Individual limit, amount used, remaining percentage, reached state, and reset time.
- Reset-credit count and safe metadata when reported.
- Read-only notices where a user might otherwise expect a purchase or redeem action.
- Neutral unavailable state when the account does not report credit information.
- Sort available reset credits by valid expiry time, with non-expiring and unknown-expiry credits kept distinct.
- Show exact remaining time for a future expiry and an “expires within 7 days” notice based on a documented fixed display rule.
- Include credit and spending-control states in the combined capacity summary without converting them into quota percentage or a synthetic score.

### 5.5 Derived insight reliability rules

The new v1 insights use only the already approved `account/rateLimits/read`, `account/rateLimits/updated`, and `account/usage/read` data. They do not add a Codex method, task read, local history database, or network request.

- A derived value is calculated only from valid source fields named in its provenance detail.
- Missing daily dates remain missing. They are never changed to zero.
- A comparison requires complete coverage of both periods. Otherwise the comparison is unavailable and the coverage card explains why.
- Current-session changes begin at the first valid snapshot observed after Token Trail opens and disappear when the process exits.
- Quota attention ordering is not an exhaustion forecast and does not claim that a user will be blocked.
- A reached state appears only when Codex reports it and remains attached to the reported bucket unless the protocol explicitly identifies a narrower scope.
- Combined capacity is a grouped explanation, not arithmetic across unlike units.
- “Highest day” means the highest day in the supplied selected range. It is not called the lifetime peak date unless Codex supplies that date.
- Expiry notices use the reported timestamp. An expiry that is missing or already invalid is not estimated.

### 5.6 Learn

- How rolling quota windows work.
- Why reported percentages can change unevenly.
- Why token totals do not directly equal quota consumption.
- Included usage versus purchased or granted credits.
- Codex plan usage versus OpenAI API billing and rate limits.
- Provenance glossary.
- Privacy and security explanation in plain language.
- Contextual deep links from metrics to the relevant explanation.
- How current-session changes differ from retained history.
- How period completeness, missing dates, averages, medians, and comparisons are calculated.
- Why quota attention ordering is not a forecast or blocking prediction.
- Why quota, credits, spending controls, and reset credits are displayed together but not added together.

### 5.7 Settings

- Theme: system, light, or dark.
- Automatic refresh on or off.
- Refresh interval within an enforced safe range.
- 12-hour, 24-hour, or system time display.
- Number formatting and compact-number preference.
- Reduced motion: system, reduced, or full.
- Optional notifications with per-event controls.
- Optional tray and start-at-login controls if those features ship.
- Clear Token Trail data with confirmation.

### 5.8 Diagnostics

- Token Trail version and build identity.
- Electron, Chromium, and Node versions in a non-sensitive technical section.
- Operating system, architecture, session type when safely detectable, and theme mode.
- Codex discovery state and reported CLI version.
- Supported read capabilities and unsupported capabilities.
- Last refresh category and sanitized error.
- Redacted snapshot preview before save.
- Explicit export location chosen through a native save dialog.
- Copy-safe support summary that contains no paths, identifiers, or payload content.
- Coverage diagnostics containing counts and date bounds, but not raw usage buckets.
- Current-session observation start time and snapshot count, without persisting the snapshots.

### 5.9 Optional background features

- Tray tooltip with the selected quota's remaining percentage and reset time.
- Tray menu: Open Token Trail, Refresh, Pause automatic refresh, and Quit.
- Notification events: newly reached limit, reset observed, connection lost for a sustained period, or credit/spend warning.
- Rate limiting and deduplication so repeated refreshes do not create notification spam.
- Background behavior disabled by default in v1 unless onboarding explains it clearly.

## 6. Product requirements

### 6.1 Functional requirements

| ID | Requirement |
| --- | --- |
| FR-001 | The app shall display every valid quota bucket returned by an approved read operation. |
| FR-002 | The app shall show reported and calculated values with their provenance. |
| FR-003 | The app shall never call a Codex mutation from production code. |
| FR-004 | The app shall handle missing fields and unknown enum values without crashing or guessing. |
| FR-005 | The app shall retain the last valid in-memory snapshot during a temporary refresh failure and clearly mark it stale. |
| FR-006 | The app shall expose manual refresh and a bounded automatic refresh interval. |
| FR-007 | The app shall show local reset time and a countdown derived from the same timestamp. |
| FR-008 | The app shall provide a textual equivalent for every chart. |
| FR-009 | The app shall preview redacted diagnostics before saving them. |
| FR-010 | The app shall work without a Token Trail account or Token Trail network service. |
| FR-011 | The app shall display one reset-timeline item for each valid reported future reset and shall not estimate a missing reset. |
| FR-012 | The app shall order quota attention deterministically, reserve reached-state language for a state reported by Codex, and shall not attribute a bucket-level reached state to one window. |
| FR-013 | The app shall keep current-session deltas in memory only and clear them when the Token Trail process exits. |
| FR-014 | The app shall compare two calendar periods only when every required date in both periods is supplied. |
| FR-015 | The app shall distinguish a reported zero-activity date from a missing date in charts, tables, statistics, and accessible descriptions. |
| FR-016 | The app shall label descriptive statistics with the exact supplied range and shall not present a range maximum as the lifetime peak date. |
| FR-017 | The app shall explain source coverage and the availability of each derived calculation. |
| FR-018 | The app shall derive reset-credit expiry notices only from valid reported expiry timestamps. |
| FR-019 | The app shall not add or normalize quota percentages, currency or credit strings, spending controls, and reset-credit counts into one score. |
| FR-020 | The app shall display the product name as `Token Trail`; the `tokentrail` slug is limited to machine-facing identifiers. |

### 6.2 Non-functional requirements

| ID | Requirement |
| --- | --- |
| NFR-001 | No renderer shall have Node integration. |
| NFR-002 | Every renderer shall use context isolation and Chromium sandboxing. |
| NFR-003 | Production content shall be packaged locally and governed by a restrictive Content Security Policy. |
| NFR-004 | IPC shall be narrow, typed, sender-validated, size-bounded, and runtime-validated. |
| NFR-005 | The main process shall enforce a deny-by-default Codex method allowlist. |
| NFR-006 | The application shall send no developer telemetry. |
| NFR-007 | All primary workflows shall be operable by keyboard. |
| NFR-008 | Color shall not be the only carrier of meaning. |
| NFR-009 | A supported Electron major and current security patches shall be required for release. |
| NFR-010 | Release artifacts shall have checksums and reproducible build metadata where practical. |

## 7. Information architecture

The primary navigation uses six destinations. Settings and Diagnostics share one destination with two tabs because both concern local application state rather than usage analysis.

```text
Token Trail
|
+-- Overview
+-- Quota Windows
+-- Usage
+-- Credits
+-- Learn
`-- Settings & Diagnostics
    |-- Preferences
    `-- Diagnostics
```

Navigation rules:

- Overview opens by default.
- Browser-style remote navigation is not used.
- Internal routes are a local UI state mechanism only.
- Back and forward mouse buttons may move through local screen history, but cannot load a URL.
- Deep links, if added later, use a registered custom protocol with a strict action allowlist and no arbitrary parameters.
- External documentation links open only after validation against an explicit HTTPS origin allowlist. The app never embeds those pages.

## 8. Interface specifications

ASCII layouts show hierarchy and behavior, not final pixel dimensions. Text must reflow rather than being truncated solely to match these sketches.

### 8.1 Application shell, wide layout

```text
+--------------------------------------------------------------------------------+
| [Token Trail mark] Token Trail                    Updated 5:42 PM   [Refresh] [⋮] |
+----------------------+---------------------------------------------------------+
|                      |                                                         |
|  ● Overview          |  Page title                                      [?]   |
|  ○ Quota Windows     |  Short explanation of this page                         |
|  ○ Usage             |                                                         |
|  ○ Credits           |  +---------------------------------------------------+  |
|  ○ Learn             |  |                                                   |  |
|                      |  |                 Page content                      |  |
|  ○ Settings          |  |                                                   |  |
|                      |  +---------------------------------------------------+  |
|                      |                                                         |
|  Codex: Connected    |  Data source: Local Codex     [What does this mean?]    |
+----------------------+---------------------------------------------------------+
```

### 8.2 Application shell, narrow layout

```text
+--------------------------------------------------+
| [≡] Token Trail              Updated now [Refresh]|
+--------------------------------------------------+
| Overview                                         |
| What is my Codex usage status?                   |
|                                                  |
| +----------------------------------------------+ |
| | Primary content                              | |
| +----------------------------------------------+ |
|                                                  |
+--------------------------------------------------+
| Overview | Quotas | Usage | Credits | More       |
+--------------------------------------------------+
```

At narrow widths the sidebar becomes a bottom navigation bar. Learn, Settings, and Diagnostics appear under More. The minimum supported window width is defined during prototype testing; the starting target is 720 CSS pixels for the full desktop layout and 520 CSS pixels for the compact layout.

### 8.3 First-run welcome

```text
+------------------------------------------------------------------+
|                         [Tracked Trail mark]                      |
|                                                                  |
|                     Welcome to Token Trail                        |
|         Understand locally available Codex usage clearly.        |
|                                                                  |
|  Token Trail reads only account, quota, and aggregate usage data. |
|  It does not read prompts, responses, projects, or credentials.  |
|  Nothing is sent to the Token Trail project.                       |
|                                                                  |
|  [Review privacy details]                         [Connect Codex] |
+------------------------------------------------------------------+
```

“Connect Codex” means discovering or starting the local app-server and asking it for approved read data. It does not perform sign-in on the user's behalf.

### 8.4 Codex unavailable or signed out

```text
+------------------------------------------------------------------+
| Codex connection                                                 |
|                                                                  |
|  [!] Token Trail could not read Codex usage.                      |
|                                                                  |
|  Status: Codex is installed, but no supported account session    |
|  is available. Sign in through Codex, then try again.             |
|                                                                  |
|  [Try again]   [Open troubleshooting]                             |
|                                                                  |
|  Token Trail will not ask for or store your credentials.          |
+------------------------------------------------------------------+
```

### 8.5 Overview, normal state

```text
+--------------------------------------------------------------------------------+
| Overview                                             Updated 18 seconds ago     |
| Your reported Codex windows are currently available.                           |
|                                                                                |
| +--------------------------------------+ +-----------------------------------+  |
| | PRIMARY WINDOW                      | | TODAY                             |  |
| | 68% remaining                       | | 124,500 tokens                    |  |
| | [████████░░░░░░░░░░░░] 32% used    | | Codex-reported daily bucket      |  |
| | Resets Thu, 9:00 PM  (3h 17m)       | +-----------------------------------+  |
| | Codex-reported usage, calculated    | +-----------------------------------+  |
| | remaining             [Why primary?]| | LIFETIME                          |  |
| +--------------------------------------+ | 4.2M tokens                       |  |
|                                          | Codex-reported                    |  |
| +--------------------------------------+ +-----------------------------------+  |
| | OTHER REPORTED WINDOWS              |                                        |
| | Secondary  41% remaining  Reset 2d  |  [View all quota windows]             |
| +--------------------------------------+                                        |
|                                                                                |
| Tokens and quota percentage measure different things. [Learn why]              |
+--------------------------------------------------------------------------------+
```

### 8.6 Overview, warning and stale state

```text
+--------------------------------------------------------------------------------+
| [!] Showing data from 5:31 PM. The latest refresh failed.        [Try again]   |
|                                                                                |
| +--------------------------------------+                                        |
| | PRIMARY WINDOW                      |  Last known value                      |
| | 4% remaining                        |  Connection interrupted                |
| | [███████████████████░] 96% used     |  Details are available in Diagnostics  |
| | Reset time from last valid snapshot |                                        |
| +--------------------------------------+                                        |
+--------------------------------------------------------------------------------+
```

Stale data keeps its original timestamp. A failed refresh never changes its age to “now.”

### 8.7 Quota Windows

```text
+--------------------------------------------------------------------------------+
| Quota Windows                                    [All buckets v] [Refresh]     |
| Every window reported by Codex, grouped by limit identifier.                   |
|                                                                                |
| CODEX                                                                          |
| +----------------------------------+ +---------------------------------------+  |
| | Primary                          | | Secondary                             |  |
| | 32% used      68% remaining      | | 59% used       41% remaining          |  |
| | Duration: 300 minutes            | | Duration: 10,080 minutes              |  |
| | Reset: Thu, 9:00 PM              | | Reset: Sat, 2:00 AM                   |  |
| | In: 3h 17m                       | | In: 2d 8h                             |  |
| | [How these values were derived]  | | [How these values were derived]       |  |
| +----------------------------------+ +---------------------------------------+  |
|                                                                                |
| Status: No reached limit reported                                               |
| Plan: Pro                                     Source snapshot: 5:42:18 PM      |
+--------------------------------------------------------------------------------+
```

### 8.8 Metric provenance popover

```text
+------------------------------------------------------+
| 68% remaining                                       |
|                                                      |
| Provenance: Calculated by Token Trail                 |
| Calculation: 100 minus reported used percentage     |
| Input: 32% used                                     |
| Validation: Input was within the expected range     |
|                                                      |
| [Read about provenance]                    [Close]   |
+------------------------------------------------------+
```

### 8.9 Usage screen

```text
+--------------------------------------------------------------------------------+
| Usage                                          [Last 30 days v] [Table view]   |
| Aggregate token activity reported by Codex.                                    |
|                                                                                |
| +----------+ +----------+ +----------+ +----------+                            |
| | Today    | | 7 days   | | 30 days  | | Lifetime |                            |
| | 124.5K   | | 812.3K   | | 3.1M     | | 4.2M     |                            |
| +----------+ +----------+ +----------+ +----------+                            |
|                                                                                |
| Tokens                                                                         |
| 180K |                       ●                                                  |
| 120K |       ●        ●    /  \       ●                                        |
|  60K |  ●  /  \  ●  /  \  /    \  ● / \  ●                                   |
|   0  +----------------------------------------------------------------         |
|        Jul 15                 Jul 29                    Aug 13                  |
|                                                                                |
| [i] Token totals do not directly determine quota percentage. [Learn why]       |
|                                                                                |
| Current streak: 8 days   Longest: 19 days   Longest turn: 42 min              |
+--------------------------------------------------------------------------------+
```

### 8.10 Usage table and partial range

```text
+------------------------------------------------------------------+
| Daily usage                                     [Chart view]     |
| [!] The source covers 18 of the requested 30 days.               |
|                                                                  |
| Date              Tokens                  Provenance              |
| Aug 13, 2026      124,500                 Codex-reported          |
| Aug 12, 2026       91,210                 Codex-reported          |
| Aug 11, 2026            0                 Codex-reported          |
| ...                                                              |
|                                                                  |
| 30-day total: Unavailable because the source range is incomplete |
+------------------------------------------------------------------+
```

Zero is shown only when Codex reports a dated bucket containing zero. A missing date is not automatically converted to zero.

### 8.11 Credits

```text
+--------------------------------------------------------------------------------+
| Credits and spending                                                           |
| Read-only information reported for this account.                               |
|                                                                                |
| +--------------------------------------+ +-----------------------------------+  |
| | CREDIT BALANCE                       | | INDIVIDUAL SPENDING CONTROL       |  |
| | $18.40                               | | 72% remaining                     |  |
| | Available                            | | Used $7.00 of $25.00              |  |
| | Codex-reported                       | | Resets Sep 1 at 12:00 AM          |  |
| +--------------------------------------+ +-----------------------------------+  |
|                                                                                |
| RESET CREDITS                                                                  |
| 2 available                                                                    |
| +----------------------------------------------------------------------------+ |
| | Extended session reset                 Expires Aug 20        Available      | |
| | Backend-provided description, safely rendered as plain text                | |
| +----------------------------------------------------------------------------+ |
|                                                                                |
| Token Trail cannot purchase, transfer, or redeem credits.                       |
+--------------------------------------------------------------------------------+
```

### 8.12 Learn

```text
+--------------------------------------------------------------------------------+
| Learn                                                                          |
|                                                                                |
| [Search explanations.........................................................] |
|                                                                                |
| Usage basics                  Limits and resets           Privacy and sources  |
| +--------------------------+  +------------------------+  +------------------+ |
| | Tokens vs quota         >|  | Rolling windows      >|  | What is read    >| |
| | Included vs credits    >|  | When a limit is hit >|  | Provenance      >| |
| | Codex vs API usage     >|  | Reset countdown     >|  | Diagnostics     >| |
| +--------------------------+  +------------------------+  +------------------+ |
+--------------------------------------------------------------------------------+
```

Search is local over packaged text. It does not send a query to a remote search service.

### 8.13 Settings

```text
+--------------------------------------------------------------------------------+
| Settings                                                                       |
|                                                                                |
| Appearance                                                                     |
| Theme                         (●) System  ( ) Light  ( ) Dark                   |
| Motion                        (●) System  ( ) Reduced ( ) Full                  |
| Time format                   [System default v]                               |
|                                                                                |
| Refresh                                                                        |
| Automatic refresh              [on ]                                            |
| Interval                       [5 minutes v]                                    |
|                                                                                |
| Background, if available                                                     |
| Show tray icon                  [off]                                            |
| Notify when a limit is reached  [off]                                            |
| Start at login                  [off]                                            |
|                                                                                |
| Local data                                                                    |
| Token Trail stores preferences, not usage history.              [Clear data]    |
+--------------------------------------------------------------------------------+
```

### 8.14 Diagnostics

```text
+--------------------------------------------------------------------------------+
| Settings & Diagnostics       [Preferences] [Diagnostics]                       |
|                                                                                |
| CONNECTION                                                                     |
| Codex executable        Found                                                   |
| Codex version           0.x.y, observed locally                                 |
| Account read            Supported                                               |
| Rate limits read        Supported                                               |
| Aggregate usage read    Supported                                               |
| Last refresh            Success at 5:42:18 PM                                  |
|                                                                                |
| APPLICATION                                                                    |
| Token Trail              1.0.0                                                   |
| Platform                Linux x64, Wayland                                      |
| Runtime                 Electron / Chromium versions                            |
|                                                                                |
| DIAGNOSTIC EXPORT                                                              |
| Unknown fields and sensitive values are removed.                               |
| [Preview redacted snapshot]                         [Export after preview]      |
+--------------------------------------------------------------------------------+
```

### 8.15 Diagnostic preview dialog

```text
+--------------------------------------------------------------------------+
| Preview redacted diagnostic snapshot                              [x]    |
|                                                                          |
| {                                                                        |
|   "tokenTrailVersion": "1.0.0",                                        |
|   "platform": "linux-x64",                                             |
|   "codexVersion": "0.x.y",                                             |
|   "capabilities": ["account", "rateLimits", "aggregateUsage"],        |
|   "lastErrorCategory": null                                             |
| }                                                                        |
|                                                                          |
| Excluded: credentials, email, IDs, paths, prompts, responses, raw data   |
|                                                                          |
| [Cancel]                                              [Choose save file] |
+--------------------------------------------------------------------------+
```

### 8.16 Clear-data confirmation

```text
+--------------------------------------------------------------+
| Clear Token Trail data?                                       |
|                                                              |
| This removes preferences, cached compatibility information,  |
| and Token Trail logs. It does not modify Codex or your account.|
|                                                              |
| [Cancel]                                   [Clear local data] |
+--------------------------------------------------------------+
```

### 8.17 Tray menu, optional

```text
+----------------------------------+
| Token Trail                       |
| 68% remaining, resets in 3h 17m |
|----------------------------------|
| Open Token Trail                  |
| Refresh now                      |
| Pause automatic refresh          |
|----------------------------------|
| Quit                             |
+----------------------------------+
```

Linux tray activation differs between desktop environments, so every tray action must also exist in the main window.

### 8.18 Global state matrix

| State | Visible treatment | Allowed actions |
| --- | --- | --- |
| Starting | Branded shell and progress text | Quit |
| Discovering Codex | Connection progress with privacy reminder | Cancel, troubleshooting |
| Signed out | Explanation without credential form | Retry after signing in through Codex |
| Unsupported | Capability explanation | Retry, diagnostics, export |
| Loading first snapshot | Screen skeletons with meaningful labels | Cancel refresh |
| Ready | Full current data | Navigate, refresh, settings |
| Partial | Available sections plus explicit gaps | Refresh, inspect provenance |
| Refreshing | Existing data remains visible with progress | Cancel only if transport supports it safely |
| Stale | Last valid data with original timestamp and warning | Retry, diagnostics |
| Error without data | Error category and next step | Retry, diagnostics |
| Offline | Local connection explanation | Retry |

### 8.19 Reset timeline and quota attention

```text
+--------------------------------------------------------------------------------+
| Next changes                                                                   |
| Valid future reset times reported by Codex, ordered chronologically.           |
|                                                                                |
| NOW       Primary window          32% used        68% remaining                |
|   |                                                                            |
| 3h 17m    Primary resets          Thu, Aug 13 at 9:00 PM                       |
|   |                                                                            |
| 2d 8h     Secondary resets        Sat, Aug 15 at 2:00 AM                       |
|   |                                                                            |
| Unknown   Other window            No reset time was reported                   |
|                                                                                |
| [View all windows]                         Calculated ordering from reset times |
+--------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------+
| Quota attention                                                                |
| Ordered to make the most constrained reported windows easy to find.            |
|                                                                                |
| 1  OTHER BUCKET      REACHED STATE REPORTED                                    |
|      Primary window                    100% used   Reset in 28m                 |
| 2  CODEX BUCKET                                                               |
|      Primary window                     96% used   Reset in 3h 17m              |
|      Secondary window                   59% used   Reset in 2d 8h               |
|                                                                                |
| The reached state applies to its reported bucket, not an assumed window.        |
| This order does not predict future use or guarantee that a task will run.       |
+--------------------------------------------------------------------------------+
```

Attention ordering uses this stable sequence:

1. Bucket groups with a Codex-reported reached state.
2. Remaining bucket groups by the highest valid `usedPercent` among their windows.
3. Windows inside each bucket by descending valid `usedPercent`.
4. Equal percentages by earliest valid future reset.
5. Remaining ties by stable normalized bucket and window identifiers.
6. Buckets and windows missing a valid percentage after entries that contain one.

The interface does not assign “safe,” “danger,” or “comfortable” labels from percentage alone. A progress color may reflect the numeric range, but the text always states the reported percentage and never treats color as a prediction.

### 8.20 Current-session changes

```text
+--------------------------------------------------------------------------------+
| Changes since Token Trail opened                                    [What is this?]|
| Observation started today at 5:42:18 PM   4 valid snapshots                    |
|                                                                                |
| Primary window used       28%  ->  32%       +4 percentage points              |
| Secondary window used     59%  ->  59%        No observed change               |
| Lifetime tokens           4,201,400 -> 4,203,910   +2,510 tokens               |
| Today                     121,990 -> 124,500       +2,510 tokens               |
|                                                                                |
| Local observation only. This is not retained account history.                  |
| Values clear when Token Trail exits.                                             |
+--------------------------------------------------------------------------------+
```

Rules:

- The baseline is the first valid normalized snapshot observed by the current Token Trail process.
- A delta appears only when the baseline and current value refer to the same stable metric identity and both values are valid.
- Quota change is expressed in percentage points, not percent change.
- A reset between observations starts a new baseline for that window when a changed reset timestamp or a defensible reset transition is observed. The app does not display a misleading negative “usage” delta across a reset.
- Aggregate token counters display a delta only when the current value is greater than or equal to the baseline. A decrease is shown as “source value changed” and not interpreted.
- Snapshot bodies are not written to disk, included in logs, or exported.

### 8.21 Usage comparison and calendar heatmap

```text
+--------------------------------------------------------------------------------+
| Usage patterns                                          [Calendar] [Table]     |
| Supplied aggregate daily buckets only.                                        |
|                                                                                |
| AUGUST 2026                                                                   |
| Mon   Tue   Wed   Thu   Fri   Sat   Sun                                        |
|                          1░    2·                                              |
|  3▒    4▓    5▒    6·    7░    8?    9▒                                      |
| 10▓   11▒   12▓   13▓                                                          |
|                                                                                |
| · Reported zero   ░ Low   ▒ Medium   ▓ Higher within selected range           |
| ? Missing date, activity unknown                                               |
|                                                                                |
| COMPLETE PERIOD COMPARISON                                                     |
| Aug 7 to Aug 13          812,300 tokens                                        |
| Jul 31 to Aug 6          746,900 tokens                                        |
| Difference               +65,400 tokens                                        |
| Relative change          +8.8%                                                 |
|                                                                                |
| Both 7-day periods contain all 14 required dated buckets. [Calculation]        |
+--------------------------------------------------------------------------------+
```

Heatmap intensity is calculated relative to valid positive values in the selected supplied range. It communicates distribution within that range, not quota pressure. Every cell has an accessible date, reported token value or missing status, and provenance. Missing cells use a pattern and label that cannot be confused with reported zero.

Comparison rules:

- The latest period ends on the latest valid supplied date, not automatically today.
- A 7-day comparison requires 14 consecutive calendar dates ending on that date.
- A 30-day comparison requires 60 consecutive calendar dates.
- The absolute difference is `latest total - preceding total`.
- Relative change is `(latest - preceding) / preceding * 100` only when the preceding total is greater than zero.
- If both totals are zero, the interface says “No activity in either complete period.”
- If the preceding total is zero and the latest is positive, the absolute difference is shown and relative change is unavailable. It does not display infinity or “100% increase.”

### 8.22 Activity statistics and coverage

```text
+--------------------------------------------------------------------------------+
| Activity statistics                         Selected supplied range: 30 days   |
|                                                                                |
| +------------------+ +------------------+ +------------------+                  |
| | Total            | | Daily average    | | Active-day avg   |                  |
| | 3,104,200        | | 103,473          | | 124,168          |                  |
| +------------------+ +------------------+ +------------------+                  |
| +------------------+ +------------------+ +------------------+                  |
| | Median day       | | Highest supplied | | Active days      |                  |
| | 91,210           | | 180,400, Aug 4   | | 25 of 30         |                  |
| +------------------+ +------------------+ +------------------+                  |
|                                                                                |
| Highest supplied day is not necessarily the lifetime peak day.                 |
| [Show formulas and source coverage]                                             |
+--------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------+
| Data coverage                                                                  |
|                                                                                |
| Requested range             Jul 15 to Aug 13, 30 calendar days                 |
| Valid dated buckets         30 of 30                                            |
| Reported zero days           5                                                  |
| Missing dates                0                                                  |
| Rejected invalid buckets     0                                                  |
|                                                                                |
| Available: total, averages, median, heatmap, 7-day comparison                  |
| Unavailable: 30-day comparison requires 60 consecutive dates                   |
|                                                                                |
| Coverage describes the data Token Trail received. It does not inspect tasks.     |
+--------------------------------------------------------------------------------+
```

Statistics rules:

- Total is the exact sum of valid supplied buckets in the labeled range.
- Daily average is total divided by all supplied dated buckets, including reported zero days.
- Active-day average is total divided only by supplied buckets greater than zero. It is unavailable when there are no active days.
- Median sorts all valid supplied values, including reported zeros. For an even count it is the arithmetic mean of the two middle values, formatted without losing precision.
- Highest supplied day is the maximum valid supplied bucket. Ties list the earliest date in the compact card and expose all tied dates in details.
- Active-day count is the number of valid supplied buckets greater than zero.
- Duplicate dates, invalid dates, negative values, and unsafe values are rejected and counted in coverage diagnostics. They never silently participate in calculations.

### 8.23 Combined capacity and reset-credit expiry

```text
+--------------------------------------------------------------------------------+
| Current reported capacity                                                      |
| Separate account signals shown together without combining unlike units.        |
|                                                                                |
| QUOTA WINDOWS                                                                  |
| Primary                 68% remaining                  Resets in 3h 17m          |
| Secondary               41% remaining                  Resets in 2d 8h           |
|                                                                                |
| WORKSPACE CREDITS                                                              |
| Balance                 $18.40                         Codex-reported string     |
|                                                                                |
| INDIVIDUAL CONTROL                                                             |
| Remaining               72%                            Resets Sep 1              |
|                                                                                |
| EARNED RESET CREDITS                                                           |
| 2 available                                                                    |
| [!] 1 expires in 4d 6h on Aug 17 at 11:00 PM                                  |
| 1 has no reported expiry                                                       |
|                                                                                |
| Summary: No reached limit was reported. One reset credit expires within 7 days.|
| [View quota details] [View credit details] [How this summary works]            |
+--------------------------------------------------------------------------------+
```

The summary is assembled from a fixed set of factual clauses. It may state reported reached status, reported credit availability, reported spending-control state, exact calculated reset countdowns, and exact calculated expiry countdowns. It does not state that the user has “enough,” estimate task capacity, translate credits into quota, or produce a health score.

Expiry rules:

- Available credits with valid future `expiresAt` values are sorted earliest first.
- “Expires within 7 days” means the valid expiry is greater than the current time and no more than 604,800 seconds away.
- Expired, non-expiring, and unknown-expiry items are separate states.
- The reported `availableCount` remains authoritative even when the service supplies fewer detail rows.
- Token Trail never calls the reset-credit consumption method.

## 9. Visual design system

### 9.1 Brand foundation

The approved Tracked Trail mark remains the identity. The path stays inside the token and ends at a current-position target. Production work still requires a vector master, transparent icon exports, monochrome variants, and small-size verification.

| Role | Light theme | Dark theme |
| --- | --- | --- |
| App background | Cloud `#F7F9FC` | Midnight `#0B1020` |
| Raised surface | White `#FFFFFF` | Deep navy `#121A2E` |
| Primary text | Ink `#111827` | Mist `#F4F7FB` |
| Secondary text | Slate `#4B5563` | Cool gray `#B5C0D8` |
| Brand outline | Indigo `#4F46C8` | Soft violet `#9B8CFF` |
| Progress trail | Deep teal `#087F6A` | Luminous mint `#4DE1B8` |
| Warning | Dark amber, prototype required | Warm amber, prototype required |
| Critical | Deep red, prototype required | Light red, prototype required |

Final warning, critical, focus, border, and muted colors require contrast testing against every surface. Hex values are design inputs, not proof of accessibility.

### 9.2 Design tokens

- Colors use semantic tokens such as `surface.canvas`, `text.primary`, and `status.warning`, not component-specific literal values.
- Spacing uses a 4-pixel base scale with 4, 8, 12, 16, 24, 32, and 48 pixel steps.
- Corners use restrained radii: 8 pixels for controls, 12 pixels for cards, and 16 pixels for major panels.
- Shadows remain subtle and are never required to understand boundaries.
- Type uses a bundled open-source variable font only if its license and Linux rendering pass review. Otherwise it uses the system UI stack. No font is downloaded at runtime.
- Numeric metrics use tabular numerals where supported.
- Icons use one reviewed set and always receive accessible labels when interactive.

### 9.3 Motion

- Motion communicates state change, not decoration.
- Progress changes animate only when they do not imply false precision.
- Default transitions remain between 120 and 240 milliseconds.
- Reduced-motion mode removes nonessential movement and replaces chart drawing animations with immediate rendering or fades.
- No looping ambient animation appears on dashboard screens.

### 9.4 Charts

- Apache ECharts is the selected chart engine.
- Token Trail imports only required chart types and components.
- SVG is the initial renderer for the modest v1 data volume because it scales cleanly and can reduce memory when several small charts exist. Canvas remains an option if measured performance requires it.
- Decal patterns, point markers, direct labels, and table equivalents prevent color-only interpretation.
- Tooltips are reachable by keyboard or duplicated in a details panel.
- Chart animations honor reduced motion.
- A chart failure never hides the underlying text and table data.

## 10. Accessibility and internationalization

### 10.1 Accessibility target

The renderer targets WCAG 2.2 AA principles where they apply to desktop web content. Passing an automated scanner is not treated as conformance.

Required practices:

- Semantic headings, landmarks, lists, tables, buttons, and form labels.
- Logical focus order and visible focus indicators.
- Full keyboard access without a mouse.
- Escape closes dismissible overlays and returns focus to the opener.
- Dialog focus is contained while open.
- Status changes use appropriate live regions without excessive announcements.
- Minimum pointer targets are set during visual QA and remain usable at 200 percent zoom.
- Text and controls reflow at zoom without horizontal loss of core functionality.
- Screen-reader labels include the value, unit, time range, and provenance where useful.
- Error messages state the problem and a next step.
- Color contrast is verified in both themes and in major states.
- Manual testing covers at least one Linux screen reader on KDE or GNOME plus keyboard-only operation.

### 10.2 React Aria Components

React Aria Components supplies behavior for dialogs, popovers, tabs, selects, switches, tooltips, and other interactive controls. It is selected instead of a visually opinionated component kit because it provides accessibility behavior while allowing Token Trail's own design language. Native HTML remains preferred when it fully meets the need.

### 10.3 Localization readiness

- User-facing text is not embedded in domain calculations.
- Dates, times, durations, and numbers use `Intl` with the user's locale.
- Source identifiers remain unchanged in diagnostics but receive localized display labels in the UI.
- Layouts tolerate text expansion.
- The first release may ship in English, but the code structure must not make later translation costly.
- Right-to-left support is deferred until it can be tested as a complete experience.

## 11. Technical stack and selection reasoning

Versions are pinned during implementation to current supported releases and recorded in the lockfile. This specification names tools, not future version promises.

| Area | Selected tool | Why selected | Alternatives considered |
| --- | --- | --- | --- |
| Desktop runtime | [Electron](https://www.electronjs.org/docs/latest/) | Broad Linux reach, mature desktop APIs, Chromium rendering, and access to the web visualization ecosystem | KDE Kirigami offers deeper Plasma integration and a smaller privilege bridge, but less ready-made dashboard tooling; Tauri reduces bundled runtime size but introduces Rust and WebView variation; Flutter provides custom visuals but a different ecosystem and weaker fit for the existing TypeScript protocol boundary |
| Language | [TypeScript](https://www.typescriptlang.org/docs/) with strict mode | Shared types across main, preload, contracts, and renderer; strong editor and refactoring support | JavaScript lacks compile-time contracts; C++ belongs to the superseded KDE direction; Rust would add a second primary language before it is needed |
| UI | [React](https://react.dev/learn) | Mature component model, strong ecosystem, familiar testing tools, and good fit for dashboard composition | Vue and Svelte are capable, but selecting one ecosystem keeps contributor guidance and component choices focused; no framework would require more custom lifecycle and state work |
| Build tool | [Vite](https://vite.dev/guide/) with separate main, preload, and renderer builds | Fast development feedback and focused production bundles without depending on Forge's experimental Vite plugin | Webpack is mature but heavier to configure; Forge Vite is convenient but officially marked experimental; Electron Vite adds another Electron-specific abstraction |
| Packaging | [electron-builder](https://www.electron.build/) | Direct AppImage, deb, rpm, Pacman, signing, publishing, and Linux updater support in one pipeline | Electron Forge is the official tutorial choice and has useful security plugins, but its format and update path is less direct for this Linux matrix; custom packaging would create avoidable release risk |
| Accessible controls | [React Aria Components](https://react-aria.adobe.com/) plus native HTML | Unstyled, accessibility-focused behavior that can carry Token Trail's brand | Radix Primitives is strong but would duplicate much of the selected role; Material UI and Chakra impose more visual-system assumptions; fully custom controls increase keyboard and screen-reader risk |
| Charts | [Apache ECharts](https://echarts.apache.org/handbook/en/get-started/) | Broad chart types, SVG and Canvas renderers, tree-shakable imports, built-in ARIA descriptions, and decal support | Chart.js is smaller and good for standard charts but less flexible for future heatmaps; Recharts is React-friendly but SVG-oriented and less broad; D3 is powerful but would require more custom accessibility and interaction work; Plotly is heavier than v1 needs |
| Runtime validation | [Zod](https://zod.dev/) | TypeScript-first schemas, zero dependencies, readable boundary validation, and static inference | Hand-written guards reduce dependencies but are easier to make inconsistent; Valibot is smaller but ecosystem familiarity is lower; generated TypeScript types alone do not validate untrusted runtime values |
| Async renderer state | [TanStack Query](https://tanstack.com/query/latest/) | Models asynchronous reads, freshness, retries, and background refresh without inventing a custom cache | React effects and context can work at small scale but tend to duplicate loading and stale-state logic; Redux is unnecessary for read-mostly external state; Zustand remains an option only if complex client state appears |
| Unit tests | [Vitest](https://vitest.dev/) | Shares Vite transforms and supports fast TypeScript tests | Jest is mature but duplicates more transform configuration; Node's test runner is lean but offers less direct renderer tooling |
| Component tests | [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | Encourages tests through user-visible roles, names, and behavior | Enzyme-style implementation tests are more coupled to component internals |
| End-to-end tests | [Playwright Electron support](https://playwright.dev/docs/api/class-electron) | Can launch Electron, inspect the main process, drive windows, and capture screenshots | Spectron is discontinued; WebdriverIO is viable but adds another runner; Playwright Electron support is experimental, so critical native-dialog and packaging tests also need direct integration tests |
| Accessibility automation | [axe-core](https://github.com/dequelabs/axe-core) with manual testing | Local automated checks for common issues and integration with browser tests | Automated checks alone miss many issues; Lighthouse is web-page focused and less suited to the complete Electron lifecycle |
| Icons | A pinned, tree-shaken open-source SVG icon set after license review | Consistent scalable icons without remote assets | Mixing sets creates visual drift; hand-drawing every utility icon wastes effort; the Token Trail logo remains custom |

### 11.1 Why Electron can be hardened for Token Trail

Electron combines Chromium, Node.js, and desktop APIs, so its default capability is larger than Token Trail needs. The hardened design removes capabilities from the renderer and concentrates the remaining privilege in small, reviewable modules:

- local packaged renderer only;
- renderer sandbox and context isolation;
- no Node integration;
- no remote code, remote fonts, webviews, iframes, plugins, or arbitrary navigation;
- narrow `contextBridge` methods;
- sender and payload validation for every IPC call;
- a separate Codex adapter with a method allowlist;
- fuses that disable unused Electron behavior;
- current Electron security releases and dependency review.

This does not make Electron risk-free. It makes the attack surface explicit, testable, and proportionate to a local read-only dashboard.

### 11.2 Why not Tauri for v1

Tauri is a credible alternative when artifact size and lower baseline memory dominate. It would introduce Rust for the privileged core and use the operating system WebView rather than one bundled Chromium version. For Token Trail, consistent visual rendering across varied Linux systems, faster TypeScript UI iteration, and one-language contracts currently outweigh the runtime-size advantage. This judgment should be revisited if measured Electron resource use misses the budgets in this document.

### 11.3 Why not a native KDE application

Kirigami remains the best option for deep Plasma conventions and native KDE identity. Token Trail's approved priority is a distinct, visually rich dashboard that works across major Linux desktops. Electron offers more charting and web UI choices with one rendering engine. KDE behavior still remains a tested platform target rather than being treated as secondary.

## 12. Application architecture

### 12.1 Process and trust boundaries

```text
                           User's computer

  +--------------------+       typed, narrow IPC       +---------------------+
  | Sandboxed renderer | <----------------------------> | Isolated preload    |
  | React + ECharts     |   domain DTOs, no raw JSON    | contextBridge only  |
  | no Node or shell    |                               +----------+----------+
  +--------------------+                                          |
                                                                  | fixed IPC
                                                                  v
  +--------------------+       normalized domain       +----------+----------+
  | In-memory snapshot | <----------------------------> | Electron main       |
  | no usage history   |                               | orchestration only  |
  +--------------------+                               +----------+----------+
                                                                  |
                                                    read allowlist | JSON protocol
                                                                  v
                                                       +----------+----------+
                                                       | Codex adapter       |
                                                       | validation/redaction|
                                                       +----------+----------+
                                                                  |
                                                       local stdio or approved
                                                       local daemon transport
                                                                  v
                                                       +----------+----------+
                                                       | Codex app-server    |
                                                       | owns authentication |
                                                       +---------------------+
```

### 12.2 Main process responsibilities

- Enforce single-instance behavior.
- Create windows with fixed secure preferences.
- Register the local application protocol.
- Block unexpected navigation, popups, permissions, downloads, and web contents.
- Own Codex process discovery and lifecycle.
- Own the read-only protocol client and capability adapter.
- Store non-sensitive preferences.
- Create native tray, notification, dialog, and autostart behavior when enabled.
- Produce redacted diagnostics.
- Check for updates only after update policy is approved and configured.

The main process does not render dashboard content or contain one giant IPC switch. Privileged functions are split into small services with explicit contracts.

### 12.3 Preload responsibilities

The preload exposes a frozen API containing individual methods such as:

```text
window.tokenTrail.getSnapshot()
window.tokenTrail.refresh()
window.tokenTrail.getPreferences()
window.tokenTrail.setPreference(name, validatedValue)
window.tokenTrail.getDiagnosticsPreview()
window.tokenTrail.exportDiagnostics()
window.tokenTrail.onSnapshotChanged(listener)
window.tokenTrail.onThemeChanged(listener)
```

It never exposes `ipcRenderer`, channel names, Electron modules, filesystem paths, environment variables, process objects, shell execution, generic request methods, or raw event objects.

### 12.4 Renderer responsibilities

- Render already-normalized domain data.
- Format user-facing dates, numbers, labels, and explanations.
- Manage local route and interaction state.
- Request specific approved operations through the preload API.
- Treat all strings as text, not HTML.
- Never infer protocol support from the presence of a field alone.

### 12.5 IPC contract

- Contracts live in a dependency-free shared package.
- Request and response schemas are validated at runtime.
- Unexpected keys are stripped or rejected according to the contract.
- Strings, arrays, and payloads have explicit size limits.
- Errors cross IPC as safe categories and user-action hints, not stack traces.
- Subscriptions return an unsubscribe function and remove listeners on unmount.
- The main process validates the sender frame, expected local origin, and top-level frame.
- No dynamic channel selection is accepted from the renderer.

## 13. Codex integration and compatibility

### 13.1 Evidence status

The [official Codex App Server documentation](https://learn.chatgpt.com/docs/app-server) now documents the JSON-RPC protocol, `account/rateLimits/read`, `account/rateLimits/updated`, and `account/usage/read`, including their current account-level fields. The locally installed Codex CLI also identifies its app-server tooling and generated TypeScript bindings as experimental. The official documentation states that the app-server command and WebSocket transport are experimental and unsupported for production workloads.

Therefore:

- official documentation and generated bindings are both implementation evidence;
- runtime behavior is discovered and validated;
- no hard-coded Codex version is treated as permanently compatible;
- method and field changes degrade to an explicit unsupported or partial state;
- public release support must be tested against a documented Codex version matrix.

### 13.2 Allowed operations

The production allowlist may contain only the initialization and read behavior required for:

- account connection and plan type;
- current rate-limit snapshots and their update notifications;
- aggregate account usage;
- capability or version information required to interpret those reads.

The exact strings are isolated in one allowlist and verified against the bindings available during implementation. A method not present in that file cannot be sent.

### 13.3 Explicitly denied operations

- Login, logout, token refresh, or credential methods.
- Reset-credit consumption.
- Credit purchase nudges or email actions.
- Thread, turn, task, message, review, tool, file, Git, shell, process, MCP, plugin, skill, or configuration operations.
- Feedback upload.
- Any generic “call method” path.

Tests scan production code and fixtures to ensure denied method names do not appear in executable request paths.

### 13.4 Compatibility adapter layers

1. **Discovery:** locate an explicitly configured executable or a trusted PATH result without invoking a shell.
2. **Transport:** start a child process with an argument array, or connect to an approved local daemon endpoint.
3. **Protocol:** correlate request IDs, responses, notifications, timeouts, and shutdown.
4. **Runtime validation:** parse unknown JSON into version-specific safe types.
5. **Normalization:** map supported variants into stable Token Trail domain objects.
6. **Presentation:** expose only display-safe domain DTOs to the renderer.

### 13.5 Process launch requirements

- Use an executable path and fixed argument array, never a command string.
- Keep shell mode disabled.
- Do not inherit more environment variables than Codex requires.
- Never log the full environment.
- Set message-size, startup, request, idle, and shutdown timeouts.
- Bound buffered stdout and stderr.
- Treat stderr as diagnostic text that may contain sensitive information and redact or discard it.
- Kill only the child process Token Trail started, using its verified handle.
- Back off after repeated crashes and stop automatic restart loops.

### 13.6 Sparse updates and refresh behavior

- A sparse rate-limit notification is merged only into a known compatible snapshot.
- Missing nullable account metadata in an update is not assumed to mean deletion.
- If merge rules are uncertain, Token Trail performs a full allowed read.
- Partial endpoint failure does not erase data from successful endpoints.
- Refreshes are deduplicated so multiple UI requests share one in-flight operation.
- Conservative polling begins at five minutes unless testing and upstream guidance justify another default.
- Exponential backoff and jitter apply after failures.

## 14. Domain model and metric rules

### 14.1 Common metric shape

```text
Metric<T>
|-- value: T or null
|-- availability: available | partial | unavailable | invalid
|-- provenance: codex_reported | locally_observed | calculated
|-- observedAt: timestamp
|-- explanationKey: stable local text key
`-- sourceCoverage: optional date or field coverage
```

Raw JSON never becomes renderer state.

### 14.2 Quota rules

| Value | Rule |
| --- | --- |
| Used percentage | Preserve a finite reported number; flag values outside the expected range. |
| Remaining percentage | Calculate `100 - usedPercent`; clamp only the visual bar, while the text exposes invalid source data rather than silently correcting it. |
| Duration | Preserve reported minutes and format a friendly duration. |
| Reset timestamp | Preserve source epoch, validate range, and format in the user's timezone. |
| Countdown | Calculate from reset timestamp and a monotonic refresh clock; show “reset time passed” before assuming a reset occurred. |
| Primary selection | Prefer an explicit reported primary window; otherwise choose a deterministic display candidate and state the rule. |
| Unknown bucket | Display a neutral fallback derived from safe identifiers, never discard it. |

### 14.3 Usage rules

| Value | Rule |
| --- | --- |
| Daily bucket | Accept a valid calendar date and non-negative integer that can be represented safely. |
| Today | Use the bucket matching the user's current local calendar date. |
| Current week | Use locale-independent product rules documented in the UI; initial proposal is Monday through Sunday. |
| Current month | Sum valid source buckets within the local calendar month. |
| Trailing 7 or 30 days | Require complete date coverage or label the result partial. |
| Lifetime | Display the reported summary; never reconstruct it from a partial daily range. |
| Streak | Display only a reported non-negative integer; define “day” according to the upstream value. |
| Longest turn | Format reported seconds; do not inspect individual turns to reproduce it. |

JavaScript `number` cannot exactly represent every 64-bit integer. Protocol integers are parsed into `bigint` or validated decimal strings in the privileged adapter, then formatted without precision loss. IPC DTOs use safe decimal strings for values beyond the structured-clone and chart ranges chosen during implementation.

### 14.4 Credits rules

- Money-like values remain decimal strings until formatted.
- Units and currency are never invented.
- Unlimited and unavailable are different states.
- A reset-credit detail list may contain fewer rows than the reported available count; the interface explains that distinction.
- Backend-provided titles and descriptions are length-bounded and rendered as plain text.
- Opaque identifiers never reach the renderer unless a visible read-only feature strictly requires them. v1 does not require them.

### 14.5 Freshness

- `observedAt` records when a valid source response was accepted.
- `refreshAttemptedAt` records the latest attempt separately.
- The header uses last successful refresh for “Updated.”
- Data becomes stale after a product-defined threshold greater than the normal polling interval.
- System suspend and resume trigger a delayed refresh, not a burst of missed polls.

### 14.6 Reset timeline and attention ordering

- Timeline inputs are valid future `resetsAt` values attached to a normalized identified window.
- Entries are sorted by timestamp, then stable window identity.
- Invalid and missing timestamps appear in a separate unknown-time group instead of entering the timeline.
- A timestamp passing the current time does not prove that a reset occurred. Token Trail waits for a new source snapshot.
- Attention ordering follows the exact sequence in Interface 8.19.
- Reached state originates only from a supported Codex-reported reached field and stays at bucket scope unless the source explicitly provides a window association.
- The order is recalculated from each valid snapshot and is never stored as account history.

### 14.7 Current-session deltas

- A baseline snapshot exists only in memory for the lifetime of the Token Trail process.
- A metric delta requires stable identity, matching unit, and valid baseline and current values.
- Percentage-point change is used for quota percentages.
- Exact integer subtraction is used for token counters without converting unsafe integers to JavaScript `number`.
- Reset transitions start a new quota baseline rather than producing a cross-reset delta.
- Counter decreases are reported as source changes, not negative usage.
- Current-session deltas have `locally_observed` provenance even though their endpoints came from Codex.

### 14.8 Complete-period comparisons

- Date keys are parsed as calendar dates rather than local timestamp instants.
- Duplicate dates make the affected comparison unavailable until deterministic rejection is reflected in coverage.
- Periods use consecutive calendar dates ending on the latest valid supplied date.
- Both periods must contain exactly one valid bucket for every required date.
- Totals and absolute differences use exact integer arithmetic.
- Relative change is available only with a positive preceding total.
- A comparison says nothing about future usage, quota movement, or cause.

### 14.9 Heatmap, statistics, and coverage

- Heatmap intensity uses only valid positive values in the selected supplied range.
- Missing, reported zero, and positive buckets are separate states in the visual model and accessible text.
- Statistics follow the formulas in Interface 8.22 and label their exact input range.
- Coverage records requested date count, valid unique date count, reported-zero count, missing dates, and rejected record count.
- The coverage model determines availability before a calculation runs.
- Invalid records are never coerced into plausible values.
- No statistic from a selected source range is labeled lifetime unless Codex reports it as a lifetime summary.

### 14.10 Combined capacity and reset-credit expiry

- Combined capacity is a presentation group containing independent typed metrics.
- The domain model has no total-capacity number, common unit, or health score.
- Summary text is selected from reviewed clauses whose conditions map to reported or directly calculated states.
- Credit and spending strings retain their upstream units and formatting constraints.
- Expiry countdown uses a valid reported `expiresAt` and the current clock.
- The seven-day notice boundary is a fixed interface rule, not a claim from Codex.
- `availableCount` is authoritative when detail rows are absent or capped.

## 15. Security specification

### 15.1 Security objectives

Token Trail must protect:

- Codex authentication ownership and session integrity;
- local account and aggregate usage data;
- local filesystem and process privileges;
- update and release integrity;
- the user's expectation that the app is read-only and local.

### 15.2 Threat model

| Threat | Example | Primary controls |
| --- | --- | --- |
| Renderer compromise | An XSS bug attempts to reach Node or the filesystem | Local-only content, CSP, no HTML injection, sandbox, context isolation, no Node integration, narrow preload |
| IPC confused deputy | Renderer sends a crafted privileged request | Fixed methods, sender validation, runtime schemas, size limits, main-process authorization |
| Protocol drift or hostile data | Codex returns an unknown, oversized, or malformed field | Message limits, Zod schemas, optional fields, normalization, plain-text rendering |
| Command injection | Executable path or argument contains shell syntax | No shell, fixed executable plus argument array, trusted discovery rules |
| Credential exposure | Logs or diagnostics include tokens or environment data | Do not request credentials, field allowlist, recursive redaction, no environment logging |
| Supply-chain compromise | A dependency or build action is malicious | Minimal dependencies, lockfile, provenance review, pinned CI actions, audits, SBOM, reproducible metadata |
| Malicious update | Update feed or artifact is replaced | HTTPS, signed metadata where available, OS signatures, checksums, controlled release identity, rollback plan |
| Local tampering | Packaged application files are modified | ASAR integrity, only-load-from-ASAR fuse, signatures where supported, checksums |
| Privacy expansion | A later feature begins collecting task content | Data inventory review, separate decision, consent, schema tests, denied-method scan |
| Denial of service | Child process floods output or repeated refreshes | Size and rate limits, backpressure, timeouts, deduplication, restart budget |

### 15.3 BrowserWindow requirements

Every window and view uses an audited factory. Required settings and behavior:

- `nodeIntegration: false`.
- `contextIsolation: true`.
- `sandbox: true` plus application-wide sandbox enablement.
- `webSecurity: true`.
- no `allowRunningInsecureContent`.
- no experimental Blink features.
- no `<webview>`.
- no remote module or equivalent generic bridge.
- spellcheck disabled unless a real text-entry feature requires it.
- DevTools disabled in production user builds, with a separate signed diagnostic build policy if needed.
- navigation prevented outside the exact local app origin.
- new-window creation denied.
- permission requests denied by default.
- downloads denied except the explicit main-process diagnostic save flow.
- unexpected web contents destroyed and logged as a safe security event.

### 15.4 Local application protocol and CSP

Production uses a privileged custom scheme such as `tokentrail://app/` rather than `file://`. Path resolution maps fixed URLs to packaged assets and rejects traversal, encoded separators, unknown hosts, and files outside the renderer bundle.

Starting Content Security Policy:

```text
default-src 'none';
script-src 'self';
style-src 'self';
img-src 'self' data:;
font-src 'self';
connect-src 'none';
media-src 'none';
object-src 'none';
frame-src 'none';
base-uri 'none';
form-action 'none';
frame-ancestors 'none';
```

Development exceptions are restricted to local development and cannot be copied into production configuration. Inline scripts and `unsafe-eval` are prohibited in production. Inline style allowances, if a library requires them, need a documented nonce or a library change rather than a silent CSP weakening.

The Phase 1 development server exposed a concrete parity defect: Vite transforms imported CSS into its development style-update path, which injects an inline `<style>` element, while the shared `style-src 'self'` policy rejects inline styles. React and local images can still load, so the failure appears as a dark browser-default page rather than a blank or crashed app. The packaged build does not reveal the defect because Vite extracts CSS into a self-hosted file that production CSP permits.

Phase 2 resolved this without weakening production:

- development and packaged CSP construction are explicit and separately tested;
- Vite's style-update implementation made self-hosted development CSS and practical nonce propagation unsuitable for reliable HMR, so only development permits inline styles;
- the `unsafe-inline` style allowance is tied to the exact validated loopback origin and never appears in the packaged policy;
- production continues to reject inline styles, inline scripts, eval, remote code, and wildcard sources;
- tests exercise the actual `npm run dev` orchestration, CSS hot updates, packaged CSP assertions, and equivalent screenshots in both modes.

### 15.5 External links

- External URLs are constants mapped from internal link IDs.
- Only `https:` URLs on a reviewed origin allowlist can open.
- URLs are parsed with the platform URL parser and matched by exact origin, not prefixes.
- User or protocol data can never become an external URL.
- The renderer asks to open a link ID, not a URL string.
- Links open in the user's browser, never inside Token Trail.

### 15.6 IPC security

- One preload function per capability.
- No `send(channel, payload)` or `invoke(method, params)` bridge.
- Sender frame URL and top-level-frame identity checked on every handler.
- The main process authorizes the action independently of renderer state.
- Inputs and outputs pass runtime schemas.
- Prototype-bearing objects, functions, symbols, and raw error objects are not transferred.
- Event subscriptions expose copied data and remove the Electron event parameter.
- Rate limits apply to refresh, diagnostics, and preference writes.
- A security test enumerates the exposed bridge surface and fails on unexpected keys.

### 15.7 Codex security boundary

- The allowlist is centralized, immutable at runtime, and covered by tests.
- No renderer value selects a Codex method.
- Protocol responses are parsed as untrusted data.
- Authentication payloads, headers, tokens, cookies, and token-refresh requests are discarded and treated as security events if encountered unexpectedly.
- Account email is not needed for v1 and is removed before normalization.
- Raw payloads are never logged, persisted, or forwarded.
- Child-process stderr is not shown directly.

### 15.8 Storage security

v1 stores no secret. Preferences use a versioned JSON document in the Electron user-data directory with restrictive file permissions where the platform permits. Writes are atomic and validated on read.

Electron `safeStorage` is not used merely to make ordinary preferences look encrypted. On Linux its protection depends on the available secret store and can fall back to weaker behavior. If a future feature genuinely needs secret storage, it must reject an unsuitable backend for sensitive data or clearly explain the limitation.

### 15.9 Electron fuses

Packaging evaluates and tests the current fuse set. The intended posture is:

- disable `RunAsNode`;
- disable Node CLI inspect arguments for production if the end-to-end strategy can test the fused build another way;
- disable Node options from the environment when compatible;
- enable embedded ASAR integrity validation;
- enable only loading the application from ASAR;
- enable cookie encryption only if cookies ever exist, which v1 should avoid;
- leave no fuse change undocumented.

Playwright's Electron automation may require Node CLI inspect support. Development test artifacts and production-fused artifacts must therefore be separate, and the final packaged build receives independent smoke and security tests.

### 15.10 Dependency and supply-chain security

- Keep production dependencies small and justified in an architecture record.
- Commit one lockfile and require frozen-lockfile installs in CI.
- Review package ownership, maintenance, license, install scripts, transitive count, and advisory history before adoption.
- Block unapproved lifecycle scripts where practical.
- Pin GitHub Actions to immutable commit SHAs.
- Run dependency review on pull requests.
- Generate an SPDX or CycloneDX software bill of materials for releases.
- Run vulnerability scanning and secret scanning.
- Treat a clean scanner result as evidence, not a guarantee.
- Establish an Electron upgrade window shorter than the framework's supported-major window.
- Publish a `SECURITY.md` with private reporting instructions and a supported-version policy.

### 15.11 Release security

- Release builds run only from protected tags or an approved manual workflow.
- Signing secrets exist only in the platform's protected CI secret store.
- Production publishing fails closed when required signing material is absent.
- Artifacts, checksums, SBOM, version, commit, and build environment are recorded together.
- The update feed cannot accept arbitrary URLs from local configuration or the renderer.
- Update checks send only what the provider protocol requires. No account or usage data is attached.
- Automatic installation is deferred until signing and rollback behavior are verified. The initial safe option is user-initiated update checking with clear release notes.

### 15.12 Security verification gates

A release fails if any of the following is true:

- Node integration or renderer sandbox settings differ from policy.
- Production CSP contains `unsafe-eval`, remote script, remote frame, or broad network access.
- An unexpected preload API is exposed.
- A disallowed Codex method is reachable.
- Raw protocol content appears in logs or diagnostic fixtures.
- A high or critical known vulnerability lacks a reviewed exception and mitigation.
- Required artifact signatures, checksums, or SBOM are missing.
- Navigation, popup, permission, custom-protocol, or IPC abuse tests fail.

Before the first public release, use a dedicated security review, including the Codex Security plugin or an equivalent tool if the user approves installing and using it at that time. This document does not install that plugin.

## 16. Privacy and data retention

### 16.1 Data inventory

| Data class | Read | In memory | On disk | Sent externally |
| --- | --- | --- | --- | --- |
| Quota and aggregate usage | Yes, approved fields only | Current snapshot | No in v1 | No |
| Plan type | When reported | Current snapshot | No | No |
| Account email or identifier | Not needed | No | No | No |
| Credentials or auth tokens | No | No | No | No |
| Prompts and responses | No | No | No | No |
| Task, project, path, or Git data | No | No | No | No |
| Preferences | Local input | Current settings | Yes | No |
| Compatibility data | Safe subset | Yes | Minimal safe cache if needed | No |
| Diagnostics | Generated on request | Redacted preview | Only chosen export | Only if user later shares it |
| Update request | Version and platform only if enabled | Temporary | No | Update provider only |

### 16.2 Logging

- Default production logging is minimal and structured.
- No raw request or response body is logged.
- No path, email, account ID, token, environment dump, prompt, response, or task metadata is logged.
- Error categories replace stack traces in user exports.
- Local technical logs rotate by size and age and can be cleared.
- Verbose logging is a temporary, explicit troubleshooting mode with a visible warning and the same redaction layer.

### 16.3 Clearing data

Clear Token Trail data removes preferences, compatibility cache, window state, and Token Trail logs. It does not remove Codex state or exported files the user saved elsewhere. The confirmation states this boundary.

### 16.4 Future history

Local history is not a hidden v1 cache. A later proposal must define:

- explicit opt-in;
- exact schema and purpose;
- retention choices and default;
- deletion and export behavior;
- migration and corruption handling;
- whether encryption is meaningful on each platform;
- how forecasts expose uncertainty;
- how the user can inspect what is stored.

## 17. Linux compatibility and desktop integration

### 17.1 Supported target statement

The initial support goal is current mainstream 64-bit desktop Linux on x64 and arm64, tested on representative Debian/Ubuntu, Fedora, and Arch-family systems. Coverage includes KDE Plasma and GNOME on Wayland, plus representative X11 and Cinnamon or Xfce sessions.

Electron 38.2 and newer supports native Wayland out of the box. Token Trail still tests both Wayland and X11 because window behavior, scaling, tray activation, and compositor rules differ.

### 17.2 KDE behavior

Electron applications can run well on KDE. Token Trail will:

- follow system light or dark preference through Electron `nativeTheme` and CSS;
- use StatusNotifierItem through Electron's tray behavior when tray support is enabled;
- use desktop notifications compatible with environments following the freedesktop notification specification;
- provide a correct desktop entry, icon, application name, and `StartupWMClass`;
- test fractional scaling and multiple displays on Plasma Wayland;
- avoid relying on programmatic window positioning that Wayland intentionally restricts;
- keep custom controls consistent and accessible even though they are not Kirigami-native.

### 17.3 Packaging targets

| Format | v1 intent | Reason |
| --- | --- | --- |
| AppImage | Required candidate | Broad portable artifact with no installation, useful for direct testing |
| deb | Required candidate | Debian, Ubuntu, Mint, and related systems |
| rpm | Required candidate | Fedora, RHEL-family, and openSUSE users, subject to package testing |
| Pacman | Required candidate | Arch and Manjaro users |
| tar archive | Optional fallback | Transparent unpacked distribution and troubleshooting |
| Flatpak | Deferred | Sandbox and host Codex access need a deliberate portal or daemon design |
| Snap | Deferred | Confinement, store workflow, and host process access require separate testing |

No one artifact is called universal. AppImage compatibility, including FUSE and distribution security policies, is tested and documented.

### 17.4 Desktop files and metadata

- Freedesktop desktop entry with Utility or Development category after review.
- AppStream metadata for repositories and software centers.
- Icons at all required sizes plus scalable SVG when production logo work is complete.
- Correct executable name and WM class.
- No file associations or URL handlers unless a real user feature needs them.
- Tray and autostart files removed cleanly on uninstall where packaging permits.

## 18. Packaging, updates, and release integrity

### 18.1 electron-builder configuration

- ASAR enabled.
- Only necessary packaged files included through an explicit allowlist.
- Source maps excluded from public production artifacts or stored separately with protected access.
- Native modules avoided unless a measured need justifies them.
- Artifact names include product, version, platform, and architecture.
- Linux dependencies are declared per package format and verified in clean environments.
- CI builds x64 and arm64 separately and never relabels an artifact.

### 18.2 GitHub release workflow

- The public GitHub repository is the source of record. Standard GitHub-hosted Actions runners build and test releases, and GitHub Releases hosts the public artifacts.
- An ordinary branch push never publishes an application update. A release begins from an approved version commit and matching immutable tag such as `v0.1.0`.
- The release workflow performs a frozen dependency install, required quality and security checks, and separate verified builds for each supported architecture.
- The workflow uploads AppImage, deb, rpm, Pacman, release notes, checksums, update metadata when approved, and any required signatures to a draft GitHub Release.
- A maintainer reviews the draft, artifact names, checksums, test results, and release notes before publishing it. Preview releases are explicitly marked as prereleases.
- Workflow permissions remain least-privilege. Third-party Actions are pinned to reviewed commit SHAs, release publication requires the protected release environment, and untrusted pull-request code cannot publish artifacts.
- GitHub Actions artifacts are temporary CI outputs. User-facing installers are retained as GitHub Release assets and are not committed to Git.

### 18.3 Update phases

1. **v1 preview:** no automatic update installation; GitHub Releases provides checksums and manual instructions.
2. **verified update check:** user-initiated check against the fixed HTTPS GitHub Releases provider.
3. **download with consent:** signed or otherwise verified artifact download with release notes.
4. **automatic checks:** optional, documented network behavior, no silent installation by default.
5. **staged rollout:** only after rollback, signature, proxy, offline, and partial-download tests pass.

### 18.4 Release channels

- Stable is the only required public channel.
- Preview builds are clearly named, use separate update metadata, and never overwrite stable settings without migration.
- Downgrades are blocked when they would corrupt settings, or handled by a tested migration path.

## 19. Performance and resource budgets

Budgets are acceptance targets to validate on representative hardware, not claims already achieved.

| Measure | Initial target |
| --- | --- |
| Warm launch to usable cached shell | 1.5 seconds or less on reference hardware |
| Cold launch to first connection state | 3 seconds or less on reference hardware |
| Overview interaction response | visible feedback within 100 milliseconds |
| Manual refresh feedback | immediate; result governed by Codex response time |
| Idle CPU after settling | near 0 percent, with no continuous animation |
| Idle memory | measured and published; initial ceiling 250 MB total resident set on reference Linux system |
| Renderer bundle | tree-shaken and budgeted in CI; exact ceiling set after prototype |
| Chart update | no long task over 50 milliseconds for expected v1 data |

Performance practices:

- Render only visible routes.
- Import ECharts components selectively.
- Avoid a background timer per component.
- Pause nonessential work when the window is hidden.
- Coalesce notifications and refreshes.
- Profile startup and memory in packaged builds, not only development mode.
- Reconsider Electron or split heavy work into a utility process if measured limits cannot be met safely.

## 20. Error handling and resilience

### 20.1 Error categories

- Codex not found.
- Codex signed out or authentication unavailable.
- Unsupported method or schema.
- Partial endpoint support.
- Protocol timeout.
- App-server exited.
- Malformed or oversized response.
- Preference corruption.
- Export failure.
- Update failure.
- Unexpected internal error.

Each category maps to a safe user message, a recommended action, and a non-sensitive diagnostic code. Raw exception text is not displayed by default.

### 20.2 Recovery rules

- Corrupt preferences are quarantined and replaced with defaults after informing the user.
- One endpoint failure does not erase other valid sections.
- The previous valid snapshot remains visible during transient failures.
- Restart loops stop after a bounded budget.
- A manual retry resets backoff only for the requested operation.
- App shutdown asks the child process to stop, waits a bounded time, then terminates only the owned process.
- Suspend and resume, network changes, and timezone changes update display state safely.

## 21. Testing strategy

### 21.1 Test layers

| Layer | Coverage |
| --- | --- |
| Pure unit | Calculations, date coverage, number precision, sorting, provenance, redaction, allowlist |
| Schema and fixture | Known, missing, extra, malformed, sparse, oversized, and version-shifted protocol data |
| Main-process integration | Child lifecycle, timeouts, backoff, IPC authorization, storage, protocol handler |
| Preload contract | Exact exposed surface, input validation, unsubscribe behavior, no leaked Electron objects |
| Component | Keyboard behavior, accessible names, loading, stale, partial, and error states |
| End-to-end | Onboarding, refresh, navigation, preferences, diagnostics preview, window lifecycle |
| Packaged smoke | Install, launch, sandbox, custom protocol, icons, desktop entry, uninstall |
| Security | CSP, navigation, popup, permissions, IPC abuse, path traversal, injection, fuse posture |
| Accessibility | axe-core plus keyboard, zoom, contrast, screen reader, reduced motion |
| Compatibility | Distribution, architecture, desktop environment, Wayland/X11, scaling |
| Performance | Startup, idle CPU, memory, bundle size, chart rendering, repeated refresh |

### 21.2 Required protocol fixtures

- Full current response.
- No account.
- One and multiple quota buckets.
- Primary only, secondary only, and neither.
- Null timestamps and durations.
- Unknown limit and plan values.
- Sparse update before and after a full snapshot.
- Credits unavailable, unlimited, zero balance, and decimal balance.
- Reset-credit count without detail rows.
- Missing daily buckets and explicit zero buckets.
- Integers beyond JavaScript safe-number range.
- Unknown nested fields.
- Malformed JSON, duplicate IDs, huge arrays, and huge strings.
- Method-not-found and app-server exit.
- Multiple windows sharing a reset timestamp and windows missing reset timestamps.
- A reported reached state alongside high percentage without a reached state.
- Session baseline, valid increase, reset transition, counter decrease, and process restart.
- Fourteen complete dates, one missing date, one reported zero date, and a duplicate date.
- Sixty complete dates and a preceding comparison period with a zero total.
- Odd and even median counts, tied range maxima, no active days, and values requiring exact integer arithmetic.
- Reset credits expiring inside and outside seven days, already expired, non-expiring, unknown expiry, and fewer detail rows than `availableCount`.
- Combined capacity clauses with every independent metric unavailable so no synthetic conclusion is produced.

### 21.3 Security test examples

- Attempt to call every denied Codex method through unit and IPC paths.
- Inject markup into every protocol-derived string and confirm it remains text.
- Attempt navigation to HTTP, HTTPS, `file:`, `javascript:`, `data:`, and malformed URLs.
- Attempt custom-protocol path traversal and encoded traversal.
- Send IPC from an unexpected frame and origin.
- Send oversized, recursive, and wrong-type IPC payloads.
- Verify the packaged renderer cannot access `require`, `process`, filesystem, environment, or raw IPC.
- Inspect packaged fuses and ASAR loading behavior.
- Confirm diagnostic output contains no seeded secrets, paths, email, IDs, prompts, or unknown fields.

### 21.4 Linux test matrix

At minimum before stable release:

- KDE Plasma Wayland on a current rolling or recent distribution.
- KDE Plasma X11 where still supported by the test distribution.
- GNOME Wayland on current Ubuntu or Fedora.
- One Debian/Ubuntu-family deb install.
- One Fedora-family rpm install.
- One Arch-family Pacman install.
- AppImage on at least two distribution families.
- x64, plus arm64 through real hardware or a clearly documented equivalent where available.
- 100, 125, 150, and 200 percent display scaling where the desktop supports it.
- Light, dark, system, high-contrast observation, and reduced-motion behavior.

### 21.5 Versioned test reports

- Every preview and stable version has a detailed Markdown report at `tests/<version>/test_report.md`, for example `tests/0.1.0/test_report.md`.
- The report identifies the version, release tag when present, exact commit, test date, runner or machine, operating system, architecture, desktop environment, display server, relevant tool versions, and package format.
- It records the exact commands executed and the evidence-backed result of unit, schema, integration, preload, component, end-to-end, security, accessibility, compatibility, performance, packaging, and packaged-smoke checks that apply to that version.
- Failures, warnings, skipped checks, unavailable hardware, incomplete matrix coverage, known limitations, artifact names, and checksums remain visible. A check that did not run is never presented as passing.
- The report ends with a clear release recommendation: ready, preview-only, or not ready, plus the reasons for that recommendation.
- Each phase adds curated screenshots of the tested application states under `tests/<version>/screenshots/` and embeds them in the report with a caption naming the build, environment, and behavior shown.
- Curated screenshots come from actual development or packaged test runs. Routine CI screenshots remain transient unless deliberately promoted into the report, so CI does not rewrite tracked evidence.
- Screenshots must not contain account identifiers, private paths, prompts, responses, tokens, credentials, notifications, or unrelated desktop content.
- Reports contain no credentials, account identifiers, private paths, prompts, responses, raw protocol payloads, or other sensitive diagnostic data.
- The report is committed with the version candidate and updated from actual CI and manual evidence before its GitHub Release is published.

## 22. Observability and diagnostics

### 22.1 Local health events

Structured categories may include startup phase, discovery outcome, capability result, refresh duration, sanitized error category, child restart count, and export result. Values that could identify an account, path, task, or content are excluded.

### 22.2 No remote telemetry

No analytics SDK, crash uploader, session replay, tracking pixel, or remote logging endpoint ships in v1. If maintainers need crash reports, users may export a redacted local report and choose how to share it.

### 22.3 Diagnostic redaction model

Redaction is allowlist-based. A diagnostic schema explicitly constructs safe output. It does not serialize a large object and attempt to remove a blacklist of known secrets afterward. Unknown fields are absent.

Tests seed canary values in every sensitive class and fail if any canary appears in the preview or file.

## 23. Development workflow and repository shape

### 23.1 Proposed source layout

```text
tokentrail/
|-- assets/
|   `-- branding/
|-- docs/
|   `-- PRODUCT_SPEC.md
|-- src/
|   |-- main/
|   |   |-- codex/
|   |   |-- ipc/
|   |   |-- security/
|   |   |-- storage/
|   |   `-- windows/
|   |-- preload/
|   |-- renderer/
|   |   |-- components/
|   |   |-- features/
|   |   |-- routes/
|   |   `-- styles/
|   `-- shared/
|       |-- contracts/
|       |-- domain/
|       `-- schemas/
|-- tests/
|   |-- fixtures/
|   |-- integration/
|   |-- security/
|   |-- e2e/
|   `-- <version>/
|       `-- test_report.md
|-- product_spec_electron.md
|-- design_decisions.md
`-- commit_tracker.md
```

### 23.2 Quality commands

The implementation should provide single-purpose commands for formatting check, lint, type check, unit tests, integration tests, end-to-end tests, accessibility checks, security checks, packaging, and packaged smoke tests. CI runs frozen dependency installation and never modifies tracked files.

### 23.3 Change discipline

- Architecture or privacy changes update the decision log.
- Meaningful commits update the commit tracker with fact and sanity reports.
- New dependencies include written selection reasoning.
- New IPC methods include a threat review and tests.
- New data fields update the inventory, retention model, redaction schema, and fixtures.
- New external network behavior requires an explicit decision and visible setting where appropriate.

### 23.4 Readability and commenting standard

- Authored source uses descriptive names, small focused functions, explicit types at trust boundaries, and a straightforward control flow before relying on comments.
- Where the file format permits comments, every authored executable statement must either have an adjacent detailed comment or belong to a small, directly preceding commented group that explains its purpose, inputs, outcome, and important failure behavior.
- Security boundaries, IPC validation, Codex allowlisting, parsing, calculations, date handling, precision rules, privacy behavior, error recovery, and platform-specific workarounds receive especially detailed rationale comments.
- File and module comments explain responsibility, trust level, dependencies, and what the code intentionally refuses to do. Public functions and contracts explain parameters, return values, side effects, errors, and invariants.
- Comments explain why the code exists and how its constraints work. They do not merely translate syntax into English or preserve dead code.
- Tests receive the same teaching-style treatment, including the behavior protected and why each edge case matters.
- Generated files, dependency lockfiles, machine-produced artifacts, external vendored code, snapshots, and data-only formats that do not support comments are exempt. Their origin and purpose are documented in the nearest authored file.
- Comment accuracy is part of review. A behavior change updates its comments in the same commit, and stale or misleading comments fail the quality standard.

## 24. Delivery phases

The detailed task sequence, evidence requirements, and progress checklist are maintained in [implementation_plan.md](implementation_plan.md). The six phases below define the approved v1 delivery boundary.

### Phase 1: foundation

**Implementation status:** Complete.

- Confirm exact v1 fields against the current app-server bindings and behavior.
- Produce a threat model and data-flow review.
- Prototype the secure window, local protocol, preload contract, and deny-by-default adapter.
- Benchmark a minimal packaged shell on KDE and GNOME.

### Phase 2: core read-only slice

**Implementation status:** Complete locally with evidence in `tests/0.2.0/test_report.md`.

- Correct every user-visible application and package label to `Token Trail` while retaining `tokentrail` only for machine-facing identifiers.
- Connect to a fixture app-server.
- Normalize one quota snapshot.
- Render the Overview normal, loading, partial, stale, and error states.
- Prove renderer isolation and navigation blocking.

### Phase 3: complete v1 product

- Quota Windows, Usage, Credits, Learn, Settings, and Diagnostics.
- Provenance and accessible table equivalents.
- Real Codex compatibility fixtures and graceful fallback.
- Complete every approved v1 calculation, preference, redaction, and unavailable-state rule.

### Phase 4: product quality

- Theme polish, responsive layouts, production assets, and accessibility review.
- Performance, resilience, suspend, lifecycle, Wayland, X11, KDE, GNOME, and scaling tests.
- Finalize the measured support matrix and record unavailable environments honestly.

### Phase 5: packaging and release engineering

- Build and smoke-test AppImage, deb, rpm, and Pacman packages.
- Implement protected tag-driven GitHub Actions and draft GitHub Releases.
- Complete dependency and license review, fuse posture, ASAR integrity, SBOM, checksums, and signing plan.
- Verify detailed installation, architecture-selection, upgrade, troubleshooting, and uninstall instructions.
- Produce a versioned prerelease test report.

### Phase 6: release validation and publication

- Freeze the v1.0.0 candidate and run the complete automated, manual, security, accessibility, performance, package, and Linux compatibility matrix.
- Complete a release-candidate soak period and remediate release-blocking findings.
- Produce `tests/1.0.0/test_report.md` with a `ready` recommendation.
- Obtain explicit publication approval, publish the immutable GitHub Release, then download and verify the public artifacts.

### Post-v1 follow-up tracking

The six phases end the approved v1 scope. Optional background features are deferred by default and do not block v1 completion. The maintained follow-up tracker in `implementation_plan.md` covers:

- tray, notifications, start at login, and compact mode;
- manual, consent-based, automatic, and staged update capabilities;
- Windows, macOS, Flatpak, Snap, and optional tar distribution;
- opt-in local history, trends, forecasts, backups, and import or export;
- layout customization, additional languages, right-to-left support, and separate companion clients;
- recurring Electron security, Codex compatibility, Linux matrix, dependency, and patch-release maintenance.

Each follow-up keeps its privacy, security, consent, lifecycle, platform, and testing gate. It enters an implementation phase only after separate prioritization and approval.

## 25. Acceptance criteria

### 25.1 Product correctness

- Every fixture produces the specified available, partial, invalid, or unavailable state.
- Reported values are not silently renamed or reconstructed.
- Calculated values identify inputs and fail safely when inputs are inadequate.
- Missing dates are not treated as zero usage.
- Large integer and decimal values retain precision.
- Reset timeline and attention ordering match their documented deterministic rules for every fixture.
- Current-session deltas never survive process restart and never compare quota percentages across an observed reset.
- Period comparison remains unavailable when either calendar period has a missing, duplicate, invalid, or rejected date.
- Reported zero and missing dates remain distinguishable in the heatmap, table, statistics, and accessible text.
- Activity statistics reproduce their documented formulas with exact integer-safe calculations.
- Coverage accurately explains why each derived feature is available or unavailable.
- Expiry notices use valid reported timestamps and the exact seven-day boundary.
- No combined-capacity score or cross-unit arithmetic exists in the domain model, renderer, export, or tests.

### 25.2 Security

- All requirements in section 15 pass automated and manual review.
- The renderer cannot reach Node, Electron, filesystem, shell, environment, or raw Codex messages.
- Production code cannot call denied Codex methods.
- Packaged content loads only from the application ASAR and approved local scheme.
- Diagnostic canary tests show complete sensitive-field exclusion.
- Release dependency and artifact checks pass.

### 25.3 Privacy

- A network capture during normal use shows no Token Trail telemetry.
- The only expected non-Codex network behavior is an explicitly enabled update check.
- No usage snapshot remains on disk after exit in v1.
- Clear data removes all Token Trail-owned local settings, cache, and logs.
- Current-session baselines and deltas are absent from persisted preferences, logs, diagnostics, and files.
- The added v1 insights use no Codex method beyond the already approved account, rate-limit, and aggregate usage reads.

### 25.4 Accessibility

- Primary workflows complete by keyboard.
- Automated scans have no unreviewed serious violations.
- Manual screen-reader tests cover all routes and dialogs.
- Light and dark themes pass contrast review.
- Charts have equivalent tables and readable summaries.
- Reduced-motion mode removes nonessential animation.

### 25.5 Linux compatibility

- The defined distribution and desktop matrix passes install, launch, core workflow, theme, scaling, and uninstall checks.
- Wayland behavior does not rely on forbidden positioning or focus assumptions.
- Packages install correct icons, desktop metadata, and dependencies.
- Unsupported systems receive honest documentation rather than a universal compatibility claim.

### 25.6 Performance

- Reference hardware meets or has an approved revision to the budgets in section 19.
- Idle CPU does not remain active because of animation or polling errors.
- Repeated refresh and window open/close tests show no unbounded memory or listener growth.

## 26. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Experimental Codex app-server changes | Features can break between Codex versions | Adapter isolation, runtime validation, fixtures, capability detection, explicit compatibility state |
| Electron runtime size and memory | App feels heavy for a dashboard | Performance budgets, selective imports, packaged profiling, no continuous animation, revisit runtime if budgets fail |
| Renderer privilege escalation | Local data or machine access could be exposed | Sandbox, context isolation, no Node, strict CSP, narrow IPC, current Electron, security tests |
| npm supply chain | Dependency compromise affects releases | Minimal dependencies, lockfile, review, scans, SBOM, pinned CI, prompt updates |
| Linux fragmentation | Package or desktop behavior varies | Representative matrix, several package formats, honest support statement, no “universal” promise |
| Chart accessibility | Visual information excludes users | Text summaries, tables, patterns, keyboard details, manual testing |
| Background feature complexity | Tray or autostart causes confusing lifecycle | Optional, disabled by default, duplicated main-window actions, defer if cross-desktop tests fail |
| Update compromise | Malicious binary reaches users | Fixed feed, HTTPS, signing, checksums, protected release workflow, manual-first rollout |
| Scope expansion | Privacy-first identity erodes | Release labels, denied methods, data inventory, new decision required for broader data |

## 27. Open questions

These questions do not block the framework decision, but must be resolved before their related implementation phase:

1. What official or supported stability commitment, if any, will exist for the required Codex app-server reads at implementation time?
2. Should the initial app connect to an existing daemon, start its own child app-server, or support both with one preferred path?
3. What refresh interval best balances freshness, upstream load, and laptop power after measurement?
4. Which exact Linux distributions and versions form the first supported matrix at release time?
5. Can arm64 packages be tested on real hardware before v1, or should arm64 remain preview quality?
6. Should tray and notifications ship in v1 or move fully to the first follow-up release?
7. Which production font and icon licenses will be selected after visual prototypes?
8. Which release identity and signing approach will be available for Linux artifacts?
9. Should update checks be completely absent from v1 or user-initiated only?
10. What measured memory ceiling is achievable on the minimum reference machine?

## 28. Reference links

### Electron architecture and security

- [Electron introduction](https://www.electronjs.org/docs/latest/): framework scope and supported desktop platforms.
- [Electron process model](https://www.electronjs.org/docs/latest/tutorial/process-model): main, renderer, preload, and utility process roles.
- [Electron security checklist](https://www.electronjs.org/docs/latest/tutorial/security): isolation, sandbox, CSP, navigation, IPC sender validation, custom protocol, and fuse recommendations.
- [Context isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation): safe `contextBridge` patterns and the danger of exposing generic IPC.
- [Process sandboxing](https://www.electronjs.org/docs/latest/tutorial/sandbox): renderer restrictions and main-process delegation.
- [ASAR integrity](https://www.electronjs.org/docs/latest/tutorial/asar-integrity): embedded integrity validation and only-load-from-ASAR pairing.
- [Electron release policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines): support for the latest three stable major releases.
- [Electron stable releases](https://releases.electronjs.org/?channel=stable): current release lines, checked at specification time rather than pinned here.
- [Electron `safeStorage`](https://www.electronjs.org/docs/latest/api/safe-storage): platform-specific secret-store behavior and Linux fallback considerations.

### Linux desktop behavior

- [Electron Wayland technical overview](https://www.electronjs.org/blog/tech-talk-wayland): native Wayland support in Electron 38.2 and newer.
- [Electron `nativeTheme`](https://www.electronjs.org/docs/latest/api/native-theme): system, light, and dark theme state.
- [Electron Tray API](https://www.electronjs.org/docs/latest/api/tray/): Linux StatusNotifierItem behavior and desktop differences.
- [Electron notifications](https://www.electronjs.org/docs/latest/tutorial/notifications): Linux `libnotify` support including KDE.

### Build and distribution

- [Vite rationale](https://vite.dev/guide/why.html): development and production build model.
- [electron-builder](https://www.electron.build/): packaging, signing, and update overview.
- [electron-builder Linux targets](https://www.electron.build/docs/linux/): AppImage, deb, rpm, Pacman, Flatpak, Snap, and other target support.
- [electron-builder auto update](https://www.electron.build/docs/features/auto-update/): supported update targets and publishing behavior.
- [electron-builder code signing](https://www.electron.build/docs/features/code-signing/): signing purpose, platform requirements, and fail-closed configuration.
- [Electron Forge Vite plugin](https://www.electronforge.io/config/plugins/vite): useful comparison showing the plugin's experimental status.

### UI, data, and testing

- [React](https://react.dev/learn): component framework documentation.
- [React Aria Components](https://react-aria.adobe.com/): unstyled accessible component behavior and internationalization.
- [Apache ECharts](https://echarts.apache.org/handbook/en/get-started/): selected charting system.
- [ECharts Canvas and SVG guidance](https://echarts.apache.org/handbook/en/best-practices/canvas-vs-svg/): renderer trade-offs.
- [ECharts accessibility guidance](https://echarts.apache.org/handbook/en/best-practices/aria/): ARIA descriptions and decal patterns.
- [Zod](https://zod.dev/): TypeScript-first runtime validation.
- [TanStack Query](https://tanstack.com/query/latest/): asynchronous state, freshness, and refresh handling.
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/): user-centered component tests.
- [Playwright Electron API](https://playwright.dev/docs/api/class-electron): experimental Electron automation and its limitations.
- [axe-core](https://github.com/dequelabs/axe-core): local automated accessibility testing and its coverage limits.

### Codex evidence

- [Official Codex App Server documentation](https://learn.chatgpt.com/docs/app-server): current protocol, account rate-limit, aggregate usage, reset-credit, and transport documentation.

The app-server method and schema observations in this specification were also checked against experimental TypeScript bindings generated locally by `codex-cli 0.146.1` on August 13, 2026. Those generated files were placed in a temporary directory for review and were not added to the repository. The official page documents the current account-level methods, while runtime validation and compatibility testing remain necessary because the app-server command is experimental.

## 29. Approval boundary

Approved by the user in this planning discussion:

- Electron as Token Trail's application framework.
- Creation of a separate, detailed Electron product specification.
- A strong security emphasis and a visually rich, cross-Linux product goal.
- Phase 1 implementation and project dependency installation within this specification, authorized on August 14, 2026.
- Detailed versioned test reports at `tests/<version>/test_report.md`.
- Teaching-style, detailed comments throughout authored code, subject to the documented generated-file and file-format exceptions.

Still requiring separate approval or completion:

- Publishing, signing, updating, or distributing an application.
- Enabling telemetry, which is not proposed.
- Expanding beyond the read-only data boundary.
- Adding local usage history, task analytics, background behavior, or cloud features.

The next implementation step is Phase 3: complete the remaining approved v1 product routes, calculations, preferences, and diagnostics using the proven Phase 2 boundaries. Publication and release engineering remain separately gated.
