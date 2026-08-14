// Import the explicit lifecycle helper used to isolate renderer component tests.
import { afterEach } from 'vitest';

// Reset the document after each test so renderer cases never leak markup into a later assertion.
afterEach(() => {
  // Skip DOM cleanup for integration tests that deliberately select Vitest's Node environment.
  if (typeof document !== 'undefined') {
    document.body.innerHTML = '';
  }
});
