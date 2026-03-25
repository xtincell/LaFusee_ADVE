import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const commissionRouter = createTRPCRouter({
  calculate: adminProcedure
    .input(z.object({
      missionId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, amount: 0 };
    }),

  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, commissions: [] };
    }),

  getByMission: protectedProcedure
    .input(z.object({
      missionId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, commissions: [] };
    }),

  getByCreator: protectedProcedure
    .input(z.object({
      creatorId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, commissions: [] };
    }),

  markPaid: adminProcedure
    .input(z.object({
      commissionId: z.string(),
      paymentRef: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true };
    }),

  generatePaymentOrder: adminProcedure
    .input(z.object({
      commissionIds: z.array(z.string()).min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, paymentOrder: null };
    }),

  getOperatorFees: adminProcedure
    .input(z.object({
      operatorId: z.string().optional(),
      period: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, fees: [] };
    }),
});
