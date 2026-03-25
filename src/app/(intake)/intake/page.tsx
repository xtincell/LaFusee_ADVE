import Link from "next/link";

export default function IntakeLanding() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold">Mesurez la force de votre marque en 15 minutes</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Le protocole ADVE-RTIS analyse 8 dimensions de votre marque et vous donne un score sur 200.
          Gratuit. Confidentiel. Actionnable.
        </p>
        <form className="mt-8 space-y-4" action="/api/intake/start" method="POST">
          <input type="text" name="contactName" placeholder="Votre nom" required className="w-full rounded-lg border px-4 py-3" />
          <input type="email" name="contactEmail" placeholder="Email professionnel" required className="w-full rounded-lg border px-4 py-3" />
          <input type="text" name="companyName" placeholder="Nom de votre entreprise / marque" required className="w-full rounded-lg border px-4 py-3" />
          <button type="submit" className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground">
            Commencer le diagnostic
          </button>
        </form>
      </div>
    </main>
  );
}
