export default function SubmittedQcPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Livrables soumis</h1>
      <div className="space-y-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex justify-between">
            <div>
              <p className="font-medium">Post Instagram #1 — CIMENCAM</p>
              <p className="text-sm text-muted-foreground">Soumis le 22 mars 2026</p>
            </div>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">En review</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Reviewer: Marc N. (MAITRE) — review type: PEER</div>
        </div>
      </div>
    </div>
  );
}
