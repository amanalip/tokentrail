// Import line-oriented stream handling so the fixture behaves like the Codex stdio transport.
import { createInterface } from 'node:readline';

// Select one checked-in deterministic scenario without reading a real account.
const scenario = process.env['TOKENTRAIL_FIXTURE_SCENARIO'] ?? 'empty';

// Read newline-delimited JSON requests from test-owned standard input.
const requestLines = createInterface({ input: process.stdin, terminal: false });

// Send one compact JSON value followed by the protocol delimiter.
function sendProtocolValue(value) {
  // Serialize only fixture-owned values.
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

// Construct one synthetic quota snapshot for normal and variant fixtures.
function createQuota({
  id = 'codex',
  name = 'Codex',
  used = 37,
  duration = 300,
  reset = 1_800_000_000,
  includePrimary = true,
  includeSecondary = true,
  planType = 'plus',
  reachedType = null,
  credits = null,
  individualLimit = null,
  spendControlReached = null,
} = {}) {
  // Return deterministic values that cannot be mistaken for genuine account data.
  return {
    limitId: id,
    limitName: name,
    primary: includePrimary
      ? { usedPercent: used, windowDurationMins: duration, resetsAt: reset }
      : null,
    secondary: includeSecondary
      ? { usedPercent: 12, windowDurationMins: 10_080, resetsAt: reset + 604_800 }
      : null,
    credits,
    individualLimit,
    spendControlReached,
    planType,
    rateLimitReachedType: reachedType,
  };
}

// Wrap one quota snapshot in the approved rate-limit result envelope.
function createRateLimitEnvelope(quota, extra = {}) {
  return {
    rateLimits: quota,
    rateLimitsByLimitId: quota === null ? null : { [quota.limitId]: quota },
    rateLimitResetCredits: null,
    ...extra,
  };
}

// Emit one approved sparse rate-limit update notification without a request correlation id.
function sendSparseUpdateNotification() {
  sendProtocolValue({
    method: 'account/rateLimits/updated',
    params: {
      rateLimits: createQuota({ used: 41 }),
    },
  });
}

// Create one scenario-specific approved quota result.
function createRateLimitsResult() {
  // Preserve the original empty fixture behavior by default.
  if (scenario === 'empty')
    return { rateLimits: null, rateLimitsByLimitId: null, rateLimitResetCredits: null };

  // Return one bucket with deliberately absent supporting fields.
  if (scenario === 'null-fields') {
    const quota = createQuota({ used: 48, duration: null, reset: null });
    return {
      rateLimits: quota,
      rateLimitsByLimitId: { codex: quota },
      rateLimitResetCredits: null,
    };
  }

  // Include unknown fields and markup-shaped text to prove stripping and escaping.
  if (scenario === 'unknown-fields') {
    const quota = {
      ...createQuota({ name: '<img src=x onerror=alert(1)>' }),
      futureSecret: 'discard-me',
    };
    return {
      rateLimits: quota,
      rateLimitsByLimitId: { codex: quota },
      rateLimitResetCredits: null,
      futureEnvelope: true,
    };
  }

  // Return two independent buckets for multi-bucket rendering.
  if (scenario === 'multiple-buckets') {
    const codexQuota = createQuota();
    const reviewQuota = createQuota({
      id: 'review',
      name: 'Code review',
      used: 64,
      duration: 1_440,
    });
    return {
      rateLimits: codexQuota,
      rateLimitsByLimitId: { codex: codexQuota, review: reviewQuota },
      rateLimitResetCredits: null,
    };
  }

  // Supply only the server-designated primary window.
  if (scenario === 'primary-only') {
    return createRateLimitEnvelope(createQuota({ includeSecondary: false }));
  }

  // Supply only the secondary window so primary selection falls back honestly.
  if (scenario === 'secondary-only') {
    return createRateLimitEnvelope(createQuota({ includePrimary: false }));
  }

  // Report a bucket whose supported windows are all absent.
  if (scenario === 'no-windows') {
    return createRateLimitEnvelope(createQuota({ includePrimary: false, includeSecondary: false }));
  }

  // Carry unknown plan and limit values that normalization must treat as unavailable, not zero.
  if (scenario === 'unknown-values') {
    const quota = {
      ...createQuota(),
      primary: { usedPercent: 'thirty-seven', windowDurationMins: null, resetsAt: null },
      planType: 'mystery-plan',
      rateLimitReachedType: 'seasonal-override',
    };
    return createRateLimitEnvelope(quota);
  }

  // Report an explicit reached state beside a high-percentage bucket without one.
  if (scenario === 'reached-state') {
    const reachedQuota = createQuota({ used: 96, reachedType: 'primary' });
    const highQuota = createQuota({ id: 'review', name: 'Code review', used: 91 });
    return {
      rateLimits: reachedQuota,
      rateLimitsByLimitId: { codex: reachedQuota, review: highQuota },
      rateLimitResetCredits: null,
    };
  }

  // Share one reset timestamp across buckets while another window omits its reset entirely.
  if (scenario === 'shared-reset-timestamps') {
    const sharedReset = 1_800_000_000;
    const firstQuota = createQuota({ reset: sharedReset });
    const secondQuota = createQuota({ id: 'review', name: 'Code review', reset: sharedReset });
    secondQuota.secondary = { usedPercent: 8, windowDurationMins: 720, resetsAt: null };
    return {
      rateLimits: firstQuota,
      rateLimitsByLimitId: { codex: firstQuota, review: secondQuota },
      rateLimitResetCredits: null,
    };
  }

  // Report an unlimited credit balance as the object-shaped marker.
  if (scenario === 'credits-unlimited') {
    return createRateLimitEnvelope(createQuota({ credits: { unlimited: true } }));
  }

  // Report an exact zero balance string distinct from unavailable information.
  if (scenario === 'credits-zero-balance') {
    return createRateLimitEnvelope(createQuota({ credits: '$0.00' }));
  }

  // Report a decimal balance plus a structured spending control with per-field availability.
  if (scenario === 'credits-decimal-balance') {
    return createRateLimitEnvelope(
      createQuota({
        credits: { balance: '$18.40' },
        individualLimit: {
          limitAmount: '$40.00',
          usedAmount: '$21.60',
          remainingPercent: 46,
          reached: false,
          resetsAt: 1_800_000_000,
        },
        spendControlReached: false,
      }),
    );
  }

  // Supply the authoritative reset-credit count without any detail rows.
  if (scenario === 'reset-credits-count-only') {
    return createRateLimitEnvelope(createQuota(), {
      rateLimitResetCredits: { availableCount: 3 },
    });
  }

  // Mix every expiry classification with fewer detail rows than the authoritative count.
  if (scenario === 'reset-credits-expiry-mix') {
    const now = 1_800_000_000;
    return createRateLimitEnvelope(createQuota(), {
      rateLimitResetCredits: {
        availableCount: 5,
        details: [
          {
            title: 'Soon credit',
            description: 'Expires inside seven days.',
            expiresAt: now + 86_400,
          },
          {
            title: 'Later credit',
            description: 'Expires outside seven days.',
            expiresAt: now + 1_209_600,
          },
          {
            title: 'Past credit',
            description: 'Already expired.',
            expiresAt: now - 86_400,
          },
          {
            title: 'Open credit',
            description: 'No expiry was reported.',
            expiresAt: null,
          },
        ],
      },
    });
  }

  // Typography evidence scenarios expose exactly one primary window per representative remaining value.
  if (scenario.startsWith('typography-')) {
    const remainingPercent = Number(scenario.slice('typography-'.length));
    return createRateLimitEnvelope(
      createQuota({
        includeSecondary: false,
        used: 100 - remainingPercent,
      }),
    );
  }

  // Use the same normal data for full and explicit single-bucket scenarios.
  const quota = createQuota();
  return {
    rateLimits: quota,
    rateLimitsByLimitId: scenario === 'single-bucket' ? null : { codex: quota },
    rateLimitResetCredits: null,
  };
}

// Create one scenario-specific approved aggregate-usage result.
function createUsageResult() {
  // Preserve an honest unavailable usage section when no account exists.
  if (scenario === 'empty' || scenario === 'missing-account') {
    return { summary: null, dailyBuckets: null };
  }

  // Supply fourteen complete dates with one gap, one reported zero, and one duplicate record.
  if (scenario === 'usage-gaps') {
    const buckets = [];
    for (let day = 1; day <= 16; day += 1) {
      // Skip August 8 so the supplied span contains exactly one missing calendar date.
      if (day === 8) continue;
      // Mark August 4 as an explicit reported zero distinct from the missing date.
      const tokens = day === 4 ? '0' : `${10_000 + day}`;
      buckets.push({ date: `2026-08-${`${day}`.padStart(2, '0')}`, tokens });
    }
    // Repeat one date so duplicate handling is exercised at the normalization boundary.
    buckets.push({ date: '2026-08-02', tokens: '999' });
    return {
      summary: { lifetimeTokens: '160135', peakDailyTokens: '10016' },
      dailyBuckets: buckets,
    };
  }

  // Supply sixty complete dates whose preceding comparison period totals exactly zero.
  if (scenario === 'usage-sixty-days-zero-preceding') {
    const buckets = [];
    for (let day = 1; day <= 60; day += 1) {
      // The first thirty days are explicit zeros; the latest thirty carry positive totals.
      const tokens = day <= 30 ? '0' : `${20_000 + day}`;
      const month = day <= 30 ? '06' : '07';
      const dateNumber = day <= 30 ? day : day - 30;
      buckets.push({
        date: `2026-${month}-${`${dateNumber}`.padStart(2, '0')}`,
        tokens,
      });
    }
    return {
      summary: { lifetimeTokens: '630465', peakDailyTokens: '20030' },
      dailyBuckets: buckets,
    };
  }

  // Supply counters beyond the safe JavaScript integer range as canonical decimal strings.
  if (scenario === 'usage-huge-counters') {
    return {
      summary: {
        lifetimeTokens: '123456789012345678901234567890',
        peakDailyTokens: '99999999999999999999',
      },
      dailyBuckets: [
        { date: '2026-08-12', tokens: '12345678901234567890' },
        { date: '2026-08-13', tokens: '98765432109876543210' },
      ],
    };
  }

  // Supply two complete synthetic days plus reported summary counters.
  return {
    summary: {
      lifetimeTokens: '4203910',
      peakDailyTokens: '180400',
      currentStreakDays: 8,
      longestStreakDays: 19,
      longestTurnSeconds: 2520,
    },
    dailyBuckets: [
      { date: '2026-08-12', tokens: '91210' },
      { date: '2026-08-13', tokens: '124500' },
    ],
  };
}

// Track whether the after-full sparse update has already been emitted so it fires exactly once.
let sentSparseUpdateAfterFull = false;

// Emit the approved sparse update once before any response when the scenario requires that ordering.
if (scenario === 'sparse-update-before-full') {
  sendSparseUpdateNotification();
}

// Handle each complete request independently.
requestLines.on('line', (line) => {
  try {
    // Parse the complete test request.
    const request = JSON.parse(line);

    // Return the current minimal initialization shape.
    if (request.method === 'initialize') {
      sendProtocolValue({
        id: request.id,
        result: {
          userAgent: 'tokentrail-fixture/0.2.0',
          codexHome: '/fixture',
          platformFamily: 'unix',
          platformOs: 'linux',
        },
      });
      return;
    }

    // Return a signed-out or synthetic non-identifying account result.
    if (request.method === 'account/read') {
      const result =
        scenario === 'missing-account'
          ? { account: null, requiresOpenaiAuth: true }
          : {
              account: { type: 'chatgpt', email: 'fixture@example.invalid', planType: 'plus' },
              requiresOpenaiAuth: true,
            };
      sendProtocolValue({ id: request.id, result });
      return;
    }

    // Exercise normal and failure behavior at the quota request boundary.
    if (request.method === 'account/rateLimits/read') {
      if (scenario === 'malformed') {
        process.stdout.write('{not-json}\n');
        return;
      }
      if (scenario === 'oversized') {
        process.stdout.write(`${'x'.repeat(1_048_578)}\n`);
        return;
      }
      if (scenario === 'method-not-found') {
        sendProtocolValue({
          id: request.id,
          error: { code: -32_601, message: 'fixture method missing' },
        });
        return;
      }
      if (scenario === 'timeout') {
        return;
      }
      if (scenario === 'app-server-exit') {
        process.exit(1);
      }
      sendProtocolValue({ id: request.id, result: createRateLimitsResult() });
      // Answer the same correlation id a second time so duplicate-response handling is exercised.
      if (scenario === 'duplicate-id') {
        sendProtocolValue({ id: request.id, result: createRateLimitsResult() });
      }
      // Emit the approved sparse update only after the first full snapshot answer when required.
      if (scenario === 'sparse-update-after-full' && !sentSparseUpdateAfterFull) {
        sentSparseUpdateAfterFull = true;
        sendSparseUpdateNotification();
      }
      return;
    }

    // Exercise the approved aggregate-usage read with synthetic dated buckets.
    if (request.method === 'account/usage/read') {
      if (scenario === 'method-not-found') {
        sendProtocolValue({
          id: request.id,
          error: { code: -32_601, message: 'fixture method missing' },
        });
        return;
      }
      sendProtocolValue({ id: request.id, result: createUsageResult() });
      return;
    }

    // Reject every other request to preserve deny-by-default behavior.
    sendProtocolValue({
      id: request.id ?? null,
      error: { code: -32_601, category: 'method-not-found' },
    });
  } catch {
    // Reject malformed fixture input without raw exception text.
    sendProtocolValue({ id: null, error: { code: -32_700, category: 'parse-error' } });
  }
});

// Keep the child input active for immediate programmatic writes.
process.stdin.resume();

// Model a long-running server without periodic work.
const inputLifetime = setInterval(() => undefined, 1_000);

// Release the keepalive when the client closes input.
requestLines.on('close', () => clearInterval(inputLifetime));
