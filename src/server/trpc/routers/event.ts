import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";

export const eventRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      strategyId: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.signal.findMany({
        where: {
          type: { in: ["EVENT", "SUMMIT", "CLUB_EVENT"] },
          ...(input.strategyId ? { strategyId: input.strategyId } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  create: adminProcedure
    .input(z.object({
      strategyId: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
      eventDate: z.string(),
      eventType: z.enum(["EVENT", "SUMMIT", "CLUB_EVENT"]).default("EVENT"),
      location: z.string().optional(),
      maxAttendees: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.signal.create({
        data: {
          strategyId: input.strategyId,
          type: input.eventType,
          data: {
            title: input.title,
            description: input.description ?? null,
            eventDate: input.eventDate,
            location: input.location ?? null,
            maxAttendees: input.maxAttendees ?? null,
            attendees: [],
            createdBy: ctx.session.user.id,
          } as Prisma.InputJsonValue,
        },
      });
    }),

  register: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.db.signal.findUniqueOrThrow({ where: { id: input.eventId } });
      const data = (event.data as Record<string, unknown>) ?? {};
      const attendees = (data.attendees as string[]) ?? [];
      if (!attendees.includes(ctx.session.user.id)) {
        attendees.push(ctx.session.user.id);
      }
      return ctx.db.signal.update({
        where: { id: input.eventId },
        data: { data: { ...data, attendees } as Prisma.InputJsonValue },
      });
    }),

  getAttendees: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.signal.findUniqueOrThrow({ where: { id: input.eventId } });
      const data = (event.data as Record<string, unknown>) ?? {};
      const attendeeIds = (data.attendees as string[]) ?? [];
      const users = await ctx.db.user.findMany({
        where: { id: { in: attendeeIds } },
        select: { id: true, name: true, email: true, image: true },
      });
      return { eventId: input.eventId, count: users.length, attendees: users };
    }),
});
