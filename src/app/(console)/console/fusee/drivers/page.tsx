"use client";
import { trpc } from "@/lib/trpc/client";
export default function DriversConsolePage() {
  const { data: drivers } = trpc.driver.list.useQuery({});
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Drivers</h1>
      <p className="text-muted-foreground">Tous les Drivers actifs dans l'écosystème.</p>
      <div className="space-y-2">
        {(drivers ?? []).map((d) => (
          <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
            <div><p className="font-medium">{d.name}</p><p className="text-xs text-muted-foreground">{d.channel} · {d.channelType}</p></div>
            <span className={`rounded-full px-2 py-0.5 text-xs ${d.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100"}`}>{d.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
