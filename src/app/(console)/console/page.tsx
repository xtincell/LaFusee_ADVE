import { ScoreBadge } from "@/components/shared/score-badge";

export default function ConsoleDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Ecosystem Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Clients actifs</h3>
          <p className="mt-2 text-3xl font-bold">12</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Missions en vol</h3>
          <p className="mt-2 text-3xl font-bold">23</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Score moyen</h3>
          <ScoreBadge score={127} size="sm" className="mt-2" />
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Guilde (créatifs)</h3>
          <p className="mt-2 text-3xl font-bold">48</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Quick Intakes</h3>
          <p className="mt-2 text-3xl font-bold">7</p>
          <p className="text-xs text-muted-foreground">ce mois</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Alertes récentes</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              Drift pilier D détecté — CIMENCAM (-3.2)
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              SLA mission #47 — échéance dans 24h
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Quick Intake complété — DG Orange Cameroun
            </li>
          </ul>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Revenue du mois</h3>
          <p className="text-3xl font-bold">4 250 000 <span className="text-lg font-normal text-muted-foreground">XAF</span></p>
          <p className="mt-1 text-sm text-green-600">+18% vs mois dernier</p>
        </div>
      </div>
    </div>
  );
}
