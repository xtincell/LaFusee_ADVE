import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const publicationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      gloryOutputId: z.string(),
      strategyId: z.string(),
      title: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Start publication cycle from a GloryOutput
      const gloryOutput = await ctx.db.gloryOutput.findUniqueOrThrow({
        where: { id: input.gloryOutputId },
      });
      return ctx.db.signal.create({
        data: {
          strategyId: input.strategyId,
          type: "PUBLICATION",
          data: {
            gloryOutputId: input.gloryOutputId,
            title: input.title,
            status: "DRAFT",
            createdBy: ctx.session.user.id,
            output: gloryOutput.output,
          } as Prisma.InputJsonValue,
        },
      });
    }),

  submit: protectedProcedure
    .input(z.object({ publicationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const pub = await ctx.db.signal.findUniqueOrThrow({ where: { id: input.publicationId } });
      const data = (pub.data as Record<string, unknown>) ?? {};
      return ctx.db.signal.update({
        where: { id: input.publicationId },
        data: {
          data: {
            ...data,
            status: "SUBMITTED",
            submittedAt: new Date().toISOString(),
            submittedBy: ctx.session.user.id,
          } as Prisma.InputJsonValue,
        },
      });
    }),

  approve: adminProcedure
    .input(z.object({
      publicationId: z.string(),
      feedback: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const pub = await ctx.db.signal.findUniqueOrThrow({ where: { id: input.publicationId } });
      const data = (pub.data as Record<string, unknown>) ?? {};
      return ctx.db.signal.update({
        where: { id: input.publicationId },
        data: {
          data: {
            ...data,
            status: "APPROVED",
            approvedAt: new Date().toISOString(),
            approvedBy: ctx.session.user.id,
            feedback: input.feedback ?? null,
          } as Prisma.InputJsonValue,
        },
      });
    }),

  publish: protectedProcedure
    .input(z.object({ publicationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const pub = await ctx.db.signal.findUniqueOrThrow({ where: { id: input.publicationId } });
      const data = (pub.data as Record<string, unknown>) ?? {};
      if (data.status !== "APPROVED") {
        throw new Error("Publication must be approved before publishing");
      }
      // Create brand asset from published content
      const asset = await ctx.db.brandAsset.create({
        data: {
          strategyId: pub.strategyId,
          name: (data.title as string) ?? "Published Asset",
          pillarTags: (data.pillarTags ?? []) as Prisma.InputJsonValue,
        },
      });
      // Update publication status
      await ctx.db.signal.update({
        where: { id: input.publicationId },
        data: {
          data: {
            ...data,
            status: "PUBLISHED",
            publishedAt: new Date().toISOString(),
            brandAssetId: asset.id,
          } as Prisma.InputJsonValue,
        },
      });
      return { publicationId: input.publicationId, brandAssetId: asset.id, status: "PUBLISHED" };
    }),
});
