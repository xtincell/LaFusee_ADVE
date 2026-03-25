import { db } from "@/lib/db";
import { scoreObject } from "@/server/services/advertis-scorer";
import { captureEvent } from "@/server/services/knowledge-capture";
import { detectDrift } from "./drift-detector";
import type { PillarKey } from "@/lib/types/advertis-vector";

/**
 * Process an incoming signal through the feedback loop.
 * Signal → recalculate pillar score → if drift > threshold → diagnostic → alert
 */
export async function processSignal(signalId: string): Promise<void> {
  const signal = await db.signal.findUniqueOrThrow({
    where: { id: signalId },
    include: { strategy: true },
  });

  // Get current vector before recalculation
  const previousVector = (signal.strategy.advertis_vector as Record<string, number>) ?? {};

  // Recalculate the strategy score
  const newVector = await scoreObject("strategy", signal.strategyId);

  // Check for drift on each pillar
  for (const pillar of ["a", "d", "v", "e", "r", "t", "i", "s"] as PillarKey[]) {
    const previous = previousVector[pillar] ?? 0;
    const current = newVector[pillar] ?? 0;
    const drift = detectDrift(pillar, previous, current);

    if (drift.isDrifting) {
      // Log the drift event
      await captureEvent("DIAGNOSTIC_RESULT", {
        pillarFocus: pillar,
        data: {
          type: "drift_detected",
          signalId,
          strategyId: signal.strategyId,
          previous,
          current,
          delta: drift.delta,
          severity: drift.severity,
        },
        sourceId: signal.strategyId,
      });

      // TODO: Trigger ARTEMIS diagnostic for severe drifts
      // TODO: Send alert to fixer
    }
  }
}

/**
 * Recalibrate a specific pillar for a strategy.
 */
export async function recalibrate(strategyId: string, _pillarKey: PillarKey): Promise<void> {
  await scoreObject("strategy", strategyId);
}
