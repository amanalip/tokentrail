// JavaScript Date's inclusive maximum, expressed in whole Unix seconds.
export const MAXIMUM_UNIX_SECONDS = 8_640_000_000_000;

export function normalizeUnixSeconds(value: unknown): number | null {
  return typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= MAXIMUM_UNIX_SECONDS
    ? value
    : null;
}
