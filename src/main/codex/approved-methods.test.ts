// Import Vitest's explicit helpers for allowlist behavior checks.
import { describe, expect, it } from 'vitest';

// Import the production constants and guards so tests exercise the exact privileged policy.
import {
  APPROVED_CODEX_NOTIFICATION_METHODS,
  APPROVED_CODEX_REQUEST_METHODS,
  isApprovedCodexNotificationMethod,
  isApprovedCodexRequestMethod,
} from './approved-methods';

// Group checks around Token Trail's closed Codex protocol surface.
describe('Codex method allowlists', () => {
  // Confirm every reviewed request remains available without permitting another method by accident.
  it('accepts only the reviewed outbound request methods', () => {
    expect([...APPROVED_CODEX_REQUEST_METHODS]).toEqual([
      'initialize',
      'account/read',
      'account/rateLimits/read',
      'account/usage/read',
    ]);
    expect(isApprovedCodexRequestMethod('account/rateLimits/read')).toBe(true);
    expect(isApprovedCodexRequestMethod('account/rateLimits/updated')).toBe(false);
  });

  // Confirm the one sparse update is inbound-only and cannot become a generic request path.
  it('keeps approved notifications separate from outbound requests', () => {
    expect([...APPROVED_CODEX_NOTIFICATION_METHODS]).toEqual(['account/rateLimits/updated']);
    expect(isApprovedCodexNotificationMethod('account/rateLimits/updated')).toBe(true);
    expect(isApprovedCodexNotificationMethod('account/rateLimits/read')).toBe(false);
  });

  // Exercise representative mutation, content, filesystem, shell, and malformed values as explicit denials.
  it.each([
    'account/login/start',
    'account/logout',
    'account/rateLimitResetCredit/consume',
    'account/sendAddCreditsNudgeEmail',
    'account/workspaceMessages/read',
    'feedback/upload',
    'process/spawn',
    'config/value/write',
    'plugin/install',
    'thread/start',
    'turn/start',
    'fs/readFile',
    'shell/exec',
    'account/rateLimits/read/extra',
    '',
    null,
    1,
  ])('denies unreviewed method %j', (method) => {
    expect(isApprovedCodexRequestMethod(method)).toBe(false);
    expect(isApprovedCodexNotificationMethod(method)).toBe(false);
  });

  // Confirm runtime mutation cannot silently expand either reviewed method set.
  it('freezes both method lists', () => {
    expect(Object.isFrozen(APPROVED_CODEX_REQUEST_METHODS)).toBe(true);
    expect(Object.isFrozen(APPROVED_CODEX_NOTIFICATION_METHODS)).toBe(true);
  });
});
