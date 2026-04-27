"use client";

import { useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { PILLAR_NAMES, type PillarKey } from "@/lib/types/advertis-vector";

const STEP_LABELS: Record<string, { tag: string; headline: string }> = {
  biz: { tag: "Contexte", headline: "Parlons de votre activité" },
  a: { tag: `A — ${PILLAR_NAMES.a}`, headline: "Qui êtes-vous vraiment ?" },
  d: { tag: `D — ${PILLAR_NAMES.d}`, headline: "Pourquoi vous et pas un autre ?" },
  v: { tag: `V — ${PILLAR_NAMES.v}`, headline: "Que promettez-vous au monde ?" },
  e: { tag: `E — ${PILLAR_NAMES.e}`, headline: "Comment créer la dévotion ?" },
  r: { tag: `R — ${PILLAR_NAMES.r}`, headline: "Quels sont vos angles morts ?" },
  t: { tag: `T — ${PILLAR_NAMES.t}`, headline: "Comment mesurez-vous le succès ?" },
  i: { tag: `I — ${PILLAR_NAMES.i}`, headline: "De la stratégie à l'action" },
  s: { tag: `S — ${PILLAR_NAMES.s}`, headline: "Comment assembler le tout ?" },
};

interface Question {
  id: string;
  pillar: string;
  question: string;
  type: "text" | "select" | "multiselect" | "scale";
  options?: string[];
  required: boolean;
}

export default function IntakeQuestionnaire({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [error, setError] = useState("");

  const { data: intake, isLoading: intakeLoading } = trpc.quickIntake.getByToken.useQuery(
    { token },
    { retry: false }
  );

  const { data: state, isLoading: stateLoading, refetch: refetchState } = trpc.quickIntake.getState.useQuery(
    { token },
    { retry: false }
  );

  const advanceMutation = trpc.quickIntake.advance.useMutation({
    onSuccess: (result) => {
      setResponses({});
      if (result.readyToComplete) {
        completeMutation.mutate({ token });
      } else {
        refetchState();
      }
    },
    onError: (err) => setError(err.message),
  });

  const completeMutation = trpc.quickIntake.complete.useMutation({
    onSuccess: () => {
      router.push(`/intake/${token}/result`);
    },
    onError: (err) => setError(err.message),
  });

  const setField = useCallback((id: string, value: unknown) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  }, []);

  if (intakeLoading || stateLoading) {
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

  if (intake.status === "COMPLETED" || intake.status === "CONVERTED" || state?.completed) {
    router.push(`/intake/${token}/result`);
    return null;
  }

  if (!state || !state.currentPillar) {
    completeMutation.mutate({ token });
    return (
      <main className="mx-auto max-w-2xl p-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="ml-3 text-sm text-muted-foreground">Calcul de votre score...</span>
        </div>
      </main>
    );
  }

  const step = state.currentPillar;
  const questions = (state.questions ?? []) as Question[];
  const stepInfo = STEP_LABELS[step] ?? { tag: step.toUpperCase(), headline: "" };
  const progress = (state.progress ?? 0) * 100;

  const requiredFilled = questions
    .filter((q) => q.required)
    .every((q) => {
      const val = responses[q.id];
      if (val === undefined || val === null || val === "") return false;
      if (Array.isArray(val) && val.length === 0) return false;
      return true;
    });

  const handleNext = () => {
    setError("");
    advanceMutation.mutate({ token, responses });
  };

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-sm text-muted-foreground">
          <span>{stepInfo.tag}</span>
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
          {stepInfo.tag}
        </span>
        <h1 className="mt-2 text-2xl font-bold">{stepInfo.headline}</h1>
      </div>

      <div className="space-y-6">
        {questions.map((q) => (
          <QuestionField key={q.id} question={q} value={responses[q.id]} onChange={setField} />
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNext}
          disabled={!requiredFilled || advanceMutation.isPending || completeMutation.isPending}
          className="rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {advanceMutation.isPending || completeMutation.isPending
            ? "Traitement..."
            : "Suivant"}
        </button>
      </div>
    </main>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: unknown;
  onChange: (id: string, value: unknown) => void;
}) {
  const q = question;

  if (q.type === "text") {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          {q.question}
          {q.required && <span className="ml-1 text-destructive">*</span>}
        </label>
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(q.id, e.target.value)}
          rows={3}
          className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          placeholder="Votre réponse..."
        />
      </div>
    );
  }

  if (q.type === "select") {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          {q.question}
          {q.required && <span className="ml-1 text-destructive">*</span>}
        </label>
        <select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(q.id, e.target.value)}
          className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">Sélectionnez...</option>
          {(q.options ?? []).map((opt) => {
            const label = opt.includes("::") ? opt.split("::")[1] : opt;
            return (
              <option key={opt} value={opt}>
                {label}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  if (q.type === "multiselect") {
    const selected = Array.isArray(value) ? (value as string[]) : [];
    const toggle = (opt: string) => {
      const next = selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt];
      onChange(q.id, next);
    };
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          {q.question}
          {q.required && <span className="ml-1 text-destructive">*</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {(q.options ?? []).map((opt) => {
            const label = opt.includes("::") ? opt.split("::")[1] : opt;
            const isSelected = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "border-muted-foreground/30 text-muted-foreground hover:border-primary/50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (q.type === "scale") {
    const numVal = typeof value === "number" ? value : 0;
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          {q.question}
          {q.required && <span className="ml-1 text-destructive">*</span>}
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(q.id, n)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                numVal === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30 text-muted-foreground hover:border-primary/50"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
