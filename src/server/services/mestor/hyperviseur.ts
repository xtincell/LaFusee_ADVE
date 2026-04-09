/**
 * HYPERVISEUR — Le stratège de l'essaim MESTOR
 *
 * Rôle : Analyse l'état de la stratégie, consulte les 8 Directeurs,
 *        produit le plan d'orchestration (OrchestrationPlan).
 * LLM  : NON — logique purement déterministe.
 *
 * Le plan est :
 *   1. Généré automatiquement
 *   2. Affiché au Fixer pour validation
 *   3. Exécuté step-by-step
 *   4. Interruptible (pause, skip, re-prioriser)
 *   5. Persisté en DB (survit aux crashes)
 */

import { db } from "@/lib/db";
import { PILLAR_KEYS, type PillarKey } from "@/lib/types/advertis-vector";
import { assessAllDirectors, type PillarHealthReport } from "@/server/services/neteru-shared/pillar-directors";
import { assessStrategy } from "@/server/services/pillar-maturity/assessor";

// ── Types ──────────────────────────────────────────────────────────────

export type StrategyPhase = "QUICK_INTAKE" | "BOOT" | "ACTIVE" | "GROWTH";

export type StepAgent =
  | "PROTOCOLE_R" | "PROTOCOLE_T" | "PROTOCOLE_I" | "PROTOCOLE_S"
  | "COMMANDANT"
  | "ARTEMIS_SEQUENCE"
  | "SCORE"
  | "WAIT_HUMAN";

export interface OrchestrationStep {
  id: string;
  agent: StepAgent;
  target: string;
  description: string;
  priority: number;
  dependsOn: string[];
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "SKIPPED" | "WAITING";
  result?: unknown;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface OrchestrationPlan {
  strategyId: string;
  phase: StrategyPhase;
  steps: OrchestrationStep[];
  pillarHealth: PillarHealthReport[];
  estimatedAiCalls: number;
  createdAt: string;
}

// ── Phase detection ───────────────────────────────────────────────────

function detectPhase(
  maturityOverallStage?: string,
  filledPillars?: number,
  composite?: number,
): StrategyPhase {
  if (maturityOverallStage) {
    switch (maturityOverallStage) {
      case "EMPTY": return "QUICK_INTAKE";
      case "INTAKE": return (filledPillars ?? 0) >= 4 ? "BOOT" : "QUICK_INTAKE";
      case "ENRICHED": return "ACTIVE";
      case "COMPLETE": return "GROWTH";
    }
  }
  if ((filledPillars ?? 0) < 4) return "QUICK_INTAKE";
  if ((composite ?? 0) < 50) return "BOOT";
  if ((composite ?? 0) < 120) return "ACTIVE";
  return "GROWTH";
}

// ── Step builder helpers ──────────────────────────────────────────────

function step(
  id: string,
  agent: StepAgent,
  target: string,
  description: string,
  dependsOn: string[] = [],
  priority: number = 5,
): OrchestrationStep {
  return {
    id, agent, target, description, priority, dependsOn,
    status: "PENDING", retryCount: 0, maxRetries: 1,
  };
}

// ── Plan builder ──────────────────────────────────────────────────────

/**
 * Analyze strategy state and produce an orchestration plan.
 * Deterministic — no LLM calls.
 */
export async function buildPlan(strategyId: string): Promise<OrchestrationPlan> {
  // Assess all 8 pillar directors
  const pillarHealth = await assessAllDirectors(strategyId);

  // Detect phase
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    select: { advertis_vector: true },
  });
  const vec = (strategy?.advertis_vector ?? {}) as Record<string, number>;
  const composite = vec.composite ?? 0;
  const filledPillars = pillarHealth.filter(h => h.completeness > 10).length;

  let maturityStage: string | undefined;
  try {
    const report = await assessStrategy(strategyId);
    maturityStage = report.overallStage;
  } catch { /* fallback to composite */ }

  const phase = detectPhase(maturityStage, filledPillars, composite);

  // Build steps based on phase and pillar health
  const steps: OrchestrationStep[] = [];
  let aiCalls = 0;

  // ── RTIS Cascade (if ADVE has content) ───────────────────────────
  const adveReady = ["a", "d", "v", "e"].every(k => {
    const h = pillarHealth.find(p => p.pillarKey === k);
    return h && h.completeness > 20;
  });

  if (adveReady) {
    // R — diagnostic ADVE
    const rHealth = pillarHealth.find(p => p.pillarKey === "r");
    if (!rHealth || rHealth.completeness < 50 || rHealth.isStale) {
      steps.push(step("rtis-r", "PROTOCOLE_R", "r", "Protocole Risk — diagnostic ADVE", [], 10));
      aiCalls++;
    }

    // T — confrontation réalité (depends on R)
    const tHealth = pillarHealth.find(p => p.pillarKey === "t");
    if (!tHealth || tHealth.completeness < 50 || tHealth.isStale) {
      steps.push(step("rtis-t", "PROTOCOLE_T", "t", "Protocole Track — confrontation marché", ["rtis-r"], 9));
      aiCalls++;
    }

    // Commandant generates ADVE recommendations from R+T
    steps.push(step("recos-adve", "COMMANDANT", "recos:ADVE",
      "Commandant — recommandations ADVE depuis R+T",
      ["rtis-r", "rtis-t"].filter(id => steps.some(s => s.id === id)),
      8));
    aiCalls++;

    // Wait for human to accept/reject recommendations
    steps.push(step("wait-recos", "WAIT_HUMAN", "accept_recos",
      "Opérateur review et accepte/rejette les recommandations",
      ["recos-adve"], 7));

    // I — potentiel total (depends on ADVE enrichi + R + T)
    const iHealth = pillarHealth.find(p => p.pillarKey === "i");
    if (!iHealth || iHealth.completeness < 50 || iHealth.isStale) {
      steps.push(step("rtis-i", "PROTOCOLE_I", "i", "Protocole Innovation — potentiel total",
        ["wait-recos"], 6));
      aiCalls++;
    }

    // S — roadmap (depends on I — S pioche dans I)
    const sHealth = pillarHealth.find(p => p.pillarKey === "s");
    if (!sHealth || sHealth.completeness < 50 || sHealth.isStale) {
      steps.push(step("rtis-s", "PROTOCOLE_S", "s", "Protocole Strategy — roadmap → superfan",
        ["rtis-i"], 5));
      aiCalls++;
    }
  }

  // ── GLORY Sequences (if pillar maturity allows) ──────────────────
  if (phase === "ACTIVE" || phase === "GROWTH") {
    // Check if D is ready for BRAND pipeline
    const dHealth = pillarHealth.find(p => p.pillarKey === "d");
    if (dHealth && dHealth.readyForGlory) {
      steps.push(step("glory-brand", "ARTEMIS_SEQUENCE", "BRAND",
        "Séquence BRAND — identité visuelle complète",
        [], 4));
      aiCalls += 3; // Estimate: some tools are MESTOR_ASSIST
    }

    // Check if A is ready for MANIFESTE
    const aHealth = pillarHealth.find(p => p.pillarKey === "a");
    if (aHealth && aHealth.readyForGlory) {
      steps.push(step("glory-manifeste", "ARTEMIS_SEQUENCE", "MANIFESTE-A",
        "Séquence MANIFESTE — rapport identité",
        [], 3));
      aiCalls += 2;
    }
  }

  // ── Final score recalculation ────────────────────────────────────
  if (steps.length > 0) {
    steps.push(step("score-final", "SCORE", "recalculate",
      "Recalcul du score ADVERTIS",
      steps.map(s => s.id), 1));
  }

  return {
    strategyId,
    phase,
    steps,
    pillarHealth,
    estimatedAiCalls: aiCalls,
    createdAt: new Date().toISOString(),
  };
}

