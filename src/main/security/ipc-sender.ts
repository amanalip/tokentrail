// Import the fixed packaged application identity rather than accepting renderer-provided origins.
import { APPLICATION_HOST, APPLICATION_SCHEME } from './application-protocol';

// Import the exact loopback development origin selected by trusted main-process configuration.
import { DEVELOPMENT_RENDERER_ORIGIN } from './development-url';

/** Decide whether a frame URL and hierarchy identify Token Trail's approved top-level renderer. */
export function isApprovedApplicationFrameUrl(frameUrl: string, isTopLevelFrame: boolean): boolean {
  // Reject every subframe before parsing its location, including same-origin subframes.
  if (!isTopLevelFrame) return false;

  try {
    // Parse structurally so prefix lookalikes and malformed input cannot pass authorization.
    const parsedUrl = new URL(frameUrl);

    // Accept only the exact packaged scheme, host, root path, and empty query. The URL fragment is
    // deliberately ignored because Token Trail's reviewed hash navigation keeps route identifiers
    // there; a fragment never leaves the renderer, cannot select a different document, and carries
    // no authorization meaning, so requiring an empty hash would deny every post-navigation call.
    const isPackagedApplication =
      parsedUrl.protocol === `${APPLICATION_SCHEME}:` &&
      parsedUrl.host === APPLICATION_HOST &&
      parsedUrl.pathname === '/' &&
      parsedUrl.search === '';

    // Accept only the exact Vite origin and its root document during unpackaged development.
    const isDevelopmentApplication =
      parsedUrl.origin === DEVELOPMENT_RENDERER_ORIGIN &&
      parsedUrl.pathname === '/' &&
      parsedUrl.search === '';

    // Deny every other port, host, scheme, path, and query regardless of fragment.
    return isPackagedApplication || isDevelopmentApplication;
  } catch {
    // Malformed URLs are untrusted and therefore denied.
    return false;
  }
}
