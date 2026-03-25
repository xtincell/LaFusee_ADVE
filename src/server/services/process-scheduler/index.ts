import { db } from "@/lib/db";

export async function startProcess(processId: string): Promise<void> {
  await db.process.update({
    where: { id: processId },
    data: { status: "RUNNING", lastRunAt: new Date() },
  });
}

export async function pauseProcess(processId: string): Promise<void> {
  await db.process.update({
    where: { id: processId },
    data: { status: "PAUSED" },
  });
}

export async function stopProcess(processId: string): Promise<void> {
  await db.process.update({
    where: { id: processId },
    data: { status: "STOPPED" },
  });
}

export async function getContention(strategyId: string): Promise<{
  runningProcesses: number;
  pendingMissions: number;
  bottlenecks: string[];
}> {
  const [running, missions] = await Promise.all([
    db.process.count({ where: { strategyId, status: "RUNNING" } }),
    db.mission.count({ where: { strategyId, status: "DRAFT" } }),
  ]);

  const bottlenecks: string[] = [];
  if (running > 5) bottlenecks.push("Too many concurrent processes");
  if (missions > 10) bottlenecks.push("Mission backlog growing");

  return { runningProcesses: running, pendingMissions: missions, bottlenecks };
}
