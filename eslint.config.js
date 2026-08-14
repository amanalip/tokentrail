// Import ESLint's maintained baseline so ordinary JavaScript mistakes are rejected consistently.
import eslint from '@eslint/js';

// Import the React Hooks rules because incorrect hook dependencies can create stale or repeated UI work.
import reactHooks from 'eslint-plugin-react-hooks';

// Import the environment globals as named data instead of manually maintaining browser and Node names.
import globals from 'globals';

// Import the TypeScript parser and rules that understand TokenTrail's authored source files.
import typescriptEslint from 'typescript-eslint';

// Export one flat configuration array because ESLint 10 no longer uses the legacy configuration format.
export default typescriptEslint.config(
  // Ignore only reproducible dependency, build, package, coverage, and report output.
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'release/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },

  // Apply ESLint's core recommended rules to all authored JavaScript and TypeScript files.
  eslint.configs.recommended,

  // Apply TypeScript-aware recommended rules without requiring a second type-analysis pass during linting.
  ...typescriptEslint.configs.recommended,

  // Give main-process, build-tool, and test files the Node globals they legitimately use.
  {
    files: [
      'src/main/**/*.ts',
      'scripts/**/*.{js,mjs}',
      '*.config.{js,cjs,ts}',
      'tests/**/*.{ts,mjs}',
    ],
    languageOptions: {
      globals: globals.node,
    },
  },

  // Give renderer code browser globals while deliberately withholding Node globals from that trust boundary.
  {
    files: ['src/renderer/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
  },

  // Apply React's hook correctness rules only to renderer components and hooks.
  {
    files: ['src/renderer/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs['recommended-latest'].rules,
    },
  },

  // Tighten a few readability rules that are important at privileged boundaries.
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['error', { allow: ['error', 'warn'] }],
    },
  },
);
