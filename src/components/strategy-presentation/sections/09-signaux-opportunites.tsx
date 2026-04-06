"use client";

import type { SignauxOpportunitesSection } from "@/server/services/strategy-presentation/types";
import { AiBadge } from "@/components/shared/ai-badge";

interface Props { data: SignauxOpportunitesSection }

export function SignauxOpportunites({ data }: Props) {
  return (
    <div className="space-y-6">
      {data.signauxFaibles.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Signaux faibles <AiBadge />
          </h3>
          <div className="space-y-2">
            {data.signauxFaibles.map((s, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                  s.severity === "CRITICAL" ? "bg-red-500" :
                  s.severity === "HIGH" ? "bg-amber-500" :
                  s.severity === "MEDIUM" ? "bg-yellow-500" : "bg-zinc-500"
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-zinc-200">{s.signal}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{s.source} — {s.detectedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.opportunitesPriseDeParole.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Opportunites de prise de parole</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.opportunitesPriseDeParole.map((o, i) => (
              <div key={i} className="rounded-lg border border-violet-800/30 bg-violet-950/20 p-4">
                <p className="text-sm font-medium text-violet-300">{o.contexte}</p>
                <div className="mt-2 flex gap-2 text-[10px]">
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-400">{o.canal}</span>
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-400">{o.timing}</span>
                  <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-violet-400">{o.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.mestorInsights.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Prescriptions Mestor <AiBadge />
          </h3>
          <div className="space-y-2">
            {data.mestorInsights.map((ins, i) => (
              <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-amber-400">{ins.type}</span>
                  <span className="text-sm font-medium text-zinc-200">{ins.title}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">{ins.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
