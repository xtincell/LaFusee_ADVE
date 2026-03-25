import { db } from "@/lib/db";
import { type AdvertisVector, createEmptyVector, classifyBrand } from "@/lib/types/advertis-vector";
import { scoreStructural } from "./structural";
import { getQualityModulator } from "./quality-modulator";

export type ScorableType = "strategy" | "campaign" | "mission" | "talentProfile" | "signal" | "gloryOutput" | "brandAsset";

export async function scoreObject(type: ScorableType, id: string): Promise<AdvertisVector> {
  const structuralScores = await scoreStructural(type, id);
  const modulator = await getQualityModulator(type, id);

  const pillars = {
    a: structuralScores.a * modulator,
    d: structuralScores.d * modulator,
    v: structuralScores.v * modulator,
    e: structuralScores.e * modulator,
    r: structuralScores.r * modulator,
    t: structuralScores.t * modulator,
    i: structuralScores.i * modulator,
    s: structuralScores.s * modulator,
  };

  const composite = pillars.a + pillars.d + pillars.v + pillars.e + pillars.r + pillars.t + pillars.i + pillars.s;
  const confidence = computeConfidence(type, structuralScores);

  const vector: AdvertisVector = {
    ...pillars,
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
