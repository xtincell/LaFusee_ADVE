// ============================================================================
// MODULE M02 — AdvertisVector & Scorer
// Score: 70/100 | Priority: P0 | Status: FUNCTIONAL
// Spec: §2.1 + §4.1 | Division: Transversal
// ============================================================================
//
// CdC REQUIREMENTS (V1):
// [x] REQ-1  scoreObject(type, id) → AdvertisVector pour tout objet (strategy, campaign, mission, talent, signal, glory, asset)
// [x] REQ-2  Score structurel par pilier: (atomes/requis*15) + (collections/totales*7) + (cross_refs/requises*3) max 25
// [x] REQ-3  Quality modulator (AI-assessed content quality coefficient)
// [x] REQ-4  Business context weights (pillar emphasis varies by sector/positioning)
// [x] REQ-5  Classification Zombie→Icône (6 niveaux basés sur composite /200)
// [x] REQ-6  Campaign + Mission scoring (campaign pillar inputs from 13 relations)
// [x] REQ-7  Confidence score (based on filled pillars ratio)
// [x] REQ-8  Auto-signal on significant score change (>10% pillar or >15pt composite)
// [x] REQ-9  Re-entrancy guard preventing infinite scoreObject↔processSignal loops
// [ ] REQ-10 batchScore optimisé (router procedure existe, performance bulk à optimiser)
// [x] REQ-11 Audit trail logging on every score recalculation
// [ ] REQ-12 Score history persistence (ScoreSnapshot model) — automatic periodic snapshots
//
// EXPORTS: scoreObject, batchScore, ScorableType
// ============================================================================

import { db } from "@/lib/db";
import { type AdvertisVector, type PillarKey, PILLAR_KEYS, createEmptyVector, classifyBrand } from "@/lib/types/advertis-vector";
import { type BusinessContext, getPillarWeightsForContext } from "@/lib/types/business-context";
import { scoreStructural } from "./structural";
import { getQualityModulator } from "./quality-modulator";
import * as auditTrail from "@/server/services/audit-trail";

export type ScorableType = "strategy" | "campaign" | "mission" | "talentProfile" | "signal" | "gloryOutput" | "brandAsset";

/**
 * Re-entrancy guard: prevents infinite scoreObject ↔ processSignal loops.
 * When scoreObject detects a significant change it creates a Signal and calls
 * processSignal, which in turn calls scoreObject again. The guard ensures the
 * nested call still produces the vector but does NOT emit another Signal, thus
 * breaking the cycle.
 */
const _scoringInProgress = new Set<string>();

export async function scoreObject(type: ScorableType, id: string): Promise<AdvertisVector> {
  const scoringKey = `${type}:${id}`;
  const isReentrant = _scoringInProgress.has(scoringKey);
  _scoringInProgress.add(scoringKey);

  try {
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

    // Audit trail for score change (non-blocking)
    auditTrail.log({
      action: "UPDATE",
      entityType: type.charAt(0).toUpperCase() + type.slice(1),
      entityId: id,
      newValue: { composite: vector.composite, confidence: vector.confidence, trigger: "score_recalculation" },
    }).catch((err) => { console.warn("[audit-trail] log failed:", err instanceof Error ? err.message : err); });

    // -----------------------------------------------------------------------
    // Auto-signal on significant score change — SKIPPED if re-entrant to
    // prevent infinite scoreObject → processSignal → scoreObject loops.
    // -----------------------------------------------------------------------
    if (!isReentrant) {
      await detectAndSignalScoreChange(type, id, vector);
    }

    return vector;
  } finally {
    _scoringInProgress.delete(scoringKey);
  }
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

/**
 * Detect significant score changes and create a Signal + trigger feedback loop.
 *
 * "Significant" = any pillar changed by >10 % (relative) OR composite changed by >15 points.
 * The Signal type is SCORE_IMPROVEMENT or SCORE_DECLINE depending on direction.
 */
async function detectAndSignalScoreChange(
  type: ScorableType,
  id: string,
  newVector: AdvertisVector
): Promise<void> {
  try {
    // Resolve the strategyId so we can look up previous scores
    let strategyId: string | null = null;

    if (type === "strategy") {
      strategyId = id;
    } else if (type === "campaign") {
      const c = await db.campaign.findUnique({ where: { id }, select: { strategyId: true } });
      strategyId = c?.strategyId ?? null;
    } else if (type === "mission") {
      const m = await db.mission.findUnique({ where: { id }, select: { strategyId: true } });
      strategyId = m?.strategyId ?? null;
    }

    if (!strategyId) return;

    // Load the most recent ScoreSnapshot as the "previous" baseline
    const previousSnapshot = await db.scoreSnapshot.findFirst({
      where: { strategyId },
      orderBy: { measuredAt: "desc" },
    });

    if (!previousSnapshot) return; // No previous data to compare against

    const previousVector = previousSnapshot.advertis_vector as Record<string, number>;

    // Check each pillar for >10 % relative change
    const changedPillars: Array<{ key: PillarKey; prev: number; curr: number; pct: number }> = [];

    for (const key of PILLAR_KEYS) {
      const prev = previousVector[key] ?? 0;
      const curr = newVector[key] ?? 0;
      if (prev === 0 && curr === 0) continue;
      const relativePct = prev !== 0
        ? Math.abs((curr - prev) / prev) * 100
        : (curr !== 0 ? 100 : 0);
      if (relativePct > 10) {
        changedPillars.push({ key, prev, curr, pct: Math.round(relativePct * 100) / 100 });
      }
    }

    // Check composite for >15-point absolute change
    const prevComposite = previousVector.composite ?? 0;
    const currComposite = newVector.composite;
    const compositeAbsDelta = Math.abs(currComposite - prevComposite);
    const compositeSignificant = compositeAbsDelta > 15;

    if (changedPillars.length === 0 && !compositeSignificant) return;

    // Determine direction: improvement or decline (based on composite)
    const direction = currComposite >= prevComposite ? "SCORE_IMPROVEMENT" : "SCORE_DECLINE";

    // Create the Signal record
    const signal = await db.signal.create({
      data: {
        strategyId,
        type: direction,
        data: {
          scoredType: type,
          scoredId: id,
          changedPillars,
          compositeDelta: {
            previous: prevComposite,
            current: currComposite,
            absoluteDelta: Math.round(compositeAbsDelta * 100) / 100,
            significant: compositeSignificant,
          },
        },
      },
    });

    // Trigger the feedback loop (lazy import to avoid circular module dependency)
    const { processSignal } = await import("@/server/services/feedback-loop");
    await processSignal(signal.id);
  } catch {
    // Best-effort: scoring should never fail because of signal creation
  }
}

async function persistVector(type: ScorableType, id: string, vector: AdvertisVector): Promise<void> {
  try {
    const data = { advertis_vector: vector };
    const where = { id };
    switch (type) {
      case "strategy": await db.strategy.update({ where, data }); break;
      case "campaign": await db.campaign.update({ where, data }); break;
      case "mission": await db.mission.update({ where, data }); break;
      case "talentProfile": await db.talentProfile.update({ where, data }); break;
      case "signal": await db.signal.update({ where, data }); break;
      case "gloryOutput": await db.gloryOutput.update({ where, data }); break;
      case "brandAsset": break; // BrandAsset does not have advertis_vector column
    }
  } catch {
    // Silently fail if model doesn't support advertis_vector yet
  }
}
