/**
 * Permissions abstraction.
 *
 * The full RBAC system ships with multi-tenant organisations (v1.1+).
 * For v1.0 the public surface here exposes:
 *
 *   - `CAPABILITIES` — short string constants used in server-action gates
 *   - `can()` — default-deny helper for any future per-user check
 *   - Resolution for share-token-gated surfaces
 *
 * Pages do not check roles directly — they call into this module so a
 * future migration to RBAC only changes one file.
 */

export const CAPABILITIES = {
  PROJECT_CREATE: "project:create",
  PROJECT_DELETE: "project:delete",
  BLOCK_PERSIST: "block:persist",
  COMMENT_CREATE: "comment:create",
  SHARE_MINT: "share:mint",
  INTEGRATION_MANAGE: "integration:manage",
  AI_INVOKE: "ai:invoke",
  WORKSPACE_INVITE: "workspace:invite",
} as const;

export type Capability = (typeof CAPABILITIES)[keyof typeof CAPABILITIES];

/* ---------------------------------------------------------------------- */
/* Default policy: every signed-in user has every capability.             */
/* Replace this with a real ACL check when multi-tenant lands.            */
/* ---------------------------------------------------------------------- */

export async function can(
  capability: Capability,
  ctx: { userId: string | null }
): Promise<boolean> {
  if (!ctx.userId) return false;
  // v1.0 single-user MVP — everyone is owner.
  return true;
}

export async function requireCap(
  capability: Capability,
  ctx: { userId: string | null }
): Promise<void> {
  if (!(await can(capability, ctx))) {
    throw new Error(`Missing capability: ${capability}`);
  }
}

/* ---------------------------------------------------------------------- */
/* Share-token handling. The /share/[token] page already uses             */
/* `get_share_by_token` RPC — this helper centralises the lookup so       */
/* future surfaces can re-use the same path.                              */
/* ---------------------------------------------------------------------- */

export type ShareSnapshot = {
  project_id: string;
  title: string;
  client_name: string;
  phase: "Brief" | "Concept" | "Delivery";
  blocks: Array<{
    id: string;
    type: string;
    content: unknown;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  comments: Array<{ id: string; text: string; created_at: string }>;
};

export async function resolveShare(
  token: string,
  rpcFn: (name: string, args: { token: string }) => Promise<unknown>
): Promise<ShareSnapshot | null> {
  const result = (await rpcFn("get_share_by_token", { token })) as
    | ShareSnapshot[]
    | ShareSnapshot
    | null;
  if (!result) return null;
  return Array.isArray(result) ? result[0] ?? null : result;
}
