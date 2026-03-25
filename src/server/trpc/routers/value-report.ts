import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";
import * as valueReportService from "@/server/services/value-report-generator";

export const valueReportRouter = createTRPCRouter({
  generate: adminProcedure
    .input(z.object({ strategyId: z.string(), period: z.string() }))
    .mutation(async ({ input }) => {
      return valueReportService.generate(input.strategyId, input.period);
    }),

  list: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async () => { return []; }),

  getByStrategy: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ input }) => {
      return valueReportService.generate(input.strategyId, new Date().toISOString().slice(0, 7));
    }),

  export: protectedProcedure
    .input(z.object({ strategyId: z.string(), period: z.string(), format: z.enum(["html", "pdf"]).default("html") }))
    .query(async ({ input }) => {
      return valueReportService.exportHtml(input.strategyId, input.period);
    }),
});