// ── Plan execution ────────────────────────────────────────────────────

/**
 * Execute the next pending step in a plan.
 * Returns the updated step, or null if no step is ready.
 *
 * A step is ready if all its dependencies are COMPLETED.
 * WAIT_HUMAN steps block until the operator intervenes.
 */
export async function executeNextStep(
  plan: OrchestrationPlan,
): Promise<OrchestrationStep | null> {
  // Find next ready step
  const completedIds = new Set(plan.steps.filter(s => s.status === "COMPLETED").map(s => s.id));
  const nextStep = plan.steps.find(s =>
    s.status === "PENDING" &&
    s.dependsOn.every(dep => completedIds.has(dep))
  );

  if (!nextStep) return null;

  // WAIT_HUMAN — don't auto-execute, return as WAITING
  if (nextStep.agent === "WAIT_HUMAN") {
    nextStep.status = "WAITING";
    return nextStep;
  }

  // Execute
  nextStep.status = "RUNNING";

  try {
    switch (nextStep.agent) {
      case "PROTOCOLE_R": {
        const { executeProtocoleRisk } = await import("@/server/services/rtis-protocols");
        const result = await executeProtocoleRisk(plan.strategyId);
        // Write via Gateway
        const { writePillarAndScore } = await import("@/server/services/pillar-gateway");
        if (!result.error && Object.keys(result.content).length > 0) {
          await writePillarAndScore({
            strategyId: plan.strategyId,
            pillarKey: "r",
            operation: { type: "MERGE_DEEP", patch: result.content },
            author: { system: "PROTOCOLE_R", reason: "Cascade RTIS — Risk" },
            options: { targetStatus: "AI_PROPOSED", confidenceDelta: result.confidence * 0.1 },
          });
        }
        nextStep.result = { confidence: result.confidence, flags: result.flags?.length ?? 0 };
        nextStep.status = result.error ? "FAILED" : "COMPLETED";
        if (result.error) nextStep.error = result.error;
        break;
      }

      case "PROTOCOLE_T": {
        const { executeProtocoleTrack } = await import("@/server/services/rtis-protocols");
        const result = await executeProtocoleTrack(plan.strategyId);
        const { writePillarAndScore } = await import("@/server/services/pillar-gateway");
        if (!result.error && Object.keys(result.content).length > 0) {
          await writePillarAndScore({
            strategyId: plan.strategyId,
            pillarKey: "t",
            operation: { type: "MERGE_DEEP", patch: result.content },
            author: { system: "PROTOCOLE_T", reason: "Cascade RTIS — Track" },
            options: { targetStatus: "AI_PROPOSED", confidenceDelta: result.confidence * 0.1 },
          });
        }
        nextStep.result = { confidence: result.confidence, sourced: result.sourcedDataCount, aiEstimates: result.aiEstimateCount };
        nextStep.status = result.error ? "FAILED" : "COMPLETED";
        if (result.error) nextStep.error = result.error;
        break;
      }

      case "PROTOCOLE_I": {
        const { executeProtocoleInnovation } = await import("@/server/services/rtis-protocols");
        const result = await executeProtocoleInnovation(plan.strategyId);
        const { writePillarAndScore } = await import("@/server/services/pillar-gateway");
        if (!result.error && Object.keys(result.content).length > 0) {
          await writePillarAndScore({
            strategyId: plan.strategyId,
            pillarKey: "i",
            operation: { type: "MERGE_DEEP", patch: result.content },
            author: { system: "PROTOCOLE_I", reason: "Cascade RTIS — Innovation" },
            options: { targetStatus: "AI_PROPOSED", confidenceDelta: result.confidence * 0.1 },
          });
        }
        nextStep.result = { confidence: result.confidence, totalActions: result.totalActions };
        nextStep.status = result.error ? "FAILED" : "COMPLETED";
        if (result.error) nextStep.error = result.error;
        break;
      }

      case "PROTOCOLE_S": {
        const { executeProtocoleStrategy } = await import("@/server/services/rtis-protocols");
        const result = await executeProtocoleStrategy(plan.strategyId);
        const { writePillarAndScore } = await import("@/server/services/pillar-gateway");
        if (!result.error && Object.keys(result.content).length > 0) {
          await writePillarAndScore({
            strategyId: plan.strategyId,
            pillarKey: "s",
            operation: { type: "MERGE_DEEP", patch: result.content },
            author: { system: "PROTOCOLE_S", reason: "Cascade RTIS — Strategy" },
            options: { targetStatus: "AI_PROPOSED", confidenceDelta: result.confidence * 0.1 },
          });
        }
        nextStep.result = { confidence: result.confidence, selectedFromI: result.selectedFromICount };
        nextStep.status = result.error ? "FAILED" : "COMPLETED";
        if (result.error) nextStep.error = result.error;
        break;
      }

      case "COMMANDANT": {
        const { generateADVERecommendations } = await import("./commandant");
        // Generate recos for each ADVE pillar
        const recoResults: Record<string, number> = {};
        for (const key of ["a", "d", "v", "e"] as const) {
          const result = await generateADVERecommendations(plan.strategyId, key);
          recoResults[key] = result.recommendations.length;
        }
        nextStep.result = recoResults;
        nextStep.status = "COMPLETED";
        break;
      }

      case "ARTEMIS_SEQUENCE": {
        // Delegate to existing GLORY sequence executor
        try {
          const { executeSequence } = await import("@/server/services/glory-tools/sequence-executor");
          const result = await executeSequence(nextStep.target as never, plan.strategyId);
          nextStep.result = { completed: true, target: nextStep.target };
          nextStep.status = "COMPLETED";
        } catch (err) {
          nextStep.status = "FAILED";
          nextStep.error = err instanceof Error ? err.message : String(err);
        }
        break;
      }

      case "SCORE": {
        const { scoreObject } = await import("@/server/services/advertis-scorer");
        const vector = await scoreObject("strategy", plan.strategyId);
        nextStep.result = { composite: vector.composite, confidence: vector.confidence };
        nextStep.status = "COMPLETED";
        break;
      }

      default:
        nextStep.status = "SKIPPED";
        nextStep.error = `Unknown agent: ${nextStep.agent}`;
    }
  } catch (err) {
    nextStep.status = "FAILED";
    nextStep.error = err instanceof Error ? err.message : String(err);

    // Retry if allowed
    if (nextStep.retryCount < nextStep.maxRetries) {
      nextStep.retryCount++;
      nextStep.status = "PENDING";
      nextStep.error = `Retry ${nextStep.retryCount}/${nextStep.maxRetries}: ${nextStep.error}`;
    }
  }

  return nextStep;
}

