import { db } from "@/lib/db";

type GuildTier = "APPRENTI" | "COMPAGNON" | "MAITRE" | "ASSOCIE";
type ReviewType = "AUTOMATED" | "PEER" | "FIXER" | "CLIENT";

interface RouteResult {
  reviewerId: string | null;
  reviewType: ReviewType;
  reason: string;
}

const TIER_ORDER: Record<GuildTier, number> = {
  APPRENTI: 0,
  COMPAGNON: 1,
  MAITRE: 2,
  ASSOCIE: 3,
};

/**
 * Determines who should review a deliverable based on submitter tier and mission criticality.
 */
export async function routeReview(
  deliverableId: string,
  submitterUserId: string
): Promise<RouteResult> {
  const deliverable = await db.missionDeliverable.findUniqueOrThrow({
    where: { id: deliverableId },
    include: { mission: true },
  });

  const submitterProfile = await db.talentProfile.findUnique({
    where: { userId: submitterUserId },
  });

  const submitterTier: GuildTier = (submitterProfile?.tier as GuildTier) ?? "APPRENTI";
  const minReviewerTier = getMinReviewerTier(submitterTier);

  // Find available reviewer with sufficient tier
  const reviewer = await findReviewer(minReviewerTier, submitterUserId);

  if (!reviewer) {
    return {
      reviewerId: null,
      reviewType: "FIXER",
      reason: `No ${minReviewerTier}+ reviewer available. Escalating to fixer.`,
    };
  }

  return {
    reviewerId: reviewer.userId,
    reviewType: "PEER",
    reason: `Assigned to ${minReviewerTier}+ reviewer based on submitter tier ${submitterTier}.`,
  };
}

function getMinReviewerTier(submitterTier: GuildTier): GuildTier {
  switch (submitterTier) {
    case "APPRENTI": return "COMPAGNON";
    case "COMPAGNON": return "MAITRE";
    case "MAITRE": return "ASSOCIE";
    case "ASSOCIE": return "ASSOCIE";
  }
}

async function findReviewer(
  minTier: GuildTier,
  excludeUserId: string
): Promise<{ userId: string } | null> {
  const minOrder = TIER_ORDER[minTier];
  const eligibleTiers = Object.entries(TIER_ORDER)
    .filter(([, order]) => order >= minOrder)
    .map(([tier]) => tier);

  const reviewer = await db.talentProfile.findFirst({
    where: {
      tier: { in: eligibleTiers as GuildTier[] },
      userId: { not: excludeUserId },
    },
    orderBy: { peerReviews: "asc" }, // Load balance: least reviews first
    select: { userId: true },
  });

  return reviewer;
}

/**
 * Assigns a specific reviewer to a deliverable, creating the QualityReview record.
 */
export async function assignReviewer(
  deliverableId: string,
  reviewerId: string,
  reviewType: ReviewType
): Promise<void> {
  await db.qualityReview.create({
    data: {
      deliverableId,
      reviewerId,
      reviewType,
      verdict: "ACCEPTED", // Placeholder until actual review
      pillarScores: {},
      overallScore: 0,
      feedback: "",
    },
  });
}
