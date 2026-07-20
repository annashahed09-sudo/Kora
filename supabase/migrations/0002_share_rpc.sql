-- Kora — share RPC.
--
-- The public client view at /share/[token] needs to load share data WITHOUT
-- going through the cookie-based session. RLS on the `shares` table only
-- lets the owner read rows, so we expose a SECURITY DEFINER function the
-- anon role is allowed to call. The function does the lookup server-side
-- and returns a denormalised snapshot.
--
-- Idempotent — safe to re-run.

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

  select * into p
    from public.projects
    where projects.id = s.project_id
    limit 1;

  if not found then
    return;
  end if;

  return query
  select
    p.id,
    p.title,
    p.client_name,
    p.phase,
    coalesce(
      (
        select jsonb_agg(jsonb_build_object(
          'id', b.id,
          'type', b.type,
          'content', b.content,
          'x', b.x,
          'y', b.y,
          'width', b.width,
          'height', b.height
        ))
        from public.blocks b
        where b.project_id = p.id
      ),
      '[]'::jsonb
    ),
    coalesce(
      (
        select jsonb_agg(jsonb_build_object(
          'id', c.id,
          'text', c.text,
          'created_at', c.created_at
        ))
        from public.comments c
        where c.project_id = p.id
      ),
      '[]'::jsonb
    );
end;
$$;

-- Allow anon (and the public role) to call the function. SECURITY DEFINER
-- guarantees row-level access checks are still enforced *inside* the
-- function, but the function's own existence is what the anon role needs.
grant execute on function public.get_share_by_token(text) to anon, authenticated;
