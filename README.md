# Kora MVP

Kora is a minimal, production-safe campaign workspace for PR and creative agencies.  
It structures client work from **Brief → Concept → Delivery** with a visual canvas, blocks, comments, and a shareable read-only client view.

## Tech Stack

- **Next.js (App Router) + TypeScript**
- **Supabase** (Auth, Postgres, Storage, RLS)
- **tldraw** (canvas)

No additional backend or framework is used.

## Required Routes

- `/login` — authentication
- `/dashboard` — list/create campaigns
- `/project/[id]` — main workspace (phases + canvas + comments)
- `/share/[token]` — read-only client view

## Core Data Model (Supabase)

- `users (id, email)`
- `projects (id, user_id, title, client_name, phase)`
- `blocks (id, project_id, type, content, x, y, width, height)`
- `comments (id, project_id, block_id, text, user_id)`
- `shares (id, project_id, token, read_only)`

## Security Rules

- Row Level Security (RLS) enabled on all app tables.
- Users can only access their own projects and related records.
- Service role key is never exposed client-side.
- Only `NEXT_PUBLIC_*` values are used in browser code.

---

## Getting Started

## 1) Create app

```bash
npx create-next-app@latest kora --typescript --app --eslint --src-dir --import-alias "@/*"
cd kora
```

## 2) Install dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr tldraw
```

## 3) Environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Do not place service role keys in frontend env files.

## 4) Run dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Supabase Setup (SQL)

Run this in Supabase SQL editor (exact schema may evolve as files are added):

```sql
-- profiles/users table (linked to auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  client_name text not null,
  phase text not null default 'Brief' check (phase in ('Brief','Concept','Delivery')),
  created_at timestamptz not null default now()
);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  type text not null,
  content jsonb not null default '{}'::jsonb,
  x double precision not null default 0,
  y double precision not null default 0,
  width double precision not null default 320,
  height double precision not null default 180,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  block_id uuid references public.blocks(id) on delete set null,
  text text not null,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  token text unique not null,
  read_only boolean not null default true,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.blocks enable row level security;
alter table public.comments enable row level security;
alter table public.shares enable row level security;
```

RLS policies will be added with the implementation steps to ensure ownership-based access across related tables.

---

## MVP Scope

### Included
- Auth (login/logout)
- Project create/list
- Workspace with phase switching
- Canvas with persisted blocks
- Comments linked to project/blocks
- Share token for read-only view

### Excluded
- AI features
- Marketplace
- Analytics dashboard
- Multi-organization model
- Advanced permissions

---

## Implementation Plan (Incremental, compile-safe)

1. Base project structure
2. Supabase server/client utilities
3. Auth flow (`/login`)
4. Protected layout and middleware
5. Dashboard CRUD (`/dashboard`)
6. Project workspace shell (`/project/[id]`)
7. tldraw integration + block persistence (debounced)
8. Comments panel + persistence
9. Share token generation and `/share/[token]` read-only page
10. RLS policy hardening and validation
11. Final pass for minimal production safety

---

## Production-Safe Notes

- Validate auth session server-side for protected routes.
- Never trust client-provided user_id.
- Use ownership checks in every read/write path.
- Debounce canvas writes to reduce load and race conditions.
- Keep component boundaries small and typed.
