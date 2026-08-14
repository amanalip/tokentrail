// Import URL conversion so the entry path is stable regardless of the shell's working directory.
import { fileURLToPath } from 'node:url';

// Import Vite's configuration helper for typed, validated build configuration.
import { defineConfig } from 'vite';

// Import the shared external list so Electron and Node capabilities remain runtime dependencies of main only.
import { nodeAndElectronExternals } from './build/vite-shared.ts';

// Resolve the main-process entry from this configuration file rather than from mutable process state.
const mainEntryPath = fileURLToPath(new URL('./src/main/index.ts', import.meta.url));

// Export a dedicated main-process build instead of using an Electron-specific Vite abstraction.
export default defineConfig({
  build: {
    // Emit the privileged main bundle into its own directory for packaging and trust-boundary inspection.
    outDir: 'dist/main',

    // Clear only the main output so other process bundles survive independent builds.
    emptyOutDir: true,

    // Disable public source maps because privileged production source should not ship accidentally.
    sourcemap: false,

    // Build one CommonJS library entry because Electron loads the package's declared `.cjs` main file.
    lib: {
      entry: mainEntryPath,
      formats: ['cjs'],
      fileName: () => 'index.cjs',
    },

    // Keep Electron and Node built-ins external so bundling cannot copy them into another trust boundary.
    rollupOptions: {
      external: nodeAndElectronExternals,
    },

    // Target the Node generation bundled by the selected Electron release without browser compatibility transforms.
    target: 'node24',
  },
});
