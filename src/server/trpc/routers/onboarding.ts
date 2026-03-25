import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../init";

export const onboardingRouter = createTRPCRouter({
  getStatus: protectedProcedure
    .input(z.object({ strategyId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      // Check Quick Intake status for current user
      const intakes = await ctx.db.quickIntake.findMany({
        where: { contactEmail: ctx.session.user.email ?? "" },
        orderBy: { createdAt: "desc" },
        take: 1,
      });
      const latestIntake = intakes[0] ?? null;

      // Check Boot Sequence progress via processes
      const bootProcesses = input.strategyId
        ? await ctx.db.process.findMany({
            where: { strategyId: input.strategyId, name: { contains: "boot", mode: "insensitive" } },
            orderBy: { createdAt: "desc" },
            take: 1,
          })
        : [];
      const bootProcess = bootProcesses[0] ?? null;

      let step: string;
      if (!latestIntake) step = "NOT_STARTED";
      else if (latestIntake.status === "IN_PROGRESS") step = "INTAKE_IN_PROGRESS";
      else if (latestIntake.status === "COMPLETED" && !bootProcess) step = "INTAKE_COMPLETE";
      else if (bootProcess?.status === "RUNNING") step = "BOOT_RUNNING";
      else if (bootProcess?.status === "COMPLETED") step = "ONBOARDED";
      else step = "INTAKE_COMPLETE";

      return {
        step,
        intake: latestIntake
          ? { id: latestIntake.id, status: latestIntake.status, classification: latestIntake.classification }
          : null,
        bootSequence: bootProcess
          ? { id: bootProcess.id, status: bootProcess.status, runCount: bootProcess.runCount }
          : null,
      };
    }),

  start: protectedProcedure
    .input(z.object({
      contactName: z.string().min(1),
      companyName: z.string().min(1),
      contactPhone: z.string().optional(),
      sector: z.string().optional(),
      country: z.string().optional(),
      source: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Create a Quick Intake for the user
      const intake = await ctx.db.quickIntake.create({
        data: {
          contactName: input.contactName,
          contactEmail: ctx.session.user.email ?? "",
          contactPhone: input.contactPhone ?? null,
          companyName: input.companyName,
          sector: input.sector ?? null,
          country: input.country ?? null,
          responses: {} as Prisma.InputJsonValue,
          source: input.source ?? "onboarding",
          status: "IN_PROGRESS",
        },
      });
      return { intakeId: intake.id, shareToken: intake.shareToken, status: intake.status };
    }),
});
