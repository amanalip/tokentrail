// Import the centralized protocol limits so every recursive check uses one reviewed policy.
import { CODEX_PROTOCOL_LIMITS } from './protocol-limits';

/**
 * Validate the shape-independent size of a parsed JSON value before version-specific Zod validation. This walk
 * rejects unexpectedly deep, wide, long, or unsafe input without copying or logging the untrusted value.
 */
export function isProtocolValueWithinLimits(value: unknown): boolean {
  // Track pending values with their depth so traversal remains iterative and cannot exhaust the call stack.
  const pending: Array<readonly [unknown, number]> = [[value, 0]];

  // Inspect every reachable JSON member until one violates the reviewed bounds.
  while (pending.length > 0) {
    // Remove the next bounded entry; the length check guarantees it exists.
    const [current, depth] = pending.pop()!;

    // Reject nesting before inspecting children at a depth beyond the policy.
    if (depth > CODEX_PROTOCOL_LIMITS.maximumNestingDepth) {
      return false;
    }

    // Bound strings independently because metadata text can otherwise dominate memory.
    if (typeof current === 'string') {
      if (current.length > CODEX_PROTOCOL_LIMITS.maximumStringCharacters) {
        return false;
      }

      continue;
    }

    // Reject non-finite and unsafe JSON numbers rather than accepting already imprecise integers.
    if (typeof current === 'number') {
      if (
        !Number.isFinite(current) ||
        (Number.isInteger(current) && !Number.isSafeInteger(current))
      ) {
        return false;
      }

      continue;
    }

    // Scalars contain no children and require no further traversal.
    if (current === null || typeof current === 'boolean') {
      continue;
    }

    // Reject values that cannot originate from valid JSON.
    if (typeof current !== 'object') {
      return false;
    }

    // Bound arrays before adding their elements to the pending work list.
    if (Array.isArray(current)) {
      if (current.length > CODEX_PROTOCOL_LIMITS.maximumArrayItems) {
        return false;
      }

      for (const item of current) {
        pending.push([item, depth + 1]);
      }

      continue;
    }

    // Bound object width and then inspect every own enumerable JSON value.
    const entries = Object.entries(current);
    if (entries.length > CODEX_PROTOCOL_LIMITS.maximumObjectKeys) {
      return false;
    }

    for (const [, item] of entries) {
      pending.push([item, depth + 1]);
    }
  }

  // Accept only after the complete value passes every shape-independent bound.
  return true;
}
