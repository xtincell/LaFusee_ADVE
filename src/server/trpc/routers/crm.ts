import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const crmRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      // CRM deals are tracked as QuickIntakes progressing through the funnel
      return ctx.db.quickIntake.findMany({
        where: input.status ? { status: input.status as "IN_PROGRESS" | "COMPLETED" | "CONVERTED" | "EXPIRED" } : {},
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  createDeal: protectedProcedure
    .input(z.object({
      contactName: z.string().min(1),
      contactEmail: z.string().email(),
      companyName: z.string().min(1),
      contactPhone: z.string().optional(),
      sector: z.string().optional(),
      country: z.string().optional(),
      source: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.quickIntake.create({
        data: {
          contactName: input.contactName,
          contactEmail: input.contactEmail,
          companyName: input.companyName,
          contactPhone: input.contactPhone ?? null,
          sector: input.sector ?? null,
          country: input.country ?? null,
          responses: {} as Prisma.InputJsonValue,
          source: input.source ?? "crm",
          status: "IN_PROGRESS",
        },
      });
    }),

  updateDeal: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(["IN_PROGRESS", "COMPLETED", "CONVERTED", "EXPIRED"]).optional(),
      classification: z.string().optional(),
      diagnostic: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, diagnostic, ...data } = input;
      return ctx.db.quickIntake.update({
        where: { id },
        data: {
          ...data,
          ...(diagnostic ? { diagnostic: diagnostic as Prisma.InputJsonValue } : {}),
          ...(data.status === "COMPLETED" ? { completedAt: new Date() } : {}),
        },
      });
    }),

  getByStatus: protectedProcedure
    .input(z.object({ status: z.enum(["IN_PROGRESS", "COMPLETED", "CONVERTED", "EXPIRED"]) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.quickIntake.findMany({
        where: { status: input.status },
        orderBy: { createdAt: "desc" },
      });
    }),

  forecast: adminProcedure.query(async ({ ctx }) => {
    const counts = await Promise.all([
      ctx.db.quickIntake.count({ where: { status: "IN_PROGRESS" } }),
      ctx.db.quickIntake.count({ where: { status: "COMPLETED" } }),
      ctx.db.quickIntake.count({ where: { status: "CONVERTED" } }),
      ctx.db.quickIntake.count({ where: { status: "EXPIRED" } }),
    ]);
    const [inProgress, completed, converted, expired] = counts;
    const total = inProgress + completed + converted + expired;
    const conversionRate = total > 0 ? converted / total : 0;
    return {
      pipeline: { inProgress, completed, converted, expired, total },
      conversionRate,
      projectedConversions: Math.round(inProgress * conversionRate),
    };
  }),
});
