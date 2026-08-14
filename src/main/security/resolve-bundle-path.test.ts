// Import path helpers to create platform-correct expectations without touching the real filesystem.
import path from 'node:path';

// Import Vitest's explicit functions so the test remains readable without relying only on globals.
import { describe, expect, it } from 'vitest';

// Import the pure boundary helper under test.
import { resolveBundlePath } from './resolve-bundle-path';

// Use a fixed absolute root that represents the packaged renderer directory.
const rendererRoot = path.resolve('/application/dist/renderer');

// Group path cases around the trust-boundary behavior they protect.
describe('resolveBundlePath', () => {
  // Confirm the application origin maps only to the reviewed renderer entry document.
  it('maps the root pathname to index.html', () => {
    expect(resolveBundlePath(rendererRoot, '/')).toBe(path.join(rendererRoot, 'index.html'));
  });

  // Confirm ordinary nested Vite assets remain available inside the renderer bundle.
  it('allows a nested file inside the renderer root', () => {
    expect(resolveBundlePath(rendererRoot, '/assets/main.js')).toBe(
      path.join(rendererRoot, 'assets', 'main.js'),
    );
  });

  // Confirm literal traversal cannot escape into privileged main-process output.
  it('rejects literal parent traversal', () => {
    expect(resolveBundlePath(rendererRoot, '/../main/index.cjs')).toBeNull();
  });

  // Confirm encoded traversal is decoded before the safety decision.
  it('rejects encoded parent traversal', () => {
    expect(resolveBundlePath(rendererRoot, '/%2e%2e/main/index.cjs')).toBeNull();
  });

  // Confirm malformed URL escapes do not receive an alternate interpretation.
  it('rejects malformed percent encoding', () => {
    expect(resolveBundlePath(rendererRoot, '/%not-valid')).toBeNull();
  });

  // Confirm string termination tokens cannot reach file URL or filesystem behavior.
  it('rejects encoded null bytes', () => {
    expect(resolveBundlePath(rendererRoot, '/index.html%00.txt')).toBeNull();
  });
});
