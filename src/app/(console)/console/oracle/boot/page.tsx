"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

export default function BootSequencesPage() {
  const { data: strategies, isLoading } = trpc.strategy.list.useQuery({});

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Boot Sequences ARTEMIS</h1>
        <p className="text-muted-foreground">
          Sessions d'onboarding stratégique — calibrage conditionnel des 8 piliers ADVE.
          L'ordre des piliers est généré dynamiquement selon le niveau de validation existant et le business context.
        </p>
      </header>

      {isLoading && (
        <div className="text-sm text-muted-foreground">Chargement…</div>
      )}

      {!isLoading && (!strategies || strategies.length === 0) && (
        <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
          Aucun client à calibrer. Créez d'abord une Strategy pour démarrer un Boot Sequence.
        </div>
      )}

      {strategies && strategies.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {strategies.map((s) => {
            const pillarCount = s.pillars?.length ?? 0;
            const v = s.advertis_vector as Record<string, number> | null;
            return (
              <Link
                key={s.id}
                href={`/console/oracle/boot/${s.id}`}
                className="group rounded-lg border bg-card p-5 transition hover:border-primary hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{s.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {pillarCount}/8 piliers ouverts · Statut : {s.status}
                    </p>
                  </div>
                  {v?.composite ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {Math.round(v.composite)}/200
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">non scoré</span>
                  )}
                </div>
                <span className="mt-3 inline-block text-xs font-medium text-primary group-hover:underline">
                  Ouvrir le Boot Sequence →
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
