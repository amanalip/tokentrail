import { expect, it } from 'vitest';
import { formatResetTime } from './formatting';
import { MAXIMUM_UNIX_SECONDS, normalizeUnixSeconds } from '../shared/domain/unix-time';

it('guards the inclusive timestamp boundary before rendering', () => {
  expect(normalizeUnixSeconds(MAXIMUM_UNIX_SECONDS)).toBe(MAXIMUM_UNIX_SECONDS);
  expect(() => formatResetTime(MAXIMUM_UNIX_SECONDS)).not.toThrow();
  for (const value of [MAXIMUM_UNIX_SECONDS + 1, Number.MAX_SAFE_INTEGER, NaN, Infinity, -1]) {
    expect(normalizeUnixSeconds(value)).toBeNull();
    expect(formatResetTime(value)).toBe('Reset time unavailable');
  }
});
