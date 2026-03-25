import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const guildOrgRouter = createTRPCRouter({
  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      type: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, id: "" };
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true };
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      // TODO: implement
      return { success: true, guilds: [] };
    }),

  getMembers: protectedProcedure
    .input(z.object({
      guildId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, members: [] };
    }),

  getMetrics: protectedProcedure
    .input(z.object({
      guildId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true, metrics: {} };
    }),

  addMember: adminProcedure
    .input(z.object({
      guildId: z.string(),
      userId: z.string(),
      role: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true };
    }),

  removeMember: adminProcedure
    .input(z.object({
      guildId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement
      return { success: true };
    }),
});
