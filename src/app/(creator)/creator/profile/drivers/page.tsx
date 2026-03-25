export default function DriversPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Specialites par Driver</h1>
      <p className="text-muted-foreground">Les canaux sur lesquels vous etes specialise.</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {["INSTAGRAM", "FACEBOOK", "VIDEO", "TIKTOK"].map((ch) => (
          <div key={ch} className="rounded-lg border bg-card p-3 text-center">
            <p className="font-medium">{ch}</p>
            <p className="text-xs text-muted-foreground">12 missions</p>
          </div>
        ))}
      </div>
    </div>
  );
}
