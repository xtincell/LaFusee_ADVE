/**
 * RTIS Cascade — Mestor-driven pillar actualization
 *
 * Architecture:
 *   ADVE (données brutes, manuelles ou intake)
 *     → R = analyse(ADVE)            → risques, SWOT, mitigations
 *     → T = analyse(ADVE + R)        → triangulation, validation hypothèses
 *     → R + T → recommandations      → actualisent ADVE ↻ (feedback loop)
 *     → I = produit(ADVE, R, T)      → plan d'implémentation
 *     → S = mise en forme(tout)      → synthèse exécutive
 *
 * Chaque pilier peut être actualisé individuellement via Mestor,
 * ou la cascade complète peut être déclenchée.
 */

import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { db } from "@/lib/db";
import type { PillarKey } from "@/lib/types/pillar-schemas";
import { scoreAllPillarsSemantic } from "@/server/services/advertis-scorer/semantic";
import type { Prisma } from "@prisma/client";

const MODEL = "claude-sonnet-4-20250514";

// ── Helpers ────────────────────────────────────────────────────────────────

async function loadPillars(strategyId: string): Promise<Record<string, unknown>> {
  const pillars = await db.pillar.findMany({ where: { strategyId } });
  const map: Record<string, unknown> = {};
  for (const p of pillars) map[p.key.toUpperCase()] = p.content;
  return map;
}

async function savePillar(strategyId: string, key: string, content: Record<string, unknown>, confidence: number) {
  await db.pillar.upsert({
    where: { strategyId_key: { strategyId, key: key.toLowerCase() } },
    update: { content: content as Prisma.InputJsonValue, confidence },
    create: { strategyId, key: key.toLowerCase(), content: content as Prisma.InputJsonValue, confidence },
  });
}

async function recalcScores(strategyId: string) {
  const pillars = await db.pillar.findMany({ where: { strategyId } });
  const result = scoreAllPillarsSemantic(pillars.map((p) => ({ key: p.key, content: p.content })));
  const vec: Record<string, number> = { composite: result.composite };
  for (const ps of result.pillarScores) vec[ps.pillarKey.toLowerCase()] = ps.score;
  await db.strategy.update({ where: { id: strategyId }, data: { advertis_vector: vec as Prisma.InputJsonValue } });
  return result;
}

async function callLLM(system: string, prompt: string, strategyId?: string): Promise<string> {
  const { text, usage } = await generateText({
    model: anthropic(MODEL),
    system,
    prompt,
    maxTokens: 8000,
  });

  // Track cost
  if (strategyId) {
    await db.aICostLog.create({
      data: {
        strategyId,
        provider: "anthropic",
        model: MODEL,
        inputTokens: usage?.promptTokens ?? 0,
        outputTokens: usage?.completionTokens ?? 0,
        cost: ((usage?.promptTokens ?? 0) * 0.003 + (usage?.completionTokens ?? 0) * 0.015) / 1000,
        context: "rtis-cascade",
      },
    }).catch(() => {});
  }

  return text;
}

function extractJSON(text: string): Record<string, unknown> {
  // Try to find JSON block in response
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) ?? text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in LLM response");
  const raw = jsonMatch[1] ?? jsonMatch[0];
  return JSON.parse(raw.trim());
}

function serializePillar(key: string, content: unknown): string {
  if (!content || typeof content !== "object") return `[${key}] Vide`;
  return `[PILIER ${key}]\n${JSON.stringify(content, null, 2)}`;
}

// ── RTIS System Prompts ────────────────────────────────────────────────────

const SYSTEM_BASE = `Tu es Mestor, le moteur d'intelligence stratégique du framework ADVE-RTIS (Authenticité, Distinction, Valeur, Engagement, Risk, Track, Implementation, Synthèse).
Tu analyses les données des piliers de marque et produis des actualisations structurées en JSON.
TOUJOURS répondre en JSON valide uniquement, sans commentaire ni explication autour.`;

