"use client";

import type { PropositionValeurSection } from "@/server/services/strategy-presentation/types";
import { MetricCard } from "../shared/metric-card";

interface Props { data: PropositionValeurSection }

export function PropositionValeur({ data }: Props) {
  return (
    <div className="space-y-6">
      {data.pricing && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Strategie de prix</h3>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
            <p className="text-sm text-zinc-300">{data.pricing.strategy}</p>
            <p className="text-xs text-zinc-500">{data.pricing.ladderDescription}</p>
            {data.pricing.competitorComparison && (
              <p className="text-xs text-amber-400/80">vs. Concurrence : {data.pricing.competitorComparison}</p>
            )}
          </div>
        </div>
      )}

      {data.proofPoints.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Preuves de valeur</h3>
          <ul className="space-y-1.5">
            {data.proofPoints.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.guarantees.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Garanties</h3>
          <div className="flex flex-wrap gap-2">
            {data.guarantees.map((g, i) => (
              <span key={i} className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">{g}</span>
            ))}
          </div>
        </div>
      )}

      {data.unitEconomics && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Unit Economics</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard label="CAC" value={data.unitEconomics.cac != null ? `${data.unitEconomics.cac.toLocaleString()} FCFA` : "—"} />
            <MetricCard label="LTV" value={data.unitEconomics.ltv != null ? `${data.unitEconomics.ltv.toLocaleString()} FCFA` : "—"} />
            <MetricCard label="LTV/CAC" value={data.unitEconomics.ltvCacRatio != null ? `${data.unitEconomics.ltvCacRatio.toFixed(1)}x` : "—"} />
          </div>
        </div>
      )}

      {data.innovationPipeline.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Pipeline d'innovation</h3>
          <ul className="space-y-1.5">
            {data.innovationPipeline.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
