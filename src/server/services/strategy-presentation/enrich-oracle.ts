/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Enrich Oracle — Exhaustive pillar enrichment to reach 21/21 sections.
 *
 * For each empty/partial section, identifies the pillar + fields needed,
 * builds a domain-specific prompt using ALL existing pillar context,
 * calls Claude, and writes the result directly into the pillar.
 *
 * Principle: enrichment is DERIVED from what exists. Claude assembles
 * and structures from existing brand DNA, it does not invent from nothing.
 */

import { db } from "@/lib/db";
import { getFinancialContext } from "@/server/services/financial-engine";
import { checkCompleteness } from "./index";
import type { CompletenessReport, SectionCompleteness } from "./types";

// ─── Section → Pillar Enrichment Map (exhaustive) ────────────────────────────

interface EnrichmentSpec {
  pillar: string;
  fields: string[];
  prompt: (ctx: BrandContext) => string;
}

interface BrandContext {
  name: string;
  sector: string;
  positioning: string;
  businessModel: string;
  country: string;
  pillarContents: Record<string, Record<string, unknown>>;
  financialContext: string;
  drivers: string[];
  campaigns: string[];
}

/**
 * Complete mapping: every Oracle section → which pillar fields to generate.
 * The prompt function receives the full brand context so Claude DERIVES, not invents.
 */
