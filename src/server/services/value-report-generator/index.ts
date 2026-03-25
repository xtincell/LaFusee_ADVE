import { db } from "@/lib/db";
import { PILLAR_NAMES, type PillarKey } from "@/lib/types/advertis-vector";

interface ValueReport {
  strategyId: string;
  period: string;
  generatedAt: string;
  summary: {
    currentScore: number;
    previousScore: number;
    delta: number;
    classification: string;
  };
  pillarEvolution: Array<{
    pillar: PillarKey;
    name: string;
    current: number;
    previous: number;
    delta: number;
  }>;
  devotion: Record<string, number> | null;
  missionStats: { total: number; completed: number; avgQcScore: number };
  recommendations: string[];
}

export async function generate(strategyId: string, period: string): Promise<ValueReport> {
  const strategy = await db.strategy.findUniqueOrThrow({
    where: { id: strategyId },
    include: {
      pillars: true,
      missions: { where: { status: { in: ["COMPLETED", "DELIVERED"] } } },
      devotionSnapshots: { orderBy: { measuredAt: "desc" }, take: 2 },
    },
  });

  const vector = (strategy.advertis_vector as Record<string, number>) ?? {};
  const currentScore = vector.composite ?? 0;

  // Build pillar evolution (comparing to previous month)
  const pillarEvolution = (["a", "d", "v", "e", "r", "t", "i", "s"] as PillarKey[]).map((pillar) => ({
    pillar,
    name: PILLAR_NAMES[pillar],
    current: vector[pillar] ?? 0,
    previous: 0, // TODO: fetch from score history
    delta: vector[pillar] ?? 0,
  }));

  // Latest devotion snapshot
  const latestDevotion = strategy.devotionSnapshots[0];

  // Mission stats
  const completedMissions = strategy.missions.filter((m) => m.status === "COMPLETED");

  // Generate recommendations based on weakest pillars
  const sorted = pillarEvolution.sort((a, b) => a.current - b.current);
  const recommendations = sorted.slice(0, 3).map(
    (p) => `Renforcer le pilier ${p.name} (${p.current.toFixed(1)}/25) pour améliorer votre score global.`
  );

  return {
    strategyId,
    period,
    generatedAt: new Date().toISOString(),
    summary: {
      currentScore,
      previousScore: 0,
      delta: currentScore,
      classification: classifyScore(currentScore),
    },
    pillarEvolution: pillarEvolution.sort((a, b) => {
      const order = ["a", "d", "v", "e", "r", "t", "i", "s"];
      return order.indexOf(a.pillar) - order.indexOf(b.pillar);
    }),
    devotion: latestDevotion ? {
      spectateur: latestDevotion.spectateur,
      interesse: latestDevotion.interesse,
      participant: latestDevotion.participant,
      engage: latestDevotion.engage,
      ambassadeur: latestDevotion.ambassadeur,
      evangeliste: latestDevotion.evangeliste,
    } : null,
    missionStats: {
      total: strategy.missions.length,
      completed: completedMissions.length,
      avgQcScore: 0,
    },
    recommendations,
  };
}

function classifyScore(score: number): string {
  if (score <= 80) return "ZOMBIE";
  if (score <= 120) return "ORDINAIRE";
  if (score <= 160) return "FORTE";
  if (score <= 180) return "CULTE";
  return "ICONE";
}

export async function exportHtml(strategyId: string, period: string): Promise<string> {
  const report = await generate(strategyId, period);
  return `<!DOCTYPE html><html><head><title>Value Report — ${report.period}</title></head>
<body><h1>Value Report</h1><pre>${JSON.stringify(report, null, 2)}</pre></body></html>`;
}
