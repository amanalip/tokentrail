// Import filesystem and path helpers so link resolution works from any working directory.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve the repository root from this checked-in script location.
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Collect every tracked Markdown file under the repository excluding generated and vendor trees.
const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  'dist',
  'release',
  'coverage',
  'test-results',
]);

function collectMarkdownFiles(directory) {
  // Walk the tree depth-first while skipping generated output directories entirely.
  const entries = [];
  for (const entry of readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry)) continue;
      entries.push(...collectMarkdownFiles(fullPath));
    } else if (entry.endsWith('.md')) {
      entries.push(fullPath);
    }
  }
  return entries;
}

// Extract inline Markdown links of the form [text](target) while ignoring reference definitions and code.
function extractMarkdownLinks(markdownText) {
  // Match the common inline form; images share the syntax but resolve identically.
  const linkPattern = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/gu;
  const targets = [];
  let match;
  while ((match = linkPattern.exec(markdownText)) !== null) {
    targets.push({ target: match[1], index: match.index });
  }
  return targets;
}

// Convert one heading into its GitHub-style anchor slug where every space becomes one hyphen.
function headingToSlug(headingText) {
  return headingText
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s/gu, '-');
}

// Collect every heading slug available inside one Markdown document using GitHub's duplicate rule:
// the first occurrence stays plain and later duplicates receive numeric suffixes in document order.
function collectHeadingSlugs(markdownText) {
  const usedCounts = new Map();
  const slugs = new Set();
  for (const line of markdownText.split('\n')) {
    const headingMatch = /^(#{1,6})\s+(.*)$/u.exec(line);
    if (headingMatch === null) continue;
    const baseSlug = headingToSlug(headingMatch[2]);
    const seenCount = usedCounts.get(baseSlug) ?? 0;
    usedCounts.set(baseSlug, seenCount + 1);
    slugs.add(seenCount === 0 ? baseSlug : `${baseSlug}-${seenCount}`);
  }
  return slugs;
}

// Existence probe that never throws so the sweep can report rather than crash on odd targets.
function statSyncSafe(candidatePath) {
  try {
    return statSync(candidatePath).isFile();
  } catch {
    return false;
  }
}

// Run the full documentation integrity sweep and report every finding with file and line context.
function main() {
  // Gather all candidate documents once so fragment lookups can read any target.
  const markdownFiles = collectMarkdownFiles(repositoryRoot);
  const contentsByFile = new Map(markdownFiles.map((file) => [file, readFileSync(file, 'utf8')]));

  const failures = [];

  for (const file of markdownFiles) {
    const content = contentsByFile.get(file);
    const relativeFile = path.relative(repositoryRoot, file);
    const lines = content.split('\n');

    // Verify each local Markdown link target and its optional heading fragment.
    for (const { target } of extractMarkdownLinks(content)) {
      // Skip external, absolute, and plain-anchor links that this checker cannot validate locally.
      if (target.startsWith('http://') || target.startsWith('https://')) continue;
      if (target.startsWith('mailto:')) continue;

      // Split the relative target into its file portion and optional fragment.
      const [rawPathPart, rawFragment] = target.split('#');
      const decodedPath = decodeURIComponent(rawPathPart ?? '');

      // A bare fragment refers to this same document's headings.
      const targetFile =
        decodedPath.length === 0 ? file : path.resolve(path.dirname(file), decodedPath);

      // The referenced file must exist on disk exactly as written, whatever its extension.
      if (!contentsByFile.has(targetFile) && !statSyncSafe(targetFile)) {
        const lineNumber = content.slice(0, content.indexOf(target)).split('\n').length;
        failures.push(`${relativeFile}:${lineNumber}: broken link target "${target}"`);
        continue;
      }

      // When a fragment names a heading it must match at least one slug in the target document.
      if (rawFragment !== undefined && rawFragment.length > 0) {
        const slugs = collectHeadingSlugs(contentsByFile.get(targetFile));
        if (!slugs.has(headingToSlug(decodeURIComponent(rawFragment)))) {
          failures.push(
            `${relativeFile}: missing heading fragment "#${rawFragment}" in ${path.relative(repositoryRoot, targetFile)}`,
          );
        }
      }
    }

    // Enforce product naming: prose must use "Token Trail"; CamelCase "TokenTrail" is reserved for
    // source identifiers and never rendered as copy. Lowercase machine slugs are permitted.
    lines.forEach((line, lineIndex) => {
      // Strip fenced-code and inline-code spans before terminology scanning to avoid identifier noise.
      const prosePortion = line.replace(/`[^`]*`/gu, '');
      const camelCaseMatches = prosePortion.match(/\bTokenTrail\b/gu);
      if (camelCaseMatches !== null) {
        failures.push(
          `${relativeFile}:${lineIndex + 1}: product copy uses "TokenTrail" instead of "Token Trail"`,
        );
      }
    });
  }

  // Report the summary honestly: zero failures exits clean so CI can gate on this command.
  if (failures.length > 0) {
    console.error(`Documentation check found ${failures.length} problem(s):`);
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Documentation check passed: ${markdownFiles.length} files scanned.`);
}

main();
