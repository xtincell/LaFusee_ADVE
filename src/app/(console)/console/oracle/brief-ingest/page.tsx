// ============================================================================
// Brief Ingest — Upload → Preview → Confirm → Hyperviseur Execution
// ROUTE: /console/oracle/brief-ingest
// ============================================================================

"use client";

import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { AiBadge } from "@/components/shared/ai-badge";
import {
  FileUp, Upload, X, Loader2, CheckCircle, AlertTriangle, ChevronDown,
  ChevronRight, Eye, Play, Brain, Database, BookOpen, Megaphone, Target,
  Shield, TrendingUp, Rocket, Route, BarChart3, Sparkles, ExternalLink,
  Building, Users, Palette, FileText, DollarSign, Calendar, Zap,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────

type Phase = "upload" | "review" | "executing";

interface PlanStep {
  id: string;
  agent: string;
  description: string;
  status: string;
  result?: unknown;
  error?: string;
}

// ── Constants ────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const AGENT_ICONS: Record<string, React.ElementType> = {
  SEED_ADVE: Database, SESHAT_ENRICH: BookOpen, CREATE_CAMPAIGN: Megaphone,
  SPAWN_MISSIONS: Target, PROTOCOLE_R: Shield, PROTOCOLE_T: TrendingUp,
  PROTOCOLE_I: Rocket, PROTOCOLE_S: Route, COMMANDANT: Brain,
  ARTEMIS_SEQUENCE: Sparkles, ARTEMIS_SUGGEST: Sparkles,
  SCORE: BarChart3, WAIT_HUMAN: Eye,
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "border-zinc-700 bg-zinc-900/50 text-zinc-500",
  RUNNING: "border-violet-500/50 bg-violet-500/10 text-violet-400",
  COMPLETED: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
  WAITING: "border-amber-500/50 bg-amber-500/10 text-amber-400",
  FAILED: "border-red-500/50 bg-red-500/10 text-red-400",
  SKIPPED: "border-zinc-700 bg-zinc-900/50 text-zinc-600",
};

const SECTION_ICONS: Record<string, React.ElementType> = {
  client: Building, context: FileText, objectives: Target,
  targeting: Users, creative: Palette, deliverables: Megaphone,
  budget: DollarSign, timeline: Calendar, campaign: Zap,
};

// ── Main Component ───────────────────────────────────────────────────────

