export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pipeline CRM</h1>
      <div className="grid grid-cols-4 gap-3">
        {[{stage: "Prospect", count: 7}, {stage: "Qualification", count: 3}, {stage: "Proposition", count: 2}, {stage: "Signé", count: 1}].map((s) => (
          <div key={s.stage} className="rounded-lg border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">{s.stage}</p>
            <p className="text-xl font-bold">{s.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
