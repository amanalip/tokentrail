// Import path conversion so Electron's network stack receives a correctly encoded local file URL.
import { pathToFileURL } from 'node:url';

// Import Electron's protocol and network APIs in the privileged main process only.
import { net, protocol } from 'electron';

// Import the single restrictive policy applied to packaged renderer responses.
import { CONTENT_SECURITY_POLICY } from './content-security-policy';

// Import the pure path guard that prevents traversal outside the renderer bundle.
import { resolveBundlePath } from './resolve-bundle-path';

// Use a product-specific scheme so the renderer never needs the broadly privileged file protocol.
export const APPLICATION_SCHEME = 'tokentrail';

// Use one fixed host so URLs outside `tokentrail://app/` have no application meaning.
export const APPLICATION_HOST = 'app';

// Keep the packaged renderer entry stable for navigation and security tests.
export const APPLICATION_URL = `${APPLICATION_SCHEME}://${APPLICATION_HOST}/`;

/**
 * Register scheme privileges before Electron becomes ready, as required by Electron's protocol lifecycle.
 * The scheme is standard and secure so browser origin checks treat it like a normal protected origin.
 */
export function registerApplicationScheme(): void {
  // Register exactly one local scheme with no service-worker, CORS bypass, or extra file privileges.
  protocol.registerSchemesAsPrivileged([
    {
      scheme: APPLICATION_SCHEME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: false,
      },
    },
  ]);
}

/**
 * Attach the packaged renderer handler after Electron is ready. The handler serves only validated files from
 * `rendererRoot`, preserves the local file response, and adds restrictive browser security headers.
 */
export function installApplicationProtocol(rendererRoot: string): void {
  // Register the fixed scheme once on the default session used by the main window.
  protocol.handle(APPLICATION_SCHEME, async (request) => {
    // Parse with the platform URL implementation instead of unsafe string prefix checks.
    const requestUrl = new URL(request.url);

    // Deny unknown hosts and non-read methods because the local bundle is a read-only resource origin.
    if (requestUrl.host !== APPLICATION_HOST || request.method !== 'GET') {
      return new Response('Not found', { status: 404 });
    }

    // Resolve and validate the requested pathname inside the packaged renderer directory.
    const filePath = resolveBundlePath(rendererRoot, requestUrl.pathname);

    // Return the same neutral denial for malformed and escaping paths.
    if (filePath === null) {
      return new Response('Not found', { status: 404 });
    }

    // Ask Chromium's network stack to read the validated local file URL.
    const fileResponse = await net.fetch(pathToFileURL(filePath).toString());

    // Copy the original response headers before applying application-owned security policy.
    const responseHeaders = new Headers(fileResponse.headers);

    // Prevent any packaged response from relaxing the renderer's code and connection policy.
    responseHeaders.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);

    // Prevent MIME guessing from turning an incorrectly typed asset into executable content.
    responseHeaders.set('X-Content-Type-Options', 'nosniff');

    // Prevent browser referrer information from leaving the local application origin.
    responseHeaders.set('Referrer-Policy', 'no-referrer');

    // Return the file body and status with the hardened headers.
    return new Response(fileResponse.body, {
      status: fileResponse.status,
      statusText: fileResponse.statusText,
      headers: responseHeaders,
    });
  });
}
