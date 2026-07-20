-- ============================================================================
-- Kora v1.0 — soft delete substrate + share-link lifecycle.
--
-- Adds `deleted_at` to every content table so deletion becomes a tombstone
-- column rather than a true DELETE. Two wins:
--   1. Reversible ("trash" semantics) without a separate table.
--   2. Partial indexes for the hot "active rows only" query.
--
-- Adds `expires_at`, `revoked_at`, `created_by_ip`, `last_used_at` to
-- `shares` and rewrites `get_share_by_token` to gate on those columns.
-- The RPC stays SECURITY DEFINER so the anon role can call it without
-- owning a session; the body simply returns NULL when revoked or
-- expired, and bumps `last_used_at` on every hit.
-- ============================================================================

-- ============================================================================
-- 1. soft delete: deleted_at on each content table
-- ============================================================================

alter table public.projects     add column if not exists deleted_at timestamptz;
alter table public.blocks       add column if not exists deleted_at timestamptz;
alter table public.comments     add column if not exists deleted_at timestamptz;
alter table public.folders      add column if not exists deleted_at timestamptz;
alter table public.items        add column if not exists deleted_at timestamptz;
alter table public.tags         add column if not exists deleted_at timestamptz;
alter table public.ai_artifacts add column if not exists deleted_at timestamptz;

-- Partial indexes: hot path is "active rows only" — the WHERE deleted_at
-- IS NULL clause keeps the index small even as tombstones accumulate.
create index if not exists projects_active_idx
  on public.projects(user_id, updated_at desc) where deleted_at is null;
create index if not exists blocks_active_idx
  on public.blocks(project_id) where deleted_at is null;
create index if not exists comments_active_idx
  on public.comments(project_id, created_at) where deleted_at is null;
create index if not exists items_active_idx
  on public.items(workspace_id, updated_at desc) where deleted_at is null;

-- ============================================================================
-- 2. shares: expiry + revocation + audit columns
-- ============================================================================

alter table public.shares
  add column if not exists expires_at   timestamptz,
  add column if not exists revoked_at   timestamptz,
  add column if not exists created_by_ip inet,
  add column if not exists last_used_at timestamptz;

-- Partial index on active (not revoked) tokens — keeps the index small
-- even after revoking many shares.
create index if not exists shares_active_token_idx
  on public.shares(token) where revoked_at is null;

create index if not exists shares_project_active_idx
  on public.shares(project_id, created_at desc) where revoked_at is null;

-- ============================================================================
-- 3. expire-on-write default — when omitted, mint a 90-day link.
--    The server action also stamps expires_at explicitly so the default is
--    purely a safety net.
-- ============================================================================

alter table public.shares
  alter column expires_at set default
  (now() + interval '90 days');

-- ============================================================================
-- 4. Replace get_share_by_token with the expiry-aware version.
-- ============================================================================

create or replace function public.get_share_by_token(token text)
returns table (
  project_id uuid,
  title text,
  client_name text,
  phase text,
  blocks jsonb,
  comments jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.shares%rowtype;
  p public.projects%rowtype;
begin
  select * into s
    from public.shares
    where shares.token = get_share_by_token.token
    limit 1;

  if not found then
    return;
  end if;
  if s.revoked_at is not null then
    return;
  end if;
  if s.expires_at is not null and s.expires_at < now() then
    return;
  end if;

  update public.shares
    set last_used_at = now()
    where id = s.id;

  select * into p
    from public.projects
    where projects.id = s.project_id
    limit 1;

  if not found then
    return;
  end if;
  if p.deleted_at is not null then
    return;
  end if;

  return query
    select
      p.id,
      p.title,
      p.client_name,
      p.phase,
      coalesce(
        (select jsonb_agg(jsonb_build_object(
          'id', b.id, 'type', b.type, 'content', b.content,
          'x', b.x, 'y', b.y, 'width', b.width, 'height', b.height))
         from public.blocks b
         where b.project_id = p.id
           and b.deleted_at is null),
        '[]'::jsonb
      ),
      coalesce(
        (select jsonb_agg(jsonb_build_object(
          'id', c.id, 'text', c.text, 'created_at', c.created_at))
         from public.comments c
         where c.project_id = p.id
           and c.deleted_at is null),
        '[]'::jsonb
      );
end;
$$;

-- ============================================================================
-- 5. Re-grant in case a prior migration revoked EXECUTE.
-- ============================================================================

grant execute on function public.get_share_by_token(text) to anon, authenticated;

-- ============================================================================
-- 6. Comments — document the partial-index pattern so future authors add
--    active_idx indexes for any new content table by convention.
-- ============================================================================

comment on index public.projects_active_idx is
  'Active (non-tombstoned) project lookup; kept partial to bound growth as deletions accrue.';
comment on index public.blocks_active_idx is
  'Active canvas blocks per project.';
comment on index public.comments_active_idx is
  'Active comments per project, ordered by created_at for the side panel.';
comment on index public.items_active_idx is
  'Active items per workspace, ordered by updated_at for the inbox feed.';
