"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Zap } from "lucide-react";

export default function MestorInsightsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights Proactifs"
        description="Alertes, opportunites et risques detectes par le swarm Mestor"
        breadcrumbs={[{ label: "Console", href: "/console" }, { label: "Mestor", href: "/console/mestor" }, { label: "Insights" }]}
      />
      <EmptyState
        icon={Zap}
        title="Pas encore d'insights"
        description="Les insights apparaissent automatiquement quand une strategie est active et que les piliers ont du contenu."
      />
    </div>
  );
}
