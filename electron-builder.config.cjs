/**
 * This CommonJS configuration is loaded by electron-builder after all three Vite bundles exist.
 * It packages only reviewed runtime files and flips Electron fuses that remove unused execution paths.
 * Linux ASAR integrity is not claimed because Electron currently supports embedded validation only on
 * macOS and Windows; `onlyLoadAppFromAsar` still prevents an unpacked app directory from overriding it.
 *
 * Phase 5 turns the single-target prototype into the four approved Linux release formats:
 * AppImage for portable distribution, plus deb, rpm, and Pacman for native package managers.
 * The machine-facing artifact stem stays `tokentrail` while every user-visible label stays
 * `Token Trail`, matching the approved product-identity split recorded in Phase 2.
 */
const path = require('node:path');

/**
 * Absolute path of the checked-in AppStream metainfo document and its system install location.
 * deb, rpm, and Pacman payloads receive it through fpm's explicit source=destination mapping so
 * software centers such as GNOME Software and Discover can describe installed instances.
 * The AppImage format has no equivalent per-target mapping in electron-builder 26; embedding
 * metadata inside that image remains deferred work instead of shipping a stray duplicate copy.
 */
const metainfoSource = path.resolve(
  __dirname,
  'build',
  'metainfo',
  'com.tokentrail.app.metainfo.xml',
);
const metainfoDestination = '/usr/share/metainfo/com.tokentrail.app.metainfo.xml';
const appStreamFpmMapping = `${metainfoSource}=${metainfoDestination}`;

module.exports = {
  // Give the desktop application a stable Linux-facing identity.
  appId: 'com.tokentrail.app',
  productName: 'Token Trail',

  // Store generated packages outside source and use the approved branding directory for product assets.
  directories: {
    output: 'release',
    buildResources: 'assets/branding',
  },

  // Archive application JavaScript so only the reviewed application archive is used at runtime.
  asar: true,

  // Skip native rebuilding because no runtime dependency ships a native module.
  npmRebuild: false,

  // Package bundled production output, the runtime window icon, and metadata while excluding dependencies already bundled by Vite.
  files: [
    'dist/**/*',
    'assets/branding/exports/tokentrail-icon-256.png',
    'package.json',
    'LICENSE',
    '!node_modules/**/*',
  ],

  // Remove execution modes and environment-controlled debug paths that Token Trail does not need.
  electronFuses: {
    runAsNode: false,
    enableCookieEncryption: true,
    enableNodeOptionsEnvironmentVariable: false,
    enableNodeCliInspectArguments: false,
    enableEmbeddedAsarIntegrityValidation: false,
    onlyLoadAppFromAsar: true,
    loadBrowserProcessSpecificV8Snapshot: false,
    grantFileProtocolExtraPrivileges: false,
  },

  linux: {
    // Build every approved v1 package format from this one reviewed configuration.
    target: ['AppImage', 'deb', 'rpm', 'pacman'],
    category: 'Utility',

    // Keep the launcher executable machine-safe while desktop entries show the spaced brand.
    executableName: 'tokentrail',
    icon: 'assets/branding/exports/tokentrail-icon-512.png',

    // Artifact names stay machine-safe: tokentrail-<version>-linux-<arch>.<format>.
    artifactName: '${name}-${version}-${os}-${arch}.${ext}',

    // Name the installed .desktop file after the manifest's desktopName so Electron's derived
    // WM_CLASS and Wayland app_id (`tokentrail`) match the entry and window association works.
    syncDesktopName: true,

    // Native packages require an accountable maintainer identity; both values mirror the
    // repository's established Git author and project homepage rather than inventing new ones.
    maintainer: 'Aman Ali <pamanalionline@gmail.com>',
    vendor: 'Aman Ali',
  },

  // Format-specific dependency sets remain owned by electron-builder's maintained defaults,
  // which track Chromium's runtime libraries per format. Token Trail adds no daemons, MIME
  // handlers, or tray services, so no post-install or post-remove script hooks are declared;
  // removing any package removes exactly its own files and leaves user preferences untouched.
  deb: {
    fpm: [appStreamFpmMapping],
  },
  rpm: {
    fpm: [appStreamFpmMapping],
  },
  pacman: {
    fpm: [appStreamFpmMapping],
  },
};
