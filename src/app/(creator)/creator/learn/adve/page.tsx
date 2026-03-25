export default function LearnAdvePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fondamentaux ADVE</h1>
      <p className="text-muted-foreground">Apprenez le protocole ADVE-RTIS pour produire des livrables qui renforcent les marques.</p>
      <div className="space-y-3">
        {["Authenticite — Qui est la marque ?", "Distinction — Pourquoi elle et pas une autre ?", "Valeur — Que promet-elle ?", "Engagement — Comment creer la devotion ?", "Risk — Les angles morts", "Track — Mesurer le succes", "Implementation — Executer", "Strategie — Assembler le tout"].map((item, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{i + 1}</span>
            <p className="text-sm font-medium">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
