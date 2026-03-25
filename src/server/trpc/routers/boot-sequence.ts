import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../init";
import * as bootService from "@/server/services/boot-sequence";

export const bootSequenceRouter = createTRPCRouter({
  start: adminProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ input }) => { return bootService.start(input.strategyId); }),

  advance: adminProcedure
    .input(z.object({ strategyId: z.string(), step: z.number(), responses: z.record(z.unknown()) }))
    .mutation(async ({ input }) => { return bootService.advance(input.strategyId, input.step, input.responses); }),

  complete: adminProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ input }) => { return bootService.complete(input.strategyId); }),

  getState: adminProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ input }) => { return bootService.start(input.strategyId); }),
});
