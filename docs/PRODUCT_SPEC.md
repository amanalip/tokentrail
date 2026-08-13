# TokenTrail Product Specification

Status: Draft for review
Target: First public-ready release (v1)
Tagline: Understand your Codex usage.
Last updated: 2026-08-13

## Contents

- [1. Product summary](#1-product-summary)
- [2. Intended user](#2-intended-user)
- [3. v1 goals](#3-v1-goals)
  - [3.1 Reliable quota status](#31-reliable-quota-status)
  - [3.2 Account usage and credits](#32-account-usage-and-credits)
  - [3.3 Clear explanations and provenance](#33-clear-explanations-and-provenance)
  - [3.4 KDE-native experience](#34-kde-native-experience)
  - [3.5 Privacy and compatibility](#35-privacy-and-compatibility)
- [4. Explicit non-goals for v1](#4-explicit-non-goals-for-v1)
- [5. Screen structure](#5-screen-structure)
  - [5.1 Overview](#51-overview)
  - [5.2 Quota Windows](#52-quota-windows)
  - [5.3 Usage](#53-usage)
  - [5.4 Credits](#54-credits)
  - [5.5 Learn](#55-learn)
  - [5.6 Settings & Diagnostics](#56-settings--diagnostics)
- [6. Metric catalog and provenance](#6-metric-catalog-and-provenance)
  - [6.1 Provenance labels](#61-provenance-labels)
  - [6.2 Quota metrics](#62-quota-metrics)
  - [6.3 Usage metrics](#63-usage-metrics)
  - [6.4 Credit and spending metrics](#64-credit-and-spending-metrics)
- [7. Privacy model](#7-privacy-model)
  - [7.1 Principles](#71-principles)
  - [7.2 App-server process boundary](#72-app-server-process-boundary)
  - [7.3 Diagnostic redaction](#73-diagnostic-redaction)
- [8. Data-retention model](#8-data-retention-model)
  - [8.1 In memory](#81-in-memory)
  - [8.2 On disk](#82-on-disk)
  - [8.3 Clearing and future history](#83-clearing-and-future-history)
- [9. Codex compatibility strategy](#9-codex-compatibility-strategy)
  - [9.1 Layered design](#91-layered-design)
  - [9.2 Compatibility behavior](#92-compatibility-behavior)
- [10. Read-only security boundary](#10-read-only-security-boundary)
- [11. Packaging targets](#11-packaging-targets)
  - [11.1 Required for v1](#111-required-for-v1)
  - [11.2 Deferred](#112-deferred)
- [12. Quality and accessibility requirements](#12-quality-and-accessibility-requirements)
- [13. Acceptance criteria](#13-acceptance-criteria)
  - [13.1 Data correctness](#131-data-correctness)
  - [13.2 Compatibility and resilience](#132-compatibility-and-resilience)
  - [13.3 Privacy and security](#133-privacy-and-security)
  - [13.4 User experience](#134-user-experience)
  - [13.5 Build and packaging](#135-build-and-packaging)
- [14. Proposed implementation phases after approval](#14-proposed-implementation-phases-after-approval)
- [15. Approval decisions](#15-approval-decisions)

## 1. Product summary

TokenTrail is a privacy-first native KDE application that helps Linux users understand their Codex usage. It reads usage information from the locally authenticated Codex app-server, presents reported values faithfully, and explains calculated values in plain language.

TokenTrail is a Codex usage dashboard. It is not an OpenAI API billing dashboard and does not claim to expose every ChatGPT product or model limit.

The first release is intentionally read-only. It may observe and explain account data, but it must not change an account, consume credits, alter Codex tasks, or handle authentication credentials.

## 2. Intended user

The primary user runs Codex on Linux and wants straightforward answers to questions such as:

- How much of each Codex quota window remains?
- When does each window reset?
- Am I currently blocked, and why?
- How many tokens have been reported for recent days and over the account lifetime?
- Which values came directly from Codex and which were calculated by TokenTrail?
- Why do token counts and quota percentages not move together?

The interface should be useful without requiring knowledge of APIs, token accounting, or the Codex protocol.

## 3. v1 goals

### 3.1 Reliable quota status

- Discover and display every quota bucket reported by Codex, grouped by limit ID.
- Display primary and secondary windows without assuming that either has a particular duration.
- Label windows using their reported duration, with a human-friendly description when possible.
- Show used percentage, calculated remaining percentage, reset date and time, and reset countdown.
- Explain blocked states, rate-limit reasons, and spend-control states when supplied.
- Handle multiple plans, limit names, and missing fields without producing misleading values.

### 3.2 Account usage and credits

- Display reported daily token buckets, lifetime tokens, peak daily tokens, current and longest streaks, and longest-running turn when available.
- Show simple summaries derived from reported daily buckets: today, current calendar week, current calendar month, and 7- and 30-day totals.
- Display credit balance, unlimited-credit state, individual spending controls, remaining spending percentage, reset time, and reset-credit details when supplied.
- Keep all credit features read-only.

### 3.3 Clear explanations and provenance

- Give a concise plain-language status on the Overview screen.
- Explain quota windows, resets, blocked states, credits, tokens, and the distinction between Codex plan usage and OpenAI API usage.
- Assign every displayed metric one provenance state: OpenAI-reported, locally observed, calculated by TokenTrail, or unavailable.
- Visually distinguish estimates and calculations from reported facts.
- Explain unavailable metrics instead of silently hiding important gaps.

### 3.4 KDE-native experience

- Use Qt 6, C++20, KDE Kirigami 6, and CMake.
- Follow KDE system colors and light/dark appearance.
- Provide responsive layouts suitable for common desktop window sizes.
- Represent loading, offline, signed-out, incompatible-protocol, empty, partial-data, and error states clearly.
- Refresh automatically at a conservative interval and allow manual refresh.

### 3.5 Privacy and compatibility

- Work with the user's existing local Codex authentication without reading, copying, displaying, or storing credentials.
- Keep protocol details behind a compatibility adapter.
- Detect methods and fields at runtime and degrade gracefully when they are unavailable.
- Avoid collecting task titles, project names, paths, Git data, prompts, or response content in v1.
- Store no usage history by default in v1.

## 4. Explicit non-goals for v1

The following are outside the first release:

- Changing any Codex or OpenAI account setting.
- Consuming or redeeming a quota-reset credit.
- Sending prompts, starting tasks, editing tasks, pinning, archiving, or otherwise controlling Codex.
- Reading or storing Codex or ChatGPT authentication credentials.
- Browser-cookie scraping or browser automation.
- OpenAI API billing, API key management, API RPM/TPM limits, or cost estimation.
- Claiming coverage of all ChatGPT model or product quotas.
- Persistent task, project, turn, source, Git, or subagent analytics.
- Reading prompt or response content.
- Forecasting exhaustion, burn rate, safe daily allowance, or confidence-based projections. These require sufficient retained history and belong in a later opt-in analytics release.
- Background system-tray operation, notifications, start-at-login, or a Plasma widget.
- Automatic upload, telemetry, crash reporting, or cloud synchronization.
- Flatpak, Debian, RPM, or distribution-store publishing.
- Mobile, Windows, or macOS support.

These exclusions keep v1 focused on trustworthy interpretation of current, locally available Codex data. They can be revisited after the protocol adapter and privacy model have proven stable.

## 5. Screen structure

The main navigation contains six destinations. The default destination is Overview.

### 5.1 Overview

Purpose: answer “What is my Codex usage status?” at a glance.

Content:

- Account and plan label, if reported.
- A primary status card chosen from the available quota buckets without concealing the others.
- Remaining percentage, duration label, reset time, and countdown.
- Plain-language status and any blocked-state explanation.
- Compact cards for other reported quota windows.
- Tokens reported today and lifetime, if available.
- Credit or spending warning, if applicable.
- Last successful refresh time and data-source state.

The UI must say how the primary card was selected. A default selection may prefer the server-designated primary quota, but the user can view all buckets and the app must not call it “weekly” unless its duration supports that label.

### 5.2 Quota Windows

Purpose: provide a complete, faithful view of current Codex quota information.

Content:

- Sections grouped by `limitId`, with `limitName` and `planType` where reported.
- Primary and secondary windows displayed as separate cards or rows.
- Used percentage, remaining percentage, duration, absolute reset time, and countdown.
- Reached-limit type and spend-control state.
- Per-field provenance and missing-field explanations.

### 5.3 Usage

Purpose: show reported token activity without implying that tokens equal quota consumption.

Content:

- Daily token chart for the range supplied by Codex.
- Today, current calendar week, current calendar month, 7-day, and 30-day totals where the reported range is sufficient.
- Lifetime and peak-day totals.
- Current streak, longest streak, and longest-running turn.
- A persistent explanation that token totals and quota consumption are different measurements.

Calendar boundaries use the user's local timezone. The interface states when a total is incomplete because the source does not contain the full requested range.

### 5.4 Credits

Purpose: explain purchased or granted capacity separately from included quota.

Content, when reported:

- Credit availability, balance, and unlimited status.
- Individual spending limit, amount used, calculated remaining percentage, reset time, and reached state.
- Available quota-reset-credit count and each credit's title, description, status, grant time, and expiry time.
- A clear read-only notice.

No redeem, purchase, or settings controls are present.

### 5.5 Learn

Purpose: make the application understandable to a first-time user.

Content:

- How quota windows work.
- Why percentage changes can be uneven.
- Why token counts do not directly determine quota consumption.
- Included allowance versus purchased credits.
- Codex plan usage versus OpenAI API usage.
- What happens when a limit is reached.
- Provenance glossary and unavailable-data behavior.

Explanations should be available contextually from relevant metrics as well as on this screen.

### 5.6 Settings & Diagnostics

Purpose: expose safe preferences and enough diagnostic information to troubleshoot compatibility.

Settings:

- Automatic refresh on or off.
- Refresh interval, constrained to a conservative supported range.
- Time display preference: system default or explicit 12/24-hour choice if practical.
- A “Clear TokenTrail data” action that removes preferences and cached non-sensitive runtime data after confirmation.

Diagnostics:

- Codex executable discovery state and reported CLI/app-server version when available.
- Supported and unsupported protocol capabilities.
- Last refresh result, timestamp, and non-sensitive error details.
- A redacted snapshot preview and explicit user-initiated JSON export.

Raw diagnostic data must be recursively redacted before display or export. Unknown fields are treated as sensitive until explicitly classified as safe. Export never happens automatically.

## 6. Metric catalog and provenance

### 6.1 Provenance labels

| Label | Meaning | Examples |
| --- | --- | --- |
| OpenAI-reported | Received from the local Codex app-server as an account or usage value | `usedPercent`, `resetsAt`, lifetime tokens |
| Locally observed | Derived from the local environment rather than the user's account | refresh time, Codex version, connection state |
| Calculated by TokenTrail | Deterministically calculated from reported or observed inputs | remaining percentage, countdown, 7-day total |
| Unavailable | Not supplied, unsupported, invalid, or insufficient for a sound calculation | missing balance, incomplete 30-day total |

Every metric component carries provenance in the presentation model, rather than adding labels only in the visual layer. Tooltips or detail views expose the label without overwhelming the main dashboard.

### 6.2 Quota metrics

| Metric | Source | Treatment |
| --- | --- | --- |
| Limit ID, name, and plan type | OpenAI-reported | Display when present; use neutral fallback labels when absent |
| Primary/secondary designation | OpenAI-reported | Preserve designation without inventing semantic names |
| Used percentage | OpenAI-reported | Validate numeric range; display source value |
| Remaining percentage | Calculated by TokenTrail | `100 - usedPercent`, clamped only for display safety with invalid source data flagged |
| Window duration | OpenAI-reported | Preserve minutes and generate a human-readable duration |
| Reset timestamp | OpenAI-reported | Convert for display without changing the source value |
| Reset countdown | Calculated by TokenTrail | Reset time minus current local time |
| Reached-limit/spend-control state | OpenAI-reported | Map known values to explanations; preserve unknown values safely |

### 6.3 Usage metrics

| Metric | Source | Treatment |
| --- | --- | --- |
| Daily buckets | OpenAI-reported | Display only valid dated values |
| Lifetime tokens | OpenAI-reported | Do not recalculate from a partial daily range |
| Peak daily tokens | OpenAI-reported | Display when present |
| Current/longest streak | OpenAI-reported | Display in days |
| Longest-running turn | OpenAI-reported | Format seconds as a readable duration |
| Today/week/month totals | Calculated by TokenTrail | Sum available daily buckets; mark incomplete ranges |
| 7-/30-day totals | Calculated by TokenTrail | Sum complete source ranges only; otherwise unavailable or explicitly partial |

Turn-level input, cached-input, cache-write, output, reasoning-output, total-token, and context-window metrics are deliberately excluded from v1 because obtaining them requires task-level access, which is privacy-sensitive.

### 6.4 Credit and spending metrics

| Metric | Source | Treatment |
| --- | --- | --- |
| Availability, balance, unlimited state | OpenAI-reported | Display only when supplied |
| Spending limit and amount used | OpenAI-reported | Display in the reported unit and format |
| Remaining spending percentage | Calculated by TokenTrail | Calculate only when units and a positive limit are valid |
| Spending reset/reached state | OpenAI-reported | Explain plainly |
| Reset-credit count and metadata | OpenAI-reported | Display read-only; never invoke consumption methods |

## 7. Privacy model

### 7.1 Principles

- Local by default: data processing and presentation happen on the user's computer.
- Data minimization: request and retain only what is needed for an enabled v1 feature.
- No credentials: authentication tokens, cookies, headers, session secrets, and API keys are outside TokenTrail's data model.
- No content: prompts, responses, attachments, and generated content are never requested or stored.
- No task metadata in v1: titles, paths, project names, Git data, and relationships are not requested for analytics.
- No telemetry: TokenTrail sends no analytics or usage information to its developers or third parties.
- User-controlled export: diagnostic export requires a deliberate action and preview.

### 7.2 App-server process boundary

TokenTrail launches or connects to the supported local Codex app-server using documented local process communication. Authentication remains owned by Codex. TokenTrail sends only approved read operations and parses only their responses and update notifications.

The adapter must not log the full process environment, command-line secrets, authentication messages, or unredacted protocol payloads.

### 7.3 Diagnostic redaction

Diagnostics use an allowlist of fields proven safe for display. At minimum, the following classes are removed or replaced before data leaves the adapter:

- Tokens, cookies, authorization headers, keys, and secrets.
- Prompts, responses, message content, and attachments.
- User identifiers and account email unless a later design explicitly justifies them.
- Task titles and IDs.
- File paths, working directories, repository remotes, branches, and Git metadata.
- Unknown fields and unclassified nested objects.

The user sees the redacted content before saving it.

## 8. Data-retention model

v1 does not build a local history database.

### 8.1 In memory

- Current normalized account, quota, usage, and credit state.
- The previous state needed to update the interface cleanly.
- Non-sensitive connection and capability diagnostics.
- Redacted diagnostic preview generated on demand.

This data disappears when TokenTrail exits.

### 8.2 On disk

- User interface preferences and refresh settings.
- Non-sensitive compatibility information if needed to diagnose startup, such as the last supported Codex version and last error category.
- No raw protocol response, token bucket history, account identifier, balance history, task data, or credentials.

### 8.3 Clearing and future history

“Clear TokenTrail data” removes all settings and any non-sensitive cache owned by TokenTrail after confirmation. It does not modify Codex data.

Historical storage, retention periods, trend prediction, and task analytics require a separate opt-in design for a later release. That design must specify schema, encryption expectations, retention choices, deletion behavior, and migration before implementation.

## 9. Codex compatibility strategy

The Codex app-server interface is experimental, so protocol handling must be isolated from the rest of the application.

### 9.1 Layered design

1. **Process transport** starts and monitors the local app-server and exchanges JSON messages.
2. **Protocol client** implements request IDs, responses, notifications, errors, and timeouts.
3. **Compatibility adapter** detects supported methods and maps version-specific or renamed fields into stable internal types.
4. **Domain model** represents quotas, usage, credits, capabilities, provenance, and availability without exposing raw JSON to the UI.
5. **Presentation layer** formats and explains the stable domain model using Kirigami.

### 9.2 Compatibility behavior

- Discover capabilities where the protocol permits; otherwise probe only safe read methods and handle method-not-found responses.
- Treat every field as optional at the parsing boundary.
- Ignore unknown fields safely and preserve a non-sensitive indication that they existed for diagnostics.
- Validate types, numeric ranges, timestamps, and enum values.
- Preserve unknown enum values as “unsupported value” rather than crashing or guessing.
- Support partial success: one failed endpoint must not erase valid data from another.
- Keep method names and raw JSON keys out of QML.
- Add fixture-based adapter tests for supported responses, missing fields, additional fields, renamed-field aliases, malformed data, and method errors.
- Display an explicit compatibility message when no useful read capability is available.

Version numbers are observations used in test fixtures, not hard minimums unless testing proves a minimum is necessary.

## 10. Read-only security boundary

v1 uses a deny-by-default method policy.

Allowed protocol operations:

- Read current account information needed to describe plan and connection state.
- Read rate limits and receive their update notifications.
- Read account usage.
- Perform protocol initialization and capability discovery required for those reads.

Disallowed operations include all methods that mutate state, consume credits, send user content, or operate on tasks. The exact allowlist is centralized in the protocol adapter and covered by automated tests.

Additional requirements:

- The general UI cannot submit arbitrary protocol method names or JSON payloads.
- Diagnostic tools cannot bypass the allowlist.
- No “advanced” switch enables write methods.
- Unexpected server-initiated requests are rejected unless explicitly required and audited for safe read-only operation.
- Logs contain categories and redacted summaries, not raw payloads.
- Export is local, explicit, redacted, and never automatic.
- TokenTrail does not request administrator privileges.

Any future write action, including redeeming a reset credit, requires a separate product design, threat review, explicit confirmation flow, and user approval before implementation.

## 11. Packaging targets

### 11.1 Required for v1

- Reproducible source build with CMake and documented dependencies.
- Install and uninstall rules for the executable and application resources.
- Freedesktop desktop entry.
- AppStream metadata.
- Application icons at appropriate sizes plus a scalable source.
- Arch Linux packaging instructions or a PKGBUILD suitable for local validation.
- AppImage build and smoke-test instructions, with a produced artifact when the build environment supports it.
- CI checks for build, unit tests, and packaging metadata on a supported Linux environment.

### 11.2 Deferred

- AUR publication.
- GitHub release publication and signing.
- Flatpak, because host access to the Codex executable and authenticated local session needs a deliberate sandbox design.
- Debian, Ubuntu, Fedora, and other distribution-native packages.
- Store submissions.

Building packaging artifacts locally is within the release work; publishing them remains a separate, explicitly approved action.

## 12. Quality and accessibility requirements

- Keyboard navigation reaches every interactive control in a logical order.
- Controls and charts have accessible names and non-color-only status indicators.
- Text remains readable with KDE font scaling and common high-contrast themes.
- Percentages, dates, times, numbers, and durations use the system locale where practical.
- Charts have textual summaries and useful empty states.
- The main screen remains usable when some or all optional fields are absent.
- User-facing errors describe what happened, what remains available, and a safe next step.

## 13. Acceptance criteria

v1 is acceptable when all of the following are demonstrated.

### 13.1 Data correctness

- Given fixture responses with multiple limit IDs and primary/secondary windows, every bucket appears in the correct group.
- Remaining quota is calculated as `100 - usedPercent` and labeled as calculated.
- Window labels follow reported durations and never assume a weekly period.
- Reset timestamps and countdowns are correct across local timezone and daylight-saving transitions.
- Reported daily and lifetime token totals are not presented as quota consumption.
- Incomplete date ranges are identified and are not presented as complete 7- or 30-day totals.
- Credit and spending fields appear only when supplied and remain read-only.

### 13.2 Compatibility and resilience

- The app handles missing, additional, malformed, and unknown fields without crashing or inventing values.
- The app handles unsupported methods and partial endpoint failures with useful availability states.
- Fixture tests cover at least one known supported Codex response shape plus missing-field, unknown-field, malformed-data, and method-not-found cases.
- Disconnecting or stopping the app-server produces a clear offline state and recovery succeeds after it becomes available again.
- No raw protocol schema leaks into QML or screen-specific code.

### 13.3 Privacy and security

- Automated tests confirm that only allowlisted read methods can be sent.
- No task-list, task-content, mutation, or reset-credit-consumption method is invoked during normal operation or diagnostics.
- Inspection of application storage after typical use finds no credentials, raw protocol payloads, account IDs, task metadata, or usage-history database.
- Redaction tests cover nested sensitive and unknown fields.
- Diagnostic export requires user action, presents a preview, and contains no fields outside the safe allowlist.
- The application performs no telemetry or external network request of its own.

### 13.4 User experience

- A new user can identify remaining quota, window duration, reset time, and current blocked state from Overview.
- Every displayed metric exposes its provenance or unavailable reason.
- Loading, signed-out, offline, incompatible, no-data, partial-data, and stale-data states have distinct explanations.
- The Learn content clearly distinguishes Codex plan usage, token counts, purchased credits, and OpenAI API usage.
- The interface works with KDE light and dark themes, keyboard navigation, and font scaling.

### 13.5 Build and packaging

- A clean documented source build succeeds on the supported Linux test environment.
- Automated tests pass without an OpenAI API key and without requiring live account access.
- The installed desktop entry, AppStream metadata, and icon validate and launch the application.
- The Arch package and AppImage can be built and pass a basic launch smoke test where their toolchains are available.
- No artifact is published until the user separately approves publication.

## 14. Proposed implementation phases after approval

This section describes sequence only; it does not authorize implementation.

1. Establish the CMake/Qt/Kirigami shell, stable domain types, and fixture test harness.
2. Implement the app-server transport, protocol client, strict read allowlist, and compatibility adapter.
3. Build Overview and Quota Windows with complete error and availability states.
4. Add Usage, Credits, Learn, Settings, and redacted Diagnostics.
5. Complete privacy, adapter, formatting, accessibility, and resilience tests.
6. Add installation metadata and locally validate the Arch and AppImage packaging paths.
7. Review the completed release candidate before any publication or release action.

## 15. Approval decisions

Before implementation begins, the user should approve or revise these decisions:

1. **Scope:** v1 focuses on current quota, account usage, credits, explanations, and diagnostics; task analytics and forecasts are deferred.
2. **Retention:** no local usage-history database in v1.
3. **Privacy:** no task metadata or content is requested; diagnostic output uses a strict safe-field allowlist.
4. **Security:** the app-server client can call only a centralized list of read operations.
5. **Screens:** Overview, Quota Windows, Usage, Credits, Learn, and Settings & Diagnostics.
6. **Packaging:** source, local Arch packaging, and AppImage are v1 targets; publication and Flatpak are deferred.
7. **Technology:** C++20, Qt 6, KDE Kirigami 6, and CMake.

Approval of this specification authorizes planning to conclude. Implementation should start only after the user explicitly says to proceed with implementation.
