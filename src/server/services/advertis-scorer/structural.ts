import { db } from "@/lib/db";
import type { PillarKey } from "@/lib/types/advertis-vector";
import { PILLAR_KEYS } from "@/lib/types/advertis-vector";
import { scorePillarStructural, type PillarScoreInput } from "@/lib/utils/scoring";
import type { ScorableType } from "./index";

/**
 * Deterministic structural scoring per pillar.
 * Formula from Annexe G: score = (atomes/requis * 15) + (collections/totales * 7) + (cross_refs/requises * 3)
 * Max 25 per pillar.
 *
 * This function MUST produce identical results for identical inputs (variance = 0).
 */
export async function scoreStructural(
  type: ScorableType,
  id: string
): Promise<Record<PillarKey, number>> {
  const scores: Record<string, number> = {};

  for (const pillar of PILLAR_KEYS) {
    const input = await getPillarInputs(type, id, pillar);
    scores[pillar] = scorePillarStructural(input);
  }

  return scores as Record<PillarKey, number>;
}

/**
 * Retrieves the structural input counts for a given pillar.
 * Counts atoms (filled fields), collections (complete groups), and cross-references.
 */
async function getPillarInputs(
  type: ScorableType,
  id: string,
  pillar: PillarKey
): Promise<PillarScoreInput> {
  if (type === "strategy") {
    return getStrategyPillarInputs(id, pillar);
  }
  if (type === "campaign") {
    return getCampaignPillarInputs(id, pillar);
  }
  if (type === "mission") {
    return getMissionPillarInputs(id, pillar);
  }

  // Default: return empty inputs for types not yet implemented
  return {
    atomesValides: 0,
    atomesRequis: 1,
    collectionsCompletes: 0,
    collectionsTotales: 1,
    crossRefsValides: 0,
    crossRefsRequises: 1,
  };
}

async function getStrategyPillarInputs(
  strategyId: string,
  pillar: PillarKey
): Promise<PillarScoreInput> {
  // Get the pillar content for this strategy
  const pillarContent = await db.pillar.findUnique({
    where: { strategyId_key: { strategyId, key: pillar } },
  });

  if (!pillarContent?.content) {
    return {
      atomesValides: 0,
      atomesRequis: getRequiredAtoms(pillar),
      collectionsCompletes: 0,
      collectionsTotales: getRequiredCollections(pillar),
      crossRefsValides: 0,
      crossRefsRequises: getRequiredCrossRefs(pillar),
    };
  }

  const content = pillarContent.content as Record<string, unknown>;
  const filledFields = Object.values(content).filter(
    (v) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)
  ).length;

  return {
    atomesValides: filledFields,
    atomesRequis: getRequiredAtoms(pillar),
    collectionsCompletes: countCompleteCollections(content, pillar),
    collectionsTotales: getRequiredCollections(pillar),
    crossRefsValides: countCrossRefs(content),
    crossRefsRequises: getRequiredCrossRefs(pillar),
  };
}

// Required counts per pillar (from Annexe H ontology)
function getRequiredAtoms(pillar: PillarKey): number {
  const counts: Record<PillarKey, number> = {
    a: 12, // Vision, mission, mythe fondateur, valeurs, archétype, etc.
    d: 10, // Positionnement, identité visuelle, voix, dialectes
    v: 8,  // Promesse, sacrements, expérience
    e: 10, // Devotion ladder, temples, rituels, clergé
    r: 8,  // SWOT, risques, mitigation, crise
    t: 6,  // KPIs, validation marché, scoring
    i: 8,  // Roadmap, budget, équipe, campagnes
    s: 6,  // Synthèse, bible, playbooks, guidelines
  };
  return counts[pillar];
}

function getRequiredCollections(pillar: PillarKey): number {
  const counts: Record<PillarKey, number> = {
    a: 3, d: 3, v: 2, e: 3, r: 2, t: 2, i: 2, s: 2,
  };
  return counts[pillar];
}

function getRequiredCrossRefs(pillar: PillarKey): number {
  const counts: Record<PillarKey, number> = {
    a: 2, d: 2, v: 2, e: 2, r: 1, t: 1, i: 2, s: 3,
  };
  return counts[pillar];
}

function countCompleteCollections(content: Record<string, unknown>, _pillar: PillarKey): number {
  // Count arrays that have at least 2 items as "complete collections"
  return Object.values(content).filter(
    (v) => Array.isArray(v) && v.length >= 2
  ).length;
}

function countCrossRefs(content: Record<string, unknown>): number {
  // Count fields that reference other entities (strings starting with strategy_, driver_, etc.)
  return Object.values(content).filter(
    (v) => typeof v === "string" && /^(strategy_|driver_|campaign_|mission_)/.test(v)
  ).length;
}

// ============================================================================
// CAMPAIGN SCORING
// ============================================================================

/**
 * Score campaigns by evaluating operational completeness per ADVE pillar.
 * A = objectives clarity, D = creative assets, V = budget/value, E = team/engagement,
 * R = risk (milestones), T = tracking (AARRR), I = implementation (actions/executions),
 * S = strategy (briefs/reports)
 */
