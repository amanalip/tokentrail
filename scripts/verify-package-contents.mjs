/**
 * Packaged-output inspection gate (implementation plan section 9.2).
 *
 * Responsibility: verify that electron-builder output contains only reviewed files.
 * Trust level: local build tooling; it reads repository and `release/` content but
 * never modifies tracked files or launches processes.
 * Denied behavior: no network access, no writes outside this process's own stdout,
 * and no interpretation of packaged bytes beyond allowlist and secret-marker checks.
 *
 * Three checks run against one built package tree:
 *   1. The unpacked application directory contains exactly the expected Electron
 *      runtime entries plus the `tokentrail` executable — nothing else.
 *   2. The ASAR archive's parsed header lists no development-only paths
 *      (sources, tests, docs, scripts, VCS data) inside the shipped payload.
 *   3. The ASAR bytes and every release artifact are scanned for credential-shaped
 *      markers so an accidentally bundled secret fails loudly instead of shipping.
 *
 * Run after building: `npm run check:package-contents`
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve the repository root from this script's checked-in location, never from the launch directory.
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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

const findings = [];
let checkedAsar = false;
let checkedArtifacts = 0;

// --- Check 1: the unpacked directory holds exactly the reviewed runtime set. ---
const unpackedDirectory = path.join(repositoryRoot, 'release', 'linux-unpacked');
try {
  await stat(unpackedDirectory);
} catch {
  console.error('release/linux-unpacked does not exist. Build first: npm run package:dir');
  process.exit(1);
}

for (const entry of await readdir(unpackedDirectory)) {
  if (!EXPECTED_UNPACKED_ENTRIES.has(entry)) {
    findings.push(`unexpected unpacked entry: ${entry}`);
  }

  if (REQUIRED_UNPACKED_ENTRIES.has(entry)) {
    REQUIRED_UNPACKED_ENTRIES.delete(entry);
  }
}

for (const missing of REQUIRED_UNPACKED_ENTRIES) {
  findings.push(`missing Electron license artifact: ${missing}`);
}

// --- Check 2: parse the ASAR header and reject development paths in the payload list. ---
// Archive layout: a 16-byte size pickle precedes the JSON header that lists every file.
const asarPath = path.join(unpackedDirectory, 'resources', 'app.asar');
const asarBytes = await readFile(asarPath);
try {
  const jsonLength = asarBytes.readUInt32LE(12);
  const headerJson = asarBytes.toString('utf8', 16, 16 + jsonLength);
  const header = JSON.parse(headerJson);

  // Walk the node tree, accumulating each file's full archive path for exact prefix checks.
  function collectFilePaths(node, prefix, sink) {
    for (const [name, child] of Object.entries(node.files ?? {})) {
      const childPath = `${prefix}${name}`;
      if (child.files !== undefined) {
        collectFilePaths(child, `${childPath}/`, sink);
      } else {
        sink.push(childPath);
      }
    }
  }

  const archivedPaths = [];
  collectFilePaths(header, '', archivedPaths);

  for (const archivedPath of archivedPaths) {
    if (FORBIDDEN_ASAR_PREFIXES.some((prefix) => archivedPath.startsWith(prefix))) {
      findings.push(`development file packaged into ASAR: ${archivedPath}`);
    }
  }

  checkedAsar = true;
} catch (error) {
  findings.push(`ASAR header could not be parsed as an archive listing: ${String(error)}`);
}

// --- Check 3: scan shipped byte streams for credential-shaped markers. ---
function scanForSecretMarkers(label, bytes) {
  // Latin1 keeps a byte-for-byte view so ASCII markers are found without decoding cost.
  const text = bytes.toString('latin1');
  for (const marker of SECRET_MARKERS) {
    if (text.includes(marker)) {
      findings.push(`secret marker "${marker}" found in ${label}`);
    }
  }
}

scanForSecretMarkers('app.asar', asarBytes);

for (const artifactName of await readdir(path.join(repositoryRoot, 'release'))) {
  const artifactPath = path.join(repositoryRoot, 'release', artifactName);
  if ((await stat(artifactPath)).isDirectory()) {
    continue;
  }

  if (/\.(AppImage|deb|rpm|pacman)$/.test(artifactName)) {
    scanForSecretMarkers(artifactName, await readFile(artifactPath));
    checkedArtifacts += 1;
  }
}

// --- Report honestly: inventory first, then a hard gate on any finding. ---
console.log(
  `packaged-contents inspection: ASAR listing ${checkedAsar ? 'parsed' : 'unavailable'}, artifacts scanned: ${checkedArtifacts}`,
);

if (findings.length > 0) {
  console.error(`packaged-contents inspection failed with ${findings.length} finding(s):`);
  for (const finding of findings) {
    console.error(` - ${finding}`);
  }
  process.exit(1);
}

console.log(
  'packaged-contents inspection passed: only reviewed runtime files and no secret markers.',
);
