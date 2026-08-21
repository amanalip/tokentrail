// Import Playwright's user-visible assertions and test lifecycle.
import { expect, test, type Page } from '@playwright/test';

// Import the shared built-application launcher.
import { launchBuiltApplication } from '../helpers/launch-electron';

/**
 * Keyboard-only workflow evidence for plan section 8.3.
 *
 * Every activation in this suite goes through Tab, Shift+Tab, Arrow, Space, or Enter events on
 * the real built application; no pointer input is used anywhere. This proves each primary
 * workflow completes by keyboard alone, which is a Phase 4 exit criterion.
 */

// Describe the currently focused element with only serializable facts so Node-side predicates
// can match it without reaching into the page between presses.
interface FocusInfo {
  readonly tag: string;
  readonly id: string;
  readonly text: string;
  readonly label: string;
  readonly ariaLabel: string;
  readonly type: string;
  readonly checked: boolean | null;
}

async function readFocus(page: Page): Promise<FocusInfo> {
  return page.evaluate(() => {
    const element = document.activeElement;
    // Form controls carry their name on the wrapping label, not on their own textContent.
    const labelText =
      element instanceof HTMLInputElement
        ? (element.closest('label')?.textContent ?? '').trim()
        : '';
    return {
      tag: element?.tagName.toLowerCase() ?? '',
      id: element?.id ?? '',
      text: (element?.textContent ?? '').trim(),
      label: labelText,
      ariaLabel: element?.getAttribute('aria-label') ?? '',
      type: element?.getAttribute('type') ?? '',
      checked:
        element instanceof HTMLInputElement && element.type === 'radio' ? element.checked : null,
    };
  });
}

/** Press Tab (or Shift+Tab) until the focused element satisfies the predicate. */
async function tabUntil(
  page: Page,
  predicate: (info: FocusInfo) => boolean,
  { reverse = false, maxSteps = 120 } = {},
): Promise<void> {
  for (let step = 0; step < maxSteps; step += 1) {
    if (predicate(await readFocus(page))) return;
    await page.keyboard.press(reverse ? 'Shift+Tab' : 'Tab');
  }
  // One final check after the last press so boundary cases resolve.
  expect(predicate(await readFocus(page)), 'tab walk exhausted before finding target').toBe(true);
}

/**
 * Return focus to the document body so the next forward walk starts from the first control.
 * Programmatic focus moves (such as the skip link landing on main, the last landmark) otherwise
 * leave forward Tab order pointing past every control.
 */
async function restartTabOrder(page: Page): Promise<void> {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
}

/** Strip the decorative navigation marker so link text comparisons stay exact. */
function navText(info: FocusInfo): string {
  return info.text.replace(/^[○◉]/u, '');
}

