"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { useCurrentStrategyId } from "@/components/cockpit/strategy-context";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonPage } from "@/components/shared/loading-skeleton";
import {
  Shield, Crosshair, Rocket, Brain, RefreshCw, Check,
  AlertTriangle, ChevronDown, ChevronUp, Zap, BarChart3,
  Target, TrendingUp, DollarSign, Users, Calendar, Layers,
  Eye, Activity, Gauge, FileText, ArrowRight, Play,
} from "lucide-react";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

type RTISKey = "R" | "T" | "I" | "S";

const RTIS_META: Record<RTISKey, { label: string; full: string; icon: React.ElementType; accent: string; border: string; bg: string; description: string }> = {
  R: {
    label: "R", full: "Risk", icon: Shield, accent: "text-red-400", border: "border-red-800/40", bg: "bg-red-500/10",
    description: "Analyse SWOT, matrice probabilite/impact, mitigations prioritaires",
  },
  T: {
    label: "T", full: "Track", icon: Crosshair, accent: "text-sky-400", border: "border-sky-800/40", bg: "bg-sky-500/10",
    description: "Triangulation marche, validation hypotheses, TAM/SAM/SOM, brand-market fit",
  },
  I: {
    label: "I", full: "Implementation", icon: Rocket, accent: "text-orange-400", border: "border-orange-800/40", bg: "bg-orange-500/10",
    description: "Sprint 90 jours, calendrier annuel, budget, equipe, plateforme de marque",
  },
  S: {
    label: "S", full: "Synthese", icon: Brain, accent: "text-pink-400", border: "border-pink-800/40", bg: "bg-pink-500/10",
    description: "Synthese executive, vision strategique, coherence inter-piliers, KPIs",
  },
};

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Brouillon", color: "bg-zinc-500/15 text-zinc-400 border-zinc-600/30" },
  AI_PROPOSED: { label: "IA Propose", color: "bg-amber-500/15 text-amber-300 border-amber-600/30" },
  VALIDATED: { label: "Valide", color: "bg-emerald-500/15 text-emerald-300 border-emerald-600/30" },
  LOCKED: { label: "Verrouille", color: "bg-violet-500/15 text-violet-300 border-violet-600/30" },
};

