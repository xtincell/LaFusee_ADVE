"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { BUSINESS_MODELS, ECONOMIC_MODELS, POSITIONING_ARCHETYPES } from "@/lib/types/business-context";

export default function IntakeLanding() {
  const router = useRouter();
  const [form, setForm] = useState({
    contactName: "",
    contactEmail: "",
    companyName: "",
    sector: "",
    country: "",
    businessModel: "",
    economicModel: "",
    positioning: "",
  });
  const [error, setError] = useState("");

  const startMutation = trpc.quickIntake.start.useMutation({
    onSuccess: (data) => {
      router.push(`/intake/${data.token}`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startMutation.mutate({
      contactName: form.contactName,
      contactEmail: form.contactEmail,
      companyName: form.companyName,
      sector: form.sector || undefined,
      country: form.country || undefined,
      businessModel: form.businessModel || undefined,
      economicModel: form.economicModel || undefined,
      positioning: form.positioning || undefined,
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold">Mesurez la force de votre marque en 15 minutes</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Le protocole ADVE-RTIS analyse 8 dimensions de votre marque et vous donne un score sur 200.
          Gratuit. Confidentiel. Actionnable.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Votre nom"
            required
            value={form.contactName}
            onChange={(e) => setForm({ ...form, contactName: e.target.value })}
            className="w-full rounded-lg border px-4 py-3"
          />
          <input
            type="email"
            placeholder="Email professionnel"
            required
            value={form.contactEmail}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            className="w-full rounded-lg border px-4 py-3"
          />
          <input
            type="text"
            placeholder="Nom de votre entreprise / marque"
            required
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            className="w-full rounded-lg border px-4 py-3"
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              value={form.sector}
              onChange={(e) => setForm({ ...form, sector: e.target.value })}
              className="rounded-lg border px-4 py-3 text-muted-foreground"
            >
              <option value="">Secteur (optionnel)</option>
              <option value="FMCG">FMCG</option>
              <option value="BANQUE">Banque & Finance</option>
              <option value="TECH">Tech & Startup</option>
              <option value="TELECOM">Telecom</option>
              <option value="IMMOBILIER">Immobilier</option>
              <option value="SANTE">Sante</option>
              <option value="EDUCATION">Education</option>
              <option value="MODE">Mode & Beaute</option>
              <option value="FOOD">Alimentation</option>
              <option value="SERVICES">Services professionnels</option>
              <option value="AUTRE">Autre</option>
            </select>
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="rounded-lg border px-4 py-3 text-muted-foreground"
            >
              <option value="">Pays (optionnel)</option>
              <option value="CM">Cameroun</option>
              <option value="CI">Cote d'Ivoire</option>
              <option value="SN">Senegal</option>
              <option value="GA">Gabon</option>
              <option value="CG">Congo</option>
              <option value="CD">RD Congo</option>
              <option value="BF">Burkina Faso</option>
              <option value="ML">Mali</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>

          {/* Business context fields */}
          <div className="grid grid-cols-1 gap-4">
            <select
              value={form.businessModel}
              onChange={(e) => setForm({ ...form, businessModel: e.target.value })}
              className="rounded-lg border px-4 py-3 text-muted-foreground"
            >
              <option value="">Modele d'affaires (optionnel)</option>
              {Object.entries(BUSINESS_MODELS).map(([key, model]) => (
                <option key={key} value={key}>{model.label}</option>
              ))}
            </select>
            <select
              value={form.positioning}
              onChange={(e) => setForm({ ...form, positioning: e.target.value })}
              className="rounded-lg border px-4 py-3 text-muted-foreground"
            >
              <option value="">Positionnement prix (optionnel)</option>
              {Object.entries(POSITIONING_ARCHETYPES).map(([key, arch]) => (
                <option key={key} value={key}>{arch.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={startMutation.isPending}
            className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50"
          >
            {startMutation.isPending ? "Demarrage..." : "Commencer le diagnostic"}
          </button>
        </form>

        <p className="mt-4 text-xs text-muted-foreground">
          Vos donnees sont confidentielles et ne seront jamais partagees sans votre accord.
        </p>
      </div>
    </main>
  );
}
