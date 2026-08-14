// Enumerate stable public error categories without exposing raw exceptions, paths, payloads, or subprocess output.
export const APPLICATION_ERROR_CATEGORIES = Object.freeze([
  'codex-not-found',
  'codex-unavailable',
  'codex-incompatible',
  'request-timeout',
  'invalid-response',
  'permission-denied',
  'internal-error',
] as const);

// Derive the renderer-safe category type from the reviewed literal list.
export type ApplicationErrorCategory = (typeof APPLICATION_ERROR_CATEGORIES)[number];

// Describe the complete public error object permitted to cross the future preload boundary.
export interface PublicApplicationError {
  // Provide only the stable category needed to select approved user-facing copy.
  readonly category: ApplicationErrorCategory;
}

/** Construct a frozen public error without accepting a raw exception or caller-supplied message. */
export function createPublicApplicationError(
  category: ApplicationErrorCategory,
): PublicApplicationError {
  // Freeze the minimal value so downstream code cannot append sensitive diagnostic fields.
  return Object.freeze({ category });
}
