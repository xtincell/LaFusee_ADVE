"use client";

/**
 * DESIGN SYSTEM — Renderers automatiques par type de donnée
 *
 * Chaque type Zod mappe vers UN composant visuel.
 * Plus d'improvisation — le type dicte le rendu.
 *
 * Usage : <AutoField fieldKey="nomMarque" value={content.nomMarque} schema={schema} accent={accent} onFocus={openFocus} />
 */

import { useState } from "react";
import { ChevronRight, AlertCircle, Quote } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────

interface FieldProps {
  fieldKey: string;
  label: string;
  value: unknown;
  accent: string;
  onFocus?: (item: Record<string, unknown>) => void;
  span?: 1 | 2; // grid column span
}

// ── Label Map ─────────────────────────────────────────────────────────

const LABELS: Record<string, string> = {
  nomMarque: "Nom de la marque", accroche: "Accroche", description: "Description",
  secteur: "Secteur", pays: "Pays", brandNature: "Nature", langue: "Langue",
  archetype: "Archetype", archetypeSecondary: "Archetype secondaire",
  citationFondatrice: "Citation fondatrice", noyauIdentitaire: "Noyau identitaire",
  publicCible: "Public cible", promesseFondamentale: "Croyance fondamentale",
  positionnement: "Positionnement", promesseMaitre: "Promesse maitre",
  personas: "Personas", paysageConcurrentiel: "Concurrents",
  tonDeVoix: "Ton de voix", assetsLinguistiques: "Assets linguistiques",
  directionArtistique: "Direction artistique", sousPromesses: "Sous-promesses",
  archetypalExpression: "Expression de l'archetype",
  produitsCatalogue: "Catalogue produits", productLadder: "Echelle produit",
  unitEconomics: "Unit Economics", businessModel: "Modele d'affaires",
  positioningArchetype: "Positionnement prix", salesChannel: "Canal de vente",
  pricingJustification: "Justification du pricing",
  personaSegmentMap: "Mapping persona-produit",
  touchpoints: "Touchpoints", rituels: "Rituels", aarrr: "Funnel AARRR",
  kpis: "KPIs", superfanPortrait: "Portrait du superfan",
  promesseExperience: "Promesse d'experience",
  conversionTriggers: "Triggers de conversion", barriersEngagement: "Barrieres",
  globalSwot: "SWOT", probabilityImpactMatrix: "Matrice de risques",
  mitigationPriorities: "Priorites de mitigation", riskScore: "Score de risque",
  overtonBlockers: "Blocages Overton", pillarGaps: "Diagnostic par pilier",
  coherenceRisks: "Risques de coherence", devotionVulnerabilities: "Vulnerabilites Devotion",
  triangulation: "Triangulation marche", hypothesisValidation: "Hypotheses",
  tamSamSom: "TAM / SAM / SOM", brandMarketFitScore: "Brand-Market Fit",
  overtonPosition: "Position Overton", perceptionGap: "Ecart de perception",
  riskValidation: "Validation des risques", competitorOvertonPositions: "Concurrents Overton",
  catalogueParCanal: "Catalogue par canal", assetsProduisibles: "Assets produisibles",
  activationsPossibles: "Activations", innovationsProduit: "Innovations produit",
  actionsByDevotionLevel: "Actions par Devotion", riskMitigationActions: "Actions de mitigation",
  hypothesisTestActions: "Tests d'hypotheses", formatsDisponibles: "Formats disponibles",
  fenetreOverton: "Fenetre d'Overton", roadmap: "Roadmap",
  sprint90Days: "Sprint 90 jours", selectedFromI: "Actions selectionnees depuis I",
  devotionFunnel: "Funnel Devotion", overtonMilestones: "Jalons Overton",
  northStarKPI: "North Star KPI", budgetByDevotion: "Budget par Devotion",
  axesStrategiques: "Axes strategiques", facteursClesSucces: "Facteurs cles de succes",
  valeurs: "Valeurs", herosJourney: "Parcours du heros", ikigai: "Ikigai",
  enemy: "Ennemi", prophecy: "Prophetie", doctrine: "Doctrine",
  livingMythology: "Mythologie vivante", hierarchieCommunautaire: "Hierarchie communautaire",
  equipeDirigeante: "Equipe dirigeante", equipeComplementarite: "Complementarite equipe",
  timelineNarrative: "Timeline narrative", totalActions: "Total actions",
  globalBudget: "Budget global", coherenceScore: "Coherence",
  syntheseExecutive: "Synthese executive", visionStrategique: "Vision strategique",
  promesseDeValeur: "Promesse de valeur", mvp: "MVP", proprieteIntellectuelle: "Propriete intellectuelle",
  gamification: "Gamification", principesCommunautaires: "Principes communautaires",
  sacredCalendar: "Calendrier sacre", commandments: "Commandements",
  ritesDePassage: "Rites de passage", sacraments: "Sacrements", taboos: "Tabous",
  sacredObjects: "Objets sacres", proofPoints: "Proof Points", symboles: "Symboles",
  rejectedFromI: "Actions rejetees", recommandationsPrioritaires: "Recommandations",
  marketReality: "Realite marche", weakSignalAnalysis: "Signaux faibles",
  traction: "Traction", marketDataSources: "Sources de donnees",
  brandPlatform: "Plateforme de marque", copyStrategy: "Copy strategy",
  bigIdea: "Big Idea", potentielBudget: "Budget potentiel", mediaPlan: "Plan media",
  productExperienceMap: "Experience par produit", ladderProductAlignment: "Devotion x Produit",
  channelTouchpointMap: "Canaux x Touchpoints",
  economicModels: "Modeles economiques", freeLayer: "Layer gratuit",
  kpiDashboard: "KPI Dashboard", teamStructure: "Equipe mobilisee",
  budgetBreakdown: "Ventilation budget",
};

