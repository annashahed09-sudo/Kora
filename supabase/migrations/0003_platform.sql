-- Kora v1.0 — platform expansion.
--
-- Adds the data model for the broader "creative operating system" surface
-- area: folders, polymorphic items, tags, mentions, notifications, AI
-- artifacts, and connected integrations. Built on top of 0001's foundation.
--
-- Idempotent — safe to re-run.

-- =========================================================================
-- workspaces (multi-tenant cut)
-- =========================================================================
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workspaces_owner_id_idx on public.workspaces(owner_id);

create trigger touch_workspaces
  before update on public.workspaces
  for each row execute function public.touch_updated_at();

alter table public.workspaces enable row level security;

drop policy if exists workspaces_owner_all on public.workspaces;
create policy workspaces_owner_all on public.workspaces
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- =========================================================================
-- folders — hierarchical workspace structure (parent_id self-references)
-- =========================================================================
create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  parent_id uuid references public.folders(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  icon text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists folders_workspace_id_idx on public.folders(workspace_id);
create index if not exists folders_parent_id_idx on public.folders(parent_id);

create trigger touch_folders
  before update on public.folders
  for each row execute function public.touch_updated_at();

alter table public.folders enable row level security;

drop policy if exists folders_workspace_owner on public.folders;
create policy folders_workspace_owner on public.folders
  for all using (
    exists (select 1 from public.workspaces w
            where w.id = folders.workspace_id and w.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.workspaces w
            where w.id = folders.workspace_id and w.owner_id = auth.uid())
  );

-- =========================================================================
-- items — polymorphic content (notes, tasks, files, bookmarks, research…)
-- =========================================================================
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  folder_id uuid references public.folders(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  type text not null check (type in (
    'note','task','file','bookmark','research','idea','person','event','quote','image','video'
  )),
  title text not null default '',
  content jsonb not null default '{}'::jsonb,
  status text,
  due_at timestamptz,
  url text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists items_workspace_id_idx on public.items(workspace_id);
create index if not exists items_folder_id_idx on public.items(folder_id);
create index if not exists items_project_id_idx on public.items(project_id);
create index if not exists items_type_idx on public.items(type);
create index if not exists items_due_at_idx on public.items(due_at);
create index if not exists items_updated_at_idx on public.items(updated_at desc);

create trigger touch_items
  before update on public.items
  for each row execute function public.touch_updated_at();

alter table public.items enable row level security;

drop policy if exists items_workspace_owner on public.items;
create policy items_workspace_owner on public.items
  for all using (
    exists (select 1 from public.workspaces w
            where w.id = items.workspace_id and w.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.workspaces w
            where w.id = items.workspace_id and w.owner_id = auth.uid())
  );

-- =========================================================================
-- tags + item_tags pivot
-- =========================================================================
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create index if not exists tags_workspace_id_idx on public.tags(workspace_id);

alter table public.tags enable row level security;

drop policy if exists tags_workspace_owner on public.tags;
create policy tags_workspace_owner on public.tags
  for all using (
    exists (select 1 from public.workspaces w
            where w.id = tags.workspace_id and w.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.workspaces w
            where w.id = tags.workspace_id and w.owner_id = auth.uid())
  );

create table if not exists public.item_tags (
  item_id uuid not null references public.items(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (item_id, tag_id)
);

alter table public.item_tags enable row level security;

drop policy if exists item_tags_workspace_owner on public.item_tags;
create policy item_tags_workspace_owner on public.item_tags
  for all using (
    exists (
      select 1
      from public.items i
      join public.workspaces w on w.id = i.workspace_id
      where i.id = item_tags.item_id and w.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from public.items i
      join public.workspaces w on w.id = i.workspace_id
      where i.id = item_tags.item_id and w.owner_id = auth.uid()
    )
  );

-- =========================================================================
-- mentions — a tag that links an item to another item
-- =========================================================================
create table if not exists public.mentions (
  id uuid primary key default gen_random_uuid(),
  source_item_id uuid not null references public.items(id) on delete cascade,
  target_item_id uuid not null references public.items(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (source_item_id, target_item_id)
);

create index if not exists mentions_source_idx on public.mentions(source_item_id);
create index if not exists mentions_target_idx on public.mentions(target_item_id);

alter table public.mentions enable row level security;

drop policy if exists mentions_workspace_owner on public.mentions;
create policy mentions_workspace_owner on public.mentions
  for all using (
    -- both source and target must live in an owned workspace, AND both
    -- items must share the same workspace_id. Without the equality on
    -- workspace_id, an owner of two workspaces could accidentally link
    -- items across them.
    exists (
      select 1
      from public.items s
      where s.id = mentions.source_item_id
        and exists (
          select 1 from public.workspaces w
          where w.id = s.workspace_id and w.owner_id = auth.uid()
        )
    )
    and exists (
      select 1
      from public.items t
      where t.id = mentions.target_item_id
        and t.workspace_id = (
          select workspace_id from public.items where id = mentions.source_item_id
        )
        and exists (
          select 1 from public.workspaces w
          where w.id = t.workspace_id and w.owner_id = auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from public.items s
      where s.id = mentions.source_item_id
        and exists (
          select 1 from public.workspaces w
          where w.id = s.workspace_id and w.owner_id = auth.uid()
        )
    )
    and exists (
      select 1
      from public.items t
      where t.id = mentions.target_item_id
        and t.workspace_id = (
          select workspace_id from public.items where id = mentions.source_item_id
        )
        and exists (
          select 1 from public.workspaces w
          where w.id = t.workspace_id and w.owner_id = auth.uid()
        )
    )
  );

-- =========================================================================
-- notifications — fan-out inbox feed
-- =========================================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  kind text not null,                 -- 'mention','comment','system','invite'
  title text not null,
  body text,
  target_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_user_unread_idx
  on public.notifications(user_id, created_at desc)
  where read_at is null;

alter table public.notifications enable row level security;

drop policy if exists notifications_self on public.notifications;
create policy notifications_self on public.notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =========================================================================
-- ai_artifacts — generated objects attached to anything
-- =========================================================================
create table if not exists public.ai_artifacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  item_id uuid references public.items(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  kind text not null,                 -- 'swot','summary','outline','mind_map','critique'
  prompt text not null,
  output jsonb not null,
  model text,
  created_at timestamptz not null default now()
);

create index if not exists ai_artifacts_workspace_id_idx on public.ai_artifacts(workspace_id);
create index if not exists ai_artifacts_item_id_idx on public.ai_artifacts(item_id);

alter table public.ai_artifacts enable row level security;

drop policy if exists ai_artifacts_workspace_owner on public.ai_artifacts;
create policy ai_artifacts_workspace_owner on public.ai_artifacts
  for all using (
    exists (select 1 from public.workspaces w
            where w.id = ai_artifacts.workspace_id and w.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.workspaces w
            where w.id = ai_artifacts.workspace_id and w.owner_id = auth.uid())
  );

-- =========================================================================
-- integrations — connected accounts and sync cursors
-- =========================================================================
create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null,             -- 'google_drive','figma','github','slack', ...
  status text not null default 'pending'
    check (status in ('pending','connected','disconnected','error')),
  external_account text,
  sync_cursor text,
  config jsonb not null default '{}'::jsonb,
  connected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, provider)
);

create index if not exists integrations_workspace_id_idx on public.integrations(workspace_id);

create trigger touch_integrations
  before update on public.integrations
  for each row execute function public.touch_updated_at();

alter table public.integrations enable row level security;

drop policy if exists integrations_workspace_owner on public.integrations;
create policy integrations_workspace_owner on public.integrations
  for all using (
    exists (select 1 from public.workspaces w
            where w.id = integrations.workspace_id and w.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.workspaces w
            where w.id = integrations.workspace_id and w.owner_id = auth.uid())
  );