const RTIS_PROMPTS: { R: string; T: string; I: string; S: string; ADVE_UPDATE: string } = {
  // R — Risk: analyse les données ADVE pour produire risques, SWOT, mitigations
  R: `${SYSTEM_BASE}

Tu actualises le PILIER R (RISK) à partir de l'analyse des piliers ADVE.

Ton rôle: identifier les risques stratégiques, les forces/faiblesses, les opportunités/menaces.
Analyse les données ADVE fournies et produis un JSON avec ces champs:

{
  "globalSwot": {
    "strengths": ["string 3-5 items, max 200 chars chacun"],
    "weaknesses": ["string 3-5 items"],
    "opportunities": ["string 3-5 items"],
    "threats": ["string 3-5 items"]
  },
  "probabilityImpactMatrix": [
    { "risk": "string", "probability": "LOW|MEDIUM|HIGH", "impact": "LOW|MEDIUM|HIGH", "mitigation": "string 40+ chars" }
  ] (5+ items),
  "mitigationPriorities": [
    { "action": "string 40+ chars", "owner": "string?", "timeline": "string?", "investment": "string?" }
  ] (5+ items),
  "riskScore": number 0-100
}

Base ton analyse sur les DONNÉES RÉELLES des piliers ADVE fournis. Sois spécifique, pas générique.`,

  // T — Track: analyse ADVE + R pour trianguler et valider les hypothèses
  T: `${SYSTEM_BASE}

Tu actualises le PILIER T (TRACK) à partir de l'analyse des piliers ADVE + R.

Ton rôle: trianguler les données marché, valider/invalider les hypothèses, évaluer le brand-market fit.
Utilise les données des piliers ADVE comme source primaire et R comme contexte de risques.

Produis un JSON avec ces champs:

{
  "triangulation": {
    "customerInterviews": "string 100+ chars — synthèse des données clients extraites de ADVE",
    "competitiveAnalysis": "string 100+ chars — analyse concurrentielle déduite de D",
    "trendAnalysis": "string 100+ chars — tendances déduites du positionnement",
    "financialBenchmarks": "string 100+ chars — benchmarks financiers déduits de V"
  },
  "hypothesisValidation": [
    { "hypothesis": "string", "validationMethod": "string", "status": "HYPOTHESIS|TESTING|VALIDATED|INVALIDATED", "evidence": "string?" }
  ] (5+ items),
  "tamSamSom": {
    "tam": { "value": number, "description": "string" },
    "sam": { "value": number, "description": "string" },
    "som": { "value": number, "description": "string" }
  },
  "brandMarketFitScore": number 0-100
}

Base-toi UNIQUEMENT sur les données réelles fournies. Pas d'invention.`,

  // I — Implementation: produit de ADVE + R + T
  I: `${SYSTEM_BASE}

Tu actualises le PILIER I (IMPLEMENTATION) à partir des piliers ADVE, R et T.

Ton rôle: transformer l'analyse stratégique en plan d'action concret.
I est le PRODUIT de ADVE (quoi), R (risques à mitiger), T (validations obtenues).

Produis un JSON avec ces champs:

{
  "sprint90Days": [
    { "action": "string 100+ chars", "owner": "string?", "kpi": "string", "priority": number, "isRiskMitigation": boolean? }
  ] (8+ items),
  "annualCalendar": [
    { "name": "string", "quarter": 1|2|3|4, "objective": "string", "budget": number?, "drivers": ["INSTAGRAM"|"TIKTOK"|"APP"|"EVENT"|"EMAIL"|"WEBSITE"|...] }
  ] (6+ items),
  "globalBudget": number,
  "teamStructure": [
    { "name": "string", "title": "string", "responsibility": "string" }
  ] (3+ items),
  "brandPlatform": {
    "name": "string", "benefit": "string", "target": "string",
    "competitiveAdvantage": "string", "emotionalBenefit": "string",
    "functionalBenefit": "string", "supportedBy": "string"
  },
  "syntheseExecutive": "string 200+ chars — résumé exécutif du plan"
}

Chaque action du sprint doit correspondre à un risque mitigé (R) ou une hypothèse à valider (T) ou un objectif ADVE.`,

  // S — Synthesis: mise en forme de tout
  S: `${SYSTEM_BASE}

Tu actualises le PILIER S (SYNTHÈSE) — la mise en forme stratégique de l'ensemble ADVE-RTIS.

S est le reflet fidèle et structuré de tous les autres piliers.

Produis un JSON avec ces champs:

{
  "syntheseExecutive": "string 400+ chars — résumé exécutif complet de la stratégie",
  "visionStrategique": "string 200+ chars — vision à 3-5 ans",
  "coherencePiliers": [
    { "pilier": "string (ex: A vers D)", "contribution": "string", "articulation": "string" }
  ] (7+ items — couvrir les liens entre piliers),
  "facteursClesSucces": ["string"] (5+ items),
  "recommandationsPrioritaires": [
    { "recommendation": "string", "source": "A|D|V|E|R|T|I", "priority": number }
  ] (8+ items),
  "axesStrategiques": [
    { "axe": "string", "pillarsLinked": ["A"|"D"|"V"|"E"|"R"|"T"|"I"|"S"], "kpis": ["string"] }
  ] (3+ items),
  "sprint90Recap": ["string"] (8+ items),
  "kpiDashboard": [
    { "name": "string", "pillar": "A|D|V|E|R|T|I|S", "target": "string", "frequency": "DAILY|WEEKLY|MONTHLY|QUARTERLY" }
  ] (7+ items),
  "coherenceScore": number 0-100
}

La synthèse doit être FIDÈLE aux données, pas créative. C'est un miroir structuré.`,

  // ADVE actualization: R+T recommendations → update a specific pillar
  ADVE_UPDATE: `${SYSTEM_BASE}

Tu actualises un pilier ADVE spécifique en utilisant les recommandations issues de l'analyse Risk (R) et Track (T).

Le cycle RTIS fonctionne ainsi:
1. R analyse ADVE → identifie risques, forces, faiblesses
2. T analyse ADVE+R → triangule, valide, évalue le fit marché
3. R+T produisent des recommandations
4. Ces recommandations ACTUALISENT les piliers ADVE (c'est ce que tu fais maintenant)

Tu dois:
- Lire le contenu actuel du pilier
- Lire les recommandations R et T
- Produire une version AMÉLIORÉE du pilier qui intègre les insights R+T
- CONSERVER toutes les données existantes — ne supprimer aucun champ
- ENRICHIR avec les recommandations applicables
- Retourner le pilier complet en JSON`,
};

