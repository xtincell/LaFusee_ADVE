import { db } from "@/lib/db";

export interface ExportResult {
  strategyId: string;
  exportedAt: string;
  data: {
    strategy: unknown;
    pillars: unknown[];
    drivers: unknown[];
    campaigns: unknown[];
    missions: unknown[];
    signals: unknown[];
    brandAssets: unknown[];
    devotionSnapshots: unknown[];
  };
}

/**
 * P5.12: RGPD-compliant data export for a strategy (Brand Instance).
 * Returns all data associated with a client's brand in structured JSON.
 */
export async function exportStrategyData(strategyId: string): Promise<ExportResult> {
  const [strategy, pillars, drivers, campaigns, missions, signals, brandAssets, devotionSnapshots] =
    await Promise.all([
      db.strategy.findUniqueOrThrow({ where: { id: strategyId } }),
      db.pillar.findMany({ where: { strategyId } }),
      db.driver.findMany({ where: { strategyId, deletedAt: null } }),
      db.campaign.findMany({ where: { strategyId } }),
      db.mission.findMany({
        where: { strategyId },
        include: { deliverables: true },
      }),
      db.signal.findMany({ where: { strategyId } }),
      db.brandAsset.findMany({ where: { strategyId } }),
      db.devotionSnapshot.findMany({ where: { strategyId } }),
    ]);

  return {
    strategyId,
    exportedAt: new Date().toISOString(),
    data: {
      strategy,
      pillars,
      drivers,
      campaigns,
      missions,
      signals,
      brandAssets,
      devotionSnapshots,
    },
  };
}

/**
 * Export data as CSV-compatible flat arrays.
 */
export async function exportAsCsv(strategyId: string): Promise<Record<string, string>> {
  const result = await exportStrategyData(strategyId);
  const csvFiles: Record<string, string> = {};

  // Strategy
  csvFiles["strategy.csv"] = objectToCsv([result.data.strategy as Record<string, unknown>]);

  // Pillars
  csvFiles["pillars.csv"] = objectToCsv(result.data.pillars as Record<string, unknown>[]);

  // Drivers
  csvFiles["drivers.csv"] = objectToCsv(result.data.drivers as Record<string, unknown>[]);

  // Campaigns
  csvFiles["campaigns.csv"] = objectToCsv(result.data.campaigns as Record<string, unknown>[]);

  // Missions
  csvFiles["missions.csv"] = objectToCsv(result.data.missions as Record<string, unknown>[]);

  return csvFiles;
}

function objectToCsv(objects: Record<string, unknown>[]): string {
  if (objects.length === 0) return "";

  const headers = Object.keys(objects[0]!);
  const rows = objects.map((obj) =>
    headers.map((h) => {
      const val = obj[h];
      if (val === null || val === undefined) return "";
      if (typeof val === "object") return JSON.stringify(val).replace(/"/g, '""');
      return String(val).replace(/"/g, '""');
    }).map((v) => `"${v}"`).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}
