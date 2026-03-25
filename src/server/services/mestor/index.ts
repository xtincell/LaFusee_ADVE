import { db } from "@/lib/db";

export type MestorContext = "cockpit" | "creator" | "console" | "intake";

export interface MestorMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const SYSTEM_PROMPTS: Record<MestorContext, string> = {
  cockpit: `Tu es Mestor, l'assistant IA du Brand OS de LaFusée. Tu aides le client à comprendre sa marque via le protocole ADVE-RTIS.

Règles :
- Tu ne révèles JAMAIS les mécaniques internes (Guilde, scoring structurel, Knowledge Graph)
- Tu parles de "votre score", "votre marque", "votre stratégie"
- Tu peux expliquer les 8 piliers ADVE et ce qu'ils signifient
- Tu peux commenter l'évolution du Cult Index et de la Devotion Ladder
- Tu recommandes des actions concrètes (briefs, campagnes, contenu)
- Ton ton est professionnel, bienveillant, orienté résultats`,

  creator: `Tu es Mestor, l'assistant IA de la Guilde créative de LaFusée. Tu aides les créatifs dans leurs missions.

Règles :
- Tu expliques les guidelines du Driver assigné à la mission
- Tu détailles les piliers ADVE pertinents pour le brief
- La profondeur de contexte stratégique dépend du tier du créatif
- APPRENTI : tu donnes des directives claires sans contexte stratégique
- COMPAGNON : tu expliques le "pourquoi" derrière les directives
- MAITRE/ASSOCIE : tu partages le contexte stratégique complet
- Tu ne partages JAMAIS d'info sur d'autres clients`,

  console: `Tu es Mestor, l'assistant IA écosystème de LaFusée. Tu assistes le Fixer (Alexandre) dans la gestion de tout l'écosystème.

Règles :
- Tu as accès à TOUTES les données : cross-client, Knowledge Graph, benchmarks
- Tu peux comparer les clients entre eux
- Tu suggères des upsells, des diagnostics, des optimisations
- Tu alertes sur les drifts, les SLA en danger, les opportunités
- Tu peux interroger les 6 MCP servers
- Ton ton est direct, data-driven, orienté action`,

  intake: `Tu es Mestor, le guide du diagnostic ADVE-RTIS. Tu mènes une interview conversationnelle pour évaluer la force d'une marque.

Règles :
- Tu es chaleureux, curieux, encourageant
- Tu poses des questions ouvertes pilier par pilier
- Tu reformules les réponses pour confirmer ta compréhension
- Tu ne juges pas — tu observes et notes
- À la fin, tu synthétises les forces et axes d'amélioration
- Tu encourages le passage à IMPULSION pour un diagnostic complet`,
};

export function getSystemPrompt(context: MestorContext): string {
  return SYSTEM_PROMPTS[context];
}

export function getContextLabel(context: MestorContext): string {
  const labels: Record<MestorContext, string> = {
    cockpit: "Assistant Brand OS",
    creator: "Assistant Mission & Guidelines",
    console: "Assistant Écosystème",
    intake: "Guide diagnostic ADVE",
  };
  return labels[context];
}

/**
 * Chat with Mestor using Claude API if available, fallback to local.
 */
export async function chat(
  context: MestorContext,
  messages: MestorMessage[],
  strategyId?: string
): Promise<string> {
  // Build context data for the conversation
  const contextData = await buildContextData(context, strategyId);
  const systemPrompt = buildFullPrompt(context, contextData);

  // Try Claude API first
  if (process.env.ANTHROPIC_API_KEY) {
    return chatWithClaude(systemPrompt, messages);
  }

  // Fallback: local rule-based response
  return localFallback(context, messages, contextData);
}

async function chatWithClaude(systemPrompt: string, messages: MestorMessage[]): Promise<string> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role === "system" ? "user" : m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Claude API error:", error);
      return "Je rencontre un problème technique. Réessayez dans un instant.";
    }

    const data = await response.json();
    return data.content?.[0]?.text ?? "Je n'ai pas pu générer de réponse.";
  } catch (error) {
    console.error("Mestor Claude API error:", error);
    return "Mestor est temporairement indisponible. Réessayez dans un instant.";
  }
}

