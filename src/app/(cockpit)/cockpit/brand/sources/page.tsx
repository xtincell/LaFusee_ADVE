"use client";

/**
 * Sources de marque — Le dossier complet des données brutes
 *
 * Affiche toutes les BrandDataSource d'une stratégie :
 * - Fichiers uploadés (PDF, DOCX, images)
 * - Texte parsé depuis l'intake
 * - Notes écrites par l'opérateur
 * - Images de référence
 *
 * C'est la "source de vérité" d'input humain qui nourrit les piliers.
 */

import { trpc } from "@/lib/trpc/client";
import { useCurrentStrategyId } from "@/components/cockpit/strategy-context";
import { SkeletonPage } from "@/components/shared/loading-skeleton";
import {
  FileText, Upload, Image as ImageIcon, MessageSquare,
  Globe, Clock, CheckCircle, AlertCircle, Loader2,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  PENDING: { label: "En attente", color: "text-foreground-muted", icon: Clock },
  EXTRACTING: { label: "Extraction...", color: "text-amber-400", icon: Loader2 },
  EXTRACTED: { label: "Extrait", color: "text-blue-400", icon: CheckCircle },
  PROCESSING: { label: "Traitement...", color: "text-amber-400", icon: Loader2 },
  PROCESSED: { label: "Traite", color: "text-emerald-400", icon: CheckCircle },
  FAILED: { label: "Echec", color: "text-red-400", icon: AlertCircle },
};

const TYPE_ICONS: Record<string, typeof FileText> = {
  FILE: FileText,
  URL: Globe,
  MANUAL_INPUT: MessageSquare,
  CRM_SYNC: Upload,
};

function renderPillarMapping(mapping: unknown): React.ReactNode {
  if (!mapping || typeof mapping !== "object" || Array.isArray(mapping)) return null;
  const keys = Object.keys(mapping as Record<string, unknown>);
  if (keys.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      <span className="text-[10px] text-foreground-muted">Piliers nourris :</span>
      {keys.map(key => (
        <span key={key} className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] text-blue-300">
          {key.toUpperCase()}
        </span>
      ))}
    </div>
  );
}

export default function SourcesPage() {
  const strategyId = useCurrentStrategyId();

  const sourcesQuery = trpc.ingestion.listSources.useQuery(
    { strategyId: strategyId ?? "" },
    { enabled: !!strategyId },
  );

  if (!strategyId) return <SkeletonPage />;
  if (sourcesQuery.isLoading) return <SkeletonPage />;

  const sources = (sourcesQuery.data ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sources de marque</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Tous les documents, notes et donnees qui nourrissent votre strategie.
        </p>
      </div>

      {sources.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 py-16 text-center">
          <Upload className="mb-3 h-8 w-8 text-foreground-muted" />
          <p className="text-foreground-muted">Aucune source de donnees pour cette marque.</p>
          <p className="mt-1 text-xs text-foreground-muted">
            Les sources sont ajoutees via l'intake, l'ingestion de documents, ou les notes de l'operateur.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sources.map((source, i) => {
            const status = STATUS_CONFIG[source.processingStatus as string] ?? STATUS_CONFIG.PENDING!;
            const TypeIcon = TYPE_ICONS[source.sourceType as string] ?? FileText;
            const StatusIcon = status.icon;

            return (
              <div key={i} className="rounded-lg border border-white/5 bg-surface-raised p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                      <TypeIcon className="h-5 w-5 text-foreground-muted" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{source.fileName as string ?? source.sourceType as string ?? "Source"}</p>
                      <p className="text-xs text-foreground-muted">
                        {source.fileType as string ?? source.sourceType as string}
                        {source.createdAt ? ` — ${new Date(source.createdAt as string).toLocaleDateString("fr")}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${status.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </div>
                </div>

                {/* Extracted fields preview */}
                {source.extractedFields != null && typeof source.extractedFields === "object" && !Array.isArray(source.extractedFields) ? (
                  <div className="mt-3 rounded bg-white/5 p-3">
                    <p className="mb-1 text-xs font-medium text-foreground-muted">Champs extraits :</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(source.extractedFields as Record<string, unknown>).slice(0, 10).map(key => (
                        <span key={key} className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] text-violet-300">
                          {key}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {renderPillarMapping(source.pillarMapping)}
                {typeof source.errorMessage === "string" && source.errorMessage ? (
                  <p className="mt-2 text-xs text-red-400">{source.errorMessage}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
