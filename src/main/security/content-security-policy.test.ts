// Import Vitest's explicit helpers for policy assertions.
import { describe, expect, it } from 'vitest';

// Import the production policy string used by the packaged protocol.
import {
  CONTENT_SECURITY_POLICY,
  DEVELOPMENT_CONTENT_SECURITY_POLICY,
} from './content-security-policy';

// Group policy checks by the dangerous capabilities they must continue denying.
describe('CONTENT_SECURITY_POLICY', () => {
  // Confirm the baseline permits only same-origin application resources.
  it('uses a self-only default source', () => {
    expect(CONTENT_SECURITY_POLICY).toContain("default-src 'self'");
  });

  // Confirm executable code cannot use inline scripts or dynamic evaluation.
  it('does not permit inline scripts or eval', () => {
    expect(CONTENT_SECURITY_POLICY).not.toContain("'unsafe-inline'");
    expect(CONTENT_SECURITY_POLICY).not.toContain("'unsafe-eval'");
  });

  // Confirm the development exception is limited to styles and one exact loopback hot-update endpoint.
  it('keeps the explicit development difference narrow', () => {
    expect(DEVELOPMENT_CONTENT_SECURITY_POLICY).toContain("style-src 'self' 'unsafe-inline'");
    expect(DEVELOPMENT_CONTENT_SECURITY_POLICY).toContain("connect-src 'self' ws://127.0.0.1:5173");
    expect(DEVELOPMENT_CONTENT_SECURITY_POLICY).not.toContain("script-src 'self' 'unsafe-inline'");
    expect(DEVELOPMENT_CONTENT_SECURITY_POLICY).not.toContain("'unsafe-eval'");
  });

  // Confirm production never inherits either development-only capability.
  it('keeps packaged style and connection sources strict', () => {
    expect(CONTENT_SECURITY_POLICY).toContain("style-src 'self'");
    expect(CONTENT_SECURITY_POLICY).not.toContain("'unsafe-inline'");
    expect(CONTENT_SECURITY_POLICY).not.toContain('ws://127.0.0.1:5173');
  });

  // Confirm objects, forms, base URL replacement, and embedding remain denied.
  it('denies active embedding and submission features', () => {
    expect(CONTENT_SECURITY_POLICY).toContain("object-src 'none'");
    expect(CONTENT_SECURITY_POLICY).toContain("form-action 'none'");
    expect(CONTENT_SECURITY_POLICY).toContain("base-uri 'none'");
    expect(CONTENT_SECURITY_POLICY).toContain("frame-ancestors 'none'");
  });
});
