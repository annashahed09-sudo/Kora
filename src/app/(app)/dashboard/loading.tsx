/**
 * Dashboard loading state — skeleton grid while server fetches projects.
 */
export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-16 md:py-20">
      <div className="flex flex-col gap-2">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton mt-2 h-10 w-64" />
        <div className="skeleton mt-3 h-4 w-96" />
      </div>

      <div className="mt-14 grid grid-cols-12 gap-x-8">
        <section className="col-span-12 md:col-span-4">
          <div className="skeleton h-72 w-full" />
        </section>

        <section className="col-span-12 mt-12 md:col-span-8 md:mt-0">
          <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-bg p-6 md:p-7">
                <div className="flex items-center justify-between">
                  <div className="skeleton h-5 w-16 rounded-full" />
                  <div className="skeleton h-3 w-12" />
                </div>
                <div className="mt-5 flex flex-col gap-2">
                  <div className="skeleton h-7 w-48" />
                  <div className="skeleton h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
