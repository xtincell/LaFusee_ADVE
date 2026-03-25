import { classifyBrand, type BrandClassification } from "@/lib/types/advertis-vector";

interface ScoreBadgeProps {
  score: number;
  maxScore?: number;
  showClassification?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const CLASSIFICATION_COLORS: Record<BrandClassification, string> = {
  ZOMBIE: "bg-gray-200 text-gray-700",
  ORDINAIRE: "bg-yellow-100 text-yellow-800",
  FORTE: "bg-blue-100 text-blue-800",
  CULTE: "bg-purple-100 text-purple-800",
  ICONE: "bg-amber-100 text-amber-800",
};

const CLASSIFICATION_LABELS: Record<BrandClassification, string> = {
  ZOMBIE: "Zombie",
  ORDINAIRE: "Ordinaire",
  FORTE: "Forte",
  CULTE: "Culte",
  ICONE: "Icône",
};

const SIZE_CLASSES = {
  sm: "text-lg",
  md: "text-3xl",
  lg: "text-5xl",
};

export function ScoreBadge({ score, maxScore = 200, showClassification = true, size = "md", className }: ScoreBadgeProps) {
  const classification = classifyBrand(score);

  return (
    <div className={`flex flex-col items-center gap-1 ${className ?? ""}`}>
      <span className={`font-bold ${SIZE_CLASSES[size]}`}>
        {score.toFixed(0)}
        <span className="text-muted-foreground font-normal">/{maxScore}</span>
      </span>
      {showClassification && (
        <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${CLASSIFICATION_COLORS[classification]}`}>
          {CLASSIFICATION_LABELS[classification]}
        </span>
      )}
    </div>
  );
}
