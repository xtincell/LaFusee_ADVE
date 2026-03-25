"use client";

export default function DiagnosticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Diagnostics ARTEMIS</h1>
      <p className="text-muted-foreground">Résumés de vos diagnostics stratégiques.</p>
      <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
        Aucun diagnostic récent. Contactez votre consultant pour lancer un diagnostic.
      </div>
    </div>
  );
}
