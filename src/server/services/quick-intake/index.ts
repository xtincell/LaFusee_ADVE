import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { scoreObject } from "@/server/services/advertis-scorer";
import { classifyBrand } from "@/lib/types/advertis-vector";
import { getAdaptiveQuestions } from "./question-bank";

export interface QuickIntakeStartInput {
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  companyName: string;
  sector?: string;
  country?: string;
  source?: string;
}

export interface QuickIntakeAdvanceInput {
  token: string;
  responses: Record<string, unknown>;
}

export async function start(input: QuickIntakeStartInput) {
  const intake = await db.quickIntake.create({
    data: {
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      companyName: input.companyName,
      sector: input.sector,
      country: input.country,
      source: input.source,
      responses: {} as Prisma.InputJsonValue,
      status: "IN_PROGRESS",
    },
  });

  const firstQuestions = getAdaptiveQuestions("a", {});

  return {
    token: intake.shareToken,
    questions: firstQuestions,
    currentPillar: "a",
    progress: 0,
  };
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

  // Determine next pillar based on progress
  const pillars = ["a", "d", "v", "e", "r", "t", "i", "s"];
  const answeredPillars = new Set(
    Object.keys(mergedResponses).map((key) => key.split("_")[0])
  );
  const nextPillar = pillars.find((p) => !answeredPillars.has(p));
  const progress = answeredPillars.size / pillars.length;

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

  // Create a temporary strategy for scoring
  const strategy = await db.strategy.create({
    data: {
      name: `Quick Intake: ${intake.companyName}`,
      description: `Auto-generated from Quick Intake ${intake.id}`,
      userId: "system", // System-generated
      status: "QUICK_INTAKE",
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
