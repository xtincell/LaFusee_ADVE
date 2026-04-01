"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs } from "@/components/shared/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { SkeletonPage } from "@/components/shared/loading-skeleton";
import {
  Lock,
  DollarSign,
  Clock,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";

export default function EscrowPage() {
  const [activeTab, setActiveTab] = useState("all");

  // Escrow data from commissions with HELD status
  const { data: commissions, isLoading } = trpc.commission.list.useQuery({ limit: 100 });

  if (isLoading) return <SkeletonPage />;

  const items = commissions?.items ?? [];
  const held = items.filter((c) => c.status === "HELD" || c.status === "PENDING");
  const released = items.filter((c) => c.status === "PAID" || c.status === "RELEASED");
  const disputed = items.filter((c) => c.status === "DISPUTED");

  const totalHeld = held.reduce((s, c) => s + (c.commissionAmount ?? 0), 0);
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n));

  const filteredItems =
    activeTab === "held" ? held
    : activeTab === "released" ? released
    : activeTab === "disputed" ? disputed
    : items;

  const tabs = [
    { key: "all", label: "Tous", count: items.length },
    { key: "held", label: "En sequestre", count: held.length },
    { key: "released", label: "Liberes", count: released.length },
    { key: "disputed", label: "En litige", count: disputed.length },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Escrow"
        description="Gestion des fonds en sequestre et liberation des paiements"
        breadcrumbs={[
          { label: "Console", href: "/console" },
          { label: "Socle" },
          { label: "Escrow" },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total escrow" value={items.length} icon={Lock} />
        <StatCard title="Montant en sequestre" value={`${fmt(totalHeld)} XAF`} icon={DollarSign} />
        <StatCard title="En attente" value={held.length} icon={Clock} />
        <StatCard title="Liberes" value={released.length} icon={CheckCircle} />
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Aucun escrow"
          description="Les fonds en sequestre apparaitront ici. Les paiements sont securises jusqu'a validation."
        />
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div>
                <p className="text-sm font-medium text-foreground">{item.missionId ? `Mission ${item.missionId.slice(0, 8)}...` : "Commission"}</p>
                <p className="text-xs text-foreground-muted">{new Date(item.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">{fmt(item.commissionAmount ?? 0)} XAF</span>
                <StatusBadge status={item.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
