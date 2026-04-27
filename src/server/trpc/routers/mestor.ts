import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../init";
import { chat, type MestorContext, type MestorMessage } from "@/server/services/mestor";

export const mestorRouter = createTRPCRouter({
  chat: publicProcedure
    .input(z.object({
      context: z.enum(["cockpit", "creator", "console", "intake"]),
      messages: z.array(z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })),
      strategyId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const response = await chat(
        input.context as MestorContext,
        input.messages as MestorMessage[],
        input.strategyId
      );
      return { response };
    }),
});
