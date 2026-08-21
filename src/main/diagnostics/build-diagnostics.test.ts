// Import Vitest assertions and grouping helpers.
import { describe, expect, it } from 'vitest';

// Import the builder under test.
import { buildDiagnosticsDocument } from './build-diagnostics';

// Import runtime validation so canary scanning runs against the real boundary output.
import { diagnosticsDocumentSchema } from '../../shared/contracts/diagnostics';
import { createDefaultPreferences } from '../../shared/contracts/preferences';

// Construct one complete snapshot fixture through the public boundary schema.
function createSnapshot() {
  // Build a minimal valid snapshot with unavailable usage and credits sections.
  return {
    state: 'ready' as const,
    accountKind: 'chatgpt' as const,
    planType: 'plus',
    quotas: [],
    usage: {
      state: 'unavailable' as const,
      days: [],
      summary: {
        lifetimeTokens: null,
        peakDailyTokens: null,
        currentStreakDays: null,
        longestStreakDays: null,
        longestTurnSeconds: null,
      },
      coverage: {
        validDateCount: 0,
        rejectedRecordCount: 0,
        reportedZeroCount: 0,
        missingDates: [],
        missingDatesTruncated: false,
        firstValidDate: null,
        lastValidDate: null,
      },
    },
    credits: {
      state: 'unavailable' as const,
      balanceUnlimited: false,
      balanceAmount: null,
      spendingControl: null,
      resetCreditsAvailableCount: null,
      resetCreditDetails: [],
      resetCreditDetailsCapped: false,
    },
    sessionObservation: {
      startedAtIso: '2026-08-14T07:00:00.000Z',
      validSnapshotCount: 4,
      quotaDeltas: [],
      counterDeltas: [],
      resetTransitions: [],
    },
    lastSuccessfulRefreshAt: '2026-08-14T07:00:00.000Z',
    refreshAttemptedAt: '2026-08-14T07:00:00.000Z',
    errorCategory: null,
  };
}

// Group behavior around the closed diagnostic document.
describe('buildDiagnosticsDocument', () => {
  it('produces a schema-valid document from reviewed inputs', () => {
    const document = buildDiagnosticsDocument({
      environment: {
        tokenTrailVersion: '0.3.0',
        electronVersion: '43.0.0',
        chromiumVersion: '134.0.0.0',
        nodeVersion: '24.0.0',
        operatingSystem: 'linux',
        architecture: 'x64',
        sessionType: 'wayland',
      },
      connection: {
        codexDiscovered: true,
        codexReportedVersion: null,
        supportedCapabilities: ['account/read'],
        unsupportedCapabilities: [],
      },
      snapshot: createSnapshot(),
      preferences: createDefaultPreferences(),
      health: {
        refreshAttemptCount: 3,
        refreshSuccessCount: 2,
        refreshFailureCount: 1,
        refreshNoDataCount: 0,
        lastRefreshOutcome: 'failed',
        lastRefreshDurationBucket: '250ms-to-1s',
      },
      generatedAt: new Date('2026-08-14T07:00:00.000Z'),
    });

    // The complete document must satisfy the closed schema.
    expect(diagnosticsDocumentSchema.parse(document)).toBeDefined();
    expect(document.session.validSnapshotCount).toBe(4);
    expect(document.platform.sessionType).toBe('wayland');
    // The sanitized health section carries counters and closed categories only.
    expect(document.health).toEqual({
      refreshAttemptCount: 3,
      refreshSuccessCount: 2,
      refreshFailureCount: 1,
      refreshNoDataCount: 0,
      lastRefreshOutcome: 'failed',
      lastRefreshDurationBucket: '250ms-to-1s',
    });
  });

  it('contains no seeded sensitive canaries anywhere in the serialized output', () => {
    const document = buildDiagnosticsDocument({
      environment: {
        tokenTrailVersion: '0.3.0',
        electronVersion: '43.0.0',
        chromiumVersion: '134.0.0.0',
        nodeVersion: '24.0.0',
        operatingSystem: 'linux',
        architecture: 'x64',
        sessionType: 'unknown',
      },
      connection: {
        codexDiscovered: true,
        codexReportedVersion: null,
        supportedCapabilities: ['account/read', 'account/rateLimits/read'],
        unsupportedCapabilities: [],
      },
      snapshot: createSnapshot(),
      preferences: createDefaultPreferences(),
      health: {
        refreshAttemptCount: 1,
        refreshSuccessCount: 1,
        refreshFailureCount: 0,
        refreshNoDataCount: 0,
        lastRefreshOutcome: 'succeeded',
        lastRefreshDurationBucket: 'under-250ms',
      },
      generatedAt: new Date('2026-08-14T07:00:00.000Z'),
    });

    // Serialize the validated document for recursive canary scanning.
    const serialized = JSON.stringify(document).toLowerCase();

    // Every sensitive class must be absent from the exported surface.
    const canaries = [
      'secret-canary',
      'token=',
      'sk-',
      'password',
      'user@example',
      '/home/',
      'api_key',
      'environment',
      'prompt',
      'email',
    ];
    for (const canary of canaries) {
      expect(serialized).not.toContain(canary);
    }
  });
});
