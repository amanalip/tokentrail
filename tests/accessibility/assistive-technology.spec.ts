// Import Playwright's user-visible assertions, test lifecycle, and page type.
import { expect, test, type Page } from '@playwright/test';

// Import the shared built-application launcher so observations run against the real application.
import { launchBuiltApplication } from '../helpers/launch-electron';

/**
 * Phase 4 assistive-technology observation evidence (plan section 8.3).
 *
 * Responsibility: record automatable portions of the assistive-technology campaign — the real
 * Chromium accessibility tree exposed to platform readers, rendered reduced-motion behavior
 * under media emulation, forced-colors legibility, and the structural quietness of countdown
 * updates. Trust level: read-only inspection of the built application. Dependencies: the
 * debugger channel for the raw accessibility tree; nothing is injected into page script space.
 * Denied behavior: these tests never substitute for the human Orca session, which remains
 * separately recorded manual evidence; they only verify the machine-observable substrate that
 * a screen reader consumes.
 */

/** One flattened node of the Chromium accessibility tree as returned over the debugger. */
interface AxNode {
  readonly nodeId: string;
  readonly role?: { readonly value?: string };
  readonly name?: { readonly value?: string };
}

/** Enable platform accessibility, then fetch the live Chromium accessibility tree. */
async function getAxNodes(
  page: Page,
  electronApplication: import('playwright').ElectronApplication,
) {
  // Chromium only materializes its accessibility tree for an assistive technology once the
  // application announces support, which mirrors what launching alongside Orca does.
  await electronApplication.evaluate(({ app }) => {
    app.setAccessibilitySupportEnabled(true);
  }, undefined);

  const session = await page.context().newCDPSession(page);
  await session.send('Accessibility.enable');
  const { nodes } = await session.send('Accessibility.getFullAXTree');
  return nodes as AxNode[];
}

/** Find one tree node by exact role and an optional case-insensitive name substring. */
function findNode(
  nodes: readonly AxNode[],
  role: string,
  nameSubstring?: string,
): AxNode | undefined {
  return nodes.find((node) => {
    if (node.role?.value !== role) return false;
    const name = node.name?.value ?? '';
    return nameSubstring === undefined || name.toLowerCase().includes(nameSubstring.toLowerCase());
  });
}

test('exposes the complete route set through the platform accessibility tree', async () => {
  // Launch the full fixture so data-bearing content populates every route.
  const electronApplication = await launchBuiltApplication('full');

  try {
    const page = await electronApplication.firstWindow();
    await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();

    const destinations = [
      { hash: '#overview', heading: 'Overview', extra: () => undefined },
      { hash: '#windows', heading: 'Quota Windows', extra: () => undefined },
      {
        hash: '#usage',
        heading: 'Usage',
        extra: async (current: readonly AxNode[]) => {
          // The chart alternative must be a named image in the tree, not anonymous graphics.
          expect(findNode(current, 'image', 'Bar chart of daily token totals')).toBeDefined();
        },
      },
      { hash: '#credits', heading: 'Credits and spending', extra: () => undefined },
      {
        hash: '#learn',
        heading: 'Learn',
        extra: async (current: readonly AxNode[]) => {
          expect(findNode(current, 'searchbox', 'Search explanations')).toBeDefined();
        },
      },
      {
        hash: '#settings',
        heading: 'Settings & Diagnostics',
        extra: async (current: readonly AxNode[]) => {
          expect(findNode(current, 'radio', 'Dark')).toBeDefined();
          expect(findNode(current, 'checkbox', 'Automatic refresh')).toBeDefined();
        },
      },
    ] as const;

    for (const destination of destinations) {
      await page.evaluate((hash) => {
        window.location.hash = hash;
      }, destination.hash);
      await expect(
        page.getByRole('heading', { level: 1, name: destination.heading }),
      ).toBeVisible();

      // Give the accessibility tree one frame to reflect the settled route content.
      await page.waitForTimeout(150);
      const nodes = await getAxNodes(page, electronApplication);

      expect(findNode(nodes, 'heading', destination.heading)).toBeDefined();
      await destination.extra(nodes);
    }

    // Navigation destinations themselves must be links with their product names.
    const overviewNodes = await (async () => {
      await page.evaluate(() => {
        window.location.hash = '#overview';
      });
      await page.waitForTimeout(150);
      return getAxNodes(page, electronApplication);
    })();
    expect(findNode(overviewNodes, 'link', 'Quota Windows')).toBeDefined();
    expect(findNode(overviewNodes, 'link', 'Settings & Diagnostics')).toBeDefined();
    expect(findNode(overviewNodes, 'button', 'Refresh')).toBeDefined();
  } finally {
    // Close the owned Electron process even when an assertion fails.
    await electronApplication.close();
  }
});

