"use client";
import { trpc } from "@/lib/trpc/client";
export default function IntakePipelinePage() {
  const { data } = trpc.quickIntake.listAll.useQuery({ limit: 20 });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pipeline Quick Intake</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-3 text-center"><p className="text-sm text-muted-foreground">En cours</p><p className="text-2xl font-bold">{(data?.items ?? []).filter(i => i.status === "IN_PROGRESS").length}</p></div>
        <div className="rounded-lg border bg-card p-3 text-center"><p className="text-sm text-muted-foreground">Complétés</p><p className="text-2xl font-bold">{(data?.items ?? []).filter(i => i.status === "COMPLETED").length}</p></div>
        <div className="rounded-lg border bg-card p-3 text-center"><p className="text-sm text-muted-foreground">Convertis</p><p className="text-2xl font-bold">{(data?.items ?? []).filter(i => i.status === "CONVERTED").length}</p></div>
        <div className="rounded-lg border bg-card p-3 text-center"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{(data?.items ?? []).length}</p></div>
      </div>
      <div className="space-y-2">
        {(data?.items ?? []).map((intake) => (
          <div key={intake.id} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">{intake.companyName}</p>
              <p className="text-xs text-muted-foreground">{intake.contactName} · {intake.contactEmail}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs ${intake.status === "COMPLETED" ? "bg-green-100 text-green-800" : intake.status === "CONVERTED" ? "bg-purple-100 text-purple-800" : "bg-yellow-100 text-yellow-800"}`}>{intake.status}</span>
              {intake.status === "COMPLETED" && <button className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground">Convertir</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
