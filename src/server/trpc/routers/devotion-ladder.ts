import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const devotionLadderRouter = createTRPCRouter({
  snapshot: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, snapshot: null };
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      // TODO: implement
      return { success: true, ladders: [] };
    }),

  getByStrategy: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, ladder: null };
    }),

  setObjective: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      objective: z.string(),
      targetLevel: z.number().min(1).max(10),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true };
    }),

  compare: protectedProcedure
    .input(z.object({
      strategyIds: z.array(z.string()).min(2),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, comparison: [] };
    }),
});
