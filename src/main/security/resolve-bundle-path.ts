// Import path operations to resolve renderer requests inside one explicit production directory.
import path from 'node:path';

/**
 * Resolve one URL pathname into the packaged renderer root without permitting absolute paths, traversal,
 * invalid encodings, or null bytes. Returning `null` gives the protocol handler a non-sensitive denial result.
 */
export function resolveBundlePath(rendererRoot: string, encodedPathname: string): string | null {
  // Decode once so encoded traversal tokens are validated in their effective filesystem form.
  let decodedPathname: string;

  try {
    // URL pathnames may contain percent encoding, so validation must operate on the decoded value.
    decodedPathname = decodeURIComponent(encodedPathname);
  } catch {
    // Reject malformed escape sequences instead of guessing how the path should be interpreted.
    return null;
  }

  // Reject null bytes before they can reach a filesystem or URL API.
  if (decodedPathname.includes('\0')) {
    return null;
  }

  // Map the application root to the one renderer entry document.
  const requestedPathname = decodedPathname === '/' ? '/index.html' : decodedPathname;

  // Prefix with a relative marker so a leading slash cannot replace the trusted renderer root.
  const candidatePath = path.resolve(rendererRoot, `.${requestedPathname}`);

  // Compute the candidate's relationship to the trusted root using the host platform's path rules.
  const relativePath = path.relative(rendererRoot, candidatePath);

  // Reject the root directory itself because the handler must serve a concrete file.
  if (relativePath.length === 0) {
    return null;
  }

  // Reject traversal and absolute results that escape the approved renderer directory.
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return null;
  }

  // Return the validated absolute path for the protocol handler's local file fetch.
  return candidatePath;
}
