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
import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
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

// Hash every distributable produced by this build; a stray or missing artifact is visible here first.
const artifacts = [];
for (const name of (await readdir(releaseDirectory)).sort()) {
  if (!name.startsWith('tokentrail-')) {
    continue;
  }

  const filePath = path.join(releaseDirectory, name);
  const fileStat = await stat(filePath);
  if (!fileStat.isFile()) {
    continue;
  }

  const digest = createHash('sha256');
  digest.update(await readFile(filePath));
  artifacts.push({
    name,
    bytes: fileStat.size,
    sha256: digest.digest('hex'),
  });
}

if (artifacts.length === 0) {
  throw new Error('no tokentrail-* artifacts found; refusing to write empty provenance');
}

// The npm user agent looks like "npm/12.0.2 node/v24.18.1 linux x64 workspaces/false".
const npmUserAgent = process.env['npm_config_user_agent'] ?? '';

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
    npmVersion: npmUserAgent.split(' ')[0] || null,
    platform: process.platform,
  },
  artifacts,
};

await writeFile(options.output, `${JSON.stringify(provenance, null, 2)}\n`, 'utf8');

console.log(`provenance written: ${options.output} (${artifacts.length} artifact(s) hashed)`);
