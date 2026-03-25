"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { PILLAR_NAMES, type PillarKey } from "@/lib/types/advertis-vector";

const PILLAR_ORDER: PillarKey[] = ["a", "d", "v", "e", "r", "t", "i", "s"];

const PILLAR_QUESTIONS: Record<PillarKey, string[]> = {
  a: [
    "Quelle est l'histoire fondatrice de votre marque ?",
    "Quelle est votre mission en une phrase ?",
    "Quelles valeurs guident vos décisions au quotidien ?",
  ],
  d: [
    "Qu'est-ce qui vous différencie de vos concurrents ?",
    "Comment décririez-vous votre identité visuelle ?",
    "Quel ton de voix utilisez-vous dans vos communications ?",
  ],
  v: [
    "Quelle promesse faites-vous à vos clients ?",
    "Quels sont vos produits/services phares ?",
    "Comment décrivez-vous l'expérience que vos clients vivent ?",
  ],
  e: [
    "Comment vos clients interagissent-ils avec votre marque ?",
    "Avez-vous une communauté active autour de votre marque ?",
    "Quels canaux utilisez-vous pour engager votre audience ?",
  ],
  r: [
    "Quels risques majeurs pèsent sur votre marque ?",
    "Avez-vous un plan de gestion de crise ?",
    "Comment gérez-vous les retours négatifs ?",
  ],
  t: [
    "Comment mesurez-vous le succès de votre marque ?",
    "Quels KPIs suivez-vous régulièrement ?",
    "Avez-vous une validation marché de votre proposition ?",
  ],
  i: [
    "Avez-vous une roadmap stratégique formalisée ?",
    "Comment est structurée votre équipe marketing ?",
    "Quel est votre budget communication annuel approximatif ?",
  ],
  s: [
    "Avez-vous un document de guidelines de marque ?",
    "Votre stratégie de marque est-elle documentée ?",
    "Comment assurez-vous la cohérence entre vos différents canaux ?",
  ],
};

const PILLAR_HEADLINE: Record<PillarKey, string> = {
  a: "Qui êtes-vous vraiment ?",
  d: "Pourquoi vous et pas un autre ?",
  v: "Que promettez-vous au monde ?",
  e: "Comment créer la dévotion ?",
  r: "Quels sont vos angles morts ?",
  t: "Comment mesurez-vous le succès ?",
  i: "De la stratégie à l'action ?",
  s: "Comment assembler le tout ?",
};

export default function IntakeQuestionnaire({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [currentPillar, setCurrentPillar] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const { data: intake, isLoading } = trpc.quickIntake.getByToken.useQuery(
    { token },
    { retry: false }
  );

  const advanceMutation = trpc.quickIntake.advance.useMutation();
  const completeMutation = trpc.quickIntake.complete.useMutation({
    onSuccess: () => {
      router.push(`/intake/${token}/result`);
    },
    onError: (err) => setError(err.message),
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </main>
    );
  }

  if (!intake) {
    return (
      <main className="mx-auto max-w-2xl p-8 text-center">
        <h1 className="text-2xl font-bold text-destructive">Diagnostic introuvable</h1>
        <p className="mt-2 text-muted-foreground">Ce lien est invalide ou a expiré.</p>
      </main>
    );
  }

  if (intake.status === "COMPLETED" || intake.status === "CONVERTED") {
    router.push(`/intake/${token}/result`);
    return null;
  }

  const pillar = PILLAR_ORDER[currentPillar]!;
  const questions = PILLAR_QUESTIONS[pillar];
  const progress = ((currentPillar + 1) / 8) * 100;
  const allAnswered = questions.every((_, i) => responses[`q${i}`]?.trim());

  const handleNext = async () => {
    await advanceMutation.mutateAsync({
      token,
      responses: { [pillar]: responses },
    });

    if (currentPillar < 7) {
      setCurrentPillar(currentPillar + 1);
      setResponses({});
    } else {
      completeMutation.mutate({ token });
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-sm text-muted-foreground">
          <span>Pilier {currentPillar + 1}/8</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          {pillar.toUpperCase()} — {PILLAR_NAMES[pillar]}
        </span>
        <h1 className="mt-2 text-2xl font-bold">{PILLAR_HEADLINE[pillar]}</h1>
      </div>

      <div className="space-y-6">
        {questions.map((question, i) => (
          <div key={i} className="space-y-2">
            <label className="block text-sm font-medium">{question}</label>
            <textarea
              value={responses[`q${i}`] ?? ""}
              onChange={(e) => setResponses({ ...responses, [`q${i}`]: e.target.value })}
              rows={3}
              className="w-full rounded-lg border px-4 py-3 text-sm"
              placeholder="Votre réponse..."
            />
          </div>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => currentPillar > 0 && setCurrentPillar(currentPillar - 1)}
          disabled={currentPillar === 0}
          className="rounded-lg border px-6 py-3 text-sm font-medium disabled:opacity-30"
        >
          Précédent
        </button>
        <button
          onClick={handleNext}
          disabled={!allAnswered || advanceMutation.isPending || completeMutation.isPending}
          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {completeMutation.isPending
            ? "Calcul du score..."
            : currentPillar < 7
              ? "Suivant"
              : "Voir mon score"}
        </button>
      </div>
    </main>
  );
}
