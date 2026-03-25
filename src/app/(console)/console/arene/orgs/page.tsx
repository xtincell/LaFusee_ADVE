export default function OrgsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Guild Organizations</h1>
      <p className="text-muted-foreground">Agences de production membres de la Guilde.</p>
      <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">+ Créer une organisation</button>
      <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">Aucune organisation enregistrée.</div>
    </div>
  );
}
