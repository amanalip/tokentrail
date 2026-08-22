// Import filesystem readers so the guard scans authored main-process sources directly.
import { readdirSync, readFileSync, statSync } from 'node:fs';

// Import path helpers so source resolution works from any working directory.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Import Vitest's assertion and test-case helpers through explicit imports like every other suite.
import { describe, expect, it } from 'vitest';

/**
 * Wayland conduct guard (plan section 8.6).
 *
 * Responsibility: keep the main process free of window-manager assumptions that are forbidden or
 * meaningless on Wayland — absolute positioning, forced stacking, and focus acquisition. Trust
 * level: static inspection of authored sources with no Electron involvement. Dependencies: the
 * `src/main` tree beside this test. Side effects: none. Denied behavior: these tests never mutate
 * sources; a failure demands an authored change or a deliberate, documented rule revision here.
 */

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const mainSourceRoot = join(repositoryRoot, 'src', 'main');

/** Collect every authored main-process TypeScript file, excluding this test's own directory style. */
function collectMainSources(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectMainSources(fullPath));
      continue;
    }
    if (entry.endsWith('.ts') && !entry.endsWith('.test.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

// One flattened view of every authored main-process line keeps pattern checks simple and honest.
const allMainSourceLines = collectMainSources(mainSourceRoot)
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');

describe('wayland conduct', () => {
  it('never positions windows in absolute coordinates', () => {
    // Absolute placement is ignored on Wayland and produces misplaced windows on X11, so the
    // compositor owns geometry; Token Trail centers itself by simply not interfering.
    expect(allMainSourceLines).not.toMatch(/\.setPosition\s*\(/u);
    expect(allMainSourceLines).not.toMatch(/\.moveTop\s*\(/u);
    expect(allMainSourceLines).not.toMatch(/\.moveAbove\s*\(/u);
    expect(allMainSourceLines).not.toMatch(/\bcenter\s*\(\s*\)/u);
  });

  it('never steals input focus from the desktop shell or other applications', () => {
    // Focus acquisition breaks Wayland's focus-stealing prevention unless it responds to the
    // user's own action, such as launching a second instance. Every focus call line must carry
    // the conduct marker so each allowance stays visible and reviewed; blur remains banned.
    const focusLines = allMainSourceLines
      .split('\n')
      .filter((line) => /\.focus\s*\(\s*\)/u.test(line));
    expect(focusLines.length).toBeGreaterThan(0);
    for (const line of focusLines) {
      expect(line).toContain('conduct:focus');
    }
    expect(allMainSourceLines).not.toMatch(/\.blur\s*\(\s*\)/u);
  });

  it('shows its one window through frame-ready visibility instead of geometry tricks', () => {
    // The reviewed lifecycle shows the BrowserWindow only after ready-to-show; require that the
    // show call exists so future refactors cannot replace it with positioning-based approaches.
    expect(allMainSourceLines).toMatch(/\.show\s*\(\s*\)/u);
  });
});
