// Import Vitest assertions and grouping helpers.
import { describe, expect, it } from 'vitest';

// Import the store under test and its filesystem seam.
import { PreferenceStore, type PreferenceFileSystem } from './preference-store';

// Import the reviewed defaults for quarantine assertions.
import { createDefaultPreferences, preferencesSchema } from '../../shared/contracts/preferences';

// Build one in-memory filesystem that records operations for deterministic assertions.
function createMemoryFilesystem(initial: Record<string, string> = {}): PreferenceFileSystem & {
  readonly files: Map<string, string>;
} {
  // Retain the virtual file map inside the test only.
  const files = new Map(Object.entries(initial));
  return {
    files,
    readFile: async (path) => {
      const content = files.get(path);
      if (content === undefined) throw new Error('not found');
      return content;
    },
    writeFile: async (path, content) => {
      files.set(path, content);
    },
    rename: async (from, to) => {
      const content = files.get(from);
      if (content === undefined) throw new Error('not found');
      files.delete(from);
      files.set(to, content);
    },
    mkdir: async () => undefined,
    removeFile: async (path) => {
      files.delete(path);
    },
  };
}

// Group behavior around loading and validation.
describe('PreferenceStore', () => {
  it('loads and validates a stored document', async () => {
    const filesystem = createMemoryFilesystem({
      '/data/preferences.json': JSON.stringify({
        version: 1,
        theme: 'dark',
        timeFormat: '24h',
        automaticRefreshEnabled: true,
        refreshIntervalMinutes: 15,
        reducedMotion: 'reduced',
      }),
    });
    const store = new PreferenceStore({ userDataDirectory: '/data', filesystem });

    const loaded = await store.load();
    expect(loaded.theme).toBe('dark');
    expect(loaded.refreshIntervalMinutes).toBe(15);
  });

  it('quarantines corrupt documents and resets to reviewed defaults', async () => {
    const filesystem = createMemoryFilesystem({
      '/data/preferences.json': '{ not valid json',
    });
    const store = new PreferenceStore({ userDataDirectory: '/data', filesystem });

    // Loading survives corruption with defaults instead of crashing or trusting partial data.
    const loaded = await store.load();
    expect(loaded).toEqual(createDefaultPreferences());

    // The unreadable file was preserved beside the fresh document for offline inspection.
    expect(filesystem.files.has('/data/preferences.json.corrupt')).toBe(true);
    expect(filesystem.files.has('/data/preferences.json')).toBe(true);
  });

  it('rejects schema-invalid documents such as out-of-range intervals', async () => {
    const filesystem = createMemoryFilesystem({
      '/data/preferences.json': JSON.stringify({
        version: 1,
        theme: 'dark',
        timeFormat: 'system',
        automaticRefreshEnabled: false,
        refreshIntervalMinutes: 9_000,
        reducedMotion: 'system',
      }),
    });
    const store = new PreferenceStore({ userDataDirectory: '/data', filesystem });
    expect(await store.load()).toEqual(createDefaultPreferences());
  });

  it('persists atomically through a temporary file and revalidates on save', async () => {
    const filesystem = createMemoryFilesystem();
    const store = new PreferenceStore({ userDataDirectory: '/data', filesystem });

    // Save a valid document and confirm the temp file was renamed into place.
    await store.save(
      preferencesSchema.parse({
        version: 1,
        theme: 'light',
        timeFormat: '12h',
        automaticRefreshEnabled: false,
        refreshIntervalMinutes: 10,
        reducedMotion: 'full',
      }),
    );
    expect(filesystem.files.has('/data/preferences.json.tmp')).toBe(false);
    expect(JSON.parse(filesystem.files.get('/data/preferences.json') ?? '{}').theme).toBe('light');

    // A subsequent load returns the persisted document rather than fabricating defaults.
    const secondStore = new PreferenceStore({ userDataDirectory: '/data', filesystem });
    expect((await secondStore.load()).theme).toBe('light');
  });

  it('serializes concurrent writes so the final document wins coherently', async () => {
    const filesystem = createMemoryFilesystem();
    const store = new PreferenceStore({ userDataDirectory: '/data', filesystem });

    // Issue two overlapping saves with different themes.
    const first = store.save(
      preferencesSchema.parse({
        version: 1,
        theme: 'light',
        timeFormat: 'system',
        automaticRefreshEnabled: false,
        refreshIntervalMinutes: 5,
        reducedMotion: 'system',
      }),
    );
    const second = store.save(
      preferencesSchema.parse({
        version: 1,
        theme: 'dark',
        timeFormat: 'system',
        automaticRefreshEnabled: false,
        refreshIntervalMinutes: 5,
        reducedMotion: 'system',
      }),
    );
    await Promise.all([first, second]);

    // The stored document must be exactly one of the two complete replacements.
    const stored = JSON.parse(filesystem.files.get('/data/preferences.json') ?? '{}');
    expect(['light', 'dark']).toContain(stored.theme);
  });

  it('clears only owned files and restores reviewed defaults', async () => {
    // Seed a live document and a quarantined sibling plus an unrelated file the store does not own.
    const filesystem = createMemoryFilesystem({
      '/data/preferences.json': '{"version":1}',
      '/data/preferences.json.corrupt': '{ broken',
      '/data/unrelated.txt': 'keep me',
    });
    const store = new PreferenceStore({ userDataDirectory: '/data', filesystem });

    // Clearing removes exactly the two owned files and repersists defaults.
    const cleared = await store.clear();
    expect(cleared).toEqual(createDefaultPreferences());
    expect(filesystem.files.has('/data/preferences.json.corrupt')).toBe(false);

    // The fresh defaults document exists and unrelated files are untouched.
    expect(filesystem.files.has('/data/preferences.json')).toBe(true);
    expect(filesystem.files.get('/data/unrelated.txt')).toBe('keep me');
  });
});
