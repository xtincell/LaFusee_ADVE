"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Network, Lock, CheckCircle, Clock, Unlock } from "lucide-react";

const TIER_LABELS: Record<number, { name: string; description: string }> = {
  0: { name: "T0 — Foundation", description: "8 sequences pilier (A/D/V/E/R/T/I/S)" },
  1: { name: "T1 — Identity", description: "Identite visuelle et verbale" },
  2: { name: "T2 — Production", description: "Livrables creatifs" },
  3: { name: "T3 — Campaign", description: "Orchestrations multi-canal" },
  4: { name: "T4 — Strategy", description: "Planification annuelle et bilans" },
  5: { name: "T5 — Operations", description: "Finance, ops, reporting" },
};

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "ACCEPTED": return <CheckCircle className="h-4 w-4 text-emerald-400" />;
    case "PENDING": return <Clock className="h-4 w-4 text-amber-400" />;
    case "AVAILABLE": return <Unlock className="h-4 w-4 text-blue-400" />;
    case "LOCKED": return <Lock className="h-4 w-4 text-foreground-muted" />;
    default: return null;
  }
}

export default function SkillTreePage() {
  // TODO: Wire to trpc.sequenceVault.skillTree when strategy selector is ready
  // For now, show the tier structure as a static preview

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skill Tree"
        description="40 sequences organisees par tier — les combos debloquent les sequences avancees"
        breadcrumbs={[
          { label: "Console", href: "/console" },
          { label: "Artemis", href: "/console/artemis" },
          { label: "Skill Tree" },
        ]}
      />

      <div className="space-y-8">
        {Object.entries(TIER_LABELS).map(([tier, { name, description }]) => (
          <div key={tier}>
            <div className="mb-3 flex items-center gap-2">
              <div
                className="h-6 w-1 rounded-full"
                style={{ backgroundColor: "var(--color-division-artemis)" }}
              />
              <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
                {name}
              </h2>
              <span className="text-xs text-foreground-muted">{description}</span>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* Placeholder cards — will be populated by skillTree query */}
              <div className="flex items-center gap-3 rounded-lg border border-border-subtle bg-card p-3 opacity-50">
                <StatusIcon status="LOCKED" />
                <div>
                  <p className="text-xs font-medium text-foreground-muted">Selectionnez une strategie</p>
                  <p className="text-[10px] text-foreground-muted">pour voir le skill tree</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