async function getCampaignPillarInputs(
  campaignId: string,
  pillar: PillarKey
): Promise<PillarScoreInput> {
  const campaign = await db.campaign.findUnique({
    where: { id: campaignId },
    include: {
      actions: true,
      amplifications: true,
      teamMembers: true,
      milestones: true,
      approvals: true,
      assets: true,
      briefs: true,
      reports: true,
      fieldOps: true,
      aarrMetrics: true,
      budgetLines: true,
      links: true,
    },
  });

  if (!campaign) {
    return { atomesValides: 0, atomesRequis: 1, collectionsCompletes: 0, collectionsTotales: 1, crossRefsValides: 0, crossRefsRequises: 1 };
  }

  const obj = campaign.objectives as Record<string, unknown> | null;
  const vec = campaign.advertis_vector as Record<string, number> | null;

  // Pillar-specific scoring inputs
  const pillarMap: Record<PillarKey, PillarScoreInput> = {
    a: {
      // Authenticité — objectives, description, ADVE vector
      atomesValides: (obj?.description ? 1 : 0) + (campaign.name ? 1 : 0) + (vec?.a ? 1 : 0) + (campaign.startDate ? 1 : 0) + (campaign.endDate ? 1 : 0),
      atomesRequis: 5,
      collectionsCompletes: campaign.links.length >= 1 ? 1 : 0,
      collectionsTotales: 1,
      crossRefsValides: campaign.strategyId ? 1 : 0,
      crossRefsRequises: 1,
    },
    d: {
      // Distinction — creative assets, approvals
      atomesValides: Math.min(campaign.assets.length, 5),
      atomesRequis: 5,
      collectionsCompletes: campaign.assets.length >= 3 ? 1 : 0,
      collectionsTotales: 1,
      crossRefsValides: campaign.approvals.filter((a) => a.status === "APPROVED").length > 0 ? 1 : 0,
      crossRefsRequises: 1,
    },
    v: {
      // Valeur — budget, budget lines
      atomesValides: (campaign.budget ? 1 : 0) + Math.min(campaign.budgetLines.length, 4),
      atomesRequis: 5,
      collectionsCompletes: campaign.budgetLines.length >= 3 ? 1 : 0,
      collectionsTotales: 1,
      crossRefsValides: campaign.amplifications.length > 0 ? 1 : 0,
      crossRefsRequises: 1,
    },
    e: {
      // Engagement — team, field ops
      atomesValides: Math.min(campaign.teamMembers.length, 4) + Math.min(campaign.fieldOps.length, 2),
      atomesRequis: 6,
      collectionsCompletes: campaign.teamMembers.length >= 3 ? 1 : 0,
      collectionsTotales: 1,
      crossRefsValides: campaign.fieldOps.length > 0 ? 1 : 0,
      crossRefsRequises: 1,
    },
    r: {
      // Risk — milestones as risk controls
      atomesValides: Math.min(campaign.milestones.length, 5),
      atomesRequis: 5,
      collectionsCompletes: campaign.milestones.filter((m) => m.completed).length >= 1 ? 1 : 0,
      collectionsTotales: 1,
      crossRefsValides: 0,
      crossRefsRequises: 1,
    },
    t: {
      // Track — AARRR metrics, amplification metrics
      atomesValides: Math.min(campaign.aarrMetrics.length, 3) + (campaign.amplifications.length > 0 ? 1 : 0),
      atomesRequis: 4,
      collectionsCompletes: campaign.aarrMetrics.length >= 3 ? 1 : 0,
      collectionsTotales: 1,
      crossRefsValides: campaign.reports.length > 0 ? 1 : 0,
      crossRefsRequises: 1,
    },
    i: {
      // Implementation — actions, executions
      atomesValides: Math.min(campaign.actions.length, 6),
      atomesRequis: 6,
      collectionsCompletes: campaign.actions.length >= 3 ? 1 : 0,
      collectionsTotales: 1,
      crossRefsValides: campaign.links.length > 0 ? 1 : 0,
      crossRefsRequises: 1,
    },
    s: {
      // Stratégie — briefs, reports
      atomesValides: Math.min(campaign.briefs.length, 3) + Math.min(campaign.reports.length, 2),
      atomesRequis: 5,
      collectionsCompletes: campaign.briefs.length >= 2 ? 1 : 0,
      collectionsTotales: 1,
      crossRefsValides: campaign.strategyId ? 1 : 0,
      crossRefsRequises: 1,
    },
  };

  return pillarMap[pillar];
}

// ============================================================================
// MISSION SCORING
// ============================================================================

async function getMissionPillarInputs(
  missionId: string,
  pillar: PillarKey
): Promise<PillarScoreInput> {
  const mission = await db.mission.findUnique({
    where: { id: missionId },
    include: { deliverables: true },
  });

  if (!mission) {
    return { atomesValides: 0, atomesRequis: 1, collectionsCompletes: 0, collectionsTotales: 1, crossRefsValides: 0, crossRefsRequises: 1 };
  }

  const briefData = mission.briefData as Record<string, unknown> | null;
  const delivCount = mission.deliverables.length;
  const briefFields = briefData ? Object.values(briefData).filter((v) => v !== null && v !== undefined && v !== "").length : 0;

  // Simplified scoring: missions are mostly about Implementation + Distinction
  const baseAtoms = briefFields + delivCount + (mission.assigneeId ? 1 : 0) + (mission.description ? 1 : 0);
  const totalReq = pillar === "i" ? 6 : pillar === "d" ? 4 : 3;

  return {
    atomesValides: Math.min(baseAtoms, totalReq),
    atomesRequis: totalReq,
    collectionsCompletes: delivCount >= 2 ? 1 : 0,
    collectionsTotales: 1,
    crossRefsValides: (mission.strategyId ? 1 : 0) + (mission.campaignId ? 1 : 0),
    crossRefsRequises: 2,
  };
}
