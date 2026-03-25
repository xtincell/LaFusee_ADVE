"use client";

export default function GuidelinesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Guidelines de marque</h1>
        <div className="flex gap-2">
          <button className="rounded-lg border px-4 py-2 text-sm font-medium">Exporter PDF</button>
          <button className="rounded-lg border px-4 py-2 text-sm font-medium">Exporter HTML</button>
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Partager le lien</button>
        </div>
      </div>
      <p className="text-muted-foreground">
        Vos guidelines de marque vivantes, générées à partir de votre profil ADVE-RTIS. Interrogez-les via Mestor.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {["Authenticité", "Distinction", "Valeur", "Engagement", "Risk", "Track", "Implementation", "Stratégie"].map((pillar, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold">{pillar}</h3>
            <p className="mt-1 text-sm text-muted-foreground">Contenu du pilier {pillar} — chargement depuis le profil ADVE</p>
            <div className="mt-2 flex gap-2">
              <span className="rounded bg-muted px-2 py-0.5 text-xs">Score: —/25</span>
              <span className="rounded bg-muted px-2 py-0.5 text-xs">Confidence: —%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
