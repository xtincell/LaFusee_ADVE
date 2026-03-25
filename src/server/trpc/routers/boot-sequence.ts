import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../init";

export const bootSequenceRouter = createTRPCRouter({
  start: adminProcedure
    .input(z.object({
      strategyId: z.string(),
      config: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, sequenceId: "" };
    }),

  advance: adminProcedure
    .input(z.object({
      sequenceId: z.string(),
      stepData: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, currentStep: 0 };
    }),

  complete: adminProcedure
    .input(z.object({
      sequenceId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true };
    }),

  getState: adminProcedure
    .input(z.object({
      sequenceId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, state: null };
    }),
});
