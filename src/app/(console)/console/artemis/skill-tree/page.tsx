"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Network, Lock, CheckCircle, Clock, Unlock, ChevronRight, Layers } from "lucide-react";
import Link from "next/link";

// ─── Static sequence data (imported at build time from the registry) ─────────

interface SequenceInfo {
  key: string;
  name: string;
  family: string;
  tier: number;
  description: string;
  stepCount: number;
  aiPowered: boolean;
  requires: Array<{ type: string; key?: string; tier?: number; count?: number; maturity?: string }>;
}

// All 40 sequences from artemis/tools/sequences.ts — statically defined for the console view.
// The skill tree shows the CATALOG (what exists). Per-brand execution status is on a separate page.
const ALL_SEQUENCES: SequenceInfo[] = [
  // T0 — Foundation (8)
  { key: "MANIFESTE-A", name: "Le Manifeste", family: "PILLAR", tier: 0, description: "Document fondateur Authenticite", stepCount: 8, aiPowered: true, requires: [{ type: "PILLAR", key: "a", maturity: "ENRICHED" }] },
  { key: "BRANDBOOK-D", name: "Le Brandbook", family: "PILLAR", tier: 0, description: "Systeme visuel Distinction", stepCount: 13, aiPowered: true, requires: [{ type: "PILLAR", key: "d", maturity: "ENRICHED" }] },
  { key: "OFFRE-V", name: "L'Offre Commerciale", family: "PILLAR", tier: 0, description: "Proposition de Valeur", stepCount: 7, aiPowered: true, requires: [{ type: "PILLAR", key: "v", maturity: "ENRICHED" }] },
  { key: "PLAYBOOK-E", name: "Le Playbook", family: "PILLAR", tier: 0, description: "Engagement et touchpoints", stepCount: 7, aiPowered: true, requires: [{ type: "PILLAR", key: "e", maturity: "ENRICHED" }] },
  { key: "AUDIT-R", name: "Audit de Risques", family: "PILLAR", tier: 0, description: "Diagnostic Risk interne/externe", stepCount: 5, aiPowered: true, requires: [{ type: "PILLAR", key: "r", maturity: "ENRICHED" }] },
  { key: "ETUDE-T", name: "Etude de Marche", family: "PILLAR", tier: 0, description: "Confrontation Track marche", stepCount: 6, aiPowered: true, requires: [{ type: "PILLAR", key: "t", maturity: "ENRICHED" }] },
  { key: "BRAINSTORM-I", name: "Brainstorm Innovation", family: "PILLAR", tier: 0, description: "Catalogue d'actions Implementation", stepCount: 5, aiPowered: true, requires: [{ type: "PILLAR", key: "i", maturity: "ENRICHED" }] },
  { key: "ROADMAP-S", name: "Roadmap Strategique", family: "PILLAR", tier: 0, description: "Plan Strategy vers superfan", stepCount: 6, aiPowered: true, requires: [{ type: "PILLAR", key: "s", maturity: "ENRICHED" }] },
  // T0.5 — Crystallisation (2)
  { key: "POSITIONING", name: "Cristallisation du Positionnement", family: "PILLAR", tier: 0, description: "Pont A+D vers identite", stepCount: 5, aiPowered: true, requires: [{ type: "PILLAR", key: "a", maturity: "ENRICHED" }, { type: "PILLAR", key: "d", maturity: "ENRICHED" }] },
  { key: "PERSONA-MAP", name: "Cartographie Personas", family: "PILLAR", tier: 0, description: "Personas en profondeur depuis D+T", stepCount: 5, aiPowered: true, requires: [{ type: "PILLAR", key: "d", maturity: "ENRICHED" }, { type: "PILLAR", key: "t", maturity: "ENRICHED" }] },
  // T1 — Identity (4)
  { key: "BRAND", name: "Identite Visuelle", family: "PRODUCTION", tier: 1, description: "Pipeline complet semiotique → guidelines", stepCount: 10, aiPowered: true, requires: [{ type: "SEQUENCE", key: "MANIFESTE-A" }, { type: "SEQUENCE", key: "BRANDBOOK-D" }] },
  { key: "NAMING", name: "Naming", family: "PRODUCTION", tier: 1, description: "Generation et validation de noms", stepCount: 6, aiPowered: true, requires: [{ type: "SEQUENCE", key: "MANIFESTE-A" }] },
  { key: "MESSAGING", name: "Identite Verbale", family: "PRODUCTION", tier: 1, description: "Claims, ton, vocabulaire, templates, bible editoriale", stepCount: 7, aiPowered: true, requires: [{ type: "SEQUENCE", key: "MANIFESTE-A" }, { type: "SEQUENCE", key: "BRANDBOOK-D" }] },
  { key: "BRAND-AUDIT", name: "Audit de Marque Existante", family: "STRATEGIC", tier: 1, description: "Evaluation identite existante (alternatif a BRAND)", stepCount: 5, aiPowered: true, requires: [{ type: "SEQUENCE", key: "AUDIT-R" }, { type: "SEQUENCE", key: "BRANDBOOK-D" }] },
  // T2 — Production (9)
  { key: "KV", name: "Key Visual", family: "PRODUCTION", tier: 2, description: "Direction artistique + KV campagne", stepCount: 7, aiPowered: true, requires: [{ type: "SEQUENCE", key: "BRAND" }, { type: "SEQUENCE", key: "OFFRE-V" }] },
  { key: "SPOT-VIDEO", name: "Spot Video", family: "PRODUCTION", tier: 2, description: "Script + storyboard video", stepCount: 6, aiPowered: true, requires: [{ type: "SEQUENCE", key: "BRAND" }, { type: "SEQUENCE", key: "PLAYBOOK-E" }] },
  { key: "SPOT-RADIO", name: "Spot Radio", family: "PRODUCTION", tier: 2, description: "Script audio publicitaire", stepCount: 5, aiPowered: true, requires: [{ type: "SEQUENCE", key: "BRAND" }] },
  { key: "PRINT-AD", name: "Print Ad", family: "PRODUCTION", tier: 2, description: "Annonce presse/magazine", stepCount: 5, aiPowered: true, requires: [{ type: "SEQUENCE", key: "BRAND" }] },
  { key: "OOH", name: "Out-of-Home", family: "PRODUCTION", tier: 2, description: "Affichage exterieur", stepCount: 6, aiPowered: true, requires: [{ type: "SEQUENCE", key: "BRAND" }, { type: "SEQUENCE", key: "KV" }] },
  { key: "SOCIAL-POST", name: "Social Post", family: "PRODUCTION", tier: 2, description: "Contenu reseaux sociaux", stepCount: 5, aiPowered: true, requires: [{ type: "SEQUENCE", key: "BRANDBOOK-D" }, { type: "SEQUENCE_ANY", tier: 2, count: 1 }] },
  { key: "STORY-ARC", name: "Story Arc", family: "PRODUCTION", tier: 2, description: "Narratif de marque longue duree", stepCount: 6, aiPowered: true, requires: [{ type: "SEQUENCE", key: "MANIFESTE-A" }, { type: "SEQUENCE", key: "PLAYBOOK-E" }] },
  { key: "WEB-COPY", name: "Web Copy", family: "PRODUCTION", tier: 2, description: "Contenus web/landing pages", stepCount: 5, aiPowered: true, requires: [{ type: "SEQUENCE", key: "BRANDBOOK-D" }, { type: "SEQUENCE", key: "OFFRE-V" }] },
  { key: "PACKAGING", name: "Packaging", family: "PRODUCTION", tier: 2, description: "Design packaging produit", stepCount: 6, aiPowered: true, requires: [{ type: "SEQUENCE", key: "BRAND" }, { type: "SEQUENCE", key: "OFFRE-V" }] },
  // T2.5 — Planification (2)
  { key: "MEDIA-PLAN", name: "Plan Medias", family: "STRATEGIC", tier: 2, description: "Canaux x budget x timing", stepCount: 6, aiPowered: false, requires: [{ type: "SEQUENCE", key: "BRAINSTORM-I" }, { type: "SEQUENCE", key: "OFFRE-V" }, { type: "SEQUENCE_ANY", tier: 2, count: 2 }] },
  { key: "CONTENT-CALENDAR", name: "Calendrier Editorial", family: "STRATEGIC", tier: 2, description: "Planification editoriale sur timeline", stepCount: 3, aiPowered: false, requires: [{ type: "SEQUENCE", key: "MESSAGING" }, { type: "SEQUENCE", key: "MEDIA-PLAN" }] },
  // T3 — Campaign (5)
  { key: "CAMPAIGN-360", name: "Campagne 360", family: "STRATEGIC", tier: 3, description: "Orchestration multi-canal complete", stepCount: 8, aiPowered: true, requires: [{ type: "SEQUENCE_ANY", tier: 2, count: 3 }, { type: "SEQUENCE", key: "ROADMAP-S" }] },
  { key: "CAMPAIGN-SINGLE", name: "Campagne Mono-Canal", family: "STRATEGIC", tier: 3, description: "Activation ciblee sur un canal", stepCount: 4, aiPowered: true, requires: [{ type: "SEQUENCE_ANY", tier: 2, count: 1 }, { type: "SEQUENCE", key: "BRAINSTORM-I" }] },
  { key: "LAUNCH", name: "Lancement", family: "STRATEGIC", tier: 3, description: "Plan de lancement marque/produit", stepCount: 9, aiPowered: true, requires: [{ type: "SEQUENCE", key: "CAMPAIGN-360" }, { type: "SEQUENCE", key: "ETUDE-T" }] },
  { key: "REBRAND", name: "Rebranding", family: "STRATEGIC", tier: 3, description: "Repositionnement et refonte", stepCount: 8, aiPowered: true, requires: [{ type: "SEQUENCE", key: "BRAND" }, { type: "SEQUENCE", key: "AUDIT-R" }] },
  { key: "PITCH", name: "Pitch Deck", family: "STRATEGIC", tier: 3, description: "Presentation investisseur/partenaire", stepCount: 7, aiPowered: true, requires: [{ type: "SEQUENCE_ANY", tier: 0, count: 8 }, { type: "SEQUENCE", key: "BRAND" }] },
  // T4 — Strategy (2)
  { key: "ANNUAL-PLAN", name: "Plan Annuel", family: "STRATEGIC", tier: 4, description: "Planification marketing annuelle", stepCount: 7, aiPowered: true, requires: [{ type: "SEQUENCE", key: "CAMPAIGN-360" }, { type: "SEQUENCE", key: "ROADMAP-S" }] },
  { key: "QUARTERLY-REVIEW", name: "Bilan Trimestriel", family: "STRATEGIC", tier: 4, description: "Performance reelle vs objectifs", stepCount: 4, aiPowered: true, requires: [{ type: "SEQUENCE", key: "CAMPAIGN-360" }] },
  // T5 — Operations (8)
  { key: "OPS", name: "Operations", family: "OPERATIONAL", tier: 5, description: "Workflow operationnel", stepCount: 5, aiPowered: false, requires: [] },
  { key: "GUARD", name: "Brand Guardian", family: "OPERATIONAL", tier: 5, description: "Surveillance coherence marque", stepCount: 4, aiPowered: true, requires: [] },
  { key: "EVAL", name: "Evaluation", family: "OPERATIONAL", tier: 5, description: "Evaluation de performances", stepCount: 4, aiPowered: false, requires: [] },
  { key: "INFLUENCE", name: "Influence", family: "OPERATIONAL", tier: 5, description: "Strategie d'influence", stepCount: 5, aiPowered: true, requires: [] },
  { key: "COST-SERVICE", name: "Cout Service", family: "OPERATIONAL", tier: 5, description: "Calcul cout de service", stepCount: 4, aiPowered: false, requires: [] },
  { key: "COST-CAMPAIGN", name: "Cout Campagne", family: "OPERATIONAL", tier: 5, description: "Calcul cout de campagne", stepCount: 4, aiPowered: false, requires: [{ type: "SEQUENCE", key: "CAMPAIGN-360" }] },
  { key: "PROFITABILITY", name: "Rentabilite", family: "OPERATIONAL", tier: 5, description: "Analyse de rentabilite", stepCount: 5, aiPowered: false, requires: [{ type: "SEQUENCE", key: "COST-SERVICE" }, { type: "SEQUENCE", key: "COST-CAMPAIGN" }] },
  { key: "RETAINER-REPORT", name: "Rapport Retainer", family: "OPERATIONAL", tier: 5, description: "Livrable recurrent mensuel/trimestriel", stepCount: 3, aiPowered: true, requires: [{ type: "SEQUENCE", key: "CAMPAIGN-360" }] },
];

