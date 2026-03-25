export default function DiagnosticsConsolePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Diagnostics ARTEMIS</h1>
      <p className="text-muted-foreground">Tous les diagnostics stratégiques — lancez une batterie ARTEMIS pour n'importe quel client.</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">FW-01 Brand Audit</h3>
          <p className="text-xs text-muted-foreground">Effectiveness: 85% · 120 uses</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">FW-03 Brand Prism</h3>
          <p className="text-xs text-muted-foreground">Effectiveness: 82% · 80 uses</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">FW-02 Competitor Map</h3>
          <p className="text-xs text-muted-foreground">Effectiveness: 78% · 95 uses</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">FW-05 Positioning Map</h3>
          <p className="text-xs text-muted-foreground">Effectiveness: 80% · 70 uses</p>
        </div>
      </div>
    </div>
  );
}
