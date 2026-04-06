"use client";

import type { FenetreOvertonSection } from "@/server/services/strategy-presentation/types";
import { DataTable } from "../shared/data-table";

interface Props { data: FenetreOvertonSection }

export function FenetreOverton({ data }: Props) {
  return (
    <div className="space-y-6">
      {/* Perception gap */}
      {(data.perceptionActuelle || data.perceptionCible) && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-red-800/30 bg-red-950/20 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">Perception actuelle</p>
            <p className="mt-2 text-sm text-zinc-200">{data.perceptionActuelle ?? "Non definie"}</p>
          </div>
          <div className="rounded-lg border border-emerald-800/30 bg-emerald-950/20 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Perception cible</p>
            <p className="mt-2 text-sm text-zinc-200">{data.perceptionCible ?? "Non definie"}</p>
          </div>
        </div>
      )}

      {data.ecart && (
        <div className="rounded-lg border border-amber-800/30 bg-amber-950/20 p-4">
          <p className="text-xs font-bold uppercase text-amber-400">Ecart a combler</p>
          <p className="mt-1 text-sm text-zinc-300">{data.ecart}</p>
        </div>
      )}

      {data.strategieDeplacment.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Strategie de deplacement</h3>
          <div className="space-y-3">
            {data.strategieDeplacment.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-400">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-200">{s.etape}</p>
                  <p className="text-xs text-zinc-400">{s.action}</p>
                  <div className="mt-1 flex gap-2 text-[10px]">
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-500">{s.canal}</span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-500">{s.horizon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.roadmap.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Roadmap</h3>
          <DataTable
            headers={["Phase", "Objectif", "Livrables", "Budget", "Duree"]}
            rows={data.roadmap.map((r) => [
              r.phase,
              r.objectif,
              r.livrables.join(", "),
              r.budget != null ? `${r.budget.toLocaleString()} FCFA` : "—",
              r.duree,
            ])}
          />
        </div>
      )}

      {data.jalons.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Jalons cles</h3>
          <div className="space-y-2">
            {data.jalons.map((j, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="shrink-0 text-xs font-mono text-zinc-500">{j.date}</span>
                <span className="h-px flex-1 bg-zinc-800" />
                <span className="text-zinc-200">{j.milestone}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
