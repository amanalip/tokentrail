// Import Vitest's explicit helpers for renderer-safe error contract checks.
import { describe, expect, it } from 'vitest';

// Import the reviewed category list and public constructor.
import { APPLICATION_ERROR_CATEGORIES, createPublicApplicationError } from './application-error';

// Group checks around the intentionally narrow renderer-visible error shape.
describe('application error contract', () => {
  // Confirm the category vocabulary is immutable and contains no raw message field.
  it('creates a frozen category-only public error', () => {
    const publicError = createPublicApplicationError('invalid-response');

    expect(publicError).toEqual({ category: 'invalid-response' });
    expect(Object.keys(publicError)).toEqual(['category']);
    expect(Object.isFrozen(publicError)).toBe(true);
    expect(Object.isFrozen(APPLICATION_ERROR_CATEGORIES)).toBe(true);
  });
});
