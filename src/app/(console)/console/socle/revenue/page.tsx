export default function RevenuePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Revenue</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4 text-center"><p className="text-sm text-muted-foreground">Ce mois</p><p className="text-2xl font-bold">4 250 000 XAF</p></div>
        <div className="rounded-lg border bg-card p-4 text-center"><p className="text-sm text-muted-foreground">Retainers</p><p className="text-2xl font-bold">3 200 000 XAF</p></div>
        <div className="rounded-lg border bg-card p-4 text-center"><p className="text-sm text-muted-foreground">One-off</p><p className="text-2xl font-bold">1 050 000 XAF</p></div>
      </div>
    </div>
  );
}