export function getFieldLabel(key: string): string {
  return LABELS[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
}

// ── Core atoms ────────────────────────────────────────────────────────

function Card({ children, className, span }: { children: React.ReactNode; className?: string; span?: 1 | 2 }) {
  return (
    <div className={`rounded-lg border border-white/5 bg-surface-raised p-4 ${span === 2 ? "md:col-span-2" : ""} ${className ?? ""}`}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wide mb-1.5">{children}</p>;
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-dashed border-white/8 bg-white/[0.01] px-4 py-3">
      <span className="text-xs text-foreground-muted">{label}</span>
      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-foreground-muted/60">vide</span>
    </div>
  );
}

// ── Renderers ─────────────────────────────────────────────────────────

/** Hero — large title display (brand name, etc.) */
export function HeroCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <Card span={2} className={`border-violet-500/20 bg-violet-500/5`}>
      <Label>{label}</Label>
      <p className={`text-2xl font-bold text-white`}>{value}</p>
    </Card>
  );
}

/** Quote — citation with guillemets */
export function QuoteCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <Label>{label}</Label>
      <blockquote className="border-l-2 border-violet-400/50 pl-3 italic text-white/90 text-sm">
        &laquo; {value} &raquo;
      </blockquote>
    </Card>
  );
}

/** Text — simple labeled text */
export function TextCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <Label>{label}</Label>
      <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{value}</p>
    </Card>
  );
}

/** Metric — single number with label */
export function MetricCard({ label, value, suffix, accent }: { label: string; value: number; suffix?: string; accent: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-surface-raised p-3 text-center">
      <p className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold ${accent}`}>{value.toLocaleString()}{suffix ? <span className="text-xs text-foreground-muted ml-0.5">{suffix}</span> : null}</p>
    </div>
  );
}

/** Badge — enum/archetype as a styled badge */
export function BadgeCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`rounded-lg border p-3 ${color}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-lg font-bold mt-0.5">{value}</p>
    </div>
  );
}

/** Tag list — array of strings as inline badges */
export function TagList({ label, values }: { label: string; values: string[] }) {
  return (
    <Card>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v, i) => (
          <span key={i} className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white">{v}</span>
        ))}
      </div>
    </Card>
  );
}

