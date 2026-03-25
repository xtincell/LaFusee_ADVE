import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const commissionRouter = createTRPCRouter({
  calculate: adminProcedure
    .input(z.object({ missionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const mission = await ctx.db.mission.findUniqueOrThrow({
        where: { id: input.missionId },
      });
      // TODO: Wire to commission-engine service
      return { missionId: input.missionId, calculated: true };
    }),

  list: protectedProcedure
    .input(z.object({ limit: z.number().default(50), cursor: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.commission.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
      });
      let nextCursor: string | undefined;
      if (items.length > input.limit) { nextCursor = items.pop()?.id; }
      return { items, nextCursor };
    }),

  getByMission: protectedProcedure
    .input(z.object({ missionId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.commission.findMany({ where: { missionId: input.missionId } });
    }),

  getByCreator: protectedProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.commission.findMany({
        where: { userId: input.userId ?? ctx.session.user.id },
        orderBy: { createdAt: "desc" },
      });
    }),

  markPaid: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.commission.update({
        where: { id: input.id },
        data: { status: "PAID", paidAt: new Date() },
      });
    }),

  generatePaymentOrder: adminProcedure
    .input(z.object({ commissionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const commission = await ctx.db.commission.findUniqueOrThrow({ where: { id: input.commissionId } });
      // TODO: Wire to commission-engine for payment order generation
      return { commissionId: input.commissionId, paymentOrder: "generated" };
    }),

  getOperatorFees: adminProcedure
    .input(z.object({ operatorId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const commissions = await ctx.db.commission.findMany({
        where: { operatorFee: { not: null } },
      });
      const total = commissions.reduce((sum, c) => sum + (c.operatorFee ?? 0), 0);
      return { total, count: commissions.length };
    }),
});
