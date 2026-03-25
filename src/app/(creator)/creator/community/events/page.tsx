export default function EventsPage() {
  const events = [
    { title: "Meetup Guilde Douala", date: "5 avril 2026", location: "Akwa, Douala", type: "Presentiel" },
    { title: "Webinaire: Maitriser le brief creatif", date: "12 avril 2026", location: "En ligne", type: "Virtuel" },
    { title: "Workshop TikTok Ads", date: "20 avril 2026", location: "Yaounde", type: "Presentiel" },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Evenements</h1>
      <p className="text-muted-foreground">Retrouvez les prochains evenements communautaires et formations.</p>
      <div className="space-y-3">
        {events.map((e, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{e.title}</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs ${e.type === "Virtuel" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                {e.type}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{e.date} · {e.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