const TIER_META: Record<number, { name: string; color: string }> = {
  0: { name: "T0 — FOUNDATION", color: "oklch(0.70 0.18 80)" },    // Gold
  1: { name: "T1 — IDENTITY", color: "oklch(0.55 0.25 265)" },     // Violet
  2: { name: "T2 — PRODUCTION", color: "oklch(0.65 0.20 145)" },   // Emerald
  3: { name: "T3 — CAMPAIGN", color: "oklch(0.60 0.20 240)" },     // Blue
  4: { name: "T4 — STRATEGY", color: "oklch(0.55 0.25 290)" },     // Indigo
  5: { name: "T5 — OPERATIONS", color: "oklch(0.55 0.25 25)" },    // Red
};

const FAMILY_BADGES: Record<string, { label: string; bg: string }> = {
  PILLAR: { label: "Pilier", bg: "bg-amber-500/15 text-amber-300" },
  PRODUCTION: { label: "Production", bg: "bg-emerald-500/15 text-emerald-300" },
  STRATEGIC: { label: "Strategique", bg: "bg-blue-500/15 text-blue-300" },
  OPERATIONAL: { label: "Operationnel", bg: "bg-red-500/15 text-red-300" },
};

function formatPrerequisite(req: SequenceInfo["requires"][0]): string {
  if (req.type === "SEQUENCE") return `${req.key}`;
  if (req.type === "SEQUENCE_ANY") return `${req.count}x Tier ${req.tier}`;
  if (req.type === "PILLAR") return `Pilier ${req.key?.toUpperCase()} ${req.maturity}`;
  return "?";
}