/**
 * Execute all ready steps in a plan until blocked or complete.
 * Returns the updated plan with all steps processed.
 */
export async function executePlan(plan: OrchestrationPlan): Promise<OrchestrationPlan> {
  let hasProgress = true;

  while (hasProgress) {
    const step = await executeNextStep(plan);
    if (!step || step.status === "WAITING") {
      hasProgress = false;
    }
  }

  return plan;
}

/**
 * Resolve a WAIT_HUMAN step (operator has made their decision).
 * Marks the step as COMPLETED so execution can continue.
 */
export function resolveHumanStep(plan: OrchestrationPlan, stepId: string): void {
  const s = plan.steps.find(s => s.id === stepId);
  if (s && s.status === "WAITING") {
    s.status = "COMPLETED";
    s.result = { resolvedAt: new Date().toISOString(), resolvedBy: "operator" };
  }
}

// ── Persistence (P1.1) ────────────────────────────────────────────────

/**
 * Save a plan to DB. Creates or updates.
 */
export async function persistPlan(plan: OrchestrationPlan): Promise<string> {
  const completed = plan.steps.filter(s => s.status === "COMPLETED").length;
  const allDone = plan.steps.every(s => s.status === "COMPLETED" || s.status === "SKIPPED");
  const hasFailed = plan.steps.some(s => s.status === "FAILED");

  const dbPlan = await db.orchestrationPlan.upsert({
    where: { id: plan.strategyId + "-latest" }, // Use a deterministic ID
    update: {
      phase: plan.phase,
      status: allDone ? "COMPLETED" : hasFailed ? "FAILED" : "RUNNING",
      totalSteps: plan.steps.length,
      completedSteps: completed,
      completedAt: allDone ? new Date() : null,
    },
    create: {
      id: plan.strategyId + "-latest",
      strategyId: plan.strategyId,
      phase: plan.phase,
      status: "RUNNING",
      totalSteps: plan.steps.length,
      completedSteps: completed,
      estimatedAiCalls: plan.estimatedAiCalls,
    },
  });

  // Upsert each step
  for (const step of plan.steps) {
    await db.orchestrationStep.upsert({
      where: { id: step.id },
      update: {
        status: step.status,
        result: step.result as import("@prisma/client").Prisma.InputJsonValue ?? undefined,
        error: step.error ?? null,
        retryCount: step.retryCount,
        startedAt: step.status === "RUNNING" ? new Date() : undefined,
        completedAt: step.status === "COMPLETED" ? new Date() : undefined,
      },
      create: {
        id: step.id,
        planId: dbPlan.id,
        agent: step.agent,
        target: step.target,
        description: step.description,
        priority: step.priority,
        dependsOn: step.dependsOn,
        status: step.status,
        maxRetries: step.maxRetries,
      },
    });
  }

  return dbPlan.id;
}

