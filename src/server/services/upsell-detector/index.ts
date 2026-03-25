import { db } from "@/lib/db";

interface UpsellOpportunity {
  strategyId: string;
  type: "missing_driver" | "weak_pillar" | "intake_conversion";
  description: string;
  priority: "low" | "medium" | "high";
  suggestedAction: string;
}

export async function detect(strategyId: string): Promise<UpsellOpportunity[]> {
  const strategy = await db.strategy.findUniqueOrThrow({
    where: { id: strategyId },
    include: { drivers: { where: { deletedAt: null } }, pillars: true },
  });

  const opportunities: UpsellOpportunity[] = [];
  const vector = (strategy.advertis_vector as Record<string, number>) ?? {};

  // Check for weak pillars (score < 10/25)
  for (const [key, score] of Object.entries(vector)) {
    if (["a", "d", "v", "e", "r", "t", "i", "s"].includes(key) && (score as number) < 10) {
      opportunities.push({
        strategyId,
        type: "weak_pillar",
        description: `Le pilier ${key.toUpperCase()} est faible (${(score as number).toFixed(1)}/25)`,
        priority: (score as number) < 5 ? "high" : "medium",
        suggestedAction: `Proposer un diagnostic approfondi du pilier ${key.toUpperCase()} et un plan d'action ciblé.`,
      });
    }
  }

  // Check for missing important channels
  const existingChannels = new Set(strategy.drivers.map((d) => d.channel));
  const essentialChannels = ["INSTAGRAM", "WEBSITE", "LINKEDIN"];
  for (const channel of essentialChannels) {
    if (!existingChannels.has(channel)) {
      opportunities.push({
        strategyId,
        type: "missing_driver",
        description: `Aucun Driver ${channel} configuré`,
        priority: "medium",
        suggestedAction: `Proposer l'activation du canal ${channel} avec un Driver dédié.`,
      });
    }
  }

  return opportunities.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}
