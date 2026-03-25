"use client";
import { trpc } from "@/lib/trpc/client";
export default function GuildPage() {
  const { data: stats } = trpc.guilde.getStats.useQuery();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">La Guilde</h1>
      <div className="grid grid-cols-4 gap-4">
        {(stats?.byTier ?? []).map((t) => (
          <div key={t.tier} className="rounded-lg border bg-card p-4 text-center">
            <p className="text-sm text-muted-foreground">{t.tier}</p>
            <p className="text-2xl font-bold">{t._count}</p>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground">Total: {stats?.total ?? 0} créatifs</p>
    </div>
  );
}
