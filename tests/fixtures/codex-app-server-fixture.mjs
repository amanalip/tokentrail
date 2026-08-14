// Import line-oriented stream handling so the fixture behaves like the current Codex stdio transport.
import { createInterface } from 'node:readline';

// Read newline-delimited JSON requests without accessing a real Codex account or machine-specific state.
const requestLines = createInterface({
  // Receive requests only from this child process's standard input.
  input: process.stdin,
  // Do not echo fixture input into output that the client could misinterpret as protocol traffic.
  terminal: false,
});

// Send one compact JSON value followed by the protocol's newline delimiter.
function sendProtocolValue(value) {
  // Serialize only fixture-owned values and write them to the child process's protocol output.
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

// Handle each complete request independently so partial operating-system chunks never reach JSON parsing.
requestLines.on('line', (line) => {
  try {
    // Parse the complete bounded test line supplied by the integration test.
    const request = JSON.parse(line);

    // Return a minimal capability response for the protocol initialization handshake.
    if (request.method === 'initialize') {
      sendProtocolValue({ id: request.id, result: { fixture: true } });
      return;
    }

    // Return a deliberately empty rate-limit snapshot with no account identifier or genuine usage value.
    if (request.method === 'account/rateLimits/read') {
      sendProtocolValue({
        id: request.id,
        result: {
          rateLimits: null,
          rateLimitsByLimitId: null,
          resetCredits: null,
        },
      });
      return;
    }

    // Reject every other fixture request to preserve deny-by-default behavior during adapter development.
    sendProtocolValue({
      id: request.id ?? null,
      error: { code: -32_601, category: 'method-not-found' },
    });
  } catch {
    // Reject malformed JSON with a safe category and no raw parser exception text.
    sendProtocolValue({
      id: null,
      error: { code: -32_700, category: 'parse-error' },
    });
  }
});

// Keep the child input stream active when a programmatic test client writes immediately after process creation.
process.stdin.resume();

// Keep the account-free fixture alive while its client-owned input stream remains open.
const inputLifetime = setInterval(() => {
  // Perform no work; the timer only models a long-running stdio server between test requests.
}, 1_000);

// Release the keepalive as soon as the test client closes the fixture input stream.
requestLines.on('close', () => clearInterval(inputLifetime));
