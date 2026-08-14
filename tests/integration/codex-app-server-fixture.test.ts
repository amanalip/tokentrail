// @vitest-environment node

// Import synchronous process execution because this bounded fixture consumes a complete finite input document.
import { spawnSync } from 'node:child_process';

// Import read-only fixture access so no test request or account-shaped response is generated from real data.
import { readFileSync } from 'node:fs';

// Import path conversion so fixture paths do not depend on the test command's working directory.
import { fileURLToPath } from 'node:url';

// Import Vitest's explicit grouping and assertion helpers.
import { describe, expect, it } from 'vitest';

// Resolve the checked-in account-free app-server process beside this integration test directory.
const fixturePath = fileURLToPath(
  new URL('../fixtures/codex-app-server-fixture.mjs', import.meta.url),
);

// Resolve the two checked-in newline-delimited requests used as the fixture's standard input.
const fixtureRequestsPath = fileURLToPath(
  new URL('../fixtures/codex-app-server-requests.ndjson', import.meta.url),
);

// Group checks around the safe local stand-in for future Codex adapter integration.
describe('Codex app-server fixture', () => {
  // Prove the harness uses newline-delimited stdio and returns no real account data.
  it('answers initialization and an empty approved rate-limit read', () => {
    // Read only the small reviewed request fixture from the repository.
    const fixtureInput = readFileSync(fixtureRequestsPath);

    // Run the fixture directly with Node, no shell, a finite input, and a strict output ceiling.
    const fixtureResult = spawnSync(process.execPath, [fixturePath], {
      input: fixtureInput,
      maxBuffer: 16_384,
      encoding: 'utf8',
    });

    // Require successful fixture execution and no diagnostic output before trusting its protocol output.
    expect(fixtureResult.error).toBeUndefined();
    expect(fixtureResult.status).toBe(0);
    expect(fixtureResult.stderr).toBe('');

    // Require newline framing, then separate the two complete response objects.
    expect(fixtureResult.stdout.endsWith('\n')).toBe(true);
    const [initializationText, rateLimitText] = fixtureResult.stdout.trimEnd().split('\n');

    // Parse the complete initialization response after verifying its stdio framing.
    const initializationResponse = JSON.parse(initializationText ?? 'null') as unknown;

    // Confirm the response is deterministic fixture data rather than a real account response.
    expect(initializationResponse).toEqual({
      id: 1,
      result: {
        userAgent: 'tokentrail-fixture/0.2.0',
        codexHome: '/fixture',
        platformFamily: 'unix',
        platformOs: 'linux',
      },
    });

    // Parse the complete empty rate-limit response from the second framed line.
    const rateLimitResponse = JSON.parse(rateLimitText ?? 'null') as unknown;

    // Confirm all account-bearing values are deliberately absent in the fixture.
    expect(rateLimitResponse).toEqual({
      id: 2,
      result: {
        rateLimits: null,
        rateLimitsByLimitId: null,
        rateLimitResetCredits: null,
      },
    });
  });
});
