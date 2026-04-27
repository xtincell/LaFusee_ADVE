import { db } from "@/lib/db";
import { PILLAR_KEYS, PILLAR_NAMES, type PillarKey } from "@/lib/types/advertis-vector";
import type { BusinessContext } from "@/lib/types/business-context";
import { getPillarWeightsForContext } from "@/lib/types/business-context";
import {
  validatePillar,
  type PillarValidation,
  type ValidationLevel,
} from "@/lib/utils/pillar-validation";
import { captureEvent } from "@/server/services/knowledge-capture";

// ============================================================================
// ARTEMIS Conditional Sequencer
// ----------------------------------------------------------------------------
// Genere une sequence ordonnee de piliers a travailler en fonction de :
//  1. Le niveau de validation actuel (EMPTY > STARTED > PARTIAL > COHERENT > VALIDATED)
//  2. La dependance entre piliers (A est prerequis de D, V, E, etc.)
//  3. Les poids du business context (un pilier important pour le modele est priorise)
//  4. La criticite (pilier sous-score severement = urgent)
//
// Sortie : un plan d'execution avec rationale par pilier et recommandation initiale.
// ============================================================================

export type SequenceStatus = "TO_DO" | "IN_PROGRESS" | "VALIDATED" | "BLOCKED" | "OPTIONAL";

export interface PillarStep {
  pillar: PillarKey;
  pillarName: string;
  status: SequenceStatus;
  validation: PillarValidation;
  priorityScore: number;
  rationale: string;
  prerequisitesMet: boolean;
  blockingPillars: PillarKey[];
  weight: number;
  estimatedDurationMin: number;
}

export interface SequencePlan {
  strategyId: string;
  steps: PillarStep[];
  recommendedNextPillar: PillarKey | null;
  recommendedReason: string;
  globalProgress: number;
  validatedCount: number;
  startedCount: number;
  pendingCount: number;
  hasBusinessContext: boolean;
  cycleTotalMin: number;
}

/**
 * Dependances structurelles ARTEMIS :
 * - D (Distinction) suppose A (Authenticite) — on ne se differencie pas si on
 *   ne sait pas qui on est.
 * - V (Valeur) suppose A et D — la promesse decoule de l'identite et du positionnement.
 * - E (Engagement) suppose V — on n'engage pas une communaute autour d'une promesse vide.
 * - R, T peuvent demarrer en parallele de A/D mais beneficient de V.
 * - I (Implementation) suppose A, D, V, E (couche execution).
 * - S (Strategie) est la consolidation finale — suppose tous les autres.
 */
const PREREQUISITES: Record<PillarKey, PillarKey[]> = {
  a: [],
  d: ["a"],
  v: ["a", "d"],
  e: ["v"],
  r: [],
  t: [],
  i: ["a", "d", "v", "e"],
  s: ["a", "d", "v", "e", "r", "t", "i"],
};

const ESTIMATED_DURATION_MIN: Record<PillarKey, number> = {
  a: 25, d: 20, v: 20, e: 15, r: 10, t: 10, i: 15, s: 15,
};

/**
 * Niveau auquel un pilier est considere "satisfait" pour debloquer ses dependants.
 */
function isUnblocking(level: ValidationLevel): boolean {
  return level === "PARTIAL" || level === "COHERENT" || level === "VALIDATED";
}

/**
 * Score de priorite pour ordonner la sequence.
 * Plus eleve = a faire en premier.
 *
 * Composition :
 *   + 100 si pilier non demarre (EMPTY)
 *   +  60 si STARTED ou PARTIAL
 *   +   0 si COHERENT ou VALIDATED
 *   + (1 - atomsRatio) * 40         (gap structurel)
 *   + weight * 25                   (importance pour le business model)
 *   - depth dans le graphe * 5      (pilieurs prerequis avant les autres)
 *   = -100 si prerequisites non satisfaits (sera classifie BLOCKED)
 */
