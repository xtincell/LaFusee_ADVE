interface CultIndexProps {
  score: number; // 0-100
  trend?: "up" | "down" | "stable";
  className?: string;
}

export function CultIndex({ score, trend, className }: CultIndexProps) {
  const getColor = (s: number) => {
    if (s >= 80) return "text-purple-600";
    if (s >= 60) return "text-blue-600";
    if (s >= 40) return "text-sky-600";
    if (s >= 20) return "text-yellow-600";
    return "text-gray-500";
  };

  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  const trendColor = trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground";

  return (
    <div className={`flex items-baseline gap-2 ${className ?? ""}`}>
      <span className={`text-4xl font-bold ${getColor(score)}`}>{score}</span>
      <span className="text-lg text-muted-foreground">/100</span>
      {trend && <span className={`text-lg ${trendColor}`}>{trendIcon}</span>}
    </div>
  );
}
