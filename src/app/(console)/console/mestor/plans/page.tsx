"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { GitPullRequest } from "lucide-react";

export default function MestorPlansPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans d'Orchestration"
        description="Visualise et controle les plans RTIS + GLORY generes par l'Hyperviseur"
        breadcrumbs={[{ label: "Console", href: "/console" }, { label: "Mestor", href: "/console/mestor" }, { label: "Plans" }]}
      />
      <EmptyState
        icon={GitPullRequest}
        title="Aucun plan actif"
        description="Selectionnez une strategie puis lancez un plan d'orchestration pour voir le DAG des etapes."
      />
    </div>
  );
}
