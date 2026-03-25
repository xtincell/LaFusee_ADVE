import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const boutiqueRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      sector: z.string().optional(),
      channel: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      // Playbooks/templates are stored as KnowledgeEntry of type CAMPAIGN_TEMPLATE
      return ctx.db.knowledgeEntry.findMany({
        where: {
          entryType: "CAMPAIGN_TEMPLATE",
          ...(input.sector ? { sector: input.sector } : {}),
          ...(input.channel ? { channel: input.channel } : {}),
        },
        orderBy: { successScore: "desc" },
        take: input.limit,
      });
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.knowledgeEntry.findUniqueOrThrow({
        where: { id: input.id },
      });
    }),

  purchase: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      strategyId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Clone a template into the strategy as a brand asset
      const template = await ctx.db.knowledgeEntry.findUniqueOrThrow({
        where: { id: input.templateId },
      });
      const templateData = template.data as Record<string, unknown>;
      const asset = await ctx.db.brandAsset.create({
        data: {
          strategyId: input.strategyId,
          name: (templateData.name as string) ?? `Template ${template.id}`,
          pillarTags: (templateData.pillarTags ?? []) as Prisma.InputJsonValue,
        },
      });
      // Record signal for tracking
      await ctx.db.signal.create({
        data: {
          strategyId: input.strategyId,
          type: "BOUTIQUE_PURCHASE",
          data: {
            templateId: input.templateId,
            assetId: asset.id,
            userId: ctx.session.user.id,
          } as Prisma.InputJsonValue,
        },
      });
      return asset;
    }),
});
