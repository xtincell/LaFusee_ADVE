"use client";

import type { PillarKey } from "@/lib/types/advertis-vector";

export type PillarMapStatus = "TO_DO" | "IN_PROGRESS" | "VALIDATED" | "BLOCKED" | "OPTIONAL";

export interface PillarMapItem {
  pillar: PillarKey;
  pillarName: string;
  status: PillarMapStatus;
  projectedScore: number;
  atomsRatio: number;
  weight: number;
  isRecommended: boolean;
}

interface PillarMapProps {
  items: PillarMapItem[];
  onSelect?: (pillar: PillarKey) => void;
  activePillar?: PillarKey | null;
}

const STATUS_STYLES: Record<PillarMapStatus, { bg: string; ring: string; text: string; label: string }> = {
  TO_DO:       { bg: "bg-slate-100",    ring: "ring-slate-300",    text: "text-slate-700",    label: "À faire" },
  IN_PROGRESS: { bg: "bg-amber-100",    ring: "ring-amber-400",    text: "text-amber-900",    label: "En cours" },
  VALIDATED:   { bg: "bg-emerald-100",  ring: "ring-emerald-500",  text: "text-emerald-900",  label: "Validé" },
  BLOCKED:     { bg: "bg-zinc-100",     ring: "ring-zinc-300",     text: "text-zinc-500",     label: "Verrouillé" },
  OPTIONAL:    { bg: "bg-sky-50",       ring: "ring-sky-300",      text: "text-sky-800",      label: "Optionnel" },
};

export function PillarMap({ items, onSelect, activePillar }: PillarMapProps) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Carte ARTEMIS</h3>
          <p className="text-xs text-muted-foreground">8 piliers ADVE — niveau de validation actuel</p>
        </div>
        <Legend />
      </div>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
        {items.map((item) => {
          const style = STATUS_STYLES[item.status];
          const isActive = item.pillar === activePillar;
          const clickable = item.status !== "BLOCKED" && !!onSelect;

          return (
            <button
              key={item.pillar}
              onClick={() => clickable && onSelect?.(item.pillar)}
              disabled={!clickable}
              className={[
                "group relative flex aspect-square flex-col items-center justify-center rounded-xl ring-2 transition-all",
                style.bg,
                style.ring,
                isActive ? "scale-105 ring-4 ring-offset-2 ring-primary" : "",
                clickable ? "cursor-pointer hover:scale-105 hover:shadow-md" : "cursor-not-allowed opacity-70",
              ].join(" ")}
              title={`${item.pillarName} — ${style.label}`}
            >
              {item.isRecommended && (
                <span className="absolute -top-1 -right-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm">
                  Reco
                </span>
              )}
              {item.weight >= 1.2 && (
                <span className="absolute top-1 left-1 text-[10px]" title="Pilier critique pour ce business model">★</span>
              )}
              <span className={`text-2xl font-bold ${style.text}`}>{item.pillar.toUpperCase()}</span>
              <span className={`text-[10px] font-medium ${style.text}`}>{item.pillarName.slice(0, 8)}</span>
              <span className={`mt-1 text-[10px] ${style.text}`}>{item.projectedScore.toFixed(0)}/25</span>

              {/* Mini progress bar */}
              <div className="absolute bottom-1 left-2 right-2 h-1 overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-full rounded-full bg-current opacity-60"
                  style={{ width: `${Math.min(100, item.atomsRatio * 100)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Legend() {
  const items: Array<[PillarMapStatus, string]> = [
    ["VALIDATED", "Validé"],
    ["IN_PROGRESS", "En cours"],
    ["TO_DO", "À faire"],
    ["BLOCKED", "Verrouillé"],
  ];
  return (
    <div className="hidden gap-2 text-[10px] sm:flex">
      {items.map(([status, label]) => (
        <span key={status} className="flex items-center gap-1">
          <span className={`inline-block h-2 w-2 rounded-full ${STATUS_STYLES[status].ring.replace("ring-", "bg-")}`} />
          {label}
        </span>
      ))}
    </div>
  );
}
