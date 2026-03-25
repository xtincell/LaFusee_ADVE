export default async function IntakeQuestionnaire({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">Diagnostic ADVE-RTIS</h1>
      <p className="mt-2 text-muted-foreground">Token: {token}</p>
      <div className="mt-8 rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Questionnaire adaptatif guidé par Mestor — à implémenter</p>
      </div>
    </main>
  );
}
