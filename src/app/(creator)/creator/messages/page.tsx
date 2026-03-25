export default function CreatorMessagesPage() {
  const conversations = [
    { name: "CIMENCAM — Brief Mission #12", lastMsg: "Merci, le brief est mis a jour.", time: "Il y a 2h", unread: true },
    { name: "Marc N. (MAITRE)", lastMsg: "Bonne qualite, juste un ajustement sur le contraste.", time: "Hier", unread: false },
    { name: "Guilde Douala Creatives", lastMsg: "Prochain meetup le 5 avril a Akwa.", time: "3 jours", unread: false },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Messages</h1>
      <div className="space-y-2">
        {conversations.map((c, i) => (
          <div key={i} className={`flex items-center justify-between rounded-lg border p-4 ${c.unread ? "border-primary bg-primary/5" : "bg-card"}`}>
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{c.lastMsg}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{c.time}</p>
              {c.unread && <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
