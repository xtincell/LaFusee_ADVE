import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const analyticsRouter = createTRPCRouter({
  getByStrategy: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUniqueOrThrow({
        where: { id: input.strategyId },
        include: {
          pillars: true,
          devotionSnapshots: { orderBy: { measuredAt: "desc" }, take: 10 },
          signals: { orderBy: { createdAt: "desc" }, take: 20 },
          campaigns: { select: { id: true, name: true, status: true } },
          missions: { select: { id: true, status: true } },
        },
      });
      const vector = strategy.advertis_vector as Record<string, number> | null;
      const composite = vector
        ? ["a", "d", "v", "e", "r", "t", "i", "s"].reduce((sum, k) => sum + (vector[k] ?? 0), 0)
        : 0;
      return {
        strategyId: strategy.id,
        name: strategy.name,
        composite,
        vector,
        pillarCount: strategy.pillars.length,
        devotionTrend: strategy.devotionSnapshots.map((s) => ({
          date: s.measuredAt,
          score: s.devotionScore,
        })),
        signalCount: strategy.signals.length,
        campaignCount: strategy.campaigns.length,
        missionBreakdown: {
          total: strategy.missions.length,
          completed: strategy.missions.filter((m) => m.status === "COMPLETED").length,
          active: strategy.missions.filter((m) => m.status === "ACTIVE").length,
        },
      };
    }),

  getByPillar: protectedProcedure
    .input(z.object({ pillarKey: z.string() }))
    .query(async ({ ctx, input }) => {
      const pillars = await ctx.db.pillar.findMany({
        where: { key: input.pillarKey },
        include: { strategy: { select: { id: true, name: true, advertis_vector: true } } },
      });
      return pillars.map((p) => ({
        pillarId: p.id,
        strategyId: p.strategyId,
        strategyName: p.strategy.name,
        confidence: p.confidence,
        content: p.content,
      }));
    }),

  feedKnowledgeGraph: adminProcedure
    .input(z.object({
      strategyId: z.string(),
      entryType: z.enum([
        "DIAGNOSTIC_RESULT", "MISSION_OUTCOME", "BRIEF_PATTERN",
        "CREATOR_PATTERN", "SECTOR_BENCHMARK", "CAMPAIGN_TEMPLATE",
      ]),
      data: z.record(z.unknown()),
      sector: z.string().optional(),
      market: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUniqueOrThrow({
        where: { id: input.strategyId },
      });
      const vector = strategy.advertis_vector as Record<string, number> | null;
      const composite = vector
        ? ["a", "d", "v", "e", "r", "t", "i", "s"].reduce((sum, k) => sum + (vector[k] ?? 0), 0)
        : 0;
      return ctx.db.knowledgeEntry.create({
        data: {
          entryType: input.entryType,
          sector: input.sector ?? null,
          market: input.market ?? null,
          data: { ...input.data, strategyId: input.strategyId } as Prisma.InputJsonValue,
          successScore: composite,
        },
      });
    }),
});
