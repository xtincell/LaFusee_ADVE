"use client";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Value Reports</h1>
      <p className="text-muted-foreground">Rapports mensuels d'évolution de votre marque.</p>
      <div className="space-y-3">
        {["Mars 2026", "Février 2026", "Janvier 2026"].map((month) => (
          <div key={month} className="flex items-center justify-between rounded-lg border bg-card p-4">
            <div>
              <p className="font-medium">Value Report — {month}</p>
              <p className="text-sm text-muted-foreground">Évolution piliers + Devotion Ladder + missions + QC</p>
            </div>
            <div className="flex gap-2">
              <button className="rounded border px-3 py-1 text-sm">PDF</button>
              <button className="rounded border px-3 py-1 text-sm">Voir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
