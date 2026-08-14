// Import Vitest's explicit helpers for protocol-boundary assertions.
import { describe, expect, it } from 'vitest';

// Import the production limit policy and exact decimal parser.
import { CODEX_PROTOCOL_LIMITS, parseBoundedUnsignedDecimal } from './protocol-limits';

// Group tests around bounded untrusted protocol input.
describe('Codex protocol limits', () => {
  // Confirm the policy cannot be expanded by runtime mutation.
  it('is immutable and uses finite positive bounds', () => {
    expect(Object.isFrozen(CODEX_PROTOCOL_LIMITS)).toBe(true);

    for (const limit of Object.values(CODEX_PROTOCOL_LIMITS)) {
      expect(Number.isFinite(limit)).toBe(true);
      expect(limit).toBeGreaterThan(0);
    }
  });

  // Confirm values beyond JavaScript's safe integer range remain exact when supplied as reviewed decimal strings.
  it('parses bounded unsigned decimal strings exactly', () => {
    expect(parseBoundedUnsignedDecimal('0')).toBe(0n);
    expect(parseBoundedUnsignedDecimal('9007199254740993')).toBe(9_007_199_254_740_993n);
  });

  // Reject representations that are ambiguous, unsafe, or unnecessarily expensive.
  it.each([
    undefined,
    12,
    '',
    '-1',
    '+1',
    '01',
    '1.5',
    '1e3',
    '9'.repeat(CODEX_PROTOCOL_LIMITS.maximumDecimalCharacters + 1),
  ])('rejects unsafe decimal representation %j', (value) => {
    expect(parseBoundedUnsignedDecimal(value)).toBeNull();
  });
});
