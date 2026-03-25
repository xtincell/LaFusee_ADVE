import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

interface SocialWebhookPayload {
  platform: string;
  event: "post_published" | "metrics_update" | "comment" | "mention";
  accountId: string;
  data: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SocialWebhookPayload;

    // Find the strategy linked to this social account via Driver
    const drivers = await db.driver.findMany({
      where: { deletedAt: null },
    });

    let matchedDriver = null;
    let matchedStrategyId: string | null = null;

    for (const driver of drivers) {
      const constraints = driver.constraints as Record<string, unknown> | null;
      const connection = constraints?.socialConnection as Record<string, unknown> | null;
      if (connection?.accountId === payload.accountId) {
        matchedDriver = driver;
        matchedStrategyId = driver.strategyId;
        break;
      }
    }

    if (!matchedStrategyId) {
      return NextResponse.json({ received: true, matched: false });
    }

    // Create Signal from webhook
    if (payload.event === "metrics_update") {
      await db.signal.create({
        data: {
          strategyId: matchedStrategyId,
          type: "SOCIAL_METRICS",
          data: {
            platform: payload.platform,
            driverId: matchedDriver?.id,
            event: payload.event,
            ...payload.data,
            receivedAt: new Date().toISOString(),
          } as Prisma.InputJsonValue,
        },
      });
    }

    return NextResponse.json({ received: true, matched: true, strategyId: matchedStrategyId });
  } catch (error) {
    console.error("Social webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    events: ["post_published", "metrics_update", "comment", "mention"],
    endpoint: "/api/webhooks/social",
  });
}