// ── Public API ──────────────────────────────────────────────────────────────

export type ActualizeResult = {
  pillarKey: string;
  updated: boolean;
  scoreResult?: ReturnType<typeof scoreAllPillarsSemantic>;
  error?: string;
};

/**
 * Actualize a single pillar via Mestor.
 * For R/T/I/S: generates from other pillars.
 * For A/D/V/E: enriches from R+T recommendations.
 */
export async function actualizePillar(
  strategyId: string,
  pillarKey: PillarKey,
): Promise<ActualizeResult> {
  try {
    const pillars = await loadPillars(strategyId);

    let newContent: Record<string, unknown>;
    let confidence: number;

    if (pillarKey === "R") {
      // R = analyse(ADVE)
      const adveContext = ["A", "D", "V", "E"]
        .map((k) => serializePillar(k, pillars[k]))
        .join("\n\n");

      const response = await callLLM(
        RTIS_PROMPTS.R,
        `Voici les données ADVE actuelles de la stratégie:\n\n${adveContext}\n\nProduis le pilier R (Risk) en JSON.`,
        strategyId,
      );
      newContent = extractJSON(response);
      confidence = 0.75;

    } else if (pillarKey === "T") {
      // T = analyse(ADVE + R)
      const context = ["A", "D", "V", "E", "R"]
        .map((k) => serializePillar(k, pillars[k]))
        .join("\n\n");

      const response = await callLLM(
        RTIS_PROMPTS.T,
        `Voici les données ADVE + R actuelles:\n\n${context}\n\nProduis le pilier T (Track) en JSON.`,
        strategyId,
      );
      newContent = extractJSON(response);
      confidence = 0.75;

    } else if (pillarKey === "I") {
      // I = produit(ADVE, R, T)
      const context = ["A", "D", "V", "E", "R", "T"]
        .map((k) => serializePillar(k, pillars[k]))
        .join("\n\n");

      const response = await callLLM(
        RTIS_PROMPTS.I,
        `Voici les données ADVE + R + T actuelles:\n\n${context}\n\nProduis le pilier I (Implementation) en JSON.`,
        strategyId,
      );
      newContent = extractJSON(response);
      confidence = 0.70;

    } else if (pillarKey === "S") {
      // S = mise en forme(tout)
      const context = ["A", "D", "V", "E", "R", "T", "I"]
        .map((k) => serializePillar(k, pillars[k]))
        .join("\n\n");

      const response = await callLLM(
        RTIS_PROMPTS.S,
        `Voici les 7 piliers ADVE-RTI actuels:\n\n${context}\n\nProduis le pilier S (Synthèse) en JSON.`,
        strategyId,
      );
      newContent = extractJSON(response);
      confidence = 0.70;

    } else {
      // A, D, V, E — enrichissement via recommandations R+T
      const currentContent = (pillars[pillarKey] ?? {}) as Record<string, unknown>;
      const rContent = pillars["R"] as Record<string, unknown> | undefined;
      const tContent = pillars["T"] as Record<string, unknown> | undefined;

      if (!rContent && !tContent) {
        return { pillarKey, updated: false, error: "R et T sont vides — lancez d'abord la cascade R→T avant d'actualiser ADVE." };
      }

      const prompt = `Voici le pilier ${pillarKey} actuel:
${serializePillar(pillarKey, currentContent)}

Voici les recommandations du pilier R (Risk):
${rContent ? JSON.stringify(rContent, null, 2) : "Non disponible"}

Voici les recommandations du pilier T (Track):
${tContent ? JSON.stringify(tContent, null, 2) : "Non disponible"}

Actualise le pilier ${pillarKey} en intégrant les insights de R et T.
CONSERVE toutes les données existantes. ENRICHIS avec les recommandations applicables.
Retourne le pilier ${pillarKey} complet en JSON.`;

      const response = await callLLM(RTIS_PROMPTS.ADVE_UPDATE, prompt, strategyId);
      const generated = extractJSON(response);

      // Merge: keep existing, overlay AI-generated
      newContent = { ...currentContent, ...generated };
      confidence = 0.65;
    }

    // Save
    await savePillar(strategyId, pillarKey, newContent, confidence);

    // Recalc scores
    const scoreResult = await recalcScores(strategyId);

    return { pillarKey, updated: true, scoreResult };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { pillarKey, updated: false, error: msg };
  }
}

