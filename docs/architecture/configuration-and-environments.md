# Configuration and Environments

**Status:** Phase 2 implemented configuration surface
**Last updated:** August 14, 2026 at 11:28 AM EDT

## Principle

Configuration is a capability boundary. Environment variables and launch arguments may select only predefined local behavior; they may not become arbitrary URLs, executable paths, protocol methods, fixture scripts, or filesystem roots.

## Current runtime modes

| Mode | Selection | Renderer | Codex behavior |
| --- | --- | --- | --- |
| Normal development | `npm run dev` | Exact Vite loopback URL | Real Codex discovery unless an approved fixture is selected by test orchestration |
| Built Electron test | Playwright helper | Built assets through custom protocol | Exact checked-in fixture scenario |
| Packaged smoke | electron-builder output | ASAR assets through custom protocol | Isolated empty `PATH` and `HOME`; no real Codex discovery |
| Normal packaged use | User launches package | ASAR assets through custom protocol | Trusted PATH discovery and local Codex account |

## Reviewed environment inputs

Production child creation copies only reviewed environment names needed for executable discovery, local configuration, locale, certificates, and temporary behavior. It does not inherit unrelated credential variables automatically.

The renderer development URL is parsed and accepted only when it is exactly the numeric loopback origin and root path. Packaged execution ignores it. Test fixture scenarios are matched against a frozen list, resolve one fixed repository script, and operate only when Electron is unpackaged.

Test-only Chromium debugging binds to a dynamically reserved numeric loopback port and is supplied by external harnesses. A normal user launch does not add the debugging switch. Packaged fuses keep Node inspection disabled.

## Configuration precedence

1. Packaged status decides whether development and fixture seams are available at all.
2. Trusted application constants decide scheme, host, port, channel names, protocol methods, and production arguments.
3. A validated environment value may select only an approved development or fixture option.
4. Renderer and Codex input never select configuration.

## Secrets and privacy

No Token Trail setting contains a credential. The Codex child remains responsible for its own local authentication environment. Environment values are neither logged nor forwarded to the renderer. Diagnostic exports are not implemented; Phase 3 must continue excluding environment variables.

## User preferences

Theme plumbing exists, but persisted user preferences are not implemented in Phase 2. Phase 3 will create `preferences-and-storage.md` alongside the validated preference store. That document must define schema, defaults, migrations, corruption behavior, lifetime, clear-data scope, and fields explicitly forbidden from persistence.

## Deployment configuration

Installer-specific paths, architecture selection, repository secrets, signing identity, GitHub environments, and release permissions are not current configuration. Phase 5 will document them in packaging and release architecture only after their workflows exist.

## Evidence and failure behavior

Development URL tests cover deceptive and malformed values. IPC tests cover exact origins. Main accepts only fixed fixture scenarios. Packaged tests prove fixture controls are ignored and isolate account discovery. Invalid configuration fails closed to packaged local content or normal production discovery rather than navigating or executing caller-selected input.
