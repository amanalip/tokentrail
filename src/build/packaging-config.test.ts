// Import filesystem checks so AppStream wiring must point at an existing checked-in file.
import { existsSync } from 'node:fs';

// Import promise-based reads so metainfo content assertions stay in one async test.
import { readFile } from 'node:fs/promises';

// Import Node's createRequire so the CommonJS builder configuration can load from ESM tests.
import { createRequire } from 'node:module';

// Import path helpers to resolve repository-relative metainfo sources deterministically.
import path from 'node:path';

// Import URL conversion so repository-root resolution never depends on the working directory.
import { fileURLToPath } from 'node:url';

/**
 * Phase 5 packaging-configuration contract tests (plan section 9.2).
 *
 * Responsibility: pin the electron-builder surface that release artifacts depend on —
 * target set, machine-safe artifact naming, desktop identity wiring, payload allowlist,
 * fuse posture, and AppStream metadata delivery — so an accidental edit fails here,
 * before packages are built, rather than after they ship.
 * Trust level: pure local reads of two checked-in files; nothing is built or executed.
 */

const requireFromTests = createRequire(import.meta.url);

// Load the real builder configuration and manifest instead of duplicating expectations.
const builderConfig = requireFromTests(
  '../../electron-builder.config.cjs',
) as TokenTrailBuilderConfig;
const packageManifest = requireFromTests('../../package.json') as TokenTrailPackageManifest;

// Resolve the repository root beside this checked-in test.
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Only the builder-config fields these contracts depend on are described here. */
interface TokenTrailBuilderConfig {
  readonly appId?: string;
  readonly productName?: string;
  readonly asar?: boolean;
  readonly npmRebuild?: boolean;
  readonly files?: readonly string[];
  readonly electronFuses?: Readonly<Record<string, boolean>>;
  readonly linux?: {
    readonly target?: readonly string[];
    readonly category?: string;
    readonly executableName?: string;
    readonly artifactName?: string;
    readonly syncDesktopName?: boolean;
    readonly maintainer?: string;
    readonly vendor?: string;
  };
  readonly deb?: { readonly fpm?: readonly string[] };
  readonly rpm?: { readonly fpm?: readonly string[] };
  readonly pacman?: { readonly fpm?: readonly string[] };
}

/** Only the manifest fields that packaged identity depends on are described here. */
interface TokenTrailPackageManifest {
  readonly productName?: string;
  readonly homepage?: string;
  readonly desktopName?: string;
}

describe('electron-builder Linux target surface', () => {
  it('builds exactly the four approved v1 package formats', () => {
    expect(builderConfig.linux?.target).toEqual(['AppImage', 'deb', 'rpm', 'pacman']);
  });

  it('keeps artifact names machine-safe with product slug, version, platform, architecture, and format', () => {
    // The approved identity rule reserves `tokentrail` for filesystem-facing names and
    // `Token Trail` for people-facing labels; the template must follow that split.
    expect(builderConfig.linux?.artifactName).toBe('${name}-${version}-${os}-${arch}.${ext}');
  });

  it('stays on the reviewed launcher slug and utility category', () => {
    expect(builderConfig.linux?.executableName).toBe('tokentrail');
    expect(builderConfig.linux?.category).toBe('Utility');
  });

  it('does not rebuild native modules because none ship', () => {
    expect(builderConfig.npmRebuild).toBe(false);
  });
});

describe('packaged desktop identity', () => {
  it('carries both the application id and the spaced product name', () => {
    expect(builderConfig.appId).toBe('com.tokentrail.app');
    expect(builderConfig.productName).toBe('Token Trail');
    expect(packageManifest.productName).toBe('Token Trail');
  });

  it('names the installed desktop entry after the manifest desktopName so window association works', () => {
    // Electron derives WM_CLASS and Wayland app_id from desktopName minus its suffix;
    // syncDesktopName makes the installed .desktop file use that same stem.
    expect(packageManifest.desktopName).toBe('tokentrail.desktop');
    expect(builderConfig.linux?.syncDesktopName).toBe(true);
  });

  it('declares the accountable maintainer and vendor identities required by native packages', () => {
    expect(builderConfig.linux?.maintainer).toMatch(/^Aman Ali <[^ ]+@[^ ]+>$/);
    expect(builderConfig.linux?.vendor).toBe('Aman Ali');
  });

  it('points project metadata at the reviewed repository homepage', () => {
    expect(packageManifest.homepage).toBe('https://github.com/amanalip/tokentrail');
  });
});

describe('packaged payload allowlist and hardening posture', () => {
  it('ships only bundled output, the runtime icon, and license or manifest metadata', () => {
    const files = builderConfig.files ?? [];
    expect(files).toContain('dist/**/*');
    expect(files).toContain('assets/branding/exports/tokentrail-icon-256.png');
    expect(files).toContain('package.json');
    expect(files).toContain('LICENSE');

    // Dependencies are bundled by Vite, so node_modules must be explicitly excluded
    // even though electron-builder would otherwise prune them itself.
    expect(files).toContain('!node_modules/**/*');
  });

  it('archives the application and keeps the reviewed Electron fuse posture', () => {
    expect(builderConfig.asar).toBe(true);

    const fuses = builderConfig.electronFuses ?? {};
    expect(fuses['runAsNode']).toBe(false);
    expect(fuses['enableNodeOptionsEnvironmentVariable']).toBe(false);
    expect(fuses['enableNodeCliInspectArguments']).toBe(false);
    expect(fuses['onlyLoadAppFromAsar']).toBe(true);
    expect(fuses['grantFileProtocolExtraPrivileges']).toBe(false);
    // Embedded ASAR validation stays off until Electron supports it on Linux; the
    // only-load-from-ASAR fuse still blocks an unpacked override directory.
    expect(fuses['enableEmbeddedAsarIntegrityValidation']).toBe(false);
  });
});

describe('AppStream metadata delivery', () => {
  const expectedDestination = '/usr/share/metainfo/com.tokentrail.app.metainfo.xml';

  it.each(['deb', 'rpm', 'pacman'] as const)(
    'maps the checked-in metainfo into every %s payload',
    (format) => {
      const fpmArguments = builderConfig[format]?.fpm ?? [];
      expect(fpmArguments).toHaveLength(1);

      // fpm receives one explicit source=destination mapping per native package so
      // software centers can describe installed instances through AppStream.
      const [source, destination] = (fpmArguments[0] ?? '').split('=');
      expect(destination).toBe(expectedDestination);

      // The source side must exist in this repository so a moved asset fails here,
      // not during a release build on another machine.
      expect(existsSync(path.resolve(repositoryRoot, source ?? ''))).toBe(true);
    },
  );

  it('describes the application honestly in the metainfo document', async () => {
    const metainfo = await readFile(
      path.join(repositoryRoot, 'build', 'metainfo', 'com.tokentrail.app.metainfo.xml'),
      'utf8',
    );

    expect(metainfo).toContain('<id>com.tokentrail.app</id>');
    expect(metainfo).toContain('<name>Token Trail</name>');
    expect(metainfo).toContain('<project_license>GPL-3.0-only</project_license>');
    expect(metainfo).toContain('<launchable type="desktop-id">tokentrail.desktop</launchable>');

    // The dashboard is read-only and local; language about telemetry, cloud sync,
    // or update checking must never enter packaged metadata.
    expect(metainfo).not.toMatch(/telemetr|cloud|sync|update check/i);
  });
});
