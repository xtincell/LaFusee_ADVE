import Link from "next/link";

const navItems = [
  { href: "/creator", label: "Dashboard" },
  { href: "/creator/missions/available", label: "Missions" },
  { href: "/creator/qc/submitted", label: "QC" },
  { href: "/creator/progress/metrics", label: "Progression" },
  { href: "/creator/earnings/missions", label: "Revenus" },
  { href: "/creator/profile/skills", label: "Profil" },
  { href: "/creator/learn/adve", label: "Apprendre" },
  { href: "/creator/messages", label: "Messages" },
  { href: "/creator/community/guild", label: "Communauté" },
];

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-card p-4">
        <h2 className="mb-6 text-lg font-bold">Guild OS</h2>
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