test('renders loading motion inert under emulated reduced motion', async () => {
  // Launch without fixture data so the loading state and its spinner genuinely appear.
  const electronApplication = await launchBuiltApplication();

  try {
    const page = await electronApplication.firstWindow();
    await expect(page.getByRole('main')).toBeVisible();

    /** Mount a probe using the shipped spinner class and report its computed animation. */
    const observeSpinner = (): Promise<{ name: string; duration: string }> =>
      page.evaluate(() => {
        const probe = document.createElement('div');
        probe.className = 'spinner';
        document.querySelector('.app-shell')?.appendChild(probe);
        const style = getComputedStyle(probe);
        const observed = { name: style.animationName, duration: style.animationDuration };
        probe.remove();
        return observed;
      });

    // Baseline: the shipped stylesheet animates the functional loading indicator.
    const baseline = await observeSpinner();
    expect(baseline.name).toBe('spin');

    // Emulated reduced motion must stop the rotation entirely, matching the static ring path.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const reduced = await observeSpinner();
    expect(['none', '0.01ms']).toContain(reduced.duration === '0.01ms' ? '0.01ms' : reduced.name);
    expect(reduced.duration === '0.9s').toBe(false);
  } finally {
    // Close the owned Electron process even when an assertion fails.
    await electronApplication.close();
  }
});

test('keeps core controls present under emulated forced colors', async () => {
  // Launch the built application and capture pre-emulation identity colors for comparison.
  const electronApplication = await launchBuiltApplication();

  try {
    const page = await electronApplication.firstWindow();
    await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();

    const naturalBackground = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );

    // Forced colors models high-contrast desktop themes where authors lose most color control.
    await page.emulateMedia({ forcedColors: 'active' });

    const observation = await page.evaluate(() => {
      const button = document.querySelector<HTMLButtonElement>('.refresh-button');
      const link = document.querySelector<HTMLAnchorElement>('.nav-item');
      return {
        forcedBodyBackground: getComputedStyle(document.body).backgroundColor,
        buttonText: button?.textContent?.trim() ?? '',
        buttonWidth: button?.offsetWidth ?? 0,
        linkText: (link?.textContent ?? '').trim(),
        linkColor: link ? getComputedStyle(link).color : '',
      };
    });

    // The UA-applied forced palette must actually replace authored backgrounds.
    expect(observation.forcedBodyBackground).not.toBe(naturalBackground);
    expect(observation.forcedBodyBackground).toMatch(/rgb\(/u);

    // Core controls keep non-empty geometry, text, and a readable foreground assignment.
    expect(observation.buttonWidth).toBeGreaterThan(0);
    expect(observation.buttonText).toContain('Refresh');
    expect(observation.linkText.length).toBeGreaterThan(0);
    expect(observation.linkColor).not.toContain('rgba(0, 0, 0, 0)');
  } finally {
    // Close the owned Electron process even when an assertion fails.
    await electronApplication.close();
  }
});

test('countdown updates stay outside live regions so they cannot chatter', async () => {
  // Launch the full fixture so the Overview renders reset countdown metrics.
  const electronApplication = await launchBuiltApplication('full');

  try {
    const page = await electronApplication.firstWindow();
    await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();

    // Every countdown-bearing element must live outside any live-region ancestry, so the
    // thirty-second clock tick can never produce repeated unsolicited announcements.
    const countdownInsideLiveRegion = await page.evaluate(() => {
      const definitions = Array.from(document.querySelectorAll('dt'));
      const targets = definitions.filter((term) => term.textContent === 'Countdown');
      if (targets.length === 0) return false;
      return targets.some((term) => {
        let cursor: Element | null = term.nextElementSibling ?? term.parentElement;
        while (cursor !== null && cursor !== document.body) {
          const live =
            cursor.getAttribute('aria-live') ??
            (cursor.getAttribute('role') === 'status' ? 'polite' : null) ??
            (cursor.getAttribute('role') === 'alert' ? 'assertive' : null);
          if (live !== null) return true;
          cursor = cursor.parentElement;
        }
        return false;
      });
    });
    expect(countdownInsideLiveRegion).toBe(false);

    // The genuine live status remains reserved for refresh-state changes, not clock ticks.
    const statusText = await page.evaluate(() => {
      const statuses = Array.from(document.querySelectorAll('[role="status"]'));
      return statuses.map((status) => status.textContent?.trim() ?? '').join('|');
    });
    expect(statusText).not.toContain('Countdown');
  } finally {
    // Close the owned Electron process even when an assertion fails.
    await electronApplication.close();
  }
});
