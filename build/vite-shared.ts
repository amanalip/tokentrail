// Import Node's complete built-in module list so Vite never bundles privileged runtime modules into app code.
import { builtinModules } from 'node:module';

// Include both traditional names such as `path` and explicit names such as `node:path` in the external list.
export const nodeAndElectronExternals = [
  'electron',
  ...builtinModules,
  ...builtinModules.map((moduleName) => `node:${moduleName}`),
];