const ENRICHMENT_MAP: Record<string, EnrichmentSpec> = {
  // ── Phase 1: ADVE ──────────────────────────────────────────────────────────

  "contexte-defi": {
    pillar: "a",
    fields: ["enemy", "prophecy"],
    prompt: (ctx) => `Marque: ${ctx.name} | Secteur: ${ctx.sector} | Positionnement: ${ctx.positioning}

A partir de l'archetype "${ctx.pillarContents.a?.archetype ?? "inconnu"}" et de la doctrine "${ctx.pillarContents.a?.doctrine ?? "inconnue"}",
derive l'ennemi de la marque et sa prophetie.

Genere en JSON:
{
  "enemy": { "name": "concept/force que la marque combat", "manifesto": "declaration de guerre en 2 phrases", "narrative": "pourquoi cet ennemi menace le monde de la cible" },
  "prophecy": { "worldTransformed": "le monde ideal si la marque gagne", "urgency": "pourquoi maintenant", "horizon": "temporalite 1-5 ans" }
}`,
  },

  "proposition-valeur": {
    pillar: "v",
    fields: ["pricing", "pricingStrategy", "pricingLadder", "proofPoints", "guarantees", "innovationPipeline"],
    prompt: (ctx) => `Marque: ${ctx.name} | Secteur: ${ctx.sector}
${ctx.financialContext}

Catalogue produits existant: ${JSON.stringify(ctx.pillarContents.v?.produitsCatalogue ?? []).slice(0, 500)}
Unit economics existants: ${JSON.stringify(ctx.pillarContents.v?.unitEconomics ?? {}).slice(0, 300)}

Derive la strategie de pricing, les preuves de valeur et le pipeline d'innovation.

JSON attendu:
{
  "pricing": "description de la strategie de prix",
  "pricingStrategy": "penetration|skimming|premium|value|freemium",
  "pricingLadder": "description des paliers: entry → core → premium → signature",
  "proofPoints": ["preuve 1", "preuve 2", "preuve 3"],
  "guarantees": ["garantie 1", "garantie 2"],
  "innovationPipeline": ["innovation court terme", "innovation moyen terme"]
}`,
  },

  "experience-engagement": {
    pillar: "e",
    fields: ["touchpoints", "rituels", "conversionTriggers", "barriers", "superfanPortrait"],
    prompt: (ctx) => `Marque: ${ctx.name} | Canaux actifs: ${ctx.drivers.join(", ")}
Personas: ${JSON.stringify(ctx.pillarContents.d?.personas ?? []).slice(0, 500)}
AARRR existant: ${JSON.stringify(ctx.pillarContents.e?.aarrr ?? {}).slice(0, 300)}
KPIs existants: ${JSON.stringify(ctx.pillarContents.e?.kpis ?? []).slice(0, 200)}

Derive les touchpoints, rituels de marque, triggers de conversion et barrieres.

JSON attendu:
{
  "touchpoints": [{"nom": "", "canal": "", "type": "OWNED|EARNED|PAID", "stadeAarrr": "ACQUISITION|ACTIVATION|RETENTION|REVENUE|REFERRAL", "qualite": "standard|premium|signature"}],
  "rituels": [{"nom": "", "frequence": "quotidien|hebdomadaire|mensuel|annuel", "description": "", "adoptionScore": 0.5}],
  "conversionTriggers": ["trigger 1", "trigger 2"],
  "barriers": ["barriere 1", "barriere 2"],
  "superfanPortrait": "description du superfan ideal en 3 phrases"
}
Genere au minimum 5 touchpoints et 3 rituels adaptes aux canaux: ${ctx.drivers.join(", ")}`,
  },

  // ── Phase 2: R+T ───────────────────────────────────────────────────────────

  "swot-interne": {
    pillar: "r",
    fields: ["forces", "faiblesses", "risques", "mitigations", "scoreResilience"],
    prompt: (ctx) => `Marque: ${ctx.name} | Secteur: ${ctx.sector}
Archetype: ${ctx.pillarContents.a?.archetype ?? "N/A"}
Promesse: ${ctx.pillarContents.d?.promesseMaitre ?? "N/A"}
Produits: ${JSON.stringify(ctx.pillarContents.v?.produitsCatalogue ?? []).slice(0, 300)}
Equipe/canaux: ${ctx.drivers.join(", ")}

Derive le SWOT interne (forces, faiblesses, risques, mitigations) de la marque.

JSON attendu:
{
  "forces": ["force 1", "force 2", "force 3"],
  "faiblesses": ["faiblesse 1", "faiblesse 2"],
  "risques": [{"risque": "description", "severite": "haute|moyenne|basse", "probabilite": "haute|moyenne|basse"}],
  "mitigations": [{"risque": "reference au risque", "action": "action corrective"}],
  "scoreResilience": 6.5
}`,
  },

  "swot-externe": {
    pillar: "t",
    fields: ["concurrents", "tendances", "menaces", "brandMarketFit", "validation"],
    prompt: (ctx) => `Marque: ${ctx.name} | Secteur: ${ctx.sector} | Pays: ${ctx.country}
${ctx.financialContext}
Concurrents existants: ${JSON.stringify(ctx.pillarContents.d?.paysageConcurrentiel ?? []).slice(0, 500)}

Derive le SWOT externe: concurrents, tendances marche, menaces et brand-market fit.

JSON attendu:
{
  "concurrents": [{"nom": "", "positionnement": "", "menace": "haute|moyenne|basse"}],
  "tendances": [{"tendance": "", "impact": "positif|negatif|neutre", "horizon": "court|moyen|long"}],
  "menaces": ["menace 1", "menace 2"],
  "brandMarketFit": "description du fit marque-marche en 2-3 phrases",
  "validation": {"score": 7, "verdict": "confirme|a valider|a pivoter"}
}`,
  },

  "signaux-opportunites": {
    pillar: "t",
    fields: ["weakSignals", "opportunities", "emergingTrends"],
    prompt: (ctx) => `Marque: ${ctx.name} | Secteur: ${ctx.sector} | Pays: ${ctx.country}
Tendances existantes: ${JSON.stringify(ctx.pillarContents.t?.tendances ?? []).slice(0, 300)}
Ennemi: ${ctx.pillarContents.a?.enemy ? JSON.stringify(ctx.pillarContents.a.enemy).slice(0, 200) : "N/A"}

Derive les signaux faibles, opportunites de prise de parole et tendances emergentes.

JSON attendu:
{
  "weakSignals": [{"signal": "description", "source": "social|media|marche|techno", "force": "faible|moyen|fort"}],
  "opportunities": [{"opportunite": "description", "timing": "immediat|trimestre|annee", "effort": "faible|moyen|fort"}],
  "emergingTrends": [{"trend": "description", "relevance": "haute|moyenne|basse"}]
}
Genere au moins 3 signaux, 3 opportunites et 2 tendances.`,
  },

  // ── Phase 3: I+S ───────────────────────────────────────────────────────────

  "catalogue-actions": {
    pillar: "i",
    fields: ["sprint90Days", "annualCalendar", "catalogueActions"],
    prompt: (ctx) => `Marque: ${ctx.name} | Secteur: ${ctx.sector} | Canaux: ${ctx.drivers.join(", ")}
${ctx.financialContext}
AARRR: ${JSON.stringify(ctx.pillarContents.e?.aarrr ?? {}).slice(0, 300)}
Campagnes existantes: ${ctx.campaigns.join(", ") || "aucune"}

Derive un catalogue d'actions exhaustif par canal et un sprint 90 jours.

JSON attendu:
{
  "sprint90Days": [
    {"semaine": "S1-S2", "action": "description", "canal": "canal", "aarrStage": "ACQUISITION", "budget": 0, "kpi": "metrique cible"}
  ],
  "annualCalendar": [
    {"trimestre": "Q1", "theme": "", "actions": ["action 1", "action 2"]}
  ],
  "catalogueActions": {
    "DIGITAL": [{"action": "", "canal": "", "frequence": "", "budget": 0}],
    "BTL": [{"action": "", "canal": "", "frequence": "", "budget": 0}],
    "ATL": [{"action": "", "canal": "", "frequence": "", "budget": 0}]
  }
}
Genere au minimum 8 actions pour le sprint 90 jours et couvre chaque canal actif.`,
  },

  "fenetre-overton": {
    pillar: "s",
    fields: ["perceptionActuelle", "perceptionCible", "roadmap", "sprint90Days", "ovpiScore"],
    prompt: (ctx) => `Marque: ${ctx.name} | Classification: score ${JSON.stringify(ctx.pillarContents.a?.archetype ?? "N/A")}
Promesse: ${ctx.pillarContents.d?.promesseMaitre ?? "N/A"}
Ennemi: ${ctx.pillarContents.a?.enemy ? JSON.stringify(ctx.pillarContents.a.enemy).slice(0, 200) : "N/A"}
Prophetie: ${ctx.pillarContents.a?.prophecy ? JSON.stringify(ctx.pillarContents.a.prophecy).slice(0, 200) : "N/A"}

Derive la Fenetre d'Overton de la marque: ou elle est percue vs ou elle veut aller.

JSON attendu:
{
  "perceptionActuelle": "description de la perception actuelle du marche",
  "perceptionCible": "perception visee a 12-18 mois",
  "roadmap": [
    {"phase": "Phase 1: titre", "duree": "3 mois", "objectif": "", "leviers": ["levier 1", "levier 2"]}
  ],
  "sprint90Days": "synthese du sprint 90 jours prioritaire en 3-4 phrases",
  "ovpiScore": 5.5
}
Genere au minimum 3 phases dans la roadmap.`,
  },

  // ── Mesure & Superfan ──────────────────────────────────────────────────────

  "profil-superfan": {
    pillar: "e",
    fields: ["superfanPortrait", "devotionJourney", "idealCustomer", "communityVision"],
    prompt: (ctx) => `Marque: ${ctx.name}
Archetype: ${ctx.pillarContents.a?.archetype ?? "N/A"}
Personas: ${JSON.stringify(ctx.pillarContents.d?.personas ?? []).slice(0, 500)}
Hierarchie communautaire: ${JSON.stringify(ctx.pillarContents.a?.hierarchieCommunautaire ?? ctx.pillarContents.e?.hierarchieCommunautaire ?? []).slice(0, 300)}
Rituels: ${JSON.stringify(ctx.pillarContents.e?.rituels ?? []).slice(0, 200)}

Derive le profil du superfan ideal et son parcours de devotion.

JSON attendu:
{
  "superfanPortrait": "description detaillee du superfan ideal (demographics, psychographics, comportement)",
  "devotionJourney": [
    {"niveau": "Spectateur", "comportement": "", "trigger_suivant": ""},
    {"niveau": "Interesse", "comportement": "", "trigger_suivant": ""},
    {"niveau": "Participant", "comportement": "", "trigger_suivant": ""},
    {"niveau": "Engage", "comportement": "", "trigger_suivant": ""},
    {"niveau": "Ambassadeur", "comportement": "", "trigger_suivant": ""},
    {"niveau": "Evangeliste", "comportement": "", "trigger_suivant": ""}
  ],
  "idealCustomer": "description du client ideal en 2-3 phrases",
  "communityVision": "vision de la communaute a 2 ans"
}`,
  },

  "croissance-evolution": {
    pillar: "s",
    fields: ["growthLoops", "expansion", "evolution", "innovationPipeline"],
    prompt: (ctx) => `Marque: ${ctx.name} | Secteur: ${ctx.sector}
${ctx.financialContext}
Produits: ${JSON.stringify(ctx.pillarContents.v?.produitsCatalogue ?? []).slice(0, 300)}
Canaux: ${ctx.drivers.join(", ")}

Derive les boucles de croissance, la strategie d'expansion et le pipeline d'innovation.

JSON attendu:
{
  "growthLoops": [{"nom": "nom de la boucle", "description": "comment elle fonctionne", "type": "viral|paid|content|product"}],
  "expansion": [{"marche": "nouveau marche/segment", "strategie": "description", "horizon": "court|moyen|long"}],
  "evolution": [{"phase": "description", "horizon": "", "objectif": ""}],
  "innovationPipeline": [{"innovation": "description", "type": "produit|service|experience|modele", "horizon": "court|moyen|long"}]
}
Genere au minimum 2 boucles, 2 axes d'expansion et 3 innovations.`,
  },

  "kpis-mesure": {
    pillar: "e",
    fields: ["kpis"],
    prompt: (ctx) => `Marque: ${ctx.name} | Canaux: ${ctx.drivers.join(", ")}
AARRR: ${JSON.stringify(ctx.pillarContents.e?.aarrr ?? {}).slice(0, 300)}
${ctx.financialContext}

Derive les KPIs de la methode ADVE-RTIS pour cette marque.

JSON attendu:
{
  "kpis": [
    {"name": "nom du KPI", "metricType": "count|rate|score|currency", "target": "valeur cible", "frequency": "quotidien|hebdomadaire|mensuel|trimestriel"},
  ]
}
Genere au minimum 8 KPIs couvrant: reach, engagement, conversion, retention, devotion, cult index, superfan velocity, ROAS.`,
  },

  "medias-distribution": {
    pillar: "i",
    fields: ["mediaAllocation", "channelStrategy"],
    prompt: (ctx) => `Marque: ${ctx.name} | Canaux actifs: ${ctx.drivers.join(", ")}
${ctx.financialContext}

Derive la strategie de distribution media et l'allocation par canal.

JSON attendu:
{
  "mediaAllocation": [{"canal": "nom canal", "budgetPct": 0.15, "objectif": "description", "format": "format principal"}],
  "channelStrategy": [{"canal": "nom canal", "role": "awareness|consideration|conversion|retention", "frequence": "description", "contenuType": "description"}]
}
Couvre chaque canal actif: ${ctx.drivers.join(", ")}`,
  },
};

