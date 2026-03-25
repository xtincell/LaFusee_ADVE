import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../init";

export const quickIntakeRouter = createTRPCRouter({
  start: publicProcedure
    .input(z.object({
      contactName: z.string().min(1),
      contactEmail: z.string().email(),
      contactPhone: z.string().optional(),
      companyName: z.string().min(1),
      sector: z.string().optional(),
      country: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, token: "" };
    }),

  advance: publicProcedure
    .input(z.object({
      token: z.string(),
      responses: z.record(z.unknown()),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true };
    }),

  complete: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true };
    }),

  getByToken: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, intake: null };
    }),

  convert: adminProcedure
    .input(z.object({
      intakeId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true };
    }),

  listAll: adminProcedure
    .query(async ({ ctx }) => {
      // TODO: implement
      return { success: true, intakes: [] };
    }),
});
