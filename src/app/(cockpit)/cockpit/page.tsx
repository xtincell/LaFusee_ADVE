import { AdvertisRadar } from "@/components/shared/advertis-radar";
import { ScoreBadge } from "@/components/shared/score-badge";
import { DevotionLadder } from "@/components/shared/devotion-ladder";
import { CultIndex } from "@/components/shared/cult-index";

export default function CockpitDashboard() {
  // Demo data — will be replaced with real tRPC queries
  const demoScores = { a: 18, d: 15, v: 20, e: 12, r: 14, t: 16, i: 11, s: 17 };
  const demoComposite = Object.values(demoScores).reduce((a, b) => a + b, 0);
  const demoDevotion = {
    spectateur: 35,
    interesse: 25,
    participant: 20,
    engage: 12,
    ambassadeur: 5,
    evangeliste: 3,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Cult Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Cult Index</h3>
          <CultIndex score={62} trend="up" className="mt-2" />
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Score ADVE-RTIS</h3>
          <ScoreBadge score={demoComposite} className="mt-2" />
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Prescriptions actives</h3>
          <p className="mt-2 text-3xl font-bold">3</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Missions actives</h3>
          <p className="mt-2 text-3xl font-bold">5</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Radar ADVE-RTIS</h3>
          <AdvertisRadar scores={demoScores} className="flex justify-center" />
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Devotion Ladder</h3>
          <DevotionLadder {...demoDevotion} />
        </div>
      </div>
    </div>
  );
}
