// Import Playwright's typed configuration helper without importing browser capabilities into application code.
import { defineConfig } from '@playwright/test';

// Export deterministic Electron test settings shared by the e2e and security script entry points.
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  reporter: [['list']],
  outputDir: 'test-results',
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
});
