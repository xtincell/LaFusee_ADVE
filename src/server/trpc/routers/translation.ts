import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../init";

export const translationRouter = createTRPCRouter({
  translate: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      sourceContent: z.string().min(1),
      targetMarket: z.string(),
      targetLanguage: z.string(),
      pillarContext: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUniqueOrThrow({
        where: { id: input.strategyId },
      });
      // Store translation as a GloryOutput
      return ctx.db.gloryOutput.create({
        data: {
          strategyId: input.strategyId,
          toolSlug: "translation",
          output: {
            sourceContent: input.sourceContent,
            targetMarket: input.targetMarket,
            targetLanguage: input.targetLanguage,
            pillarContext: input.pillarContext ?? [],
            translatedAt: new Date().toISOString(),
          } as Prisma.InputJsonValue,
          advertis_vector: strategy.advertis_vector as Prisma.InputJsonValue,
        },
      });
    }),

  getMarkets: protectedProcedure.query(async ({ ctx }) => {
    // Derive markets from KnowledgeEntry data
    const entries = await ctx.db.knowledgeEntry.findMany({
      where: { market: { not: null } },
      select: { market: true },
      distinct: ["market"],
    });
    return entries.map((e) => e.market).filter(Boolean) as string[];
  }),

  getAdaptations: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.gloryOutput.findMany({
        where: { strategyId: input.strategyId, toolSlug: "translation" },
        orderBy: { createdAt: "desc" },
      });
    }),
});
