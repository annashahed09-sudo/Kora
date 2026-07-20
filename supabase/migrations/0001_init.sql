-- Kora — initial schema + RLS.
-- Read README.md for the model overview.

-- =========================================================================
-- users (mirror of auth.users — required because RLS policies on our tables
-- usually key off `public.users.id`, not `auth.uid()` directly, so we have
-- a row to deny against).
-- =========================================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default now()
);

-- Trigger: when an auth.users row is created, mirror it to public.users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================================
-- projects
-- =========================================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null check (char_length(title) > 0 and char_length(title) <= 200),
  client_name text not null check (char_length(client_name) > 0 and char_length(client_name) <= 200),
  phase text not null default 'Brief' check (phase in ('Brief','Concept','Delivery')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_updated_at_idx on public.projects(updated_at desc);

-- =========================================================================
-- blocks (canvas cells)
-- =========================================================================
create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  type text not null check (char_length(type) > 0 and char_length(type) <= 40),
  content jsonb not null default '{}'::jsonb,
  x double precision not null default 0,
  y double precision not null default 0,
  width double precision not null default 320,
  height double precision not null default 180,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blocks_project_id_idx on public.blocks(project_id);
create index if not exists blocks_updated_at_idx on public.blocks(updated_at desc);

-- =========================================================================
-- comments
-- =========================================================================
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  block_id uuid references public.blocks(id) on delete set null,
  text text not null check (char_length(text) > 0 and char_length(text) <= 4000),
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists comments_project_id_idx on public.comments(project_id);
create index if not exists comments_block_id_idx on public.comments(block_id);

-- =========================================================================
-- shares (token-gated public client view)
-- =========================================================================
create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  token text unique not null,
  read_only boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists shares_project_id_idx on public.shares(project_id);
create index if not exists shares_token_idx on public.shares(token);

-- =========================================================================
-- updated_at trigger helper — applied to projects + blocks.
-- =========================================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists touch_projects on public.projects;
create trigger touch_projects
  before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_blocks on public.blocks;
create trigger touch_blocks
  before update on public.blocks
  for each row execute function public.touch_updated_at();

-- =========================================================================
-- Row Level Security
-- =========================================================================
alter table public.users    enable row level security;
alter table public.projects enable row level security;
alter table public.blocks   enable row level security;
alter table public.comments enable row level security;
alter table public.shares   enable row level security;

-- users: a user can only see their own row.
drop policy if exists users_self_select on public.users;
create policy users_self_select on public.users
  for select using (id = auth.uid());

-- projects: owner has full CRUD.
drop policy if exists projects_owner_all on public.projects;
create policy projects_owner_all on public.projects
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- comments: owner of the project can CRUD; share-token path is service-only.
drop policy if exists comments_project_owner on public.comments;
create policy comments_project_owner on public.comments
  for all using (
    exists (
      select 1 from public.projects p
      where p.id = comments.project_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.projects p
      where p.id = comments.project_id and p.user_id = auth.uid()
    )
  );

-- blocks: same rule — owner cascade.
drop policy if exists blocks_project_owner on public.blocks;
create policy blocks_project_owner on public.blocks
  for all using (
    exists (
      select 1 from public.projects p
      where p.id = blocks.project_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.projects p
      where p.id = blocks.project_id and p.user_id = auth.uid()
    )
  );

-- shares: only the project owner can mint or list share tokens for it.
-- Public reads happen via the service role from the share route.
drop policy if exists shares_owner_all on public.shares;
create policy shares_owner_all on public.shares
  for all using (
    exists (
      select 1 from public.projects p
      where p.id = shares.project_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.projects p
      where p.id = shares.project_id and p.user_id = auth.uid()
    )
  );
