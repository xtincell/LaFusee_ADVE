// ============================================================================
// MODULE M35 — Quick Intake Portal: Questionnaire
// Score: 92/100 | Priority: P0 | Status: FUNCTIONAL
// Spec: §5.2 | Division: L'Oracle
// ============================================================================
//
// CdC REQUIREMENTS (V1):
// [x] REQ-1  AI-guided adaptive questionnaire (server-driven questions via getQuestions)
// [x] REQ-2  Business context phase before ADVE pillars (biz → A → D → V → E → R → T → I → S)
// [x] REQ-3  Progress persistence (resume mid-session from DB state)
// [x] REQ-4  Pillar navigation with visual progress indicators
// [x] REQ-5  Mobile-first responsive design (one question at a time on mobile, all on desktop)
// [x] REQ-6  Supports text, select, multiselect, scale question types
// [x] REQ-7  CTA "Voir mon score" triggers completion + scoring
// [ ] REQ-8  Mestor conversational guidance (AI tone in question phrasing — partial via AI follow-ups)
// [ ] REQ-9  Voice input option for mobile users
//
// ROUTE: /intake/[token]
// ============================================================================

"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { PILLAR_NAMES, type PillarKey } from "@/lib/types/advertis-vector";

// Phase order: business context first, then 8 ADVE pillars
const PHASE_ORDER = ["biz", "a", "d", "v", "e", "r", "t", "i", "s"] as const;
type Phase = (typeof PHASE_ORDER)[number];

const PHASE_HEADLINE: Record<string, string> = {
  biz: "Parlons de votre business",
  a: "Qui etes-vous vraiment ?",
  d: "Pourquoi vous et pas un autre ?",
  v: "Que promettez-vous au monde ?",
  e: "Comment creer la devotion ?",
  r: "Quels sont vos angles morts ?",
  t: "Comment mesurez-vous le succes ?",
  i: "De la strategie a l'action ?",
  s: "Comment assembler le tout ?",
};

const PHASE_LABEL: Record<string, string> = {
  biz: "Contexte Business",
  a: PILLAR_NAMES.a,
  d: PILLAR_NAMES.d,
  v: PILLAR_NAMES.v,
  e: PILLAR_NAMES.e,
  r: PILLAR_NAMES.r,
  t: PILLAR_NAMES.t,
  i: PILLAR_NAMES.i,
  s: PILLAR_NAMES.s,
};

const PILLAR_COLORS: Record<string, string> = {
  biz: "var(--color-primary)",
  a: "var(--color-pillar-a)",
  d: "var(--color-pillar-d)",
  v: "var(--color-pillar-v)",
  e: "var(--color-pillar-e)",
  r: "var(--color-pillar-r)",
  t: "var(--color-pillar-t)",
  i: "var(--color-pillar-i)",
  s: "var(--color-pillar-s)",
};

interface IntakeQuestion {
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
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [questions, setQuestions] = useState<IntakeQuestion[]>([]);
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Fetch intake data
  const { data: intake, isLoading } = trpc.quickIntake.getByToken.useQuery(
    { token },
    { enabled: !!token, retry: 2 }
  );

  // Fetch adaptive questions for current phase
  const currentPhase = PHASE_ORDER[currentPhaseIndex]!;
  const questionsQuery = trpc.quickIntake.getQuestions.useQuery(
    { token, pillar: currentPhase },
    { enabled: !!token && initialized, staleTime: 30_000 }
  );

  const utils = trpc.useUtils();
  const advanceMutation = trpc.quickIntake.advance.useMutation();
  const completeMutation = trpc.quickIntake.complete.useMutation({
    onSuccess: () => {
      utils.quickIntake.getByToken.invalidate({ token });
      router.push(`/intake/${token}/result`);
    },
    onError: (err) => setError(err.message),
  });

  // Update questions when server data changes
  useEffect(() => {
    if (questionsQuery.data?.questions) {
      setQuestions(questionsQuery.data.questions);
      setLoadingQuestions(false);
    }
  }, [questionsQuery.data]);

