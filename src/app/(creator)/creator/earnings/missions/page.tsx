export default function EarningsMissionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Revenus — Missions</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">Ce mois</p>
          <p className="text-2xl font-bold">275 000 XAF</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">1 650 000 XAF</p>
        </div>
      </div>
    </div>
  );
}
