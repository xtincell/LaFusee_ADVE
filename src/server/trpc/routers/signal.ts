import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../init";

export const signalRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      type: z.string(),
      data: z.record(z.unknown()).optional(),
      advertis_vector: z.record(z.number()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, advertis_vector, ...rest } = input;
      return ctx.db.signal.create({
        data: {
          ...rest,
          data: data as Prisma.InputJsonValue,
          advertis_vector: advertis_vector as Prisma.InputJsonValue,
        },
      });
    }),

  list: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      type: z.string().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.signal.findMany({
        where: {
          strategyId: input.strategyId,
          ...(input.type ? { type: input.type } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.signal.findUniqueOrThrow({
        where: { id: input.id },
        include: { strategy: true },
      });
    }),
});
