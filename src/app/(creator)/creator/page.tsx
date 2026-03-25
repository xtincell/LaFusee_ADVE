import { ScoreBadge } from "@/components/shared/score-badge";

export default function CreatorDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Creator Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Missions disponibles</h3>
          <p className="mt-2 text-3xl font-bold">8</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Missions actives</h3>
          <p className="mt-2 text-3xl font-bold">3</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Revenu du mois</h3>
          <p className="mt-2 text-2xl font-bold">275 000 <span className="text-sm font-normal text-muted-foreground">XAF</span></p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Tier</h3>
          <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
            COMPAGNON
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Prochaines missions</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">Post Instagram — CIMENCAM</p>
                <p className="text-muted-foreground">Deadline: 28 mars</p>
              </div>
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">En cours</span>
            </li>
            <li className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">Video TikTok — Orange</p>
                <p className="text-muted-foreground">Deadline: 2 avril</p>
              </div>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">Brief reçu</span>
            </li>
          </ul>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Progression</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span>Taux 1er jet</span>
                <span className="font-medium">78%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-muted">
                <div className="h-full w-[78%] rounded-full bg-primary" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Peer reviews</span>
                <span className="font-medium">12/15</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-muted">
                <div className="h-full w-[80%] rounded-full bg-accent" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Missions collab</span>
                <span className="font-medium">4/5</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-muted">
                <div className="h-full w-[80%] rounded-full bg-blue-500" />
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Prochain tier: MAITRE (besoin 15 peer reviews)</p>
        </div>
      </div>
    </div>
  );
}
