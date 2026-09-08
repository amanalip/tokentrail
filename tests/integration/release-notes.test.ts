import { copyFile, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { expect, it } from 'vitest';

it.each([
  ['v2.0.0', 'current-marker'],
  ['v1.0.0', 'historical-marker'],
  ['v3.0.0', 'future-marker'],
])('isolates changelog sections for %s without publication', async (tag, expected) => {
  const root = await mkdtemp(path.join(tmpdir(), 'tokentrail-notes-'));
  try {
    await mkdir(path.join(root, 'scripts'));
    await copyFile(
      new URL('../../scripts/write-release-notes.mjs', import.meta.url),
      path.join(root, 'scripts/write-release-notes.mjs'),
    );
    await writeFile(
      path.join(root, 'CHANGELOG.md'),
      '# Changelog\n\n## Unreleased\n\nfuture-marker\n\n## 2.0.0\n\ncurrent-marker\n\n## 1.0.0\n\nhistorical-marker\n',
    );
    const output = path.join(root, 'notes.md');
    await promisify(execFile)(process.execPath, [
      path.join(root, 'scripts/write-release-notes.mjs'),
      '--tag',
      tag!,
      '--commit',
      'a'.repeat(40),
      '--repo',
      'example/tokentrail',
      '--output',
      output,
    ]);
    const notes = await readFile(output, 'utf8');
    expect(notes).toContain(expected);
    for (const marker of ['future-marker', 'current-marker', 'historical-marker']) {
      if (marker !== expected) expect(notes).not.toContain(marker);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
