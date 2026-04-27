import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { scoreObject } from "@/server/services/advertis-scorer";
import { classifyBrand } from "@/lib/types/advertis-vector";
import { getAdaptiveQuestions, getBusinessContextQuestions, type IntakeQuestion } from "./question-bank";
import type { BusinessContext, BusinessModelKey, EconomicModelKey, PositioningArchetypeKey, SalesChannel, PremiumScope } from "@/lib/types/business-context";
import { POSITIONING_ARCHETYPES } from "@/lib/types/business-context";

export interface QuickIntakeStartInput {
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  companyName: string;
  sector?: string;
  country?: string;
  businessModel?: string;
  economicModel?: string;
  positioning?: string;
  source?: string;
}

export interface QuickIntakeAdvanceInput {
  token: string;
  responses: Record<string, unknown>;
}

export async function start(input: QuickIntakeStartInput) {
  // Pre-populate biz responses from landing page fields so biz step is skipped
  const prePopulated: Record<string, unknown> = {};
  if (input.businessModel) prePopulated.biz_model = input.businessModel;
  if (input.economicModel) prePopulated.biz_revenue = input.economicModel;
  if (input.positioning) prePopulated.biz_positioning = input.positioning;

  const intake = await db.quickIntake.create({
    data: {
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      companyName: input.companyName,
      sector: input.sector,
      country: input.country,
      businessModel: input.businessModel,
      economicModel: input.economicModel,
      positioning: input.positioning,
      source: input.source,
      responses: (Object.keys(prePopulated).length > 0 ? prePopulated : {}) as Prisma.InputJsonValue,
      status: "IN_PROGRESS",
    },
  });

  const state = deriveState(intake);

  return {
    token: intake.shareToken,
    questions: state.questions,
    currentPillar: state.currentPillar,
    progress: state.progress,
  };
}

export async function getState(token: string) {
  const intake = await db.quickIntake.findUnique({
    where: { shareToken: token },
  });
  if (!intake) throw new Error("Intake not found");
  if (intake.status !== "IN_PROGRESS") {
    return { currentPillar: null, questions: [] as IntakeQuestion[], progress: 1, readyToComplete: false, completed: true };
  }
  return deriveState(intake);
}

function deriveState(intake: { responses: unknown }) {
  const responses = (intake.responses as Record<string, unknown>) ?? {};
  const allSteps = ["biz", "a", "d", "v", "e", "r", "t", "i", "s"];
  const answeredSteps = new Set(
    Object.keys(responses).map((key) => key.split("_")[0])
  );
  const nextPillar = allSteps.find((p) => !answeredSteps.has(p)) ?? null;
  const progress = answeredSteps.size / allSteps.length;

  if (!nextPillar) {
    return { currentPillar: null, questions: [] as IntakeQuestion[], progress: 1, readyToComplete: true, completed: false };
  }

  const questions = getAdaptiveQuestions(nextPillar, responses);
  return { currentPillar: nextPillar, questions, progress, readyToComplete: false, completed: false };
}

export async function advance(input: QuickIntakeAdvanceInput) {
  const intake = await db.quickIntake.findUnique({
    where: { shareToken: input.token },
  });

  if (!intake) throw new Error("Intake not found");
  if (intake.status !== "IN_PROGRESS") throw new Error("Intake already completed");

  // Merge new responses with existing
  const existingResponses = (intake.responses as Record<string, unknown>) ?? {};
  const mergedResponses = { ...existingResponses, ...input.responses };

  // Determine next pillar based on progress (biz first, then ADVE pillars)
  const allSteps = ["biz", "a", "d", "v", "e", "r", "t", "i", "s"];
  const answeredSteps = new Set(
    Object.keys(mergedResponses).map((key) => key.split("_")[0])
  );
  const nextPillar = allSteps.find((p) => !answeredSteps.has(p));
  const progress = answeredSteps.size / allSteps.length;

  // If biz step just completed, persist business context fields on the intake
  if (answeredSteps.has("biz") && mergedResponses.biz_model) {
    const bizModel = extractKeyFromOption(mergedResponses.biz_model as string);
    const bizPositioning = extractKeyFromOption(mergedResponses.biz_positioning as string);
    const bizRevenue = Array.isArray(mergedResponses.biz_revenue)
      ? (mergedResponses.biz_revenue as string[]).map(extractKeyFromOption).join(",")
      : typeof mergedResponses.biz_revenue === "string"
        ? extractKeyFromOption(mergedResponses.biz_revenue)
        : undefined;

    await db.quickIntake.update({
      where: { id: intake.id },
      data: {
        businessModel: bizModel,
        economicModel: bizRevenue,
        positioning: bizPositioning,
      },
    });
  }

  await db.quickIntake.update({
    where: { id: intake.id },
    data: { responses: mergedResponses as Prisma.InputJsonValue },
  });

  if (!nextPillar) {
    // All pillars covered, ready to complete
    return {
      token: input.token,
      questions: [],
      currentPillar: null,
      progress: 1,
      readyToComplete: true,
    };
  }

  const questions = getAdaptiveQuestions(nextPillar, mergedResponses);

  return {
    token: input.token,
    questions,
    currentPillar: nextPillar,
    progress,
    readyToComplete: false,
  };
}

