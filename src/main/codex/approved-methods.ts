/**
 * List the only request methods TokenTrail may send to Codex. Keeping literal values in one frozen structure
 * prevents renderer data, protocol data, or an arbitrary string from selecting a privileged operation.
 */
export const APPROVED_CODEX_REQUEST_METHODS = Object.freeze([
  // Initialize the protocol and discover compatible capabilities before requesting account data.
  'initialize',
  // Read the minimum account state needed to distinguish connected and unavailable states.
  'account/read',
  // Read the current account-level quota and credit snapshot without changing it.
  'account/rateLimits/read',
  // Read aggregate usage buckets without requesting prompts, tasks, turns, or workspace content.
  'account/usage/read',
] as const);

// Derive the exact outbound method type from the reviewed constant so callers cannot widen it to `string`.
export type ApprovedCodexRequestMethod = (typeof APPROVED_CODEX_REQUEST_METHODS)[number];

/**
 * List the only unsolicited Codex notification TokenTrail may consume. Notifications are separated from requests
 * because receiving an update must never make that method available to the outbound transport.
 */
export const APPROVED_CODEX_NOTIFICATION_METHODS = Object.freeze([
  // Merge a sparse account-level rate-limit update into the most recent validated full snapshot.
  'account/rateLimits/updated',
] as const);

// Derive the exact inbound notification type from the independently reviewed notification constant.
export type ApprovedCodexNotificationMethod = (typeof APPROVED_CODEX_NOTIFICATION_METHODS)[number];

/** Return true only when an unknown value exactly matches a reviewed outbound request method. */
export function isApprovedCodexRequestMethod(
  method: unknown,
): method is ApprovedCodexRequestMethod {
  // Reject non-string input before checking the closed literal list.
  if (typeof method !== 'string') {
    return false;
  }

  // Compare exact strings without prefix, substring, case-folding, or caller-controlled pattern behavior.
  return APPROVED_CODEX_REQUEST_METHODS.some((approvedMethod) => approvedMethod === method);
}

/** Return true only when an unknown value exactly matches a reviewed inbound notification method. */
export function isApprovedCodexNotificationMethod(
  method: unknown,
): method is ApprovedCodexNotificationMethod {
  // Reject non-string input before checking the closed literal list.
  if (typeof method !== 'string') {
    return false;
  }

  // Keep inbound approval exact and independent from the outbound request allowlist.
  return APPROVED_CODEX_NOTIFICATION_METHODS.some((approvedMethod) => approvedMethod === method);
}
