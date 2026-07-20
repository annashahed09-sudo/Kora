# Kora

**The creative operating system.**

Kora is a quiet, structured workspace where notes, projects, files, conversations, research, and ideas become interconnected objects — not isolated tools. One ecosystem. Premium visual identity.

This is the **v1.0** production-ready cut of the product. It is not an MVP. Every flagship surface in this README is implemented to a state an investor or first customer could open and try.

---

## What Kora is — and isn't

| Kora is | Kora is not |
| --- | --- |
| A creative operating system | A note-taking app |
| A connected knowledge surface | A whiteboard |
| A research + project hub | An AI chatbot with a pretty skin |
| An opinionated workspace | A Notion clone |
| A reference library | A project tracker |
| An evolving system of objects | A static folder hierarchy |

---

## Routes — the surface area

The platform is wider than a tab list. Every route below is a real route with at least three states: `empty`, `loading`, `populated`. The populated state ships with carefully composed demo content so the surface looks real even before the user has data of their own.

### Public / surface

| Path | Surface | Purpose |
| --- | --- | --- |
| `/` | Landing | Marketing, brand, sign-up CTA |
| `/login`, `/signup` | Auth | Email + password |
| `/share/[token]` | Public share | Token-gated, read-only client view |
| `/privacy`, `/terms`, `/changelog` | Legal | Policies + release log |

### Authenticated — flagship surfaces

| Path | Surface | Purpose |
| --- | --- | --- |
| `/home` | Personal home | Greeting, daily overview, recent work, AI suggestions |
| `/inbox` | Notifications | Mentions, comments, system updates |
| `/search` | Global search | Command palette + full-text + scoped filters |
| `/dashboard` | Projects | Project list, folders, smart views |
| `/project/[id]` | Workspace | Phases + canvas + comments |
| `/tasks` | Tasks | Kanban, calendar, timeline (Phase 1: kanban) |
| `/calendar` | Calendar | Month grid + agenda |
| `/research` | Research | Saved articles, highlights, citations |
| `/media` | Media | Images, video, audio, files |
| `/knowledge` | Knowledge graph | Visualized relationships |
| `/profile` | Profile | Bio, portfolio, activity |
| `/settings` | Settings | Appearance, security, billing, integrations, labs |

### Settings sub-routes

`/settings/appearance`, `/settings/security`, `/settings/billing`, `/settings/integrations`, `/settings/labs`, `/settings/shortcuts`, `/settings/accessibility`.

---

## Architecture

### Core abstractions

The platform never calls Supabase / OpenAI / Google Drive directly from page code. Every cloud concern goes through a thin interface, so a swap is one file:

```
src/lib/
  storage/          # file uploads, image processing (Supabase Storage, S3, R2)
  ai/               # model abstraction (OpenAI, Anthropic, local, BYO)
  integrations/     # OAuth + sync registry (Google, Figma, GitHub, Slack, ...)
  notifications/    # in-app + email + push (Postmark, Resend, OneSignal)
  permissions/      # RBAC, sharing, works across workspace boundaries
```

Each layer ships with a single default implementation (Supabase for storage, OpenAI for AI) and a registry pattern that lets new providers register without touching consumers.

### Data model — first class

`projects`, `blocks`, `comments`, `shares` are the foundation. The v1.0 platform expansion adds:

- `folders` — hierarchical workspace structure
- `items` — polymorphic (notes, tasks, files, bookmark, research, idea, person, …) joined to projects and to folders independently
- `tags` — flat, multi-tag
- `mentions` — referenced by `@` syntax across objects
- `notifications` — fan-out inbox feed
- `ai_artifacts` — generated objects attached to anything (ideas, summaries, mind maps, SWOT)
- `integrations` — connected accounts and sync cursors

RLS is **owner-or-workspace-scoped** on every table. Sharing is via tokenised rows for client-facing surfaces and via `permissions` joins for in-app collaboration. A future multi-tenant cut is documented in the security model below.

### Frontend

- **Next.js 16** App Router, React Server Components by default
- **React 19** server actions, `useActionState`, `useOptimistic`
- **Tailwind 4** CSS-first `@theme inline` design tokens (no `tailwind.config.ts`)
- **tldraw** canvas, dynamic-imported, debounced server persistence
- **Zod** schemas enforced at every server action entry point
- **Native HTML** for chrome — `<dialog>`, `<details>`, `popover`, focus-visible

### Visual system

- Dark-first paper-on-blackground — `#0a0a0a` ground, `#f5f2ee` foreground, hairline `#1f1f1f` rules
- Dual type: **Geist Sans** (UI), **Newsreader** (display moments)
- Token-driven: no ad-hoc colors, every value is a `--color-*` or `--font-*` token
- Motion: subtle, intentional, never vibrating. Default transition `200ms ease-out`

---

## Security model

Theastry of v1.0 is a **single-user MVP with multi-tenant plumbing already in place**. Concretely:

