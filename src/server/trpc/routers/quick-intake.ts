import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../init";
import * as quickIntakeService from "@/server/services/quick-intake";
import { planSequence } from "@/server/services/artemis-sequencer";
import { captureEvent } from "@/server/services/knowledge-capture";

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
        for (const key of ["a", "d", "v", "e", "r", "t", "i", "s"]) {
          await ctx.db.pillar.create({
            data: {
              strategyId: strategy.id,
              key,
              content: {} as any,
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

      // Genere le plan ARTEMIS initial pour la nouvelle strategy et capture l'event
      try {
        const initialPlan = await planSequence(strategy.id);
        await captureEvent("DIAGNOSTIC_RESULT", {
          businessModel: intake.businessModel ?? undefined,
          sector: intake.sector ?? undefined,
          data: {
            type: "artemis_plan_generated",
            strategyId: strategy.id,
            recommendedNext: initialPlan.recommendedNextPillar,
            validatedCount: initialPlan.validatedCount,
            startedCount: initialPlan.startedCount,
            pendingCount: initialPlan.pendingCount,
          },
          sourceId: `${strategy.id}-artemis-init`,
        });
      } catch {
        // Le plan reste calculable a la demande — ne bloque pas la conversion
      }

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
          } as any,
          sourceHash: `intake-${intake.id}`,
        },
      });

      return strategy;
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
