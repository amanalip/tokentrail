// Import Node's synchronous reader so the authored stylesheet text can be inspected directly.
import { readFileSync } from 'node:fs';

// Import Node's path helpers so the authored stylesheet text can be inspected directly.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Import Vitest's assertion and test-case helpers through explicit imports like every other suite.
import { describe, expect, it } from 'vitest';

/**
 * Design-token contract tests.
 *
 * Responsibility: lock the renderer stylesheet's token layer so themes stay complete, component
 * rules reference tokens instead of raw values, and no remote visual dependency can appear.
 * Trust level: pure local file inspection with no DOM, network, or Electron involvement.
 * Dependencies: the authored `styles.css` beside this test. Side effects: none.
 * Denied behavior: these tests never mutate the stylesheet; failures demand an authored edit.
 */

// Read the stylesheet once for every case in this file. Vitest executes renderer tests under
// jsdom, whose `URL` global shadows Node's and resolves relative URLs against the jsdom page
// origin instead of the module path, so resolution must never use `new URL`. Passing the raw
// module URL string straight to `fileURLToPath` keeps real file semantics; the cwd fallback only
// covers exotic runners where import.meta.url loses its scheme entirely.
function resolveStylesheetPath(): string {
  if (import.meta.url.startsWith('file:')) {
    return join(dirname(fileURLToPath(import.meta.url)), 'styles.css');
  }
  return join(process.cwd(), 'src', 'renderer', 'styles.css');
}

const stylesheet = readFileSync(resolveStylesheetPath(), 'utf8');

/** Locate a selector's first occurrence or fail loudly when the structure disappears. */
function selectorIndex(selector: string): number {
  const index = stylesheet.indexOf(selector);
  if (index === -1) {
    throw new Error(`Expected selector not found in styles.css: ${selector}`);
  }
  return index;
}

/**
 * Extract one balanced declaration block starting after the first `{` at or beyond `start`.
 * Brace counting keeps extraction correct even when values contain braces-free nested functions,
 * and none of the inspected palette blocks contain nested rules.
 */
function extractBlock(start: number): string {
  const open = stylesheet.indexOf('{', start);
  let depth = 0;
  for (let cursor = open; cursor < stylesheet.length; cursor += 1) {
    const character = stylesheet[cursor];
    if (character === '{') depth += 1;
    if (character === '}') {
      depth -= 1;
      if (depth === 0) return stylesheet.slice(open + 1, cursor);
    }
  }
  throw new Error('Unterminated CSS block while extracting palette declarations.');
}

/**
 * Parse custom-property declarations from one block. Comments are stripped first, then the block
 * is split on semicolons so multi-line values such as the font stack stay single entries.
 */
