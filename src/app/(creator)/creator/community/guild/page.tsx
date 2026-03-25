export default function GuildPage() {
  const members = [
    { name: "Amina K.", tier: "MAITRE", speciality: "Design & Branding", missions: 45 },
    { name: "Paul E.", tier: "APPRENTI", speciality: "Video & TikTok", missions: 8 },
    { name: "Marc N.", tier: "MAITRE", speciality: "Copywriting & PR", missions: 52 },
    { name: "Sandra T.", tier: "COMPAGNON", speciality: "Social Media", missions: 23 },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Votre Guilde</h1>
      <p className="text-muted-foreground">Membres de votre guilde locale. Collaborez, apprenez et progressez ensemble.</p>
      <div className="space-y-3">
        {members.map((m, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border bg-card p-4">
            <div>
              <p className="font-medium">{m.name}</p>
              <p className="text-sm text-muted-foreground">{m.speciality} · {m.missions} missions</p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs ${m.tier === "MAITRE" ? "bg-purple-100 text-purple-800" : m.tier === "COMPAGNON" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}`}>
              {m.tier}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
