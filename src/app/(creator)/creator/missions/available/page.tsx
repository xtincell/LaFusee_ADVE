export default function AvailableMissionsPage() {
  const demoMissions = [
    { id: "1", title: "Post Instagram — CIMENCAM", channel: "INSTAGRAM", budget: "75 000 XAF", deadline: "28 mars", skills: ["design", "branding"] },
    { id: "2", title: "Video TikTok — Orange", channel: "TIKTOK", budget: "150 000 XAF", deadline: "2 avril", skills: ["video", "motion-design"] },
    { id: "3", title: "Communiqué de presse — MTN", channel: "PR", budget: "50 000 XAF", deadline: "5 avril", skills: ["copywriting"] },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Missions disponibles</h1>
      <div className="space-y-3">
        {demoMissions.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
            <div>
              <p className="font-medium">{m.title}</p>
              <div className="mt-1 flex gap-2">
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">{m.channel}</span>
                {m.skills.map((s) => <span key={s} className="rounded bg-muted px-2 py-0.5 text-xs">{s}</span>)}
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">{m.budget}</p>
              <p className="text-xs text-muted-foreground">Deadline: {m.deadline}</p>
              <button className="mt-1 rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Postuler</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
