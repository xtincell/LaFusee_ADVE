import { db } from "@/lib/db";

export interface SlaAlert {
  missionId: string;
  missionTitle: string;
  driverId: string | null;
  deadline: Date;
  hoursRemaining: number;
  severity: "warning" | "urgent" | "breached";
}

/**
 * Check all active missions for SLA deadlines approaching or breached.
 */
export async function checkSlaDeadlines(): Promise<SlaAlert[]> {
  const now = new Date();
  const missions = await db.mission.findMany({
    where: { status: { in: ["DRAFT", "IN_PROGRESS", "REVIEW"] } },
    include: { driver: true },
  });

  const alerts: SlaAlert[] = [];

  for (const mission of missions) {
    // Check mission-level deadline from advertis_vector metadata
    const meta = mission.advertis_vector as Record<string, unknown> | null;
    const deadlineStr = meta?.deadline as string | undefined;
    if (!deadlineStr) continue;

    const deadline = new Date(deadlineStr);
    const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    let severity: SlaAlert["severity"] | null = null;
    if (hoursRemaining < 0) severity = "breached";
    else if (hoursRemaining < 24) severity = "urgent";
    else if (hoursRemaining < 48) severity = "warning";

    if (severity) {
      alerts.push({
        missionId: mission.id,
        missionTitle: mission.title,
        driverId: mission.driverId,
        deadline,
        hoursRemaining: Math.round(hoursRemaining * 10) / 10,
        severity,
      });
    }
  }

  return alerts.sort((a, b) => a.hoursRemaining - b.hoursRemaining);
}

/**
 * Set a deadline on a mission for SLA tracking.
 */
export async function setDeadline(missionId: string, deadline: Date): Promise<void> {
  const mission = await db.mission.findUniqueOrThrow({ where: { id: missionId } });
  const existing = (mission.advertis_vector as Record<string, unknown>) ?? {};
  await db.mission.update({
    where: { id: missionId },
    data: {
      advertis_vector: {
        ...existing,
        deadline: deadline.toISOString(),
      },
    },
  });
}

/**
 * Get SLA status for a specific mission.
 */
export async function getMissionSla(missionId: string): Promise<SlaAlert | null> {
  const alerts = await checkSlaDeadlines();
  return alerts.find((a) => a.missionId === missionId) ?? null;
}
