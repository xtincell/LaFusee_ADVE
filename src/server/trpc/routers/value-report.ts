import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const valueReportRouter = createTRPCRouter({
  generate: adminProcedure
    .input(z.object({
      strategyId: z.string(),
      period: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, reportId: "" };
    }),

  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, reports: [] };
    }),

  getByStrategy: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, reports: [] };
    }),

  export: protectedProcedure
    .input(z.object({
      reportId: z.string(),
      format: z.enum(["PDF", "CSV", "JSON"]).default("PDF"),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, url: "" };
    }),
});
