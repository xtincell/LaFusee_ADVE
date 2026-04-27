"use client";

import { use, useEffect, useState, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import { type PillarKey } from "@/lib/types/advertis-vector";
import { PillarMap, type PillarMapItem } from "@/components/shared/pillar-map";
import { LEVEL_LABEL } from "@/lib/utils/pillar-validation";
import type { BootState } from "@/server/services/boot-sequence";
import type { PillarStep } from "@/server/services/artemis-sequencer";
import type { PackQuestion } from "@/server/services/boot-sequence/question-packs";

export default function BootSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const [activePillar, setActivePillar] = useState<PillarKey | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [confidence, setConfidence] = useState<number>(0.7);
  const [error, setError] = useState<string | null>(null);

  const stateQuery = trpc.bootSequence.getState.useQuery({ strategyId: sessionId });
  const packQuery = trpc.bootSequence.getQuestionPack.useQuery(
    { pillar: activePillar! },
    { enabled: !!activePillar }
  );
  const advanceMutation = trpc.bootSequence.advance.useMutation({
    onSuccess: () => {
      void stateQuery.refetch();
      setDraft({});
      setError(null);
    },
    onError: (e) => setError(e.message),
  });
  const skipMutation = trpc.bootSequence.skip.useMutation({
    onSuccess: () => void stateQuery.refetch(),
  });
  const completeMutation = trpc.bootSequence.complete.useMutation({
    onSuccess: () => void stateQuery.refetch(),
  });

  // Auto-select recommended pillar on first load
  useEffect(() => {
    if (!activePillar && stateQuery.data?.recommendedNextPillar) {
      setActivePillar(stateQuery.data.recommendedNextPillar);
    }
  }, [stateQuery.data?.recommendedNextPillar, activePillar]);

  const state = stateQuery.data as BootState | undefined;
  const activeStep = useMemo(
    () => state?.steps.find((s: PillarStep) => s.pillar === activePillar) ?? null,
    [state, activePillar]
  );

  if (stateQuery.isLoading) {
    return (
      <div className="p-8 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!state) {
    return <div className="p-8 text-destructive">Session introuvable</div>;
  }

  const mapItems: PillarMapItem[] = state.steps.map((s: PillarStep) => ({
    pillar: s.pillar,
    pillarName: s.pillarName,
    status: s.status,
    projectedScore: s.validation.projectedScore,
    atomsRatio: s.validation.atomsRatio,
    weight: s.weight,
    isRecommended: s.pillar === state.recommendedNextPillar,
  }));

  const handleSubmit = () => {
    if (!activePillar) return;
    advanceMutation.mutate({
      strategyId: sessionId,
      pillar: activePillar,
      patch: draft,
      confidence,
    });
  };

  const handleComplete = () => {
    completeMutation.mutate({ strategyId: sessionId });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 sm:p-8">
      {/* HEADER */}
      <header className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl font-bold">Boot Sequence ARTEMIS</h1>
          <span className="text-sm text-muted-foreground">{state.brandName ?? "—"}</span>
        </div>
        <ProgressHeader state={state} />
      </header>

      {/* RECOMMANDATION ARTEMIS */}
      <RationaleCard state={state} />

      {/* CARTE DES PILIERS */}
      <PillarMap items={mapItems} onSelect={setActivePillar} activePillar={activePillar} />

      {/* PANEL ACTIF */}
      {activeStep && (
        <ActivePillarPanel
          step={activeStep}
          questions={packQuery.data?.questions ?? []}
          draft={draft}
          setDraft={setDraft}
          confidence={confidence}
          setConfidence={setConfidence}
          onSubmit={handleSubmit}
          onSkip={() => skipMutation.mutate({ strategyId: sessionId, pillar: activeStep.pillar })}
          submitting={advanceMutation.isPending}
          error={error}
        />
      )}

      {/* CTA TERMINER (visible quand >= 4 piliers cohérents) */}
      {state.validatedCount + state.startedCount >= 4 && (
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Prêt pour le scoring final ?</h3>
              <p className="text-sm text-muted-foreground">
                {state.validatedCount}/8 piliers validés. Le scoring ADVE-RTIS calculera le composite et la classification.
              </p>
            </div>
            <button
              onClick={handleComplete}
              disabled={completeMutation.isPending}
              className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {completeMutation.isPending ? "Calcul..." : "Lancer le scoring final"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressHeader({ state }: { state: BootState }) {
  const pct = Math.round(state.globalProgress * 100);
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-muted-foreground">
          {state.validatedCount} validés · {state.startedCount} en cours · {state.pendingCount} restants
        </span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Cycle restant estimé : ~{state.cycleTotalMin} min · Score projeté : {(state.globalProgress * 200).toFixed(0)}/200
      </p>
    </div>
  );
}

function RationaleCard({ state }: { state: BootState }) {
  return (
    <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold uppercase text-primary-foreground">ARTEMIS</span>
        <span className="text-sm font-medium">Recommandation conditionnelle</span>
      </div>
      <p className="text-sm leading-relaxed">{state.recommendedReason}</p>
      {state.hasBusinessContext && (
        <p className="mt-2 text-xs text-muted-foreground">
          Pondération adaptée à votre business model et positionnement.
        </p>
      )}
    </div>
  );
}

interface ActivePanelProps {
  step: PillarStep;
  questions: PackQuestion[];
  draft: Record<string, unknown>;
  setDraft: (d: Record<string, unknown>) => void;
  confidence: number;
  setConfidence: (c: number) => void;
  onSubmit: () => void;
  onSkip: () => void;
  submitting: boolean;
  error: string | null;
}

function ActivePillarPanel({
  step,
  questions,
  draft,
  setDraft,
  confidence,
  setConfidence,
  onSubmit,
  onSkip,
  submitting,
  error,
}: ActivePanelProps) {
  const v = step.validation;
  const filledIds = Object.keys(((draft as Record<string, unknown>) ?? {})).filter((k) => isNonEmpty(draft[k]));
  const requiredQuestions = questions.filter((q) => q.required);
  const requiredAnswered = requiredQuestions.filter((q) => isNonEmpty(draft[q.id]));
  const canSubmit = requiredQuestions.length === 0 || requiredAnswered.length === requiredQuestions.length;

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {step.pillar.toUpperCase()} — {step.pillarName}
          </span>
          <p className="mt-2 text-sm text-muted-foreground">{step.rationale}</p>
        </div>
        <ValidationBadge step={step} />
      </div>

      {/* Validation breakdown */}
      <div className="mb-5 grid grid-cols-3 gap-3 rounded-lg bg-muted/50 p-3 text-xs">
        <Stat label="Atomes" value={`${v.atomsFilled}/${v.atomsRequired}`} pct={v.atomsRatio} />
        <Stat label="Collections" value={`${(v.collectionsRatio * 100).toFixed(0)}%`} pct={v.collectionsRatio} />
        <Stat label="Liens" value={`${(v.crossRefsRatio * 100).toFixed(0)}%`} pct={v.crossRefsRatio} />
      </div>

      {step.validation.gaps.length > 0 && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <p className="mb-1 font-semibold">Gaps actuels</p>
          <ul className="list-disc space-y-0.5 pl-4">
            {step.validation.gaps.map((g) => (<li key={g}>{g}</li>))}
          </ul>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q) => (
          <QuestionField
            key={q.id}
            question={q}
            value={draft[q.id]}
            onChange={(v) => setDraft({ ...draft, [q.id]: v })}
          />
        ))}

        {questions.length === 0 && (
          <p className="text-sm text-muted-foreground">Chargement des questions…</p>
        )}

        {/* Confidence slider */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium">
            Confidence qualitative : <span className="font-bold">{(confidence * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={confidence * 100}
            onChange={(e) => setConfidence(Number(e.target.value) / 100)}
            className="mt-1 w-full"
          />
          <p className="text-xs text-muted-foreground">
            À quel point êtes-vous sûr de la qualité de ces réponses ?
          </p>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={onSkip}
          className="text-sm text-muted-foreground underline-offset-2 hover:underline"
        >
          Passer ce pilier pour l'instant
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{filledIds.length}/{questions.length} réponses</span>
          <button
            onClick={onSubmit}
            disabled={!canSubmit || submitting || filledIds.length === 0}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {submitting ? "Enregistrement…" : "Enregistrer ce pilier"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ValidationBadge({ step }: { step: PillarStep }) {
  const colors: Record<string, string> = {
    VALIDATED: "bg-emerald-100 text-emerald-900",
    IN_PROGRESS: "bg-amber-100 text-amber-900",
    TO_DO: "bg-slate-100 text-slate-700",
    BLOCKED: "bg-zinc-100 text-zinc-500",
  };
  return (
    <div className="text-right">
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[step.status] ?? colors.TO_DO}`}>
        {LEVEL_LABEL[step.validation.level as keyof typeof LEVEL_LABEL]}
      </span>
      <p className="mt-1 text-xs text-muted-foreground">{step.validation.projectedScore.toFixed(1)}/25</p>
    </div>
  );
}

function Stat({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(100, pct * 100)}%` }}
        />
      </div>
    </div>
  );
}

interface QuestionFieldProps {
  question: PackQuestion;
  value: unknown;
  onChange: (v: unknown) => void;
}

function QuestionField({ question, value, onChange }: QuestionFieldProps) {
  const labelEl = (
    <label className="flex items-center gap-2 text-sm font-medium">
      {question.label}
      {question.required && <span className="text-destructive">*</span>}
      {question.weight === "key" && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">CLÉ</span>}
    </label>
  );

  if (question.type === "text") {
    return (
      <div className="space-y-1">
        {labelEl}
        {question.helper && <p className="text-xs text-muted-foreground">{question.helper}</p>}
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>
    );
  }

  if (question.type === "text_short") {
    return (
      <div className="space-y-1">
        {labelEl}
        {question.helper && <p className="text-xs text-muted-foreground">{question.helper}</p>}
        <input
          type="text"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>
    );
  }

  if (question.type === "select") {
    return (
      <div className="space-y-1">
        {labelEl}
        {question.helper && <p className="text-xs text-muted-foreground">{question.helper}</p>}
        <select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="">— Choisir —</option>
          {question.options?.map((o) => (<option key={o} value={o}>{o}</option>))}
        </select>
      </div>
    );
  }

  if (question.type === "multiselect") {
    const list = (value as string[]) ?? [];
    return (
      <div className="space-y-1">
        {labelEl}
        {question.helper && <p className="text-xs text-muted-foreground">{question.helper}</p>}
        <ChipsInput value={list} onChange={(v) => onChange(v)} options={question.options} />
      </div>
    );
  }

  if (question.type === "scale") {
    const num = (value as number) ?? 5;
    return (
      <div className="space-y-1">
        {labelEl}
        {question.helper && <p className="text-xs text-muted-foreground">{question.helper}</p>}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={10}
            value={num}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-10 text-center text-sm font-semibold">{num}/10</span>
        </div>
      </div>
    );
  }

  return null;
}

function ChipsInput({ value, onChange, options }: { value: string[]; onChange: (v: string[]) => void; options?: string[] }) {
  const [text, setText] = useState("");

  const add = (v: string) => {
    const trimmed = v.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
  };

  return (
    <div className="rounded-lg border px-3 py-2">
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {value.map((v) => (
            <span key={v} className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {v}
              <button onClick={() => onChange(value.filter((x) => x !== v))} className="text-primary/70 hover:text-primary" type="button">×</button>
            </span>
          ))}
        </div>
      )}
      {options ? (
        <div className="flex flex-wrap gap-1">
          {options.filter((o) => !value.includes(o)).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => add(o)}
              className="rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary"
            >
              + {o}
            </button>
          ))}
        </div>
      ) : (
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(text);
              setText("");
            }
          }}
          placeholder="Tapez puis Entrée…"
          className="w-full bg-transparent text-sm outline-none"
        />
      )}
    </div>
  );
}

function isNonEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}
