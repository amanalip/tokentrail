/**
 * Calendar-date keys are the stable identity of every supplied daily bucket. Parsing treats a key as a plain
 * calendar date rather than a local timestamp instant so timezone changes cannot shift which bucket a key names.
 * This module is shared, dependency-free, and side-effect free so every calculation layer interprets dates alike.
 */

// Match the strict ISO calendar-date shape used by Codex dated buckets before any semantic validation runs.
const CALENDAR_DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/u;

// Describe one validated calendar date without attaching a timezone or wall-clock time.
export interface CalendarDate {
  // Full Gregorian year, preserved exactly as supplied including era-safe four-digit form.
  readonly year: number;
  // Month number from 1 through 12 without JavaScript's zero-based offset.
  readonly month: number;
  // Day number from 1 through the validated length of the month.
  readonly day: number;
}

/** Return whether a year number is a leap year in the proleptic Gregorian calendar. */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Return the exact day count of one month so February and month-boundary arithmetic stay correct. */
function daysInMonth(year: number, month: number): number {
  const lengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return lengths[month - 1] ?? 0;
}

/**
 * Parse one supplied date key into a validated calendar date. Return null for malformed, impossible, or
 * out-of-range input instead of coercing it into a plausible neighboring date.
 */
export function parseCalendarDateKey(value: unknown): CalendarDate | null {
  // Reject non-string input before pattern matching so numeric timestamps cannot masquerade as dates.
  if (typeof value !== 'string') return null;

  // Apply the exact shape check before extracting numeric parts.
  const match = CALENDAR_DATE_KEY_PATTERN.exec(value);
  if (match === null) return null;

  // Convert matched groups into bounded integers without accepting signs or padding variants.
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  // Reject years outside a conservative supported window far beyond any realistic account history.
  if (year < 1_000 || year > 9_999) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;

  // Return an immutable validated value for ordered comparison and arithmetic.
  return Object.freeze({ year, month, day });
}

/**
 * Convert one local Date into its user-local calendar date key. This is used only where the product rule is
 * explicitly local, such as naming today's bucket; source data keys are never produced this way.
 */
export function formatLocalDateKey(date: Date): string {
  // Read local calendar fields directly so a UTC-shifted timestamp still names the user's local day.
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Compare two validated calendar dates and return a stable ordering number. Negative means the first date is
 * earlier, zero means identical keys, and positive means the first date is later.
 */
export function compareCalendarDates(left: CalendarDate, right: CalendarDate): -1 | 0 | 1 {
  // Compare years, then months, then days lexicographically because each field is bounded and positive.
  if (left.year !== right.year) return left.year < right.year ? -1 : 1;
  if (left.month !== right.month) return left.month < right.month ? -1 : 1;
  if (left.day !== right.day) return left.day < right.day ? -1 : 1;
  return 0;
}

/**
 * Return the exact count of calendar days between two dates where the earlier date counts as day zero. Both
 * inputs must be validated dates; callers own validation so this function stays total and allocation-free.
 */
export function calendarDayDifference(later: CalendarDate, earlier: CalendarDate): number {
  // Walk month boundaries using cumulative day-of-year arithmetic instead of millisecond math.
  const toDayNumber = (date: CalendarDate): number => {
    let dayNumber = 0;
    for (let year = 1_000; year < date.year; year += 1) {
      dayNumber += isLeapYear(year) ? 366 : 365;
    }
    const monthLengths = [
      31,
      isLeapYear(date.year) ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ];
    for (let month = 1; month < date.month; month += 1) {
      dayNumber += monthLengths[month - 1] ?? 0;
    }
    return dayNumber + date.day;
  };

  // Subtract the two absolute day numbers for an exact signed difference.
  return toDayNumber(later) - toDayNumber(earlier);
}

/**
 * Produce the consecutive calendar date keys covering `count` days ending on the supplied end date. Keys are
 * emitted latest-last so comparison periods can be sliced deterministically without timezone conversion.
 */
export function enumerateConsecutiveDateKeys(end: CalendarDate, count: number): string[] {
  // Refuse non-positive spans so callers cannot request an empty or reversed range by accident.
  if (!Number.isSafeInteger(count) || count <= 0) return [];

  // Copy the cursor so mutation stays local to this function.
  const cursor: { year: number; month: number; day: number } = { ...end };
  const keys: string[] = [];

  // Walk backwards one day at a time, emitting each key newest-first before reversing once at the end.
  for (let remaining = 0; remaining < count; remaining += 1) {
    keys.push(
      `${cursor.year}-${`${cursor.month}`.padStart(2, '0')}-${`${cursor.day}`.padStart(2, '0')}`,
    );
    cursor.day -= 1;
    if (cursor.day === 0) {
      cursor.month -= 1;
      if (cursor.month === 0) {
        cursor.month = 12;
        cursor.year -= 1;
      }
      cursor.day = daysInMonth(cursor.year, cursor.month);
    }
  }

  // Reverse once so callers receive chronological order matching the rest of the calculation library.
  return keys.reverse();
}