function parseCustomProperties(block: string): Map<string, string> {
  const withoutComments = block.replace(/\/\*[\s\S]*?\*\//gu, '');
  const properties = new Map<string, string>();
  for (const declaration of withoutComments.split(';')) {
    // Guard both capture groups explicitly because strict index access types them as possibly
    // undefined even on a successful overall match.
    const match = declaration.match(/^\s*(--[a-z0-9-]+)\s*:\s*([\s\S]+)$/u);
    const name = match?.[1];
    const value = match?.[2];
    if (name && value) properties.set(name, value.trim());
  }
  return properties;
}

// The dark token layer is the authored default palette plus every non-color token group.
const baseLayer = parseCustomProperties(extractBlock(selectorIndex(':root')));

// The explicit light theme overrides only color roles; it must never add or drop one silently.
const lightTheme = parseCustomProperties(extractBlock(selectorIndex(":root[data-theme='light']")));

// The system fallback duplicates the light palette for users without an explicit preference.
const systemFallbackStart = selectorIndex('@media (prefers-color-scheme: light)');
const systemLight = parseCustomProperties(
  extractBlock(stylesheet.indexOf(':root:not', systemFallbackStart)),
);

// The exact set of color roles a complete theme must override, including elevation tinting.
const REQUIRED_COLOR_ROLES = Object.freeze([
  '--background',
  '--sidebar',
  '--surface',
  '--surface-raised',
  '--border',
  '--border-soft',
  '--text',
  '--muted',
  '--muted-strong',
  '--violet',
  '--mint',
  '--warning',
  '--focus',
  '--shadow',
]);

describe('design tokens', () => {
  it('defines every required non-color token group in the base layer', () => {
    // Typography, spacing, radius, elevation, focus geometry, chart, and status semantics.
    const requiredTokens = Object.freeze([
      // Typography contract.
      '--font-sans',
      '--display-number-size',
      '--display-number-tracking',
      // Spacing scale steps.
      '--space-3xs',
      '--space-2xs',
      '--space-xs',
      '--space-sm',
      '--space-md',
      '--space-lg',
      '--space-xl',
      '--space-2xl',
      // Radius scale roles.
      '--radius-cell',
      '--radius-input',
      '--radius-control',
      '--radius-inset',
      '--radius-card-small',
      '--radius-tile',
      '--radius-panel',
      '--radius-card',
      '--radius-pill',
      '--radius-circle',
      // Elevation and decorative glow.
      '--shadow',
      '--glow-brand',
      // Keyboard focus ring geometry.
      '--focus-ring-width',
      '--focus-ring-offset',
      // Chart semantics.
      '--chart-series-a',
      '--chart-series-b',
      '--chart-track',
      // Status semantics.
      '--status-success',
      '--status-warning',
      '--status-accent',
    ]);

    for (const token of requiredTokens) {
      expect(baseLayer.has(token), `missing required token ${token}`).toBe(true);
    }
  });

  it('wires status and chart semantics onto the reviewed palette primitives', () => {
    // Exact alias wiring keeps state colors and chart series from drifting apart per theme.
    expect(baseLayer.get('--status-success')).toBe('var(--mint)');
    expect(baseLayer.get('--status-warning')).toBe('var(--warning)');
    expect(baseLayer.get('--status-accent')).toBe('var(--violet)');
    expect(baseLayer.get('--chart-series-a')).toBe('var(--violet)');
    expect(baseLayer.get('--chart-series-b')).toBe('var(--mint)');
  });

  it('overrides exactly the dark palette color roles in the light theme', () => {
    // A role missing here would fall back to dark values inside the light theme; an extra role
    // would have no dark counterpart. Both directions indicate an incomplete theme.
    expect([...lightTheme.keys()].sort()).toEqual([...REQUIRED_COLOR_ROLES].sort());
    expect([...systemLight.keys()].sort()).toEqual([...REQUIRED_COLOR_ROLES].sort());

    for (const role of REQUIRED_COLOR_ROLES) {
      expect(baseLayer.has(role), `dark palette lost override target ${role}`).toBe(true);
    }
  });

  it('keeps the system light fallback byte-identical to the explicit light theme', () => {
    // The duplication is deliberate CSS (an attribute selector cannot share a media-query rule),
    // so the test enforces synchronization instead of hoping two hand-maintained lists agree.
    expect(systemLight.size).toBe(lightTheme.size);
    for (const [role, value] of lightTheme) {
      expect(systemLight.get(role), `system fallback differs for ${role}`).toBe(value);
    }
  });

  it('references radius tokens from every component rule outside the token layer', () => {
    // Remove the base layer so its definitions are exempt, then require var() or inherit for all
    // remaining border-radius declarations. New raw radii must join the scale deliberately.
    const tokenLayerEnd = stylesheet.indexOf('}', selectorIndex(':root'));
    const componentRules = stylesheet.slice(tokenLayerEnd + 1);

    const declarations = componentRules.match(/border-radius:[^;]+;/gu) ?? [];
    expect(declarations.length).toBeGreaterThan(0);
    for (const declaration of declarations) {
      expect(declaration).toMatch(/^border-radius:\s*(var\(--[a-z0-9-]+\)|inherit);$/u);
    }
  });

  it('loads no remote fonts, images, stylesheets, or any other remote reference', () => {
    // The product must render completely offline, so the stylesheet may not contain protocol
    // URLs, @import rules, or url() references of any kind; assets arrive through markup imports.
    expect(stylesheet).not.toMatch(/https?:\/\//iu);
    expect(stylesheet).not.toMatch(/@import\b/iu);
    expect(stylesheet).not.toMatch(/\burl\(/iu);
  });

  it('preserves the development smoke-test replacement contract for --mint', () => {
    // tests/development/development-renderer.spec.ts performs a literal string replacement of
    // this exact declaration to prove live theming; changing the dark mint value requires a
    // deliberate update there too, which this guard makes impossible to miss.
    expect(stylesheet).toContain('--mint: #54e5c1;');
  });
});
