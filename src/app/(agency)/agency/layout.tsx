// ============================================================================
// Console Agence Layout — White-label agency portal
// Shows only the agency's own clients and their brands
// Route: /agency
// ============================================================================

"use client";

import { AppShell, agencyNavGroups } from "@/components/navigation";
import { Building2 } from "lucide-react";

function AgencySidebarHeader() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15">
        <Building2 className="h-3.5 w-3.5 text-violet-400" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-foreground">Console Agence</p>
        <p className="text-[10px] text-foreground-muted">Gestion clients</p>
      </div>
    </div>
  );
}

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      portal="agency"
      navGroups={agencyNavGroups}
      portalAccentVar="var(--color-portal-agency, #8b5cf6)"
      sidebarHeader={<AgencySidebarHeader />}
    >
      {children}
      <footer className="mt-12 border-t border-zinc-800 py-6 text-center">
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Retour au site
        </a>
      </footer>
    </AppShell>
  );
}
