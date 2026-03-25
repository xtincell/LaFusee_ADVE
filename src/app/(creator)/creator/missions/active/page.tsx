export default function ActiveMissionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Missions actives</h1>
      <div className="space-y-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex justify-between">
            <div>
              <p className="font-medium">Post Instagram — CIMENCAM</p>
              <p className="text-sm text-muted-foreground">Driver: Instagram CIMENCAM</p>
            </div>
            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">En cours</span>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="rounded border px-3 py-1 text-sm">Voir le brief</button>
            <button className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground">Soumettre livrable</button>
          </div>
        </div>
      </div>
    </div>
  );
}
