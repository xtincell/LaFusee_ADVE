import Link from "next/link";

const divisions = [
  {
    name: "Oracle",
    items: [
      { href: "/console/oracle/clients", label: "Clients" },
      { href: "/console/oracle/diagnostics", label: "Diagnostics" },
      { href: "/console/oracle/intake", label: "Pipeline Intake" },
      { href: "/console/oracle/boot", label: "Boot Sequences" },
    ],
  },
  {
    name: "Signal",
    items: [
      { href: "/console/signal/intelligence", label: "Intelligence" },
      { href: "/console/signal/signals", label: "Signaux" },
      { href: "/console/signal/knowledge", label: "Knowledge Graph" },
    ],
  },
  {
    name: "Arène",
    items: [
      { href: "/console/arene/guild", label: "Guilde" },
      { href: "/console/arene/matching", label: "Matching" },
      { href: "/console/arene/orgs", label: "Organisations" },
    ],
  },
  {
    name: "Fusée",
    items: [
      { href: "/console/fusee/missions", label: "Missions" },
      { href: "/console/fusee/campaigns", label: "Campagnes" },
      { href: "/console/fusee/drivers", label: "Drivers" },
    ],
  },
  {
    name: "Socle",
    items: [
      { href: "/console/socle/revenue", label: "Revenue" },
      { href: "/console/socle/commissions", label: "Commissions" },
      { href: "/console/socle/pipeline", label: "Pipeline" },
    ],
  },
];

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-72 overflow-y-auto border-r bg-card p-4">
        <h2 className="mb-6 text-lg font-bold">Fixer Console</h2>
        <Link href="/console" className="mb-4 block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
          Ecosystem Dashboard
        </Link>
        {divisions.map((division) => (
          <div key={division.name} className="mb-4">
            <h3 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {division.name}
            </h3>
            <nav className="flex flex-col gap-0.5">
              {division.items.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-md px-3 py-1.5 text-sm hover:bg-muted">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
