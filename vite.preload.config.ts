// Import URL conversion so the preload entry resolves independently of the caller's working directory.
import { fileURLToPath } from 'node:url';

// Import Vite's typed configuration helper.
import { defineConfig } from 'vite';

// Import the same runtime external list used by main so preload never bundles Electron internals.
import { nodeAndElectronExternals } from './build/vite-shared.ts';

// Resolve the isolated preload entry from this file's stable URL.
const preloadEntryPath = fileURLToPath(new URL('./src/preload/index.ts', import.meta.url));

// Export a separate preload build so its small bridge surface can be inspected independently.
export default defineConfig({
  build: {
    // Emit preload into a dedicated directory beside the main and renderer bundles.
    outDir: 'dist/preload',

    // Clear only the preload output on each preload build.
    emptyOutDir: true,

    // Exclude source maps from the production bridge artifact.
    sourcemap: false,

    // Emit CommonJS because Electron's sandboxed preload loader supports this predictable format.
    lib: {
      entry: preloadEntryPath,
      formats: ['cjs'],
      fileName: () => 'index.cjs',
    },

    // Leave Electron and available preload-runtime built-ins outside the bundle.
    rollupOptions: {
      external: nodeAndElectronExternals,
    },

    // Use the Chromium generation bundled by Electron for syntax targeting.
    target: 'chrome150',
  },
});
