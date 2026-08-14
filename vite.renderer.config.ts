// Import path helpers so the renderer root and public asset paths do not depend on process state.
import path from 'node:path';

// Import URL conversion for stable absolute paths in an ES module configuration file.
import { fileURLToPath } from 'node:url';

// Import the official React transform plugin used by the renderer's Vite build.
import react from '@vitejs/plugin-react';

// Import Vite's typed configuration helper.
import { defineConfig } from 'vite';

// Resolve the repository directory once from the configuration module itself.
const repositoryRoot = path.dirname(fileURLToPath(import.meta.url));

// Resolve the renderer root explicitly so Vite never treats privileged source folders as web roots.
const rendererRoot = path.join(repositoryRoot, 'src', 'renderer');

// Export the renderer-only web build.
export default defineConfig({
  // Limit Vite's served and transformed application root to the sandboxed renderer directory.
  root: rendererRoot,

  // Disable broad public-directory copying so only assets imported by renderer code enter the bundle.
  publicDir: false,

  // Enable React's maintained transform and development refresh behavior.
  plugins: [react()],

  // Bind the development server to loopback rather than exposing it on the local network.
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },

  // Build browser content into a directory that is separate from privileged bundles.
  build: {
    outDir: path.join(repositoryRoot, 'dist', 'renderer'),
    emptyOutDir: true,
    sourcemap: false,
    target: 'chrome150',
  },
});
