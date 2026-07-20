/**
 * Root-level middleware for Kora. Responsibilities:
 *
 *   1. Refresh the Supabase auth cookie on every request by calling
 *      `updateSession`. Without this, server components downstream would
 *      see stale or missing sessions.
 *   2. Gate `/dashboard` and `/project/*` behind a real authenticated user,
 *      redirecting anonymous requests to `/login` with a `next=` query so
 *      we can return the user to the page they were trying to reach.
 *   3. Leave `/share/*` and all auth pages public — no redirect there.
 */
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response, isAuthed } = await updateSession(request);

  const url = request.nextUrl;
  const pathname = url.pathname;

  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/project");

  if (!isProtected) return response;

  if (!isAuthed) {
    const next = encodeURIComponent(pathname + url.search);
    return NextResponse.redirect(new URL(`/login?next=${next}`, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match everything except:
     *  - _next/static, _next/image, _next/data (Next internals)
     *  - favicon.svg, favicon.ico, file.svg, globe.svg, next.svg, vercel.svg,
     *    window.svg (static assets served from /public)
     *  - share/* (handled as public — share tokens do their own gating)
     */
    "/((?!_next/static|_next/image|_next/data|favicon|.*\\.svg|share).*)",
  ],
};
