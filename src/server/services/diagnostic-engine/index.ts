import { db } from "@/lib/db";
import { PILLAR_NAMES, type PillarKey } from "@/lib/types/advertis-vector";

export interface DiagnosticResult {
  strategyId: string;
  symptoms: DiagnosticSymptom[];
  diagnosis: DiagnosticFinding[];
  prescriptions: string[];
  frameworksUsed: string[];
  localization: "profile" | "driver" | "creative" | "market" | "mixed";
}

export interface DiagnosticSymptom {
  pillar: PillarKey;
  score: number;
  trend: "declining" | "stagnant" | "improving";
  severity: "low" | "medium" | "high" | "critical";
}

export interface DiagnosticFinding {
  pillar: PillarKey;
  issue: string;
  rootCause: string;
  suggestedFramework: string;
}

/**
 * ARTEMIS extension — diagnostic différentiel.
 * Analyzes a strategy's ADVE profile, identifies problems,
 * and prescribes frameworks and actions.
 */
export async function runDiagnostic(strategyId: string): Promise<DiagnosticResult> {
  const strategy = await db.strategy.findUniqueOrThrow({
    where: { id: strategyId },
    include: {
      pillars: true,
      drivers: { where: { deletedAt: null } },
      devotionSnapshots: { orderBy: { measuredAt: "desc" }, take: 3 },
    },
  });

  const vector = strategy.advertis_vector as Record<string, number> | null;
  if (!vector) {
    return {
      strategyId,
      symptoms: [],
      diagnosis: [],
      prescriptions: ["Exécuter un scoring ADVE complet avant de diagnostiquer"],
      frameworksUsed: [],
      localization: "profile",
    };
  }

  // Identify symptoms
  const symptoms: DiagnosticSymptom[] = [];
  for (const key of ["a", "d", "v", "e", "r", "t", "i", "s"] as PillarKey[]) {
    const score = vector[key] ?? 0;
    const pillarContent = strategy.pillars.find((p) => p.key === key);
    const confidence = pillarContent?.confidence ?? 0;

    let severity: DiagnosticSymptom["severity"] = "low";
    if (score < 8) severity = "critical";
    else if (score < 12) severity = "high";
    else if (score < 16) severity = "medium";

    if (severity !== "low") {
      symptoms.push({
        pillar: key,
        score,
        trend: confidence < 0.5 ? "stagnant" : "declining",
        severity,
      });
    }
  }

  // Generate diagnosis per symptom
  const diagnosis: DiagnosticFinding[] = symptoms.map((s) => ({
    pillar: s.pillar,
    issue: `Pilier ${PILLAR_NAMES[s.pillar]} faible (${s.score.toFixed(1)}/25)`,
    rootCause: getRootCause(s.pillar, vector, strategy.drivers.length),
    suggestedFramework: getFrameworkForPillar(s.pillar),
  }));

  // Localize the problem
  const localization = localizeIssue(symptoms, strategy.drivers.length);

  // Generate prescriptions
  const prescriptions = generatePrescriptions(symptoms, strategy.drivers.length, localization);

  const frameworksUsed = [...new Set(diagnosis.map((d) => d.suggestedFramework))];

  // Capture diagnostic as knowledge
  await db.knowledgeEntry.create({
    data: {
      entryType: "DIAGNOSTIC_RESULT",
      data: {
        strategyId,
        symptoms: symptoms.length,
        localization,
        frameworksUsed,
        runAt: new Date().toISOString(),
      },
      sourceHash: `diagnostic-${strategyId}`,
    },
  });

  return { strategyId, symptoms, diagnosis, prescriptions, frameworksUsed, localization };
}

function getRootCause(pillar: PillarKey, vector: Record<string, number>, driverCount: number): string {
  const causes: Record<PillarKey, string> = {
    a: "Identité de marque non formalisée ou vision floue",
    d: "Positionnement indifférencié — la marque se fond dans le marché",
    v: "Proposition de valeur mal définie ou non communiquée",
    e: "Absence de stratégie d'engagement communautaire",
    r: "Risques non cartographiés ou plan de crise inexistant",
    t: "KPIs non définis ou non suivis — pas de culture de mesure",
    i: driverCount === 0
      ? "Aucun Driver configuré — pas de canal d'exécution"
      : "Roadmap non formalisée ou sous-exécutée",
    s: "Absence de document stratégique unifié (guidelines, bible de marque)",
  };
  return causes[pillar];
}

function getFrameworkForPillar(pillar: PillarKey): string {
  const frameworks: Record<PillarKey, string> = {
    a: "FW-03-BRAND-PRISM",
    d: "FW-05-POSITIONING-MAP",
    v: "FW-06-VALUE-PROPOSITION",
    e: "FW-07-COMMUNITY-AUDIT",
    r: "FW-04-SWOT-PLUS",
    t: "FW-08-KPI-FRAMEWORK",
    i: "FW-09-ROADMAP-BUILDER",
    s: "FW-01-BRAND-AUDIT",
  };
  return frameworks[pillar];
}

function localizeIssue(
  symptoms: DiagnosticSymptom[],
  driverCount: number
): DiagnosticResult["localization"] {
  const criticalPillars = symptoms.filter((s) => s.severity === "critical").map((s) => s.pillar);

  if (criticalPillars.includes("a") && criticalPillars.includes("d")) return "profile";
  if (criticalPillars.includes("i") && driverCount === 0) return "driver";
  if (criticalPillars.includes("e") || criticalPillars.includes("v")) return "creative";
  if (criticalPillars.includes("r") || criticalPillars.includes("t")) return "market";
  return "mixed";
}

function generatePrescriptions(
  symptoms: DiagnosticSymptom[],
  driverCount: number,
  localization: DiagnosticResult["localization"]
): string[] {
  const prescriptions: string[] = [];

  if (localization === "profile") {
    prescriptions.push("Priorité 1 : Refondre le profil de marque (Authenticité + Distinction) via un Boot Sequence complet");
  }
  if (localization === "driver" || driverCount === 0) {
    prescriptions.push("Activer au minimum 2 Drivers pour commencer l'exécution stratégique");
  }
  if (localization === "creative") {
    prescriptions.push("Renforcer la proposition de valeur et la stratégie d'engagement communautaire");
  }

  for (const s of symptoms.filter((s) => s.severity === "critical")) {
    prescriptions.push(`URGENT : Pilier ${PILLAR_NAMES[s.pillar]} en zone critique (${s.score.toFixed(1)}/25) — action immédiate requise`);
  }

  if (prescriptions.length === 0) {
    prescriptions.push("Profil globalement sain — optimisation continue recommandée");
  }

  return prescriptions;
}
