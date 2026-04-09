"use client";

/**
 * PillarPage — Composant partagé pour les pages pilier du Cockpit
 *
 * Utilise le design system (field-renderers.tsx) pour le rendu automatique.
 * Le type de chaque champ (string/array/object/number) dicte le composant visuel.
 * Plus d'improvisation — contrat type → rendu.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { SkeletonPage } from "@/components/shared/loading-skeleton";
import { useCurrentStrategyId } from "@/components/cockpit/strategy-context";
import type { PillarKey } from "@/lib/types/advertis-vector";
import { PILLAR_SCHEMAS } from "@/lib/types/pillar-schemas";
import {
  AutoField, FocusModal, isInlineField, InlineBadge, getFieldLabel,
} from "./field-renderers";
import {
  RefreshCw, AlertCircle, CheckCircle, Sparkles, Loader2,
  ThumbsUp, ThumbsDown, ChevronRight,
} from "lucide-react";

// ── Pillar config ─────────────────────────────────────────────────────

const PILLAR_CONFIG: Record<string, {
  title: string;
  subtitle: string;
  pillarKey: PillarKey;
  type: "adve" | "rtis";
  accent: string;
}> = {
  identity:     { title: "Identite",                subtitle: "Qui est votre marque ? Son ADN, ses valeurs, sa vision.", pillarKey: "a", type: "adve", accent: "text-violet-400" },
  positioning:  { title: "Positionnement & Design", subtitle: "Comment votre marque se distingue sur le marche.",       pillarKey: "d", type: "adve", accent: "text-blue-400" },
  offer:        { title: "Offre & Pricing",         subtitle: "Votre proposition de valeur et votre modele economique.",pillarKey: "v", type: "adve", accent: "text-emerald-400" },
  engagement:   { title: "Experience & Engagement",  subtitle: "Comment vous creez la devotion autour de votre marque.", pillarKey: "e", type: "adve", accent: "text-amber-400" },
  diagnostic:   { title: "Diagnostic",               subtitle: "Analyse des risques et vulnerabilites.",                 pillarKey: "r", type: "rtis", accent: "text-red-400" },
  market:       { title: "Realite Marche",           subtitle: "Ce que le marche dit de votre marque.",                  pillarKey: "t", type: "rtis", accent: "text-sky-400" },
  potential:    { title: "Potentiel",                 subtitle: "Tout ce que votre marque peut faire.",                   pillarKey: "i", type: "rtis", accent: "text-orange-400" },
  roadmap:      { title: "Strategie",                subtitle: "Votre plan d'action vers le superfan.",                  pillarKey: "s", type: "rtis", accent: "text-pink-400" },
};

// ── Component ─────────────────────────────────────────────────────────

interface PillarPageProps { pageKey: keyof typeof PILLAR_CONFIG }

export function PillarPage({ pageKey }: PillarPageProps) {
  const config = PILLAR_CONFIG[pageKey]!;
  const strategyId = useCurrentStrategyId();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [enrichResult, setEnrichResult] = useState<{ type: "success" | "warning" | "error"; message: string } | null>(null);
  const [focusedItem, setFocusedItem] = useState<Record<string, unknown> | null>(null);

  const isAdve = config.type === "adve";
  const adveKey = config.pillarKey.toUpperCase() as "A" | "D" | "V" | "E";
  const upperKey = config.pillarKey.toUpperCase() as "A" | "D" | "V" | "E" | "R" | "T" | "I" | "S";

  const pillarQuery = trpc.pillar.get.useQuery(
    { strategyId: strategyId ?? "", key: upperKey },
    { enabled: !!strategyId },
  );

  const recosQuery = trpc.pillar.getRecos.useQuery(
    { strategyId: strategyId ?? "", key: adveKey },
    { enabled: !!strategyId && isAdve },
  );

  const autoFillMutation = trpc.pillar.autoFill.useMutation({ onSuccess: () => { pillarQuery.refetch(); recosQuery.refetch(); } });
  const actualizeMutation = trpc.pillar.actualize.useMutation({ onSuccess: () => pillarQuery.refetch() });
  const vaultEnrichMutation = trpc.pillar.enrichFromVault.useMutation({ onSuccess: () => { pillarQuery.refetch(); recosQuery.refetch(); } });
  const acceptRecosMutation = trpc.pillar.acceptRecos.useMutation({ onSuccess: () => { pillarQuery.refetch(); recosQuery.refetch(); } });
  const rejectRecosMutation = trpc.pillar.rejectRecos.useMutation({ onSuccess: () => recosQuery.refetch() });
  const [selectedRecos, setSelectedRecos] = useState<Set<number>>(new Set());

  if (!strategyId) return <SkeletonPage />;
  if (pillarQuery.isLoading) return <SkeletonPage />;

  const pillar = pillarQuery.data?.pillar;
  const content = (pillar?.content ?? {}) as Record<string, unknown>;
  const isFilled = (v: unknown) => v != null && v !== "" && !(Array.isArray(v) && v.length === 0);

  // Schema keys = source of truth. Filter dot-notation artifacts.
  const schemaKey = config.pillarKey.toUpperCase() as keyof typeof PILLAR_SCHEMAS;
  const schema = PILLAR_SCHEMAS[schemaKey];
  const schemaKeys = schema ? Object.keys((schema as { shape?: Record<string, unknown> }).shape ?? {}) : [];
  const contentKeys = Object.keys(content).filter(k => !k.includes("."));
  const extraKeys = contentKeys.filter(k => !schemaKeys.includes(k) && isFilled(content[k]));
  const allKeys = [...schemaKeys, ...extraKeys];

  const filledCount = allKeys.filter(k => isFilled(content[k])).length;
  const totalCount = Math.max(allKeys.length, 1);
  const completionPct = Math.round((filledCount / totalCount) * 100);
  const validation = pillarQuery.data?.validation;
  const validationPct = validation?.completionPercentage ?? completionPct;

  // Split keys by category
  const inlineKeys = allKeys.filter(k => isInlineField(k));
  const fieldKeys = allKeys.filter(k => !isInlineField(k));

  // ── Handlers ────────────────────────────────────────────────────

  const handleRegenerate = async () => {
    if (!strategyId) return;
    setIsRegenerating(true);
    setEnrichResult(null);
    try {
      let vaultWorked = false;
      try {
        const vr = await vaultEnrichMutation.mutateAsync({ strategyId, pillarKey: config.pillarKey });
        const recoCount = vr.recommendations?.length ?? 0;
        const vaultSize = vr.vaultSize ?? 0;
        if (vaultSize === 0) {
          setEnrichResult({ type: "warning", message: "Vault vide — ajoutez des sources dans l'onglet Sources." });
        } else if (recoCount > 0) {
          vaultWorked = true;
          setEnrichResult({ type: "success", message: `${recoCount} recommandation(s) depuis ${vaultSize} source(s).` });
        } else {
          setEnrichResult({ type: "warning", message: `${vaultSize} source(s) scannee(s) — aucune recommandation.` });
        }
        if (vr.error) setEnrichResult({ type: "error", message: vr.error });
      } catch (err) { console.warn("[enrichir] vault failed:", err); }

      if (!vaultWorked) {
        try {
          if (isAdve) {
            const r = await autoFillMutation.mutateAsync({ strategyId, pillarKey: config.pillarKey });
            const filled = (r as unknown as Record<string, unknown>)?.filled;
            if (Array.isArray(filled) && filled.length > 0) setEnrichResult({ type: "success", message: `${filled.length} champ(s) rempli(s).` });
            else setEnrichResult(prev => prev ?? { type: "warning", message: "Tous les champs sont remplis ou necessitent une saisie manuelle." });
          } else {
            await actualizeMutation.mutateAsync({ strategyId, key: upperKey });
            setEnrichResult({ type: "success", message: "Protocole execute. Pilier actualise." });
          }
        } catch (err) { setEnrichResult({ type: "error", message: `${err instanceof Error ? err.message : String(err)}` }); }
      }
    } finally { setIsRegenerating(false); }
  };

  // ── Recos data ──────────────────────────────────────────────────

  const recos = (recosQuery.data as unknown as Array<Record<string, unknown>> | undefined) ?? [];
  const pendingRecos = recos.filter(r => r.accepted !== true);

  // ── Render ──────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-6xl space-y-3 p-4 md:p-6">
      {/* Focus modal */}
      {focusedItem ? <FocusModal item={focusedItem} onClose={() => setFocusedItem(null)} /> : null}

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-surface-raised px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className={`text-lg font-bold ${config.accent} truncate`}>{config.title}</h1>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-1.5 w-24 rounded-full bg-white/5">
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${validationPct}%`, backgroundColor: validationPct === 100 ? "#34d399" : "#a78bfa" }} />
            </div>
            <span className="text-xs text-foreground-muted">{validationPct}%</span>
          </div>
          {pillar?.validationStatus && pillar.validationStatus !== "DRAFT" ? (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              pillar.validationStatus === "VALIDATED" ? "bg-emerald-500/15 text-emerald-300" :
              pillar.validationStatus === "AI_PROPOSED" ? "bg-amber-500/15 text-amber-300" :
              "bg-white/10 text-foreground-muted"
            }`}>{pillar.validationStatus === "VALIDATED" ? "Valide" : pillar.validationStatus === "AI_PROPOSED" ? "IA" : pillar.validationStatus}</span>
          ) : null}
        </div>
        <button onClick={handleRegenerate} disabled={isRegenerating}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            isAdve ? "bg-violet-600/20 text-violet-300 hover:bg-violet-600/30" : "bg-sky-600/20 text-sky-300 hover:bg-sky-600/30"
          } disabled:opacity-50`}>
          {isRegenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          Enrichir
        </button>
      </div>

      {/* ── Feedback toast ─────────────────────────────────────────── */}
      {enrichResult ? (
        <div className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs ${
          enrichResult.type === "success" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" :
          enrichResult.type === "warning" ? "bg-amber-500/10 text-amber-300 border border-amber-500/20" :
          "bg-red-500/10 text-red-300 border border-red-500/20"
        }`}>
          {enrichResult.type === "success" ? <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />}
          <span>{enrichResult.message}</span>
          <button onClick={() => setEnrichResult(null)} className="ml-auto text-foreground-muted hover:text-white">✕</button>
        </div>
      ) : null}

      {/* ── Recommendation review panel ────────────────────────────── */}
      {isAdve && pendingRecos.length > 0 ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-300">{pendingRecos.length} recommandation(s)</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => {
                const allIdx = recos.map((_, i) => i).filter(i => recos[i]?.accepted !== true);
                acceptRecosMutation.mutate({ strategyId: strategyId!, key: adveKey, recoIndices: allIdx });
                setSelectedRecos(new Set());
              }} disabled={acceptRecosMutation.isPending}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 disabled:opacity-40">
                <CheckCircle className="h-3 w-3" /> Tout accepter
              </button>
              <button onClick={() => {
                const idx = Array.from(selectedRecos);
                if (idx.length === 0) return;
                acceptRecosMutation.mutate({ strategyId: strategyId!, key: adveKey, recoIndices: idx });
                setSelectedRecos(new Set());
              }} disabled={selectedRecos.size === 0 || acceptRecosMutation.isPending}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-emerald-600/10 text-emerald-300/70 hover:bg-emerald-600/20 disabled:opacity-40">
                <ThumbsUp className="h-3 w-3" /> Selection ({selectedRecos.size})
              </button>
              <button onClick={() => rejectRecosMutation.mutate({ strategyId: strategyId!, key: adveKey })} disabled={rejectRecosMutation.isPending}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-red-600/20 text-red-300 hover:bg-red-600/30 disabled:opacity-40">
                <ThumbsDown className="h-3 w-3" /> Rejeter
              </button>
            </div>
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {pendingRecos.map((reco, i) => {
              const realIdx = recos.indexOf(reco);
              const isSelected = selectedRecos.has(realIdx);
              return (
                <div key={i} onClick={() => { const s = new Set(selectedRecos); if (isSelected) s.delete(realIdx); else s.add(realIdx); setSelectedRecos(s); }}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${isSelected ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/5 bg-white/[0.02] hover:bg-white/5"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          reco.operation === "ADD" ? "bg-emerald-500/15 text-emerald-300" :
                          reco.operation === "MODIFY" ? "bg-blue-500/15 text-blue-300" :
                          reco.operation === "REMOVE" ? "bg-red-500/15 text-red-300" :
                          "bg-white/10 text-foreground-muted"
                        }`}>{String(reco.operation ?? "SET")}</span>
                        <span className="text-xs font-medium text-white">{getFieldLabel(String(reco.field))}</span>
                        {reco.impact ? <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${reco.impact === "HIGH" ? "bg-red-500/15 text-red-300" : reco.impact === "MEDIUM" ? "bg-amber-500/15 text-amber-300" : "bg-white/10 text-foreground-muted"}`}>{String(reco.impact)}</span> : null}
                      </div>
                      <p className="text-[11px] text-foreground-muted line-clamp-2">{String(reco.justification ?? "")}</p>
                    </div>
                    <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border ${isSelected ? "border-emerald-400 bg-emerald-400 text-black" : "border-white/20"}`}>
                      {isSelected ? <CheckCircle className="h-3 w-3" /> : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* ── Inline metadata badges ─────────────────────────────────── */}
      {(() => {
        const filled = inlineKeys.filter(k => isFilled(content[k]));
        return filled.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {filled.map(k => <InlineBadge key={k} label={getFieldLabel(k)} value={Array.isArray(content[k]) ? (content[k] as unknown[]).join(", ") : String(content[k])} />)}
          </div>
        ) : null;
      })()}

      {/* ── All fields in 2-col grid — design system renders each ── */}
      <div className="grid gap-3 md:grid-cols-2">
        {fieldKeys.map(key => (
          <AutoField
            key={key}
            fieldKey={key}
            value={content[key]}
            accent={config.accent}
            onFocus={setFocusedItem}
          />
        ))}
      </div>
    </div>
  );
}

export { PILLAR_CONFIG };
