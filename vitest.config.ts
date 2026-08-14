// Import URL conversion so test setup paths remain stable outside the repository working directory.
import { fileURLToPath } from 'node:url';

// Import Vite's React transform because component tests execute the same authored JSX as the renderer build.
import react from '@vitejs/plugin-react';

// Import Vitest's typed configuration helper.
import { defineConfig } from 'vitest/config';

// Resolve the setup module from this configuration file rather than from mutable process state.
const setupFile = fileURLToPath(new URL('./tests/setup.ts', import.meta.url));

// Export one fast local test configuration for pure, security-helper, and component behavior.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [setupFile],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'tests/security/**'],
    restoreMocks: true,
    clearMocks: true,
  },
});
