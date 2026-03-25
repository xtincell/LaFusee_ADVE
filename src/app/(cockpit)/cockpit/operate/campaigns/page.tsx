"use client";

import { trpc } from "@/lib/trpc/client";
import { DataTable } from "@/components/shared/data-table";

export default function CampaignsPage() {
  const { data: campaigns, isLoading } = trpc.campaign.list.useQuery({});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Campagnes</h1>
      {isLoading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : (
        <DataTable
          data={(campaigns ?? []) as Record<string, unknown>[]}
          columns={[
            { key: "name", header: "Nom" },
            { key: "status", header: "Statut", render: (item) => (
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                item.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}>{String(item.status)}</span>
            )},
            { key: "missions", header: "Missions", render: (item) => String((item.missions as unknown[])?.length ?? 0) },
          ]}
          emptyMessage="Aucune campagne"
        />
      )}
    </div>
  );
}
