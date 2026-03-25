"use client";
import { trpc } from "@/lib/trpc/client";
export default function ClientsPage() {
  const { data: strategies } = trpc.strategy.list.useQuery({});
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Clients</h1>
      <div className="space-y-3">
        {(strategies ?? []).length === 0 && <p className="text-muted-foreground">Aucun client. Les Brand Instances apparaîtront ici.</p>}
        {(strategies ?? []).map((s) => {
          const v = s.advertis_vector as Record<string, number> | null;
          const composite = v ? ["a","d","v","e","r","t","i","s"].reduce((sum, k) => sum + (v[k] ?? 0), 0) : 0;
          return (
            <div key={s.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{composite}/200</p>
                <p className="text-xs text-muted-foreground">{s.status}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
