// @vitest-environment jsdom
import { readFile } from 'node:fs/promises';
import { afterEach, expect, it, vi } from 'vitest';

const script = await readFile('site/script.js', 'utf8');
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

it.each(['success', 'rejected', 'absent', 'throws'])(
  'reports clipboard %s honestly',
  async (mode) => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    const writeText = vi.fn(() => {
      if (mode === 'throws') throw new Error('denied');
      return mode === 'rejected' ? Promise.reject(new Error('denied')) : Promise.resolve();
    });
    vi.stubGlobal('navigator', mode === 'absent' ? {} : { clipboard: { writeText } });
    document.body.innerHTML = '<button class="copy-btn" data-copy="install command">Copy</button>';
    window.eval(script);
    const button = document.querySelector('button')!;
    button.click();
    await Promise.resolve();
    expect(button.disabled).toBe(false);
    expect(button.textContent).toBe(
      mode === 'success' ? 'Copied' : 'Copy failed: select and copy the command manually',
    );
    expect(button.classList.contains('copied')).toBe(mode === 'success');
    if (mode !== 'absent') expect(writeText).toHaveBeenCalledWith('install command');
    await vi.runAllTimersAsync();
    if (mode === 'success') expect(button.textContent).toBe('Copy');
  },
);
