import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const deliverableTrackingRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      deliverableId: z.string(),
      trackingType: z.string(),
      config: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, id: "" };
    }),

  addSignal: protectedProcedure
    .input(z.object({
      trackingId: z.string(),
      signalType: z.string(),
      value: z.unknown(),
      timestamp: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true };
    }),

  getByDeliverable: protectedProcedure
    .input(z.object({
      deliverableId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, tracking: [] };
    }),

  getImpact: protectedProcedure
    .input(z.object({
      deliverableId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, impact: null };
    }),

  expire: adminProcedure
    .input(z.object({
      trackingId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true };
    }),
});
