"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Lightbulb } from "lucide-react";

export default function MestorRecosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Recommandations"
        description="Review les recommandations ADVE generees par le Commandant depuis R+T"
        breadcrumbs={[{ label: "Console", href: "/console" }, { label: "Mestor", href: "/console/mestor" }, { label: "Recommandations" }]}
      />
      <EmptyState
        icon={Lightbulb}
        title="Aucune recommandation en attente"
        description="Lancez un plan d'orchestration incluant l'etape COMMANDANT pour generer des recommandations ADVE."
      />
    </div>
  );
}
