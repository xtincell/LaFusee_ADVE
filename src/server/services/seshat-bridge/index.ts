/**
 * SESHAT Bridge — Cultural references and knowledge enrichment.
 *
 * Mode local: queries the internal Knowledge Graph (KnowledgeEntry).
 * Mode externe: if SESHAT_API_URL is configured, queries an external API.
 * Fallback: always returns local results, enriched by external if available.
 */

import { db } from "@/lib/db";
import { PILLAR_NAMES, type PillarKey } from "@/lib/types/advertis-vector";

const SESHAT_API_URL = process.env.SESHAT_API_URL;

export interface SeshatReference {
  id: string;
  title: string;
  type: "article" | "case_study" | "framework" | "benchmark" | "cultural_ref";
  relevance: number;
  excerpt: string;
  source: string;
  tags: string[];
}

export interface SeshatQuery {
  topic: string;
  sector?: string;
  market?: string;
  pillarFocus?: string;
  limit?: number;
}

/**
 * Query SESHAT for relevant references — local Knowledge Graph first,
 * enriched by external API if available.
 */
export async function queryReferences(query: SeshatQuery): Promise<SeshatReference[]> {
  const limit = query.limit ?? 5;

  // Always query local Knowledge Graph
  const localResults = await queryLocalKnowledgeGraph(query, limit);

  // If external SESHAT is configured, merge results
  if (SESHAT_API_URL) {
    const externalResults = await queryExternalApi(query, limit);
    // Merge local + external, deduplicate by id, sort by relevance
    const merged = [...localResults];
    for (const ext of externalResults) {
      if (!merged.some((r) => r.id === ext.id)) {
        merged.push(ext);
      }
    }
    return merged.sort((a, b) => b.relevance - a.relevance).slice(0, limit);
  }

  return localResults;
}

/**
 * Enrich a brief with SESHAT references.
 */
export async function enrichBrief(
  briefContext: { channel: string; sector?: string; market?: string; pillarFocus?: string }
): Promise<SeshatReference[]> {
  // Get channel-specific brief patterns
  const briefPatterns = await db.knowledgeEntry.findMany({
    where: {
      entryType: "BRIEF_PATTERN",
      ...(briefContext.channel ? { channel: briefContext.channel } : {}),
    },
    take: 3,
  });

  // Get sector benchmarks
  const benchmarks = await db.knowledgeEntry.findMany({
    where: {
      entryType: "SECTOR_BENCHMARK",
      ...(briefContext.sector ? { sector: briefContext.sector } : {}),
      ...(briefContext.market ? { market: briefContext.market } : {}),
    },
    take: 3,
  });

  // Get framework recommendations based on pillar focus
  const frameworks = briefContext.pillarFocus
    ? await getFrameworksForPillar(briefContext.pillarFocus)
    : [];

  const results: SeshatReference[] = [];

  for (const bp of briefPatterns) {
    const data = bp.data as Record<string, unknown>;
    results.push({
      id: bp.id,
      title: `Brief Pattern: ${bp.channel ?? "Général"}`,
      type: "benchmark",
      relevance: bp.successScore ?? 0.5,
      excerpt: `Taux de succès: ${((data.successRate as number) ?? 0) * 100}%. Révisions moyennes: ${data.avgRevisions ?? "N/A"}`,
      source: "Knowledge Graph (local)",
      tags: [bp.channel ?? "", "brief_pattern"].filter(Boolean),
    });
  }

  for (const bm of benchmarks) {
    const data = bm.data as Record<string, unknown>;
    results.push({
      id: bm.id,
      title: `Benchmark ${bm.sector ?? ""} ${bm.market ?? ""}`,
      type: "benchmark",
      relevance: bm.successScore ?? 0.5,
      excerpt: `Score moyen: ${data.avgComposite ?? "N/A"}/200. Top quartile: ${data.topQuartile ?? "N/A"}/200`,
      source: "Knowledge Graph (local)",
      tags: [bm.sector ?? "", bm.market ?? ""].filter(Boolean),
    });
  }

  for (const fw of frameworks) {
    results.push(fw);
  }

  return results.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
}

