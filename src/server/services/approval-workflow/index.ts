import { db } from "@/lib/db";
import type { PillarKey } from "@/lib/types/advertis-vector";
import { PILLAR_NAMES } from "@/lib/types/advertis-vector";

export interface ApprovalCheck {
  pillar: PillarKey;
  pillarName: string;
  score: number;
  isConform: boolean;
  issues: string[];
}

export interface ApprovalResult {
  approved: boolean;
  overallScore: number;
  checks: ApprovalCheck[];
  recommendation: string;
}

/**
 * Checks ADVE conformity of a deliverable against its mission's strategy.
 * Returns per-pillar assessment with issues.
 */
export async function checkAdveConformity(
  deliverableId: string
): Promise<ApprovalResult> {
  const deliverable = await db.missionDeliverable.findUniqueOrThrow({
    where: { id: deliverableId },
    include: {
      mission: {
        include: {
          strategy: { include: { pillars: true } },
          driver: true,
        },
      },
    },
  });

  const strategy = deliverable.mission.strategy;
  const driver = deliverable.mission.driver;
  const vector = strategy.advertis_vector as Record<string, number> | null;
  const driverPriority = (driver?.pillarPriority as Record<string, number>) ?? {};

  const checks: ApprovalCheck[] = [];
  let totalScore = 0;
  let pillarCount = 0;

  for (const key of ["a", "d", "v", "e", "r", "t", "i", "s"] as PillarKey[]) {
    const pillarContent = strategy.pillars.find((p) => p.key === key);
    const pillarScore = vector?.[key] ?? 0;
    const priority = driverPriority[key] ?? 1;
    const issues: string[] = [];

    // Check if pillar has content
    if (!pillarContent?.content || Object.keys(pillarContent.content as object).length === 0) {
      issues.push(`Pilier ${PILLAR_NAMES[key]} : contenu manquant dans la stratégie`);
    }

    // Check if pillar score is below threshold
    if (pillarScore < 10 && priority > 1) {
      issues.push(`Score ${PILLAR_NAMES[key]} faible (${pillarScore.toFixed(1)}/25) pour un canal prioritaire`);
    }

    // Check confidence
    const confidence = pillarContent?.confidence ?? 0;
    if (confidence < 0.5 && priority > 1) {
      issues.push(`Confidence faible (${(confidence * 100).toFixed(0)}%) — données insuffisantes`);
    }

    const isConform = issues.length === 0;
    const checkScore = isConform ? 10 : Math.max(0, 10 - issues.length * 3);
    totalScore += checkScore;
    pillarCount++;

    checks.push({
      pillar: key,
      pillarName: PILLAR_NAMES[key],
      score: checkScore,
      isConform,
      issues,
    });
  }

  const overallScore = pillarCount > 0 ? totalScore / pillarCount : 0;
  const approved = overallScore >= 7 && checks.filter((c) => !c.isConform).length <= 2;

  const nonConformPillars = checks.filter((c) => !c.isConform).map((c) => c.pillarName);
  const recommendation = approved
    ? "Livrable conforme au protocole ADVE. Approbation recommandée."
    : `Livrable non conforme sur ${nonConformPillars.join(", ")}. Révision recommandée avant approbation.`;

  return { approved, overallScore, checks, recommendation };
}

/**
 * Quick conformity check for a mission brief before assignment.
 */
export async function checkBriefConformity(
  missionId: string
): Promise<{ isReady: boolean; missingElements: string[] }> {
  const mission = await db.mission.findUniqueOrThrow({
    where: { id: missionId },
    include: {
      strategy: { include: { pillars: true } },
      driver: true,
    },
  });

  const missingElements: string[] = [];

  if (!mission.driver) {
    missingElements.push("Aucun Driver assigné");
  }

  if (!mission.advertis_vector) {
    missingElements.push("Vecteur ADVE manquant sur la mission");
  }

  const strategyVector = mission.strategy.advertis_vector as Record<string, number> | null;
  if (!strategyVector || (strategyVector.confidence ?? 0) < 0.5) {
    missingElements.push("Profil ADVE de la stratégie incomplet (confidence < 50%)");
  }

  const pillarCount = mission.strategy.pillars.length;
  if (pillarCount < 8) {
    missingElements.push(`Seulement ${pillarCount}/8 piliers documentés`);
  }

  return {
    isReady: missingElements.length === 0,
    missingElements,
  };
}
