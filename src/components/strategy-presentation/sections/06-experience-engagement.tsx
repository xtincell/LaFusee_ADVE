"use client";

import type { ExperienceEngagementSection } from "@/server/services/strategy-presentation/types";
import { DataTable } from "../shared/data-table";
import { DevotionPyramid } from "../shared/devotion-pyramid";

interface Props { data: ExperienceEngagementSection }

export function ExperienceEngagement({ data }: Props) {
  return (
    <div className="space-y-6">
      {data.touchpoints.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Points de contact</h3>
          <DataTable
            headers={["Touchpoint", "Canal", "Qualite", "Stade AARRR"]}
            rows={data.touchpoints.map((t) => [t.nom, t.canal, t.qualite, t.stadeAarrr])}
          />
        </div>
      )}

      {data.rituels.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Rituels de marque</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.rituels.map((r, i) => (
              <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="text-sm font-semibold text-zinc-200">{r.nom}</p>
                <p className="mt-1 text-xs text-zinc-500">{r.frequence}</p>
                <p className="mt-2 text-sm text-zinc-400">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.devotionPathway && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Parcours de devotion</h3>
          <DevotionPyramid data={data.devotionPathway.currentDistribution} score={0} />
          {data.devotionPathway.conversionTriggers.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-zinc-500">Triggers de conversion</p>
              {data.devotionPathway.conversionTriggers.map((ct, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="font-medium text-zinc-300">{ct.from}</span>
                  <span className="text-zinc-600">→</span>
                  <span className="font-medium text-zinc-300">{ct.to}</span>
                  <span className="text-zinc-500">: {ct.trigger}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {data.communityStrategy && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Strategie communautaire</h3>
          <p className="text-sm text-zinc-300">{data.communityStrategy}</p>
        </div>
      )}
    </div>
  );
}
