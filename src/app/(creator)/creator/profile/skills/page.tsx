export default function SkillsPage() {
  const skills = ["design", "branding", "illustration", "social-media"];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Competences</h1>
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <span key={s} className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">{s}</span>
        ))}
        <button className="rounded-full border border-dashed px-3 py-1 text-sm text-muted-foreground">+ Ajouter</button>
      </div>
    </div>
  );
}
