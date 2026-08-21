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

  /** Load validated preferences once, quarantining corrupt documents back to defaults. */
  public async load(): Promise<Preferences> {
    // Return the cached value when already loaded so repeated IPC reads stay cheap.
    if (this.#cached !== null) return this.#cached;

    try {
      // Read the raw document text from disk.
      const raw = await this.#filesystem.readFile(this.#filePath);

      // Validate strictly; any drift from the schema counts as corruption, not partial truth.
      this.#cached = preferencesSchema.parse(JSON.parse(raw));
      return this.#cached;
    } catch {
      // Quarantine the unreadable file when it exists so evidence is preserved without trusting it.
      await this.#quarantineCorruptFile();

      // Reset to reviewed defaults and persist them immediately for observability.
      this.#cached = createDefaultPreferences();
      await this.save(this.#cached);
      return this.#cached;
    }
  }

  /** Validate and atomically persist one complete preferences document. */
  public async save(preferences: Preferences): Promise<void> {
    // Chain onto the write queue so concurrent callers cannot interleave temp-file renames.
    this.#writeQueue = this.#writeQueue.then(async () => {
      // Re-validate at the storage boundary so internal callers cannot bypass the contract.
      const validated = preferencesSchema.parse(preferences);

      // Ensure the parent directory exists before the atomic write sequence.
      await this.#filesystem.mkdir(dirname(this.#filePath));

      // Write to a temporary sibling then rename for atomicity on local filesystems.
      const temporaryPath = `${this.#filePath}.tmp`;
      await this.#filesystem.writeFile(temporaryPath, JSON.stringify(validated, null, 2));
      await this.#filesystem.rename(temporaryPath, this.#filePath);

      // Update the cache only after a durable successful write.
      this.#cached = validated;
    });

    // Propagate the first failure to every waiter while keeping later writes possible.
    try {
      await this.#writeQueue;
    } catch (error) {
      this.#writeQueue = Promise.resolve();
      throw error;
    }
  }

  // Move an unreadable or invalid document aside so its content remains inspectable offline.
  async #quarantineCorruptFile(): Promise<void> {
    try {
      // Attempt the rename; absence of the file lands here harmlessly.
      await this.#filesystem.rename(this.#filePath, `${this.#filePath}${CORRUPT_SUFFIX}`);
    } catch {
      // A missing file needs no quarantine action.
    }
  }

  /**
   * Delete only Token Trail-owned files: the preferences document and any quarantined sibling. The store
   * removes nothing else because it owns nothing else, then resets to reviewed defaults in memory and on disk.
   */
  public async clear(): Promise<Preferences> {
    // Chain behind pending writes so a clear cannot race an in-flight save.
    const clearOperation = this.#writeQueue.then(async (): Promise<Preferences> => {
      // Remove the live document and the quarantined sibling; absence lands here harmlessly.
      await this.#filesystem.removeFile(this.#filePath);
      await this.#filesystem.removeFile(`${this.#filePath}${CORRUPT_SUFFIX}`);

      // Reset to reviewed defaults and persist them directly; this runs inside the queue already,
      // so calling save() here would deadlock against its own queue entry.
      this.#cached = createDefaultPreferences();
      const validated = preferencesSchema.parse(this.#cached);
      await this.#filesystem.mkdir(dirname(this.#filePath));
      const temporaryPath = `${this.#filePath}.tmp`;
      await this.#filesystem.writeFile(temporaryPath, JSON.stringify(validated, null, 2));
      await this.#filesystem.rename(temporaryPath, this.#filePath);
      return validated;
    });

    // Keep later operations queued behind this clear.
    this.#writeQueue = clearOperation;

    // Propagate the first failure while keeping later operations possible.
    try {
      return await clearOperation;
    } catch (error) {
      this.#writeQueue = Promise.resolve();
      throw error;
    }
  }
}
