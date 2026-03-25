export default function LearnDriversPage() {
  const drivers = [
    { name: "Instagram", desc: "Bonnes pratiques visuelles, formats story et reel, optimisation du feed." },
    { name: "TikTok", desc: "Storytelling court, tendances audio, hooks des 3 premieres secondes." },
    { name: "Facebook", desc: "Posts engageants, gestion de communaute, formats publicitaires." },
    { name: "Video", desc: "Pre-production, tournage, montage et post-production." },
    { name: "Print / PR", desc: "Communiques de presse, supports print, coherence de marque." },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Formation Drivers</h1>
      <p className="text-muted-foreground">Maitrisez chaque canal de communication pour livrer des contenus performants.</p>
      <div className="space-y-3">
        {drivers.map((d) => (
          <div key={d.name} className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold">{d.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{d.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
