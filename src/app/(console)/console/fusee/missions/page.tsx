"use client";
import { trpc } from "@/lib/trpc/client";
export default function FuseeMissionsPage() {
  const { data: missions } = trpc.mission.list.useQuery({ limit: 30 });
  const { data: slaAlerts } = trpc.mission.checkSla.useQuery();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Missions (toutes)</h1>
      {(slaAlerts ?? []).length > 0 && (
        <div className="rounded-lg border-2 border-destructive bg-destructive/5 p-4">
          <h3 className="font-medium text-destructive">Alertes SLA ({slaAlerts?.length})</h3>
          {slaAlerts?.map((a, i) => (
            <p key={i} className="text-sm">{a.title} — {a.severity} ({a.hoursRemaining}h restantes)</p>
          ))}
        </div>
      )}
      <p className="text-muted-foreground">{(missions ?? []).length} missions au total</p>
    </div>
  );
}
