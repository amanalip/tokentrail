// Import Vitest's typed configuration helper for the account-free process integration suite.
import { defineConfig } from 'vitest/config';

// Export a Node-only configuration because fixture tests exercise stdio processes rather than renderer DOM code.
export default defineConfig({
  test: {
    // Keep integration discovery separate from fast source and component tests.
    include: ['tests/integration/**/*.test.ts'],
    // Execute without browser globals so accidental renderer assumptions fail immediately.
    environment: 'node',
    // Restore and clear any future mocks between fixture behaviors.
    restoreMocks: true,
    clearMocks: true,
  },
});
