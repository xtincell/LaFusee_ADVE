import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../init";
import * as bootService from "@/server/services/boot-sequence";
import { getQuestionPack } from "@/server/services/boot-sequence/question-packs";
import { PILLAR_KEYS, type PillarKey } from "@/lib/types/advertis-vector";

const pillarKey = z.enum(PILLAR_KEYS as unknown as [PillarKey, ...PillarKey[]]);

export const bootSequenceRouter = createTRPCRouter({
  start: adminProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ input }) => {
      return bootService.start(input.strategyId);
    }),

  getState: adminProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ input }) => {
      return bootService.getState(input.strategyId);
    }),

  getQuestionPack: adminProcedure
    .input(z.object({ pillar: pillarKey }))
    .query(({ input }) => {
      return { pillar: input.pillar, questions: getQuestionPack(input.pillar) };
    }),

  advance: adminProcedure
    .input(z.object({
      strategyId: z.string(),
      pillar: pillarKey,
      patch: z.record(z.unknown()),
      confidence: z.number().min(0).max(1).optional(),
    }))
    .mutation(async ({ input }) => {
      return bootService.advance(input.strategyId, input.pillar, input.patch, input.confidence);
    }),

  skip: adminProcedure
    .input(z.object({ strategyId: z.string(), pillar: pillarKey }))
    .mutation(async ({ input }) => {
      return bootService.skipPillar(input.strategyId, input.pillar);
    }),

  complete: adminProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ input }) => {
      return bootService.complete(input.strategyId);
    }),
});
