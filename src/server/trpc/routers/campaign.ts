import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const campaignRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      strategyId: z.string(),
      advertis_vector: z.record(z.number()).optional(),
      devotionObjective: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { advertis_vector, devotionObjective, ...rest } = input;
      return ctx.db.campaign.create({
        data: {
          ...rest,
          advertis_vector: advertis_vector as Prisma.InputJsonValue,
          devotionObjective: devotionObjective as Prisma.InputJsonValue,
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      status: z.string().optional(),
      advertis_vector: z.record(z.number()).optional(),
      devotionObjective: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, advertis_vector, devotionObjective, ...data } = input;
      return ctx.db.campaign.update({
        where: { id },
        data: {
          ...data,
          ...(advertis_vector ? { advertis_vector: advertis_vector as Prisma.InputJsonValue } : {}),
          ...(devotionObjective ? { devotionObjective: devotionObjective as Prisma.InputJsonValue } : {}),
        },
      });
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.campaign.findUniqueOrThrow({
        where: { id: input.id },
        include: { missions: true, strategy: true },
      });
    }),

  list: protectedProcedure
    .input(z.object({ strategyId: z.string().optional(), status: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.campaign.findMany({
        where: {
          ...(input.strategyId ? { strategyId: input.strategyId } : {}),
          ...(input.status ? { status: input.status } : {}),
        },
        include: { missions: { select: { id: true, status: true } } },
        orderBy: { createdAt: "desc" },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.campaign.update({
        where: { id: input.id },
        data: { status: "ARCHIVED" },
      });
    }),
});
