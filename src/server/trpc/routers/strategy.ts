import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const strategyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      operatorId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.strategy.create({
        data: { ...input, userId: ctx.session.user.id },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      status: z.string().optional(),
      advertis_vector: z.record(z.number()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, advertis_vector, ...data } = input;
      return ctx.db.strategy.update({
        where: { id },
        data: {
          ...data,
          ...(advertis_vector ? { advertis_vector: advertis_vector as Prisma.InputJsonValue } : {}),
        },
      });
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.strategy.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          pillars: true,
          drivers: { where: { deletedAt: null } },
          campaigns: true,
          devotionSnapshots: { orderBy: { measuredAt: "desc" }, take: 1 },
          brandAssets: { take: 10 },
        },
      });
    }),

  list: protectedProcedure
    .input(z.object({
      operatorId: z.string().optional(),
      status: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.strategy.findMany({
        where: {
          ...(input.operatorId ? { operatorId: input.operatorId } : {}),
          ...(input.status ? { status: input.status } : {}),
        },
        include: { pillars: true },
        orderBy: { updatedAt: "desc" },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.strategy.update({
        where: { id: input.id },
        data: { status: "ARCHIVED" },
      });
    }),

  getWithScore: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUniqueOrThrow({
        where: { id: input.id },
        include: { pillars: true },
      });
      const vector = strategy.advertis_vector as Record<string, number> | null;
      const composite = vector
        ? ["a","d","v","e","r","t","i","s"].reduce((sum, k) => sum + (vector[k] ?? 0), 0)
        : 0;
      return { ...strategy, composite, classification: classifyScore(composite) };
    }),
});

function classifyScore(composite: number): string {
  if (composite <= 80) return "ZOMBIE";
  if (composite <= 120) return "ORDINAIRE";
  if (composite <= 160) return "FORTE";
  if (composite <= 180) return "CULTE";
  return "ICONE";
}
