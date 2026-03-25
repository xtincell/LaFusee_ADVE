"use client";

interface DevotionLadderProps {
  spectateur: number;
  interesse: number;
  participant: number;
  engage: number;
  ambassadeur: number;
  evangeliste: number;
  className?: string;
}

const LEVELS = [
  { key: "evangeliste", label: "Évangéliste", color: "bg-purple-600" },
  { key: "ambassadeur", label: "Ambassadeur", color: "bg-purple-500" },
  { key: "engage", label: "Engagé", color: "bg-blue-500" },
  { key: "participant", label: "Participant", color: "bg-blue-400" },
  { key: "interesse", label: "Intéressé", color: "bg-sky-400" },
  { key: "spectateur", label: "Spectateur", color: "bg-gray-400" },
] as const;

export function DevotionLadder(props: DevotionLadderProps) {
  const { className, ...values } = props;

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      {LEVELS.map(({ key, label, color }) => {
        const value = values[key];
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="w-28 text-right text-sm font-medium">{label}</span>
            <div className="flex-1 rounded-full bg-muted h-6 overflow-hidden">
              <div
                className={`h-full ${color} rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                style={{ width: `${Math.max(value, 2)}%` }}
              >
                {value >= 5 && <span className="text-xs font-semibold text-white">{value.toFixed(0)}%</span>}
              </div>
            </div>
            {value < 5 && <span className="text-xs text-muted-foreground w-10">{value.toFixed(0)}%</span>}
          </div>
        );
      })}
    </div>
  );
}
