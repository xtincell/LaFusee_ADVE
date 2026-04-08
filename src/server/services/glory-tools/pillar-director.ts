/**
 * Pillar Directors — One per ADVE-RTIS letter (8 directors)
 *
 * Architecture level: SUPERVISEUR (between Hypervisor and Orchestrator)
 *
 *   HYPERVISEUR  → decides which sequences to run
 *   ▶ DIRECTEUR DE PILIER (×8) → owns coherence of its pillar
 *     └── ORCHESTRATEUR → executes steps, resolves bindings
 *          └── OUTIL → receives context + atomic values
 *
 * Each Director:
 *   - Knows ALL atomic variables of its pillar (from Zod schema)
 *   - Knows which sequences READ from its pillar
 *   - Knows which sequences WRITE to its pillar
 *   - Validates writebacks (does the proposed change conflict with existing data?)
 *   - Tracks pillar health (completeness, freshness, confidence)
 *   - Can trigger re-scoring after modification
 *
 * Directors are stateless — they receive pillar data and strategy context,
 * perform their checks, and return verdicts. No DB writes directly.
 */

import { db } from "@/lib/db";
import { PillarResolver } from "./pillar-resolver";
import { ALL_SEQUENCES, type GlorySequenceKey } from "./sequences";
import { ALL_GLORY_TOOLS, type GloryToolDef } from "./registry";
import { assessPillar } from "@/server/services/pillar-maturity/assessor";
import { getContract } from "@/server/services/pillar-maturity/contracts-loader";
import type { MaturityStage } from "@/lib/types/pillar-maturity";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PillarKey = "a" | "d" | "v" | "e" | "r" | "t" | "i" | "s";

export interface PillarHealthReport {
  pillarKey: PillarKey;
  /** Maturity stage from the contract */
  maturityStage: MaturityStage | "EMPTY";
  /** Total atomic fields in the COMPLETE contract */
  totalFields: number;
  /** Fields that have non-empty values */
  filledFields: number;
  /** Completion percentage 0-100 */
  completeness: number;
  /** DB confidence score */
  confidence: number;
  /** Missing fields required for COMPLETE (blocks Glory) */
  criticalGaps: string[];
  /** Missing fields that are auto-derivable */
  derivableGaps: string[];
  /** Sequences that READ this pillar */
  consumedBy: GlorySequenceKey[];
  /** Sequences that WRITE to this pillar */
  enrichedBy: GlorySequenceKey[];
  /** GLORY tools that bind to this pillar */
  boundTools: string[];
  /** True when maturityStage === "COMPLETE" */
  readyForGlory: boolean;
}

export interface WritebackVerdict {
  approved: boolean;
  /** Fields that would be overwritten (already have values) */
  overwrites: string[];
  /** Fields that would be newly populated */
  newFields: string[];
  /** Conflicts detected (proposed value contradicts existing) */
  conflicts: Array<{ field: string; existing: unknown; proposed: unknown; reason: string }>;
}

// ─── Pillar Field Maps: derived from Maturity Contracts (single source of truth) ─

const PILLAR_LABELS: Record<PillarKey, string> = {
  a: "Authenticité",
  d: "Distinction",
  v: "Valeur",
  e: "Engagement",
  r: "Risk",
  t: "Track",
  i: "Implementation",
  s: "Stratégie",
};

// ─── Director Class ──────────────────────────────────────────────────────────

export class PillarDirector {
  readonly key: PillarKey;
  readonly label: string;

  constructor(key: PillarKey) {
    this.key = key;
    this.label = PILLAR_LABELS[key];
  }

