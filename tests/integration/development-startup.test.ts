import { copyFile, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { expect, it } from 'vitest';

it.each(['success', 'build-failure', 'server-exit'])(
  'requires current builds and respects %s',
  async (mode) => {
    const root = await mkdtemp(path.join(tmpdir(), 'tokentrail-dev-'));
    try {
      for (const directory of ['scripts', 'node_modules/.bin', 'dist/main', 'dist/preload']) {
        await mkdir(path.join(root, directory), { recursive: true });
      }
      await copyFile('scripts/dev.mjs', path.join(root, 'scripts/dev.mjs'));
      for (const kind of ['main', 'preload']) {
        await writeFile(path.join(root, `dist/${kind}/index.cjs`), 'stale');
      }
      await writeFile(
        path.join(root, 'fetch.mjs'),
        `globalThis.fetch = async () => { await new Promise(r => setTimeout(r, 350)); return { ok: true }; };`,
      );
      await writeFile(
        path.join(root, 'node_modules/.bin/vite'),
        `#!/usr/bin/env node
const { writeFileSync } = require('node:fs');
const args = process.argv.slice(2);
if (args.includes('build') && !args.includes('--watch')) {
  setTimeout(() => {
    if (process.env.CASE === 'build-failure') process.exit(1);
    const kind = args.includes('vite.main.config.ts') ? 'main' : 'preload';
    writeFileSync('dist/' + kind + '/index.cjs', 'fresh');
  }, 200);
} else if (process.env.CASE === 'server-exit' && !args.includes('build')) {
  setTimeout(() => process.exit(0), 50);
} else { setInterval(() => {}, 1000); }
`,
        { mode: 0o755 },
      );
      await writeFile(
        path.join(root, 'node_modules/.bin/electron'),
        `#!/usr/bin/env node
const { readFileSync, writeFileSync } = require('node:fs');
writeFileSync('launched', ['main', 'preload'].map(k => readFileSync('dist/' + k + '/index.cjs', 'utf8')).join(','));
setTimeout(() => process.exit(0), 100);
`,
        { mode: 0o755 },
      );
      const run = promisify(execFile)(
        process.execPath,
        ['--import', path.join(root, 'fetch.mjs'), path.join(root, 'scripts/dev.mjs')],
        { env: { ...process.env, CASE: mode }, timeout: 5000 },
      );
      if (mode === 'success') {
        await run;
        expect(await readFile(path.join(root, 'launched'), 'utf8')).toBe('fresh,fresh');
      } else {
        await expect(run).rejects.toThrow();
        await expect(readFile(path.join(root, 'launched'))).rejects.toThrow();
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);
