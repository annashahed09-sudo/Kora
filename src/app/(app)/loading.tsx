/**
 * Segment-loading fallback for the (app) surface.
 *
 * Renders a sidebar skeleton + content skeleton so the layout doesn't
 * collapse visibly. The (app) layout owns the sidebar; this loading
 * state shows during the page-level suspense boundary while the
 * server component is being prepared.
 */
export default function AppLoading() {
  return (
    <div className="flex min-h-dvh bg-bg text-fg">
      {/* Sidebar skeleton */}
      <aside
        aria-hidden
        className="hidden h-dvh w-[248px] shrink-0 border-r border-line bg-bg md:block"
      >
        <div className="flex h-dvh flex-col">
          <div className="flex h-14 items-center justify-between border-b border-line px-3">
            <span className="font-display text-[1.5rem] italic text-fg-subtle">
              kora
            </span>
          </div>
          <div className="space-y-px px-2 pt-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-full rounded-[7px] bg-bg-soft/60"
              />
            ))}
          </div>
        </div>
      </aside>

      {/* Content skeleton */}
      <main className="flex-1 px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="mb-12 flex flex-col gap-4">
            <div className="h-3 w-24 rounded-full bg-bg-soft" />
            <div className="h-12 w-2/3 rounded-[6px] bg-bg-soft" />
            <div className="h-4 w-1/2 rounded-full bg-bg-soft" />
          </div>

          <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-bg p-6">
                <div className="mb-5 h-3 w-20 rounded-full bg-bg-soft" />
                <div className="mb-2 h-7 w-3/4 rounded-[6px] bg-bg-soft" />
                <div className="h-3 w-1/2 rounded-full bg-bg-soft" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
