export default function SignalsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Signaux</h1>
      <p className="text-muted-foreground">Flux de signaux entrants alimentant le feedback loop.</p>
      <div className="space-y-2">
        {["SOCIAL_METRICS", "MEDIA_PERFORMANCE", "PRESS_CLIPPING", "INTERVENTION_REQUEST"].map((type) => (
          <div key={type} className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm font-medium">{type}</span>
            <span className="text-xs text-muted-foreground">— signaux</span>
          </div>
        ))}
      </div>
    </div>
  );
}
