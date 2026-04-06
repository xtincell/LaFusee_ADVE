"use client";

import type { CatalogueActionsSection } from "@/server/services/strategy-presentation/types";
import { DataTable } from "../shared/data-table";
import { MetricCard } from "../shared/metric-card";

interface Props { data: CatalogueActionsSection }

export function CatalogueActions({ data }: Props) {
  const canaux = Object.keys(data.parCanal);
  const piliers = Object.keys(data.parPilier);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <MetricCard label="Total actions possibles" value={String(data.totalActions)} />
        <MetricCard label="Canaux actifs" value={String(canaux.length)} />
      </div>

      {canaux.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Par canal</h3>
          {canaux.map((canal) => (
            <div key={canal} className="mb-4">
              <p className="mb-2 text-xs font-bold uppercase text-violet-400">{canal}</p>
              <DataTable
                headers={["Action", "Format", "Cout", "Impact"]}
                rows={data.parCanal[canal]!.map((a) => [a.action, a.format, a.cout ?? "—", a.impact])}
              />
            </div>
          ))}
        </div>
      )}

      {piliers.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Par pilier ADVE-RTIS</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {piliers.map((pilier) => (
              <div key={pilier} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="text-xs font-bold uppercase text-zinc-400">{pilier.toUpperCase()}</p>
                <ul className="mt-2 space-y-1">
                  {data.parPilier[pilier]!.map((a, i) => (
                    <li key={i} className="text-xs text-zinc-300">
                      <span className="text-zinc-500">{a.objectif}</span> → {a.action}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.drivers.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Drivers actifs</h3>
          <div className="flex flex-wrap gap-2">
            {data.drivers.map((d, i) => (
              <span key={i} className={`rounded-full px-3 py-1 text-xs font-medium ${
                d.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"
              }`}>
                {d.name} ({d.channel})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