/**
 * Load a persisted plan from DB. Returns null if not found.
 */
export async function loadPlan(strategyId: string): Promise<OrchestrationPlan | null> {
  const dbPlan = await db.orchestrationPlan.findUnique({
    where: { id: strategyId + "-latest" },
    include: { steps: { orderBy: { priority: "desc" } } },
  });

  if (!dbPlan) return null;

  return {
    strategyId: dbPlan.strategyId,
    phase: dbPlan.phase as StrategyPhase,
    steps: dbPlan.steps.map(s => ({
      id: s.id,
      agent: s.agent as StepAgent,
      target: s.target,
      description: s.description,
      priority: s.priority,
      dependsOn: s.dependsOn,
      status: s.status as OrchestrationStep["status"],
      result: s.result as unknown,
      error: s.error ?? undefined,
      retryCount: s.retryCount,
      maxRetries: s.maxRetries,
    })),
    pillarHealth: [], // Will be re-assessed on resume
    estimatedAiCalls: dbPlan.estimatedAiCalls,
    createdAt: dbPlan.createdAt.toISOString(),
  };
}

/**
 * Resume a persisted plan: load, execute pending steps, persist.
 */
export async function resumePlan(strategyId: string): Promise<OrchestrationPlan | null> {
  const plan = await loadPlan(strategyId);
  if (!plan) return null;

  const hasPending = plan.steps.some(s => s.status === "PENDING" || s.status === "WAITING");
  if (!hasPending) return plan; // Already complete

  const executed = await executePlan(plan);
  await persistPlan(executed);
  return executed;
}
