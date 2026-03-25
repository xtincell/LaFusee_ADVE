import { AdvertisRadar } from "@/components/shared/advertis-radar";

export default function StrengthsPage() {
  const myStrengths = { a: 12, d: 20, v: 14, e: 8, r: 6, t: 10, i: 15, s: 11 };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Forces ADVE</h1>
      <p className="text-muted-foreground">Votre profil ADVE en tant que creatif — sur quels piliers vous excellez.</p>
      <div className="rounded-lg border bg-card p-6">
        <AdvertisRadar scores={myStrengths} className="flex justify-center" />
      </div>
    </div>
  );
}
