// Import Node's CommonJS bridge so the bundled axe script resolves from node_modules reliably.
import { createRequire } from 'node:module';

// Import Playwright's user-visible assertions, test lifecycle, and page type.
import { expect, test, type Page } from '@playwright/test';

// Import the shared built-application launcher.
import { launchBuiltApplication } from '../helpers/launch-electron';

// Resolve the checked-in axe browser bundle beside its installed package version.
const require = createRequire(import.meta.url);
const axeScriptPath = require.resolve('axe-core/axe.min.js');

/** The subset of an axe violation this audit records for review. */
interface AxeViolation {
  readonly id: string;
  readonly impact: 'minor' | 'moderate' | 'serious' | 'critical' | null;
  readonly help: string;
  readonly nodes: readonly { readonly target: readonly string[] }[];
}

interface AxeRunResult {
  readonly violations: readonly AxeViolation[];
  readonly passes: readonly unknown[];
}

/**
 * Phase 4 accessibility audit (plan section 8.3).
 *
 * Responsibility: run the axe-core engine against every implemented route, both settings tabs,
 * the built diagnostics preview state, and both themes on the real built application, then gate
 * the phase on zero serious or critical violations while recording every lesser finding.
 * Trust level: static in-page analysis of already-rendered content; no data leaves the process.
 * Dependencies: the pinned devDependency `axe-core` injected as a local script tag only.
 * Denied behavior: this suite never mutates preferences beyond reading rendered states, never
 * opens native dialogs, and never weakens rules silently; any exception needs a documented,
 * reviewed rule change in this file.
 */

/**
 * Inject the axe runtime once per document; the application is a single-page app.
 *
 * The packaged CSP deliberately forbids inline and eval'd page scripts, so ordinary script-tag
 * injection fails closed. Playwright's init-script channel installs through the debugger before
 * the document runs, which is outside the page's own script sources and therefore still honors
 * the security property being audited; a reload materializes the runtime for the loaded document.
 */
async function ensureAxe(page: Page): Promise<void> {
  await page.addInitScript({ path: axeScriptPath });
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();
  const ready = await page.evaluate(() => typeof (window as { axe?: unknown }).axe === 'object');
  expect(ready, 'axe runtime did not initialize after reload').toBe(true);
}

/** Run axe against the whole current document and return its violations. */
async function runAxe(page: Page): Promise<readonly AxeViolation[]> {
  return page.evaluate(async () => {
    const engine = (
      window as unknown as {
        axe: { run: (context: Element) => Promise<AxeRunResult> };
      }
    ).axe;
    const result = await engine.run(document.documentElement);
    return result.violations;
  });
}

test('records no serious or critical axe violations across routes, tabs, and themes', async () => {
  // Launch the complete fixture so every route renders real data-bearing content.
  const electronApplication = await launchBuiltApplication('full');

  try {
    const page = await electronApplication.firstWindow();
    await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();
    await ensureAxe(page);
    // Every scan accumulates here with a human-readable location label for the evidence record.
    const findings: { readonly where: string; readonly violations: readonly AxeViolation[] }[] = [];

    /** Scan the current document state under one named context label. */
    const scan = async (where: string): Promise<void> => {
      findings.push({ where, violations: await runAxe(page) });
    };

    // Scan each route after its heading renders, proving the SPA document state axe observes
    // is the settled route content rather than a transitional frame.
    const destinations = [
      { hash: '#overview', heading: 'Overview' },
      { hash: '#windows', heading: 'Quota Windows' },
      { hash: '#usage', heading: 'Usage' },
      { hash: '#credits', heading: 'Credits and spending' },
      { hash: '#learn', heading: 'Learn' },
      { hash: '#settings', heading: 'Settings & Diagnostics' },
    ] as const;

    for (const destination of destinations) {
      await page.evaluate((hash) => {
        window.location.hash = hash;
      }, destination.hash);
      await expect(
        page.getByRole('heading', { level: 1, name: destination.heading }),
      ).toBeVisible();
      await scan(destination.hash.slice(1));
    }

    // Settings owns two tabs plus a built-preview state that adds a bounded scroll region.
    await page.getByRole('button', { name: 'Diagnostics' }).click();
    await page.getByRole('button', { name: 'Build preview' }).click();
    await expect(page.getByRole('region', { name: 'Diagnostics preview' })).toBeVisible();
    await scan('settings:diagnostics-with-preview');

    // The light theme changes nearly every computed color pair, so key routes rescan under it.
    await page.evaluate(() => {
      document.querySelector<HTMLInputElement>('input[name="theme"]');
      window.location.hash = '#overview';
    });
    await page.evaluate(() => {
      document.documentElement.dataset['theme'] = 'light';
    });
    await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();
    await scan('overview:light-theme');
    await page.evaluate(() => {
      window.location.hash = '#usage';
    });
    await expect(page.getByRole('heading', { level: 1, name: 'Usage' })).toBeVisible();
    await scan('usage:light-theme');

    // Restore the authored default so later suites start from a clean attribute state.
    await page.evaluate(() => {
      delete document.documentElement.dataset['theme'];
    });

    // Record every finding of any impact so lesser results stay visible in output evidence.
    let totalFindings = 0;
    for (const { where, violations } of findings) {
      for (const violation of violations) {
        totalFindings += 1;
        process.stdout.write(
          `[axe:${where}] ${violation.impact ?? 'unknown'} ${violation.id}: ${violation.help} ` +
            `nodes=${JSON.stringify(violation.nodes.map((node) => node.target))}\n`,
        );
      }
    }
    process.stdout.write(`[axe] total violations across all scans: ${totalFindings}\n`);

    // The phase gate: nothing serious or critical may remain unreviewed.
    const blocking = findings.flatMap(({ where, violations }) =>
      violations
        .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
        .map((violation) => `${where}: ${violation.id} (${violation.help})`),
    );
    expect(blocking, `blocking axe violations: ${blocking.join('; ')}`).toEqual([]);
  } finally {
    // Close the owned Electron process even when an assertion fails.
    await electronApplication.close();
  }
});
