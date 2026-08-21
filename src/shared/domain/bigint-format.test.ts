// Import Vitest assertions and grouping helpers.
import { describe, expect, it } from 'vitest';

// Import the exact-arithmetic helpers under test.
import {
  formatBigintRatio,
  formatDecimalCounterWithSeparators,
  parseDecimalCounter,
} from './bigint-format';

// Group behavior around canonical counter parsing.
describe('parseDecimalCounter', () => {
  it('accepts canonical unsigned decimal strings', () => {
    expect(parseDecimalCounter('0')).toBe(0n);
    expect(parseDecimalCounter('420390')).toBe(4_203_90n);
    expect(parseDecimalCounter('123456789012345678901234567890')).toBe(
      123_456_789_012_345_678_901_234_567_890n,
    );
  });

  it('rejects signed, padded, fractional, and non-string input', () => {
    expect(parseDecimalCounter('-1')).toBeNull();
    expect(parseDecimalCounter('01')).toBeNull();
    expect(parseDecimalCounter('1.5')).toBeNull();
    expect(parseDecimalCounter('1e10')).toBeNull();
    expect(parseDecimalCounter('42')).not.toBeNull();
    expect(parseDecimalCounter('')).toBeNull();
  });
});

// Group behavior around exact ratio formatting.
describe('formatBigintRatio', () => {
  it('formats whole results without a decimal point', () => {
    expect(formatBigintRatio(10n, 2n, 1)).toBe('5');
  });

  it('rounds half-up to the requested precision', () => {
    // 1/8 = 0.125 rounds to 0.1 at one decimal place.
    expect(formatBigintRatio(1n, 8n, 1)).toBe('0.1');
    // 3/8 = 0.375 rounds to 0.4 at one decimal place.
    expect(formatBigintRatio(3n, 8n, 1)).toBe('0.4');
  });

  it('trims trailing zeros after rounding', () => {
    expect(formatBigintRatio(1n, 2n, 4)).toBe('0.5');
  });

  it('handles even-count medians without precision loss for huge values', () => {
    // Median of two huge odd values is their exact mean with a .5 fraction.
    const left = 12_345_678_901_234_567_891n;
    const right = 12_345_678_901_234_567_892n;
    expect(formatBigintRatio(left + right, 2n, 1)).toBe('12345678901234567891.5');
  });

  it('guards against a non-positive denominator', () => {
    expect(formatBigintRatio(5n, 0n, 2)).toBe('0');
  });
});

// Group behavior around grouped display formatting.
describe('formatDecimalCounterWithSeparators', () => {
  it('groups digits in threes from the right', () => {
    expect(formatDecimalCounterWithSeparators(1_234_567n)).toBe('1,234,567');
    expect(formatDecimalCounterWithSeparators(999n)).toBe('999');
    expect(formatDecimalCounterWithSeparators(1_000n)).toBe('1,000');
  });

  it('groups values beyond the safe JavaScript integer range exactly', () => {
    expect(formatDecimalCounterWithSeparators(12_345_678_901_234_567_890n)).toBe(
      '12,345,678,901,234,567,890',
    );
  });
});
