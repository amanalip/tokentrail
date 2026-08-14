/**
 * Bound every dimension of untrusted app-server input before Phase 2 adds transport parsing. These conservative
 * limits are intentionally centralized so parsers, fixtures, tests, and diagnostics use one reviewed policy.
 */
export const CODEX_PROTOCOL_LIMITS = Object.freeze({
  // Reject an individual newline-delimited JSON message larger than one mebibyte before parsing it.
  maximumMessageBytes: 1_048_576,
  // Reject deeply nested input before recursive validation can exhaust the JavaScript call stack.
  maximumNestingDepth: 32,
  // Bound any individual string while leaving ample room for approved non-content metadata.
  maximumStringCharacters: 65_536,
  // Bound a single array to prevent a valid-looking response from exhausting renderer or main-process memory.
  maximumArrayItems: 10_000,
  // Bound keys per object so unknown wide objects cannot create disproportionate validation work.
  maximumObjectKeys: 512,
  // Require ordinary JSON numbers to remain integers that JavaScript can represent exactly.
  maximumSafeInteger: Number.MAX_SAFE_INTEGER,
  // Bound decimal strings before converting approved large integer fields to `bigint`.
  maximumDecimalCharacters: 128,
  // Fail an ordinary read request rather than retaining unresolved protocol state indefinitely.
  requestTimeoutMilliseconds: 10_000,
  // Give initial capability negotiation slightly longer than a normal steady-state read.
  initializationTimeoutMilliseconds: 15_000,
} as const);

/** Parse an unsigned decimal string into an exact bigint without accepting signs, fractions, or exponent form. */
export function parseBoundedUnsignedDecimal(value: unknown): bigint | null {
  // Only protocol strings receive bigint conversion because JSON numbers may already have lost precision.
  if (typeof value !== 'string') {
    return null;
  }

  // Reject empty, overlong, signed, padded, fractional, exponent, or otherwise non-decimal representations.
  if (
    value.length === 0 ||
    value.length > CODEX_PROTOCOL_LIMITS.maximumDecimalCharacters ||
    !/^(0|[1-9]\d*)$/u.test(value)
  ) {
    return null;
  }

  // Convert only after the complete lexical and length checks make conversion bounded and exact.
  return BigInt(value);
}
