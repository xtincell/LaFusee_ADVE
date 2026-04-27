import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../init";

export const gloryRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ strategyId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.gloryOutput.findMany({
        where: input.strategyId ? { strategyId: input.strategyId } : {},
        orderBy: { createdAt: "desc" },
      });
    }),

  execute: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      toolSlug: z.string(),
      params: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUniqueOrThrow({
        where: { id: input.strategyId },
        include: { pillars: true },
      });
      const vector = strategy.advertis_vector as Record<string, number> | null;
      const output = {
        toolSlug: input.toolSlug,
        params: input.params ?? {},
        generatedAt: new Date().toISOString(),
        pillarContext: strategy.pillars.map((p) => p.key),
        advertis_vector: vector,
      };
      return ctx.db.gloryOutput.create({
        data: {
          strategyId: input.strategyId,
          toolSlug: input.toolSlug,
          output: output as Prisma.InputJsonValue,
          advertis_vector: vector as Prisma.InputJsonValue,
        },
      });
    }),

  getByDriver: protectedProcedure
    .input(z.object({ driverId: z.string() }))
    .query(async ({ ctx, input }) => {
      const driverTools = await ctx.db.driverGloryTool.findMany({
        where: { driverId: input.driverId },
      });
      const toolSlugs = driverTools.map((dt) => dt.gloryTool);
      return ctx.db.gloryOutput.findMany({
        where: { toolSlug: { in: toolSlugs } },
        orderBy: { createdAt: "desc" },
      });
    }),

  getOutput: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.gloryOutput.findUniqueOrThrow({
        where: { id: input.id },
        include: { strategy: { select: { id: true, name: true, pillars: true } } },
      });
    }),
});
