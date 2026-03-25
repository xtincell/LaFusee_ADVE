import { db } from "@/lib/db";

export interface CreatorLoad {
  userId: string;
  displayName: string;
  tier: string;
  activeMissions: number;
  pendingReviews: number;
  totalLoad: number; // weighted score
  capacity: number; // max concurrent missions based on tier
  utilization: number; // 0-1
}

export interface BottleneckAlert {
  type: "overloaded" | "underutilized" | "no_reviewer" | "tier_gap";
  severity: "low" | "medium" | "high";
  message: string;
  affectedUsers: string[];
}

const TIER_CAPACITY: Record<string, number> = {
  APPRENTI: 3,
  COMPAGNON: 5,
  MAITRE: 8,
  ASSOCIE: 12,
};

/**
 * Get consolidated load view per creator.
 */
export async function getCreatorLoads(): Promise<CreatorLoad[]> {
  const profiles = await db.talentProfile.findMany({
    include: { user: { select: { id: true, name: true } } },
  });

  const loads: CreatorLoad[] = [];

  for (const profile of profiles) {
    // Count active missions (assigned to this user)
    const activeMissions = await db.mission.count({
      where: {
        status: { in: ["IN_PROGRESS", "REVIEW"] },
        // Missions linked via deliverables to this user
      },
    });

    // Count pending reviews
    const pendingReviews = await db.qualityReview.count({
      where: {
        reviewerId: profile.userId,
        verdict: "ACCEPTED", // placeholder reviews awaiting actual review
        overallScore: 0,
      },
    });

    const capacity = TIER_CAPACITY[profile.tier] ?? 3;
    const totalLoad = activeMissions + pendingReviews * 0.5;
    const utilization = Math.min(1, totalLoad / capacity);

    loads.push({
      userId: profile.userId,
      displayName: profile.displayName,
      tier: profile.tier,
      activeMissions,
      pendingReviews,
      totalLoad,
      capacity,
      utilization,
    });
  }

  return loads.sort((a, b) => b.utilization - a.utilization);
}

/**
 * Detect bottlenecks in the creator pool.
 */
export async function detectBottlenecks(): Promise<BottleneckAlert[]> {
  const loads = await getCreatorLoads();
  const alerts: BottleneckAlert[] = [];

  // Check for overloaded creators
  const overloaded = loads.filter((l) => l.utilization > 0.9);
  if (overloaded.length > 0) {
    alerts.push({
      type: "overloaded",
      severity: "high",
      message: `${overloaded.length} créatif(s) surchargé(s) (>90% capacité)`,
      affectedUsers: overloaded.map((l) => l.displayName),
    });
  }

  // Check for underutilized creators
  const underutilized = loads.filter((l) => l.utilization < 0.2 && l.tier !== "APPRENTI");
  if (underutilized.length > 0) {
    alerts.push({
      type: "underutilized",
      severity: "low",
      message: `${underutilized.length} créatif(s) sous-utilisé(s) (<20% capacité)`,
      affectedUsers: underutilized.map((l) => l.displayName),
    });
  }

  // Check for tier gaps (no MAITRE+ for reviews)
  const maitresAndUp = loads.filter((l) => l.tier === "MAITRE" || l.tier === "ASSOCIE");
  if (maitresAndUp.length === 0) {
    alerts.push({
      type: "tier_gap",
      severity: "high",
      message: "Aucun MAITRE ou ASSOCIE disponible pour les peer reviews avancés",
      affectedUsers: [],
    });
  }

  // Check for review bottleneck
  const totalPendingReviews = loads.reduce((sum, l) => sum + l.pendingReviews, 0);
  const availableReviewers = loads.filter((l) => l.tier !== "APPRENTI" && l.utilization < 0.8);
  if (totalPendingReviews > availableReviewers.length * 3) {
    alerts.push({
      type: "no_reviewer",
      severity: "medium",
      message: `${totalPendingReviews} reviews en attente mais seulement ${availableReviewers.length} reviewers disponibles`,
      affectedUsers: availableReviewers.map((l) => l.displayName),
    });
  }

  return alerts;
}

/**
 * Recommend staffing based on current load and upcoming missions.
 */
export async function getStaffingRecommendations(): Promise<string[]> {
  const loads = await getCreatorLoads();
  const bottlenecks = await detectBottlenecks();
  const recommendations: string[] = [];

  const avgUtilization = loads.reduce((sum, l) => sum + l.utilization, 0) / (loads.length || 1);

  if (avgUtilization > 0.7) {
    recommendations.push("Capacité globale à 70%+ — envisager le recrutement de nouveaux créatifs");
  }

  const tierCounts: Record<string, number> = {};
  for (const l of loads) {
    tierCounts[l.tier] = (tierCounts[l.tier] ?? 0) + 1;
  }

  if ((tierCounts["APPRENTI"] ?? 0) > (tierCounts["COMPAGNON"] ?? 0) * 2) {
    recommendations.push("Ratio APPRENTI/COMPAGNON déséquilibré — accélérer les promotions ou recruter des COMPAGNON");
  }

  for (const b of bottlenecks) {
    if (b.type === "tier_gap") {
      recommendations.push("Recruter ou promouvoir un MAITRE pour assurer les peer reviews avancés");
    }
    if (b.type === "no_reviewer") {
      recommendations.push("Former des COMPAGNON aux reviews pour réduire le goulet d'étranglement QC");
    }
  }

  if (recommendations.length === 0) {
    recommendations.push("Staffing équilibré — aucune action requise");
  }

  return recommendations;
}
