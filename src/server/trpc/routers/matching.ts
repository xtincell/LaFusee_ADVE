import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const matchingRouter = createTRPCRouter({
  suggest: protectedProcedure
    .input(z.object({
      briefId: z.string(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, suggestions: [] };
    }),

  override: adminProcedure
    .input(z.object({
      briefId: z.string(),
      creatorId: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true };
    }),

  getHistory: protectedProcedure
    .input(z.object({
      briefId: z.string().optional(),
      creatorId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, history: [] };
    }),

  getBestForBrief: protectedProcedure
    .input(z.object({
      briefId: z.string(),
      criteria: z.record(z.number()).optional(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, matches: [] };
    }),
});