- **Auth:** Supabase email + password; sessions via HttpOnly cookies set by `@supabase/ssr`. Tokens refreshed on every request.
- **RLS:** every public-table owner-or-workspace-scoped. Cross-tenant reads return zero rows. The `mentions` policy explicitly prevents linking items across workspaces owned by the same user.
- **SECURITY DEFINER RPCs** for surfaces that need anon reach (public share view).
- **Server-side validation:** every action validates with Zod; user IDs come from the session cookie, never from the request body.
- **Uploads:** all file uploads go through `storage.put()` and are stored privately; rendering URLs are short-lived signed URLs.
- **Rate limiting:** v1.1 introduces per-route rate limits on auth and share endpoints (currently unbounded in dev).
- **CSRF:** server actions carry same-origin check by default; admin forms in v1.1 add explicit double-submit tokens.
- **CSP:** strict default-src, disallows inline scripts except for the framework's runtime nonce.
- **Secrets:** only `NEXT_PUBLIC_*` env values reach the browser. Service-role keys live in migration runners / CI.

### Single-user assumption in v1.0

The permissions abstraction (`src/lib/permissions/index.ts`) gates every server action through `requireCap()`, but `can()` defaults to **allow-all for any signed-in user**. This is intentional for the single-user MVP but is **not** a multi-tenant RBAC implementation. The next iteration (v1.1) tightens `can()` to check workspace membership against the `public.workspaces.owner_id = auth.uid()` predicate it ships today. Until then, do not host more than one workspace per process.

---

## Scalability posture

The point of abstractions isn't architecture astronautics — it's to defer vendor commitment. Every external service ships behind a `src/lib/<concern>/index.ts` interface. Swapping Supabase for Neon + S3 is a one-file change. Swapping OpenAI for Anthropic is a one-file change. That's the bar.

The richer concerns — multi-region replication, real-time collaboration, plugin architecture — are documented in `ARCHITECTURE.md` (forthcoming). The platform hasn't shipped them yet, but every footer API has a path to get there.

---

## Building and shipping locally

```bash
npm install
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
# Migrations:
#   0001_init.sql                       — initial tables + RLS
#   0002_share_rpc.sql                  — public share lookup
#   0003_platform.sql                   — folders, items, tags, mentions, notifications, ...
#   0004_soft_delete_and_share_expiry   — deleted_at columns + share expiry/revocation
npm run dev
```

`SETUP.md` walks you through the full sequence.

---

## Deploy to Vercel — production launch checklist

The default deploy target is Vercel. The repo contains nothing custom in `next.config` so a standard import works.

Step 1 — **Push to GitHub**

```
git init   # only if the repo is still empty
git add .
git commit -m "Kora v1.0 launch"
git branch -M main
git remote add origin https://github.com/<your-handle>/Kora.git
git push -u origin main
```

Step 2 — **Import the repo**

Open https://vercel.com/new, click **Import Git Repository**, pick the repo, accept the auto-detected Next.js preset.

Step 3 — **Set environment variables**

In the Vercel project settings → **Environment Variables**, paste:

| Name | Required | Source |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Same |
| `NEXT_PUBLIC_SITE_URL` | yes | Your deployed hostname (`https://kora-*.vercel.app`) |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Supabase → API → service_role |
| `OPENAI_API_KEY` | optional | For v1.1 real-model wiring; v1.0 ships a deterministic stub |

`NEXT_PUBLIC_*` variables are exposed to the browser — never put the service-role key in any NEXT_PUBLIC_* name. Kora's `lib/env.ts` throws at process boot if a production deploy is missing public Supabase config.

Step 4 — **Run the migrations**

In the Supabase SQL Editor, paste and run each migration file in order:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_share_rpc.sql`
3. `supabase/migrations/0003_platform.sql`
4. `supabase/migrations/0004_soft_delete_and_share_expiry.sql`

Each migration is idempotent; running twice is safe.

Step 5 — **Deploy**

Click **Deploy**. Within ~90 seconds Vercel hands you a URL like `https://kora-seven-rose-42.vercel.app`. Add that hostname to `NEXT_PUBLIC_SITE_URL`'s to-ke (and re-deploy).

Step 6 — **Smoke test the live URL**

| Route | Expect |
| --- | --- |
| `/` | Landing renders with brand-correct halftone backdrop and wordmark. |
| `/login`, `/signup` | Auth forms post and redirect to `/dashboard`. |
| `/dashboard` | Empty state with the NewProjectForm inline. |
| `/project/[new-uuid]` | Workspace renders; tldraw mounts; phase switcher works. |
| `/share/[token]` | The link from the Share dialog opens in an incognito window with the read-only project snapshot. |

---

## Built-in launch hardening

This release includes production-grade defenses that the demo build did not have.

### Authentication
- Email + password via Supabase Auth, HttpOnly cookies set by `@supabase/ssr`.
- **Per-IP rate limit** on signup (5 attempts/minute) and login (10/min).
- Generic error copy on failed login — never confirms/denies whether an email exists.
- Logout invalidates the cookie and redirects home.

