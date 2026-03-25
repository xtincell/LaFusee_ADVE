export default function MetricsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Metriques de performance</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">Taux 1er jet</p>
          <p className="text-3xl font-bold text-primary">78%</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">Score QC moyen</p>
          <p className="text-3xl font-bold">7.8/10</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">Missions totales</p>
          <p className="text-3xl font-bold">22</p>
        </div>
      </div>
    </div>
  );
}
