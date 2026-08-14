// Import Zod to validate unknown app-server payloads before normalization.
import { z } from 'zod';

// Reuse conservative string bounds from the centralized protocol policy.
import { CODEX_PROTOCOL_LIMITS } from './protocol-limits';

// Bound every retained protocol string more tightly than the generic transport ceiling.
const metadataStringSchema = z
  .string()
  .max(Math.min(512, CODEX_PROTOCOL_LIMITS.maximumStringCharacters));

// Validate only non-identifying initialization fields needed to establish compatibility.
export const initializationResultSchema = z
  .object({
    // Retain the server user agent only inside the privileged adapter for compatibility evidence.
    userAgent: metadataStringSchema,
    // Confirm the server describes its target family without retaining filesystem paths.
    platformFamily: metadataStringSchema,
    // Confirm the target operating system is bounded metadata.
    platformOs: metadataStringSchema,
  })
  .strip();

// Validate the three known account variants while intentionally dropping email and credential-related fields.
const accountSchema = z.discriminatedUnion('type', [
  // API-key mode carries no renderer-safe identifying field.
  z.object({ type: z.literal('apiKey') }).strip(),
  // ChatGPT mode retains only the bounded plan label and strips email.
  z.object({ type: z.literal('chatgpt'), planType: metadataStringSchema }).strip(),
  // Bedrock mode is represented only as an account kind.
  z.object({ type: z.literal('amazonBedrock') }).strip(),
]);

// Validate the complete account-read envelope needed to distinguish signed-in and signed-out states.
export const accountReadResultSchema = z
  .object({
    // Preserve an explicit null as the signed-out account state.
    account: accountSchema.nullable(),
    // Keep the server's explicit authentication requirement as a state signal.
    requiresOpenaiAuth: z.boolean(),
  })
  .strip();

// Validate a quota window container while leaving individual fields for availability-aware normalization.
export const rateLimitWindowInputSchema = z
  .object({
    // Require the current protocol keys but accept their values as unknown until field-level checks run.
    usedPercent: z.unknown(),
    windowDurationMins: z.unknown(),
    resetsAt: z.unknown(),
  })
  .strip();

// Validate a quota snapshot container and strip all fields not approved for the Phase 2 slice.
export const rateLimitSnapshotInputSchema = z
  .object({
    // Retain bounded optional identity metadata for stable grouping and display.
    limitId: metadataStringSchema.nullable(),
    limitName: metadataStringSchema.nullable(),
    // Preserve nullable supported windows for field-aware normalization.
    primary: rateLimitWindowInputSchema.nullable(),
    secondary: rateLimitWindowInputSchema.nullable(),
    // Keep the plan label bounded without treating future enum values as known.
    planType: metadataStringSchema.nullable(),
    // Preserve only presence of an explicit reached category; raw enum text never reaches the renderer.
    rateLimitReachedType: metadataStringSchema.nullable(),
  })
  .strip();

// Validate the multi-bucket response with a hard bucket count enforced by the generic object-width limit.
export const rateLimitsReadResultSchema = z
  .object({
    // Accept null for compatibility with older or partial servers and fixtures.
    rateLimits: rateLimitSnapshotInputSchema.nullable(),
    // Validate each keyed snapshot while stripping unrelated raw fields.
    rateLimitsByLimitId: z.record(metadataStringSchema, rateLimitSnapshotInputSchema).nullable(),
    // Do not expose reset-credit detail in the Phase 2 Overview slice.
    rateLimitResetCredits: z.unknown().optional(),
    // Accept the older observed fixture spelling only as ignored compatibility input.
    resetCredits: z.unknown().optional(),
  })
  .strip();

// Validate the one approved sparse rate-limit notification before a full-refresh fallback.
export const rateLimitsUpdatedParamsSchema = z
  .object({
    // Require one bounded snapshot; the controller chooses a safe merge or full read.
    rateLimits: rateLimitSnapshotInputSchema,
  })
  .strip();

// Export inferred privileged types for the normalization layer only.
export type AccountReadResult = z.infer<typeof accountReadResultSchema>;
export type RateLimitSnapshotInput = z.infer<typeof rateLimitSnapshotInputSchema>;
export type RateLimitsReadResult = z.infer<typeof rateLimitsReadResultSchema>;