function computePriority(
  validation: PillarValidation,
  weight: number,
  prerequisitesMet: boolean,
  depth: number
): number {
  if (!prerequisitesMet) return -100;

  let score = 0;
  if (validation.level === "EMPTY") score += 100;
  else if (validation.level === "STARTED" || validation.level === "PARTIAL") score += 60;
  else if (validation.level === "COHERENT") score += 20;

  score += (1 - validation.atomsRatio) * 40;
  score += weight * 25;
  score -= depth * 5;

  return Math.round(score * 10) / 10;
}

/**
 * Profondeur d'un pilier dans le graphe de prerequis. Detecte les cycles.
 */
function getDepth(
  pillar: PillarKey,
  memo: Map<PillarKey, number> = new Map(),
  stack: Set<PillarKey> = new Set()
): number {
  if (memo.has(pillar)) return memo.get(pillar)!;
  if (stack.has(pillar)) {
    // Cycle detecte : couper a 0 pour eviter la recursion infinie
    return 0;
  }
  const prereqs = PREREQUISITES[pillar];
  if (prereqs.length === 0) {
    memo.set(pillar, 0);
    return 0;
  }
  stack.add(pillar);
  const max = Math.max(...prereqs.map((p) => getDepth(p, memo, stack)));
  stack.delete(pillar);
  const d = max + 1;
  memo.set(pillar, d);
  return d;
}

/**
 * Genere le rationale lisible humainement pour un pilier.
 */
function buildRationale(
  pillar: PillarKey,
  validation: PillarValidation,
  prerequisitesMet: boolean,
  blocking: PillarKey[],
  weight: number,
  bizContext: BusinessContext | null
): string {
  if (!prerequisitesMet) {
    const blockingNames = blocking.map((p) => PILLAR_NAMES[p]).join(", ");
    return `Verrouille — necessite la cohérence prealable de : ${blockingNames}`;
  }

  if (validation.level === "VALIDATED") {
    return `Pilier validé (${validation.projectedScore.toFixed(1)}/25). Aucune action requise.`;
  }

  if (validation.level === "COHERENT") {
    return `Cohérent (${validation.projectedScore.toFixed(1)}/25) — affiner les cross-references pour valider pleinement.`;
  }

  const reasons: string[] = [];

  if (validation.level === "EMPTY") {
    reasons.push(`Pilier non démarré`);
  } else if (validation.level === "STARTED") {
    reasons.push(`Démarré mais sous le seuil de cohérence (${(validation.atomsRatio * 100).toFixed(0)}% d'atomes)`);
  } else {
    reasons.push(`Partiel (${(validation.atomsRatio * 100).toFixed(0)}% d'atomes, ${(validation.collectionsRatio * 100).toFixed(0)}% de collections)`);
  }

  if (weight >= 1.2 && bizContext) {
    reasons.push(`pilier critique pour le modele ${bizContext.businessModel}`);
  }
  if (validation.projectedScore < 8) {
    reasons.push(`zone critique (score projeté ${validation.projectedScore.toFixed(1)}/25)`);
  }

  return reasons.join(" — ");
}

/**
 * Calcule le statut UI de chaque pilier.
 */
function deriveStatus(
  validation: PillarValidation,
  prerequisitesMet: boolean
): SequenceStatus {
  if (!prerequisitesMet) return "BLOCKED";
  if (validation.level === "VALIDATED") return "VALIDATED";
  if (validation.level === "EMPTY") return "TO_DO";
  return "IN_PROGRESS";
}

/**
 * Determine l'ordre recommandé de progression pour un strategy donné.
 */
