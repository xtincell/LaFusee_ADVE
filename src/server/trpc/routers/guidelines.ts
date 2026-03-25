import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const guidelinesRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      type: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, guidelines: null };
    }),

  get: protectedProcedure
    .input(z.object({
      guidelinesId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, guidelines: null };
    }),

  export: protectedProcedure
    .input(z.object({
      guidelinesId: z.string(),
      format: z.enum(["PDF", "JSON", "MARKDOWN"]).default("PDF"),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, url: "" };
    }),

  shareLink: protectedProcedure
    .input(z.object({
      guidelinesId: z.string(),
      expiresIn: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, shareUrl: "" };
    }),
});