export default function BriefIngestPage() {
  const [phase, setPhase] = useState<Phase>("upload");

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<{ file: File; name: string; size: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  // Preview state
  const [previewData, setPreviewData] = useState<{
    parsed: Record<string, unknown> | null;
    raw: Record<string, unknown> | null;
    validationErrors: Array<{ path: string; message: string }>;
    confidence: number;
    rawText: string;
  } | null>(null);
  const [editedBrief, setEditedBrief] = useState<Record<string, unknown> | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["client", "deliverables"]));
  const [newClientMode, setNewClientMode] = useState<"FAST_TRACK" | "ONBOARDING_FIRST">("FAST_TRACK");

  // Execution state
  const [planSteps, setPlanSteps] = useState<PlanStep[]>([]);
  const [confirmResult, setConfirmResult] = useState<{
    clientId: string;
    strategyId: string;
  } | null>(null);

  // tRPC
  const previewMutation = trpc.briefIngest.preview.useMutation({
    onSuccess: (data) => {
      setPreviewData(data);
      setEditedBrief(data.parsed ? { ...data.parsed } : data.raw);
      setPhase("review");
    },
    onError: (err) => setError(err.message),
  });

  const confirmMutation = trpc.briefIngest.confirm.useMutation({
    onSuccess: (data) => {
      setConfirmResult({ clientId: data.clientId, strategyId: data.strategyId });
      setPlanSteps(data.plan.steps);
      setPhase("executing");
    },
    onError: (err) => setError(err.message),
  });

  const advanceMutation = trpc.briefIngest.advance.useMutation({
    onSuccess: (data) => {
      setPlanSteps(data.steps);
    },
    onError: (err) => setError(err.message),
  });

  // ── File handling ──────────────────────────────────────────────────────

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFile = useCallback((file: File) => {
    setError("");
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|docx?|txt)$/i)) {
      setError("Format non supporte. Formats acceptes : PDF, DOCX, TXT.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Fichier trop volumineux (max 10 MB).");
      return;
    }
    setSelectedFile({ file, name: file.name, size: formatSize(file.size) });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1] ?? "";
      const ext = selectedFile.name.split(".").pop()?.toUpperCase() ?? "PDF";
      previewMutation.mutate({ fileName: selectedFile.name, fileType: ext as "PDF" | "DOCX" | "TXT", content: base64 });
    };
    reader.readAsDataURL(selectedFile.file);
  };

  const handleConfirm = () => {
    if (!editedBrief) return;
    setError("");
    const clientResolution = previewData?.parsed
      ? (previewData.parsed as Record<string, unknown>).clientResolution
      : undefined;
    const isNewClient = !(clientResolution as Record<string, unknown> | undefined)?.found;

    confirmMutation.mutate({
      parsed: editedBrief as never,
      newClientMode: isNewClient ? newClientMode : undefined,
    });
  };

  const handleAdvance = (stepId: string) => {
    if (!confirmResult) return;
    advanceMutation.mutate({ strategyId: confirmResult.strategyId, stepId });
  };

  // ── Section toggle ─────────────────────────────────────────────────────

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // ── Field editor helper ────────────────────────────────────────────────

  const updateField = (path: string, value: unknown) => {
    if (!editedBrief) return;
    const parts = path.split(".");
    const updated = JSON.parse(JSON.stringify(editedBrief));
    let obj = updated as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]!] as Record<string, unknown>;
    }
    obj[parts[parts.length - 1]!] = value;
    setEditedBrief(updated);
  };

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brief Ingest"
        description="Importez un brief client → IA extrait les donnees → creez campagne + missions automatiquement"
        breadcrumbs={[
          { label: "Console", href: "/console" },
          { label: "Oracle" },
          { label: "Brief Ingest" },
        ]}
        badge={<AiBadge />}
      />

      {/* Phase indicator */}
      <div className="flex items-center gap-2">
        {(["upload", "review", "executing"] as Phase[]).map((p, i) => (
          <div key={p} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="h-4 w-4 text-zinc-600" />}
            <button
              onClick={() => { if (p === "upload") { setPhase("upload"); setPreviewData(null); setEditedBrief(null); setPlanSteps([]); } }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                phase === p
                  ? "bg-violet-600 text-white"
                  : phase === "executing" && p !== "executing"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {p === "upload" ? "1. Upload" : p === "review" ? "2. Review" : "3. Execution"}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── PHASE 1: Upload ────────────────────────────────────────────── */}
      {phase === "upload" && (
        <div className="space-y-4">
          {/* Drop zone */}
          <label
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
              dragActive ? "border-violet-500 bg-violet-500/10" : "border-zinc-700 bg-zinc-900/50 hover:border-violet-500"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            <Upload className="mb-4 h-12 w-12 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-300">Glissez un brief ici ou cliquez pour uploader</span>
            <span className="mt-1 text-xs text-zinc-600">PDF, DOCX, TXT — Max 10 MB</span>
            <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.docx,.txt"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
          </label>

          {/* Selected file */}
          {selectedFile && (
            <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-3">
              <FileUp className="h-5 w-5 text-violet-400" />
              <div className="flex-1">
                <p className="text-sm text-white">{selectedFile.name}</p>
                <p className="text-xs text-zinc-600">{selectedFile.size}</p>
              </div>
              <button onClick={() => setSelectedFile(null)} className="rounded p-1 text-zinc-600 hover:text-red-400">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Analyze button */}
          {selectedFile && (
            <button
              onClick={handleAnalyze}
              disabled={previewMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-3 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {previewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              {previewMutation.isPending ? "Analyse en cours..." : "Analyser le brief"}
            </button>
          )}

          {/* Previously ingested briefs */}
          <IngestedBriefsList />
        </div>
      )}

      {/* ── PHASE 2: Review ────────────────────────────────────────────── */}
      {phase === "review" && editedBrief && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Confiance" value={`${Math.round((previewData?.confidence ?? 0) * 100)}%`} icon={Brain} />
            <StatCard title="Livrables" value={(editedBrief.deliverables as unknown[])?.length ?? 0} icon={Target} />
            <StatCard title="Validation" value={previewData?.validationErrors.length === 0 ? "OK" : `${previewData?.validationErrors.length} erreur(s)`} icon={previewData?.validationErrors.length === 0 ? CheckCircle : AlertTriangle} />
            <StatCard title="Mots extraits" value={previewData?.rawText.split(/\s+/).length ?? 0} icon={FileText} />
          </div>

          {/* Client resolution */}
          <ClientResolutionCard
            resolution={(editedBrief as Record<string, unknown>).clientResolution as Record<string, unknown> | undefined}
            newClientMode={newClientMode}
            onModeChange={setNewClientMode}
          />

          {/* Validation errors */}
          {previewData && previewData.validationErrors.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <h3 className="mb-2 text-sm font-semibold text-amber-400">Erreurs de validation LLM</h3>
              <div className="space-y-1">
                {previewData.validationErrors.map((err, i) => (
                  <p key={i} className="text-xs text-amber-300"><code className="text-amber-500">{err.path}</code> : {err.message}</p>
                ))}
              </div>
              <p className="mt-2 text-xs text-zinc-500">Corrigez les champs ci-dessous avant de confirmer.</p>
            </div>
          )}

          {/* Editable sections */}
          <div className="space-y-2">
            {BRIEF_SECTIONS.map((section) => (
              <BriefSection
                key={section.key}
                sectionKey={section.key}
                title={section.title}
                fields={section.fields}
                data={(editedBrief as Record<string, unknown>)[section.key] as Record<string, unknown> ?? editedBrief}
                expanded={expandedSections.has(section.key)}
                onToggle={() => toggleSection(section.key)}
                onUpdate={(field, value) => updateField(section.key === "campaign" ? field : `${section.key}.${field}`, value)}
              />
            ))}
          </div>

          {/* Confirm button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setPhase("upload"); setPreviewData(null); setEditedBrief(null); }}
              className="rounded-lg border border-zinc-700 px-6 py-3 text-sm text-zinc-400 hover:bg-zinc-800"
            >
              Retour
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirmMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {confirmMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {confirmMutation.isPending ? "Ingestion en cours..." : "Confirmer l'ingestion"}
            </button>
          </div>
        </div>
      )}

      {/* ── PHASE 3: Plan Execution ────────────────────────────────────── */}
      {phase === "executing" && (
        <div className="space-y-4">
          {/* Summary stats */}
          {confirmResult && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard title="Steps" value={planSteps.length} icon={Sparkles} />
              <StatCard title="Termines" value={planSteps.filter(s => s.status === "COMPLETED").length} icon={CheckCircle} />
              <StatCard title="En attente" value={planSteps.filter(s => s.status === "WAITING").length} icon={Eye} />
            </div>
          )}

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${planSteps.length > 0 ? (planSteps.filter(s => s.status === "COMPLETED").length / planSteps.length) * 100 : 0}%` }}
            />
          </div>

          {/* Steps list */}
          <div className="space-y-2">
            {planSteps.map((step) => {
              const Icon = AGENT_ICONS[step.agent] ?? Sparkles;
              const colors = STATUS_COLORS[step.status] ?? STATUS_COLORS.PENDING;
              const result = step.result as Record<string, unknown> | null;

              return (
                <div key={step.id} className={`rounded-lg border p-4 ${colors}`}>
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{step.description}</p>
                      <p className="text-xs opacity-70">{step.agent}</p>
                    </div>
                    <StatusBadge status={step.status} />

                    {step.status === "WAITING" && (
                      <button
                        onClick={() => handleAdvance(step.id)}
                        disabled={advanceMutation.isPending}
                        className="flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                      >
                        {advanceMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                        Valider
                      </button>
                    )}
                  </div>

                  {/* Step result */}
                  {step.status === "COMPLETED" && result && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {typeof result.campaignId === "string" && (
                        <a href={`/console/artemis/campaigns`} className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:text-white">
                          <Megaphone className="h-3 w-3" /> Campagne <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                      {Array.isArray(result.missionIds) && (
                        <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                          {(result.missionIds as string[]).length} mission(s)
                        </span>
                      )}
                      {Array.isArray(result.suggestedSequences) && (
                        <span className="rounded bg-violet-500/20 px-2 py-1 text-xs text-violet-300">
                          Sequences: {(result.suggestedSequences as string[]).join(", ")}
                        </span>
                      )}
                      {Array.isArray(result.seeded) && (
                        <span className="rounded bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300">
                          Piliers: {(result.seeded as string[]).join(", ").toUpperCase()}
                        </span>
                      )}
                      {typeof result.composite === "number" && (
                        <span className="rounded bg-blue-500/20 px-2 py-1 text-xs text-blue-300">
                          Score: {String(result.composite)}/200
                        </span>
                      )}
                    </div>
                  )}

                  {/* Error */}
                  {step.status === "FAILED" && step.error && (
                    <p className="mt-2 text-xs text-red-400">{step.error}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* All done */}
          {planSteps.length > 0 && planSteps.every(s => s.status === "COMPLETED" || s.status === "SKIPPED") && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
              <CheckCircle className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Brief ingere avec succes</h3>
              <p className="mt-1 text-sm text-zinc-400">Campagne, missions et piliers ADVE crees. La cascade RTIS a ete lancee.</p>
              <div className="mt-4 flex justify-center gap-3">
                <a href="/console/artemis/campaigns" className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700">
                  Voir les campagnes
                </a>
                <a href="/console/artemis/missions" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
                  Voir les missions
                </a>
                <button
                  onClick={() => { setPhase("upload"); setPreviewData(null); setEditedBrief(null); setPlanSteps([]); setSelectedFile(null); setConfirmResult(null); }}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                >
                  Ingerer un autre brief
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────

function ClientResolutionCard({
  resolution,
  newClientMode,
  onModeChange,
}: {
  resolution?: Record<string, unknown>;
  newClientMode: "FAST_TRACK" | "ONBOARDING_FIRST";
  onModeChange: (mode: "FAST_TRACK" | "ONBOARDING_FIRST") => void;
}) {
  const found = Boolean(resolution?.found);

  return (
    <div className={`rounded-xl border p-4 ${found ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
      <div className="flex items-center gap-3">
        <Building className={`h-5 w-5 ${found ? "text-emerald-400" : "text-amber-400"}`} />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">
            {found ? "Client existant trouve" : "Nouveau client"}
          </h3>
          {found && typeof resolution?.matchedOn === "string" && (
            <p className="text-xs text-zinc-500">
              Match: {String(resolution.matchedOn)} (confiance {Math.round((resolution.confidence as number ?? 0) * 100)}%)
            </p>
          )}
        </div>
        {found && <StatusBadge status="ACTIVE" />}
      </div>

      {!found && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onModeChange("FAST_TRACK")}
            className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              newClientMode === "FAST_TRACK"
                ? "border-violet-500 bg-violet-500/20 text-violet-300"
                : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
            }`}
          >
            <Rocket className="mx-auto mb-1 h-4 w-4" />
            Fast Track
            <p className="mt-0.5 font-normal text-zinc-500">Creer et lancer maintenant</p>
          </button>
          <button
            onClick={() => onModeChange("ONBOARDING_FIRST")}
            className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              newClientMode === "ONBOARDING_FIRST"
                ? "border-amber-500 bg-amber-500/20 text-amber-300"
                : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
            }`}
          >
            <Shield className="mx-auto mb-1 h-4 w-4" />
            Onboarding First
            <p className="mt-0.5 font-normal text-zinc-500">Profil complet requis</p>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Brief section accordion ──────────────────────────────────────────────

interface SectionField {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "tags" | "table";
}

const BRIEF_SECTIONS: Array<{ key: string; title: string; fields: SectionField[] }> = [
  { key: "client", title: "Client", fields: [
    { key: "companyName", label: "Entreprise", type: "text" },
    { key: "brandName", label: "Marque", type: "text" },
    { key: "sector", label: "Secteur", type: "text" },
    { key: "country", label: "Pays", type: "text" },
  ]},
  { key: "context", title: "Contexte strategique", fields: [
    { key: "marketContext", label: "Contexte marche", type: "textarea" },
    { key: "problemStatement", label: "Problematique", type: "textarea" },
    { key: "ambition", label: "Ambition", type: "textarea" },
    { key: "competitors", label: "Concurrents", type: "tags" },
    { key: "keyMessage", label: "Message cle", type: "textarea" },
  ]},
  { key: "objectives", title: "Objectifs", fields: [
    { key: "primary", label: "Objectif principal", type: "textarea" },
    { key: "secondary", label: "Objectifs secondaires", type: "tags" },
    { key: "kpis", label: "KPIs", type: "tags" },
  ]},
  { key: "targeting", title: "Cible", fields: [
    { key: "corePrimary", label: "Coeur de cible", type: "textarea" },
    { key: "secondary", label: "Cibles secondaires", type: "tags" },
    { key: "consumerInsight", label: "Insight consommateur", type: "textarea" },
  ]},
  { key: "creative", title: "Direction creative", fields: [
    { key: "toneAndStyle", label: "Ton & Style", type: "tags" },
    { key: "brandPersonality", label: "Personnalite de marque", type: "text" },
  ]},
  { key: "deliverables", title: "Livrables", fields: [
    { key: "_table", label: "Livrables", type: "table" },
  ]},
  { key: "campaign", title: "Campagne", fields: [
    { key: "campaignName", label: "Nom de la campagne", type: "text" },
    { key: "campaignType", label: "Type (ATL/BTL/TTL/360)", type: "text" },
  ]},
];

function BriefSection({
  sectionKey,
  title,
  fields,
  data,
  expanded,
  onToggle,
  onUpdate,
}: {
  sectionKey: string;
  title: string;
  fields: SectionField[];
  data: Record<string, unknown>;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (field: string, value: unknown) => void;
}) {
  const Icon = SECTION_ICONS[sectionKey] ?? FileText;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80">
      <button onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <Icon className="h-4 w-4 text-zinc-500" />
        <span className="flex-1 text-sm font-medium text-white">{title}</span>
        {expanded ? <ChevronDown className="h-4 w-4 text-zinc-500" /> : <ChevronRight className="h-4 w-4 text-zinc-500" />}
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-zinc-800 px-4 py-4">
          {fields.map((field) => {
            if (field.type === "table" && sectionKey === "deliverables") {
              return <DeliverablesTable key={field.key} data={data as unknown as unknown[]} onUpdate={onUpdate} />;
            }

            const value = data?.[field.key];

            if (field.type === "tags") {
              const items = Array.isArray(value) ? value : [];
              return (
                <div key={field.key}>
                  <label className="mb-1 block text-xs text-zinc-500">{field.label}</label>
                  <div className="flex flex-wrap gap-1">
                    {items.map((item: unknown, i: number) => (
                      <span key={i} className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">{String(item)}</span>
                    ))}
                    {items.length === 0 && <span className="text-xs text-zinc-600">Aucun</span>}
                  </div>
                </div>
              );
            }

            if (field.type === "textarea") {
              return (
                <div key={field.key}>
                  <label className="mb-1 block text-xs text-zinc-500">{field.label}</label>
                  <textarea
                    value={String(value ?? "")}
                    onChange={(e) => onUpdate(field.key, e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
                  />
                </div>
              );
            }

            return (
              <div key={field.key}>
                <label className="mb-1 block text-xs text-zinc-500">{field.label}</label>
                <input
                  type={field.type === "number" ? "number" : "text"}
                  value={String(value ?? "")}
                  onChange={(e) => onUpdate(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DeliverablesTable({ data, onUpdate: _onUpdate }: { data: unknown[]; onUpdate: (field: string, value: unknown) => void }) {
  const items = Array.isArray(data) ? data : [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
            <th className="pb-2">Type</th>
            <th className="pb-2">Description</th>
            <th className="pb-2">Format</th>
            <th className="pb-2">Qte</th>
            <th className="pb-2">Canal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: unknown, i: number) => {
            const d = item as Record<string, unknown>;
            return (
              <tr key={i} className="border-b border-zinc-800/50">
                <td className="py-2 pr-2"><span className="rounded bg-violet-500/20 px-2 py-0.5 text-xs text-violet-300">{String(d.type ?? "")}</span></td>
                <td className="py-2 pr-2 text-zinc-300">{String(d.description ?? "")}</td>
                <td className="py-2 pr-2 text-zinc-500">{String(d.format ?? "-")}</td>
                <td className="py-2 pr-2 text-zinc-500">{String(d.quantity ?? "-")}</td>
                <td className="py-2 text-zinc-500">{String(d.channel ?? "")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function IngestedBriefsList() {
  const { data, isLoading } = trpc.briefIngest.list.useQuery({ page: 1, limit: 5 });

  if (isLoading || !data || data.briefs.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
      <h3 className="mb-3 text-sm font-semibold text-white">Briefs recemment ingeres</h3>
      <div className="space-y-2">
        {data.briefs.map((b) => (
          <div key={b.id} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3">
            <FileText className="h-4 w-4 text-zinc-500" />
            <div className="flex-1">
              <p className="text-sm text-white">{b.campaign.name}</p>
              <p className="text-xs text-zinc-600">
                {b.campaign.strategy?.client?.name} — {b.campaign.missions.length} mission(s) — {b.campaign.state}
              </p>
            </div>
            <StatusBadge status={b.campaign.state} />
          </div>
        ))}
      </div>
    </div>
  );
}