  // Initialize: restore progress from DB
  useEffect(() => {
    if (!intake || initialized) return;

    if (intake.status === "COMPLETED" || intake.status === "CONVERTED") {
      router.push(`/intake/${token}/result`);
      return;
    }

    const savedResponses = (intake.responses as Record<string, Record<string, unknown>>) ?? {};

    // Find first unanswered phase
    const answeredPhases = new Set(Object.keys(savedResponses));
    const firstUnanswered = PHASE_ORDER.findIndex((p) => !answeredPhases.has(p));

    if (firstUnanswered === -1) {
      // All phases answered — position at last phase
      setCurrentPhaseIndex(PHASE_ORDER.length - 1);
      const lastPhase = PHASE_ORDER[PHASE_ORDER.length - 1]!;
      setResponses(savedResponses[lastPhase] ?? {});
    } else {
      setCurrentPhaseIndex(firstUnanswered);
      const phaseKey = PHASE_ORDER[firstUnanswered]!;
      setResponses(savedResponses[phaseKey] ?? {});
    }

    setInitialized(true);
  }, [intake, initialized, router, token]);

  // Check if all phases answered
  const savedResponses = (intake?.responses as Record<string, Record<string, unknown>>) ?? {};
  const allPhasesAnswered = PHASE_ORDER.every(
    (p) => savedResponses[p] && Object.keys(savedResponses[p]!).length > 0
  );

  const phaseColor = PILLAR_COLORS[currentPhase] ?? "var(--color-primary)";
  const totalPhases = PHASE_ORDER.length;
  const overallProgress = allPhasesAnswered
    ? 100
    : ((currentPhaseIndex + (currentQuestionIndex / Math.max(questions.length, 1))) / totalPhases) * 100;

  // Response handlers for different question types
  const setResponse = useCallback((questionId: string, value: unknown) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const getResponse = (questionId: string): unknown => responses[questionId];

  // Check if current question is answered
  const isCurrentQuestionAnswered = (): boolean => {
    const q = questions[currentQuestionIndex];
    if (!q) return false;
    const val = getResponse(q.id);
    if (!q.required) return true;
    if (typeof val === "string") return val.trim().length > 0;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === "number") return true;
    return val != null && val !== "";
  };

