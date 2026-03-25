"use client";

import { AdvertisRadar } from "@/components/shared/advertis-radar";
import { PILLAR_NAMES, type PillarKey } from "@/lib/types/advertis-vector";

export default function IdentityPage() {
  const demoScores = { a: 18, d: 15, v: 20, e: 12, r: 14, t: 16, i: 11, s: 17 };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profil ADVE-RTIS</h1>
      <p className="text-muted-foreground">Les 8 dimensions de votre identité de marque.</p>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <AdvertisRadar scores={demoScores} className="flex justify-center" />
        </div>
        <div className="space-y-3">
          {(Object.entries(PILLAR_NAMES) as [PillarKey, string][]).map(([key, name]) => (
            <div key={key} className="flex items-center gap-3 rounded-lg border p-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {key.toUpperCase()}
              </span>
              <div className="flex-1">
                <p className="font-medium">{name}</p>
                <div className="mt-1 h-2 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(demoScores[key] / 25) * 100}%` }} />
                </div>
              </div>
              <span className="text-sm font-semibold">{demoScores[key]}/25</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
