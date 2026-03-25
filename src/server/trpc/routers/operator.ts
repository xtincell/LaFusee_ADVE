import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const operatorRouter = createTRPCRouter({
  getOwn: protectedProcedure
    .query(async ({ ctx }) => {
      // TODO: implement
      return { success: true };
    }),

  list: adminProcedure
    .query(async ({ ctx }) => {
      // TODO: implement
      return { success: true, operators: [] };
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true };
    }),

  getStats: adminProcedure
    .query(async ({ ctx }) => {
      // TODO: implement
      return { success: true, stats: {} };
    }),
});
