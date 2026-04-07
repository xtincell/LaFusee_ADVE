/**
 * Auto-Complete — Mestor-powered gap filling for GLORY sequences
 *
 * When a sequence scan reveals missing pillar variables, this module
 * uses Mestor to auto-generate the missing values:
 *
 *   ADVE pillars (A/D/V/E) → generateADVERecommendations + auto-accept gaps
 *   RTIS pillars (R/T/I/S) → actualizePillar (re-run cascade for that pillar)
 *
 * The operator can review after the fact — values are in pendingRecos audit trail.
 */

import {
  generateADVERecommendations,
  applyAcceptedRecommendations,
  actualizePillar,
} from "@/server/services/mestor/rtis-cascade";
import { scanSequence, type PreflightReport } from "./sequence-executor";
import type { GlorySequenceKey } from "./sequences";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AutoCompleteResult {
  sequenceKey: GlorySequenceKey;
  /** Total gaps before auto-complete */
  gapsBefore: number;
  /** Gaps remaining after (couldn't fill) */
  gapsAfter: number;
  /** Fields auto-filled per pillar */
  filled: Array<{ pillar: string; field: string; source: "MESTOR_RECO" | "RTIS_CASCADE" }>;
  /** Errors encountered */
  errors: string[];
  /** New readiness % after auto-complete */
  readinessAfter: number;
}

// ─── Auto-Complete ───────────────────────────────────────────────────────────

/**
 * Auto-complete missing pillar variables for a sequence using Mestor.
 *
 * For ADVE gaps: generates recommendations via R+T insights, then auto-accepts
 * the fields that match the scan gaps.
 *
 * For RTIS gaps: re-runs the cascade for that specific pillar.
 */
export async function autoCompleteGaps(
  strategyId: string,
  sequenceKey: GlorySequenceKey,
): Promise<AutoCompleteResult> {
  // 1. Scan to get current gaps
  const scan = await scanSequence(sequenceKey, strategyId);
  if (scan.gaps.length === 0) {
    return {
      sequenceKey,
      gapsBefore: 0,
      gapsAfter: 0,
      filled: [],
      errors: [],
      readinessAfter: scan.readiness,
    };
  }

  // 2. Group gaps by pillar — deduplicate to top-level field names
  const gapsByPillar: Record<string, string[]> = {};
  for (const gap of scan.gaps) {
    const pillarKey = gap.path.split(".")[0]!;
    if (!gapsByPillar[pillarKey]) gapsByPillar[pillarKey] = [];
    const topField = gap.path.split(".")[1]!;
    gapsByPillar[pillarKey].push(topField);
  }
  // Deduplicate fields per pillar
  for (const key of Object.keys(gapsByPillar)) {
    gapsByPillar[key] = [...new Set(gapsByPillar[key])];
  }

  const filled: AutoCompleteResult["filled"] = [];
  const errors: string[] = [];

  // 3. Process ONE pillar at a time to avoid timeout
  // Pick the pillar with the most gaps first (highest impact)
  const pillarsByGapCount = Object.entries(gapsByPillar)
    .sort(([, a], [, b]) => b.length - a.length);

  // Process max 1 ADVE + 1 RTIS per call to keep response time under 30s
  let adveProcessed = false;
  let rtisProcessed = false;

  for (const [pillarKey, gapFields] of pillarsByGapCount) {
    if (gapFields.length === 0) continue;

    const isADVE = ["a", "d", "v", "e"].includes(pillarKey);
    const isRTIS = ["r", "t", "i", "s"].includes(pillarKey);

    // Only process 1 of each type per call
    if (isADVE && adveProcessed) continue;
    if (isRTIS && rtisProcessed) continue;

    if (isADVE) {
      const upperKey = pillarKey.toUpperCase() as "A" | "D" | "V" | "E";
      try {
        console.log(`[auto-complete] Generating ADVE recos for ${upperKey} (${gapFields.length} gaps)...`);
        const recoResult = await generateADVERecommendations(strategyId, upperKey);

        if (recoResult.error) {
          errors.push(`${upperKey}: ${recoResult.error}`);
        } else if (recoResult.recommendations.length === 0) {
          errors.push(`${upperKey}: Mestor n'a pas pu generer de recommandations`);
        } else {
          const recoFields = recoResult.recommendations.map((r) => r.field);
          const fieldsToAccept = gapFields.filter((f) => recoFields.includes(f));

          if (fieldsToAccept.length > 0) {
            const applyResult = await applyAcceptedRecommendations(strategyId, upperKey, fieldsToAccept);
            if (applyResult.error) {
              errors.push(`${upperKey} apply: ${applyResult.error}`);
            } else {
              for (const field of fieldsToAccept) {
                filled.push({ pillar: upperKey, field, source: "MESTOR_RECO" });
              }
            }
          }
        }
        adveProcessed = true;
      } catch (err) {
        errors.push(`${upperKey}: ${err instanceof Error ? err.message : String(err)}`);
        adveProcessed = true;
      }
    }

    if (isRTIS) {
      const upperKey = pillarKey.toUpperCase();
      try {
        console.log(`[auto-complete] Actualizing RTIS pillar ${upperKey} (${gapFields.length} gaps)...`);
        const result = await actualizePillar(strategyId, upperKey);
        if (result.updated) {
          for (const field of gapFields) {
            filled.push({ pillar: upperKey, field, source: "RTIS_CASCADE" });
          }
        } else if (result.error) {
          errors.push(`${upperKey}: ${result.error}`);
        }
        rtisProcessed = true;
      } catch (err) {
        errors.push(`${upperKey}: ${err instanceof Error ? err.message : String(err)}`);
        rtisProcessed = true;
      }
    }
  }

  // 5. Re-scan to get updated readiness
  const scanAfter = await scanSequence(sequenceKey, strategyId);

  return {
    sequenceKey,
    gapsBefore: scan.gaps.length,
    gapsAfter: scanAfter.gaps.length,
    filled,
    errors,
    readinessAfter: scanAfter.readiness,
  };
}
