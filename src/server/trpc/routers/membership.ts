import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const membershipRouter = createTRPCRouter({
  create: adminProcedure
    .input(z.object({
      creatorId: z.string(),
      plan: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, id: "" };
    }),

  renew: adminProcedure
    .input(z.object({
      membershipId: z.string(),
      duration: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true };
    }),

  cancel: adminProcedure
    .input(z.object({
      membershipId: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true };
    }),

  list: protectedProcedure
    .input(z.object({
      status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, memberships: [] };
    }),

  getByCreator: protectedProcedure
    .input(z.object({
      creatorId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, membership: null };
    }),

  checkStatus: protectedProcedure
    .input(z.object({
      creatorId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, active: false, expiresAt: null };
    }),
});