  // Check if all required questions in current phase are answered
  const allRequiredAnswered = questions.every((q) => {
    if (!q.required) return true;
    const val = getResponse(q.id);
    if (typeof val === "string") return val.trim().length > 0;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === "number") return true;
    return val != null && val !== "";
  });

  // Save current phase and move to next
  const saveAndAdvance = async (nextPhaseIndex: number) => {
    setError("");
    try {
      await advanceMutation.mutateAsync({
        token,
        responses: { [currentPhase]: responses },
      });

      // Invalidate questions cache for new phase
      if (nextPhaseIndex < PHASE_ORDER.length) {
        const nextPhase = PHASE_ORDER[nextPhaseIndex]!;
        setLoadingQuestions(true);
        setCurrentPhaseIndex(nextPhaseIndex);
        setCurrentQuestionIndex(0);
        // Load saved responses for next phase
        setResponses(savedResponses[nextPhase] ?? {});
        // Refetch questions for the new phase
        utils.quickIntake.getQuestions.invalidate({ token, pillar: nextPhase });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de sauvegarde");
    }
  };

  const handleComplete = async () => {
    setError("");
    try {
      // Save current phase first if needed
      if (!allPhasesAnswered) {
        await advanceMutation.mutateAsync({
          token,
          responses: { [currentPhase]: responses },
        });
      }
      completeMutation.mutate({ token });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  // Mobile: one question at a time navigation
  const handleMobileNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentPhaseIndex < PHASE_ORDER.length - 1) {
      await saveAndAdvance(currentPhaseIndex + 1);
    } else {
      await handleComplete();
    }
  };

  const handleMobilePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentPhaseIndex > 0) {
      const prevPhase = PHASE_ORDER[currentPhaseIndex - 1]!;
      setResponses(savedResponses[prevPhase] ?? {});
      setCurrentPhaseIndex(currentPhaseIndex - 1);
      setCurrentQuestionIndex(0);
      utils.quickIntake.getQuestions.invalidate({ token, pillar: prevPhase });
    }
  };

  // Desktop: all questions visible, navigate by phase
  const handleDesktopNext = async () => {
    if (currentPhaseIndex < PHASE_ORDER.length - 1) {
      await saveAndAdvance(currentPhaseIndex + 1);
    } else {
      await handleComplete();
    }
  };

  const handleDesktopPrev = () => {
    if (currentPhaseIndex > 0) {
      const prevPhase = PHASE_ORDER[currentPhaseIndex - 1]!;
      setResponses(savedResponses[prevPhase] ?? {});
      setCurrentPhaseIndex(currentPhaseIndex - 1);
      setCurrentQuestionIndex(0);
      utils.quickIntake.getQuestions.invalidate({ token, pillar: prevPhase });
    }
  };

  // Loading state
  if (isLoading || !initialized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </main>
    );
  }

  if (!intake) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5">
        <h1 className="text-2xl font-bold text-destructive">Diagnostic introuvable</h1>
        <p className="mt-2 text-foreground-muted">Ce lien est invalide ou a expire.</p>
      </main>
    );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Progress bar — sticky top */}
      <div className="sticky top-0 z-10 bg-background/95 px-5 pb-3 pt-4 backdrop-blur-sm sm:px-8">
        <div className="flex justify-between text-xs text-foreground-muted">
          <span>
            {currentPhase === "biz"
              ? "Contexte"
              : `Pilier ${currentPhaseIndex}/${totalPhases - 1}`}
          </span>
          <span>{Math.round(overallProgress)}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-background-overlay">
          <div
            className="h-full rounded-full transition-all duration-slow ease-out"
            style={{ width: `${overallProgress}%`, backgroundColor: phaseColor }}
          />
        </div>
        {/* Phase dots for quick navigation */}
        <div className="mt-2 flex justify-center gap-1.5">
          {PHASE_ORDER.map((p, i) => {
            const isAnswered = savedResponses[p] && Object.keys(savedResponses[p]!).length > 0;
            const isCurrent = i === currentPhaseIndex;
            return (
              <button
                key={p}
                onClick={() => {
                  setResponses(savedResponses[p] ?? {});
                  setCurrentPhaseIndex(i);
                  setCurrentQuestionIndex(0);
                  utils.quickIntake.getQuestions.invalidate({ token, pillar: p });
                }}
                className={`h-2 rounded-full transition-all ${isCurrent ? "w-6" : "w-2"}`}
                style={{
                  backgroundColor: isCurrent
                    ? phaseColor
                    : isAnswered
                      ? `color-mix(in oklch, ${PILLAR_COLORS[p] ?? "var(--color-primary)"} 50%, transparent)`
                      : "var(--color-border-subtle)",
                }}
                aria-label={`${p === "biz" ? "Contexte Business" : `Pilier ${p.toUpperCase()} — ${PILLAR_NAMES[p as PillarKey]}`}`}
              />
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-6 sm:px-8">
        {/* Phase watermark (mobile) */}
        <div
          className="pointer-events-none fixed right-4 top-20 select-none text-[120px] font-black leading-none opacity-[0.03] sm:hidden"
          style={{ color: phaseColor }}
        >
          {currentPhase === "biz" ? "?" : currentPhase.toUpperCase()}
        </div>

        {/* Phase header */}
        <div className="mb-6">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold"
            style={{
              backgroundColor: `color-mix(in oklch, ${phaseColor} 15%, transparent)`,
              color: phaseColor,
            }}
          >
            {currentPhase === "biz"
              ? "Contexte Business"
              : `${currentPhase.toUpperCase()} — ${PHASE_LABEL[currentPhase]}`}
          </span>
          <h1 className="mt-3 text-xl font-bold text-foreground sm:text-2xl">
            {PHASE_HEADLINE[currentPhase]}
          </h1>
          {currentPhase === "biz" && (
            <p className="mt-2 text-sm text-foreground-muted">
              Ces informations nous aident a calibrer les questions suivantes selon votre secteur et modele.
            </p>
          )}
        </div>

        {/* Loading questions indicator */}
        {(loadingQuestions || questionsQuery.isLoading) && questions.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" />
            <p className="text-sm text-foreground-muted">
              Preparation des questions adaptees...
            </p>
          </div>
        ) : (
          <>
            {/* Desktop: all questions visible */}
            <div className="hidden space-y-6 sm:block">
              {questions.map((q) => (
                <QuestionField
                  key={q.id}
                  question={q}
                  value={getResponse(q.id)}
                  onChange={(val) => setResponse(q.id, val)}
                  phaseColor={phaseColor}
                />
              ))}
              {/* AI follow-up indicator */}
              {questions.some((q) => q.id.includes("_ai_")) && (
                <p className="text-xs text-foreground-muted italic">
                  * Questions complementaires generees par l'IA pour approfondir votre profil.
                </p>
              )}
            </div>

            {/* Mobile: one question at a time */}
            <div className="flex flex-1 flex-col sm:hidden">
              {currentQ && (
                <>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-foreground-muted">
                    Question {currentQuestionIndex + 1}/{questions.length}
                    {currentQ.id.includes("_ai_") && " · IA"}
                  </p>
                  <QuestionField
                    question={currentQ}
                    value={getResponse(currentQ.id)}
                    onChange={(val) => setResponse(currentQ.id, val)}
                    phaseColor={phaseColor}
                    mobile
                  />
                </>
              )}
            </div>
          </>
        )}

        {error && (
          <div className="mt-4 rounded-lg bg-destructive-subtle/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      {/* Navigation — sticky bottom on mobile */}
      <div className="sticky bottom-0 border-t border-border-subtle bg-background/95 px-5 py-4 backdrop-blur-sm sm:static sm:border-0 sm:bg-transparent sm:px-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          {/* Desktop nav */}
          <div className="hidden sm:flex sm:w-full sm:justify-between">
            <button
              onClick={handleDesktopPrev}
              disabled={currentPhaseIndex === 0}
              className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-background-overlay disabled:opacity-30"
            >
              Precedent
            </button>
            <button
              onClick={handleDesktopNext}
              disabled={!allRequiredAnswered || advanceMutation.isPending || completeMutation.isPending}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {completeMutation.isPending
                ? "Calcul du score..."
                : currentPhaseIndex < PHASE_ORDER.length - 1
                  ? "Suivant"
                  : "Voir mon score"}
            </button>
          </div>

          {/* Mobile nav */}
          <div className="flex w-full items-center justify-between sm:hidden">
            <button
              onClick={handleMobilePrev}
              disabled={currentPhaseIndex === 0 && currentQuestionIndex === 0}
              className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-foreground disabled:opacity-30"
            >
              Prec.
            </button>
            <span className="text-xs text-foreground-muted">
              {currentPhaseIndex * (questions.length || 3) + currentQuestionIndex + 1}/
              {PHASE_ORDER.length * (questions.length || 3)}
            </span>
            <button
              onClick={handleMobileNext}
              disabled={
                (currentQ?.required && !isCurrentQuestionAnswered()) ||
                advanceMutation.isPending ||
                completeMutation.isPending
              }
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {completeMutation.isPending
                ? "Calcul..."
                : currentPhaseIndex === PHASE_ORDER.length - 1 &&
                    currentQuestionIndex === questions.length - 1
                  ? "Score"
                  : "Suivant"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QuestionField — renders the appropriate input for each question type
// ─────────────────────────────────────────────────────────────────────────────

interface QuestionFieldProps {
  question: IntakeQuestion;
  value: unknown;
  onChange: (value: unknown) => void;
  phaseColor: string;
  mobile?: boolean;
}

function QuestionField({ question, value, onChange, phaseColor, mobile }: QuestionFieldProps) {
  const inputClass =
    "w-full rounded-xl border border-border bg-background-raised px-4 py-3 text-base text-foreground outline-none transition-colors placeholder:text-foreground-muted focus:border-primary focus:ring-1 focus:ring-primary";

  switch (question.type) {
    case "text":
      return (
        <div className={mobile ? "flex flex-1 flex-col" : ""}>
          {!mobile && (
            <label className="mb-2 block text-sm font-medium text-foreground">
              {question.question}
              {question.required && <span className="text-destructive"> *</span>}
            </label>
          )}
          {mobile && (
            <label className="mb-4 block text-base font-medium leading-relaxed text-foreground">
              {question.question}
              {question.required && <span className="text-destructive"> *</span>}
            </label>
          )}
          <textarea
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            rows={mobile ? 5 : 3}
            className={`${inputClass} ${mobile ? "flex-1" : ""}`}
            placeholder="Votre reponse..."
            style={{ minHeight: mobile ? "120px" : undefined }}
          />
        </div>
      );

    case "select":
      return (
        <div>
          <label className={`mb-2 block ${mobile ? "text-base" : "text-sm"} font-medium text-foreground`}>
            {question.question}
            {question.required && <span className="text-destructive"> *</span>}
          </label>
          <div className="space-y-2">
            {question.options?.map((opt) => {
              const [optKey, optLabel] = opt.includes("::")
                ? opt.split("::")
                : [opt, opt];
              const isSelected = value === opt || value === optKey;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange(opt)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                    isSelected
                      ? "border-2 font-medium shadow-sm"
                      : "border-border bg-background-raised hover:bg-background-overlay"
                  }`}
                  style={
                    isSelected
                      ? {
                          borderColor: phaseColor,
                          backgroundColor: `color-mix(in oklch, ${phaseColor} 8%, transparent)`,
                          color: phaseColor,
                        }
                      : undefined
                  }
                >
                  {optLabel ?? optKey}
                </button>
              );
            })}
          </div>
        </div>
      );

    case "multiselect":
      return (
        <div>
          <label className={`mb-2 block ${mobile ? "text-base" : "text-sm"} font-medium text-foreground`}>
            {question.question}
            {question.required && <span className="text-destructive"> *</span>}
          </label>
          <p className="mb-3 text-xs text-foreground-muted">Plusieurs choix possibles</p>
          <div className="space-y-2">
            {question.options?.map((opt) => {
              const [optKey, optLabel] = opt.includes("::")
                ? opt.split("::")
                : [opt, opt];
              const selected = Array.isArray(value) ? value : [];
              const isSelected = selected.includes(opt) || selected.includes(optKey);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      onChange(selected.filter((v: string) => v !== opt && v !== optKey));
                    } else {
                      onChange([...selected, opt]);
                    }
                  }}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                    isSelected
                      ? "border-2 font-medium shadow-sm"
                      : "border-border bg-background-raised hover:bg-background-overlay"
                  }`}
                  style={
                    isSelected
                      ? {
                          borderColor: phaseColor,
                          backgroundColor: `color-mix(in oklch, ${phaseColor} 8%, transparent)`,
                          color: phaseColor,
                        }
                      : undefined
                  }
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-xs ${
                        isSelected ? "text-white" : "border-border"
                      }`}
                      style={
                        isSelected
                          ? { backgroundColor: phaseColor, borderColor: phaseColor }
                          : undefined
                      }
                    >
                      {isSelected && "✓"}
                    </span>
                    {optLabel ?? optKey}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );

    case "scale":
      return (
        <div>
          <label className={`mb-2 block ${mobile ? "text-base" : "text-sm"} font-medium text-foreground`}>
            {question.question}
            {question.required && <span className="text-destructive"> *</span>}
          </label>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-foreground-muted">1</span>
            <div className="flex flex-1 justify-between gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
                const isSelected = value === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onChange(n)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-all ${
                      isSelected
                        ? "border-2 text-white shadow-sm"
                        : "border-border bg-background-raised hover:bg-background-overlay"
                    }`}
                    style={
                      isSelected
                        ? { backgroundColor: phaseColor, borderColor: phaseColor }
                        : undefined
                    }
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-foreground-muted">10</span>
          </div>
        </div>
      );

    default:
      return null;
  }
}
