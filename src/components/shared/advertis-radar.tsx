"use client";

import { type PillarKey, PILLAR_NAMES } from "@/lib/types/advertis-vector";

interface AdvertisRadarProps {
  scores: Partial<Record<PillarKey, number>>;
  maxScore?: number;
  size?: number;
  className?: string;
}

const PILLAR_ORDER: PillarKey[] = ["a", "d", "v", "e", "r", "t", "i", "s"];

export function AdvertisRadar({ scores, maxScore = 25, size = 300, className }: AdvertisRadarProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.8;
  const angleStep = (2 * Math.PI) / 8;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / maxScore) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const dataPoints = PILLAR_ORDER.map((key, i) => getPoint(i, scores[key] ?? 0));
  const maxPoints = PILLAR_ORDER.map((_, i) => getPoint(i, maxScore));

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  const maxPath = maxPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  // Grid lines at 25%, 50%, 75%, 100%
  const gridPaths = [0.25, 0.5, 0.75, 1].map((pct) => {
    const points = PILLAR_ORDER.map((_, i) => getPoint(i, maxScore * pct));
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  });

  return (
    <div className={className}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid */}
        {gridPaths.map((path, i) => (
          <path key={i} d={path} fill="none" stroke="oklch(0.88 0.01 265)" strokeWidth="1" />
        ))}

        {/* Axis lines */}
        {PILLAR_ORDER.map((_, i) => {
          const p = getPoint(i, maxScore);
          return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="oklch(0.88 0.01 265)" strokeWidth="1" />;
        })}

        {/* Data polygon */}
        <path d={dataPath} fill="oklch(0.55 0.25 265 / 0.2)" stroke="oklch(0.55 0.25 265)" strokeWidth="2" />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="oklch(0.55 0.25 265)" />
        ))}

        {/* Labels */}
        {PILLAR_ORDER.map((key, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const labelRadius = radius + 24;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          return (
            <text
              key={key}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-xs font-medium"
            >
              {key.toUpperCase()} ({(scores[key] ?? 0).toFixed(1)})
            </text>
          );
        })}
      </svg>
    </div>
  );
}
