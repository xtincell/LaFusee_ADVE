import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface MobileMoneyPayload {
  provider: "orange_money" | "mtn_mobile_money" | "wave";
  transactionId: string;
  amount: number;
  currency: string;
  phoneNumber: string;
  status: "success" | "failed" | "pending";
  reference: string; // Our internal reference (commissionId or membershipId)
  metadata?: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as MobileMoneyPayload;

    // Validate webhook signature (TODO: implement per-provider signature verification)
    const signature = request.headers.get("x-webhook-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    if (payload.status !== "success") {
      // Log failed/pending payments
      console.log(`Payment ${payload.status}: ${payload.transactionId}`);
      return NextResponse.json({ received: true, status: payload.status });
    }

    const reference = payload.reference;

    // Try to match to a commission
    if (reference.startsWith("commission-")) {
      const commissionId = reference.replace("commission-", "");
      await db.commission.update({
        where: { id: commissionId },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      // Capture knowledge event
      await db.knowledgeEntry.create({
        data: {
          entryType: "MISSION_OUTCOME",
          data: {
            type: "commission_paid",
            commissionId,
            provider: payload.provider,
            transactionId: payload.transactionId,
            amount: payload.amount,
            currency: payload.currency,
          },
          sourceHash: `payment-${payload.transactionId}`,
        },
      });

      return NextResponse.json({ received: true, type: "commission", id: commissionId });
    }

    // Try to match to a membership
    if (reference.startsWith("membership-")) {
      const membershipId = reference.replace("membership-", "");
      const membership = await db.membership.findUniqueOrThrow({ where: { id: membershipId } });

      // Extend membership period by 30 days
      const newEnd = new Date(membership.currentPeriodEnd);
      newEnd.setDate(newEnd.getDate() + 30);

      await db.membership.update({
        where: { id: membershipId },
        data: {
          status: "ACTIVE",
          currentPeriodEnd: newEnd,
        },
      });

      return NextResponse.json({ received: true, type: "membership", id: membershipId });
    }

    return NextResponse.json({ received: true, type: "unknown_reference" });
  } catch (error) {
    console.error("Mobile money webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    providers: ["orange_money", "mtn_mobile_money", "wave"],
    endpoint: "/api/webhooks/mobile-money",
  });
}
