import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { scoreObject } from "@/server/services/advertis-scorer";
import { classifyBrand, type PillarKey } from "@/lib/types/advertis-vector";
import {
  planSequence,
  updatePillarContent,
  openPillarForEdit,
  canComplete,
  type SequencePlan,
  type PillarStep,
} from "@/server/services/artemis-sequencer";
import { captureEvent } from "@/server/services/knowledge-capture";

/**
 * Boot Sequence — la session ARTEMIS d'onboarding strategique.
 * Pilote 8 piliers ADVE en mode conditionnel : l'ordre depend du niveau
 * de validation existant et du business context.
 *
 * L'etat est derive a la volee depuis le contenu des Pillar en DB
 * (pas de table dediee) — la session est "stateless" cote serveur.
 */

export interface BootState extends SequencePlan {
  completed: boolean;
  brandName: string | null;
  classification: string | null;
}

/**
 * Demarre / reprend une session — calcule le plan a partir de l'etat actuel.
 */
export async function start(strategyId: string): Promise<BootState> {
  return getState(strategyId);
}

/**
 * Etat actuel base sur les Pillar en DB.
 * Toujours frais — appele a chaque interaction UI.
 */
export async function getState(strategyId: string): Promise<BootState> {
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    select: { id: true, name: true, advertis_vector: true },
  });
  if (!strategy) throw new Error(`Strategy ${strategyId} not found`);

  const plan = await planSequence(strategyId);
  const completed = plan.validatedCount === 8;

  const vector = strategy.advertis_vector as Record<string, number> | null;
  const classification = vector?.composite ? classifyBrand(vector.composite) : null;

  return {
    ...plan,
    completed,
    brandName: strategy.name,
    classification,
  };
}

/**
 * Avance dans la sequence : enregistre les reponses sur le pilier vise,
 * recalcule la validation, retourne le nouvel etat global + le pilier recommande suivant.
 */
export async function advance(
  strategyId: string,
  pillar: PillarKey,
  patch: Record<string, unknown>,
  confidence?: number
): Promise<{ state: BootState; updatedStep: PillarStep }> {
  // Verifier que le pilier est ouvert (pas BLOCKED)
  await openPillarForEdit(strategyId, pillar);

  const { step } = await updatePillarContent(strategyId, pillar, patch, confidence);
  const state = await getState(strategyId);
  return { state, updatedStep: step };
}

/**
 * Termine la session — declenche le scoring final et passe la strategy en ACTIVE.
 * Refuse si trop peu de piliers ont ete demarres (eviter un score zero non-significatif).
 */
export async function complete(strategyId: string): Promise<{
  vector: Record<string, number>;
  classification: string;
  plan: SequencePlan;
}> {
  const guard = await canComplete(strategyId);
  if (!guard.allowed) {
    throw new Error(guard.reason);
  }

  const vector = await scoreObject("strategy", strategyId);
  const classification = classifyBrand(vector.composite);
  const plan = await planSequence(strategyId);

  await db.strategy.update({
    where: { id: strategyId },
    data: { status: "ACTIVE" },
  });

  // Capture knowledge : completion ARTEMIS
  await captureEvent("DIAGNOSTIC_RESULT", {
    data: {
      type: "artemis_boot_completed",
      strategyId,
      composite: vector.composite,
      classification,
      validatedCount: plan.validatedCount,
      startedCount: plan.startedCount,
      pendingCount: plan.pendingCount,
    },
    successScore: vector.composite / 200,
    sourceId: `${strategyId}-boot-complete`,
  });

  return { vector, classification, plan };
}

/**
 * Marque explicitement un pilier comme "skip" (l'utilisateur veut passer).
 * Le flag _skipped est une cle meta — il n'est PAS compte comme un atome valide.
 * Le pilier reste donc EMPTY (s'il l'etait) mais le flag est expose pour l'UI.
 */
export async function skipPillar(
  strategyId: string,
  pillar: PillarKey
): Promise<BootState> {
  await db.$transaction(async (tx) => {
    const existing = await tx.pillar.findUnique({
      where: { strategyId_key: { strategyId, key: pillar } },
    });

    const previousContent = (existing?.content && typeof existing.content === "object" && !Array.isArray(existing.content))
      ? (existing.content as Record<string, unknown>)
      : {};

    const content = {
      ...previousContent,
      _skipped: true,
      _skipped_at: new Date().toISOString(),
    };

    await tx.pillar.upsert({
      where: { strategyId_key: { strategyId, key: pillar } },
      update: { content: content as Prisma.InputJsonValue, confidence: existing?.confidence ?? 0.2 },
      create: { strategyId, key: pillar, content: content as Prisma.InputJsonValue, confidence: 0.2 },
    });
  });

  await captureEvent("DIAGNOSTIC_RESULT", {
    pillarFocus: pillar,
    data: { type: "artemis_pillar_skipped", strategyId, pillar },
    sourceId: `${strategyId}-${pillar}-skip`,
  });

  return getState(strategyId);
}
