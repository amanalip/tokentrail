// Import Vitest's explicit helpers for the environment-boundary cases.
import { describe, expect, it } from 'vitest';

// Import the exact development URL validator under test.
import { validateDevelopmentUrl } from './development-url';

// Group accepted and rejected inputs around the one permitted local origin.
describe('validateDevelopmentUrl', () => {
  // Confirm the orchestrator's exact loopback URL is canonicalized and accepted.
  it('accepts the exact development origin', () => {
    expect(validateDevelopmentUrl('http://127.0.0.1:5173')).toBe('http://127.0.0.1:5173/');
  });

  // Confirm production's missing environment input selects packaged content.
  it('returns null when no development URL exists', () => {
    expect(validateDevelopmentUrl(undefined)).toBeNull();
  });

  // Confirm a deceptive hostname cannot pass an origin-prefix comparison.
  it('rejects a deceptive host suffix', () => {
    expect(validateDevelopmentUrl('http://127.0.0.1.example.com:5173')).toBeNull();
  });

  // Confirm localhost text is not treated as equivalent to the explicitly bound numeric loopback address.
  it('rejects a different loopback hostname', () => {
    expect(validateDevelopmentUrl('http://localhost:5173')).toBeNull();
  });

  // Confirm alternate paths cannot turn the development server into an arbitrary navigation bridge.
  it('rejects extra paths, queries, and fragments', () => {
    expect(validateDevelopmentUrl('http://127.0.0.1:5173/admin')).toBeNull();
    expect(validateDevelopmentUrl('http://127.0.0.1:5173/?mode=unsafe')).toBeNull();
    expect(validateDevelopmentUrl('http://127.0.0.1:5173/#unsafe')).toBeNull();
  });

  // Confirm malformed URL text fails closed.
  it('rejects malformed input', () => {
    expect(validateDevelopmentUrl('not a URL')).toBeNull();
  });
});
