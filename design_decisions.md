# TokenTrail Design Decision Log

This document records product and technical design decisions in chronological order. Times use the `America/Toronto` timezone. Entries marked **Proposed** or **Under evaluation** are not authorization to implement them.

## Contents

- [Decision status guide](#decision-status-guide)
- [001 - Initial KDE-native application direction](#001---initial-kde-native-application-direction)
  - [Proposed KDE specification](#proposed-kde-specification)
  - [KDE reference links](#reference-links)
  - [Decision outcome](#decision-outcome)
- [002 - Electron alternative and framework comparison](#002---electron-alternative-and-framework-comparison)
  - [Electron benefits and trade-offs](#electron-benefits-and-trade-offs)
  - [Visual-library comparison](#visual-library-comparison)
  - [Electron reference links](#reference-links-1)
  - [Evaluation outcome](#evaluation-outcome)
- [Pending framework decision](#pending-decision)
- [003 - Logo concept evolution and approved Tracked Trail direction](#003---logo-concept-evolution-and-approved-tracked-trail-direction)
  - [First proposal: Escaping Trail](#first-proposal---escaping-trail)
  - [Revised proposal: Tracked Trail](#revised-proposal---tracked-trail)
  - [Approved visual treatment](#approved-visual-treatment)
  - [Current assets](#current-assets)
- [004 - Repository writing style](#004---repository-writing-style)

## Decision status guide

| Status | Meaning |
| --- | --- |
| Proposed | A recommended direction awaiting explicit approval. |
| Under evaluation | An option being compared; no selection has been made. |
| Approved | The user explicitly accepted the decision. |
| Superseded | A later approved decision replaced this one. |

---

## 001 - Initial KDE-native application direction

**Recorded:** August 13, 2026 at 4:13 PM EDT (`America/Toronto`, UTC-04:00)
**Historical note:** This direction was inherited from the earlier TokenTrail project handoff. Its original decision time was not recorded, so the timestamp above is when it was added to this log.
**Status:** Proposed; not yet approved for implementation

### Context

TokenTrail is intended to be a privacy-first desktop dashboard that reads and explains locally available Codex usage information. The original direction emphasized a native KDE experience for Linux users, particularly on KDE Plasma.

### Proposed KDE specification

| Area | Proposed choice |
| --- | --- |
| Product type | Native KDE desktop application |
| Primary platform | Linux, with [KDE Plasma](https://kde.org/plasma-desktop/) as the best-integrated environment |
| Language | [C++20](https://en.cppreference.com/w/cpp/20.html) for application and protocol logic |
| UI language | [QML](https://doc.qt.io/qt-6/qmlapplications.html) |
| UI framework | [Qt 6](https://doc.qt.io/qt-6/), [Qt Quick Controls](https://doc.qt.io/qt-6/qtquickcontrols-index.html), and [KDE Kirigami](https://develop.kde.org/docs/getting-started/kirigami/) |
| Charts | Prefer [Qt Graphs 2D](https://doc.qt.io/qt-6/qtgraphs-overview-2d.html) or [KQuickCharts](https://api.kde.org/) after a small prototype validates appearance, accessibility, packaging, and licensing requirements |
| Build system | [CMake](https://cmake.org/cmake/help/latest/) |
| Codex integration | Launch or connect to the local Codex app-server and communicate over its JSON protocol |
| Security model | Central read-method allowlist; no credentials, mutations, arbitrary protocol calls, remote content, or telemetry |
| Packaging direction | Source build, [Arch PKGBUILD](https://wiki.archlinux.org/title/PKGBUILD), and [AppImage](https://docs.appimage.org/) first; [Flatpak](https://docs.flatpak.org/) only after host Codex access is designed safely |
| Desktop integration | KDE colors and themes, native settings conventions, desktop entry, [AppStream metadata](https://www.freedesktop.org/software/appstream/docs/), icons, and later optional tray or notifications |

[Kirigami](https://develop.kde.org/docs/getting-started/kirigami/) is built on QML and [Qt Quick Controls](https://doc.qt.io/qt-6/qtquickcontrols-index.html) for responsive interfaces. [KDE Frameworks](https://develop.kde.org/products/frameworks/) adds libraries for configuration, icons, internationalization, system integration, and other desktop needs. [Qt Graphs](https://doc.qt.io/qt-6/qtgraphs-index.html) provides QML chart types for area, bar, donut, line, pie, scatter, and spline graphs.

### Benefits

- Best match for a Linux-first, KDE-native product identity.
- Strong integration with KDE themes, system colors, icons, accessibility conventions, settings, notifications, and desktop behavior.
- Typically a smaller runtime footprint than bundling a Chromium-based desktop runtime, although the final result must be measured rather than assumed.
- C++ and Qt are a natural fit for managing a long-running local subprocess and typed JSON protocol adapter.
- The renderer has no web-to-Node privilege bridge, reducing the number of security boundaries the application must design and audit.
- Source packages can reuse Qt and KDE libraries already supplied by many Linux distributions.

### Costs and risks

- QML/Kirigami has a smaller collection of polished dashboard templates and visualization packages than the web/npm ecosystem.
- Highly customized charts, transitions, gradients, heatmaps, and dashboard widgets may require more bespoke QML work.
- C++/QML development has a steeper learning curve for a first application project.
- Cross-platform builds are possible with Qt, but KDE integration, dependencies, testing, and packaging make Linux the practical v1 focus.
- Some Qt/KDE modules may not be installed by default on every distribution and must be documented or packaged.
- Visual quality depends on deliberate design work; choosing a native toolkit does not automatically produce a polished interface.

### Visual-library assessment

The KDE/Qt stack has enough capability to build TokenTrail well: [Kirigami](https://develop.kde.org/docs/getting-started/kirigami/) for application structure, [Qt Quick](https://doc.qt.io/qt-6/qtquick-index.html) for custom visuals, [Qt Graphs](https://doc.qt.io/qt-6/qtgraphs-index.html) or [KQuickCharts](https://api.kde.org/) for charts, and [KDE Frameworks](https://develop.kde.org/products/frameworks/) for desktop integration. It does **not** offer as many ready-made dashboard themes, component kits, or specialized visualization libraries as the web ecosystem.

### Reference links

- [Kirigami getting-started guide](https://develop.kde.org/docs/getting-started/kirigami/): responsive layout, QML, Qt Quick Controls, and C++ integration.
- [KDE Frameworks overview](https://develop.kde.org/products/frameworks/): KDE's Qt-based desktop libraries.
- [KDE API library index](https://api.kde.org/): API entry point for KDE Frameworks, including KQuickCharts.
- [Qt Graphs overview](https://doc.qt.io/qt-6/qtgraphs-index.html): supported 2D and 3D graph modules.
- [Qt Graphs 2D guide](https://doc.qt.io/qt-6/qtgraphs-overview-2d.html): area, bar, donut, line, pie, scatter, and spline chart types.

### Decision outcome

The KDE-native direction remains a strong candidate, but it is not final. No KDE application implementation is authorized by this entry.

---

## 002 - Electron alternative and framework comparison

**Recorded:** August 13, 2026 at 4:15 PM EDT (`America/Toronto`, UTC-04:00)
**Status:** Under evaluation; not approved for implementation

### Context

[Electron](https://www.electronjs.org/docs/latest/) was raised as an alternative because TokenTrail is a visual dashboard and may benefit from the web ecosystem's large selection of UI systems, chart libraries, animation tools, and reusable dashboard patterns.

Electron embeds Chromium and Node.js, allowing a desktop interface to use HTML, CSS, and JavaScript or TypeScript on Linux, Windows, and macOS. Its [process model](https://www.electronjs.org/docs/latest/tutorial/process-model) separates the privileged main process from renderer processes, so TokenTrail's Codex subprocess access would belong in the main process rather than the visual renderer.

### Proposed Electron specification, if selected

| Area | Proposed choice |
| --- | --- |
| Product type | Cross-platform [Electron](https://www.electronjs.org/docs/latest/) desktop application with a locally bundled web interface |
| Primary platforms | Linux first, with Windows and macOS builds possible after Codex compatibility is verified on each platform |
| Language | [TypeScript](https://www.typescriptlang.org/docs/) |
| Desktop runtime | [Electron](https://www.electronjs.org/docs/latest/) |
| UI framework | [React](https://react.dev/learn) with [Vite](https://vite.dev/guide/) |
| Styling | CSS design tokens plus either carefully selected accessible primitives or a small component system; avoid stacking multiple overlapping UI kits |
| Charts | [Apache ECharts](https://echarts.apache.org/handbook/en/get-started/) or [Chart.js](https://www.chartjs.org/docs/latest/) for standard dashboard charts; [D3](https://d3js.org/getting-started) only for genuinely custom visualizations; final choice requires a prototype |
| State/data boundary | Typed domain objects shared by contract, with raw Codex protocol JSON confined to the main process adapter |
| Codex integration | Main process owns the local Codex app-server subprocess and JSON protocol client |
| Renderer bridge | A minimal, typed [`contextBridge`](https://www.electronjs.org/docs/latest/api/context-bridge) API exposing only specific read operations and sanitized update events |
| Security | Follow Electron's [security checklist](https://www.electronjs.org/docs/latest/tutorial/security): renderer sandbox and context isolation enabled, Node integration disabled, strict Content Security Policy, local packaged assets only, no remote navigation, IPC input validation, and no telemetry |
| Packaging | [Electron Forge](https://www.electronforge.io/) or an equivalent maintained packager; Linux [AppImage](https://docs.appimage.org/) or package first, with platform-specific signing and installers if other operating systems are later supported |

### Electron benefits and trade-offs

| Dimension | Electron benefits | Electron costs or risks | Effect on TokenTrail |
| --- | --- | --- | --- |
| Visual libraries | Large web/npm ecosystem for charts, heatmaps, sparklines, tooltips, animation, layout, icons, and accessible components | More choice means more dependency evaluation, inconsistent styling risk, and ongoing update work | Strong candidate for producing sophisticated dashboard visuals quickly; prototype evidence is still needed |
| Custom appearance | HTML, CSS, SVG, Canvas, and WebGL allow almost any visual design | A heavily custom UI can feel unlike the user's desktop and needs careful accessibility work | Strong for a distinctive TokenTrail brand rather than a strictly native KDE look |
| Charting | Mature options such as [ECharts](https://echarts.apache.org/handbook/en/get-started/), [Chart.js](https://www.chartjs.org/docs/latest/), [D3](https://d3js.org/getting-started), [Plotly.js](https://plotly.com/javascript/), [Recharts](https://recharts.github.io/en-US/guide/getting-started/), and [visx](https://airbnb.io/visx/) | Libraries vary in size, license, accessibility, rendering method, and maintenance | Wider choice for trends, calendar heatmaps, interactive tooltips, and future analytics |
| Development speed | TypeScript and web tooling make UI iteration, testing, and prototyping fast | Electron adds main/preload/renderer architecture and IPC contracts | Likely faster for visual iteration, especially if contributors know web development |
| Cross-platform reach | One main web UI codebase can target Linux, Windows, and macOS | Each platform still needs testing, packaging, signing, and verification that local Codex integration works | Better long-term reach, but not automatically “build once, done” |
| KDE integration | Can support tray, notifications, file dialogs, and system theme detection | Controls and behavior are not truly Kirigami-native; Plasma theme fidelity requires custom work | Adequate desktop integration but weaker KDE identity |
| Runtime footprint | Consistent bundled browser behavior reduces rendering differences | Electron bundles Chromium and Node.js and uses a multi-process architecture, which can increase download size and memory use | Potential disadvantage for a small background usage dashboard; must be benchmarked |
| Security boundary | Electron supports renderer sandboxing, context isolation, CSP, and narrow preload bridges | The privileged main process plus IPC bridge creates a larger attack surface if designed loosely; dependencies require prompt updates | Safe enough when rigorously configured, but stricter architecture and update discipline are essential |
| Distribution | [Electron Forge](https://www.electronforge.io/) can create installers and packages for several operating systems | Electron core does not bundle distribution tooling; packagers, code signing, and per-platform makers add complexity | Strong tooling, but public multi-platform releases still require substantial work |
| Linux dependencies | Bundled runtime gives consistent visual rendering across distributions | Larger artifact and possible mismatch with native desktop conventions | Easier visual consistency, less native efficiency |
| Beginner experience | Web UI concepts have extensive learning resources and rapid visual feedback | npm dependency management, bundling, Electron IPC, and web security introduce their own complexity | Easier UI experimentation, but not a shortcut around architecture or security |

### Visual-library comparison

| Need | KDE/Qt options | Electron/web options | Advantage |
| --- | --- | --- | --- |
| Standard line, bar, area, pie, and scatter charts | [Qt Graphs](https://doc.qt.io/qt-6/qtgraphs-overview-2d.html), [KQuickCharts](https://api.kde.org/) | [ECharts](https://echarts.apache.org/handbook/en/get-started/), [Chart.js](https://www.chartjs.org/docs/latest/), [Recharts](https://recharts.github.io/en-US/guide/getting-started/), [visx](https://airbnb.io/visx/), [Plotly.js](https://plotly.com/javascript/), and others | Electron for selection and ready-made polish |
| Calendar heatmap | Custom QML or KQuickCharts work | Custom [D3](https://d3js.org/getting-started), ECharts, or React calendar heatmap components | Electron |
| Highly custom interactive visualization | [Qt Quick](https://doc.qt.io/qt-6/qtquick-index.html) scene graph and custom QML or C++ rendering | [D3](https://d3js.org/getting-started), SVG, Canvas, WebGL, and [Three.js](https://threejs.org/docs/) | Electron for ecosystem; both are technically capable |
| Native KDE controls and theming | [Kirigami](https://develop.kde.org/docs/getting-started/kirigami/), [Qt Quick Controls](https://doc.qt.io/qt-6/qtquickcontrols-index.html), and Breeze icons | Custom CSS and theme detection | KDE |
| Animation | QML states, transitions, animations, and scene graph | CSS animations, Web Animations, Motion libraries, SVG/Canvas tooling | Electron for library breadth; neither is inherently visually superior |
| Accessible desktop conventions | Native Qt/Kirigami semantics and KDE conventions | Web accessibility semantics plus Electron-specific testing | KDE for KDE-native behavior |
| Dashboard templates and component kits | Limited compared with web ecosystem | Large range of React and CSS component systems | Electron |

### Security requirements unique to Electron

If Electron is selected, the following become non-negotiable design decisions:

- Keep [`contextIsolation`](https://www.electronjs.org/docs/latest/tutorial/context-isolation) and [renderer sandboxing](https://www.electronjs.org/docs/latest/tutorial/sandbox) enabled.
- Keep Node integration disabled in every renderer.
- Load only packaged local application content; do not display arbitrary remote pages.
- Apply a restrictive [Content Security Policy](https://www.electronjs.org/docs/latest/tutorial/security#7-define-a-content-security-policy).
- Expose individual, validated functions through [`contextBridge`](https://www.electronjs.org/docs/latest/api/context-bridge); never expose raw `ipcRenderer`, arbitrary method names, shell execution, or generic message forwarding.
- Keep the Codex executable, subprocess, raw app-server messages, and filesystem operations in the main process.
- Validate and sanitize data on both sides of IPC, including messages originating from the renderer.
- Use the same centralized Codex read-operation allowlist proposed for the KDE architecture.
- Pin dependencies, review security advisories, update Electron promptly, and minimize third-party packages.
- Ensure diagnostic exports remain local, explicit, previewed, and recursively redacted.

[Electron's context-isolation guide](https://www.electronjs.org/docs/latest/tutorial/context-isolation) warns against exposing an unfiltered generic IPC function. TokenTrail should expose only narrow, purpose-specific calls such as `refreshUsage()` and sanitized usage-update subscriptions.

### Reference links

- [Electron introduction](https://www.electronjs.org/docs/latest/): framework overview and supported platforms.
- [Electron process model](https://www.electronjs.org/docs/latest/tutorial/process-model): main, renderer, preload, and utility processes.
- [Electron security checklist](https://www.electronjs.org/docs/latest/tutorial/security): recommended settings and unsafe patterns.
- [Electron context isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation): safe renderer and preload separation.
- [Electron IPC guide](https://www.electronjs.org/docs/latest/tutorial/ipc): communication between main and renderer processes.
- [Electron packaging tutorial](https://www.electronjs.org/docs/latest/tutorial/tutorial-packaging): packaging with Electron Forge.
- [Electron distribution overview](https://www.electronjs.org/docs/latest/tutorial/distribution-overview): packaging, signing, publishing, and updates.

### Evaluation outcome

For TokenTrail's current visual needs, this review found more ready-made chart, heatmap, animation, and dashboard options in the Electron/web ecosystem. KDE/Kirigami remains stronger for native Plasma integration, Linux desktop conventions, and avoiding a web renderer privilege bridge. Runtime differences still need to be measured with TokenTrail-specific prototypes.

For TokenTrail's currently stated identity - a privacy-first KDE dashboard for Linux - the recommended default remains **KDE/Kirigami**. If the product goal changes to prioritize a highly branded analytics interface, rapid visual experimentation, and eventual Windows/macOS distribution, **Electron becomes the stronger choice**.

This is a recommendation, not a final decision. A small visual prototype of the Overview screen in each toolkit would provide better evidence before committing to a full implementation.

---

## Pending decision

Choose the primary application framework:

1. **KDE/Kirigami:** prioritize native Linux/KDE experience, lower runtime overhead, and desktop integration.
2. **Electron:** prioritize the largest visual ecosystem, faster web-style UI iteration, and future cross-platform reach.
3. **Prototype first:** build disposable, non-functional Overview mockups in both stacks and compare appearance, accessibility, packaged size, idle memory, startup time, theming, and development complexity before approving implementation.

Until the user explicitly selects and approves one of these directions, TokenTrail remains in planning only.

---

## 003 - Logo concept evolution and approved Tracked Trail direction

**Recorded:** August 13, 2026 at 5:10 PM EDT (`America/Toronto`, UTC-04:00)
**Status:** Approved visual direction; production vector assets still pending

### Context

TokenTrail needed a distinctive identity that would remain recognizable as a small desktop icon and work coherently in both light and dark application themes. The mark also needed to communicate understanding and observation of Codex usage without looking like cryptocurrency, money, a speedometer, or a generic analytics chart.

### First proposal - Escaping Trail

The first ASCII concept placed a connected checkpoint path inside a rounded token shape and allowed the path to exit the boundary. It was described as **The Escaping Trail**: the token represented the product, checkpoints represented measurable usage over time, and the outward path suggested a trail continuing forward.

That proposal was useful exploration, but its metaphor did not match the product precisely. A path escaping the token could suggest that usage was leaking away, being depleted, or leaving the user's control. TokenTrail's purpose is to help the user **see and understand progress**, not to celebrate consumption or depict something escaping.

The concept was therefore rejected before production artwork. This was a normal ideation correction, not a design failure: naming the metaphor exposed the mismatch early enough to improve it cheaply.

### Revised proposal - Tracked Trail

The mark was revised so the complete path remains inside the rounded token boundary:

- A hollow lower-left waypoint represents the starting point.
- Two solid intermediate checkpoints represent recorded usage or observations.
- A larger concentric upper-right waypoint represents the current position.
- The rising connected path shows progression over time.
- The enclosing rounded token communicates that TokenTrail observes and explains the journey as a coherent whole.

The working concept name became **Tracked Trail**. This wording is intentionally neutral: TokenTrail tracks where usage stands without implying that more usage is inherently better.

### Approved visual treatment

| Role | Light mode | Dark mode |
| --- | --- | --- |
| Background | Cloud `#F7F9FC` | Midnight `#0B1020` |
| Token outline | Indigo `#4F46C8` | Soft violet `#9B8CFF` |
| Trail and checkpoints | Deep teal `#087F6A` | Luminous mint `#4DE1B8` |
| Wordmark | Ink `#111827` | Mist `#F4F7FB` |

The approved concept presentation uses the same geometry in both themes. The combination of indigo/violet and teal/mint preserves one identity while maintaining contrast against light and dark surfaces.

### Design constraints carried forward

- The trail must remain entirely inside the token.
- The current-position target must remain visually distinct from historical checkpoints.
- The mark must remain understandable without the `TokenTrail` wordmark at small app-icon sizes.
- The identity must avoid arrows escaping the boundary, cryptocurrency symbols, currency marks, footprints, gauges, and generic chart imagery.
- Light and dark variants must use the same geometry rather than becoming different logos.
- Future production assets should include a precise vector master, transparent-background exports, icon-only variants, monochrome variants, and tested small sizes.

### Current assets

- [Combined concept board](assets/branding/tokentrail-logo-concept-v1.png): approved side-by-side presentation.
- [Light-mode logo](assets/branding/tokentrail-logo-light.png): light panel extracted from the approved board.
- [Dark-mode logo](assets/branding/tokentrail-logo-dark.png): dark panel extracted from the approved board.

The split files are exact crops of the approved concept board, not regenerated interpretations. They retain the small icon preview and wordmark shown in the approved presentation.

### Decision outcome

The user approved the **Tracked Trail** visual direction. The earlier **Escaping Trail** proposal is retained here to explain how the metaphor improved during ideation. Approval applies to the identity concept and current visual direction; a precise production vector master and final export set still require creation and verification.

---

## 004 - Repository writing style

**Recorded:** August 13, 2026 at 5:12 PM EDT (`America/Toronto`, UTC-04:00)
**Status:** Approved

### Decision

Project documents should read like they were written by people working through real decisions together. They should be clear, direct, and specific to TokenTrail.

The following rules apply to new writing and future edits:

- Do not use em dashes.
- Avoid canned introductions, exaggerated claims, filler conclusions, and repetitive summaries.
- Do not describe ordinary choices as revolutionary, seamless, effortless, robust, or comprehensive unless evidence supports the word.
- Prefer concrete statements about what changed, why it changed, and what remains uncertain.
- Keep the user's voice and questions visible when they explain why a decision changed.
- Use headings and tables when they help readers find information, not simply to make a document look formal.
- Vary sentence length naturally and remove repeated wording during review.
- Preserve technical precision without making the prose sound legalistic or machine-generated.
- Historical commit subjects and quoted source text may be preserved exactly when accuracy requires it, but surrounding prose should still follow this style.

### Reasoning

These documents are meant to help future contributors understand how TokenTrail developed. Natural writing makes that history easier to trust and easier to read. It also prevents useful project records from turning into generic template language.

### Verification

The current Markdown files were searched for em dashes when this rule was added, and all matches were replaced with more natural punctuation. The same check should be repeated as part of future documentation reviews.
