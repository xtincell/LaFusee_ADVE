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
      return ctx.db.deliverableTracking.create({
        data: {
          deliverableId: input.deliverableId,
          trackingType: input.trackingType,
          config: input.config ?? {},
          status: "ACTIVE",
        },
      });
    }),

  addSignal: protectedProcedure
    .input(z.object({
      trackingId: z.string(),
      signalType: z.string(),
      value: z.unknown(),
      timestamp: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.trackingSignal.create({
        data: {
          deliverableTrackingId: input.trackingId,
          signalType: input.signalType,
          value: input.value as any,
          timestamp: input.timestamp ? new Date(input.timestamp) : new Date(),
        },
      });
    }),

  getByDeliverable: protectedProcedure
    .input(z.object({ deliverableId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.deliverableTracking.findMany({
        where: { deliverableId: input.deliverableId },
        include: { signals: { orderBy: { timestamp: "desc" }, take: 50 } },
      });
    }),

  getImpact: protectedProcedure
    .input(z.object({ deliverableId: z.string() }))
    .query(async ({ ctx, input }) => {
      const trackings = await ctx.db.deliverableTracking.findMany({
        where: { deliverableId: input.deliverableId },
        include: { signals: true },
      });
      const totalSignals = trackings.reduce((sum, t) => sum + t.signals.length, 0);
      return {
        deliverableId: input.deliverableId,
        trackingCount: trackings.length,
        totalSignals,
        latestSignal: trackings[0]?.signals[0] ?? null,
      };
    }),

  expire: adminProcedure
    .input(z.object({ trackingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.deliverableTracking.update({
        where: { id: input.trackingId },
        data: { status: "EXPIRED" },
      });
    }),
});
