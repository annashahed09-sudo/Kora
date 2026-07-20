import Link from "next/link";

export default function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const NAV = [
    { href: "/settings", label: "General" },
    { href: "/settings/appearance", label: "Appearance" },
    { href: "/settings/security", label: "Security" },
    { href: "/settings/integrations", label: "Integrations" },
    { href: "/settings/labs", label: "Labs" },
  ];
  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-12 md:px-10 md:py-16">
      <div className="grid grid-cols-12 gap-x-10">
        <nav aria-label="Settings" className="col-span-12 md:col-span-3">
          <p className="eyebrow mb-3">Settings</p>
          <ul className="flex flex-col gap-px border border-line bg-line">
            {NAV.map((n) => (
              <li key={n.href} className="bg-bg">
                <Link
                  href={n.href}
                  className="block px-4 py-2.5 text-[13px] text-fg-muted transition-colors hover:bg-bg-soft hover:text-fg"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <section className="col-span-12 mt-12 md:col-span-9 md:mt-0">{children}</section>
      </div>
    </div>
  );
}
