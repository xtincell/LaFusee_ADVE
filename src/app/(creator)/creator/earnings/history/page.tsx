export default function EarningsHistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Historique des paiements</h1>
      <div className="space-y-2">
        {[
          { date: "15 mars", amount: "150 000 XAF", method: "Orange Money", status: "Recu" },
          { date: "15 fev", amount: "125 000 XAF", method: "MTN Mobile Money", status: "Recu" },
        ].map((p, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">{p.amount}</p>
              <p className="text-xs text-muted-foreground">{p.date} · {p.method}</p>
            </div>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">{p.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
