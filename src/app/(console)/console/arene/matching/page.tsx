export default function MatchingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Matching Engine</h1>
      <p className="text-muted-foreground">Croisement automatique briefs × créatifs.</p>
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-medium mb-2">Lancer un matching</h3>
        <p className="text-sm text-muted-foreground">Sélectionnez une mission pour trouver les meilleurs créatifs.</p>
        <button className="mt-3 rounded bg-primary px-4 py-2 text-sm text-primary-foreground">Suggest</button>
      </div>
    </div>
  );
}
