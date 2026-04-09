"use client";

import { trpc } from "@/lib/trpc/client";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonPage } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Lock, CheckCircle, XCircle, Clock, ChevronRight } from "lucide-react";

const STATUS_CONFIG = {
  PENDING: { label: "En attente de review", icon: Clock, color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/5" },
  ACCEPTED: { label: "Acceptes — promus en BrandAsset", icon: CheckCircle, color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5" },
  REJECTED: { label: "Rejetes", icon: XCircle, color: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/5" },
} as const;

export default function VaultPage() {
  const { data: strategies, isLoading: ls } = trpc.strategy.list.useQuery({});

  if (ls) return <SkeletonPage />;

  const activeStrategies = (strategies ?? []).filter((s) => s.status === "ACTIVE");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sequence Vault"
        description="Staging des outputs de sequences — accepte pour promouvoir en BrandAsset, rejette pour re-run"
        breadcrumbs={[
          { label: "Console", href: "/console" },
          { label: "Artemis", href: "/console/artemis" },
          { label: "Vault" },
        ]}
      />

      {/* Kanban columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {(["PENDING", "ACCEPTED", "REJECTED"] as const).map((status) => {
          const config = STATUS_CONFIG[status];
          const Icon = config.icon;

          return (
            <div key={status} className={`rounded-xl border ${config.border} ${config.bg}`}>
              <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
                <Icon className={`h-4 w-4 ${config.color}`} />
                <h3 className="text-sm font-semibold text-foreground">{config.label}</h3>
              </div>

              <div className="p-4">
                {activeStrategies.length === 0 ? (
                  <p className="text-xs text-foreground-muted">Aucune strategie active.</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-foreground-muted">
                      {status === "PENDING"
                        ? "Les outputs de sequences apparaissent ici apres execution. Reviewez puis acceptez ou rejetez."
                        : status === "ACCEPTED"
                          ? "Les outputs acceptes sont promus en BrandAsset officiel et deviennent referencables par les sequences suivantes."
                          : "Les outputs rejetes restent en staging. Vous pouvez re-run la sequence ou supprimer."}
                    </p>
                    {activeStrategies.map((s) => (
                      <div key={s.id} className="rounded-lg border border-border-subtle bg-card p-3">
                        <p className="text-xs font-medium text-foreground">{s.name}</p>
                        <p className="text-[10px] text-foreground-muted">Aucune execution {status.toLowerCase()} pour cette marque</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Comment fonctionne le Vault</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-sm font-bold text-amber-300">1</div>
            <div>
              <p className="text-xs font-semibold text-foreground">Executer</p>
              <p className="text-[10px] text-foreground-muted">Lancez une sequence depuis le Skill Tree. Les outputs arrivent dans PENDING.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-300">2</div>
            <div>
              <p className="text-xs font-semibold text-foreground">Reviewer</p>
              <p className="text-[10px] text-foreground-muted">Acceptez pour promouvoir en BrandAsset. Les sequences dependantes se debloquent.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-sm font-bold text-violet-300">3</div>
            <div>
              <p className="text-xs font-semibold text-foreground">Iterer</p>
              <p className="text-[10px] text-foreground-muted">Rejetez pour re-run (version 2, 3...). L'ancienne version est archivee.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
