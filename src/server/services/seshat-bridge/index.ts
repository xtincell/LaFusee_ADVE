/**
 * SESHAT Bridge — External API client for cultural references enrichment.
 * Conditional: only active if SESHAT_API_URL is configured.
 */

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
 * Query SESHAT for relevant references.
 */
export async function queryReferences(query: SeshatQuery): Promise<SeshatReference[]> {
  if (!SESHAT_API_URL) {
    // SESHAT not configured — return empty
    return [];
  }

  try {
    const params = new URLSearchParams({
      topic: query.topic,
      ...(query.sector && { sector: query.sector }),
      ...(query.market && { market: query.market }),
      ...(query.pillarFocus && { pillar: query.pillarFocus }),
      limit: String(query.limit ?? 5),
    });

    const response = await fetch(`${SESHAT_API_URL}/api/references?${params}`, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return [];
    return (await response.json()) as SeshatReference[];
  } catch {
    return []; // Graceful degradation
  }
}

/**
 * Enrich a brief with SESHAT references.
 */
export async function enrichBrief(
  briefContext: { channel: string; sector?: string; market?: string; pillarFocus?: string }
): Promise<SeshatReference[]> {
  return queryReferences({
    topic: `brief ${briefContext.channel}`,
    sector: briefContext.sector,
    market: briefContext.market,
    pillarFocus: briefContext.pillarFocus,
    limit: 3,
  });
}

/**
 * Submit relevance feedback to SESHAT.
 */
export async function feedbackRelevance(
  referenceId: string,
  score: number
): Promise<boolean> {
  if (!SESHAT_API_URL) return false;

  try {
    const response = await fetch(`${SESHAT_API_URL}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referenceId, relevanceScore: score }),
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Check if SESHAT is available.
 */
export function isAvailable(): boolean {
  return !!SESHAT_API_URL;
}
