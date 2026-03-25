import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const operatorRouter = createTRPCRouter({
  getOwn: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUniqueOrThrow({
      where: { id: ctx.session.user.id },
      include: { operator: true },
    });
    return user.operator;
  }),

  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.operator.findMany({ orderBy: { createdAt: "desc" } });
  }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      maxBrands: z.number().optional(),
      commissionRate: z.number().min(0).max(1).optional(),
      branding: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.operator.update({ where: { id }, data });
    }),

  getStats: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [userCount, strategyCount] = await Promise.all([
        ctx.db.user.count({ where: { operatorId: input.id } }),
        ctx.db.strategy.count({ where: { operatorId: input.id } }),
      ]);
      return { userCount, strategyCount };
    }),
});