// ─── Build Brand Context ─────────────────────────────────────────────────────

async function buildBrandContext(strategyId: string): Promise<BrandContext> {
  const strategy = await db.strategy.findUniqueOrThrow({
    where: { id: strategyId },
    include: {
      pillars: true,
      drivers: { where: { deletedAt: null, status: "ACTIVE" } },
      campaigns: { select: { name: true } },
      client: { select: { sector: true, country: true } },
    },
  });

  const bCtx = (strategy.businessContext as Record<string, unknown>) ?? {};
  const pillarContents: Record<string, Record<string, unknown>> = {};
  for (const p of strategy.pillars) {
    pillarContents[p.key] = (p.content as Record<string, unknown>) ?? {};
  }

  const sector = (bCtx.sector as string) ?? strategy.client?.sector ?? "SERVICES";
  const country = strategy.client?.country ?? "Cameroun";
  const positioning = (bCtx.positioningArchetype as string) ?? "MAINSTREAM";
  const businessModel = (bCtx.businessModel as string) ?? "B2C";

  return {
    name: strategy.name,
    sector,
    positioning,
    businessModel,
    country,
    pillarContents,
    financialContext: getFinancialContext(sector, country, positioning, businessModel, bCtx.declaredBudget as number | undefined),
    drivers: strategy.drivers.map((d: any) => d.channel as string),
    campaigns: strategy.campaigns.map((c: any) => c.name as string),
  };
}

