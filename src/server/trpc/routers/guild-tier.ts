import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const guildTierRouter = createTRPCRouter({
  getProfile: protectedProcedure
    .input(z.object({
      userId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, profile: null };
    }),

  checkPromotion: protectedProcedure
    .input(z.object({
      userId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, eligible: false, nextTier: null };
    }),

  promote: adminProcedure
    .input(z.object({
      userId: z.string(),
      targetTier: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true };
    }),

  demote: adminProcedure
    .input(z.object({
      userId: z.string(),
      targetTier: z.string(),
      reason: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true };
    }),

  listByTier: protectedProcedure
    .input(z.object({
      tier: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, members: [] };
    }),

  getProgressPath: protectedProcedure
    .input(z.object({
      userId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, path: [] };
    }),
});
