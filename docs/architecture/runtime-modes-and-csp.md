# Runtime Modes and Content Security Policy

**Status:** Phase 2 development and production policies implemented  
**Last updated:** August 14, 2026 at 11:16 AM EDT

## Why modes are separate

Token Trail has three materially different execution paths. A passing result in one path does not prove the others.

| Mode | Renderer source | CSS behavior | Main use |
| --- | --- | --- | --- |
| Development | Fixed `127.0.0.1:5173` Vite server | Vite injects inline style elements and uses HMR WebSocket | Fast local iteration |
| Built-content Electron | Vite production output through `tokentrail://app/` | Extracted self-hosted CSS | E2E fixture coverage |
| Packaged executable | ASAR/fused product through `tokentrail://app/` | Extracted self-hosted CSS | Real package/isolation evidence |

## Production policy

Production allows application-owned scripts, styles, images, fonts, and same-origin connections. It denies inline styles, inline scripts, eval, objects, forms, frames, and remote sources. The local protocol serves only reviewed bundled paths and rejects traversal.

## Development policy

Vite's CSS update path creates inline `<style>` elements. A production `style-src 'self'` policy therefore produced an operational but unstyled Phase 1 renderer. Phase 2 uses an explicit development policy that adds only:

- `style-src 'self' 'unsafe-inline'` for Vite CSS injection;
- `ws://127.0.0.1:5173` for the fixed HMR socket.

Scripts remain self-only with no `unsafe-eval`. The development URL validator accepts only the numeric loopback host, exact port, root path, and approved HTTP scheme. Packaged execution ignores the environment development URL and never consumes the development policy.

## Test evidence

The development suite starts the same direct orchestrator used by `npm run dev`, verifies authored grid and font styles, changes a real CSS token, observes HMR without Electron restart, restores the exact source, and checks for CSP console failures.

Production policy tests assert the forbidden directives are absent. Electron security tests attempt inline `<style>` creation and an inline style attribute and verify both are rejected. Paired development and packaged screenshots show the same unavailable-state composition.

## Rule for future tooling

A development convenience may not be copied into production merely because both modes render the same application. Any future source map, debugging endpoint, network connection, worker, font, image, or style behavior must identify its exact mode and receive separate packaged evidence.
