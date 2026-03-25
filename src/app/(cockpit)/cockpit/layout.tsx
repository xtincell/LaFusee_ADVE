import Link from "next/link";

const navItems = [
  { href: "/cockpit", label: "Dashboard" },
  { href: "/cockpit/operate/missions", label: "Opérationnel" },
  { href: "/cockpit/brand/guidelines", label: "Marque" },
  { href: "/cockpit/insights/reports", label: "Insights" },
  { href: "/cockpit/messages", label: "Messages" },
  { href: "/cockpit/mestor", label: "Mestor" },
];

export default function CockpitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-card p-4">
        <h2 className="mb-6 text-lg font-bold">Brand OS</h2>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm hover:bg-muted">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
