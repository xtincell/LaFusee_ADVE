import { db } from "@/lib/db";

type GuildTier = "APPRENTI" | "COMPAGNON" | "MAITRE" | "ASSOCIE";

// Commission rates by tier (% of mission gross amount)
const TIER_RATES: Record<GuildTier, number> = {
  APPRENTI: 0.60,
  COMPAGNON: 0.65,
  MAITRE: 0.70,
  ASSOCIE: 0.75,
};

interface CommissionResult {
  missionId: string;
  userId: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  tierAtTime: GuildTier;
  operatorFee: number;
}

export async function calculate(missionId: string): Promise<CommissionResult> {
  const mission = await db.mission.findUniqueOrThrow({
    where: { id: missionId },
    include: { deliverables: true },
  });

  // Find assigned creator (simplified: first deliverable's creator)
  // In full implementation, this comes from mission assignment
  const grossAmount = 100000; // XAF placeholder - should come from mission budget

  const talentProfile = await db.talentProfile.findFirst({
    where: { totalMissions: { gt: 0 } },
  });

  const tier = (talentProfile?.tier as GuildTier) ?? "APPRENTI";
  const rate = TIER_RATES[tier];
  const netAmount = grossAmount * rate;
  const commissionAmount = grossAmount - netAmount;

  // Operator fee (10% of commission for licensed operators)
  const operatorFee = commissionAmount * 0.10;

  return {
    missionId,
    userId: talentProfile?.userId ?? "",
    grossAmount,
    commissionRate: rate,
    commissionAmount,
    netAmount,
    tierAtTime: tier,
    operatorFee,
  };
}

export async function generatePaymentOrder(commissionId: string): Promise<Record<string, unknown>> {
  const commission = await db.commission.findUniqueOrThrow({
    where: { id: commissionId },
  });

  return {
    commissionId,
    amount: commission.netAmount,
    currency: commission.currency,
    status: "PENDING",
    method: "MOBILE_MONEY",
    generatedAt: new Date().toISOString(),
  };
}
