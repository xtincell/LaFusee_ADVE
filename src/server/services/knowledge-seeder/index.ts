import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

/**
 * Knowledge Seeder (F.3) — Injects Alexandre's expertise as cold start data.
 * Called during initial setup to bootstrap the Knowledge Graph.
 */
export async function seedExpertise(): Promise<number> {
  const existing = await db.knowledgeEntry.count({
    where: { sourceHash: "seed-expertise" },
  });

  if (existing > 0) {
    return existing; // Already seeded
  }

  const entries: Prisma.KnowledgeEntryCreateInput[] = [
    // Sector benchmarks by market
    ...generateSectorBenchmarks(),
    // Brief patterns by channel
    ...generateBriefPatterns(),
    // Framework effectiveness rankings
    ...generateFrameworkRankings(),
  ];

  let count = 0;
  for (const entry of entries) {
    await db.knowledgeEntry.create({ data: entry });
    count++;
  }

  return count;
}

function generateSectorBenchmarks(): Prisma.KnowledgeEntryCreateInput[] {
  const sectors = [
    { sector: "FMCG", markets: ["CM", "CI", "SN"], avgComposite: 95, weakness: "D" },
    { sector: "BANQUE", markets: ["CM", "CI"], avgComposite: 110, weakness: "E" },
    { sector: "TELECOM", markets: ["CM", "CI", "SN", "GA"], avgComposite: 125, weakness: "A" },
    { sector: "IMMOBILIER", markets: ["CM", "CI"], avgComposite: 85, weakness: "T" },
    { sector: "TECH", markets: ["CM", "CI", "SN"], avgComposite: 100, weakness: "S" },
    { sector: "SANTE", markets: ["CM"], avgComposite: 90, weakness: "E" },
    { sector: "EDUCATION", markets: ["CM", "CI"], avgComposite: 88, weakness: "I" },
    { sector: "MODE", markets: ["CI", "SN"], avgComposite: 105, weakness: "R" },
  ];

  const entries: Prisma.KnowledgeEntryCreateInput[] = [];
  for (const s of sectors) {
    for (const market of s.markets) {
      entries.push({
        entryType: "SECTOR_BENCHMARK",
        sector: s.sector,
        market,
        data: {
          avgComposite: s.avgComposite,
          topQuartile: Math.round(s.avgComposite * 1.4),
          weakness: s.weakness,
          sampleSize: Math.floor(Math.random() * 15) + 5,
        } as Prisma.InputJsonValue,
        successScore: s.avgComposite / 200,
        sampleSize: Math.floor(Math.random() * 15) + 5,
        sourceHash: "seed-expertise",
      });
    }
  }
  return entries;
}

function generateBriefPatterns(): Prisma.KnowledgeEntryCreateInput[] {
  const channels = [
    { channel: "INSTAGRAM", successRate: 0.78, avgRevisions: 1.2 },
    { channel: "FACEBOOK", successRate: 0.72, avgRevisions: 1.5 },
    { channel: "TIKTOK", successRate: 0.65, avgRevisions: 2.0 },
    { channel: "LINKEDIN", successRate: 0.80, avgRevisions: 1.1 },
    { channel: "VIDEO", successRate: 0.60, avgRevisions: 2.5 },
    { channel: "PR", successRate: 0.85, avgRevisions: 1.0 },
    { channel: "EVENT", successRate: 0.70, avgRevisions: 1.8 },
    { channel: "PACKAGING", successRate: 0.55, avgRevisions: 3.0 },
  ];

  return channels.map((c) => ({
    entryType: "BRIEF_PATTERN" as const,
    channel: c.channel,
    data: {
      successRate: c.successRate,
      avgRevisions: c.avgRevisions,
    } as Prisma.InputJsonValue,
    successScore: c.successRate,
    sampleSize: Math.floor(Math.random() * 40) + 20,
    sourceHash: "seed-expertise",
  }));
}

function generateFrameworkRankings(): Prisma.KnowledgeEntryCreateInput[] {
  return [
    {
      entryType: "DIAGNOSTIC_RESULT",
      data: {
        type: "framework_ranking",
        rankings: [
          { framework: "FW-01-BRAND-AUDIT", effectiveness: 0.85, usageCount: 120 },
          { framework: "FW-02-COMPETITOR-MAP", effectiveness: 0.78, usageCount: 95 },
          { framework: "FW-03-BRAND-PRISM", effectiveness: 0.82, usageCount: 80 },
          { framework: "FW-04-SWOT-PLUS", effectiveness: 0.75, usageCount: 110 },
          { framework: "FW-05-POSITIONING-MAP", effectiveness: 0.80, usageCount: 70 },
        ],
      } as Prisma.InputJsonValue,
      sourceHash: "seed-expertise",
    },
  ];
}
