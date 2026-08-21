// Export deterministic PNG rasters from the vector branding master.
//
// Responsibility: regenerate every required Token Trail icon raster from
// `assets/branding/tokentrail-icon.svg` so packaged and runtime consumers never drift from the
// approved mark. Trust level: maintainer-invoked build tooling with no network access.
// Dependencies: the system `rsvg-convert` binary (librsvg), deliberately not an npm dependency so
// no package, install script, or transitive tree is added for a task run rarely.
// Side effects: writes files only under `assets/branding/exports/`.
// Denied behavior: never edits source assets other than writing the export directory, never
// contacts the network, and never regenerates historical concept art.

// Import child-process execution so the rasterizer runs as one bounded synchronous step.
import { spawnSync } from 'node:child_process';

// Import filesystem helpers to create the export directory and verify written bytes.
import { mkdirSync, statSync } from 'node:fs';

// Import path helpers so output locations resolve identically from any working directory.
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve repository-rooted asset locations from this script's own checked-in position.
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const masterSvg = join(repositoryRoot, 'assets', 'branding', 'tokentrail-icon.svg');
const exportDirectory = join(repositoryRoot, 'assets', 'branding', 'exports');

/**
 * The complete set of required raster sizes.
 *
 * 512 feeds electron-builder's Linux installer metadata, 256 is the runtime window icon read by
 * `createMainWindow` inside the packaged archive, 88 serves the renderer brand tile at 44 CSS
 * pixels for two-times displays, and the remaining standard sizes cover desktop-environment icon
 * themes without requiring them to scale anything at install time.
 */
const REQUIRED_SIZES = Object.freeze([16, 24, 32, 48, 64, 88, 128, 256, 512]);

// Confirm the external rasterizer exists before touching the filesystem so failures explain themselves.
const versionProbe = spawnSync('rsvg-convert', ['--version'], { encoding: 'utf8' });
if (versionProbe.error || versionProbe.status !== 0) {
  console.error(
    'rsvg-convert (librsvg) is required to export branding rasters. Install it with your distribution package manager, for example: sudo pacman -S librsvg or sudo apt install librsvg2-bin.',
  );
  process.exit(1);
}

// Create the export directory fresh so stale files from removed sizes cannot survive silently.
mkdirSync(exportDirectory, { recursive: true });

// Render one deterministic PNG per required size; librsvg output depends only on the SVG input.
for (const size of REQUIRED_SIZES) {
  const outputPath = join(exportDirectory, `tokentrail-icon-${size}.png`);
  const render = spawnSync(
    'rsvg-convert',
    ['-w', String(size), '-h', String(size), masterSvg, '-o', outputPath],
    { encoding: 'utf8' },
  );

  // Fail loudly rather than leaving a partial export set that packaging could quietly consume.
  if (render.error || render.status !== 0) {
    console.error(`Failed to export ${size}x${size}: ${render.stderr ?? render.error}`);
    process.exit(1);
  }

  // Confirm real bytes landed; an empty file would pass rendering but break every consumer.
  const written = statSync(outputPath).size;
  if (written === 0) {
    console.error(`Export for ${size}x${size} produced an empty file.`);
    process.exit(1);
  }
  console.log(`Exported tokentrail-icon-${size}.png (${written} bytes)`);
}
