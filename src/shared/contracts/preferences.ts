// Import Zod so every preference is validated before storage and after loading.
import { z } from 'zod';

// Enumerate the closed theme choices offered by the Settings screen.
export const THEME_PREFERENCES = Object.freeze(['system', 'light', 'dark'] as const);

// Enumerate the closed time-format choices; system follows the platform locale default.
export const TIME_FORMAT_PREFERENCES = Object.freeze(['system', '12h', '24h'] as const);

// Enumerate the closed motion choices so reduced-motion can be forced independently of the OS.
export const REDUCED_MOTION_PREFERENCES = Object.freeze(['system', 'reduced', 'full'] as const);

// Bound the automatic-refresh interval to the safe product range around the five-minute default.
export const REFRESH_INTERVAL_LIMITS = Object.freeze({
  minimumMinutes: 5,
  maximumMinutes: 120,
  defaultMinutes: 5,
} as const);

// Describe the complete versioned preferences document persisted by the privileged store.
export const preferencesSchema = z
  .object({
    // Bump this document version whenever a migration becomes necessary.
    version: z.literal(1),
    // Theme controls the renderer color scheme without reading any usage-derived value.
    theme: z.enum(THEME_PREFERENCES),
    // Time format controls clock presentation only.
    timeFormat: z.enum(TIME_FORMAT_PREFERENCES),
    // Automatic refresh stays off until evidence supports enabling it by default.
    automaticRefreshEnabled: z.boolean(),
    // Interval is bounded at validation time so an unsafe value cannot enter storage.
    refreshIntervalMinutes: z
      .number()
      .int()
      .min(REFRESH_INTERVAL_LIMITS.minimumMinutes)
      .max(REFRESH_INTERVAL_LIMITS.maximumMinutes),
    // Motion preference maps to the reduced-motion media strategy.
    reducedMotion: z.enum(REDUCED_MOTION_PREFERENCES),
  })
  .strict();

// Derive the public preferences type shared by main and renderer.
export type Preferences = Readonly<z.infer<typeof preferencesSchema>>;

/** Construct the reviewed defaults used on first run and after a quarantined corrupt file. */
export function createDefaultPreferences(): Preferences {
  return preferencesSchema.parse({
    version: 1,
    theme: 'system',
    timeFormat: 'system',
    automaticRefreshEnabled: false,
    refreshIntervalMinutes: REFRESH_INTERVAL_LIMITS.defaultMinutes,
    reducedMotion: 'system',
  });
}
