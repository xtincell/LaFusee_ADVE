/**
 * DIRECTEURS DE PILIER — 8 gardiens de l'essaim MESTOR (un par lettre ADVERTIS)
 *
 * Rôle : Évaluer la santé, valider les writebacks, gater les séquences.
 * LLM  : NON — logique déterministe basée sur les contrats de maturité.
 *
 * Chaque directeur connaît :
 *   - Son contrat de maturité (INTAKE → ENRICHED → COMPLETE)
 *   - Les séquences GLORY qui lisent/écrivent dans son pilier
 *   - Les piliers dont il dépend (cascade ADVERTIS)
 *   - Les piliers qui dépendent de lui
 */

import { db } from "@/lib/db";
import { PILLAR_KEYS, type PillarKey, getPillarDependencies, getPillarDependents } from "@/lib/types/advertis-vector";
import { assessPillar } from "@/server/services/pillar-maturity/assessor";
import { getContract } from "@/server/services/pillar-maturity/contracts-loader";

// ── Types ──────────────────────────────────────────────────────────────

export interface PillarHealthReport {
  pillarKey: string;
  maturityStage: string;
  completeness: number;          // 0-100
  confidence: number;
  isStale: boolean;
  criticalGaps: string[];        // Missing fields blocking GLORY
  derivableGaps: string[];       // Fields that can be auto-filled
  needsHumanGaps: string[];      // Fields that require human input
  readyForGlory: boolean;        // maturityStage === "COMPLETE"
  dependencies: string[];        // Piliers en amont (cascade ADVERTIS)
  dependents: string[];          // Piliers en aval
}

export interface WritebackVerdict {
  allowed: boolean;
  overwrites: string[];          // Fields with existing values that would be overwritten
  newFields: string[];           // New fields being added
  conflicts: string[];           // Type mismatches or contradictions
  reason?: string;
}

// ── Single pillar director ────────────────────────────────────────────

/**
 * Assess the health of a single pillar.
 * Pure function — no side effects, no DB writes.
 */
export function assessDirector(
  pillarKey: string,
  content: Record<string, unknown> | null,
  confidence: number,
  staleAt: Date | null,
): PillarHealthReport {
  const contract = getContract(pillarKey);
  const assessment = assessPillar(pillarKey, content, contract ?? undefined);

  return {
    pillarKey,
    maturityStage: assessment.currentStage,
    completeness: assessment.completionPct,
    confidence,
    isStale: staleAt !== null,
    criticalGaps: assessment.missing.filter(p => !assessment.derivable.includes(p)),
    derivableGaps: assessment.derivable,
    needsHumanGaps: assessment.needsHuman,
    readyForGlory: assessment.readyForGlory,
    dependencies: getPillarDependencies(pillarKey as PillarKey),
    dependents: getPillarDependents(pillarKey as PillarKey),
  };
}

/**
 * Validate whether a proposed write is safe for this pillar.
 * Checks for overwrites, new fields, and conflicts.
 */
export function validateWriteback(
  pillarKey: string,
  currentContent: Record<string, unknown>,
  proposedChanges: Record<string, unknown>,
  authorSystem: string,
): WritebackVerdict {
  const overwrites: string[] = [];
  const newFields: string[] = [];
  const conflicts: string[] = [];

  for (const [key, value] of Object.entries(proposedChanges)) {
    if (value === undefined || value === null) continue;

    const existing = currentContent[key];

    if (existing === undefined || existing === null) {
      newFields.push(key);
    } else {
      // Check for type mismatch
      const existingType = Array.isArray(existing) ? "array" : typeof existing;
      const proposedType = Array.isArray(value) ? "array" : typeof value;

      if (existingType !== proposedType) {
        conflicts.push(`${key}: type mismatch (existing=${existingType}, proposed=${proposedType})`);
      } else {
        overwrites.push(key);
      }
    }
  }

  // AI systems should not overwrite human-entered fields without explicit approval
  const isAISystem = authorSystem !== "OPERATOR";
  const hasConflicts = conflicts.length > 0;
  const overwritesHumanData = isAISystem && overwrites.length > 0;

  return {
    allowed: !hasConflicts, // Block on conflicts, allow on overwrites (Gateway handles AI_PROPOSED status)
    overwrites,
    newFields,
    conflicts,
    reason: hasConflicts
      ? `${conflicts.length} conflit(s) de type détecté(s)`
      : overwritesHumanData
        ? `${overwrites.length} champ(s) existant(s) seront marqués AI_PROPOSED`
        : undefined,
  };
}

// ── All directors at once ─────────────────────────────────────────────

/**
 * Assess all 8 pillar directors for a strategy in a single DB query.
 */
export async function assessAllDirectors(strategyId: string): Promise<PillarHealthReport[]> {
  const pillars = await db.pillar.findMany({
    where: { strategyId },
    select: { key: true, content: true, confidence: true, staleAt: true },
  });

  const pillarMap = new Map(pillars.map(p => [p.key, p]));
  const reports: PillarHealthReport[] = [];

  for (const key of PILLAR_KEYS) {
    const pillar = pillarMap.get(key);
    reports.push(assessDirector(
      key,
      (pillar?.content ?? null) as Record<string, unknown> | null,
      pillar?.confidence ?? 0,
      pillar?.staleAt ?? null,
    ));
  }

  return reports;
}

/**
 * Check if a specific sequence can execute based on pillar director gates.
 * A sequence can run if all its required pillars are at sufficient maturity.
 */
export function canExecuteSequence(
  sequenceRequiredPillars: PillarKey[],
  pillarHealth: PillarHealthReport[],
  requireComplete: boolean = false,
): { allowed: boolean; blockedBy: string[] } {
  const blocked: string[] = [];

  for (const key of sequenceRequiredPillars) {
    const health = pillarHealth.find(h => h.pillarKey === key);
    if (!health) {
      blocked.push(`${key}: pilier introuvable`);
      continue;
    }
    if (requireComplete && !health.readyForGlory) {
      blocked.push(`${key}: maturity ${health.maturityStage}, COMPLETE requis`);
    } else if (health.completeness < 20) {
      blocked.push(`${key}: complétude ${health.completeness}% trop basse (min 20%)`);
    }
    if (health.isStale) {
      blocked.push(`${key}: marqué stale — actualiser d'abord`);
    }
  }

  return { allowed: blocked.length === 0, blockedBy: blocked };
}
