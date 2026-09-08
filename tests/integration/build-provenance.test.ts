import { copyFile, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { expect, it } from 'vitest';

it.each(['valid', 'stale', 'other-arch', 'unrelated', 'missing', 'wrong-tag'])(
  'validates %s provenance inventory',
  async (mode) => {
    const root = await mkdtemp(path.join(tmpdir(), 'tokentrail-provenance-'));
    try {
      await mkdir(path.join(root, 'scripts'));
      await mkdir(path.join(root, 'release'));
      await copyFile(
        'scripts/write-build-provenance.mjs',
        path.join(root, 'scripts/write-build-provenance.mjs'),
      );
      await writeFile(path.join(root, 'package.json'), JSON.stringify({ version: '1.0.0' }));
      for (const extension of ['AppImage', 'deb', 'rpm', 'pacman']) {
        if (mode === 'missing' && extension === 'rpm') continue;
        await writeFile(
          path.join(root, `release/tokentrail-1.0.0-linux-x64.${extension}`),
          extension,
        );
      }
      const extra = {
        stale: 'tokentrail-0.9.0-linux-x64.deb',
        'other-arch': 'tokentrail-1.0.0-linux-arm64.deb',
        unrelated: 'tokentrail-notes.txt',
      }[mode];
      if (extra) await writeFile(path.join(root, 'release', extra), 'unrelated');
      const output = path.join(root, 'provenance.json');
      const env = { ...process.env };
      delete env['npm_config_user_agent'];
      const run = promisify(execFile)(
        process.execPath,
        [
          path.join(root, 'scripts/write-build-provenance.mjs'),
          '--arch',
          'x64',
          '--tag',
          mode === 'wrong-tag' ? 'v2.0.0' : 'v1.0.0',
          '--commit',
          'a'.repeat(40),
          '--output',
          output,
        ],
        { env },
      );
      if (mode !== 'valid') {
        await expect(run).rejects.toThrow();
        await expect(readFile(output)).rejects.toThrow();
      } else {
        await run;
        const result = JSON.parse(await readFile(output, 'utf8'));
        const npm = await promisify(execFile)('npm', ['--version']);
        expect(result.environment.npmVersion).toBe(`npm/${npm.stdout.trim()}`);
        expect(result.artifacts).toHaveLength(4);
        expect(result.artifacts[0]).toEqual({
          name: 'tokentrail-1.0.0-linux-x64.AppImage',
          bytes: 8,
          sha256: createHash('sha256').update('AppImage').digest('hex'),
        });
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);
