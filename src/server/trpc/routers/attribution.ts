import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const attributionRouter = createTRPCRouter({
  getByStrategy: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Attribution analysis: map signals to drivers and their impact
      const signals = await ctx.db.signal.findMany({
        where: { strategyId: input.strategyId },
        orderBy: { createdAt: "desc" },
      });
      const drivers = await ctx.db.driver.findMany({
        where: { strategyId: input.strategyId, deletedAt: null },
      });
      const trackings = await ctx.db.deliverableTracking.findMany({
        where: {
          deliverable: { mission: { strategyId: input.strategyId } },
          status: "COMPLETE",
        },
        include: { deliverable: { select: { id: true, missionId: true } } },
      });
      return {
        strategyId: input.strategyId,
        signalCount: signals.length,
        driverCount: drivers.length,
        completedTrackings: trackings.length,
        driverAttribution: drivers.map((d) => ({
          driverId: d.id,
          channel: d.channel,
          name: d.name,
          signalCount: signals.filter((s) => {
            const data = s.data as Record<string, unknown> | null;
            return data?.driverId === d.id;
          }).length,
        })),
      };
    }),

  multiTouch: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      window: z.number().min(1).max(90).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setDate(since.getDate() - input.window);
      const signals = await ctx.db.signal.findMany({
        where: { strategyId: input.strategyId, createdAt: { gte: since } },
        orderBy: { createdAt: "asc" },
      });
      // Group signals by type for multi-touch analysis
      const touchpoints = signals.reduce<Record<string, number>>((acc, s) => {
        acc[s.type] = (acc[s.type] ?? 0) + 1;
        return acc;
      }, {});
      const total = signals.length;
      return {
        strategyId: input.strategyId,
        windowDays: input.window,
        totalTouchpoints: total,
        byType: Object.entries(touchpoints).map(([type, count]) => ({
          type,
          count,
          weight: total > 0 ? count / total : 0,
        })),
      };
    }),

  feedKnowledgeGraph: adminProcedure
    .input(z.object({
      strategyId: z.string(),
      attributionData: z.record(z.unknown()),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.knowledgeEntry.create({
        data: {
          entryType: "MISSION_OUTCOME",
          data: {
            type: "attribution",
            strategyId: input.strategyId,
            ...input.attributionData,
          } as Prisma.InputJsonValue,
        },
      });
    }),
});
