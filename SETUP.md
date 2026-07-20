# Kora — Setup

A linear walk-through from zero to a running dev server.

---

## 1. Create a Supabase project

Go to [supabase.com](https://supabase.com/dashboard) → **New project**. Take note of two values (visible under **Project Settings → API**):

- `Project URL` → use this as `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → use this as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Do **not** copy the service-role key into the project. It's not needed; the migrations below run entirely from the SQL editor or the Supabase CLI as your database user.

## 2. Clone the repo

```bash
git clone https://github.com/annashahed09-sudo/Kora.git
cd Kora
```

## 3. Install

```bash
npm install
```

If the install complains about peer deps with `tldraw@3` and React 19, the fix is to use a 3.x version that supports React 19 (check `tldraw`'s release notes for the exact one).

## 4. Create `.env.local`

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL="https://YOUR-PROJECT-REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR-ANON-PUBLIC-KEY"
NEXT_PUBLIC_SITE_URL="https://kora.studio"
```

## 5. Run the migrations

### Option A — Supabase SQL editor (simplest)

Open your project → **SQL Editor** → **New query**. Paste the contents of each file and run them in order:

1. `supabase/migrations/0001_init.sql`  — initial tables + RLS
2. `supabase/migrations/0002_share_rpc.sql`  — public share lookup
3. `supabase/migrations/0003_platform.sql`  — v1.0 platform tables (workspaces, folders, items, tags, mentions, notifications, AI artifacts, integrations) + RLS
4. `supabase/migrations/0004_soft_delete_and_share_expiry.sql`  — soft-delete columns, share expiry, IP/usage tracking for share tokens

Each file is idempotent; running them twice is safe. **Skip steps 3–4 only if you want the original narrow MVP schema.**

### Option B — Supabase CLI

If you've linked the project with `supabase link --project-ref ...`:

```bash
supabase db push
```

## 6. Start the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`. The landing page should render even before auth is exercised — it's a pure static surface.

## 7. Create your first account

Click **Start a workspace** on the landing. Sign up with any email + 8+ character password. The auth-user trigger (`handle_new_user`) will create the matching row in `public.users` automatically.

## 8. Create a project

From the dashboard, fill in **Title**, **Client**, and pick an opening phase. You'll be redirected to `/project/[id]`.

## 9. Try the canvas

Inside the project, the tldraw canvas should load. Drawing or stamping a note (de)hydrates into the `blocks` table on every change, debounced to 700 ms. Open DevTools → Network and watch for the `replaceBlocks` server action.

## 10. Mint a share link

Click **Share** in the project header. The dialog generates a token, writes a row in `shares`, copies the URL to your clipboard.

Visit it in an incognito window — you'll see the read-only public view without being signed in. The same token will work for any visitor; mint a new one to revoke access to the previous one (the lookup key changes).

## 11. Try the legal pages

- `/privacy` — the policy
- `/terms` — the service terms
- `/changelog` — the release log

## 12. Build and deploy

```bash
npm run build
npm run start
```

Vercel is the default deployment target (the existing `next.config.ts` is empty, so nothing custom is needed). Make sure to add the three env vars to the project's **Environment Variables** UI before deploying.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Landing is blank, font not loading | `next dev` without network access | `next/font/google` needs first-run network; cache will hold after |
| `get_share_by_token` returns no rows | Migration 0002 hasn't run | Run it via SQL editor; verify under **Database → Functions** |
| `RLS` denies my own reads | A row has `user_id = null` | Make sure `handle_new_user` trigger fired for the signed-up user; or re-run migration 0001 |
| tldraw doesn't mount | Bundle error from peer deps | Pin `tldraw` to a version that supports React 19 |
| Login returns "Email or password is incorrect" but I'm sure | The user row never made it to `public.users` | Open Supabase → Table Editor → `users` and confirm a row exists |
| Share dialog says "Couldn't generate a link" | Policy drift on `shares` table | Re-run migration 0001 to reset the `shares_owner_all` policy |
