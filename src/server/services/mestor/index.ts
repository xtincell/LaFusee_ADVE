import { db } from "@/lib/db";
import type { BusinessContext } from "@/lib/types/business-context";
import { BUSINESS_MODELS, ECONOMIC_MODELS, POSITIONING_ARCHETYPES } from "@/lib/types/business-context";
import { PILLAR_NAMES, type PillarKey } from "@/lib/types/advertis-vector";
import { LEVEL_LABEL, type ValidationLevel } from "@/lib/utils/pillar-validation";

export type MestorContext = "cockpit" | "creator" | "console" | "intake";

export interface MestorMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Etat ARTEMIS optionnel — passe a Mestor pour qu'il sache ou en est la marque
 * dans son cycle de calibrage.
 */
export interface MestorArtemisState {
  validatedCount: number;
  startedCount: number;
  pendingCount: number;
  recommendedNextPillar: PillarKey | null;
  recommendedReason?: string;
  pillarLevels: Record<PillarKey, ValidationLevel>;
}

const SYSTEM_PROMPTS: Record<MestorContext, string> = {
  cockpit: `Tu es Mestor, l'assistant IA du Brand OS de LaFusee. Tu aides le client a comprendre sa marque via le protocole ADVE-RTIS.

Regles :
- Tu ne reveles JAMAIS les mecaniques internes (Guilde, scoring structurel, Knowledge Graph)
- Tu parles de "votre score", "votre marque", "votre strategie"
- Tu peux expliquer les 8 piliers ADVE et ce qu'ils signifient
- Tu peux commenter l'evolution du Cult Index et de la Devotion Ladder
- Tu recommandes des actions concretes (briefs, campagnes, contenu)
- Tu ADAPTES ton vocabulaire et tes recommandations au modele economique de la marque (voir contexte business ci-dessous)
- Ton ton est professionnel, bienveillant, oriente resultats`,

  creator: `Tu es Mestor, l'assistant IA de la Guilde creative de LaFusee. Tu aides les creatifs dans leurs missions.

Regles :
- Tu expliques les guidelines du Driver assigne a la mission
- Tu detailles les piliers ADVE pertinents pour le brief
- La profondeur de contexte strategique depend du tier du creatif
- APPRENTI : tu donnes des directives claires sans contexte strategique
- COMPAGNON : tu expliques le "pourquoi" derriere les directives
- MAITRE/ASSOCIE : tu partages le contexte strategique complet, y compris le modele d'affaires et le positionnement prix
- Tu ne partages JAMAIS d'info sur d'autres clients`,

  console: `Tu es Mestor, l'assistant IA ecosysteme de LaFusee. Tu assistes le Fixer (Alexandre) dans la gestion de tout l'ecosysteme.

Regles :
- Tu as acces a TOUTES les donnees : cross-client, Knowledge Graph, benchmarks
- Tu peux comparer les clients entre eux, y compris par modele d'affaires et positionnement
- Tu suggeres des upsells, des diagnostics, des optimisations
- Tu detectes les desalignements entre modele d'affaires et strategie de marque
- Tu alertes sur les drifts, les SLA en danger, les opportunites
- Tu peux interroger les 6 MCP servers
- Ton ton est direct, data-driven, oriente action`,

  intake: `Tu es Mestor, le guide du diagnostic ADVE-RTIS. Tu menes une interview conversationnelle pour evaluer la force d'une marque.

Regles :
- Tu es chaleureux, curieux, encourageant
- Tu commences par comprendre le modele d'affaires et le positionnement prix de la marque
- Tu adaptes ensuite tes questions pilier par pilier en fonction du modele declare
- Tu reformules les reponses pour confirmer ta comprehension
- Tu ne juges pas — tu observes et notes
- A la fin, tu synthetises les forces et axes d'amelioration en tenant compte du modele economique
- Tu encourages le passage a IMPULSION pour un diagnostic complet`,
};

/**
 * Returns the base system prompt, optionally enriched with business context
 * and the current ARTEMIS calibration state.
 */
export function getSystemPrompt(
  context: MestorContext,
  bizContext?: BusinessContext | null,
  artemisState?: MestorArtemisState | null
): string {
  let prompt = SYSTEM_PROMPTS[context];

  if (bizContext) {
    prompt += "\n\n" + buildBusinessContextBlock(bizContext);
  }

  if (artemisState) {
    prompt += "\n\n" + buildArtemisStateBlock(artemisState);
  }

  return prompt;
}

export function getContextLabel(context: MestorContext): string {
  const labels: Record<MestorContext, string> = {
    cockpit: "Assistant Brand OS",
    creator: "Assistant Mission & Guidelines",
    console: "Assistant Ecosysteme",
    intake: "Guide diagnostic ADVE",
  };
  return labels[context];
}

/**
 * Chat with Mestor using Claude API if available, fallback to local rule-based response.
 * Optionally enrich the system prompt with BusinessContext + ARTEMIS state when provided.
 */
