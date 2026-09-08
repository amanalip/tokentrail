/**
 * Build-provenance recorder for the tag-driven release pipeline.
 *
 * Responsibility: write one machine-readable JSON record per architecture build so
 * every released artifact can be traced back to the exact commit, tag, runner, and
 * toolchain that produced it, together with per-file sizes and SHA-256 digests.
 * Trust level: CI build tooling; reads only the local release directory and
 * process environment, and writes only its single output file.
 * Denied behavior: no network access, no repository mutation, and no claim about
 * artifacts it did not personally hash in this run.
 *
 * Usage: node scripts/write-build-provenance.mjs --arch x64 --tag v0.5.0 \
 *          --commit <sha> --output release/provenance-x64.json
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdir, readFile, lstat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve the release directory from this script's checked-in location, never from an untrusted override.
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseDirectory = path.join(repositoryRoot, 'release');

/** Read exactly the four required CLI values; anything missing or unexpected fails closed. */
function parseArguments(argv) {
  const parsed = {};
  for (let index = 2; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (value === undefined || !key.startsWith('--')) {
      throw new Error(`unexpected argument layout at "${key ?? argv[index - 1]}"`);
    }
    parsed[key.slice(2)] = value;
  }

  for (const required of ['arch', 'tag', 'commit', 'output']) {
    if (typeof parsed[required] !== 'string' || parsed[required].length === 0) {
      throw new Error(`missing required --${required} value`);
    }
  }

  return parsed;
}

const options = parseArguments(process.argv);

const manifest = JSON.parse(await readFile(path.join(repositoryRoot, 'package.json'), 'utf8'));
if (!['x64', 'arm64'].includes(options.arch)) throw new Error('Unsupported architecture.');
if (options.tag !== `v${manifest.version}`) throw new Error('Tag must match the package version.');
const expectedNames = ['AppImage', 'deb', 'rpm', 'pacman']
  .map((extension) => `tokentrail-${manifest.version}-linux-${options.arch}.${extension}`)
  .sort();
const actualNames = (await readdir(releaseDirectory))
  .filter((name) => name.startsWith('tokentrail-') || /\.(AppImage|deb|rpm|pacman)$/.test(name))
  .sort();
if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
  throw new Error(
    `Artifact inventory mismatch. Expected: ${expectedNames.join(', ')}; found: ${actualNames.join(', ')}`,
  );
}
const artifacts = [];
for (const name of expectedNames) {
  const filePath = path.join(releaseDirectory, name);
  const fileStat = await lstat(filePath);
  if (!fileStat.isFile() || fileStat.size === 0) {
    throw new Error(`Artifact must be a nonempty regular file: ${name}`);
  }
  const digest = createHash('sha256');
  digest.update(await readFile(filePath));
  artifacts.push({ name, bytes: fileStat.size, sha256: digest.digest('hex') });
}

// Direct node invocations in CI do not have npm's user-agent environment variable.
const npmVersion = execFileSync('npm', ['--version'], { encoding: 'utf8' }).trim();
if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(npmVersion)) {
  throw new Error('Could not determine the installed npm version.');
}

/**
 * Assemble the provenance document. Runner identity comes only from GitHub's
 * documented default environment, and timestamps are recorded as UTC ISO strings
 * captured while the build output exists — never reconstructed after the fact.
 */
const provenance = {
  schema: 'tokentrail-build-provenance/1',
  arch: options.arch,
  tag: options.tag,
  commit: options.commit,
  recordedAt: new Date().toISOString(),
  environment: {
    runnerOs: process.env['RUNNER_OS'] ?? null,
    runnerArch: process.env['RUNNER_ARCH'] ?? null,
    runnerImage: process.env['ImageOS'] ?? null,
    nodeVersion: process.version,
    npmVersion: `npm/${npmVersion}`,
    platform: process.platform,
  },
  artifacts,
};

await writeFile(options.output, `${JSON.stringify(provenance, null, 2)}\n`, 'utf8');

console.log(`provenance written: ${options.output} (${artifacts.length} artifact(s) hashed)`);
