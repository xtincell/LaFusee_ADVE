"use client";

/**
 * PillarPage — Composant partagé pour les pages pilier du Cockpit
 *
 * Chantier 9 : chaque pilier a son propre onglet.
 * ADVE = édition guidée + bouton auto-fill
 * RTIS = gestion avancée + bouton relance protocole
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { ScoreBadge } from "@/components/shared/score-badge";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonPage } from "@/components/shared/loading-skeleton";
import { useCurrentStrategyId } from "@/components/cockpit/strategy-context";
import type { PillarKey } from "@/lib/types/advertis-vector";
import {
  RefreshCw, Save, AlertCircle, CheckCircle, Sparkles, Loader2,
} from "lucide-react";

// ── Config par pilier ─────────────────────────────────────────────────

const PILLAR_CONFIG: Record<string, {
  title: string;
  subtitle: string;
  pillarKey: PillarKey;
  type: "adve" | "rtis";
  accent: string;
  bgAccent: string;
}> = {
  identity: {
    title: "Identite",
    subtitle: "Qui est votre marque ? Son ADN, ses valeurs, sa vision.",
    pillarKey: "a",
    type: "adve",
    accent: "text-violet-400",
    bgAccent: "bg-violet-500/10",
  },
  positioning: {
    title: "Positionnement & Design",
    subtitle: "Comment votre marque se distingue sur le marche.",
    pillarKey: "d",
    type: "adve",
    accent: "text-blue-400",
    bgAccent: "bg-blue-500/10",
  },
  offer: {
    title: "Offre & Pricing",
    subtitle: "Votre proposition de valeur et votre modele economique.",
    pillarKey: "v",
    type: "adve",
    accent: "text-emerald-400",
    bgAccent: "bg-emerald-500/10",
  },
  engagement: {
    title: "Experience & Engagement",
    subtitle: "Comment vous creez la devotion autour de votre marque.",
    pillarKey: "e",
    type: "adve",
    accent: "text-amber-400",
    bgAccent: "bg-amber-500/10",
  },
  diagnostic: {
    title: "Diagnostic",
    subtitle: "Analyse des risques et vulnerabilites de votre strategie.",
    pillarKey: "r",
    type: "rtis",
    accent: "text-red-400",
    bgAccent: "bg-red-500/10",
  },
  market: {
    title: "Realite Marche",
    subtitle: "Ce que le marche dit de votre marque — donnees et hypotheses.",
    pillarKey: "t",
    type: "rtis",
    accent: "text-sky-400",
    bgAccent: "bg-sky-500/10",
  },
  potential: {
    title: "Potentiel",
    subtitle: "Tout ce que votre marque peut faire — le catalogue des possibles.",
    pillarKey: "i",
    type: "rtis",
    accent: "text-orange-400",
    bgAccent: "bg-orange-500/10",
  },
  roadmap: {
    title: "Strategie",
    subtitle: "Votre plan d'action pour deplacer les perceptions vers le superfan.",
    pillarKey: "s",
    type: "rtis",
    accent: "text-pink-400",
    bgAccent: "bg-pink-500/10",
  },
};

// ── Composant ─────────────────────────────────────────────────────────

interface PillarPageProps {
  pageKey: keyof typeof PILLAR_CONFIG;
}

export function PillarPage({ pageKey }: PillarPageProps) {
  const config = PILLAR_CONFIG[pageKey]!;
  const strategyId = useCurrentStrategyId();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const pillarQuery = trpc.pillar.get.useQuery(
    { strategyId: strategyId ?? "", key: config.pillarKey.toUpperCase() as "A" | "D" | "V" | "E" | "R" | "T" | "I" | "S" },
    { enabled: !!strategyId },
  );

  const autoFillMutation = trpc.pillar.autoFill.useMutation({
    onSuccess: () => pillarQuery.refetch(),
  });

  const actualizeMutation = trpc.pillar.actualize.useMutation({
    onSuccess: () => pillarQuery.refetch(),
  });

  if (!strategyId) return <SkeletonPage />;
  if (pillarQuery.isLoading) return <SkeletonPage />;

  const pillar = pillarQuery.data?.pillar;
  const content = (pillar?.content ?? {}) as Record<string, unknown>;
  const filledFields = Object.entries(content).filter(([, v]) =>
    v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)
  ).length;
  const totalFields = Math.max(Object.keys(content).length, 1);
  const completionPct = Math.round((filledFields / totalFields) * 100);
  const validation = pillarQuery.data?.validation;
  const validationPct = validation?.completionPercentage ?? completionPct;

  const handleRegenerate = async () => {
    if (!strategyId) return;
    setIsRegenerating(true);
    try {
      if (config.type === "adve") {
        await autoFillMutation.mutateAsync({ strategyId, pillarKey: config.pillarKey });
      } else {
        await actualizeMutation.mutateAsync({ strategyId, key: config.pillarKey.toUpperCase() as "A" | "D" | "V" | "E" | "R" | "T" | "I" | "S" });
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${config.accent}`}>{config.title}</h1>
          <p className="mt-1 text-sm text-foreground-muted">{config.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <ScoreBadge
            score={validationPct * 2} // Approximate /200 from %
            maxScore={200}
            size="sm"
            mode="cockpit"
            showClassification={false}
          />
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              config.type === "adve"
                ? "bg-violet-600/20 text-violet-300 hover:bg-violet-600/30"
                : "bg-sky-600/20 text-sky-300 hover:bg-sky-600/30"
            } disabled:opacity-50`}
          >
            {isRegenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : config.type === "adve" ? (
              <Sparkles className="h-4 w-4" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {config.type === "adve" ? "Enrichir avec l'IA" : "Relancer le protocole"}
          </button>
        </div>
      </div>

      {/* Completion bar */}
      <div className={`rounded-lg border border-white/5 p-4 ${config.bgAccent}`}>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-foreground-muted">Completude</span>
          <span className={`font-semibold ${config.accent}`}>{validationPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/5">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${validationPct}%`,
              backgroundColor: `color-mix(in oklch, currentColor 60%, transparent)`,
            }}
          />
        </div>
      </div>

      {/* Validation status */}
      {pillar?.validationStatus && (
        <div className="flex items-center gap-2 text-sm">
          {pillar.validationStatus === "VALIDATED" ? (
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          ) : pillar.validationStatus === "AI_PROPOSED" ? (
            <Sparkles className="h-4 w-4 text-amber-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-foreground-muted" />
          )}
          <span className="text-foreground-muted">
            Statut : {
              pillar.validationStatus === "VALIDATED" ? "Valide" :
              pillar.validationStatus === "AI_PROPOSED" ? "Proposition IA — a valider" :
              pillar.validationStatus === "LOCKED" ? "Verrouille" :
              "Brouillon"
            }
          </span>
        </div>
      )}

      {/* Content display */}
      <div className="space-y-4">
        {Object.entries(content).map(([key, value]) => {
          if (value === null || value === undefined) return null;

          return (
            <div
              key={key}
              className="rounded-lg border border-white/5 bg-surface-raised p-4"
            >
              <h3 className="mb-2 text-sm font-semibold text-foreground-muted uppercase tracking-wide">
                {key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
              </h3>
              <div className="text-sm text-foreground">
                {typeof value === "string" ? (
                  <p className="whitespace-pre-wrap">{value}</p>
                ) : Array.isArray(value) ? (
                  <div className="space-y-1">
                    {value.slice(0, 10).map((item, i) => (
                      <div key={i} className="rounded bg-white/5 px-3 py-2 text-xs">
                        {typeof item === "string" ? item : JSON.stringify(item, null, 2)}
                      </div>
                    ))}
                    {value.length > 10 && (
                      <p className="text-xs text-foreground-muted">+{value.length - 10} autres...</p>
                    )}
                  </div>
                ) : typeof value === "object" ? (
                  <pre className="overflow-x-auto rounded bg-white/5 p-3 text-xs">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  <p>{String(value)}</p>
                )}
              </div>
            </div>
          );
        })}

        {filledFields === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 py-16 text-center">
            <AlertCircle className="mb-3 h-8 w-8 text-foreground-muted" />
            <p className="text-foreground-muted">Ce pilier est vide.</p>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="mt-4 flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-foreground hover:bg-white/15"
            >
              {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {config.type === "adve" ? "Generer avec l'IA" : "Lancer le protocole"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export { PILLAR_CONFIG };
