export default function CockpitDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Cult Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Cult Index</h3>
          <p className="mt-2 text-3xl font-bold">—</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Score /200</h3>
          <p className="mt-2 text-3xl font-bold">—</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Classification</h3>
          <p className="mt-2 text-3xl font-bold">—</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Missions actives</h3>
          <p className="mt-2 text-3xl font-bold">—</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Radar ADVE-RTIS</h3>
          <p className="text-sm text-muted-foreground">Radar chart des 8 piliers — à implémenter</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Devotion Ladder</h3>
          <p className="text-sm text-muted-foreground">Visualisation 6 niveaux — à implémenter</p>
        </div>
      </div>
    </div>
  );
}
