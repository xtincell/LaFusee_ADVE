export default function IntelligencePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Intelligence (RADAR)</h1>
      <p className="text-muted-foreground">Surveillance et intelligence marché.</p>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4"><h3 className="font-medium">Signaux détectés</h3><p className="text-2xl font-bold">34</p></div>
        <div className="rounded-lg border bg-card p-4"><h3 className="font-medium">Alertes actives</h3><p className="text-2xl font-bold text-destructive">3</p></div>
        <div className="rounded-lg border bg-card p-4"><h3 className="font-medium">Sources connectées</h3><p className="text-2xl font-bold">12</p></div>
      </div>
    </div>
  );
}
