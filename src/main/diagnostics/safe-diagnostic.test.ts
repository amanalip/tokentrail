// Import Vitest's explicit helpers for diagnostic allowlist and canary assertions.
import { describe, expect, it } from 'vitest';

// Import the production constructor that will later feed diagnostic preview and export.
import { createSafeDiagnostic } from './safe-diagnostic';

// Define a conspicuous secret-like value that must never survive diagnostic construction.
const DIAGNOSTIC_CANARY = 'TOKENTRAIL_PRIVATE_CANARY_DO_NOT_EXPORT';

// Group checks around the non-identifying diagnostic boundary.
describe('createSafeDiagnostic', () => {
  // Prove unknown account, path, environment, and raw-error fields are absent from serialized output.
  it('keeps only reviewed fields and strips recursive canaries', () => {
    const diagnostic = createSafeDiagnostic({
      schemaVersion: 1,
      applicationVersion: '0.1.0',
      platform: 'linux',
      architecture: 'x64',
      startupPhase: 'ready',
      discoveryOutcome: 'found',
      capabilityState: 'supported',
      sanitizedErrorCategory: 'request-timeout',
      childRestartCount: 1,
      refreshDurationBucket: '250ms-to-1s',
      accountEmail: DIAGNOSTIC_CANARY,
      executablePath: `/private/${DIAGNOSTIC_CANARY}`,
      rawError: { message: DIAGNOSTIC_CANARY, environment: { TOKEN: DIAGNOSTIC_CANARY } },
    });

    // Confirm a valid safe projection exists and remains immutable.
    expect(diagnostic).not.toBeNull();
    expect(Object.isFrozen(diagnostic)).toBe(true);

    // Confirm the canary cannot appear at any depth after the projected document is serialized.
    expect(JSON.stringify(diagnostic)).not.toContain(DIAGNOSTIC_CANARY);

    // Confirm only the exact reviewed keys remain available for preview or export.
    expect(Object.keys(diagnostic ?? {})).toEqual([
      'schemaVersion',
      'applicationVersion',
      'platform',
      'architecture',
      'startupPhase',
      'discoveryOutcome',
      'capabilityState',
      'sanitizedErrorCategory',
      'childRestartCount',
      'refreshDurationBucket',
    ]);
  });

  // Confirm malformed safe-looking data cannot bypass category and numeric bounds.
  it('rejects invalid reviewed fields', () => {
    expect(
      createSafeDiagnostic({
        schemaVersion: 1,
        applicationVersion: DIAGNOSTIC_CANARY,
        platform: 'linux',
        architecture: 'x64',
        startupPhase: 'ready',
        discoveryOutcome: 'found',
        capabilityState: 'supported',
        childRestartCount: 999,
        refreshDurationBucket: 'precise-private-timing',
      }),
    ).toBeNull();
  });
});
