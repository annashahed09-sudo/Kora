import { z } from "zod";

/**
 * Zod schemas for every server-action entrypoint. Centralised so handlers
 * never re-declare the same shape and inferred types flow out uniformly.
 */

const email = z.string().email("That doesn't look like an email address.");
const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Keep it under 72 characters.");

export const loginSchema = z.object({
  email,
  password,
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email,
  password,
});
export type SignupInput = z.infer<typeof signupSchema>;

export const projectCreateSchema = z.object({
  title: z.string().trim().min(1, "Give the project a title.").max(120),
  client_name: z
    .string()
    .trim()
    .min(1, "Who is the client?")
    .max(120),
  phase: z.enum(["Brief", "Concept", "Delivery"]).default("Brief"),
});
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;

export const phaseUpdateSchema = z.object({
  project_id: z.string().uuid(),
  phase: z.enum(["Brief", "Concept", "Delivery"]),
});

export const commentCreateSchema = z.object({
  project_id: z.string().uuid(),
  block_id: z.string().uuid().nullable().optional(),
  text: z.string().trim().min(1, "Comments can't be empty.").max(2000),
});
export type CommentCreateInput = z.infer<typeof commentCreateSchema>;

/**
 * A canvas block is a self-describing cell on the tldraw surface.
 * v1 uses a minimal Acknowledge<>Ack-persisted shape; richer shape-snapshot
 * payloads (the full tldraw JSON) live in `content` and are validated by
 * their consumer in `Canvas`. Server only validates authority + shape size.
 */
export const blockUpsertSchema = z.object({
  id: z.string(),
  project_id: z.string().uuid(),
  type: z.string().min(1).max(40),
  content: z.unknown(),
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().finite().nonnegative(),
  height: z.number().finite().nonnegative(),
});
export type BlockUpsertInput = z.infer<typeof blockUpsertSchema>;

export const blockDeleteSchema = z.object({
  id: z.string(),
  project_id: z.string().uuid(),
});

export const blocksReplaceSchema = z.object({
  project_id: z.string().uuid(),
  blocks: z.array(blockUpsertSchema.omit({ project_id: true })),
  deleted_ids: z.array(z.string()).default([]),
});
export type BlocksReplaceInput = z.infer<typeof blocksReplaceSchema>;

export const shareCreateSchema = z.object({
  project_id: z.string().uuid(),
});