/**
 * Run the full RTIS cascade:
 * 1. R = analyse(ADVE)
 * 2. T = analyse(ADVE + R)
 * 3. R+T → update ADVE (feedback loop, optional)
 * 4. I = produit(ADVE, R, T)
 * 5. S = mise en forme(tout)
 */
export async function runRTISCascade(
  strategyId: string,
  options: { updateADVE?: boolean; skipT?: boolean } = {},
): Promise<{
  results: ActualizeResult[];
  finalScore?: ReturnType<typeof scoreAllPillarsSemantic>;
}> {
  const results: ActualizeResult[] = [];

  // Step 1: R = analyse(ADVE) — toujours exécuté
  const rResult = await actualizePillar(strategyId, "R");
  results.push(rResult);
  if (!rResult.updated) return { results };

  // Step 2: T = analyse(ADVE + R) — FACULTATIF
  if (!options.skipT) {
    const tResult = await actualizePillar(strategyId, "T");
    results.push(tResult);
    // T peut échouer sans bloquer la cascade — R seul suffit pour les recos
  }

  // Step 3 (optional): R(+T) → update ADVE feedback loop
  if (options.updateADVE) {
    for (const key of ["A", "D", "V", "E"] as PillarKey[]) {
      const adveResult = await actualizePillar(strategyId, key);
      results.push(adveResult);
    }
  }

  // Step 4: I = produit(ADVE, R, T si disponible)
  const iResult = await actualizePillar(strategyId, "I");
  results.push(iResult);

  // Step 5: S = mise en forme(tout)
  const sResult = await actualizePillar(strategyId, "S");
  results.push(sResult);

  // Final score
  const finalScore = await recalcScores(strategyId);

  return { results, finalScore };
}