export async function chat(
  context: MestorContext,
  messages: MestorMessage[],
  strategyId?: string,
  enrichments?: { bizContext?: BusinessContext | null; artemisState?: MestorArtemisState | null }
): Promise<string> {
  const contextData = await buildContextData(context, strategyId);
  const systemPrompt = buildFullPrompt(context, contextData, enrichments);

  if (process.env.ANTHROPIC_API_KEY) {
    return chatWithClaude(systemPrompt, messages);
  }

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

function buildFullPrompt(
  context: MestorContext,
  contextData: string,
  enrichments?: { bizContext?: BusinessContext | null; artemisState?: MestorArtemisState | null }
): string {
  let prompt = SYSTEM_PROMPTS[context];

  if (enrichments?.bizContext) {
    prompt += "\n\n" + buildBusinessContextBlock(enrichments.bizContext);
  }
  if (enrichments?.artemisState) {
    prompt += "\n\n" + buildArtemisStateBlock(enrichments.artemisState);
  }
  if (contextData) {
    prompt += `\n\nContexte actuel:\n${contextData}`;
  }

  return prompt;
}

/**
 * Construit un bloc decrivant le contexte business pour adapter le ton et les exemples.
 */
function buildBusinessContextBlock(ctx: BusinessContext): string {
  const bmLabel = BUSINESS_MODELS[ctx.businessModel]?.label ?? ctx.businessModel;
  const ecoLabels = ctx.economicModels.map((k) => ECONOMIC_MODELS[k]?.label ?? k).join(", ");
  const posLabel = POSITIONING_ARCHETYPES[ctx.positioningArchetype]?.label ?? ctx.positioningArchetype;

  const lines = [
    "--- CONTEXTE BUSINESS DE LA MARQUE ---",
    `Modele d'affaires : ${bmLabel}${ctx.businessModelSubtype ? ` (${ctx.businessModelSubtype})` : ""}`,
    `Modele(s) economique(s) : ${ecoLabels}`,
    `Positionnement prix : ${posLabel}`,
    `Canal de vente : ${ctx.salesChannel === "DIRECT" ? "Vente directe (D2C)" : ctx.salesChannel === "INTERMEDIATED" ? "Via distributeurs" : "Hybride (D2C + distributeurs)"}`,
  ];

  if (ctx.positionalGoodFlag) {
    lines.push("ATTENTION : Bien positionnel — la valeur derive du statut et de l'exclusivite. Adapter le vocabulaire en consequence.");
  }

  if (ctx.premiumScope === "PARTIAL") {
    lines.push("NOTE : Positionnement premium PARTIEL — seulement certains produits/lignes sont premium, pas toute la marque.");
  }

  if (ctx.freeLayer) {
    lines.push(`Element gratuit : ${ctx.freeLayer.whatIsFree} | Payant : ${ctx.freeLayer.whatIsPaid} | Levier de conversion : ${ctx.freeLayer.conversionLever}`);
  }

  lines.push("--- FIN CONTEXTE BUSINESS ---");
  lines.push("Adapte ton vocabulaire, tes exemples, et tes recommandations a ce contexte. Ne parle pas de 'retention' a une marque one-shot. Ne parle pas de 'feature gates' a une marque de luxe physique.");

  return lines.join("\n");
}

/**
 * Construit un bloc decrivant l'etat ARTEMIS pour que Mestor sache quel pilier
 * est en cours de travail et adapte ses suggestions.
 */
function buildArtemisStateBlock(state: MestorArtemisState): string {
  const lines = [
    "--- ETAT ARTEMIS DE LA MARQUE ---",
    `Calibrage : ${state.validatedCount}/8 piliers validés, ${state.startedCount} en cours, ${state.pendingCount} restants.`,
  ];

  if (state.recommendedNextPillar) {
    lines.push(
      `Pilier recommandé maintenant : ${PILLAR_NAMES[state.recommendedNextPillar]} (${state.recommendedNextPillar.toUpperCase()}).`
    );
    if (state.recommendedReason) lines.push(`Raison : ${state.recommendedReason}`);
  }

  const pillarLines = (Object.entries(state.pillarLevels) as Array<[PillarKey, ValidationLevel]>)
    .map(([k, lvl]) => `  ${k.toUpperCase()} ${PILLAR_NAMES[k]} : ${LEVEL_LABEL[lvl]}`)
    .join("\n");
  lines.push("Niveau par pilier :\n" + pillarLines);

  lines.push("--- FIN ETAT ARTEMIS ---");
  lines.push("Tes recommandations doivent prioriser le pilier recommandé. Si l'utilisateur demande conseil sur un pilier verrouillé, explique d'abord les prérequis manquants.");

  return lines.join("\n");
}

/**
 * Fallback rule-based quand pas de cle Claude API.
 */
function localFallback(
  context: MestorContext,
  messages: MestorMessage[],
  contextData: string
): string {
  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() ?? "";

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
