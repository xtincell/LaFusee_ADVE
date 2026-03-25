export default function ResourcesPage() {
  const resources = [
    { title: "Guide du creatif La Fusee", type: "PDF", desc: "Le manuel complet pour demarrer sur la plateforme." },
    { title: "Templates Canva approuves", type: "Lien", desc: "Bibliotheque de templates conformes aux standards QC." },
    { title: "Checklist QC pre-soumission", type: "PDF", desc: "Verifiez votre livrable avant de le soumettre." },
    { title: "Glossaire ADVE-RTIS", type: "PDF", desc: "Tous les termes du framework expliques simplement." },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ressources</h1>
      <p className="text-muted-foreground">Documents, templates et outils pour ameliorer vos livrables.</p>
      <div className="space-y-3">
        {resources.map((r, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border bg-card p-4">
            <div>
              <p className="font-medium">{r.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
            </div>
            <span className="rounded bg-muted px-2 py-0.5 text-xs">{r.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
