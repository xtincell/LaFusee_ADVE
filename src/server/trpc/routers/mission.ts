import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const missionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      strategyId: z.string(),
      campaignId: z.string().optional(),
      driverId: z.string().optional(),
      mode: z.enum(["DISPATCH", "COLLABORATIF"]).optional(),
      advertis_vector: z.record(z.number()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { advertis_vector, ...rest } = input;
      return ctx.db.mission.create({
        data: {
          ...rest,
          advertis_vector: advertis_vector as Prisma.InputJsonValue,
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      status: z.string().optional(),
      mode: z.enum(["DISPATCH", "COLLABORATIF"]).optional(),
      driverId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.mission.update({ where: { id }, data });
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.mission.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          deliverables: { include: { qualityReviews: true } },
          campaign: true,
          strategy: true,
          driver: true,
          commissions: true,
        },
      });
    }),

  list: protectedProcedure
    .input(z.object({
      strategyId: z.string().optional(),
      campaignId: z.string().optional(),
      status: z.string().optional(),
      driverId: z.string().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.mission.findMany({
        where: {
          ...(input.strategyId ? { strategyId: input.strategyId } : {}),
          ...(input.campaignId ? { campaignId: input.campaignId } : {}),
          ...(input.status ? { status: input.status } : {}),
          ...(input.driverId ? { driverId: input.driverId } : {}),
        },
        include: { deliverables: true, driver: true },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  submitDeliverable: protectedProcedure
    .input(z.object({
      missionId: z.string(),
      title: z.string(),
      fileUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.missionDeliverable.create({
        data: {
          missionId: input.missionId,
          title: input.title,
          fileUrl: input.fileUrl,
          status: "PENDING",
        },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.mission.update({
        where: { id: input.id },
        data: { status: "CANCELLED" },
      });
    }),

  // SLA: Set deadline
  setDeadline: protectedProcedure
    .input(z.object({ id: z.string(), deadline: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const mission = await ctx.db.mission.findUniqueOrThrow({ where: { id: input.id } });
      const existing = (mission.advertis_vector as Record<string, unknown>) ?? {};
      return ctx.db.mission.update({
        where: { id: input.id },
        data: {
          advertis_vector: {
            ...existing,
            deadline: input.deadline,
          } as Prisma.InputJsonValue,
        },
      });
    }),

  // SLA: Check deadlines
  checkSla: adminProcedure
    .query(async ({ ctx }) => {
      const now = new Date();
      const missions = await ctx.db.mission.findMany({
        where: { status: { in: ["DRAFT", "IN_PROGRESS"] } },
        include: { driver: true, strategy: { select: { name: true } } },
      });

      const alerts = [];
      for (const m of missions) {
        const meta = m.advertis_vector as Record<string, unknown> | null;
        const dl = meta?.deadline as string | undefined;
        if (!dl) continue;
        const deadline = new Date(dl);
        const hours = (deadline.getTime() - now.getTime()) / 3600000;
        if (hours < 48) {
          alerts.push({
            missionId: m.id,
            title: m.title,
            strategyName: m.strategy.name,
            driverChannel: m.driver?.channel,
            deadline: dl,
            hoursRemaining: Math.round(hours * 10) / 10,
            severity: hours < 0 ? "breached" : hours < 24 ? "urgent" : "warning",
          });
        }
      }
      return alerts.sort((a, b) => a.hoursRemaining - b.hoursRemaining);
    }),
});
