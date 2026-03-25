import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const advertisScorerRouter = createTRPCRouter({
  scoreObject: protectedProcedure
    .input(z.object({
      type: z.string(),
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, score: 0 };
    }),

  batchScore: protectedProcedure
    .input(z.object({
      objects: z.array(z.object({
        type: z.string(),
        id: z.string(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, scores: [] };
    }),

  getHistory: protectedProcedure
    .input(z.object({
      objectId: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, history: [] };
    }),

  recalculate: adminProcedure
    .input(z.object({
      objectId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true };
    }),
});
