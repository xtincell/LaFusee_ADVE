import { db } from "@/lib/db";
import type { PillarKey } from "@/lib/types/advertis-vector";
import { PILLAR_KEYS } from "@/lib/types/advertis-vector";

interface TagResult {
  assetId: string;
  pillarTags: Record<PillarKey, number>; // relevance 0-1 per pillar
  primaryPillar: PillarKey;
  confidence: number;
}

/**
 * AI-assisted ADVE tagging on brand assets.
 * Determines which pillars an asset serves and how strongly.
 */
export async function tagAsset(assetId: string): Promise<TagResult> {
  const asset = await db.brandAsset.findUniqueOrThrow({
    where: { id: assetId },
    include: { strategy: { include: { pillars: true } } },
  });

  // Heuristic tagging based on asset name and context
  const tags = inferPillarTags(asset.name, asset.fileUrl);

  // Persist tags
  await db.brandAsset.update({
    where: { id: assetId },
    data: { pillarTags: tags },
  });

  const entries = Object.entries(tags) as [PillarKey, number][];
  const primaryPillar = entries.sort(([, a], [, b]) => b - a)[0]?.[0] ?? "a";

  return {
    assetId,
    pillarTags: tags as Record<PillarKey, number>,
    primaryPillar,
    confidence: 0.6, // Heuristic confidence
  };
}

function inferPillarTags(name: string, fileUrl: string | null): Record<string, number> {
  const lower = (name + " " + (fileUrl ?? "")).toLowerCase();
  const tags: Record<string, number> = {};

  for (const key of PILLAR_KEYS) {
    tags[key] = 0.1; // base relevance
  }

  // Keyword-based heuristics
  if (/logo|brand|identity|charte/i.test(lower)) { tags.a = 0.9; tags.d = 0.8; }
  if (/visual|design|color|typo/i.test(lower)) { tags.d = 0.9; }
  if (/product|service|offer/i.test(lower)) { tags.v = 0.8; }
  if (/community|event|social/i.test(lower)) { tags.e = 0.8; }
  if (/risk|crisis|legal/i.test(lower)) { tags.r = 0.8; }
  if (/kpi|metric|report/i.test(lower)) { tags.t = 0.8; }
  if (/plan|roadmap|budget/i.test(lower)) { tags.i = 0.8; }
  if (/guide|playbook|bible/i.test(lower)) { tags.s = 0.9; }

  return tags;
}
