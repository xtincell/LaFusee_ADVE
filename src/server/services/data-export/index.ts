import { db } from "@/lib/db";

/**
 * Data Export Service — Export strategy data in JSON or CSV format.
 */

export async function exportStrategyData(strategyId: string) {
  const strategy = await db.strategy.findUniqueOrThrow({
    where: { id: strategyId },
    include: {
      pillars: true,
      drivers: true,
      campaigns: true,
      missions: true,
      devotionSnapshots: { orderBy: { measuredAt: "desc" }, take: 10 },
      signals: { orderBy: { createdAt: "desc" }, take: 20 },
      gloryOutputs: { orderBy: { createdAt: "desc" }, take: 10 },
      brandAssets: true,
    },
  });

  const {
    pillars,
    drivers,
    campaigns,
    missions,
    devotionSnapshots,
    signals,
    gloryOutputs,
    brandAssets,
    ...strategyCore
  } = strategy;

  return {
    strategy: strategyCore,
    pillars,
    drivers,
    campaigns,
    missions,
    devotionSnapshots,
    signals,
    gloryOutputs,
    brandAssets,
  };
}

function toCsvString(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]!);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = row[h];
        const str = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
        return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(",")
    ),
  ];
  return lines.join("\n");
}

export async function exportAsCsv(strategyId: string) {
  const data = await exportStrategyData(strategyId);

  const files: Record<string, string> = {};

  if (data.pillars.length > 0) files["pillars.csv"] = toCsvString(data.pillars as unknown as Record<string, unknown>[]);
  if (data.drivers.length > 0) files["drivers.csv"] = toCsvString(data.drivers as unknown as Record<string, unknown>[]);
  if (data.campaigns.length > 0) files["campaigns.csv"] = toCsvString(data.campaigns as unknown as Record<string, unknown>[]);
  if (data.missions.length > 0) files["missions.csv"] = toCsvString(data.missions as unknown as Record<string, unknown>[]);

  return files;
}
