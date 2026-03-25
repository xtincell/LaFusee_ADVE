export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">+ Ajouter</button>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="aspect-square rounded-lg border bg-muted flex items-center justify-center text-muted-foreground text-sm">
          Aucun item encore
        </div>
      </div>
    </div>
  );
}