export async function planSequence(strategyId: string): Promise<SequencePlan> {
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    include: { pillars: true },
  });

  if (!strategy) {
    throw new Error(`Strategy ${strategyId} not found`);
  }

  const bizContext = (strategy.businessContext as unknown as BusinessContext) ?? null;
  const weights = bizContext?.businessModel && bizContext?.positioningArchetype
    ? getPillarWeightsForContext(bizContext)
    : ({ a: 1, d: 1, v: 1, e: 1, r: 1, t: 1, i: 1, s: 1 } as Record<PillarKey, number>);

  // Construire la map des validations
  const validations = new Map<PillarKey, PillarValidation>();
  for (const key of PILLAR_KEYS) {
    const pillarRow = strategy.pillars.find((p) => p.key === key);
    const content = (pillarRow?.content ?? null) as Record<string, unknown> | null;
    const confidence = pillarRow?.confidence ?? 0;
    validations.set(key, validatePillar(key, content, confidence));
  }

  // Construire les steps
  const depthMemo = new Map<PillarKey, number>();
  const steps: PillarStep[] = PILLAR_KEYS.map((pillar) => {
    const validation = validations.get(pillar)!;
    const prereqs = PREREQUISITES[pillar];
    const blocking = prereqs.filter((p) => !isUnblocking(validations.get(p)!.level));
    const prerequisitesMet = blocking.length === 0;
    const weight = weights[pillar] ?? 1;
    const depth = getDepth(pillar, depthMemo);
    const priorityScore = computePriority(validation, weight, prerequisitesMet, depth);
    const status = deriveStatus(validation, prerequisitesMet);
    const rationale = buildRationale(pillar, validation, prerequisitesMet, blocking, weight, bizContext);

    return {
      pillar,
      pillarName: PILLAR_NAMES[pillar],
      status,
      validation,
      priorityScore,
      rationale,
      prerequisitesMet,
      blockingPillars: blocking,
      weight: Math.round(weight * 100) / 100,
      estimatedDurationMin: ESTIMATED_DURATION_MIN[pillar],
    };
  });

  // Trier par priorité décroissante (mais garder l'ordre A→S pour affichage stable)
  // Ici on préserve l'ordre A→D→V→E→R→T→I→S pour l'UI mais on calcule la "next"
  const candidates = steps
    .filter((s) => s.status === "TO_DO" || s.status === "IN_PROGRESS")
    .sort((a, b) => b.priorityScore - a.priorityScore);

  let recommendedNext: PillarKey | null = null;
  let recommendedReason = "";

  if (candidates.length === 0) {
    const allValidated = steps.every((s) => s.status === "VALIDATED");
    recommendedReason = allValidated
      ? "Tous les piliers sont validés — la marque est calibrée."
      : "Tous les piliers actionnables sont bloqués par des prérequis manquants.";
  } else {
    const top = candidates[0]!;
    recommendedNext = top.pillar;
    if (top.status === "TO_DO") {
      recommendedReason = `Démarrer par ${top.pillarName} : ${top.rationale}`;
    } else {
      recommendedReason = `Continuer ${top.pillarName} : ${top.rationale}`;
    }
  }

  const validatedCount = steps.filter((s) => s.status === "VALIDATED").length;
  const startedCount = steps.filter((s) => s.status === "IN_PROGRESS").length;
  const pendingCount = steps.filter((s) => s.status === "TO_DO" || s.status === "BLOCKED").length;
  const globalProgress = steps.reduce((sum, s) => sum + s.validation.projectedScore, 0) / (8 * 25);
  const cycleTotalMin = steps
    .filter((s) => s.status !== "VALIDATED")
    .reduce((sum, s) => sum + s.estimatedDurationMin, 0);

  return {
    strategyId,
    steps,
    recommendedNextPillar: recommendedNext,
    recommendedReason,
    globalProgress: Math.round(globalProgress * 1000) / 1000,
    validatedCount,
    startedCount,
    pendingCount,
    hasBusinessContext: bizContext !== null,
    cycleTotalMin,
  };
}

/**
 * Marque un pilier comme "ouvert pour edition" — utilise par l'UI pour passer
 * en mode focus sur un pilier specifique. Met aussi a jour la confidence si fournie.
 */
export async function openPillarForEdit(
  strategyId: string,
  pillar: PillarKey
): Promise<PillarStep> {
  const plan = await planSequence(strategyId);
  const step = plan.steps.find((s) => s.pillar === pillar);
  if (!step) throw new Error(`Pillar ${pillar} not in plan`);
  if (step.status === "BLOCKED") {
    throw new Error(
      `Le pilier ${PILLAR_NAMES[pillar]} est bloqué. Travailler d'abord : ${step.blockingPillars.map((p) => PILLAR_NAMES[p]).join(", ")}`
    );
  }
  return step;
}

