/**
 * Inspect unpacked and extracted Linux payloads recursively, including application resources.
 * Uses bsdtar for deb/rpm/Pacman and unsquashfs for AppImage; packaged executables are never run.
 * Extraction is confined to disposable temporary directories. Missing extractors fail the gate.
 */
import { execFile } from 'node:child_process';
import { readdir, readFile, lstat, readlink, mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const execute = promisify(execFile);
/** Every entry currently expected directly under `release/linux-unpacked`. */
const EXPECTED_UNPACKED_ENTRIES = new Set([
  'chrome_100_percent.pak',
  'chrome_200_percent.pak',
  'chrome_crashpad_handler',
  'chrome-sandbox',
  'icudtl.dat',
  'libEGL.so',
  'libffmpeg.so',
  'libGLESv2.so',
  'libvk_swiftshader.so',
  'libvulkan.so.1',
  'LICENSE.electron.txt',
  'LICENSES.chromium.html',
  'locales',
  'resources',
  'resources.pak',
  'snapshot_blob.bin',
  'tokentrail',
  'v8_context_snapshot.bin',
  'vk_swiftshader_icd.json',
]);

// Electron ships its own license artifacts beside the binaries; both must stay present.
const REQUIRED_UNPACKED_ENTRIES = new Set(['LICENSE.electron.txt', 'LICENSES.chromium.html']);

/**
 * Development-only locations that must never appear in the packaged ASAR listing.
 * Prefixes match archive paths with a trailing separator so `src/` cannot be
 * bypassed by a file named `source-notes`; bare names catch `.git` style entries.
 */
const FORBIDDEN_ASAR_PREFIXES = [
  'src/',
  'tests/',
  'docs/',
  'scripts/',
  'build/',
  'coverage/',
  'test-results/',
  '.git',
];

/** Credential-shaped markers whose presence in any shipped byte stream is a failure. */
const SECRET_MARKERS = [
  'BEGIN RSA PRIVATE KEY',
  'BEGIN OPENSSH PRIVATE KEY',
  'BEGIN PRIVATE KEY',
  'ghp_',
  'github_pat_',
  'xoxb-',
  'sk-ant-',
  'AWS_ACCESS_KEY_ID=',
];

const LOCALES = new Set(
  'af am ar bg bn ca cs da de el en-GB en-US es-419 es et fa fi fil fr gu he hi hr hu id it ja kn ko lt lv ml mr ms nb nl pl pt-BR pt-PT ro ru sk sl sr sv sw ta te th tr uk ur vi zh-CN zh-TW'
    .split(' ')
    .map((locale) => `${locale}.pak`),
);
const findings = [];
let checkedAsars = 0;
let checkedArtifacts = 0;
let checkedFiles = 0;

function scanForSecretMarkers(label, bytes) {
  const text = bytes.toString('latin1');
  for (const marker of SECRET_MARKERS) {
    if (text.includes(marker)) findings.push(`secret marker "${marker}" found in ${label}`);
  }
}

function inspectAsar(label, bytes) {
  try {
    const jsonLength = bytes.readUInt32LE(12);
    if (jsonLength > bytes.length - 16) throw new Error('Truncated header');
    const header = JSON.parse(bytes.toString('utf8', 16, 16 + jsonLength));
    if (!header.files || typeof header.files !== 'object') throw new Error('Missing file tree');
    function visit(node, prefix = '') {
      for (const [name, child] of Object.entries(node.files ?? {})) {
        const entry = `${prefix}${name}`;
        if (FORBIDDEN_ASAR_PREFIXES.some((forbidden) => entry.startsWith(forbidden))) {
          findings.push(`development file packaged into ASAR: ${label}:${entry}`);
        }
        if (child.unpacked) findings.push(`unreviewed unpacked ASAR entry: ${label}:${entry}`);
        if (child.files) visit(child, `${entry}/`);
      }
    }
    visit(header);
    checkedAsars += 1;
  } catch (error) {
    findings.push(`ASAR header could not be parsed: ${label}: ${String(error)}`);
  }
}

/** Never follow payload symlinks into the host filesystem. */
async function walk(directory, visit, prefix = '') {
  for (const entry of await readdir(directory)) {
    const relative = `${prefix}${entry}`;
    const absolute = path.join(directory, entry);
    const info = await lstat(absolute);
    await visit(relative, absolute, info);
    if (info.isDirectory()) await walk(absolute, visit, `${relative}/`);
  }
}

async function inspectRuntime(directory, appImage = false) {
  const required = new Set([...REQUIRED_UNPACKED_ENTRIES, 'resources/app.asar']);
  const appImageEntries = new Set([
    'AppRun',
    '.DirIcon',
    'tokentrail.desktop',
    'tokentrail.png',
    'usr/lib/libXss.so.1',
    'usr/lib/libXtst.so.6',
    'usr/lib/libappindicator.so.1',
    'usr/lib/libgconf-2.so.4',
    'usr/lib/libindicator.so.7',
    'usr/lib/libnotify.so.4',
    'usr/share/icons/hicolor/512x512/apps/tokentrail.png',
  ]);
  const appImageDirectories = new Set([
    'usr',
    'usr/lib',
    'usr/share',
    'usr/share/icons',
    'usr/share/icons/hicolor',
    'usr/share/icons/hicolor/512x512',
    'usr/share/icons/hicolor/512x512/apps',
  ]);
  await walk(directory, async (relative, absolute, info) => {
    const allowed =
      appImage && (appImageEntries.has(relative) || appImageDirectories.has(relative))
        ? true
        : !relative.includes('/')
          ? EXPECTED_UNPACKED_ENTRIES.has(relative) || (appImage && appImageEntries.has(relative))
          : relative.startsWith('locales/')
            ? LOCALES.has(relative.slice('locales/'.length))
            : [
                'resources/app.asar',
                'resources/app-update.yml',
                'resources/apparmor-profile',
                'resources/package-type',
              ].includes(relative);
    if (!allowed) findings.push(`unexpected runtime entry: ${relative}`);
    if (
      ['locales', 'resources'].includes(relative) ||
      (appImage && appImageDirectories.has(relative))
    ) {
      if (!info.isDirectory()) findings.push(`runtime directory required: ${relative}`);
    } else if (
      !info.isFile() &&
      !(appImage && appImageEntries.has(relative) && info.isSymbolicLink())
    ) {
      findings.push(`runtime regular file required: ${relative}`);
    }
    if (info.isFile()) required.delete(relative);
    void absolute;
  });
  for (const missing of required) findings.push(`missing required runtime file: ${missing}`);
}

async function inspectTree(directory, label, appImage = false) {
  let asars = 0;
  await walk(directory, async (relative, absolute, info) => {
    if (info.isFile()) {
      const bytes = await readFile(absolute);
      scanForSecretMarkers(`${label}/${relative}`, bytes);
      checkedFiles += 1;
      if (relative === 'resources/app.asar' || relative.endsWith('/resources/app.asar')) {
        inspectAsar(`${label}/${relative}`, bytes);
        await inspectRuntime(path.dirname(path.dirname(absolute)), appImage);
        asars += 1;
      }
    } else if (info.isSymbolicLink()) {
      scanForSecretMarkers(`${label}/${relative} (link)`, Buffer.from(await readlink(absolute)));
    } else if (!info.isDirectory()) {
      findings.push(`unexpected special file: ${label}/${relative}`);
    }
  });
  if (asars !== 1) findings.push(`expected one application ASAR in ${label}, found ${asars}`);
}

async function extractTar(archive, destination) {
  await mkdir(destination, { recursive: true });
  await execute('bsdtar', ['--no-same-owner', '-xf', archive, '-C', destination]);
}

async function extractArtifact(artifact, destination) {
  if (artifact.endsWith('.AppImage')) {
    // AppImage embeds SquashFS after its ELF runtime. Locate and validate the superblock
    // with the extractor, rather than executing the packaged runtime to discover the offset.
    const bytes = await readFile(artifact);
    for (
      let offset = bytes.indexOf('hsqs');
      offset !== -1;
      offset = bytes.indexOf('hsqs', offset + 4)
    ) {
      try {
        await execute('unsquashfs', ['-s', '-o', String(offset), artifact]);
      } catch {
        continue;
      }
      await execute('unsquashfs', [
        '-no-progress',
        '-processors',
        '1',
        '-o',
        String(offset),
        '-d',
        destination,
        artifact,
      ]);
      return destination;
    }
    throw new Error('No readable SquashFS payload found in AppImage');
  }
  if (artifact.endsWith('.deb')) {
    const envelope = `${destination}-deb`;
    await extractTar(artifact, envelope);
    const entries = await readdir(envelope);
    const data = entries.filter((name) => /^data\.tar(?:\.(?:gz|xz|zst|bz2))?$/.test(name));
    const control = entries.filter((name) => /^control\.tar(?:\.(?:gz|xz|zst|bz2))?$/.test(name));
    if (data.length !== 1 || control.length !== 1) throw new Error('Invalid deb payload inventory');
    await extractTar(path.join(envelope, data[0]), path.join(destination, 'data'));
    await extractTar(path.join(envelope, control[0]), path.join(destination, 'control'));
    return destination;
  }
  await extractTar(artifact, destination);
  return destination;
}

const architecture = process.argv[2] ?? 'x64';
if (!['x64', 'arm64'].includes(architecture) || process.argv.length > 3) {
  throw new Error('Usage: node scripts/verify-package-contents.mjs [x64|arm64]');
}
const releaseDirectory = path.join(repositoryRoot, 'release');
try {
  const unpackedDirectory = path.join(
    releaseDirectory,
    architecture === 'x64' ? 'linux-unpacked' : 'linux-arm64-unpacked',
  );
  await inspectTree(unpackedDirectory, 'linux-unpacked');
  for (const name of await readdir(releaseDirectory)) {
    if (!/\.(AppImage|deb|rpm|pacman)$/.test(name)) continue;
    const artifact = path.join(releaseDirectory, name);
    if (!(await lstat(artifact)).isFile()) {
      findings.push(`artifact must be a regular file: ${name}`);
      continue;
    }
    const temporary = await mkdtemp(path.join(tmpdir(), 'tokentrail-inspect-'));
    try {
      const payload = await extractArtifact(artifact, path.join(temporary, 'payload'));
      await inspectTree(payload, name, name.endsWith('.AppImage'));
      checkedArtifacts += 1;
    } catch (error) {
      findings.push(`could not inspect extracted ${name}: ${String(error)}`);
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  }
} catch (error) {
  findings.push(`package inspection could not complete: ${String(error)}`);
}
console.log(
  `packaged-contents inspection: ${checkedAsars} ASAR listings, ${checkedFiles} files, ${checkedArtifacts} extracted artifacts inspected`,
);
if (findings.length > 0) {
  console.error(`packaged-contents inspection failed with ${findings.length} finding(s):`);
  for (const finding of findings) console.error(` - ${finding}`);
  process.exitCode = 1;
} else {
  console.log(
    'packaged-contents inspection passed: runtime allowlists and recursive extracted-payload marker checks.',
  );
}