// ─── Main Enrichment Function ────────────────────────────────────────────────

export async function enrichAllSections(strategyId: string): Promise<{
  enriched: string[];
  skipped: string[];
  failed: string[];
  total: number;
  message: string;
}> {
  const report = await checkCompleteness(strategyId);
  const incomplete = Object.entries(report)
    .filter(([, status]) => status === "empty" || status === "partial")
    .map(([id, status]) => ({ id, status }));

  if (incomplete.length === 0) {
    return { enriched: [], skipped: [], failed: [], total: 0, message: "Oracle complet — 21/21 sections." };
  }

  const ctx = await buildBrandContext(strategyId);
  const enriched: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];

  // Process each incomplete section
  for (const { id, status } of incomplete) {
    const spec = ENRICHMENT_MAP[id];
    if (!spec) {
      // No enrichment spec for this section (e.g., executive-summary, budget, timeline — derived from other data)
      skipped.push(id);
      continue;
    }

    const pillar = await db.pillar.findUnique({
      where: { strategyId_key: { strategyId, key: spec.pillar } },
    });

    if (!pillar) {
      // Create pillar if missing
      await db.pillar.create({
        data: { strategyId, key: spec.pillar, content: {} },
      });
    }

    const currentContent = ((pillar?.content ?? {}) as Record<string, unknown>);

    // Check which fields are actually missing
    const missingFields = spec.fields.filter((f) => {
      const val = currentContent[f];
      if (val === null || val === undefined) return true;
      if (typeof val === "string" && val.length === 0) return true;
      if (Array.isArray(val) && val.length === 0) return true;
      return false;
    });

    if (missingFields.length === 0) {
      skipped.push(id);
      continue;
    }

    try {
      const { generateText } = await import("ai");
      const { anthropic } = await import("@ai-sdk/anthropic");

      const { text } = await generateText({
        model: anthropic("claude-sonnet-4-20250514"),
        system: `Tu es ARTEMIS, moteur de diagnostic strategique LaFusee.
Tu enrichis le pilier ${spec.pillar.toUpperCase()} pour la section Oracle "${id}".
Tu DERIVES les donnees a partir du contexte marque fourni — tu n'inventes rien de fictif.
Produis UNIQUEMENT un JSON valide avec les champs demandes. Pas de markdown, pas de texte autour.
Si tu ne peux pas deriver une valeur, mets une estimation realiste basee sur le secteur ${ctx.sector}.`,
        prompt: spec.prompt(ctx),
        maxTokens: 4096,
      });

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const generated = JSON.parse(jsonMatch[0]);

        // Merge only missing fields (preserve existing data)
        const merged = { ...currentContent };
        for (const field of missingFields) {
          if (generated[field] !== undefined) {
            merged[field] = generated[field];
          }
        }

        await db.pillar.update({
          where: { strategyId_key: { strategyId, key: spec.pillar } },
          data: { content: merged as never },
        });

        enriched.push(id);
      } else {
        failed.push(id);
      }
    } catch (err) {
      console.warn(`[enrichOracle] Failed ${id}:`, err instanceof Error ? err.message : err);
      failed.push(id);
    }
  }

  const total = incomplete.length;
  return {
    enriched,
    skipped,
    failed,
    total,
    message: `${enriched.length}/${total} sections enrichies. ${skipped.length} non-enrichissables (derivees). ${failed.length} echouees.`,
  };
}
