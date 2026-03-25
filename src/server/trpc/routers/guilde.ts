import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const guildeRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      tier: z.enum(["APPRENTI", "COMPAGNON", "MAITRE", "ASSOCIE"]).optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.talentProfile.findMany({
        where: input.tier ? { tier: input.tier } : undefined,
        orderBy: { totalMissions: "desc" },
        take: input.limit,
      });
    }),

  getProfile: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.talentProfile.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          portfolioItems: true,
          memberships: { where: { status: "ACTIVE" } },
          guildOrganization: true,
        },
      });
    }),

  getMyProfile: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.talentProfile.findUnique({
        where: { userId: ctx.session.user.id },
        include: {
          portfolioItems: true,
          memberships: { where: { status: "ACTIVE" } },
          guildOrganization: true,
        },
      });
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      displayName: z.string().optional(),
      bio: z.string().optional(),
      skills: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.talentProfile.update({
        where: { userId: ctx.session.user.id },
        data: {
          ...(input.displayName ? { displayName: input.displayName } : {}),
          ...(input.bio ? { bio: input.bio } : {}),
          ...(input.skills ? { skills: input.skills } : {}),
        },
      });
    }),

  getStats: adminProcedure
    .query(async ({ ctx }) => {
      const [total, byTier] = await Promise.all([
        ctx.db.talentProfile.count(),
        ctx.db.talentProfile.groupBy({
          by: ["tier"],
          _count: true,
        }),
      ]);
      return { total, byTier };
    }),
});
