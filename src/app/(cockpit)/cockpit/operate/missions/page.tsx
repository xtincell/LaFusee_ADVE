"use client";

import { trpc } from "@/lib/trpc/client";
import { DataTable } from "@/components/shared/data-table";

export default function MissionsPage() {
  // In production this would use the user's strategyId from session
  const { data: missions, isLoading } = trpc.mission.list.useQuery({ limit: 20 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Missions</h1>
        <span className="text-sm text-muted-foreground">Missions en cours et livrables à valider</span>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : (
        <DataTable
          data={(missions ?? []) as Record<string, unknown>[]}
          columns={[
            { key: "title", header: "Titre" },
            { key: "status", header: "Statut", render: (item) => (
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                item.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                item.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              }`}>{String(item.status)}</span>
            )},
            { key: "mode", header: "Mode" },
            { key: "createdAt", header: "Créé le", render: (item) => new Date(item.createdAt as string).toLocaleDateString("fr-FR") },
          ]}
          emptyMessage="Aucune mission en cours"
        />
      )}
    </div>
  );
}
