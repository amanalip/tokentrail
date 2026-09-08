// Import Node filesystem APIs for atomic, permission-restricted preference persistence.
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

// Import the validated preferences contract and reviewed defaults.
import {
  createDefaultPreferences,
  preferencesSchema,
  type Preferences,
} from '../../shared/contracts/preferences';

// Describe the minimal filesystem surface this store needs so tests can supply an in-memory backend.
export interface PreferenceFileSystem {
  readonly readFile: (path: string) => Promise<string>;
  readonly writeFile: (path: string, content: string) => Promise<void>;
  readonly rename: (from: string, to: string) => Promise<void>;
  readonly mkdir: (path: string) => Promise<void>;
  readonly removeFile: (path: string) => Promise<void>;
}

// Name the quarantine suffix appended to files whose contents fail validation.
const CORRUPT_SUFFIX = '.corrupt';

/**
 * Own the versioned preferences document inside the Electron user-data directory. Reads validate every field
 * and quarantine corrupt documents instead of trusting them; writes are atomic through a temporary file and
 * never contain usage-derived or sensitive values because the schema itself excludes them.
 */
export class PreferenceStore {
  // Retain the resolved document path inside the user-data directory.
  readonly #filePath: string;

  // Retain the injected filesystem seam for deterministic tests.
  readonly #filesystem: PreferenceFileSystem;

  // Cache the current validated preferences after the first successful load.
  #cached: Preferences | null = null;

  // Serialize write operations so concurrent saves cannot interleave.
  #writeQueue: Promise<unknown> = Promise.resolve();

  #loading: Promise<Preferences> | null = null;

  public constructor(options: {
    readonly userDataDirectory: string;
    readonly filesystem?: PreferenceFileSystem;
  }) {
    // Compose the fixed document path from the trusted user-data location.
    this.#filePath = join(options.userDataDirectory, 'preferences.json');
    this.#filesystem = options.filesystem ?? {
      readFile: (path) => readFile(path, 'utf8'),
      writeFile: async (path, content) =>
        writeFile(path, content, { encoding: 'utf8', mode: 0o600 }),
      rename: (from, to) => rename(from, to),
      mkdir: async (path) => {
        await mkdir(path, { recursive: true });
      },
      removeFile: async (path) => {
        await rm(path, { force: true });
      },
    };
  }

  /** Serialize reads with writes, sharing initialization across concurrent callers. */
  public load(): Promise<Preferences> {
    if (this.#loading !== null) return this.#loading;
    const operation = this.#enqueue(async () => {
      if (this.#cached !== null) return this.#cached;
      let raw: string;
      try {
        raw = await this.#filesystem.readFile(this.#filePath);
      } catch (error) {
        if (
          typeof error !== 'object' ||
          error === null ||
          !('code' in error) ||
          error.code !== 'ENOENT'
        )
          throw error;
        const defaults = createDefaultPreferences();
        await this.#persist(defaults);
        return defaults;
      }
      let validated: Preferences;
      try {
        validated = preferencesSchema.parse(JSON.parse(raw));
      } catch {
        // Only proven invalid content is quarantined. A failed rename must preserve the original.
        await this.#filesystem.rename(this.#filePath, `${this.#filePath}${CORRUPT_SUFFIX}`);
        const defaults = createDefaultPreferences();
        await this.#persist(defaults);
        return defaults;
      }
      this.#cached = validated;
      return validated;
    });
    this.#loading = operation.finally(() => {
      this.#loading = null;
    });
    return this.#loading;
  }

  /** Validate and atomically persist one complete preferences document. */
  public save(preferences: Preferences): Promise<void> {
    return this.#enqueue(() => this.#persist(preferencesSchema.parse(preferences)));
  }

  async #persist(validated: Preferences): Promise<void> {
    await this.#filesystem.mkdir(dirname(this.#filePath));
    const temporaryPath = `${this.#filePath}.tmp`;
    await this.#filesystem.writeFile(temporaryPath, JSON.stringify(validated, null, 2));
    await this.#filesystem.rename(temporaryPath, this.#filePath);
    this.#cached = validated;
  }

  // Recover the queue tail without changing the failure observed by the initiating caller.
  #enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.#writeQueue.then(operation);
    this.#writeQueue = result.catch(() => undefined);
    return result;
  }

  /** Delete owned preference files and retain defaults in memory until the next explicit save. */
  public clear(): Promise<Preferences> {
    return this.#enqueue(async () => {
      await this.#filesystem.removeFile(this.#filePath);
      await this.#filesystem.removeFile(`${this.#filePath}${CORRUPT_SUFFIX}`);
      await this.#filesystem.removeFile(`${this.#filePath}.tmp`);
      this.#cached = createDefaultPreferences();
      return this.#cached;
    });
  }
}
