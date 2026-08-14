// Import path helpers so the renderer root and public asset paths do not depend on process state.
import path from 'node:path';

// Import URL conversion for stable absolute paths in an ES module configuration file.
import { fileURLToPath } from 'node:url';

// Import the official React transform plugin used by the renderer's Vite build.
import react from '@vitejs/plugin-react';

// Import Vite's typed configuration helper.
import { defineConfig } from 'vite';

// Import the separately reviewed development and packaged renderer policies.
import {
  CONTENT_SECURITY_POLICY,
  DEVELOPMENT_CONTENT_SECURITY_POLICY,
} from './src/main/security/content-security-policy.ts';

// Resolve the repository directory once from the configuration module itself.
const repositoryRoot = path.dirname(fileURLToPath(import.meta.url));

// Resolve the renderer root explicitly so Vite never treats privileged source folders as web roots.
const rendererRoot = path.join(repositoryRoot, 'src', 'renderer');

// Keep the HTML marker unique so a missing replacement fails closed instead of silently weakening policy.
const contentSecurityPolicyMarker = '__TOKENTRAIL_CONTENT_SECURITY_POLICY__';

// Export the renderer-only web build with a policy chosen from Vite's trusted command mode.
export default defineConfig(({ command }) => ({
  // Limit Vite's served and transformed application root to the sandboxed renderer directory.
  root: rendererRoot,

  // Disable broad public-directory copying so only assets imported by renderer code enter the bundle.
  publicDir: false,

  // Enable React's maintained transform and development refresh behavior.
  plugins: [
    react(),
    {
      // Give the local policy transform a stable diagnostic identity.
      name: 'tokentrail-renderer-content-security-policy',
      // Replace the inert marker before Chromium receives either development or packaged HTML.
      transformIndexHtml(html) {
        // Select the narrow development exception only while Vite itself is serving the fixed loopback origin.
        const policy =
          command === 'serve' ? DEVELOPMENT_CONTENT_SECURITY_POLICY : CONTENT_SECURITY_POLICY;

        // Fail the build or development startup if the reviewed marker disappears unexpectedly.
        if (!html.includes(contentSecurityPolicyMarker)) {
          throw new Error('Renderer CSP marker is missing from index.html.');
        }

        // Install exactly one reviewed policy string without reading environment-controlled values.
        return html.replace(contentSecurityPolicyMarker, policy);
      },
    },
  ],

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
}));
