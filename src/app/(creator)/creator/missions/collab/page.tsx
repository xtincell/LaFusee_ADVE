export default function CollabMissionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Missions collaboratives</h1>
      <p className="text-muted-foreground">Missions en mode COLLABORATIF ou vous travaillez avec d&apos;autres creatifs.</p>
      <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
        Aucune mission collaborative en cours. Les missions collab sont disponibles a partir du tier COMPAGNON.
      </div>
    </div>
  );
}
