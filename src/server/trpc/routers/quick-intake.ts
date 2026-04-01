// ============================================================================
// MODULE M35 — Quick Intake Portal (Router)
// Score: 92/100 | Priority: P0 | Status: FUNCTIONAL
// Spec: §5.2 | Division: L'Oracle
// ============================================================================
//
// CdC REQUIREMENTS (V1):
// [x] REQ-1  start — public mutation, creates intake + returns first questions (biz context)
// [x] REQ-2  advance — saves responses + returns next adaptive questions (AI-powered)
// [x] REQ-3  complete — scores 8 pillars, classifies brand, creates CRM Deal
// [x] REQ-4  getByToken — retrieve intake state (public, no auth)
// [x] REQ-5  getQuestions — get adaptive questions for current phase (server-driven)
// [x] REQ-6  convert — admin converts completed intake into full Strategy
// [x] REQ-7  listAll — admin lists all intakes with pagination + status filter
// [ ] REQ-8  Notification to fixer (Alexandre) on intake completion
// [ ] REQ-9  Expiration policy (auto-expire after 7 days if not completed)
//
// PROCEDURES: start, advance, complete, getByToken, getQuestions, convert, listAll
// ============================================================================

import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../init";
import * as quickIntakeService from "@/server/services/quick-intake";
import { getAdaptiveQuestions, getBusinessContextQuestions } from "@/server/services/quick-intake/question-bank";

export const quickIntakeRouter = createTRPCRouter({
  start: publicProcedure
    .input(z.object({
      contactName: z.string().min(1),
      contactEmail: z.string().email(),
      contactPhone: z.string().optional(),
      companyName: z.string().min(1),
      sector: z.string().optional(),
      country: z.string().optional(),
      businessModel: z.string().optional(),
      economicModel: z.string().optional(),
      positioning: z.string().optional(),
      source: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return quickIntakeService.start(input);
    }),

  advance: publicProcedure
    .input(z.object({
      token: z.string(),
      responses: z.record(z.unknown()),
    }))
    .mutation(async ({ input }) => {
      return quickIntakeService.advance(input);
    }),

  complete: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      return quickIntakeService.complete(input.token);
    }),

  getByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.quickIntake.findUnique({
        where: { shareToken: input.token },
      });
    }),

  /**
   * Server-driven question fetcher. Returns adaptive questions for the current
   * phase of the intake (biz context or a specific ADVE pillar).
   * This enables the AI-guided questionnaire experience per CdC §5.2.
   */
  getQuestions: publicProcedure
    .input(z.object({
      token: z.string(),
      pillar: z.string().optional(), // Override: fetch questions for specific pillar
    }))
    .query(async ({ ctx, input }) => {
      const intake = await ctx.db.quickIntake.findUnique({
        where: { shareToken: input.token },
      });
      if (!intake) throw new Error("Intake not found");

      const responses = (intake.responses as Record<string, unknown>) ?? {};
      const allSteps = ["biz", "a", "d", "v", "e", "r", "t", "i", "s"];

      // Determine which pillar to fetch questions for
      let targetPillar: string | undefined = input.pillar ?? undefined;
      if (!targetPillar) {
        // Auto-detect: find first unanswered step
        const answeredSteps = new Set(Object.keys(responses));
        targetPillar = allSteps.find((p) => !answeredSteps.has(p));
      }

      if (!targetPillar) {
        return { questions: [], currentPillar: null as string | null, readyToComplete: true, progress: 1 };
      }

      const questions = targetPillar === "biz"
        ? getBusinessContextQuestions()
        : await getAdaptiveQuestions(targetPillar, responses, {
            sector: intake.sector ?? undefined,
            positioning: intake.positioning ?? undefined,
          });

      const answeredCount = Object.keys(responses).length;
      const progress = answeredCount / allSteps.length;

      return {
        questions,
        currentPillar: targetPillar,
        readyToComplete: false,
        progress,
      };
    }),

  convert: adminProcedure
    .input(z.object({ intakeId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const intake = await ctx.db.quickIntake.findUniqueOrThrow({
        where: { id: input.intakeId },
      });
      if (intake.status !== "COMPLETED") {
        throw new Error("Intake must be completed before conversion");
      }

      // Retrieve businessContext from the temporary strategy if it exists
      let businessContext = undefined;
      if (intake.convertedToId) {
        const tempStrategy = await ctx.db.strategy.findUnique({
          where: { id: intake.convertedToId },
          select: { businessContext: true },
        });
        businessContext = tempStrategy?.businessContext ?? undefined;
      }

      // Create Strategy (Brand Instance) from intake data
      const strategy = await ctx.db.strategy.create({
        data: {
          name: intake.companyName,
          description: `Converti depuis Quick Intake le ${new Date().toLocaleDateString("fr-FR")}`,
          userId: input.userId,
          operatorId: (await ctx.db.user.findUniqueOrThrow({ where: { id: input.userId } })).operatorId,
          status: "ACTIVE",
          advertis_vector: intake.advertis_vector ?? undefined,
          businessContext: businessContext ?? undefined,
        },
      });

      // Create pillars from intake responses if available
      if (intake.advertis_vector) {
        const vector = intake.advertis_vector as Record<string, number>;

        // Get content from temporary strategy pillars or from responses
        const tempStrategyId = intake.convertedToId;
        let pillarContents: Record<string, unknown> = {};

        if (tempStrategyId) {
          const tempPillars = await ctx.db.pillar.findMany({
            where: { strategyId: tempStrategyId },
          });
          for (const p of tempPillars) {
            pillarContents[p.key] = p.content;
          }
        }

        // Fall back to responses if no temp pillars
        const responses = intake.responses as Record<string, unknown> | null;

        for (const key of ["a", "d", "v", "e", "r", "t", "i", "s"]) {
          const content = pillarContents[key] ?? responses?.[key] ?? {};
          await ctx.db.pillar.create({
            data: {
              strategyId: strategy.id,
              key,
              content: content as Prisma.InputJsonValue,
              confidence: (vector.confidence ?? 0.4) * 0.8, // Lower confidence from Quick Intake
            },
          });
        }
      }

      // Update intake with conversion reference
      await ctx.db.quickIntake.update({
        where: { id: input.intakeId },
        data: {
          status: "CONVERTED",
          convertedToId: strategy.id,
        },
      });

      // Capture knowledge event
      await ctx.db.knowledgeEntry.create({
        data: {
          entryType: "MISSION_OUTCOME",
          sector: intake.sector,
          market: intake.country,
          data: {
            type: "quick_intake_conversion",
            intakeId: intake.id,
            strategyId: strategy.id,
            classification: intake.classification,
          } as Prisma.InputJsonValue,
          sourceHash: `intake-${intake.id}`,
        },
      });

      return strategy;
    }),

  /**
   * Social proof: count of completed intakes (public, cached).
   * Displayed on result page to build trust.
   */
  getCompletedCount: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.db.quickIntake.count({
        where: { status: { in: ["COMPLETED", "CONVERTED"] } },
      });
    }),

  listAll: adminProcedure
    .input(z.object({
      status: z.enum(["IN_PROGRESS", "COMPLETED", "CONVERTED", "EXPIRED"]).optional(),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.quickIntake.findMany({
        where: input.status ? { status: input.status } : undefined,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor };
    }),
});
