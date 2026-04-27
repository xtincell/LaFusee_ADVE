import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const cockpitRouter = createTRPCRouter({
  getDashboard: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUniqueOrThrow({
        where: { id: input.strategyId },
        include: {
          pillars: true,
          drivers: { where: { deletedAt: null } },
          campaigns: true,
          missions: { select: { id: true, status: true } },
          devotionSnapshots: { orderBy: { measuredAt: "desc" }, take: 1 },
          signals: { orderBy: { createdAt: "desc" }, take: 5 },
          gloryOutputs: { orderBy: { createdAt: "desc" }, take: 5 },
          brandAssets: { take: 10 },
        },
      });
      const vector = strategy.advertis_vector as Record<string, number> | null;
      const composite = vector
        ? ["a", "d", "v", "e", "r", "t", "i", "s"].reduce((sum, k) => sum + (vector[k] ?? 0), 0)
        : 0;
      const latestDevotion = strategy.devotionSnapshots[0] ?? null;
      return {
        strategy: { id: strategy.id, name: strategy.name, status: strategy.status },
        advertis: { vector, composite },
        devotion: latestDevotion
          ? {
              score: latestDevotion.devotionScore,
              breakdown: {
                spectateur: latestDevotion.spectateur,
                interesse: latestDevotion.interesse,
                participant: latestDevotion.participant,
                engage: latestDevotion.engage,
                ambassadeur: latestDevotion.ambassadeur,
                evangeliste: latestDevotion.evangeliste,
              },
            }
          : null,
        counts: {
          pillars: strategy.pillars.length,
          drivers: strategy.drivers.length,
          campaigns: strategy.campaigns.length,
          missions: strategy.missions.length,
          activeMissions: strategy.missions.filter((m) => m.status === "ACTIVE").length,
          brandAssets: strategy.brandAssets.length,
        },
        recentSignals: strategy.signals,
        recentGloryOutputs: strategy.gloryOutputs,
      };
    }),

  getCultIndex: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUniqueOrThrow({
        where: { id: input.strategyId },
        include: {
          pillars: true,
          devotionSnapshots: { orderBy: { measuredAt: "desc" }, take: 1 },
        },
      });
      const vector = strategy.advertis_vector as Record<string, number> | null;
      const composite = vector
        ? ["a", "d", "v", "e", "r", "t", "i", "s"].reduce((sum, k) => sum + (vector[k] ?? 0), 0)
        : 0;
      const devotion = strategy.devotionSnapshots[0]?.devotionScore ?? 0;
      const pillarAvg = strategy.pillars.length > 0
        ? strategy.pillars.reduce((sum, p) => sum + (p.confidence ?? 0), 0) / strategy.pillars.length
        : 0;
      const cultIndex = composite * 0.4 + devotion * 0.4 + pillarAvg * 100 * 0.2;
      let classification: string;
      if (cultIndex <= 40) classification = "ZOMBIE";
      else if (cultIndex <= 80) classification = "ORDINAIRE";
      else if (cultIndex <= 120) classification = "FORTE";
      else if (cultIndex <= 160) classification = "CULTE";
      else classification = "ICONE";
      return { strategyId: input.strategyId, cultIndex, classification, composite, devotion, pillarAvg };
    }),
});
