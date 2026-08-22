/**
 * Structured draft-release notes generator for the tag-driven release pipeline.
 *
 * Responsibility: compose the user-facing Markdown body of a draft GitHub Release
 * from evidence that already exists — the tagged commit's CHANGELOG.md plus the
 * pipeline's own facts — so draft notes can never drift from, contradict, or
 * embellish the recorded changelog while still carrying the full structure the
 * implementation plan requires: highlights, security posture, fixes, known
 * limitations, installation links, checksum guidance, and upgrade notes.
 *
 * Trust level: CI release tooling. Reads only the checked-out changelog and its
 * arguments; writes only its single output file. All externally influenced values
 * (tag, commit, repository) are shape-validated before they touch the document.
 *
 * Denied behavior: no network access, no publication, no invention of release
 * history. A missing or unusable changelog fails closed instead of producing
 * silently empty notes.
 *
 * Usage: node scripts/write-release-notes.mjs --tag v1.0.0 \
 *          --commit <40-hex sha> --repo owner/name --output staging/RELEASE-NOTES.md
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve the default changelog from this script's checked-in location, never from an untrusted override.
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Read exactly the required CLI values; anything missing or unexpected fails closed. */
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

  for (const required of ['tag', 'commit', 'repo', 'output']) {
    if (typeof parsed[required] !== 'string' || parsed[required].length === 0) {
      throw new Error(`missing required --${required} value`);
    }
  }

  return parsed;
}

/**
 * Shape-validate every externally influenced value before it is embedded in the
 * notes. These regexes are deliberately strict because the values become links
 * and headings: a newline or shell metacharacter here would be injection, not formatting.
 */
function validateInputs(options) {
  // Semantic version with optional prerelease/build suffix, prefixed by the release "v".
  const tagPattern = /^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
  if (!tagPattern.test(options.tag)) {
    throw new Error(`--tag "${options.tag}" is not a plain vX.Y.Z release tag`);
  }

  // Full Git object name as provided by GitHub's workflow environment.
  if (!/^[0-9a-f]{40}$/.test(options.commit)) {
    throw new Error(`--commit "${options.commit}" is not a full 40-character hex SHA`);
  }

  // Owner/repository pair used to build documentation links back to the tagged tree.
  if (!/^[\w.-]+\/[\w.-]+$/.test(options.repo)) {
    throw new Error(`--repo "${options.repo}" is not an owner/name repository pair`);
  }

  return { ...options, version: options.tag.slice(1) };
}

/**
 * Extract one `##` section's body from the changelog. The section whose heading
 * names this exact version is preferred; while versions still live under
 * `Unreleased`, that section is the honest fallback and is labeled as such so
 * draft readers know the notes describe implemented-but-unreleased work.
 */
async function loadChangelogSection(changelogPath, version) {
  let changelog;
  try {
    changelog = await readFile(changelogPath, 'utf8');
  } catch {
    throw new Error(`changelog unreadable at ${changelogPath}; refusing to invent release notes`);
  }

  const headingPattern = /^## (.+)$/gm;
  const sections = [];
  let match;
  while ((match = headingPattern.exec(changelog)) !== null) {
    const start = match.index + match[0].length;
    const nextHeading = /^## /.exec(changelog.slice(start));
    const end = nextHeading ? start + nextHeading.index : changelog.length;
    sections.push({ title: match[1].trim(), body: changelog.slice(start, end).trim() });
  }

  const released = sections.find((section) => section.title === version);
  if (released) {
    return { source: `Released ${version}`, body: released.body };
  }

  const unreleased = sections.find((section) => section.title.toLowerCase() === 'unreleased');
  if (unreleased) {
    return {
      source: `Unreleased (implemented and verified work; ${version} is not yet published)`,
      body: unreleased.body,
    };
  }

  throw new Error(
    `changelog has no "${version}" or "Unreleased" section; refusing to produce empty notes`,
  );
}

const options = validateInputs(parseArguments(process.argv));
const changelogPath = path.join(repositoryRoot, 'CHANGELOG.md');
const changelogSection = await loadChangelogSection(changelogPath, options.version);

// Links point at the immutable tag ref, so published notes keep resolving to the
// exact reviewed documentation even after main moves on.
const treeBase = `https://github.com/${options.repo}/blob/${options.tag}`;
const shortCommit = options.commit.slice(0, 12);

/**
 * The fixed note structure demanded by implementation-plan sections 9.4 and 13.3.
 * Changelog text supplies highlights, security, and fix content; everything else
 * is operational guidance that must not contradict those records.
 */
const notes = `# Token Trail ${options.tag}

Built from commit \`${shortCommit}\` in ${options.repo} by the tag-driven release
pipeline. Publication is a deliberate maintainer action after review; failed
candidates produce no release objects at all.

**These builds are unsigned.** No Linux signing identity has been approved
yet, so verifying against \`SHA256SUMS.txt\` below is the integrity mechanism
(limitation LIM-007 in the known-limitations record).

## What's in this version

_Source: ${changelogSection.source}_

${changelogSection.body}

## Downloads

All four Linux package formats are provided for both supported architectures,
named \`tokentrail-${options.version}-linux-<arch>.<ext>\`. Each format labels
architectures in its own native vocabulary:

| Format | x64 label | arm64 label |
| --- | --- | --- |
| AppImage | \`x86_64\` | \`arm64\` |
| deb | \`amd64\` | \`arm64\` |
| rpm | \`x86_64\` | \`aarch64\` |
| Pacman | \`x86_64\` | \`aarch64\` |

\`SHA256SUMS.txt\` covers every attached artifact. The release page's automatic
"Source code (zip / tar.gz)" links are repository snapshots, not runnable builds.

## Verify your download

\`\`\`
sha256sum -c SHA256SUMS.txt --ignore-missing
\`\`\`

Every file you downloaded must print \`OK\` before you run anything.

## Install and upgrade

Format-specific steps, prerequisites, and removal instructions live in the user
guides at this exact tag:

- [Installing](${treeBase}/docs/user/installing.md) — AppImage, deb, rpm, and Pacman paths
- [Upgrading](${treeBase}/docs/user/upgrading.md) — v1 never checks for updates; upgrades are manual downloads
- [Troubleshooting](${treeBase}/docs/user/troubleshooting.md) — Codex detection, FUSE, desktop integration
- [Privacy](${treeBase}/docs/user/privacy.md) — what Token Trail reads, holds, and never sends

## Known limitations

Untested environments, preview-quality targets, and product gaps are recorded
with permanent identifiers in the
[known-limitations record](${treeBase}/docs/support/known-limitations.md)
rather than implied away. Highlights: artifacts are unsigned (LIM-007), deb/rpm/Pacman
install cycles await clean-environment campaigns (LIM-004), and arm64 builds are
verified-by-build only (LIM-006).
`;

await writeFile(options.output, `${notes}\n`, 'utf8');

console.log(
  `release notes written: ${options.output} (source section: ${changelogSection.source})`,
);
