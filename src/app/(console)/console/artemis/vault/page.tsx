"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Lock } from "lucide-react";

export default function VaultPage() {
  // TODO: Wire to trpc.sequenceVault.list when strategy selector is ready

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sequence Vault"
        description="Review les outputs de sequences — accepte pour promouvoir en BrandAsset, rejette pour re-run"
        breadcrumbs={[
          { label: "Console", href: "/console" },
          { label: "Artemis", href: "/console/artemis" },
          { label: "Vault" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {(["PENDING", "ACCEPTED", "REJECTED"] as const).map((status) => (
          <div key={status} className="rounded-xl border border-border bg-card">
            <div className="border-b border-border-subtle px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">
                {status === "PENDING" ? "En attente" : status === "ACCEPTED" ? "Acceptes" : "Rejetes"}
              </h3>
            </div>
            <div className="p-4">
              <EmptyState
                icon={Lock}
                title={`Aucun output ${status.toLowerCase()}`}
                description="Executez une sequence pour voir les outputs ici."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
