import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../init";

export const upsellRouter = createTRPCRouter({
  detect: adminProcedure
    .input(z.object({
      strategyId: z.string().optional(),
      clientId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, opportunities: [] };
    }),

  list: adminProcedure
    .input(z.object({
      status: z.enum(["PENDING", "ACCEPTED", "DISMISSED"]).optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, upsells: [] };
    }),

  dismiss: adminProcedure
    .input(z.object({
      upsellId: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true };
    }),
});
