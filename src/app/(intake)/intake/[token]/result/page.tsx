import { AdvertisRadar } from "@/components/shared/advertis-radar";
import { ScoreBadge } from "@/components/shared/score-badge";

export default async function IntakeResult({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Demo data — will be replaced with tRPC query via token
  const demoScores = { a: 14, d: 10, v: 16, e: 8, r: 11, t: 9, i: 7, s: 12 };
  const composite = Object.values(demoScores).reduce((a, b) => a + b, 0);

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">Votre diagnostic de marque</h1>

      <div className="mt-8 space-y-6">
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-sm font-medium text-muted-foreground">Score ADVE-RTIS</h2>
          <ScoreBadge score={composite} size="lg" className="mt-2" />
          <p className="mt-4 text-sm text-muted-foreground">
            Confidence: 0.45 — Ce score est une estimation basée sur le Quick Intake.
            Un diagnostic complet via IMPULSION affinera ces résultats.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Radar 8 piliers</h3>
          <AdvertisRadar scores={demoScores} className="flex justify-center" />
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Diagnostic</h3>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium text-green-700">Forces</h4>
              <p className="text-muted-foreground">Valeur (V) et Authenticité (A) — votre proposition de valeur et votre identité sont bien définies.</p>
            </div>
            <div>
              <h4 className="font-medium text-red-700">Axes d'amélioration</h4>
              <p className="text-muted-foreground">Engagement (E) et Implementation (I) — la stratégie d'engagement et la mise en oeuvre opérationnelle nécessitent un renforcement.</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-700">Recommandation</h4>
              <p className="text-muted-foreground">Un accompagnement IMPULSION permettrait de structurer votre Devotion Ladder et d'activer vos Drivers prioritaires.</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a href="mailto:alexandre@upgraders.com" className="inline-block rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground">
            Passer à IMPULSION
          </a>
          <p className="mt-2 text-xs text-muted-foreground">Lien partageable: /intake/{token}/result</p>
        </div>
      </div>
    </main>
  );
}