export async function complete(token: string) {
  const intake = await db.quickIntake.findUnique({
    where: { shareToken: token },
  });

  if (!intake) throw new Error("Intake not found");

  // Build BusinessContext from intake responses
  const businessContext = buildBusinessContext(intake);

  // Create a temporary strategy for scoring
  const strategy = await db.strategy.create({
    data: {
      name: `Quick Intake: ${intake.companyName}`,
      description: `Auto-generated from Quick Intake ${intake.id}`,
      userId: "system", // System-generated
      status: "QUICK_INTAKE",
      businessContext: businessContext as unknown as Prisma.InputJsonValue,
    },
  });

  // Populate pillar content from responses
  const responses = intake.responses as Record<string, unknown>;
  const pillars = ["a", "d", "v", "e", "r", "t", "i", "s"];

  for (const pillar of pillars) {
    const pillarResponses: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(responses)) {
      if (key.startsWith(`${pillar}_`)) {
        pillarResponses[key.replace(`${pillar}_`, "")] = value;
      }
    }
    if (Object.keys(pillarResponses).length > 0) {
      await db.pillar.create({
        data: {
          strategyId: strategy.id,
          key: pillar,
          content: pillarResponses as Prisma.InputJsonValue,
          confidence: 0.4, // Low confidence for quick intake
        },
      });
    }
  }

  // Score the strategy
  const vector = await scoreObject("strategy", strategy.id);
  const classification = classifyBrand(vector.composite);

  // Generate diagnostic
  const diagnostic = generateDiagnostic(vector, classification);

  // Update the intake with results
  await db.quickIntake.update({
    where: { id: intake.id },
    data: {
      advertis_vector: vector,
      classification,
      diagnostic,
      convertedToId: strategy.id,
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  return {
    token,
    vector,
    classification,
    diagnostic,
    strategyId: strategy.id,
  };
}

/**
 * Extracts the key portion from "KEY::Label" format options.
 */
function extractKeyFromOption(option: string): string {
  const parts = option.split("::");
  return parts[0] ?? option;
}

/**
 * Builds a BusinessContext from a QuickIntake record's responses and fields.
 */
function buildBusinessContext(
  intake: { businessModel: string | null; economicModel: string | null; positioning: string | null; responses: unknown }
): BusinessContext | null {
  if (!intake.businessModel) return null;

  const responses = (intake.responses ?? {}) as Record<string, unknown>;
  const salesChannelRaw = extractKeyFromOption((responses.biz_sales_channel as string) ?? "HYBRID");
  const premiumScopeRaw = extractKeyFromOption((responses.biz_premium_scope as string) ?? "NONE");
  const freeElementRaw = extractKeyFromOption((responses.biz_free_element as string) ?? "NONE");

  const positioningKey = (intake.positioning ?? "MAINSTREAM") as PositioningArchetypeKey;
  const archetype = POSITIONING_ARCHETYPES[positioningKey];
  const isPositionalGood = archetype?.positionalGood === true;

  const economicModels = intake.economicModel
    ? intake.economicModel.split(",") as EconomicModelKey[]
    : ["VENTE_DIRECTE" as EconomicModelKey];

  const ctx: BusinessContext = {
    businessModel: intake.businessModel as BusinessModelKey,
    economicModels,
    positioningArchetype: positioningKey,
    salesChannel: salesChannelRaw as SalesChannel,
    positionalGoodFlag: isPositionalGood,
    premiumScope: premiumScopeRaw as PremiumScope,
  };

  // Build free layer if applicable
  if (freeElementRaw !== "NONE") {
    const freeDetail = (responses.biz_free_detail as string) ?? "";
    ctx.freeLayer = {
      whatIsFree: freeElementRaw,
      whatIsPaid: freeDetail || "Non précisé",
      conversionLever: freeElementRaw === "FREEMIUM" ? "feature_gate" : freeElementRaw === "CONTENT" ? "content_upsell" : "ad_conversion",
    };
  }

  return ctx;
}

function generateDiagnostic(
  vector: Record<string, number>,
  classification: string
) {
  const pillars = [
    { key: "a", name: "Authenticité", score: vector.a },
    { key: "d", name: "Distinction", score: vector.d },
    { key: "v", name: "Valeur", score: vector.v },
    { key: "e", name: "Engagement", score: vector.e },
    { key: "r", name: "Risk", score: vector.r },
    { key: "t", name: "Track", score: vector.t },
    { key: "i", name: "Implementation", score: vector.i },
    { key: "s", name: "Stratégie", score: vector.s },
  ];

  const sorted = [...pillars].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const strengths = sorted.slice(0, 3).map((p) => p.name);
  const weaknesses = sorted.slice(-3).map((p) => p.name);

  return {
    classification,
    strengths,
    weaknesses,
    summary: `Votre marque est classée "${classification}" avec un score de ${vector.composite}/200. Vos forces sont ${strengths.join(", ")}. Les axes d'amélioration prioritaires sont ${weaknesses.join(", ")}.`,
    recommendations: weaknesses.map((w) => ({
      pillar: w,
      action: `Renforcer le pilier ${w} pour améliorer votre score global.`,
    })),
  };
}
