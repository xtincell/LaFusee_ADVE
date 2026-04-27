import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../init";

export const clubRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      sector: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      // Brands Club: list strategies that qualify as "club" brands (CULTE / ICONE)
      const strategies = await ctx.db.strategy.findMany({
        where: { status: "ACTIVE" },
        include: { pillars: true, devotionSnapshots: { orderBy: { measuredAt: "desc" }, take: 1 } },
        take: input.limit,
        orderBy: { updatedAt: "desc" },
      });
      return strategies
        .map((s) => {
          const vec = s.advertis_vector as Record<string, number> | null;
          const composite = vec
            ? ["a", "d", "v", "e", "r", "t", "i", "s"].reduce((sum, k) => sum + (vec[k] ?? 0), 0)
            : 0;
          return {
            id: s.id,
            name: s.name,
            composite,
            devotionScore: s.devotionSnapshots[0]?.devotionScore ?? 0,
            pillarCount: s.pillars.length,
          };
        })
        .filter((s) => s.composite > 120);
    }),

  join: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Register a brand as a club member by adding a signal
      return ctx.db.signal.create({
        data: {
          strategyId: input.strategyId,
          type: "CLUB_JOIN",
          data: { userId: ctx.session.user.id, joinedAt: new Date().toISOString() } as Prisma.InputJsonValue,
        },
      });
    }),

  getEvents: protectedProcedure
    .input(z.object({ strategyId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      // Club events are stored as signals of type CLUB_EVENT
      return ctx.db.signal.findMany({
        where: {
          type: "CLUB_EVENT",
          ...(input.strategyId ? { strategyId: input.strategyId } : {}),
        },
        orderBy: { createdAt: "desc" },
      });
    }),
});
