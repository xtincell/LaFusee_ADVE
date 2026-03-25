import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">LaFusée Industry OS</h1>
      <p className="text-muted-foreground text-lg">De la Poussière à l'Étoile</p>
      <nav className="flex gap-4">
        <Link href="/cockpit" className="rounded-lg bg-primary px-6 py-3 text-primary-foreground">
          Cockpit
        </Link>
        <Link href="/creator" className="rounded-lg bg-secondary px-6 py-3 text-secondary-foreground">
          Creator
        </Link>
        <Link href="/console" className="rounded-lg bg-accent px-6 py-3 text-accent-foreground">
          Console
        </Link>
        <Link href="/intake" className="rounded-lg border px-6 py-3">
          Quick Intake
        </Link>
      </nav>
    </main>
  );
}
