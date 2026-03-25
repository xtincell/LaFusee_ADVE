import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const frameworkRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.knowledgeEntry.findMany({
      where: { entryType: "DIAGNOSTIC_RESULT" },
      orderBy: { successScore: "desc" },
    });
  }),

  getByPillar: protectedProcedure
    .input(z.object({ pillar: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.knowledgeEntry.findMany({
        where: { entryType: "DIAGNOSTIC_RESULT", pillarFocus: input.pillar },
        orderBy: { successScore: "desc" },
      });
    }),

  diagnose: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      sector: z.string().optional(),
      market: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUniqueOrThrow({
        where: { id: input.strategyId },
        include: { pillars: true },
      });
      const vector = strategy.advertis_vector as Record<string, number> | null;
      const pillarScores = strategy.pillars.map((p) => ({
        key: p.key,
        confidence: p.confidence ?? 0,
      }));
      const composite = vector
        ? ["a", "d", "v", "e", "r", "t", "i", "s"].reduce((sum, k) => sum + (vector[k] ?? 0), 0)
        : 0;

      // Store diagnostic result in knowledge graph
      const entry = await ctx.db.knowledgeEntry.create({
        data: {
          entryType: "DIAGNOSTIC_RESULT",
          sector: input.sector ?? null,
          market: input.market ?? null,
          pillarFocus: pillarScores[0]?.key ?? null,
          data: { strategyId: input.strategyId, composite, pillarScores } as Prisma.InputJsonValue,
          successScore: composite,
          sampleSize: 1,
        },
      });
      return { entry, composite, pillarScores };
    }),

  tagPillar: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      pillarKey: z.string(),
      content: z.record(z.unknown()),
      confidence: z.number().min(0).max(1).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.pillar.upsert({
        where: { strategyId_key: { strategyId: input.strategyId, key: input.pillarKey } },
        create: {
          strategyId: input.strategyId,
          key: input.pillarKey,
          content: input.content as Prisma.InputJsonValue,
          confidence: input.confidence ?? 0.5,
        },
        update: {
          content: input.content as Prisma.InputJsonValue,
          confidence: input.confidence,
        },
      });
    }),
});
