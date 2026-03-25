import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../init";

export const messagingRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      strategyId: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      // Messages are stored as GloryOutputs with messaging tool slugs
      return ctx.db.gloryOutput.findMany({
        where: {
          toolSlug: { startsWith: "msg-" },
          ...(input.strategyId ? { strategyId: input.strategyId } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  send: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      channel: z.string(),
      content: z.string().min(1),
      pillarContext: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUniqueOrThrow({
        where: { id: input.strategyId },
      });
      return ctx.db.gloryOutput.create({
        data: {
          strategyId: input.strategyId,
          toolSlug: `msg-${input.channel}`,
          output: {
            content: input.content,
            channel: input.channel,
            pillarContext: input.pillarContext ?? [],
            sentBy: ctx.session.user.id,
            sentAt: new Date().toISOString(),
          } as Prisma.InputJsonValue,
          advertis_vector: strategy.advertis_vector as Prisma.InputJsonValue,
        },
      });
    }),

  getByStrategy: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.gloryOutput.findMany({
        where: { strategyId: input.strategyId, toolSlug: { startsWith: "msg-" } },
        orderBy: { createdAt: "desc" },
      });
    }),

  getByMission: protectedProcedure
    .input(z.object({ missionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const mission = await ctx.db.mission.findUniqueOrThrow({
        where: { id: input.missionId },
        select: { strategyId: true, driverId: true },
      });
      return ctx.db.gloryOutput.findMany({
        where: { strategyId: mission.strategyId, toolSlug: { startsWith: "msg-" } },
        orderBy: { createdAt: "desc" },
      });
    }),
});
