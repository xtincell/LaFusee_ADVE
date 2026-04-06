/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Enrich Oracle — Delegates to REAL Artemis frameworks + writes results back to pillars.
 *
 * Flow:
 * 1. Check completeness → identify empty/partial sections
 * 2. Map each section → the Artemis frameworks that feed it
 * 3. Execute frameworks via artemis.executeFramework() (real AI calls, real DB persistence)
 * 4. Extract structured fields from framework outputs → merge into pillar content
 *
 * This is the bridge between Artemis (diagnostic engine) and the Oracle (presentation layer).
 * Zero standalone Claude calls — everything goes through the Artemis pipeline.
 */

import { db } from "@/lib/db";
import { executeFramework, topologicalSort, getFramework } from "@/server/services/artemis";
import { checkCompleteness } from "./index";

// ─── Section → Artemis Frameworks + Pillar Writeback ─────────────────────────

interface SectionEnrichmentSpec {
  /** Artemis framework slugs to execute (in dependency order) */
  frameworks: string[];
  /** Which pillar to write enriched data into */
  pillar: string;
  /** Extract fields from framework outputs → pillar fields */
  writeback: (outputs: Record<string, any>) => Record<string, unknown>;
}

const SECTION_ENRICHMENT: Record<string, SectionEnrichmentSpec> = {

  "contexte-defi": {
    frameworks: ["fw-01-brand-archeology", "fw-02-persona-constellation"],
    pillar: "a",
    writeback: (outputs) => {
      const arch = outputs["fw-01-brand-archeology"] ?? {};
      const persona = outputs["fw-02-persona-constellation"] ?? {};
      return {
        ...(arch.founding_myth ? { enemy: { name: arch.identity_tensions?.[0] ?? "Status quo", manifesto: arch.founding_myth, narrative: arch.cultural_anchors?.join(". ") ?? "" } } : {}),
        ...(arch.brand_dna ? { prophecy: { worldTransformed: arch.brand_dna, urgency: "Maintenant", horizon: "3 ans" } } : {}),
        ...(persona.persona_map ? { _personas_enriched: persona.persona_map } : {}),
      };
    },
  },

  "proposition-valeur": {
    frameworks: ["fw-04-value-architecture", "fw-05-pricing-psychology", "fw-06-unit-economics"],
    pillar: "v",
    writeback: (outputs) => {
      const val = outputs["fw-04-value-architecture"] ?? {};
      const price = outputs["fw-05-pricing-psychology"] ?? {};
      const ue = outputs["fw-06-unit-economics"] ?? {};
      return {
        ...(val.value_map ? { pricing: val.value_map } : {}),
        ...(val.differentiation_score ? { pricingStrategy: val.optimization_paths?.join(". ") ?? "" } : {}),
        ...(price.anchor_strategy ? { pricingLadder: price.anchor_strategy } : {}),
        ...(val.optimization_paths ? { proofPoints: Array.isArray(val.optimization_paths) ? val.optimization_paths : [] } : {}),
        ...(price.bundle_opportunities ? { guarantees: Array.isArray(price.bundle_opportunities) ? price.bundle_opportunities : [] } : {}),
        ...(price.premium_indicators ? { innovationPipeline: Array.isArray(price.premium_indicators) ? price.premium_indicators : [] } : {}),
        ...(ue.ltv_cac_ratio ? { unitEconomics: { cac: ue.cac ?? null, ltv: ue.ltv ?? null, ltvCacRatio: ue.ltv_cac_ratio ?? null, margeNette: ue.margin_analysis ?? null, roiEstime: null, budgetCom: null, caVise: null } } : {}),
      };
    },
  },

  "experience-engagement": {
    frameworks: ["fw-07-touchpoint-mapping", "fw-08-ritual-design", "fw-09-devotion-pathway"],
    pillar: "e",
    writeback: (outputs) => {
      const tp = outputs["fw-07-touchpoint-mapping"] ?? {};
      const rit = outputs["fw-08-ritual-design"] ?? {};
      const dev = outputs["fw-09-devotion-pathway"] ?? {};
      return {
        ...(tp.touchpoint_map ? { touchpoints: Array.isArray(tp.touchpoint_map) ? tp.touchpoint_map : [] } : {}),
        ...(rit.ritual_portfolio ? { rituels: Array.isArray(rit.ritual_portfolio) ? rit.ritual_portfolio : [] } : {}),
        ...(dev.conversion_triggers ? { conversionTriggers: Array.isArray(dev.conversion_triggers) ? dev.conversion_triggers : [] } : {}),
        ...(dev.barrier_analysis ? { barriers: Array.isArray(dev.barrier_analysis) ? dev.barrier_analysis : [] } : {}),
        ...(dev.pathway_design ? { superfanPortrait: typeof dev.pathway_design === "string" ? dev.pathway_design : JSON.stringify(dev.pathway_design) } : {}),
      };
    },
  },

  "swot-interne": {
    frameworks: ["fw-22-risk-matrix", "fw-23-crisis-playbook"],
    pillar: "r",
    writeback: (outputs) => {
      const risk = outputs["fw-22-risk-matrix"] ?? {};
      const crisis = outputs["fw-23-crisis-playbook"] ?? {};
      return {
        ...(risk.risk_matrix ? { risques: Array.isArray(risk.risk_matrix) ? risk.risk_matrix : [] } : {}),
        ...(risk.mitigation_plans ? { mitigations: Array.isArray(risk.mitigation_plans) ? risk.mitigation_plans : [] } : {}),
        ...(risk.early_warnings ? { forces: Array.isArray(risk.early_warnings) ? risk.early_warnings : [] } : {}),
        ...(risk.contingencies ? { faiblesses: Array.isArray(risk.contingencies) ? risk.contingencies : [] } : {}),
        ...(crisis.crisis_protocols ? { crisisPlaybook: crisis.crisis_protocols } : {}),
        ...(risk.score ? { scoreResilience: risk.score } : {}),
      };
    },
  },

  "swot-externe": {
    frameworks: ["fw-11-brand-market-fit", "fw-12-tam-sam-som"],
    pillar: "t",
    writeback: (outputs) => {
      const bmf = outputs["fw-11-brand-market-fit"] ?? {};
      const tam = outputs["fw-12-tam-sam-som"] ?? {};
      return {
        ...(bmf.gap_analysis ? { concurrents: Array.isArray(bmf.gap_analysis) ? bmf.gap_analysis : [] } : {}),
        ...(tam.market_share_trajectory ? { tendances: Array.isArray(tam.market_share_trajectory) ? tam.market_share_trajectory : [] } : {}),
        ...(bmf.fit_score ? { brandMarketFit: bmf.market_opportunity ?? `Brand-Market Fit score: ${bmf.fit_score}/10` } : {}),
        ...(bmf.repositioning_options ? { validation: { score: bmf.fit_score ?? 0, verdict: bmf.fit_score >= 7 ? "confirme" : "a valider" } } : {}),
        ...(tam.tam ? { tam: tam.tam, sam: tam.sam, som: tam.som } : {}),
      };
    },
  },

  "signaux-opportunites": {
    frameworks: ["fw-10-attribution-model", "fw-17-cohort-analysis"],
    pillar: "t",
    writeback: (outputs) => {
      const attr = outputs["fw-10-attribution-model"] ?? {};
      const cohort = outputs["fw-17-cohort-analysis"] ?? {};
      return {
        ...(attr.optimization_recommendations ? { weakSignals: Array.isArray(attr.optimization_recommendations) ? attr.optimization_recommendations.map((r: any) => ({ signal: r, source: "attribution", force: "moyen" })) : [] } : {}),
        ...(attr.channel_weights ? { opportunities: Array.isArray(attr.channel_weights) ? attr.channel_weights.map((w: any) => ({ opportunite: typeof w === "string" ? w : JSON.stringify(w), timing: "trimestre", effort: "moyen" })) : [] } : {}),
        ...(cohort.insights ? { emergingTrends: Array.isArray(cohort.insights) ? cohort.insights.map((i: any) => ({ trend: typeof i === "string" ? i : JSON.stringify(i), relevance: "haute" })) : [] } : {}),
      };
    },
  },

  "catalogue-actions": {
    frameworks: ["fw-13-90-day-roadmap", "fw-14-campaign-architecture", "fw-15-team-blueprint"],
    pillar: "i",
    writeback: (outputs) => {
      const road = outputs["fw-13-90-day-roadmap"] ?? {};
      const camp = outputs["fw-14-campaign-architecture"] ?? {};
      const team = outputs["fw-15-team-blueprint"] ?? {};
      return {
        ...(road.weekly_plan ? { sprint90Days: road.weekly_plan } : {}),
        ...(camp.content_calendar ? { annualCalendar: camp.content_calendar } : {}),
        ...(camp.campaign_plan ? { catalogueActions: camp.campaign_plan } : {}),
        ...(camp.channel_mix ? { channelMix: camp.channel_mix } : {}),
        ...(camp.budget_allocation ? { budgetAllocation: camp.budget_allocation } : {}),
        ...(team.team_structure ? { teamBlueprint: team.team_structure } : {}),
      };
    },
  },

  "fenetre-overton": {
    frameworks: ["fw-20-brand-evolution", "fw-19-expansion-strategy"],
    pillar: "s",
    writeback: (outputs) => {
      const evo = outputs["fw-20-brand-evolution"] ?? {};
      const exp = outputs["fw-19-expansion-strategy"] ?? {};
      return {
        ...(evo.evolution_roadmap ? { perceptionActuelle: Array.isArray(evo.evolution_roadmap) ? evo.evolution_roadmap[0]?.description ?? "" : typeof evo.evolution_roadmap === "string" ? evo.evolution_roadmap : "" } : {}),
        ...(evo.legacy_plan ? { perceptionCible: typeof evo.legacy_plan === "string" ? evo.legacy_plan : JSON.stringify(evo.legacy_plan) } : {}),
        ...(evo.evolution_roadmap ? { roadmap: Array.isArray(evo.evolution_roadmap) ? evo.evolution_roadmap : [] } : {}),
        ...(evo.pivot_scenarios ? { sprint90Days: Array.isArray(evo.pivot_scenarios) ? evo.pivot_scenarios[0]?.description ?? "" : "" } : {}),
        ...(exp.expansion_priority ? { expansion: exp.expansion_priority } : {}),
        ...(evo.score ? { ovpiScore: evo.score } : {}),
      };
    },
  },

  "profil-superfan": {
    frameworks: ["fw-09-devotion-pathway", "fw-02-persona-constellation"],
    pillar: "e",
    writeback: (outputs) => {
      const dev = outputs["fw-09-devotion-pathway"] ?? {};
      const persona = outputs["fw-02-persona-constellation"] ?? {};
      return {
        ...(dev.pathway_design ? { superfanPortrait: typeof dev.pathway_design === "string" ? dev.pathway_design : JSON.stringify(dev.pathway_design) } : {}),
        ...(dev.conversion_triggers ? { devotionJourney: Array.isArray(dev.conversion_triggers) ? dev.conversion_triggers : [] } : {}),
        ...(persona.segment_priorities ? { idealCustomer: typeof persona.segment_priorities === "string" ? persona.segment_priorities : JSON.stringify(persona.segment_priorities) } : {}),
        ...(dev.acceleration_strategy ? { communityVision: typeof dev.acceleration_strategy === "string" ? dev.acceleration_strategy : JSON.stringify(dev.acceleration_strategy) } : {}),
      };
    },
  },

  "croissance-evolution": {
    frameworks: ["fw-18-growth-loops", "fw-19-expansion-strategy", "fw-21-innovation-pipeline"],
    pillar: "s",
    writeback: (outputs) => {
      const growth = outputs["fw-18-growth-loops"] ?? {};
      const exp = outputs["fw-19-expansion-strategy"] ?? {};
      const innov = outputs["fw-21-innovation-pipeline"] ?? {};
      return {
        ...(growth.loop_designs ? { growthLoops: Array.isArray(growth.loop_designs) ? growth.loop_designs : [] } : {}),
        ...(exp.market_entry_plan ? { expansion: Array.isArray(exp.market_entry_plan) ? exp.market_entry_plan : [] } : {}),
        ...(innov.innovation_pipeline ? { innovationPipeline: Array.isArray(innov.innovation_pipeline) ? innov.innovation_pipeline : [] } : {}),
        ...(innov.priority_matrix ? { evolution: Array.isArray(innov.priority_matrix) ? innov.priority_matrix : [] } : {}),
      };
    },
  },

  "kpis-mesure": {
    frameworks: ["fw-16-kpi-framework"],
    pillar: "e",
    writeback: (outputs) => {
      const kpi = outputs["fw-16-kpi-framework"] ?? {};
      return {
        ...(kpi.kpi_tree ? { kpis: Array.isArray(kpi.kpi_tree) ? kpi.kpi_tree : [] } : {}),
        ...(kpi.targets ? { kpiTargets: kpi.targets } : {}),
        ...(kpi.measurement_cadence ? { measurementCadence: kpi.measurement_cadence } : {}),
      };
    },
  },

  "medias-distribution": {
    frameworks: ["fw-14-campaign-architecture", "fw-10-attribution-model"],
    pillar: "i",
    writeback: (outputs) => {
      const camp = outputs["fw-14-campaign-architecture"] ?? {};
      const attr = outputs["fw-10-attribution-model"] ?? {};
      return {
        ...(camp.channel_mix ? { mediaAllocation: Array.isArray(camp.channel_mix) ? camp.channel_mix : [] } : {}),
        ...(camp.budget_allocation ? { channelStrategy: camp.budget_allocation } : {}),
        ...(attr.roi_by_channel ? { roiByChannel: attr.roi_by_channel } : {}),
      };
    },
  },
};

