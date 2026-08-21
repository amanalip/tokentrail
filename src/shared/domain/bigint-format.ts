/**
 * Exact arithmetic helpers for aggregate token counters. Protocol counters cross IPC as canonical decimal
 * strings and are calculated as bigint so no value can silently lose precision. These helpers convert results
 * back to bounded display strings without ever routing a counter through a binary floating-point value.
 */

/** Parse a validated decimal-counter string into bigint. Return null for anything non-canonical. */
export function parseDecimalCounter(value: string): bigint | null {
  // Reject non-string input before pattern matching so numbers cannot pass through string coercion.
  if (typeof value !== 'string') return null;

  // Accept only the canonical unsigned form produced by the privileged adapter.
  return /^(0|[1-9]\d*)$/u.test(value) ? BigInt(value) : null;
}

/**
 * Format one ratio of bigints as a decimal string rounded half-up to at most `maximumFractionDigits` places.
 * Trailing zeros are trimmed and a whole result has no decimal point. Denominator must be positive.
 */
export function formatBigintRatio(
  numerator: bigint,
  denominator: bigint,
  maximumFractionDigits: number,
): string {
  // Guard the contract so a caller bug cannot present as a formatted zero.
  if (denominator <= 0n) return '0';

  // Degrade to plain whole-number division when an invalid precision is requested.
  if (maximumFractionDigits < 0) return (numerator / denominator).toString();

  // Scale first, then divide once so rounding uses exact integer arithmetic throughout.
  const scale = 10n ** BigInt(maximumFractionDigits);
  const scaled = (numerator * scale * 2n + denominator) / (denominator * 2n);

  // Split the scaled value into whole and fractional parts for canonical assembly.
  const whole = scaled / scale;
  const fraction = scaled % scale;

  // Return the plain whole number when no fractional part remains after rounding.
  if (fraction === 0n) return whole.toString();

  // Render the fractional digits then trim trailing zeros so output stays compact and canonical.
  const fractionDigits = fraction
    .toString()
    .padStart(maximumFractionDigits, '0')
    .replace(/0+$/u, '');
  return `${whole}.${fractionDigits}`;
}

/**
 * Format one bigint with stable thousands separators for accessible table and summary text. Grouping is applied
 * on the digit string only, so sign handling is unnecessary for the unsigned counters Token Trail retains.
 */
export function formatDecimalCounterWithSeparators(value: bigint): string {
  // Insert a separator every three digits from the right without converting through number.
  const digits = value.toString();
  let grouped = '';
  for (let index = 0; index < digits.length; index += 1) {
    const positionFromEnd = digits.length - index;
    grouped += digits[index];
    if (positionFromEnd > 1 && (positionFromEnd - 1) % 3 === 0) grouped += ',';
  }
  return grouped;
}
