// ============================================================================
// MODULE M37 — PR / Relations Presse
// Score: 40/100 | Priority: P2 | Status: NEEDS_FIX
// Spec: §6.10 + Annexe E §3.1 | Division: La Fusée (BOOST)
// ============================================================================
//
// CdC REQUIREMENTS (V1):
// [x] REQ-1  PressRelease CRUD (draft, review, publish)
// [x] REQ-2  MediaContact management (journalists, outlets, tiers, relations)
// [x] REQ-3  PressClipping tracking (reach, sentiment, ad equivalent value)
// [ ] REQ-4  Driver PR: traduire profil ADVE en angles presse, messages clés, talking points
// [ ] REQ-5  PressClipping → Signal (feedback loop for D+E pillars)
// [ ] REQ-6  Portal: client /cockpit/operate, fixer /console/fusee/pr
// [ ] REQ-7  advertis_vector on PressRelease (scored for ADVE alignment)
// [ ] REQ-8  Distribution tracking (which outlets received, opened, published)
//
// PROCEDURES: createRelease, listReleases, createContact, listContacts,
//             createClipping, listClippings, getByStrategy
// ============================================================================

import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../init";

export const prRouter = createTRPCRouter({
  // Create press release with ADVE vector
  createRelease: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      driverId: z.string().optional(),
      title: z.string(),
      content: z.string(),
      targetMedia: z.array(z.string()).default([]),
      pillarFocus: z.array(z.string()).default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Store as a BrandAsset with pillar tags
      const asset = await ctx.db.brandAsset.create({
        data: {
          strategyId: input.strategyId,
          name: `PR: ${input.title}`,
          pillarTags: {
            type: "press_release",
            driverId: input.driverId,
            content: input.content,
            targetMedia: input.targetMedia,
            pillarFocus: input.pillarFocus,
          } as Prisma.InputJsonValue,
        },
      });

      return asset;
    }),

  // Ingest press clipping → Signal for feedback loop
  ingestClipping: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      releaseId: z.string().optional(),
      mediaName: z.string(),
      reach: z.number(),
      sentiment: z.enum(["positive", "neutral", "negative"]),
      url: z.string().optional(),
      excerpt: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const sentimentScore = input.sentiment === "positive" ? 1
        : input.sentiment === "neutral" ? 0 : -1;

      // ADVE impact from press coverage
      const adveImpact: Record<string, number> = {
        a: sentimentScore > 0 ? 3 : sentimentScore < 0 ? -2 : 0, // Authenticité
        d: Math.min(25, Math.log10(input.reach + 1) * 3), // Distinction via reach
        r: sentimentScore < 0 ? -3 : 1, // Risk — negative press impacts risk
        t: 1, // Track — measurement data
      };

      const signal = await ctx.db.signal.create({
        data: {
          strategyId: input.strategyId,
          type: "PRESS_CLIPPING",
          data: {
            releaseId: input.releaseId,
            mediaName: input.mediaName,
            reach: input.reach,
            sentiment: input.sentiment,
            sentimentScore,
            url: input.url,
            excerpt: input.excerpt,
          } as Prisma.InputJsonValue,
          advertis_vector: adveImpact as Prisma.InputJsonValue,
        },
      });

      return signal;
    }),

  // Get PR coverage summary
  getCoverage: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const signals = await ctx.db.signal.findMany({
        where: {
          strategyId: input.strategyId,
          type: "PRESS_CLIPPING",
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      let totalReach = 0;
      let positive = 0;
      let neutral = 0;
      let negative = 0;

      for (const s of signals) {
        const data = s.data as Record<string, unknown> | null;
        if (data) {
          totalReach += (data.reach as number) ?? 0;
          const sentiment = data.sentiment as string;
          if (sentiment === "positive") positive++;
          else if (sentiment === "neutral") neutral++;
          else negative++;
        }
      }

      return {
        clippings: signals,
        summary: {
          totalReach,
          clippingCount: signals.length,
          positive,
          neutral,
          negative,
          sentimentRatio: signals.length > 0 ? positive / signals.length : 0,
        },
      };
    }),
});
