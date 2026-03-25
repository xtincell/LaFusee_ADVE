import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const membershipRouter = createTRPCRouter({
  create: adminProcedure
    .input(z.object({
      talentProfileId: z.string(),
      guildOrganizationId: z.string(),
      role: z.string().default("MEMBER"),
      startDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.membership.create({
        data: {
          talentProfileId: input.talentProfileId,
          guildOrganizationId: input.guildOrganizationId,
          role: input.role,
          startDate: input.startDate ? new Date(input.startDate) : new Date(),
          status: "ACTIVE",
        },
      });
    }),

  renew: adminProcedure
    .input(z.object({
      membershipId: z.string(),
      duration: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.db.membership.findUniqueOrThrow({ where: { id: input.membershipId } });
      const durationMs = (input.duration ?? 365) * 24 * 60 * 60 * 1000;
      return ctx.db.membership.update({
        where: { id: input.membershipId },
        data: {
          status: "ACTIVE",
          endDate: new Date(Date.now() + durationMs),
        },
      });
    }),

  cancel: adminProcedure
    .input(z.object({
      membershipId: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.membership.update({
        where: { id: input.membershipId },
        data: { status: "CANCELLED", endDate: new Date() },
      });
    }),

  list: protectedProcedure
    .input(z.object({
      status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.membership.findMany({
        where: input.status ? { status: input.status } : {},
        include: { talentProfile: true, guildOrganization: true },
        orderBy: { createdAt: "desc" },
      });
    }),

  getByCreator: protectedProcedure
    .input(z.object({ talentProfileId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.membership.findMany({
        where: { talentProfileId: input.talentProfileId },
        include: { guildOrganization: true },
      });
    }),

  checkStatus: protectedProcedure
    .input(z.object({ talentProfileId: z.string() }))
    .query(async ({ ctx, input }) => {
      const active = await ctx.db.membership.findFirst({
        where: { talentProfileId: input.talentProfileId, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      });
      return {
        active: !!active,
        membershipId: active?.id ?? null,
        expiresAt: active?.endDate?.toISOString() ?? null,
      };
    }),
});
