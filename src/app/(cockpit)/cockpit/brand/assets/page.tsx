"use client";

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Brand Vault</h1>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          + Ajouter un asset
        </button>
      </div>
      <div className="flex gap-2">
        <button className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">Tous</button>
        {["A", "D", "V", "E", "R", "T", "I", "S"].map((p) => (
          <button key={p} className="rounded-full border px-3 py-1 text-sm">{p}</button>
        ))}
      </div>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Vos assets de marque apparaîtront ici, filtrables par pilier ADVE.
      </div>
    </div>
  );
}
