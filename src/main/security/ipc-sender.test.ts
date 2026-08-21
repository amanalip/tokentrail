// Import Vitest's table-driven assertion helpers.
import { describe, expect, it } from 'vitest';

// Import the dependency-free authorization predicate used by the real IPC boundary.
import { isApprovedApplicationFrameUrl } from './ipc-sender';

// Prove the exact two approved renderer documents pass and all close variants fail.
describe('isApprovedApplicationFrameUrl', () => {
  // Accept the packaged and fixed development root documents only as top-level frames.
  it.each(['tokentrail://app/', 'http://127.0.0.1:5173/'])(
    'accepts the approved top-level document %s',
    (url) => expect(isApprovedApplicationFrameUrl(url, true)).toBe(true),
  );

  // Accept reviewed hash navigation because a fragment is client-side route state of the already
  // trusted document and can never select different content or carry authorization meaning.
  it.each([
    'tokentrail://app/#settings',
    'tokentrail://app/#learn/provenance',
    'http://127.0.0.1:5173/#usage',
  ])('accepts approved document with route fragment %s', (url) => {
    expect(isApprovedApplicationFrameUrl(url, true)).toBe(true);
  });

  // Reject subframes, malformed URLs, lookalike hosts, paths, query strings, and alternate ports.
  it.each([
    ['tokentrail://app/', false],
    ['tokentrail://evil/', true],
    ['tokentrail://app/settings', true],
    ['tokentrail://app/settings#settings', true],
    ['tokentrail://app/?redirect=evil', true],
    ['tokentrail://app/?redirect=evil#settings', true],
    ['http://127.0.0.1:5174/', true],
    ['http://localhost:5173/', true],
    ['http://127.0.0.1:5173/iframe', true],
    ['not a URL', true],
  ] as const)('rejects unapproved sender %s (top level: %s)', (url, isTopLevel) => {
    expect(isApprovedApplicationFrameUrl(url, isTopLevel)).toBe(false);
  });
});
