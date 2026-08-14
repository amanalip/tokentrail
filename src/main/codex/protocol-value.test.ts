// Import Vitest assertions and grouping helpers.
import { describe, expect, it } from 'vitest';

// Import centralized limits for exact boundary cases.
import { CODEX_PROTOCOL_LIMITS } from './protocol-limits';

// Import the shape-independent bounded JSON validator.
import { isProtocolValueWithinLimits } from './protocol-value';

// Group checks around denial-of-service limits applied before schema parsing.
describe('isProtocolValueWithinLimits', () => {
  // Confirm ordinary nested JSON and maximum safe integers pass.
  it('accepts bounded JSON values', () => {
    expect(isProtocolValueWithinLimits({ items: ['safe', Number.MAX_SAFE_INTEGER] })).toBe(true);
  });

  // Confirm unsafe integers and oversized strings fail before version-specific validation.
  it('rejects imprecise and oversized scalar input', () => {
    expect(isProtocolValueWithinLimits(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
    expect(
      isProtocolValueWithinLimits('x'.repeat(CODEX_PROTOCOL_LIMITS.maximumStringCharacters + 1)),
    ).toBe(false);
  });

  // Confirm deeply nested and overly wide containers fail without recursive stack use.
  it('rejects deep and wide input', () => {
    // Build a chain one level beyond the approved nesting depth.
    let deepValue: unknown = null;
    for (let index = 0; index <= CODEX_PROTOCOL_LIMITS.maximumNestingDepth; index += 1) {
      deepValue = [deepValue];
    }

    // Build an object with one more key than the approved width.
    const wideValue = Object.fromEntries(
      Array.from({ length: CODEX_PROTOCOL_LIMITS.maximumObjectKeys + 1 }, (_, index) => [
        `key-${index}`,
        null,
      ]),
    );

    // Require both denial cases.
    expect(isProtocolValueWithinLimits(deepValue)).toBe(false);
    expect(isProtocolValueWithinLimits(wideValue)).toBe(false);
  });
});
