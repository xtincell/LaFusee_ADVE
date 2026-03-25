export default async function IntakeResult({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">Votre diagnostic de marque</h1>
      <p className="mt-2 text-muted-foreground">Token: {token}</p>
      <div className="mt-8 space-y-6">
        <div className="rounded-lg border bg-card p-6 text-center">
          <h2 className="text-sm font-medium text-muted-foreground">Score ADVE-RTIS</h2>
          <p className="mt-2 text-5xl font-bold">— /200</p>
          <p className="mt-2 text-lg">Classification: —</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Radar 8 piliers</h3>
          <p className="mt-2 text-sm text-muted-foreground">Visualisation radar — à implémenter</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Diagnostic</h3>
          <p className="mt-2 text-sm text-muted-foreground">Forces, faiblesses, recommandations — à implémenter</p>
        </div>
      </div>
    </main>
  );
}
