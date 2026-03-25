export default function KnowledgeGraphPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Knowledge Graph</h1>
      <p className="text-muted-foreground">Données agrégées et anonymisées — benchmarks, patterns, rankings.</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-4"><h3 className="font-medium">Benchmarks sectoriels</h3><p className="text-sm text-muted-foreground">8 secteurs × 4 marchés</p></div>
        <div className="rounded-lg border bg-card p-4"><h3 className="font-medium">Brief patterns</h3><p className="text-sm text-muted-foreground">8 canaux analysés</p></div>
        <div className="rounded-lg border bg-card p-4"><h3 className="font-medium">Creator patterns</h3><p className="text-sm text-muted-foreground">25 profils analysés</p></div>
        <div className="rounded-lg border bg-card p-4"><h3 className="font-medium">Framework rankings</h3><p className="text-sm text-muted-foreground">5 frameworks classés</p></div>
      </div>
    </div>
  );
}