// ─── Main Enrichment Function ────────────────────────────────────────────────

export async function enrichAllSections(strategyId: string): Promise<{
  enriched: string[];
  skipped: string[];
  failed: string[];
  total: number;
  frameworksExecuted: number;
  message: string;
}> {
  const report = await checkCompleteness(strategyId);
  const incomplete = Object.entries(report)
    .filter(([, status]) => status === "empty" || status === "partial")
    .map(([id]) => id);

  if (incomplete.length === 0) {
    return { enriched: [], skipped: [], failed: [], total: 0, frameworksExecuted: 0, message: "Oracle complet — 21/21 sections." };
  }

  // 1. Collect all needed frameworks (deduplicated)
  const neededFrameworks = new Set<string>();
  const sectionsByFramework = new Map<string, string[]>();

  for (const sectionId of incomplete) {
    const spec = SECTION_ENRICHMENT[sectionId];
    if (!spec) continue;
    for (const fw of spec.frameworks) {
      if (getFramework(fw)) {
        neededFrameworks.add(fw);
        const sections = sectionsByFramework.get(fw) ?? [];
        sections.push(sectionId);
        sectionsByFramework.set(fw, sections);
      }
    }
  }

  if (neededFrameworks.size === 0) {
    return {
      enriched: [],
      skipped: incomplete,
      failed: [],
      total: incomplete.length,
      frameworksExecuted: 0,
      message: `${incomplete.length} sections incompletes mais aucun framework Artemis applicable (sections derivees).`,
    };
  }

  // 2. Topological sort for dependency order
  const sorted = topologicalSort([...neededFrameworks]);

  // 3. Execute frameworks in order, cache outputs
  const frameworkOutputs: Record<string, any> = {};
  let frameworksExecuted = 0;

  // Check for existing recent results (< 1 hour) to avoid re-execution
  const recentResults = await db.frameworkResult.findMany({
    where: {
      strategyId,
      framework: { slug: { in: sorted } },
      createdAt: { gte: new Date(Date.now() - 3600_000) },
    },
    include: { framework: true },
    orderBy: { createdAt: "desc" },
  });

  const recentBySlug = new Map<string, any>();
  for (const r of recentResults) {
    if (!recentBySlug.has(r.framework.slug)) {
      recentBySlug.set(r.framework.slug, r.output);
    }
  }

  for (const slug of sorted) {
    // Reuse recent result if available
    if (recentBySlug.has(slug)) {
      frameworkOutputs[slug] = recentBySlug.get(slug);
      continue;
    }

    try {
      const { output } = await executeFramework(slug, strategyId, {});
      frameworkOutputs[slug] = output;
      frameworksExecuted++;
    } catch (err) {
      console.warn(`[enrichOracle] Framework ${slug} failed:`, err instanceof Error ? err.message : err);
      frameworkOutputs[slug] = null;
    }
  }

  // 4. Writeback: extract fields from framework outputs → pillar content
  const enriched: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];

  for (const sectionId of incomplete) {
    const spec = SECTION_ENRICHMENT[sectionId];
    if (!spec) {
      skipped.push(sectionId);
      continue;
    }

    // Collect outputs for this section's frameworks
    const sectionOutputs: Record<string, any> = {};
    let hasAnyOutput = false;
    for (const fw of spec.frameworks) {
      if (frameworkOutputs[fw]) {
        sectionOutputs[fw] = frameworkOutputs[fw];
        hasAnyOutput = true;
      }
    }

    if (!hasAnyOutput) {
      failed.push(sectionId);
      continue;
    }

    try {
      const newFields = spec.writeback(sectionOutputs);
      if (Object.keys(newFields).length === 0) {
        skipped.push(sectionId);
        continue;
      }

      // Load current pillar content and merge
      const pillar = await db.pillar.findUnique({
        where: { strategyId_key: { strategyId, key: spec.pillar } },
      });

      const currentContent = (pillar?.content ?? {}) as Record<string, unknown>;

      // Merge: only write fields that are empty/missing in current content
      const merged = { ...currentContent };
      for (const [key, value] of Object.entries(newFields)) {
        if (key.startsWith("_")) continue; // Skip internal markers
        const existing = currentContent[key];
        const isEmpty = existing === null || existing === undefined
          || (typeof existing === "string" && existing.length === 0)
          || (Array.isArray(existing) && existing.length === 0);

        if (isEmpty) {
          merged[key] = value;
        }
      }

      if (pillar) {
        await db.pillar.update({
          where: { id: pillar.id },
          data: { content: merged as never },
        });
      } else {
        await db.pillar.create({
          data: { strategyId, key: spec.pillar, content: merged as never },
        });
      }

      enriched.push(sectionId);
    } catch (err) {
      console.warn(`[enrichOracle] Writeback ${sectionId} failed:`, err instanceof Error ? err.message : err);
      failed.push(sectionId);
    }
  }

  return {
    enriched,
    skipped,
    failed,
    total: incomplete.length,
    frameworksExecuted,
    message: `${enriched.length}/${incomplete.length} sections enrichies via ${frameworksExecuted} frameworks Artemis. ${skipped.length} derivees. ${failed.length} echouees.`,
  };
}