export default function SkillTreePage() {
  const tiers = [0, 1, 2, 3, 4, 5];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skill Tree"
        description="40 sequences organisees par tier — les combos debloquent les sequences avancees"
        breadcrumbs={[
          { label: "Console", href: "/console" },
          { label: "Artemis", href: "/console/artemis" },
          { label: "Skill Tree" },
        ]}
      />

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3">
        {tiers.map((t) => {
          const count = ALL_SEQUENCES.filter((s) => s.tier === t).length;
          const meta = TIER_META[t];
          return (
            <div
              key={t}
              className="flex items-center gap-2 rounded-lg border border-border-subtle px-3 py-1.5"
            >
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
              <span className="text-xs font-medium text-foreground">{meta.name}</span>
              <span className="text-xs text-foreground-muted">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Tiers */}
      <div className="space-y-10">
        {tiers.map((tier) => {
          const sequences = ALL_SEQUENCES.filter((s) => s.tier === tier);
          const meta = TIER_META[tier];

          return (
            <section key={tier}>
              <div className="mb-4 flex items-center gap-3">
                <div className="h-8 w-1 rounded-full" style={{ backgroundColor: meta.color }} />
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider" style={{ color: meta.color }}>
                    {meta.name}
                  </h2>
                  <p className="text-xs text-foreground-muted">{sequences.length} sequences</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sequences.map((seq) => {
                  const familyBadge = FAMILY_BADGES[seq.family] ?? FAMILY_BADGES.PILLAR;

                  return (
                    <div
                      key={seq.key}
                      className="group rounded-xl border border-border-subtle bg-card p-4 transition-all hover:border-border hover:bg-card-hover"
                    >
                      {/* Header */}
                      <div className="mb-2 flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-foreground-muted">{seq.key}</span>
                          </div>
                          <h3 className="mt-0.5 text-sm font-semibold text-foreground">{seq.name}</h3>
                        </div>
                        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold ${familyBadge.bg}`}>
                          {familyBadge.label}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="mb-3 text-xs leading-relaxed text-foreground-muted">{seq.description}</p>

                      {/* Meta */}
                      <div className="mb-2 flex items-center gap-3 text-[10px] text-foreground-muted">
                        <span className="flex items-center gap-1">
                          <Layers className="h-3 w-3" /> {seq.stepCount} steps
                        </span>
                        {seq.aiPowered && (
                          <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-violet-300">AI</span>
                        )}
                        {!seq.aiPowered && (
                          <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300">CALC</span>
                        )}
                      </div>

                      {/* Prerequisites */}
                      {seq.requires.length > 0 && (
                        <div className="border-t border-border-subtle pt-2">
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
                            Prerequis
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {seq.requires.map((req, i) => (
                              <span
                                key={i}
                                className="rounded-md bg-background-overlay px-1.5 py-0.5 text-[10px] text-foreground-muted"
                              >
                                {formatPrerequisite(req)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {seq.requires.length === 0 && (
                        <div className="border-t border-border-subtle pt-2">
                          <p className="text-[10px] text-emerald-400">Aucun prerequis — disponible immediatement</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
