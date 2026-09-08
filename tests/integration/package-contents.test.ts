import { copyFile, cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { expect, it } from 'vitest';

const execute = promisify(execFile);

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'tokentrail-payload-'));
  await mkdir(path.join(root, 'scripts'));
  await copyFile(
    'scripts/verify-package-contents.mjs',
    path.join(root, 'scripts/verify-package-contents.mjs'),
  );
  const runtime = path.join(root, 'release/linux-unpacked');
  await mkdir(path.join(runtime, 'resources'), { recursive: true });
  await mkdir(path.join(runtime, 'locales'));
  for (const name of [
    'LICENSE.electron.txt',
    'LICENSES.chromium.html',
    'tokentrail',
    'locales/en-US.pak',
  ]) {
    await writeFile(path.join(runtime, name), 'reviewed fixture');
  }
  const header = Buffer.from(
    JSON.stringify({ files: { 'package.json': { size: 0, offset: '0' } } }),
  );
  const bytes = Buffer.alloc(16 + header.length);
  bytes.writeUInt32LE(header.length, 12);
  header.copy(bytes, 16);
  await writeFile(path.join(runtime, 'resources/app.asar'), bytes);
  return {
    root,
    runtime,
    run: () => execute(process.execPath, [path.join(root, 'scripts/verify-package-contents.mjs')]),
  };
}

it.each([
  'clean',
  'resources/canary.txt',
  'resources/app.asar.unpacked/canary.txt',
  'locales/canary.txt',
])('recursively inspects %s unpacked content', async (entry) => {
  const { root, runtime, run } = await fixture();
  try {
    if (entry !== 'clean') {
      await mkdir(path.dirname(path.join(runtime, entry)), { recursive: true });
      await writeFile(path.join(runtime, entry), 'synthetic AWS_ACCESS_KEY_ID=canary');
      await expect(run()).rejects.toMatchObject({
        stderr: expect.stringContaining('unexpected runtime entry:'),
      });
      await expect(run()).rejects.toMatchObject({
        stderr: expect.stringContaining('secret marker'),
      });
    } else {
      expect((await run()).stdout).toContain('inspection passed');
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

it.each(['clean', 'canary'])('inspects %s compressed Pacman payloads', async (mode) => {
  const { root, runtime, run } = await fixture();
  try {
    const payload = path.join(root, 'payload');
    await cp(runtime, path.join(payload, 'opt/Token Trail'), { recursive: true });
    if (mode === 'canary')
      await writeFile(
        path.join(payload, 'opt/Token Trail/resources/canary.txt'),
        'AWS_ACCESS_KEY_ID=synthetic\n'.repeat(100),
      );
    const artifact = path.join(root, 'release/tokentrail-1.0.0-linux-x64.pacman');
    await execute('tar', ['-czf', artifact, '-C', payload, '.']);
    expect((await readFile(artifact)).includes(Buffer.from('AWS_ACCESS_KEY_ID='))).toBe(false);
    if (mode === 'clean') expect((await run()).stdout).toContain('1 extracted artifacts inspected');
    else
      await expect(run()).rejects.toMatchObject({
        stderr: expect.stringContaining('secret marker'),
      });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

it('inspects Debian data and control archives after extraction', async () => {
  const { root, runtime, run } = await fixture();
  try {
    const data = path.join(root, 'data');
    const control = path.join(root, 'control');
    await cp(runtime, path.join(data, 'opt/Token Trail'), { recursive: true });
    await mkdir(control);
    await writeFile(path.join(control, 'control'), 'Package: tokentrail\nVersion: 1.0.0\n');
    await writeFile(path.join(control, 'postinst'), 'AWS_ACCESS_KEY_ID=synthetic\n'.repeat(100));
    await writeFile(path.join(root, 'debian-binary'), '2.0\n');
    await execute('tar', ['-czf', path.join(root, 'data.tar.gz'), '-C', data, '.']);
    await execute('tar', ['-czf', path.join(root, 'control.tar.gz'), '-C', control, '.']);
    const artifact = path.join(root, 'release/tokentrail-1.0.0-linux-x64.deb');
    // Construct the small ar envelope directly; host ar implementations may load
    // toolchain plugins even though this fixture contains no object files.
    const members = [Buffer.from('!<arch>\n')];
    for (const name of ['debian-binary', 'control.tar.gz', 'data.tar.gz']) {
      const bytes = await readFile(path.join(root, name));
      members.push(
        Buffer.from(
          `${`${name}/`.padEnd(16)}${'0'.padEnd(12)}${'0'.padEnd(6)}${'0'.padEnd(6)}${'100644'.padEnd(8)}${String(bytes.length).padEnd(10)}\x60\n`,
        ),
      );
      members.push(bytes);
      if (bytes.length % 2) members.push(Buffer.from('\n'));
    }
    await writeFile(artifact, Buffer.concat(members));
    expect((await readFile(artifact)).includes(Buffer.from('AWS_ACCESS_KEY_ID='))).toBe(false);
    await expect(run()).rejects.toMatchObject({
      stderr: expect.stringContaining('control/postinst'),
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

it('fails closed when a distributable cannot be extracted', async () => {
  const { root, run } = await fixture();
  try {
    await writeFile(path.join(root, 'release/tokentrail-1.0.0-linux-x64.rpm'), 'not an archive');
    await expect(run()).rejects.toMatchObject({
      stderr: expect.stringContaining('could not inspect extracted'),
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

it('extracts an embedded AppImage SquashFS without running its executable header', async () => {
  const { root, runtime, run } = await fixture();
  try {
    await writeFile(
      path.join(runtime, 'resources/canary.txt'),
      'AWS_ACCESS_KEY_ID=synthetic\n'.repeat(100),
    );
    const squashfs = path.join(root, 'payload.squashfs');
    await execute('mksquashfs', [runtime, squashfs, '-noappend', '-processors', '1', '-quiet']);
    await rm(path.join(runtime, 'resources/canary.txt'));
    const artifact = path.join(root, 'release/tokentrail-1.0.0-linux-x64.AppImage');
    await writeFile(
      artifact,
      Buffer.concat([
        Buffer.from('Not executable; fake hsqs before real superblock\n'),
        await readFile(squashfs),
      ]),
    );
    await expect(run()).rejects.toMatchObject({ stderr: expect.stringContaining('secret marker') });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

it('inspects the arm64 unpacked directory selected by the release job', async () => {
  const { root, runtime } = await fixture();
  try {
    await cp(runtime, path.join(root, 'release/linux-arm64-unpacked'), { recursive: true });
    await rm(runtime, { recursive: true });
    const result = await execute(process.execPath, [
      path.join(root, 'scripts/verify-package-contents.mjs'),
      'arm64',
    ]);
    expect(result.stdout).toContain('inspection passed');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
