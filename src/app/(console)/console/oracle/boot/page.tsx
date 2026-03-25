export default function BootSequencesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Boot Sequences</h1>
      <p className="text-muted-foreground">Sessions d'onboarding client (60-90 min) — calibrage des 8 piliers ADVE.</p>
      <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Démarrer un Boot Sequence</button>
      <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">Aucun Boot Sequence en cours.</div>
    </div>
  );
}
