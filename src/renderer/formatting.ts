// Import exact bigint formatting helpers for counter display.
import {
  formatDecimalCounterWithSeparators,
  parseDecimalCounter,
} from '../shared/domain/bigint-format';

// Import the closed time-format preference type for clock presentation rules.
import type { Preferences } from '../shared/contracts/preferences';

// Format a finite percentage for concise visible and accessible output without inventing precision.
export function formatPercentage(value: number | null): string {
  // Preserve absence as plain language instead of displaying zero.
  return value === null ? 'Unavailable' : `${Math.round(value * 10) / 10}%`;
}

// Format a reported duration without naming an unsupported weekly or daily period.
export function formatDuration(minutes: number | null): string {
  // Preserve missing duration as an explicit unavailable value.
  if (minutes === null) return 'Duration unavailable';

  // Present exact whole-day durations when the source divides evenly.
  if (minutes % 1_440 === 0) {
    const days = minutes / 1_440;
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  }

  // Present exact whole-hour durations when possible.
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  // Fall back to the reported minute unit without rounding.
  return `${minutes} minutes`;
}

// Build one Intl.DateTimeFormat honoring the reviewed time-format preference.
function buildDateTimeFormat(
  timeFormat: Preferences['timeFormat'],
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  // Resolve the explicit hour12 choice from the preference; system defers to the locale default.
  const hour12 = timeFormat === '12h' ? true : timeFormat === '24h' ? false : undefined;
  return new Intl.DateTimeFormat(undefined, { ...options, hour12 });
}

// Format a Unix timestamp in the user's local timezone without changing its meaning.
export function formatResetTime(
  timestampSeconds: number | null,
  timeFormat: Preferences['timeFormat'] = 'system',
): string {
  // Preserve absence honestly.
  if (timestampSeconds === null) return 'Reset time unavailable';

  // Convert the validated seconds value only at presentation time.
  return buildDateTimeFormat(timeFormat, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestampSeconds * 1_000));
}

// Calculate a conservative reset countdown from the reported timestamp and current local clock.
export function formatResetCountdown(timestampSeconds: number | null): string {
  // Preserve absence instead of inventing a countdown.
  if (timestampSeconds === null) return 'Countdown unavailable';

  // Calculate whole remaining seconds only for presentation; do not infer that a passed reset occurred.
  const remainingSeconds = Math.floor(timestampSeconds - Date.now() / 1_000);
  if (remainingSeconds <= 0) return 'Reset time passed';

  // Prefer the largest practical unit while keeping the wording explicitly approximate.
  const days = Math.floor(remainingSeconds / 86_400);
  if (days > 0) return `About ${days} ${days === 1 ? 'day' : 'days'} remaining`;

  // Fall back to whole hours or minutes for shorter windows.
  const hours = Math.floor(remainingSeconds / 3_600);
  if (hours > 0) return `About ${hours} ${hours === 1 ? 'hour' : 'hours'} remaining`;
  const minutes = Math.max(1, Math.floor(remainingSeconds / 60));
  return `About ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} remaining`;
}

// Format an exact signed difference in seconds as an approximate human countdown.
export function formatRemainingSeconds(remainingSeconds: number | null): string {
  // Preserve absence honestly for rows without a usable expiry.
  if (remainingSeconds === null) return '';

  // Reuse the reviewed approximate unit selection for consistency across screens.
  const days = Math.floor(remainingSeconds / 86_400);
  if (days > 0) return `${days}d ${Math.floor((remainingSeconds % 86_400) / 3_600)}h`;
  const hours = Math.floor(remainingSeconds / 3_600);
  if (hours > 0) return `${hours}h ${Math.floor((remainingSeconds % 3_600) / 60)}m`;
  return `${Math.max(1, Math.floor(remainingSeconds / 60))}m`;
}

// Format an ISO refresh timestamp as a concise local time honoring the time-format preference.
export function formatRefreshTime(
  timestamp: string | null,
  timeFormat: Preferences['timeFormat'] = 'system',
): string {
  // Avoid implying a successful refresh before one occurred.
  if (timestamp === null) return 'Not refreshed yet';

  // Present the already validated timestamp in the user's locale.
  return buildDateTimeFormat(timeFormat, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(timestamp));
}

// Format one canonical decimal-counter string with thousands separators exactly.
export function formatCounter(tokens: string | null): string {
  // Preserve absence instead of displaying zero.
  if (tokens === null) return 'Unavailable';
  const parsed = parseDecimalCounter(tokens);
  return parsed === null ? 'Unavailable' : formatDecimalCounterWithSeparators(parsed);
}

// Format one calculated statistic string (possibly fractional) with grouped digits and no precision loss.
export function formatStatistic(value: string | null): string {
  // Preserve absence honestly.
  if (value === null) return 'Unavailable';

  // Split a fractional statistic so grouping applies only to its exact integer part.
  const [integerPart, fractionPart] = value.split('.');
  const grouped = formatCounter(integerPart ?? null);
  if (grouped === 'Unavailable' || fractionPart === undefined) return grouped;
  return `${grouped}.${fractionPart}`;
}

// Compact large counters for summary cards while keeping exact values in accessible text.
export function formatCounterCompact(tokens: string | null): string {
  // Preserve absence honestly.
  if (tokens === null) return 'Unavailable';
  const parsed = parseDecimalCounter(tokens);
  if (parsed === null) return 'Unavailable';

  // Choose the largest unit that keeps at least three significant digits.
  const billion = 1_000_000_000n;
  const million = 1_000_000n;
  const thousand = 1_000n;
  if (parsed >= billion) return `${formatBigintRatioLocal(parsed, billion)}B`;
  if (parsed >= million) return `${formatBigintRatioLocal(parsed, million)}M`;
  if (parsed >= thousand) return `${formatBigintRatioLocal(parsed, thousand)}K`;
  return parsed.toString();
}

// Divide two bigints into a compact decimal string with one fraction digit at most.
function formatBigintRatioLocal(numerator: bigint, denominator: bigint): string {
  // Scale once and trim trailing zeros for stable compact output.
  const scaled = (numerator * 10n * 2n + denominator) / (denominator * 2n);
  const whole = scaled / 10n;
  const fraction = scaled % 10n;
  return fraction === 0n ? `${whole}` : `${whole}.${fraction}`;
}
