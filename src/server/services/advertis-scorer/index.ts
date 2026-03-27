import { db } from "@/lib/db";
import { type AdvertisVector, type PillarKey, PILLAR_KEYS, createEmptyVector, classifyBrand } from "@/lib/types/advertis-vector";
import { type BusinessContext, getPillarWeightsForContext } from "@/lib/types/business-context";
import { scoreStructural } from "./structural";
import { getQualityModulator } from "./quality-modulator";

export type ScorableType = "strategy" | "campaign" | "mission" | "talentProfile" | "signal" | "gloryOutput" | "brandAsset";

export async function scoreObject(type: ScorableType, id: string): Promise<AdvertisVector> {
  const structuralScores = await scoreStructural(type, id);
  const modulator = await getQualityModulator(type, id);

  // Load business context weights if scoring a strategy
  const bizWeights = await getBusinessContextWeights(type, id);

  const pillars: Record<string, number> = {};
  for (const key of PILLAR_KEYS) {
    pillars[key] = structuralScores[key] * modulator * bizWeights[key];
  }

  const composite = PILLAR_KEYS.reduce((sum, key) => sum + (pillars[key] ?? 0), 0);
  const confidence = computeConfidence(type, structuralScores);

  const vector: AdvertisVector = {
    a: pillars.a ?? 0, d: pillars.d ?? 0, v: pillars.v ?? 0, e: pillars.e ?? 0,
    r: pillars.r ?? 0, t: pillars.t ?? 0, i: pillars.i ?? 0, s: pillars.s ?? 0,
    composite: Math.round(composite * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
  };

  // Persist the vector on the scored object
  await persistVector(type, id, vector);

  return vector;
}

export async function batchScore(type: ScorableType, ids: string[]): Promise<AdvertisVector[]> {
  return Promise.all(ids.map((id) => scoreObject(type, id)));
}

/**
 * Loads business context from the strategy and returns pillar weight modifiers.
 * For non-strategy types, attempts to resolve the parent strategy.
 */
async function getBusinessContextWeights(
  type: ScorableType,
  id: string
): Promise<Record<PillarKey, number>> {
  const defaultWeights: Record<PillarKey, number> = { a: 1, d: 1, v: 1, e: 1, r: 1, t: 1, i: 1, s: 1 };

  try {
    let strategyId: string | null = null;

    if (type === "strategy") {
      strategyId = id;
    } else if (type === "campaign") {
      const campaign = await db.campaign.findUnique({ where: { id }, select: { strategyId: true } });
      strategyId = campaign?.strategyId ?? null;
    } else if (type === "mission") {
      const mission = await db.mission.findUnique({ where: { id }, select: { strategyId: true } });
      strategyId = mission?.strategyId ?? null;
    }

    if (!strategyId) return defaultWeights;

    const strategy = await db.strategy.findUnique({
      where: { id: strategyId },
      select: { businessContext: true },
    });

    if (!strategy?.businessContext) return defaultWeights;

    const ctx = strategy.businessContext as unknown as BusinessContext;
    if (!ctx.businessModel || !ctx.positioningArchetype) return defaultWeights;

    return getPillarWeightsForContext(ctx);
  } catch {
    return defaultWeights;
  }
}

function computeConfidence(type: ScorableType, scores: Record<string, number>): number {
  const filledPillars = Object.values(scores).filter((s) => s > 0).length;
  const baseConfidence = filledPillars / 8;
  // Quick intake has lower confidence
  if (type === "strategy") return Math.min(0.95, baseConfidence * 0.9);
  return Math.min(0.95, baseConfidence * 0.8);
}

async function persistVector(type: ScorableType, id: string, vector: AdvertisVector): Promise<void> {
  const modelMap: Record<ScorableType, string> = {
    strategy: "strategy",
    campaign: "campaign",
    mission: "mission",
    talentProfile: "talentProfile",
    signal: "signal",
    gloryOutput: "gloryOutput",
    brandAsset: "brandAsset",
  };

  const model = modelMap[type];
  if (!model) return;

  try {
    await (db as any)[model].update({
      where: { id },
      data: { advertis_vector: vector },
    });
  } catch {
    // Silently fail if model doesn't support advertis_vector yet
  }
}
