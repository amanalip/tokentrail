// Keep development navigation bound to one loopback origin that is never accepted in packaged mode.
const ALLOWED_DEVELOPMENT_ORIGIN = 'http://127.0.0.1:5173';

/**
 * Validate the optional development URL without accepting alternate hosts, ports, credentials, query strings,
 * or fragments. Returning `null` makes packaged content the safe default.
 */
export function validateDevelopmentUrl(candidate: string | undefined): string | null {
  // Treat a missing environment value as an ordinary packaged-content request.
  if (candidate === undefined) {
    return null;
  }

  try {
    // Parse the complete candidate so deceptive URL text cannot pass a prefix comparison.
    const parsedUrl = new URL(candidate);

    // Require the exact approved origin and root path with no extra URL state.
    if (
      parsedUrl.origin !== ALLOWED_DEVELOPMENT_ORIGIN ||
      parsedUrl.pathname !== '/' ||
      parsedUrl.search !== '' ||
      parsedUrl.hash !== '' ||
      parsedUrl.username !== '' ||
      parsedUrl.password !== ''
    ) {
      return null;
    }

    // Return the canonical URL form used by BrowserWindow and navigation policy.
    return parsedUrl.toString();
  } catch {
    // Reject malformed input rather than letting BrowserWindow interpret it differently.
    return null;
  }
}
