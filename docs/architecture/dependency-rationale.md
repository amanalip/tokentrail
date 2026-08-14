# Token Trail Dependency Rationale

**Status:** Phase 1 selected and locked
**Last updated:** August 14, 2026

Exact versions are committed in `package.json` and `package-lock.json`. Versions were selected from the current registry on August 14, 2026, then resolved through npm's peer-dependency checks rather than forced installation.

## Runtime dependencies

| Package | Version | License | Purpose | Reason |
| --- | --- | --- | --- | --- |
| React | 19.2.8 | MIT | Renderer component model | Approved UI framework with a mature accessible testing ecosystem |
| React DOM | 19.2.8 | MIT | Renderer mounting | Official React browser renderer |
| Zod | 4.4.3 | MIT | Future boundary validation | Approved readable runtime schema system; installed before protocol contracts begin |

Vite bundles runtime dependencies into the reviewed process outputs. Raw runtime `node_modules` is excluded from the packaged ASAR to reduce size and exposed source.

## Foundation development dependencies

| Package | Version | License | Purpose | Selection note |
| --- | --- | --- | --- | --- |
| Electron | 43.4.0 | MIT | Desktop runtime | Current supported stable major from npm; Chromium 150 and Node 24 line |
| TypeScript | 6.0.3 | Apache-2.0 | Strict shared types | Newest version accepted by the selected `typescript-eslint` peer range |
| Vite | 8.2.1 | MIT | Separate main, preload, and renderer builds | Approved direct Vite approach without experimental Forge Vite abstraction |
| electron-builder | 26.15.3 | MIT | Linux packaging and fuses | Approved package matrix and direct fuse integration |
| Vitest | 4.1.10 | MIT | Unit and component tests | Shares Vite transformation behavior |
| Vitest V8 coverage | 4.1.10 | MIT | Phase test-coverage evidence | Uses the V8 runtime already executing the tests and matches the exact Vitest version |
| Playwright | 1.62.1 | Apache-2.0 | Electron, navigation, and packaged tests | Drives real renderer behavior; packaged fuses require CDP smoke harness |
| ESLint | 10.8.1 | MIT | Static code quality | Current flat-configuration lint engine |
| typescript-eslint | 8.67.0 | BSD-2-Clause | TypeScript lint parsing and rules | Current parser supporting TypeScript below 6.1, which selected TypeScript 6.0.3 |
| Prettier | 3.9.6 | MIT | Deterministic authored-code formatting | Keeps mechanical formatting separate from design decisions |
| jsdom | 30.0.1 | MIT | Renderer component test DOM | Current version compatible with the required Node 24.15 or newer toolchain |

Supporting type, React transform, testing-library, globals, hook-lint, and Electron-fuse packages are pinned in the manifest and remain development-only.

## Installation findings

- npm resolved 503 packages after adding the matching V8 coverage provider and removing the unused jest-dom matcher dependency.
- `npm audit` reported zero known vulnerabilities on August 14, 2026.
- npm blocked the transitive `electron-winstaller` install script. Token Trail does not build Windows packages in Phase 1, so the script remains unapproved.
- The first install attempt rejected TypeScript 7.0.2 because `typescript-eslint` supports TypeScript below 6.1. The project selected 6.0.3 instead of bypassing peer checks.
- Phase 1 contains no native runtime module, so electron-builder native rebuilding is disabled.

## Addition rule

A new dependency requires a written purpose, alternatives check, maintenance and license review, install-script review, package-size effect, security review, and tests demonstrating the behavior it provides.