test('completes every primary workflow through keyboard events alone', async () => {
  // Start one built application wired to the full fixture scenario for real data states.
  const electronApplication = await launchBuiltApplication('full');

  try {
    const page = await electronApplication.firstWindow();
    await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();

    // --- Skip link ---------------------------------------------------------------
    // The first Tab stop must be the content bypass; activating it moves focus into main.
    await page.keyboard.press('Tab');
    expect((await readFocus(page)).text).toBe('Skip to content');

    // Keyboard focus must remain visibly outlined on this control.
    const focusOutline = await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement as Element);
      return { style: style.outlineStyle, width: style.outlineWidth };
    });
    expect(focusOutline.style).not.toBe('none');
    await page.keyboard.press('Enter');
    // Focus movement from the click handler lands within the same task; poll so the assertion
    // never races the event dispatch.
    await expect
      .poll(() => readFocus(page).then((info) => info.id), { timeout: 3_000 })
      .toBe('overview');

    // --- Overview refresh ----------------------------------------------------------
    await restartTabOrder(page);
    await tabUntil(page, (info) => info.tag === 'button' && /refresh/i.test(info.text));
    await page.keyboard.press('Enter');
    // The refresh completes against the fixture server; the control must return to ready.
    await expect(page.getByRole('button', { name: /refresh/i })).toBeEnabled({ timeout: 10_000 });

    // --- Usage view toggle and scrollable table -----------------------------------
    await restartTabOrder(page);
    await tabUntil(page, (info) => navText(info) === 'Usage');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1, name: 'Usage' })).toBeVisible();

    // Route changes move keyboard focus onto the new route's heading by design.
    expect(await readFocus(page)).toMatchObject({ tag: 'h1', text: 'Usage' });

    await tabUntil(page, (info) => info.tag === 'button' && info.text === 'Table');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('region', { name: 'Daily usage table' })).toBeVisible();

    // The bounded scroll region is itself focusable so keyboard users can scroll wide data.
    await tabUntil(page, (info) => info.tag === 'div' && info.ariaLabel === 'Daily usage table');
    expect((await readFocus(page)).ariaLabel).toBe('Daily usage table');

    await tabUntil(page, (info) => info.tag === 'button' && info.text === 'Chart');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('img', { name: /Bar chart of daily token totals/ })).toBeVisible();

    // --- Settings mutations ---------------------------------------------------------
    await restartTabOrder(page);
    await tabUntil(page, (info) => navText(info) === 'Settings & Diagnostics');
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Settings & Diagnostics' }),
    ).toBeVisible();

    // Theme radio group: arrows move within the group; selecting Dark flips the root attribute.
    // Preference saves cross the IPC boundary asynchronously, so every observable assertion polls
    // instead of assuming an immediate render.
    await tabUntil(page, (info) => info.type === 'radio' && info.label.startsWith('System'));
    await page.keyboard.press('ArrowDown'); // System -> Light
    await page.keyboard.press('ArrowDown'); // Light -> Dark
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset['theme'] ?? ''), {
        timeout: 5_000,
      })
      .toBe('dark');

    // Motion radio group: selecting Reduced applies the explicit reduced-motion class.
    // Group order is System, Reduced, Full, so one arrow step lands on Reduced.
    await tabUntil(page, (info) => info.type === 'radio' && info.label.startsWith('System'));
    await page.keyboard.press('ArrowDown');
    await expect
      .poll(
        () =>
          page.evaluate(() =>
            document.querySelector('.app-shell')?.classList.contains('motion-reduced')
              ? 'reduced'
              : 'other',
          ),
        { timeout: 5_000 },
      )
      .toBe('reduced');

    // Automatic refresh toggle plus its numeric interval via native spin keys.
    await tabUntil(page, (info) => info.type === 'checkbox');
    await page.keyboard.press('Space');
    const intervalBefore = await page.evaluate(() => {
      const input = document.querySelector<HTMLInputElement>('input[type="number"]');
      return input?.value ?? '';
    });
    await tabUntil(page, (info) => info.type === 'number');
    await page.keyboard.press('ArrowUp');
    let intervalAfter = intervalBefore;
    await expect
      .poll(
        async () => {
          intervalAfter = await page.evaluate(() => {
            const input = document.querySelector<HTMLInputElement>('input[type="number"]');
            return input?.value ?? '';
          });
          return Number(intervalAfter) > Number(intervalBefore);
        },
        { timeout: 5_000 },
      )
      .toBe(true);

    // --- Diagnostics preview --------------------------------------------------------
    await tabUntil(page, (info) => info.tag === 'button' && info.text === 'Diagnostics');
    await page.keyboard.press('Enter');
    await tabUntil(page, (info) => info.tag === 'button' && info.text === 'Build preview');
    await page.keyboard.press('Enter');
    // The preview crosses the IPC boundary before the region renders, so poll for its content.
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const region = document.querySelector('[aria-label="Diagnostics preview"]');
            return region?.textContent?.length ?? 0;
          }),
        { timeout: 5_000 },
      )
      .toBeGreaterThan(10);

    // Export stays disabled-safe until a preview exists; it is enabled now but is never
    // activated here because that opens a native dialog owned by the operating system.
    await expect(page.getByRole('button', { name: 'Export…' })).toBeEnabled();

    // --- Clear-data confirmation flow ----------------------------------------------
    await tabUntil(page, (info) => info.tag === 'button' && info.text === 'Preferences');
    await page.keyboard.press('Enter');
    await tabUntil(page, (info) => info.tag === 'button' && info.text === 'Clear data');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('alertdialog')).toBeVisible();

    // The dialog's confirm button shares its label with the removed trigger; walk to Cancel to
    // prove the dialog offers an escape, then walk back and confirm the destructive action.
    await tabUntil(page, (info) => info.tag === 'button' && info.text === 'Cancel');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('alertdialog')).toHaveCount(0);

    await tabUntil(page, (info) => info.tag === 'button' && info.text === 'Clear data');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await tabUntil(page, (info) => info.tag === 'button' && info.text === 'Clear data');
    await page.keyboard.press('Enter');

    // Clearing restores defaults: the explicit dark theme attribute is removed again.
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset['theme'] ?? ''), {
        timeout: 5_000,
      })
      .toBe('');
  } finally {
    // Close the owned Electron process even when an assertion fails.
    await electronApplication.close();
  }
});
