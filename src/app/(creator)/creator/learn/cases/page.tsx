export default function CasesPage() {
  const cases = [
    { brand: "CIMENCAM", driver: "Instagram", result: "Engagement +45% sur 3 mois", tier: "COMPAGNON" },
    { brand: "Orange Cameroun", driver: "TikTok", result: "2.3M vues organiques", tier: "MAITRE" },
    { brand: "MTN", driver: "PR", result: "Couverture media x8 vs objectif", tier: "COMPAGNON" },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Etudes de cas</h1>
      <p className="text-muted-foreground">Exemples de missions reussies et enseignements cles.</p>
      <div className="space-y-3">
        {cases.map((c, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{c.brand}</h3>
              <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">{c.tier}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Driver: {c.driver}</p>
            <p className="mt-1 text-sm font-medium text-green-700">{c.result}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