async function buildContextData(
  context: MestorContext,
  strategyId?: string
): Promise<string> {
  const parts: string[] = [];

  if (strategyId && (context === "cockpit" || context === "console")) {
    const strategy = await db.strategy.findUnique({
      where: { id: strategyId },
      include: { pillars: true, drivers: { where: { deletedAt: null } } },
    });

    if (strategy) {
      const vector = strategy.advertis_vector as Record<string, number> | null;
      parts.push(`Marque: ${strategy.name}`);
      if (vector) {
        parts.push(`Score ADVE: ${vector.composite ?? 0}/200 (confidence: ${vector.confidence ?? 0})`);
        parts.push(`Piliers: A=${vector.a ?? 0}, D=${vector.d ?? 0}, V=${vector.v ?? 0}, E=${vector.e ?? 0}, R=${vector.r ?? 0}, T=${vector.t ?? 0}, I=${vector.i ?? 0}, S=${vector.s ?? 0}`);
      }
      parts.push(`Drivers actifs: ${strategy.drivers.map((d) => d.name).join(", ") || "aucun"}`);
    }
  }

  if (context === "console") {
    const [strategyCount, missionCount, talentCount] = await Promise.all([
      db.strategy.count({ where: { status: "ACTIVE" } }),
      db.mission.count({ where: { status: { in: ["DRAFT", "IN_PROGRESS"] } } }),
      db.talentProfile.count(),
    ]);
    parts.push(`Écosystème: ${strategyCount} clients actifs, ${missionCount} missions en cours, ${talentCount} créatifs`);
  }

  return parts.join("\n");
}

function buildFullPrompt(context: MestorContext, contextData: string): string {
  let prompt = SYSTEM_PROMPTS[context];
  if (contextData) {
    prompt += `\n\nContexte actuel:\n${contextData}`;
  }
  return prompt;
}

function localFallback(
  context: MestorContext,
  messages: MestorMessage[],
  contextData: string
): string {
  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() ?? "";

  // Simple keyword-based responses
  if (lastMessage.includes("score") || lastMessage.includes("adve")) {
    if (contextData.includes("Score ADVE")) {
      const match = contextData.match(/Score ADVE: (\d+)\/200/);
      return `Votre score ADVE-RTIS actuel est de ${match?.[1] ?? "—"}/200. Ce score reflète la force globale de votre marque sur les 8 piliers du protocole. Souhaitez-vous que je détaille un pilier en particulier ?`;
    }
    return "Le score ADVE-RTIS mesure la force de votre marque sur 8 dimensions : Authenticité, Distinction, Valeur, Engagement, Risk, Track, Implementation et Stratégie. Chaque pilier vaut /25, pour un total de /200. Souhaitez-vous en savoir plus sur un pilier spécifique ?";
  }

  if (lastMessage.includes("pilier") || lastMessage.includes("pillar")) {
    return "Les 8 piliers ADVE-RTIS sont :\n- **A** (Authenticité) : Votre identité, vision, mission\n- **D** (Distinction) : Ce qui vous différencie\n- **V** (Valeur) : Votre promesse au monde\n- **E** (Engagement) : La dévotion de votre audience\n- **R** (Risk) : Vos angles morts\n- **T** (Track) : Comment vous mesurez le succès\n- **I** (Implementation) : De la stratégie à l'action\n- **S** (Stratégie) : La cohérence d'ensemble\n\nQuel pilier souhaitez-vous explorer ?";
  }

  if (lastMessage.includes("devotion") || lastMessage.includes("ladder")) {
    return "La Devotion Ladder mesure l'attachement de votre audience en 6 niveaux : Spectateur → Intéressé → Participant → Engagé → Ambassadeur → Évangéliste. L'objectif est de faire monter vos audiences dans l'échelle. Voulez-vous voir la distribution actuelle ?";
  }

  if (lastMessage.includes("brief") || lastMessage.includes("mission")) {
    return "Pour créer un brief efficace, je recommande de commencer par identifier les 2-3 piliers ADVE prioritaires pour cette mission. Le Driver assigné détermine les specs techniques et les critères QC. Souhaitez-vous que je vous aide à rédiger un brief ?";
  }

  if (lastMessage.includes("bonjour") || lastMessage.includes("salut") || lastMessage.includes("hello")) {
    const greetings: Record<MestorContext, string> = {
      cockpit: "Bonjour ! Je suis Mestor, votre assistant Brand OS. Comment puis-je vous aider avec votre marque aujourd'hui ?",
      creator: "Salut ! Je suis Mestor, ton assistant dans la Guilde. Besoin d'aide avec une mission ou un brief ?",
      console: "Bonjour Alexandre. Mestor à votre service. Que voulez-vous regarder dans l'écosystème ?",
      intake: "Bienvenue ! Je suis Mestor, votre guide pour le diagnostic de marque. Prêt à commencer ?",
    };
    return greetings[context];
  }

  const defaults: Record<MestorContext, string> = {
    cockpit: "Je suis là pour vous aider à comprendre et renforcer votre marque. Vous pouvez me poser des questions sur votre score ADVE, vos piliers, votre Devotion Ladder, ou demander des recommandations. Que souhaitez-vous explorer ?",
    creator: "Je peux t'aider avec tes missions, t'expliquer les guidelines d'un Driver, ou te guider dans le processus QC. Qu'est-ce que tu as besoin ?",
    console: "Je peux analyser l'écosystème, comparer les clients, détecter des opportunités d'upsell, ou vous alerter sur des drifts. Que voulez-vous voir ?",
    intake: "Je suis là pour évaluer la force de votre marque. Commençons par une question simple : quelle est l'histoire de votre marque ?",
  };

  return defaults[context];
}
