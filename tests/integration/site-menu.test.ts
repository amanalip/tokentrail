// @vitest-environment jsdom
import { readFile } from 'node:fs/promises';
import { expect, it, vi } from 'vitest';

it('keeps menu labels and focus consistent across toggle, link, and Escape closes', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  document.body.innerHTML =
    '<button id="nav-toggle" aria-label="Open menu" aria-expanded="false"></button><nav id="site-nav"><a href="#example">Example</a></nav>';
  try {
    window.eval(await readFile('site/script.js', 'utf8'));
    const toggle = document.querySelector('button')!;
    const nav = document.querySelector('nav')!;
    for (const close of ['toggle', 'link', 'escape']) {
      toggle.click();
      expect(toggle.getAttribute('aria-label')).toBe('Close menu');
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      if (close === 'toggle') toggle.click();
      if (close === 'link') document.querySelector('a')!.click();
      if (close === 'escape') {
        document.querySelector('a')!.focus();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(document.activeElement).toBe(toggle);
      }
      expect(nav.classList.contains('open')).toBe(false);
      expect(toggle.getAttribute('aria-label')).toBe('Open menu');
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
    }
  } finally {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  }
});
