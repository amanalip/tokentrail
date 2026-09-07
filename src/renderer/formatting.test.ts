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

it('formats signed token differences independently of reported counters', async () => {
  const { formatCounterDifference } = await import('./formatting');
  expect(formatCounterDifference('-1234567')).toBe('-1,234,567');
  expect(formatCounterDifference('70')).toBe('70');
  expect(formatCounterDifference('0')).toBe('0');
  expect(formatCounterDifference('--1')).toBe('Unavailable');
});
