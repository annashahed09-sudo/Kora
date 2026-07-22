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
    
    "/((?!_next/static|_next/image|_next/data|favicon|.*\\.svg|share).*)",
  ],
};
