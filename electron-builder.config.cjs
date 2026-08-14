/**
 * This CommonJS configuration is loaded by electron-builder after all three Vite bundles exist.
 * It packages only reviewed runtime files and flips Electron fuses that remove unused execution paths.
 * Linux ASAR integrity is not claimed because Electron currently supports embedded validation only on
 * macOS and Windows; `onlyLoadAppFromAsar` still prevents an unpacked app directory from overriding it.
 */
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

  // Skip native rebuilding because Phase 1 has no native runtime dependency.
  npmRebuild: false,

  // Package bundled production output and metadata while excluding dependencies already bundled by Vite.
  files: ['dist/**/*', 'package.json', 'LICENSE', '!node_modules/**/*'],

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

  // Configure the first Linux package target used to prove the Phase 1 packaged shell.
  linux: {
    target: ['AppImage'],
    category: 'Utility',
    executableName: 'tokentrail',
    icon: 'assets/branding/tokentrail-icon-v2-dark.png',
    artifactName: '${productName}-${version}-${os}-${arch}.${ext}',
  },
};
