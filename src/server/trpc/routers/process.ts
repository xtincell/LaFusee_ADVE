import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";
import { startProcess, pauseProcess, stopProcess, getContention } from "@/server/services/process-scheduler";

export const processRouter = createTRPCRouter({
  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      type: z.string(),
      strategyId: z.string(),
      config: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.process.create({ data: input });
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      config: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.process.update({ where: { id }, data });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.process.update({ where: { id: input.id }, data: { deletedAt: new Date() } });
    }),

  list: protectedProcedure
    .input(z.object({
      strategyId: z.string().optional(),
      status: z.enum(["RUNNING", "PAUSED", "STOPPED", "DRAFT"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.process.findMany({
        where: {
          deletedAt: null,
          ...(input.strategyId ? { strategyId: input.strategyId } : {}),
          ...(input.status ? { status: input.status } : {}),
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  start: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await startProcess(input.id);
      return { success: true };
    }),

  pause: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await pauseProcess(input.id);
      return { success: true };
    }),

  stop: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await stopProcess(input.id);
      return { success: true };
    }),

  getSchedule: protectedProcedure
    .input(z.object({ processId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.process.findUniqueOrThrow({
        where: { id: input.processId },
        select: { id: true, name: true, status: true, lastRunAt: true, config: true },
      });
    }),

  getContention: adminProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ input }) => {
      return getContention(input.strategyId);
    }),
});
