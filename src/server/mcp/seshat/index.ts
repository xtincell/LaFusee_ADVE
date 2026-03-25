import { db } from "@/lib/db";
import * as seshatBridge from "@/server/services/seshat-bridge";

/**
 * MCP Server SESHAT — References, brief enrichment, scoring pertinence.
 * ~8 tools, ~3 resources.
 */

// Tools

export async function searchReferences(topic: string, sector?: string, market?: string) {
  return seshatBridge.queryReferences({ topic, sector, market, limit: 10 });
}

export async function enrichBrief(channel: string, sector?: string, market?: string) {
  return seshatBridge.enrichBrief({ channel, sector, market });
}

export async function scorePertinence(referenceId: string, score: number) {
  return seshatBridge.feedbackRelevance(referenceId, score);
}

export async function getReferencesForPillar(pillar: string) {
  return seshatBridge.queryReferences({ topic: pillar, limit: 5 });
}

export async function getSectorReferences(sector: string) {
  return db.knowledgeEntry.findMany({
    where: { entryType: "SECTOR_BENCHMARK", sector },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

export async function getBriefEnrichment(briefContext: Record<string, unknown>) {
  const channel = (briefContext.channel as string) ?? "";
  const sector = briefContext.sector as string | undefined;
  const market = briefContext.market as string | undefined;
  const refs = await seshatBridge.enrichBrief({ channel, sector, market });
  const benchmarks = sector ? await db.knowledgeEntry.findMany({
    where: { entryType: "SECTOR_BENCHMARK", sector },
    take: 3,
  }) : [];
  return { references: refs, benchmarks };
}

// Resources

export async function getReferenceCatalog() {
  return {
    isAvailable: seshatBridge.isAvailable(),
    types: ["article", "case_study", "framework", "benchmark", "cultural_ref"],
  };
}

export async function getTrendingReferences() {
  // Most recent knowledge entries as proxy for "trending"
  return db.knowledgeEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

export async function getSectorReferencesSummary() {
  const entries = await db.knowledgeEntry.findMany({
    where: { entryType: "SECTOR_BENCHMARK" },
  });
  const sectors = [...new Set(entries.map((e) => e.sector).filter(Boolean))];
  return sectors.map((sector) => ({
    sector,
    count: entries.filter((e) => e.sector === sector).length,
  }));
}