/**
 * Submit relevance feedback — stored locally as KnowledgeEntry update.
 */
export async function feedbackRelevance(
  referenceId: string,
  score: number
): Promise<boolean> {
  try {
    // Update local knowledge entry with relevance feedback
    const entry = await db.knowledgeEntry.findUnique({ where: { id: referenceId } });
    if (entry) {
      const currentScore = entry.successScore ?? 0.5;
      const newScore = (currentScore * entry.sampleSize + score) / (entry.sampleSize + 1);
      await db.knowledgeEntry.update({
        where: { id: referenceId },
        data: {
          successScore: newScore,
          sampleSize: entry.sampleSize + 1,
        },
      });
    }

    // Also forward to external API if available
    if (SESHAT_API_URL) {
      await fetch(`${SESHAT_API_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceId, relevanceScore: score }),
        signal: AbortSignal.timeout(3000),
      }).catch(() => {}); // Non-blocking
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Check if SESHAT is available (always true now — local mode always works).
 */
export function isAvailable(): boolean {
  return true;
}

/**
 * Check if external SESHAT API is configured.
 */
export function isExternalAvailable(): boolean {
  return !!SESHAT_API_URL;
}

// --- Internal functions ---

async function queryLocalKnowledgeGraph(query: SeshatQuery, limit: number): Promise<SeshatReference[]> {
  const results: SeshatReference[] = [];

  // Search by sector
  if (query.sector) {
    const entries = await db.knowledgeEntry.findMany({
      where: { sector: query.sector },
      orderBy: { successScore: "desc" },
      take: limit,
    });
    for (const e of entries) {
      results.push(knowledgeEntryToReference(e));
    }
  }

  // Search by market
  if (query.market && results.length < limit) {
    const entries = await db.knowledgeEntry.findMany({
      where: { market: query.market },
      orderBy: { successScore: "desc" },
      take: limit - results.length,
    });
    for (const e of entries) {
      if (!results.some((r) => r.id === e.id)) {
        results.push(knowledgeEntryToReference(e));
      }
    }
  }

  // Search by pillar
  if (query.pillarFocus && results.length < limit) {
    const entries = await db.knowledgeEntry.findMany({
      where: { pillarFocus: query.pillarFocus },
      orderBy: { successScore: "desc" },
      take: limit - results.length,
    });
    for (const e of entries) {
      if (!results.some((r) => r.id === e.id)) {
        results.push(knowledgeEntryToReference(e));
      }
    }
  }

  // Fallback: general top entries
  if (results.length < limit) {
    const entries = await db.knowledgeEntry.findMany({
      orderBy: { successScore: "desc" },
      take: limit - results.length,
    });
    for (const e of entries) {
      if (!results.some((r) => r.id === e.id)) {
        results.push(knowledgeEntryToReference(e));
      }
    }
  }

  return results.slice(0, limit);
}

async function queryExternalApi(query: SeshatQuery, limit: number): Promise<SeshatReference[]> {
  if (!SESHAT_API_URL) return [];

  try {
    const params = new URLSearchParams({
      topic: query.topic,
      ...(query.sector && { sector: query.sector }),
      ...(query.market && { market: query.market }),
      ...(query.pillarFocus && { pillar: query.pillarFocus }),
      limit: String(limit),
    });

    const response = await fetch(`${SESHAT_API_URL}/api/references?${params}`, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return [];
    return (await response.json()) as SeshatReference[];
  } catch {
    return [];
  }
}

function knowledgeEntryToReference(entry: {
  id: string;
  entryType: string;
  sector: string | null;
  market: string | null;
  channel: string | null;
  data: unknown;
  successScore: number | null;
}): SeshatReference {
  const data = entry.data as Record<string, unknown>;

  const typeMap: Record<string, SeshatReference["type"]> = {
    SECTOR_BENCHMARK: "benchmark",
    BRIEF_PATTERN: "case_study",
    CREATOR_PATTERN: "article",
    DIAGNOSTIC_RESULT: "framework",
    MISSION_OUTCOME: "case_study",
    CAMPAIGN_TEMPLATE: "case_study",
  };

  return {
    id: entry.id,
    title: generateTitle(entry),
    type: typeMap[entry.entryType] ?? "article",
    relevance: entry.successScore ?? 0.5,
    excerpt: generateExcerpt(entry.entryType, data),
    source: "Knowledge Graph (local)",
    tags: [entry.sector, entry.market, entry.channel].filter(Boolean) as string[],
  };
}

function generateTitle(entry: { entryType: string; sector: string | null; market: string | null; channel: string | null }): string {
  switch (entry.entryType) {
    case "SECTOR_BENCHMARK": return `Benchmark ${entry.sector ?? "secteur"} — ${entry.market ?? "marché"}`;
    case "BRIEF_PATTERN": return `Pattern brief ${entry.channel ?? "canal"}`;
    case "CREATOR_PATTERN": return "Profil créateur performant";
    case "DIAGNOSTIC_RESULT": return "Résultat diagnostic ARTEMIS";
    case "MISSION_OUTCOME": return "Résultat mission";
    case "CAMPAIGN_TEMPLATE": return `Template campagne ${entry.channel ?? ""}`;
    default: return `Référence ${entry.entryType}`;
  }
}

function generateExcerpt(entryType: string, data: Record<string, unknown>): string {
  switch (entryType) {
    case "SECTOR_BENCHMARK":
      return `Score moyen: ${data.avgComposite ?? "N/A"}/200. ${data.insight ?? ""}`;
    case "BRIEF_PATTERN":
      return `Taux succès: ${((data.successRate as number) ?? 0) * 100}%. Révisions: ${data.avgRevisions ?? "N/A"}`;
    case "CREATOR_PATTERN":
      return String(data.insight ?? "Patterns de performance créateurs");
    case "DIAGNOSTIC_RESULT":
      return `Type: ${data.type ?? "diagnostic"}`;
    default:
      return JSON.stringify(data).slice(0, 200);
  }
}

async function getFrameworksForPillar(pillarFocus: string): Promise<SeshatReference[]> {
  const pillarKey = pillarFocus.toLowerCase() as PillarKey;
  const pillarName = PILLAR_NAMES[pillarKey] ?? pillarFocus;

  const frameworkMap: Record<string, { id: string; title: string; effectiveness: number }[]> = {
    a: [{ id: "fw-03", title: "FW-03 Brand Prism", effectiveness: 0.82 }, { id: "fw-01", title: "FW-01 Brand Audit", effectiveness: 0.85 }],
    d: [{ id: "fw-05", title: "FW-05 Positioning Map", effectiveness: 0.80 }, { id: "fw-02", title: "FW-02 Competitor Map", effectiveness: 0.78 }],
    v: [{ id: "fw-06", title: "FW-06 Value Proposition Canvas", effectiveness: 0.77 }],
    e: [{ id: "fw-07", title: "FW-07 Community Audit", effectiveness: 0.75 }],
    r: [{ id: "fw-04", title: "FW-04 SWOT+", effectiveness: 0.75 }],
    t: [{ id: "fw-08", title: "FW-08 KPI Framework", effectiveness: 0.73 }],
    i: [{ id: "fw-09", title: "FW-09 Roadmap Builder", effectiveness: 0.70 }],
    s: [{ id: "fw-01", title: "FW-01 Brand Audit", effectiveness: 0.85 }],
  };

  const frameworks = frameworkMap[pillarKey] ?? [];
  return frameworks.map((fw) => ({
    id: fw.id,
    title: `${fw.title} — recommandé pour ${pillarName}`,
    type: "framework" as const,
    relevance: fw.effectiveness,
    excerpt: `Effectiveness: ${(fw.effectiveness * 100).toFixed(0)}%. Recommandé quand le pilier ${pillarName} est faible.`,
    source: "ARTEMIS Framework Library",
    tags: [pillarKey, "framework"],
  }));
}
