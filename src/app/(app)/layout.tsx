import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Sidebar,
  RAIL_COOKIE_NAME,
  parseRailState,
} from "@/components/ui/Sidebar";

/**
 * (app) layout — the workspace surface.
 *
 * Renders the left sidebar rail, then a main column for the routed content.
 * Reads the `kora-rail` cookie server-side (Next 16 async cookies()) and
 * parses it through a single shared constant so this and the Sidebar's
 * client-side toggle can't drift.
 */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const railCookie = parseRailState(cookieStore.get(RAIL_COOKIE_NAME)?.value);
  const collapsed = railCookie === "collapsed";

  return (
    <div className="flex min-h-dvh bg-bg text-fg">
      <Sidebar email={user.email ?? null} collapsed={collapsed} />
      <main id="main" className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