/**
 * Met a jour le contenu d'un pilier (merge avec l'existant) et recalcule la validation.
 *
 * Utilise une transaction Prisma serialisee pour eliminer la race condition :
 * deux advance() concurrents sur le meme pilier ne peuvent plus s'ecraser
 * mutuellement.
 */
export async function updatePillarContent(
  strategyId: string,
  pillar: PillarKey,
  patch: Record<string, unknown>,
  confidence?: number
): Promise<{ step: PillarStep; plan: SequencePlan; previousLevel: ValidationLevel; newLevel: ValidationLevel }> {
  // Read-modify-write encapsule dans une transaction
  const { previousLevel, newLevel } = await db.$transaction(async (tx) => {
    const existing = await tx.pillar.findUnique({
      where: { strategyId_key: { strategyId, key: pillar } },
    });

    const previousContent = sanitizeIncomingContent(existing?.content);
    const previousValidation = validatePillar(pillar, previousContent, existing?.confidence ?? 0);
    const previousLevel = previousValidation.level;

    // Merge en respectant les valeurs existantes : un patch vide ne doit pas effacer
    const merged: Record<string, unknown> = { ...previousContent };
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === undefined) continue;
      if (typeof v === "string" && v.trim().length === 0) continue;
      merged[k] = v;
    }

    const newConfidence = confidence ?? existing?.confidence ?? 0.5;
    const newValidation = validatePillar(pillar, merged, newConfidence);
    const newLevel = newValidation.level;

    await tx.pillar.upsert({
      where: { strategyId_key: { strategyId, key: pillar } },
      update: { content: merged as object, confidence: newConfidence },
      create: { strategyId, key: pillar, content: merged as object, confidence: newConfidence },
    });

    return { previousLevel, newLevel };
  });

  const plan = await planSequence(strategyId);
  const step = plan.steps.find((s) => s.pillar === pillar)!;

  // Capture knowledge si transition d'etat
  if (previousLevel !== newLevel) {
    await captureEvent("DIAGNOSTIC_RESULT", {
      pillarFocus: pillar,
      data: {
        type: "artemis_pillar_transition",
        strategyId,
        pillar,
        from: previousLevel,
        to: newLevel,
        projectedScore: step.validation.projectedScore,
        keyAtomsRatio: step.validation.keyAtomsRatio,
      },
      sourceId: `${strategyId}-${pillar}-${Date.now()}`,
    });
  }

  return { step, plan, previousLevel, newLevel };
}

/**
 * Lit Pillar.content de maniere defensive, retourne toujours un objet plat.
 */
function sanitizeIncomingContent(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Record<string, unknown>;
}

/**
 * Verifie si le scoring final (complete) est legitime.
 * Refuse si moins de 3 piliers atteignent au moins le niveau STARTED.
 */
export interface CompletionGuard {
  allowed: boolean;
  reason: string;
  startedOrAbove: number;
  validatedCount: number;
}

export async function canComplete(strategyId: string): Promise<CompletionGuard> {
  const plan = await planSequence(strategyId);
  const startedOrAbove = plan.steps.filter(
    (s) => s.validation.level !== "EMPTY"
  ).length;

  if (startedOrAbove < 3) {
    return {
      allowed: false,
      reason: `Au moins 3 piliers doivent être démarrés avant de scorer (${startedOrAbove}/8 actuellement). Sinon le score ADVE-RTIS sera proche de zéro et non-significatif.`,
      startedOrAbove,
      validatedCount: plan.validatedCount,
    };
  }

  return {
    allowed: true,
    reason: `Scoring autorisé — ${startedOrAbove}/8 piliers démarrés, ${plan.validatedCount}/8 validés.`,
    startedOrAbove,
    validatedCount: plan.validatedCount,
  };
}
