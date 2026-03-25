export default function ProgressPathPage() {
  const tiers = [
    { name: "APPRENTI", missions: 10, firstPass: 0.6, peerReviews: 0, status: "completed" },
    { name: "COMPAGNON", missions: 20, firstPass: 0.7, peerReviews: 5, status: "current" },
    { name: "MAITRE", missions: 40, firstPass: 0.8, peerReviews: 15, status: "locked" },
    { name: "ASSOCIE", missions: 80, firstPass: 0.85, peerReviews: 30, status: "locked" },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Parcours de progression</h1>
      <div className="space-y-4">
        {tiers.map((t) => (
          <div key={t.name} className={`rounded-lg border p-4 ${t.status === "current" ? "border-primary bg-primary/5" : t.status === "completed" ? "opacity-60" : "opacity-40"}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{t.name}</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs ${t.status === "completed" ? "bg-green-100 text-green-800" : t.status === "current" ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"}`}>
                {t.status === "completed" ? "Valide" : t.status === "current" ? "En cours" : "Verrouille"}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{t.missions} missions · {(t.firstPass*100)}% 1er jet · {t.peerReviews} peer reviews</p>
          </div>
        ))}
      </div>
    </div>
  );
}
