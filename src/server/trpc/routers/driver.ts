import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const driverRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      channel: z.string(),
      channelType: z.enum(["DIGITAL", "PHYSICAL", "EXPERIENTIAL", "MEDIA"]),
      name: z.string().min(1),
      formatSpecs: z.record(z.unknown()).default({}),
      constraints: z.record(z.unknown()).default({}),
      briefTemplate: z.record(z.unknown()).default({}),
      qcCriteria: z.record(z.unknown()).default({}),
      pillarPriority: z.record(z.unknown()).default({}),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.driver.create({ data: input });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      formatSpecs: z.record(z.unknown()).optional(),
      constraints: z.record(z.unknown()).optional(),
      briefTemplate: z.record(z.unknown()).optional(),
      qcCriteria: z.record(z.unknown()).optional(),
      pillarPriority: z.record(z.unknown()).optional(),
      status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.driver.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.driver.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });
    }),

  list: protectedProcedure
    .input(z.object({ strategyId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.driver.findMany({
        where: {
          ...(input.strategyId ? { strategyId: input.strategyId } : {}),
          deletedAt: null,
        },
        include: { gloryTools: true },
        orderBy: { createdAt: "desc" },
      });
    }),

  getByStrategy: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.driver.findMany({
        where: { strategyId: input.strategyId, deletedAt: null },
        include: { gloryTools: true },
      });
    }),

  activate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.driver.update({
        where: { id: input.id },
        data: { status: "ACTIVE" },
      });
    }),

  deactivate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.driver.update({
        where: { id: input.id },
        data: { status: "INACTIVE" },
      });
    }),

  generateSpecs: protectedProcedure
    .input(z.object({ strategyId: z.string(), channel: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Wire to driver-engine service for AI-generated specs
      const strategy = await ctx.db.strategy.findUniqueOrThrow({
        where: { id: input.strategyId },
        include: { pillars: true },
      });
      return {
        channel: input.channel,
        formatSpecs: {},
        constraints: {},
        briefTemplate: {},
        qcCriteria: {},
        pillarPriority: strategy.advertis_vector ?? {},
      };
    }),

  auditCoherence: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const drivers = await ctx.db.driver.findMany({
        where: { strategyId: input.strategyId, deletedAt: null },
      });
      // TODO: Wire to driver-engine for coherence audit
      return {
        strategyId: input.strategyId,
        driverCount: drivers.length,
        issues: [],
        coherenceScore: 1.0,
      };
    }),

  translateBrief: protectedProcedure
    .input(z.object({ driverId: z.string(), missionContext: z.record(z.unknown()) }))
    .mutation(async ({ ctx, input }) => {
      const driver = await ctx.db.driver.findUniqueOrThrow({
        where: { id: input.driverId },
        include: { strategy: { include: { pillars: true } } },
      });
      // TODO: Wire to driver-engine service
      return {
        driverId: input.driverId,
        brief: driver.briefTemplate,
        context: input.missionContext,
      };
    }),
});