  /**
   * Assess the health of this pillar — completeness, gaps, dependencies.
   */
  async assessHealth(strategyId: string): Promise<PillarHealthReport> {
    const resolver = await PillarResolver.forStrategy(strategyId);
    const content = resolver.getPillarContent(this.key) ?? {};
    const confidence = resolver.getConfidence(this.key);
    const contract = getContract(this.key);

    // Use the maturity contract as the single source of truth
    const assessment = assessPillar(this.key, content as Record<string, unknown>, contract ?? undefined);

    // Find sequences that consume this pillar (have PILLAR steps for this key)
    const consumedBy = ALL_SEQUENCES
      .filter((s) => s.steps.some((st) => st.type === "PILLAR" && st.ref === this.key))
      .map((s) => s.key);

    // Find sequences whose pillar field matches this key
    const enrichedBy = ALL_SEQUENCES
      .filter((s) => s.pillar === this.key)
      .map((s) => s.key);

    // Find tools that bind to this pillar
    const boundTools = ALL_GLORY_TOOLS
      .filter((t) => t.pillarBindings && Object.values(t.pillarBindings).some((path) => path?.startsWith(`${this.key}.`)))
      .map((t) => t.slug);

    return {
      pillarKey: this.key,
      maturityStage: assessment.currentStage,
      totalFields: assessment.satisfied.length + assessment.missing.length,
      filledFields: assessment.satisfied.length,
      completeness: assessment.completionPct,
      confidence,
      criticalGaps: assessment.missing,
      derivableGaps: assessment.derivable,
      consumedBy,
      enrichedBy,
      boundTools,
      readyForGlory: assessment.readyForGlory,
    };
  }

  /**
   * Validate a proposed writeback to this pillar.
   * Returns whether the writeback is safe + details on overwrites/conflicts.
   */
  validateWriteback(
    currentContent: Record<string, unknown>,
    proposedChanges: Record<string, unknown>
  ): WritebackVerdict {
    const overwrites: string[] = [];
    const newFields: string[] = [];
    const conflicts: WritebackVerdict["conflicts"] = [];

    for (const [field, proposedValue] of Object.entries(proposedChanges)) {
      const existingValue = currentContent[field];

      if (!hasValue(existingValue)) {
        // New field — always safe
        newFields.push(field);
      } else {
        // Overwrite — check for conflicts
        overwrites.push(field);

        // Detect type mismatch (array vs string, etc.)
        if (typeof existingValue !== typeof proposedValue) {
          conflicts.push({
            field,
            existing: existingValue,
            proposed: proposedValue,
            reason: `Type mismatch: existing is ${typeof existingValue}, proposed is ${typeof proposedValue}`,
          });
        }
      }
    }

    return {
      approved: conflicts.length === 0,
      overwrites,
      newFields,
      conflicts,
    };
  }

  /**
   * Get all atomic variable paths from the maturity contract.
   */
  getAtomicPaths(): string[] {
    const contract = getContract(this.key);
    if (!contract) return [];
    return contract.stages.COMPLETE.map((r) => `${this.key}.${r.path}`);
  }

  /**
   * Get fields that block Glory execution (missing COMPLETE requirements).
   */
  async getCriticalGaps(strategyId: string): Promise<string[]> {
    const health = await this.assessHealth(strategyId);
    return health.criticalGaps;
  }
}

// ─── Director Factory ────────────────────────────────────────────────────────

/** All 8 directors, one per pillar */
export const PILLAR_DIRECTORS: Record<PillarKey, PillarDirector> = {
  a: new PillarDirector("a"),
  d: new PillarDirector("d"),
  v: new PillarDirector("v"),
  e: new PillarDirector("e"),
  r: new PillarDirector("r"),
  t: new PillarDirector("t"),
  i: new PillarDirector("i"),
  s: new PillarDirector("s"),
};

export function getDirector(key: PillarKey): PillarDirector {
  return PILLAR_DIRECTORS[key];
}

/**
 * Full health report across all 8 pillars.
 */
export async function assessAllPillarsHealth(strategyId: string): Promise<PillarHealthReport[]> {
  const reports: PillarHealthReport[] = [];
  for (const key of Object.keys(PILLAR_DIRECTORS) as PillarKey[]) {
    reports.push(await PILLAR_DIRECTORS[key].assessHealth(strategyId));
  }
  return reports;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hasValue(val: unknown): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === "string" && val.trim() === "") return false;
  if (Array.isArray(val) && val.length === 0) return false;
  if (typeof val === "object" && Object.keys(val as object).length === 0) return false;
  return true;
}
