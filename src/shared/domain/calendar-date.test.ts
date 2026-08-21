// Import Vitest assertions and grouping helpers.
import { describe, expect, it } from 'vitest';

// Import the calendar-date helpers under test.
import {
  calendarDayDifference,
  compareCalendarDates,
  enumerateConsecutiveDateKeys,
  formatLocalDateKey,
  parseCalendarDateKey,
} from './calendar-date';

// Group behavior around strict calendar-key parsing.
describe('parseCalendarDateKey', () => {
  it('accepts a valid calendar date', () => {
    expect(parseCalendarDateKey('2026-08-14')).toEqual({ year: 2026, month: 8, day: 14 });
  });

  it('rejects impossible dates without coercing them into neighbors', () => {
    // Reject impossible month and day values outright.
    expect(parseCalendarDateKey('2026-13-01')).toBeNull();
    expect(parseCalendarDateKey('2026-02-30')).toBeNull();
    expect(parseCalendarDateKey('2026-04-31')).toBeNull();
  });

  it('rejects non-leap-year February 29 while accepting leap years', () => {
    expect(parseCalendarDateKey('2026-02-29')).toBeNull();
    expect(parseCalendarDateKey('2024-02-29')).toEqual({ year: 2024, month: 2, day: 29 });
  });

  it('rejects non-string, malformed, and signed input', () => {
    expect(parseCalendarDateKey(20_260_814)).toBeNull();
    expect(parseCalendarDateKey('2026-8-4')).toBeNull();
    expect(parseCalendarDateKey('+2026-08-14')).toBeNull();
    expect(parseCalendarDateKey('2026/08/14')).toBeNull();
    expect(parseCalendarDateKey(null)).toBeNull();
  });
});

// Group behavior around local key production.
describe('formatLocalDateKey', () => {
  it('produces a zero-padded local calendar key', () => {
    // Construct one local noon date so any timezone still maps fields directly.
    const date = new Date(2026, 7, 4, 12, 0, 0);
    expect(formatLocalDateKey(date)).toBe('2026-08-04');
  });
});

// Group behavior around deterministic ordering and arithmetic.
describe('compareCalendarDates and calendarDayDifference', () => {
  it('orders dates by year, month, then day', () => {
    const earlier = parseCalendarDateKey('2026-07-31');
    const later = parseCalendarDateKey('2026-08-13');
    expect(earlier).not.toBeNull();
    expect(later).not.toBeNull();
    expect(compareCalendarDates(earlier!, later!)).toBe(-1);
    expect(compareCalendarDates(later!, earlier!)).toBe(1);
    expect(compareCalendarDates(earlier!, earlier!)).toBe(0);
  });

  it('computes exact day differences across month boundaries and leap years', () => {
    const july = parseCalendarDateKey('2026-07-31')!;
    const august = parseCalendarDateKey('2026-08-13')!;
    expect(calendarDayDifference(august, july)).toBe(13);

    // Verify the leap-day span counts exactly one extra day.
    const february = parseCalendarDateKey('2024-02-28')!;
    const march = parseCalendarDateKey('2024-03-01')!;
    expect(calendarDayDifference(march, february)).toBe(2);
  });
});

// Group behavior around consecutive key enumeration.
describe('enumerateConsecutiveDateKeys', () => {
  it('emits chronological keys ending on the supplied date', () => {
    const end = parseCalendarDateKey('2026-08-02')!;
    expect(enumerateConsecutiveDateKeys(end, 3)).toEqual([
      '2026-07-31',
      '2026-08-01',
      '2026-08-02',
    ]);
  });

  it('refuses non-positive spans', () => {
    const end = parseCalendarDateKey('2026-08-02')!;
    expect(enumerateConsecutiveDateKeys(end, 0)).toEqual([]);
    expect(enumerateConsecutiveDateKeys(end, -1)).toEqual([]);
  });

  it('crosses year boundaries correctly', () => {
    const end = parseCalendarDateKey('2026-01-02')!;
    expect(enumerateConsecutiveDateKeys(end, 3)).toEqual([
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
    ]);
  });
});
