import { db } from "@/lib/db";

/**
 * MCP Server Guild — Tools and resources for the Guild (L'Arène).
 * ~10 tools, ~4 resources.
 */

// Tools

export async function getCreatorProfile(userId: string) {
  return db.talentProfile.findUnique({
    where: { userId },
    include: { portfolioItems: true, memberships: { where: { status: "ACTIVE" } }, guildOrganization: true },
  });
}

export async function getCreatorsByTier(tier: string) {
  return db.talentProfile.findMany({
    where: { tier: tier as any },
    orderBy: { totalMissions: "desc" },
  });
}

export async function getTopPerformers(limit: number = 10) {
  return db.talentProfile.findMany({
    orderBy: { firstPassRate: "desc" },
    where: { totalMissions: { gte: 5 } },
    take: limit,
  });
}

export async function searchCreators(skills: string[], channel?: string) {
  const profiles = await db.talentProfile.findMany();
  return profiles.filter((p) => {
    const profileSkills = (p.skills as string[]) ?? [];
    const hasSkills = skills.every((s) => profileSkills.includes(s));
    if (!hasSkills) return false;
    if (channel) {
      const specialties = (p.driverSpecialties as Array<{ channel: string }>) ?? [];
      return specialties.some((s) => s.channel === channel);
    }
    return true;
  });
}

export async function getQcStats() {
  const [totalReviews, avgScore] = await Promise.all([
    db.qualityReview.count(),
    db.qualityReview.aggregate({ _avg: { overallScore: true } }),
  ]);
  return { totalReviews, avgScore: avgScore._avg.overallScore ?? 0 };
}

export async function getMatchingSuggestions(missionId: string) {
  const mission = await db.mission.findUniqueOrThrow({
    where: { id: missionId },
    include: { driver: true },
  });
  const channel = mission.driver?.channel;
  if (!channel) return [];

  return db.talentProfile.findMany({
    where: { tier: { in: ["COMPAGNON", "MAITRE", "ASSOCIE"] } },
    orderBy: { firstPassRate: "desc" },
    take: 5,
  });
}

// Resources

export async function getGuildStats() {
  const [total, byTier] = await Promise.all([
    db.talentProfile.count(),
    db.talentProfile.groupBy({ by: ["tier"], _count: true }),
  ]);
  return { total, byTier };
}

export async function getTierDistribution() {
  return db.talentProfile.groupBy({ by: ["tier"], _count: true, _avg: { firstPassRate: true } });
}

export async function getOrgDirectory() {
  return db.guildOrganization.findMany({
    include: { members: { select: { id: true, displayName: true, tier: true } } },
  });
}
