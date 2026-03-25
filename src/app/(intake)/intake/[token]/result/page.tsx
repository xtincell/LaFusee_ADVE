"use client";

import { use } from "react";
import { trpc } from "@/lib/trpc/client";
import { AdvertisRadar } from "@/components/shared/advertis-radar";
import { ScoreBadge } from "@/components/shared/score-badge";
import { PILLAR_NAMES, type PillarKey } from "@/lib/types/advertis-vector";

export default function IntakeResult({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { data: intake, isLoading } = trpc.quickIntake.getByToken.useQuery(
    { token },
    { retry: false }
  );

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </main>
    );
  }

  if (!intake || !intake.advertis_vector) {
    return (
      <main className="mx-auto max-w-2xl p-8 text-center">
        <h1 className="text-2xl font-bold">Résultat non disponible</h1>
        <p className="mt-2 text-muted-foreground">
          Ce diagnostic n'est pas encore terminé ou le lien est invalide.
        </p>
      </main>
    );
  }

  const vector = intake.advertis_vector as Record<string, number>;
  const scores: Partial<Record<PillarKey, number>> = {
    a: vector.a ?? 0,
    d: vector.d ?? 0,
    v: vector.v ?? 0,
    e: vector.e ?? 0,
    r: vector.r ?? 0,
    t: vector.t ?? 0,
    i: vector.i ?? 0,
    s: vector.s ?? 0,
  };
  const composite = vector.composite ?? 0;
  const confidence = vector.confidence ?? 0;

  // Find strengths and weaknesses
  const sortedPillars = (Object.entries(scores) as [PillarKey, number][])
    .sort(([, a], [, b]) => b - a);
  const strengths = sortedPillars.slice(0, 2);
  const weaknesses = sortedPillars.slice(-2).reverse();

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">Votre diagnostic de marque</h1>
      <p className="mt-1 text-muted-foreground">{intake.companyName}</p>

      <div className="mt-8 space-y-6">
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-sm font-medium text-muted-foreground">Score ADVE-RTIS</h2>
          <ScoreBadge score={composite} size="lg" className="mt-2" />
          {confidence < 0.7 && (
            <p className="mt-4 text-sm text-muted-foreground">
              Confidence: {(confidence * 100).toFixed(0)}% — Ce score est une estimation.
              Un diagnostic complet via IMPULSION affinera ces résultats.
            </p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Radar 8 piliers</h3>
          <AdvertisRadar scores={scores} className="flex justify-center" />
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Diagnostic</h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-green-700">Forces</h4>
              <p className="text-muted-foreground">
                {strengths.map(([key]) => `${PILLAR_NAMES[key]} (${key.toUpperCase()})`).join(" et ")} —
                vos dimensions les plus développées.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-red-700">Axes d'amélioration</h4>
              <p className="text-muted-foreground">
                {weaknesses.map(([key]) => `${PILLAR_NAMES[key]} (${key.toUpperCase()})`).join(" et ")} —
                ces dimensions nécessitent un renforcement prioritaire.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-700">Recommandation</h4>
              <p className="text-muted-foreground">
                Un accompagnement IMPULSION permettrait de structurer votre stratégie
                et d'activer vos Drivers prioritaires pour un impact mesurable.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a
            href="mailto:alexandre@upgraders.com?subject=IMPULSION%20-%20Suite%20Quick%20Intake"
            className="inline-block rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground"
          >
            Passer à IMPULSION
          </a>
          <p className="mt-2 text-xs text-muted-foreground">
            Partagez ce diagnostic: {typeof window !== "undefined" ? window.location.href : ""}
          </p>
        </div>
      </div>
    </main>
  );
}
