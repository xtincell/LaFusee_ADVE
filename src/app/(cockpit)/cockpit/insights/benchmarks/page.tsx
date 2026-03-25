"use client";

export default function BenchmarksPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Benchmarks sectoriels</h1>
      <p className="text-muted-foreground">Comment votre marque se positionne dans votre secteur.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">Votre score</p>
          <p className="text-3xl font-bold text-primary">123/200</p>
          <p className="text-xs text-muted-foreground">Forte</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">Moyenne secteur</p>
          <p className="text-3xl font-bold">95/200</p>
          <p className="text-xs text-muted-foreground">Ordinaire</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">Top quartile</p>
          <p className="text-3xl font-bold">135/200</p>
          <p className="text-xs text-muted-foreground">Forte</p>
        </div>
      </div>
    </div>
  );
}
