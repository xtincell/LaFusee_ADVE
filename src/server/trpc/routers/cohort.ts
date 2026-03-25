import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../init";

export const cohortRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      name: z.string().min(1),
      criteria: z.record(z.unknown()),
    }))
    .mutation(async ({ ctx, input }) => {
      // Cohorts are stored as signals with cohort metadata
      return ctx.db.signal.create({
        data: {
          strategyId: input.strategyId,
          type: "COHORT_DEFINITION",
          data: {
            name: input.name,
            criteria: input.criteria,
            createdBy: ctx.session.user.id,
            createdAt: new Date().toISOString(),
          } as Prisma.InputJsonValue,
        },
      });
    }),

  list: protectedProcedure
    .input(z.object({
      strategyId: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.signal.findMany({
        where: {
          type: "COHORT_DEFINITION",
          ...(input.strategyId ? { strategyId: input.strategyId } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  getByStrategy: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const cohorts = await ctx.db.signal.findMany({
        where: { strategyId: input.strategyId, type: "COHORT_DEFINITION" },
        orderBy: { createdAt: "desc" },
      });
      // Enrich with devotion data
      const devotion = await ctx.db.devotionSnapshot.findMany({
        where: { strategyId: input.strategyId },
        orderBy: { measuredAt: "desc" },
        take: 1,
      });
      return {
        strategyId: input.strategyId,
        cohorts: cohorts.map((c) => ({
          id: c.id,
          data: c.data,
          createdAt: c.createdAt,
        })),
        latestDevotion: devotion[0] ?? null,
      };
    }),

  connectDevotion: protectedProcedure
    .input(z.object({
      cohortId: z.string(),
      devotionLevel: z.enum(["spectateur", "interesse", "participant", "engage", "ambassadeur", "evangeliste"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const cohort = await ctx.db.signal.findUniqueOrThrow({ where: { id: input.cohortId } });
      const data = (cohort.data as Record<string, unknown>) ?? {};
      return ctx.db.signal.update({
        where: { id: input.cohortId },
        data: {
          data: {
            ...data,
            devotionLevel: input.devotionLevel,
            connectedAt: new Date().toISOString(),
          } as Prisma.InputJsonValue,
        },
      });
    }),
});