function safeStr(val: unknown, fb = ""): string {
  return typeof val === "string" ? val : typeof val === "number" ? String(val) : fb;
}
function safeNum(val: unknown, fb = 0): number {
  return typeof val === "number" ? val : fb;
}
function safeArr(val: unknown): Record<string, unknown>[] {
  return Array.isArray(val) ? val : [];
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function RTISPage() {
  const strategyId = useCurrentStrategyId();
  const [expandedPillar, setExpandedPillar] = useState<RTISKey | null>("R");
  const [cascadeRunning, setCascadeRunning] = useState(false);
  const [actualizingKey, setActualizingKey] = useState<RTISKey | null>(null);

  const pillarsQuery = trpc.pillar.getAll.useQuery(
    { strategyId: strategyId! },
    { enabled: !!strategyId },
  );

  const cascadeMutation = trpc.pillar.cascadeRTIS.useMutation({
    onSuccess: () => { pillarsQuery.refetch(); setCascadeRunning(false); },
    onError: () => setCascadeRunning(false),
  });

  const actualizeMutation = trpc.pillar.actualize.useMutation({
    onSuccess: () => { pillarsQuery.refetch(); setActualizingKey(null); },
    onError: () => setActualizingKey(null),
  });

  const transitionMutation = trpc.pillar.transitionStatus.useMutation({
    onSuccess: () => pillarsQuery.refetch(),
  });

  if (!strategyId) {
    return (
      <div className="p-8">
        <PageHeader title="RTIS — Risk, Track, Implementation, Synthese" />
        <p className="mt-4 text-sm text-zinc-500">Aucune strategie selectionnee.</p>
      </div>
    );
  }

  if (pillarsQuery.isLoading) return <SkeletonPage />;

  const data = pillarsQuery.data ?? {};

  // ADVE validation status check
  const adveKeys = ["A", "D", "V", "E"] as const;
  const adveAllPresent = adveKeys.every((k) => data[k] && (data[k] as { content: unknown }).content);
  const rtisKeys: RTISKey[] = ["R", "T", "I", "S"];

  // Compute overall RTIS readiness
  const rtisScores = rtisKeys.map((k) => {
    const p = data[k] as { content: unknown; score: number; completion: number } | undefined;
    return { key: k, score: p?.score ?? 0, completion: p?.completion ?? 0, hasContent: !!p?.content };
  });
  const avgRTISScore = rtisScores.reduce((s, r) => s + r.score, 0) / 4;

  return (
    <div className="p-8 space-y-6">
      <PageHeader title="RTIS — Risk, Track, Implementation, Synthese" />

      {/* ── Summary Bar ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {rtisKeys.map((k) => {
          const meta = RTIS_META[k];
          const p = data[k] as { score: number; completion: number } | undefined;
          return (
            <button
              key={k}
              onClick={() => setExpandedPillar(expandedPillar === k ? null : k)}
              className={`rounded-xl border ${meta.border} ${meta.bg} p-4 text-left transition-all hover:brightness-125 ${expandedPillar === k ? "ring-1 ring-white/20" : ""}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <meta.icon className={`h-4 w-4 ${meta.accent}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${meta.accent}`}>{meta.full}</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-white">{(p?.score ?? 0).toFixed(1)}</span>
                <span className="text-xs text-zinc-500">/25</span>
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-zinc-800 overflow-hidden">
                <div className={`h-full rounded-full ${meta.bg.replace("/10", "/60")}`} style={{ width: `${p?.completion ?? 0}%` }} />
              </div>
            </button>
          );
        })}

        {/* Avg score card */}
        <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Moyenne RTIS</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-white">{avgRTISScore.toFixed(1)}</span>
            <span className="text-xs text-zinc-500">/25</span>
          </div>
        </div>
      </div>

      {/* ── Actions Bar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => { setCascadeRunning(true); cascadeMutation.mutate({ strategyId, updateADVE: true }); }}
          disabled={cascadeRunning || !adveAllPresent}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {cascadeRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {cascadeRunning ? "Cascade en cours..." : "Lancer cascade RTIS"}
        </button>

        {!adveAllPresent && (
          <span className="flex items-center gap-1.5 text-xs text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Remplissez d&apos;abord les 4 piliers ADVE
          </span>
        )}

        {cascadeMutation.isSuccess && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            Cascade terminee
          </span>
        )}

        <div className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500">
          <ArrowRight className="h-3 w-3" />
          <span>R = analyse(ADVE)</span>
          <ArrowRight className="h-3 w-3" />
          <span>T = analyse(ADVE+R)</span>
          <ArrowRight className="h-3 w-3" />
          <span>R+T {"\u2192"} ADVE</span>
          <ArrowRight className="h-3 w-3" />
          <span>I = produit</span>
          <ArrowRight className="h-3 w-3" />
          <span>S = synthese</span>
        </div>
      </div>

      {/* ── Pillar Detail Panels ────────────────────────────────────── */}
      <div className="space-y-4">
        {rtisKeys.map((k) => {
          const meta = RTIS_META[k];
          const pillarData = data[k] as { content: unknown; score: number; completion: number; errors: number } | undefined;
          const content = (pillarData?.content ?? {}) as Record<string, unknown>;
          const isExpanded = expandedPillar === k;
          const isActualizing = actualizingKey === k;

          return (
            <div key={k} className={`rounded-xl border ${meta.border} bg-zinc-900/60 overflow-hidden`}>
              {/* Header */}
              <button
                onClick={() => setExpandedPillar(isExpanded ? null : k)}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <meta.icon className={`h-5 w-5 ${meta.accent}`} />
                  <span className={`font-semibold ${meta.accent}`}>{meta.full}</span>
                  <span className="text-xs text-zinc-500">{meta.description}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-zinc-300">{(pillarData?.score ?? 0).toFixed(1)}/25</span>
                  <span className="text-xs text-zinc-500">{pillarData?.completion ?? 0}%</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-zinc-800 p-5 space-y-5">
                  {/* Actions row */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setActualizingKey(k); actualizeMutation.mutate({ strategyId, key: k }); }}
                      disabled={isActualizing}
                      className={`flex items-center gap-1.5 rounded-lg border ${meta.border} px-3 py-1.5 text-xs font-medium ${meta.accent} hover:bg-zinc-800 disabled:opacity-40 transition-colors`}
                    >
                      {isActualizing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                      {isActualizing ? "Generation..." : `Generer ${meta.full}`}
                    </button>
                    <button
                      onClick={() => transitionMutation.mutate({ strategyId, key: k, targetStatus: "VALIDATED" })}
                      disabled={transitionMutation.isPending}
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-800/40 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-zinc-800 transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Valider
                    </button>
                    {transitionMutation.error && (
                      <span className="text-xs text-red-400">{transitionMutation.error.message}</span>
                    )}
                  </div>

                  {/* Content rendering per pillar */}
                  {!pillarData?.content ? (
                    <p className="text-sm text-zinc-600 italic">Pilier vide — lancez la cascade ou generez individuellement.</p>
                  ) : (
                    <PillarContent pillarKey={k} content={content} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// PILLAR CONTENT RENDERERS
// ============================================================================

function PillarContent({ pillarKey, content }: { pillarKey: RTISKey; content: Record<string, unknown> }) {
  switch (pillarKey) {
    case "R": return <RiskContent content={content} />;
    case "T": return <TrackContent content={content} />;
    case "I": return <ImplementationContent content={content} />;
    case "S": return <SyntheseContent content={content} />;
  }
}

// ── R — Risk ───────────────────────────────────────────────────────────────

function RiskContent({ content }: { content: Record<string, unknown> }) {
  const swot = (content.globalSwot ?? {}) as Record<string, unknown>;
  const matrix = safeArr(content.probabilityImpactMatrix);
  const mitigations = safeArr(content.mitigationPriorities);
  const riskScore = safeNum(content.riskScore);

  return (
    <div className="space-y-5">
      {/* Risk Score */}
      <div className="flex items-center gap-4">
        <Gauge className="h-5 w-5 text-red-400" />
        <span className="text-sm text-zinc-400">Score de risque global:</span>
        <span className={`text-2xl font-bold ${riskScore > 70 ? "text-red-400" : riskScore > 40 ? "text-amber-400" : "text-emerald-400"}`}>
          {riskScore}/100
        </span>
      </div>

      {/* SWOT */}
      <div>
        <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4" /> SWOT
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {(["strengths", "weaknesses", "opportunities", "threats"] as const).map((cat) => {
            const items = safeArr(swot[cat] as unknown);
            const labels: Record<string, { label: string; color: string }> = {
              strengths: { label: "Forces", color: "text-emerald-400 border-emerald-800/40" },
              weaknesses: { label: "Faiblesses", color: "text-red-400 border-red-800/40" },
              opportunities: { label: "Opportunites", color: "text-sky-400 border-sky-800/40" },
              threats: { label: "Menaces", color: "text-amber-400 border-amber-800/40" },
            };
            const meta = labels[cat]!;
            return (
              <div key={cat} className={`rounded-lg border ${meta.color.split(" ")[1]} bg-zinc-900/80 p-3`}>
                <h5 className={`text-xs font-bold uppercase mb-2 ${meta.color.split(" ")[0]}`}>{meta.label}</h5>
                <ul className="space-y-1">
                  {items.length === 0 && <li className="text-xs text-zinc-600 italic">-</li>}
                  {items.map((item, i) => (
                    <li key={i} className="text-xs text-zinc-300">• {typeof item === "string" ? item : safeStr((item as Record<string, unknown>).text)}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Probability/Impact Matrix */}
      {matrix.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Matrice Probabilite / Impact
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-zinc-500 uppercase">
                  <th className="text-left p-2">Risque</th>
                  <th className="text-center p-2">Probabilite</th>
                  <th className="text-center p-2">Impact</th>
                  <th className="text-left p-2">Mitigation</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, i) => (
                  <tr key={i} className="border-t border-zinc-800/50">
                    <td className="p-2 text-zinc-300">{safeStr(row.risk)}</td>
                    <td className="p-2 text-center">
                      <ProbBadge level={safeStr(row.probability, "MEDIUM")} />
                    </td>
                    <td className="p-2 text-center">
                      <ProbBadge level={safeStr(row.impact, "MEDIUM")} />
                    </td>
                    <td className="p-2 text-zinc-400">{safeStr(row.mitigation)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mitigations */}
      {mitigations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" /> Priorites de Mitigation
          </h4>
          <div className="space-y-2">
            {mitigations.map((m, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/80 p-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-[10px] font-bold text-red-400">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-xs text-zinc-300">{safeStr(m.action)}</p>
                  <div className="flex gap-4 mt-1 text-[10px] text-zinc-500">
                    {safeStr(m.owner) && <span>Responsable: {safeStr(m.owner)}</span>}
                    {safeStr(m.timeline) && <span>Echeance: {safeStr(m.timeline)}</span>}
                    {safeStr(m.investment) && <span>Invest: {safeStr(m.investment)}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── T — Track ──────────────────────────────────────────────────────────────

function TrackContent({ content }: { content: Record<string, unknown> }) {
  const triangulation = (content.triangulation ?? {}) as Record<string, unknown>;
  const hypotheses = safeArr(content.hypothesisValidation);
  const tamSamSom = (content.tamSamSom ?? {}) as Record<string, unknown>;
  const bmfScore = safeNum(content.brandMarketFitScore);

  return (
    <div className="space-y-5">
      {/* Brand Market Fit */}
      <div className="flex items-center gap-4">
        <Gauge className="h-5 w-5 text-sky-400" />
        <span className="text-sm text-zinc-400">Brand-Market Fit Score:</span>
        <span className={`text-2xl font-bold ${bmfScore > 70 ? "text-emerald-400" : bmfScore > 40 ? "text-amber-400" : "text-red-400"}`}>
          {bmfScore}/100
        </span>
      </div>

      {/* Triangulation */}
      <div>
        <h4 className="text-sm font-semibold text-sky-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Crosshair className="h-4 w-4" /> Triangulation
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(["customerInterviews", "competitiveAnalysis", "trendAnalysis", "financialBenchmarks"] as const).map((field) => {
            const labels: Record<string, { label: string; icon: React.ElementType }> = {
              customerInterviews: { label: "Entretiens Clients", icon: Users },
              competitiveAnalysis: { label: "Analyse Concurrentielle", icon: Eye },
              trendAnalysis: { label: "Analyse Tendances", icon: TrendingUp },
              financialBenchmarks: { label: "Benchmarks Financiers", icon: DollarSign },
            };
            const meta = labels[field]!;
            return (
              <div key={field} className="rounded-lg border border-sky-800/40 bg-zinc-900/80 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <meta.icon className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-xs font-bold text-sky-400 uppercase">{meta.label}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{safeStr(triangulation[field], "Non disponible")}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* TAM/SAM/SOM */}
      {Boolean(tamSamSom.tam || tamSamSom.sam || tamSamSom.som) && (
        <div>
          <h4 className="text-sm font-semibold text-sky-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4" /> TAM / SAM / SOM
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {(["tam", "sam", "som"] as const).map((tier) => {
              const v = (tamSamSom[tier] ?? {}) as Record<string, unknown>;
              const labels = { tam: "Total Addressable Market", sam: "Serviceable Available", som: "Serviceable Obtainable" };
              return (
                <div key={tier} className="rounded-lg border border-sky-800/40 bg-zinc-900/80 p-3 text-center">
                  <span className="text-[10px] font-bold text-sky-400 uppercase">{tier.toUpperCase()}</span>
                  <p className="text-lg font-bold text-white mt-1">{fmtCurrency(v.value)}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{labels[tier]}</p>
                  {safeStr(v.description) && <p className="text-[10px] text-zinc-400 mt-1">{safeStr(v.description)}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hypothesis Validation */}
      {hypotheses.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-sky-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" /> Validation Hypotheses
          </h4>
          <div className="space-y-2">
            {hypotheses.map((h, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/80 p-3">
                <HypothesisBadge status={safeStr(h.status, "HYPOTHESIS")} />
                <div className="flex-1">
                  <p className="text-xs font-medium text-zinc-200">{safeStr(h.hypothesis)}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Methode: {safeStr(h.validationMethod, "-")}</p>
                  {safeStr(h.evidence) && <p className="text-[10px] text-zinc-400 mt-0.5">Evidence: {safeStr(h.evidence)}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── I — Implementation ─────────────────────────────────────────────────────

function ImplementationContent({ content }: { content: Record<string, unknown> }) {
  const sprint = safeArr(content.sprint90Days);
  const calendar = safeArr(content.annualCalendar);
  const budget = safeNum(content.globalBudget);
  const team = safeArr(content.teamStructure);
  const platform = (content.brandPlatform ?? {}) as Record<string, unknown>;

  return (
    <div className="space-y-5">
      {/* Budget */}
      <div className="flex items-center gap-4">
        <DollarSign className="h-5 w-5 text-orange-400" />
        <span className="text-sm text-zinc-400">Budget global:</span>
        <span className="text-2xl font-bold text-white">{fmtCurrency(budget)} FCFA</span>
      </div>

      {/* Sprint 90 Days */}
      {sprint.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Rocket className="h-4 w-4" /> Sprint 90 Jours ({sprint.length} actions)
          </h4>
          <div className="space-y-2">
            {sprint.map((s, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/80 p-3">
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${s.isRiskMitigation ? "bg-red-500/15 text-red-400" : "bg-orange-500/15 text-orange-400"}`}>
                  {safeNum(s.priority, i + 1)}
                </span>
                <div className="flex-1">
                  <p className="text-xs text-zinc-300">{safeStr(s.action)}</p>
                  <div className="flex gap-4 mt-1 text-[10px] text-zinc-500">
                    {safeStr(s.owner) && <span>Owner: {safeStr(s.owner)}</span>}
                    {safeStr(s.kpi) && <span>KPI: {safeStr(s.kpi)}</span>}
                    {Boolean(s.isRiskMitigation) && <span className="text-red-400">Mitigation risque</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Annual Calendar */}
      {calendar.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Calendrier Annuel
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((q) => {
              const items = calendar.filter((c) => safeNum(c.quarter) === q);
              return (
                <div key={q} className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-3">
                  <span className="text-xs font-bold text-orange-400">Q{q}</span>
                  {items.length === 0 && <p className="text-[10px] text-zinc-600 mt-1">-</p>}
                  {items.map((c, i) => (
                    <div key={i} className="mt-2">
                      <p className="text-xs font-medium text-zinc-300">{safeStr(c.name)}</p>
                      <p className="text-[10px] text-zinc-500">{safeStr(c.objective)}</p>
                      {safeNum(c.budget) > 0 && <p className="text-[10px] text-zinc-500">{fmtCurrency(c.budget)} FCFA</p>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team */}
      {team.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" /> Structure Equipe
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {team.map((t, i) => (
              <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-3">
                <p className="text-xs font-medium text-zinc-200">{safeStr(t.name)}</p>
                <p className="text-[10px] text-orange-400">{safeStr(t.title)}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{safeStr(t.responsibility)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brand Platform */}
      {safeStr(platform.name) && (
        <div>
          <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" /> Plateforme de Marque
          </h4>
          <div className="rounded-lg border border-orange-800/40 bg-zinc-900/80 p-4 space-y-2">
            {(["name", "benefit", "target", "competitiveAdvantage", "emotionalBenefit", "functionalBenefit", "supportedBy"] as const).map((field) => {
              const labels: Record<string, string> = {
                name: "Nom", benefit: "Benefice", target: "Cible",
                competitiveAdvantage: "Avantage Concurrentiel",
                emotionalBenefit: "Benefice Emotionnel",
                functionalBenefit: "Benefice Fonctionnel",
                supportedBy: "Supporte par",
              };
              return (
                <div key={field} className="flex gap-2">
                  <span className="text-[10px] font-bold text-orange-400 uppercase w-36 shrink-0">{labels[field]}</span>
                  <span className="text-xs text-zinc-300">{safeStr(platform[field])}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── S — Synthese ───────────────────────────────────────────────────────────

function SyntheseContent({ content }: { content: Record<string, unknown> }) {
  const coherence = safeArr(content.coherencePiliers);
  const fcs = safeArr(content.facteursClesSucces);
  const recos = safeArr(content.recommandationsPrioritaires);
  const axes = safeArr(content.axesStrategiques);
  const kpis = safeArr(content.kpiDashboard);
  const coherenceScore = safeNum(content.coherenceScore);

  return (
    <div className="space-y-5">
      {/* Coherence Score */}
      <div className="flex items-center gap-4">
        <Gauge className="h-5 w-5 text-pink-400" />
        <span className="text-sm text-zinc-400">Coherence inter-piliers:</span>
        <span className={`text-2xl font-bold ${coherenceScore > 70 ? "text-emerald-400" : coherenceScore > 40 ? "text-amber-400" : "text-red-400"}`}>
          {coherenceScore}/100
        </span>
      </div>

      {/* Executive Summary */}
      {safeStr(content.syntheseExecutive) && (
        <div className="rounded-lg border border-pink-800/40 bg-zinc-900/80 p-4">
          <h4 className="text-xs font-bold text-pink-400 uppercase mb-2">Synthese Executive</h4>
          <p className="text-xs text-zinc-300 leading-relaxed">{safeStr(content.syntheseExecutive)}</p>
        </div>
      )}

      {/* Strategic Vision */}
      {safeStr(content.visionStrategique) && (
        <div className="rounded-lg border border-pink-800/40 bg-zinc-900/80 p-4">
          <h4 className="text-xs font-bold text-pink-400 uppercase mb-2">Vision Strategique</h4>
          <p className="text-xs text-zinc-300 leading-relaxed">{safeStr(content.visionStrategique)}</p>
        </div>
      )}

      {/* Coherence Map */}
      {coherence.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-pink-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4" /> Coherence Inter-Piliers
          </h4>
          <div className="space-y-2">
            {coherence.map((c, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/80 p-3">
                <span className="text-xs font-bold text-pink-400 shrink-0 w-16">{safeStr(c.pilier)}</span>
                <div className="flex-1">
                  <p className="text-xs text-zinc-300">{safeStr(c.contribution)}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{safeStr(c.articulation)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Success Factors */}
      {fcs.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-pink-400 uppercase tracking-wider mb-3">Facteurs Cles de Succes</h4>
          <ul className="space-y-1">
            {fcs.map((f, i) => (
              <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                {typeof f === "string" ? f : safeStr((f as Record<string, unknown>).text)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Priority Recommendations */}
      {recos.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-pink-400 uppercase tracking-wider mb-3">Recommandations Prioritaires</h4>
          <div className="space-y-2">
            {recos.map((r, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/80 p-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-500/15 text-[10px] font-bold text-pink-400">
                  {safeNum(r.priority, i + 1)}
                </span>
                <div className="flex-1">
                  <p className="text-xs text-zinc-300">{safeStr(r.recommendation)}</p>
                  {safeStr(r.source) && <span className="text-[10px] text-zinc-500">Source: {safeStr(r.source)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategic Axes */}
      {axes.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-pink-400 uppercase tracking-wider mb-3">Axes Strategiques</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {axes.map((a, i) => (
              <div key={i} className="rounded-lg border border-pink-800/40 bg-zinc-900/80 p-3">
                <p className="text-xs font-medium text-zinc-200">{safeStr(a.axe)}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {safeArr(a.pillarsLinked as unknown).map((p, j) => (
                    <span key={j} className="rounded bg-pink-500/10 px-1.5 py-0.5 text-[10px] font-bold text-pink-300">
                      {typeof p === "string" ? p : "?"}
                    </span>
                  ))}
                </div>
                {Array.isArray(a.kpis) && (
                  <div className="mt-1.5">
                    {safeArr(a.kpis as unknown).map((kpi, j) => (
                      <span key={j} className="text-[10px] text-zinc-500 block">• {typeof kpi === "string" ? kpi : "?"}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Dashboard */}
      {kpis.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-pink-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> KPI Dashboard
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-zinc-500 uppercase">
                  <th className="text-left p-2">KPI</th>
                  <th className="text-center p-2">Pilier</th>
                  <th className="text-left p-2">Cible</th>
                  <th className="text-center p-2">Frequence</th>
                </tr>
              </thead>
              <tbody>
                {kpis.map((kpi, i) => (
                  <tr key={i} className="border-t border-zinc-800/50">
                    <td className="p-2 text-zinc-300">{safeStr(kpi.name)}</td>
                    <td className="p-2 text-center">
                      <span className="rounded bg-pink-500/10 px-1.5 py-0.5 text-[10px] font-bold text-pink-300">{safeStr(kpi.pillar)}</span>
                    </td>
                    <td className="p-2 text-zinc-400">{safeStr(kpi.target)}</td>
                    <td className="p-2 text-center text-zinc-500">{safeStr(kpi.frequency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function ProbBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    LOW: "bg-emerald-500/15 text-emerald-300",
    MEDIUM: "bg-amber-500/15 text-amber-300",
    HIGH: "bg-red-500/15 text-red-300",
  };
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${colors[level] ?? "bg-zinc-700 text-zinc-400"}`}>
      {level}
    </span>
  );
}

function HypothesisBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    HYPOTHESIS: "bg-zinc-500/15 text-zinc-300",
    TESTING: "bg-amber-500/15 text-amber-300",
    VALIDATED: "bg-emerald-500/15 text-emerald-300",
    INVALIDATED: "bg-red-500/15 text-red-300",
  };
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase shrink-0 ${colors[status] ?? "bg-zinc-700 text-zinc-400"}`}>
      {status}
    </span>
  );
}

function fmtCurrency(val: unknown): string {
  const n = safeNum(val);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} Mds`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)} K`;
  return n.toLocaleString("fr-FR");
}