### Authorization
- Every public table has RLS policies keyed to `auth.uid()` — the owner only.
- Server actions never trust a user_id from the request body; they read it from the session cookie via `supabase.auth.getUser()`.
- The `mentions` policy explicitly prevents an owner from linking items across two workspaces.
- The `get_share_by_token` RPC is SECURITY DEFINER + expiry-aware + soft-delete-aware.

### Input validation
- Every server action validates input with Zod before touching the database.
- Destructive endpoints (`deleteProject`, `shareProject`) validate UUID format before any DB call.
- `shareCreate` validates the token character class on revoke, too.
- The share token alphabet avoids `0`, `O`, `I`, `L` to remove visual ambiguity in URLs.

### Rate limiting
- `lib/rate-limit` is an in-memory sliding-window limiter. v1.0 covers: signup, login, project create, project delete, share mint, share revoke, comment create, canvas replace, canvas upsert.
- v1.0 caveat (documented in code): the bucket map lives in the Node process. On Vercel, each function cold-starts as a new container, so limits are best-effort across cold starts. v1.1 swaps the store to Upstash Redis for cross-instance state.

### AI guardrails
- `lib/ai/guardrails` runs `throwIfDisallowed` BEFORE any provider call: prompt size cap (4k chars), context item count + size cap (32 items × 4k chars), and a hard reject on exfil patterns (e.g. "ignore previous instructions", bare `sk-...` keys, OpenAI `/v1/` endpoints).
- Daily token ceiling: 200,000 tokens per user per day, in-process counter. v1.1 swaps to a Supabase `ai_quotas` row tally so it survives Vercel cold starts.
- Per-call cost ceiling: $0.10. The deterministic stub provider costs $0; the v1.1 OpenAI provider will compute this from real token counts.

### Secret hygiene (audit)

- `SUPABASE_SERVICE_ROLE_KEY` is referenced in exactly two files:
  - `src/lib/storage/index.ts` (server module, no `"use client"`)
  - `src/lib/env.ts` (server module)
  - and that's it. Grep returns no other call sites.
- All `NEXT_PUBLIC_*` reads go through `lib/env`'s Zod schema. A typo in any of them surfaces as a hard startup throw in production.
- Routes under `(app)/` are gated by `middleware.ts`, which validates the Supabase JWT server-side via `supabase.auth.getUser()` (not just cookie presence).

### Soft delete + share lifecycle

Migration `0004_soft_delete_and_share_expiry.sql` adds:

- `deleted_at` columns on `projects`, `blocks`, `comments`, `folders`, `items`, `tags`, `ai_artifacts`. Partial indexes on each enforce "active rows only" query efficiency.
- `expires_at` (default 90 days), `revoked_at`, `created_by_ip`, `last_used_at` on `shares`. `get_share_by_token` returns NULL when revoked or expired. `last_used_at` is bumped on each successful lookup.
- `deleteProject` now soft-deletes (sets `deleted_at`) instead of hard-deleting — reversible from the DB if a mistake happens.

---

## What isn't shipped — honest list

The v1.0 README catalogues what exists, not what we'd like to claim exists. The following are **deliberately deferred** past v1.0:

- Multi-tenant organisations (model is in the schema, RLS not yet enforcing cross-tenant isolation)
- Real AI model integration (all `/home` suggestions are demo content; the `lib/ai` abstraction is the contract for v1.1)
- Real OAuth flows for integrations (`lib/integrations` is the registry; each provider's OAuth handshake ships in v1.1)
- Real-time collaboration (single-user MVP)
- Billing / Stripe model
- Desktop and mobile applications
- Plugin system

What **is** shipped:

- Every flagship route renders with intentional, polished empty and populated states
- Premium visual identity consistent across all surfaces
- Production-grade foundations for auth, RLS, file storage, AI guardrails, rate limiting
- Loading + error boundaries on the root and the (app) segment
- Layouts that work on mobile (sidebar hides below `md`, content reflows)
- Architecture abstractions that make the deferred items tractable, not re-architectures

---

## File map (high-level)

```
src/
  app/
    layout.tsx, globals.css, page.tsx
    (auth)/login, signup + forms
    (app)/home, inbox, search, dashboard, project/[id], tasks, calendar,
            knowledge, research, media, profile, settings/...
    share/[token]
    privacy, terms, changelog
  components/ui/         # Sidebar, ItemCard, EmptyState, PageHeader, ...
  lib/
    supabase/{client,server,middleware}
    auth/actions
    zod/schemas
    storage/             # storage abstraction
    ai/                  # AI abstraction
    integrations/        # integrations registry
    notifications/       # notification dispatch
    permissions/         # sharing + RBAC
    demo/                # seed data for demo mode
  types/database.ts
middleware.ts
supabase/migrations/0001_init.sql, 0002_share_rpc.sql, 0003_platform.sql
```

---

## License

Internal preview license. See `LICENSE`.
