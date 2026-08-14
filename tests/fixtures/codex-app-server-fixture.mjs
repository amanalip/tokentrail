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
} = {}) {
  // Return deterministic values that cannot be mistaken for genuine account data.
  return {
    limitId: id,
    limitName: name,
    primary: { usedPercent: used, windowDurationMins: duration, resetsAt: reset },
    secondary: { usedPercent: 12, windowDurationMins: 10_080, resetsAt: reset + 604_800 },
    credits: null,
    individualLimit: null,
    spendControlReached: null,
    planType: 'plus',
    rateLimitReachedType: null,
  };
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

  // Use the same normal data for full and explicit single-bucket scenarios.
  const quota = createQuota();
  return {
    rateLimits: quota,
    rateLimitsByLimitId: scenario === 'single-bucket' ? null : { codex: quota },
    rateLimitResetCredits: null,
  };
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
