import { db } from "@/lib/db";

export interface TranslationRequest {
  driverId: string;
  sourceMarket: string;
  targetMarket: string;
  content: Record<string, unknown>;
}

export interface TranslationResult {
  driverId: string;
  sourceMarket: string;
  targetMarket: string;
  translatedContent: Record<string, unknown>;
  culturalAdaptations: string[];
  confidence: number;
}

/**
 * Translate and culturally adapt Driver content for a different market.
 * Connects to FW-15 Cultural Expansion framework.
 */
export async function translateForMarket(request: TranslationRequest): Promise<TranslationResult> {
  const driver = await db.driver.findUniqueOrThrow({
    where: { id: request.driverId },
    include: { strategy: true },
  });

  // Cultural adaptation rules by market pair
  const adaptations = getCulturalAdaptations(request.sourceMarket, request.targetMarket, driver.channel);

  // TODO: Wire to AI for actual translation + cultural adaptation
  // For now, return the content with adaptation notes

  return {
    driverId: request.driverId,
    sourceMarket: request.sourceMarket,
    targetMarket: request.targetMarket,
    translatedContent: {
      ...request.content,
      _targetMarket: request.targetMarket,
      _adaptationNotes: adaptations,
    },
    culturalAdaptations: adaptations,
    confidence: 0.7, // Will increase when AI is wired
  };
}

/**
 * Get list of markets a Driver could be adapted for.
 */
export async function getAvailableMarkets(driverId: string): Promise<string[]> {
  const driver = await db.driver.findUniqueOrThrow({ where: { id: driverId } });
  const meta = driver.constraints as Record<string, unknown> | null;
  const currentMarket = (meta?.market as string) ?? "CM";

  const allMarkets = ["CM", "CI", "SN", "GA", "CG", "CD", "BF", "ML", "BJ", "TG"];
  return allMarkets.filter((m) => m !== currentMarket);
}

function getCulturalAdaptations(source: string, target: string, channel: string): string[] {
  const adaptations: string[] = [];

  // Language adaptations
  if (source === "CM" && target === "CI") {
    adaptations.push("Adapter le vocabulaire: 'garba' → 'attiéké', contexte culinaire local");
    adaptations.push("Références sportives: remplacer Lions Indomptables par Éléphants");
  }
  if (source === "CM" && target === "SN") {
    adaptations.push("Adapter le ton: le marché sénégalais préfère un ton plus sobre");
    adaptations.push("Wolof expressions may be needed for social channels");
  }

  // Channel-specific adaptations
  if (channel === "INSTAGRAM" || channel === "TIKTOK") {
    adaptations.push("Adapter les hashtags populaires au marché cible");
    adaptations.push("Vérifier les heures de pic d'engagement dans le fuseau horaire cible");
  }
  if (channel === "PR") {
    adaptations.push("Identifier les médias locaux pertinents dans le marché cible");
    adaptations.push("Adapter le format du communiqué aux conventions locales");
  }
  if (channel === "EVENT") {
    adaptations.push("Vérifier les jours fériés et dates culturelles du marché cible");
  }

  if (adaptations.length === 0) {
    adaptations.push("Adaptation linguistique standard");
    adaptations.push("Vérifier la pertinence des visuels pour le marché cible");
  }

  return adaptations;
}