/** Item list — array of objects, compact rows, click to focus */
export function ItemList({ label, items, onFocus, nameKey }: { label: string; items: Array<Record<string, unknown>>; onFocus?: (item: Record<string, unknown>) => void; nameKey?: string }) {
  const resolvedNameKey = nameKey ?? detectNameKey(items);
  return (
    <Card>
      <Label>{label} ({items.length})</Label>
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {items.slice(0, 15).map((item, i) => (
          <div
            key={i}
            onClick={onFocus ? () => onFocus(item) : undefined}
            className={`rounded bg-white/5 px-3 py-2 text-xs ${onFocus ? "cursor-pointer hover:bg-white/[0.08] transition-colors" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 min-w-0 flex-1">
                {resolvedNameKey && item[resolvedNameKey] != null ? (
                  <span className="font-medium text-white">{String(item[resolvedNameKey])}</span>
                ) : null}
                {Object.entries(item)
                  .filter(([k, v]) => k !== resolvedNameKey && v != null && v !== "" && typeof v !== "object")
                  .slice(0, 3)
                  .map(([k, v]) => (
                    <span key={k} className="text-foreground-muted">{k}: <span className="text-white/70">{String(v).slice(0, 50)}</span></span>
                  ))}
              </div>
              {onFocus ? <ChevronRight className="h-3 w-3 flex-shrink-0 text-foreground-muted/30" /> : null}
            </div>
          </div>
        ))}
        {items.length > 15 ? <p className="text-[10px] text-foreground-muted px-1">+{items.length - 15} autres</p> : null}
      </div>
    </Card>
  );
}

/** Object card — show all sub-fields */
export function ObjectCard({ label, obj, onFocus }: { label: string; obj: Record<string, unknown>; onFocus?: (item: Record<string, unknown>) => void }) {
  const entries = Object.entries(obj).filter(([, v]) => v != null && v !== "");
  if (entries.length === 0) return null;

  return (
    <Card>
      <Label>{label}</Label>
      <div className={`space-y-1.5 ${onFocus ? "cursor-pointer" : ""}`} onClick={onFocus ? () => onFocus(obj) : undefined}>
        {entries.map(([k, v]) => (
          <div key={k} className="rounded bg-white/5 px-3 py-1.5">
            <span className="text-[10px] text-foreground-muted">{getFieldLabel(k)}</span>
            {typeof v === "string" ? (
              <p className="text-xs text-white/80 mt-0.5">{v.slice(0, 200)}{v.length > 200 ? "..." : ""}</p>
            ) : Array.isArray(v) ? (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {v.slice(0, 5).map((item, i) => (
                  <span key={i} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/70">
                    {typeof item === "string" ? item : JSON.stringify(item).slice(0, 40)}
                  </span>
                ))}
                {v.length > 5 ? <span className="text-[10px] text-foreground-muted">+{v.length - 5}</span> : null}
              </div>
            ) : typeof v === "boolean" ? (
              <span className={`text-xs ${v ? "text-emerald-400" : "text-red-400"}`}>{v ? "Oui" : "Non"}</span>
            ) : typeof v === "number" ? (
              <span className="text-xs text-white font-medium">{v.toLocaleString()}</span>
            ) : typeof v === "object" && v !== null ? (
              <p className="text-[10px] text-foreground-muted mt-0.5">{Object.keys(v as Record<string, unknown>).join(", ")}</p>
            ) : (
              <p className="text-xs text-white/80 mt-0.5">{String(v)}</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

/** SWOT grid — 4 quadrants */
export function SWOTCard({ swot }: { swot: Record<string, unknown> }) {
  const quadrants = [
    { key: "strengths", label: "Forces", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5" },
    { key: "weaknesses", label: "Faiblesses", color: "text-red-400 border-red-500/30 bg-red-500/5" },
    { key: "opportunities", label: "Opportunites", color: "text-blue-400 border-blue-500/30 bg-blue-500/5" },
    { key: "threats", label: "Menaces", color: "text-amber-400 border-amber-500/30 bg-amber-500/5" },
  ];
  return (
    <Card span={2}>
      <Label>SWOT</Label>
      <div className="grid gap-2 md:grid-cols-2">
        {quadrants.map(q => (
          <div key={q.key} className={`rounded-lg border p-3 ${q.color}`}>
            <p className="text-xs font-semibold mb-1">{q.label}</p>
            <ul className="space-y-0.5 text-[11px]">
              {Array.isArray(swot[q.key]) ? (swot[q.key] as string[]).map((item, i) => (
                <li key={i}>• {item}</li>
              )) : null}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** Ikigai grid — 4 colored quadrants */
export function IkigaiCard({ ikigai }: { ikigai: Record<string, unknown> }) {
  const quadrants = [
    { key: "love", label: "Ce qu'on aime", color: "text-pink-400" },
    { key: "competence", label: "Ce qu'on sait faire", color: "text-blue-400" },
    { key: "worldNeed", label: "Ce dont le monde a besoin", color: "text-emerald-400" },
    { key: "remuneration", label: "Ce pour quoi on est paye", color: "text-amber-400" },
  ];
  return (
    <Card span={2}>
      <Label>Ikigai</Label>
      <div className="grid gap-2 md:grid-cols-2">
        {quadrants.map(q => (
          <div key={q.key} className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className={`text-[10px] font-semibold ${q.color}`}>{q.label}</p>
            <p className="mt-1 text-xs text-white/80 leading-relaxed">{String(ikigai[q.key] ?? "—")}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** Overton window — perception actuelle vs cible */
export function OvertonCard({ overton }: { overton: Record<string, unknown> }) {
  return (
    <Card span={2}>
      <Label>Fenetre d'Overton</Label>
      <div className="grid gap-2 md:grid-cols-2 mb-2">
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
          <p className="text-[10px] font-semibold text-red-400">Perception actuelle</p>
          <p className="mt-1 text-xs text-white/80">{String(overton.perceptionActuelle ?? "—")}</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
          <p className="text-[10px] font-semibold text-emerald-400">Perception cible</p>
          <p className="mt-1 text-xs text-white/80">{String(overton.perceptionCible ?? "—")}</p>
        </div>
      </div>
      {overton.ecart ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="text-[10px] font-semibold text-amber-400">Ecart</p>
          <p className="mt-1 text-xs text-white/80">{String(overton.ecart)}</p>
        </div>
      ) : null}
    </Card>
  );
}

/** TAM/SAM/SOM — 3 columns with source badges */
export function TAMCard({ tam }: { tam: Record<string, Record<string, unknown>> }) {
  return (
    <Card span={2}>
      <Label>TAM / SAM / SOM</Label>
      <div className="grid gap-2 md:grid-cols-3">
        {(["tam", "sam", "som"] as const).map(k => {
          const d = tam[k];
          if (!d) return null;
          return (
            <div key={k} className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
              <p className="text-[10px] font-semibold text-foreground-muted">{k.toUpperCase()}</p>
              <p className="text-lg font-bold text-white">{d.value ? Number(d.value).toLocaleString() : "—"}</p>
              <p className="text-[10px] text-foreground-muted">{String(d.description ?? "")}</p>
              {d.source ? (
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] ${d.source === "verified" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
                  {d.source === "verified" ? "Verifie" : "Estimation IA"}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Focus Modal ───────────────────────────────────────────────────────

export function FocusModal({ item, onClose }: { item: Record<string, unknown>; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative mx-4 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border border-white/10 bg-zinc-900 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-3 top-3 rounded-full p-1.5 text-foreground-muted hover:bg-white/10 hover:text-white text-xs">✕</button>
        <div className="space-y-3">
          {Object.entries(item)
            .filter(([, v]) => v != null && v !== "")
            .map(([key, value]) => (
              <div key={key}>
                <p className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wide">{getFieldLabel(key)}</p>
                {typeof value === "string" ? (
                  <p className="mt-0.5 text-sm text-white whitespace-pre-wrap">{value}</p>
                ) : Array.isArray(value) ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {value.map((v, i) => (
                      <span key={i} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">{typeof v === "string" ? v : JSON.stringify(v)}</span>
                    ))}
                  </div>
                ) : typeof value === "boolean" ? (
                  <span className={`text-sm ${value ? "text-emerald-400" : "text-red-400"}`}>{value ? "Oui" : "Non"}</span>
                ) : typeof value === "number" ? (
                  <p className="mt-0.5 text-sm text-white font-medium">{value.toLocaleString()}</p>
                ) : typeof value === "object" && value !== null ? (
                  <pre className="mt-1 overflow-x-auto rounded bg-white/5 p-2 text-[10px] text-foreground-muted">{JSON.stringify(value, null, 2)}</pre>
                ) : (
                  <p className="mt-0.5 text-sm text-white">{String(value)}</p>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ── Auto-detect name key for item lists ───────────────────────────────

function detectNameKey(items: Array<Record<string, unknown>>): string | null {
  if (items.length === 0) return null;
  const first = items[0]!;
  const candidates = ["name", "nom", "title", "action", "value", "axe", "phase", "risk", "hypothesis", "activation", "asset"];
  return candidates.find(k => k in first && typeof first[k] === "string") ?? null;
}

// ── Master renderer — maps type → component automatically ─────────────

// Special field → renderer mapping (overrides type-based auto-detection)
const SPECIAL_FIELDS: Record<string, string> = {
  nomMarque: "hero",
  citationFondatrice: "quote",
  accroche: "hero-sm",
  archetype: "badge-amber",
  archetypeSecondary: "badge-grey",
  globalSwot: "swot",
  ikigai: "ikigai",
  fenetreOverton: "overton",
  tamSamSom: "tam",
  riskScore: "metric",
  brandMarketFitScore: "metric",
  totalActions: "metric",
  coherenceScore: "metric",
  globalBudget: "metric-xaf",
};

// Inline metadata fields (rendered as badges, not cards)
const INLINE_FIELDS = new Set(["secteur", "pays", "langue", "brandNature", "primaryChannel", "businessModel", "positioningArchetype", "salesChannel", "economicModels"]);

export function isInlineField(key: string): boolean {
  return INLINE_FIELDS.has(key);
}

export function InlineBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
      <span className="text-foreground-muted">{label} :</span>
      <span className="font-medium text-white">{value}</span>
    </span>
  );
}

export function AutoField({ fieldKey, value, accent, onFocus }: {
  fieldKey: string;
  value: unknown;
  accent: string;
  onFocus?: (item: Record<string, unknown>) => void;
}) {
  const label = getFieldLabel(fieldKey);
  const isFilled = value != null && value !== "" && !(Array.isArray(value) && value.length === 0);

  // Empty field
  if (!isFilled) return <Empty label={label} />;

  // Inline fields
  if (INLINE_FIELDS.has(fieldKey)) {
    return <InlineBadge label={label} value={Array.isArray(value) ? value.join(", ") : String(value)} />;
  }

  // Special fields
  const special = SPECIAL_FIELDS[fieldKey];
  if (special) {
    switch (special) {
      case "hero": return <HeroCard label={label} value={String(value)} accent={accent} />;
      case "hero-sm": return <Card><Label>{label}</Label><p className="text-lg font-semibold text-white/90">{String(value)}</p></Card>;
      case "quote": return <QuoteCard label={label} value={String(value)} />;
      case "badge-amber": return <BadgeCard label={label} value={String(value)} color="text-amber-400 border-amber-500/20 bg-amber-500/5" />;
      case "badge-grey": return <BadgeCard label={label} value={String(value)} color="text-foreground-muted border-white/10 bg-white/5" />;
      case "swot": return <SWOTCard swot={value as Record<string, unknown>} />;
      case "ikigai": return <IkigaiCard ikigai={value as Record<string, unknown>} />;
      case "overton": return <OvertonCard overton={value as Record<string, unknown>} />;
      case "tam": return <TAMCard tam={value as Record<string, Record<string, unknown>>} />;
      case "metric": return <MetricCard label={label} value={Number(value)} accent={accent} />;
      case "metric-xaf": return <MetricCard label={label} value={Number(value)} suffix="XAF" accent={accent} />;
    }
  }

  // Type-based auto-detection
  if (typeof value === "string") return <TextCard label={label} value={value} />;
  if (typeof value === "number") return <MetricCard label={label} value={value} accent={accent} />;
  if (typeof value === "boolean") return <Card><Label>{label}</Label><span className={value ? "text-emerald-400 text-sm" : "text-red-400 text-sm"}>{value ? "Oui" : "Non"}</span></Card>;

  if (Array.isArray(value)) {
    if (value.length === 0) return <Empty label={label} />;
    if (typeof value[0] === "string") return <TagList label={label} values={value as string[]} />;
    if (typeof value[0] === "object" && value[0] !== null) return <ItemList label={label} items={value as Array<Record<string, unknown>>} onFocus={onFocus} />;
    return <TagList label={label} values={value.map(String)} />;
  }

  if (typeof value === "object" && value !== null) {
    return <ObjectCard label={label} obj={value as Record<string, unknown>} onFocus={onFocus} />;
  }

  return <TextCard label={label} value={String(value)} />;
}

export { Empty, Card, Label };
