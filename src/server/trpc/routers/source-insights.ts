import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const sourceInsightsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      sector: z.string().optional(),
      market: z.string().optional(),
      entryType: z.enum([
        "DIAGNOSTIC_RESULT", "MISSION_OUTCOME", "BRIEF_PATTERN",
        "CREATOR_PATTERN", "SECTOR_BENCHMARK", "CAMPAIGN_TEMPLATE",
      ]).optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.knowledgeEntry.findMany({
        where: {
          ...(input.entryType ? { entryType: input.entryType } : {}),
          ...(input.sector ? { sector: input.sector } : {}),
          ...(input.market ? { market: input.market } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  analyze: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      sector: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUniqueOrThrow({
        where: { id: input.strategyId },
        include: { pillars: true },
      });
      // Pull sector benchmarks
      const benchmarks = await ctx.db.knowledgeEntry.findMany({
        where: {
          entryType: "SECTOR_BENCHMARK",
          ...(input.sector ? { sector: input.sector } : {}),
        },
        orderBy: { successScore: "desc" },
        take: 10,
      });
      const vector = strategy.advertis_vector as Record<string, number> | null;
      const composite = vector
        ? ["a", "d", "v", "e", "r", "t", "i", "s"].reduce((sum, k) => sum + (vector[k] ?? 0), 0)
        : 0;
      const avgBenchmark = benchmarks.length > 0
        ? benchmarks.reduce((sum, b) => sum + (b.successScore ?? 0), 0) / benchmarks.length
        : 0;
      return {
        strategyId: input.strategyId,
        composite,
        benchmarkAvg: avgBenchmark,
        gap: composite - avgBenchmark,
        pillarInsights: strategy.pillars.map((p) => ({
          key: p.key,
          confidence: p.confidence,
        })),
        benchmarkCount: benchmarks.length,
      };
    }),

  getInsights: protectedProcedure
    .input(z.object({
      sector: z.string(),
      market: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const entries = await ctx.db.knowledgeEntry.findMany({
        where: { sector: input.sector, ...(input.market ? { market: input.market } : {}) },
        orderBy: { successScore: "desc" },
        take: 50,
      });
      const grouped = entries.reduce<Record<string, typeof entries>>((acc, e) => {
        const key = e.entryType;
        if (!acc[key]) acc[key] = [];
        acc[key]!.push(e);
        return acc;
      }, {});
      return {
        sector: input.sector,
        market: input.market ?? null,
        totalEntries: entries.length,
        byType: Object.entries(grouped).map(([type, items]) => ({
          type,
          count: items.length,
          avgScore: items.reduce((s, i) => s + (i.successScore ?? 0), 0) / items.length,
        })),
      };
    }),
});
