import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";
import { suggest } from "@/server/services/matching-engine";

export const matchingRouter = createTRPCRouter({
  suggest: protectedProcedure
    .input(z.object({ missionId: z.string() }))
    .query(async ({ input }) => {
      return suggest(input.missionId);
    }),

  override: adminProcedure
    .input(z.object({ missionId: z.string(), talentProfileId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.mission.update({
        where: { id: input.missionId },
        data: { status: "ASSIGNED" },
      });
    }),

  getHistory: protectedProcedure
    .input(z.object({ missionId: z.string() }))
    .query(async () => { return []; }),

  getBestForBrief: protectedProcedure
    .input(z.object({ missionId: z.string(), count: z.number().default(3) }))
    .query(async ({ input }) => {
      return suggest(input.missionId);
    }),
});
