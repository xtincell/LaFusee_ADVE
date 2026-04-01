// ============================================================================
// MODULE M06 — ARTEMIS Frameworks (24 frameworks)
// Score: 80/100 | Priority: P1 | Status: FUNCTIONAL
// Spec: Annexe D §D.1 + §6.4 | Division: L'Oracle (ARTEMIS)
// ============================================================================
//
// CdC REQUIREMENTS (V1):
// [x] REQ-1  24 frameworks en 9 couches (Philosophie→Identité→Valeur→Expérience→Validation→Exécution→Mesure→Croissance→Survie)
// [x] REQ-2  4 modes d'exécution: théorique, calcul (sync), IA (async), hybride
// [x] REQ-3  execute(frameworkId, strategyId) → FrameworkResult with JSON output
// [x] REQ-4  list, getById, getByPillar, getResults
// [x] REQ-5  Quality gates (validation pre-execution)
// [x] REQ-6  Score ARTEMIS global (% d'implémentations fraîches)
// [ ] REQ-7  Diagnostic engine: sélection auto des frameworks par symptôme (Module M22)
// [ ] REQ-8  Tri topologique des dépendances inter-frameworks
// [ ] REQ-9  Exécution en batterie (run multiple frameworks, structured report)
// [ ] REQ-10 Tag chaque framework par pilier(s) ADVE (CdC §3.2)
// [ ] REQ-11 Diagnostic différentiel (compare frameworks results to isolate root cause)
//
// PROCEDURES: list, getById, execute, getResults, getByStrategy, getScore
// ============================================================================

/**
 * ARTEMIS Framework Router — 24 diagnostic frameworks
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";
import * as artemis from "@/server/services/artemis";

export const frameworkRouter = createTRPCRouter({
  list: protectedProcedure.query(() => {
    return artemis.FRAMEWORKS.map((f) => ({
      slug: f.slug,
      name: f.name,
      layer: f.layer,
      pillarKeys: f.pillarKeys,
      dependencies: f.dependencies,
      description: f.description,
    }));
  }),

  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => {
      const fw = artemis.getFramework(input.slug);
      if (!fw) throw new Error(`Framework inconnu: ${input.slug}`);
      return fw;
    }),

  getByLayer: protectedProcedure
    .input(z.object({ layer: z.string() }))
    .query(({ input }) => artemis.getFrameworksByLayer(input.layer as never)),

  getByPillar: protectedProcedure
    .input(z.object({ pillarKey: z.string() }))
    .query(({ input }) => artemis.getFrameworksByPillar(input.pillarKey)),

  execute: protectedProcedure
    .input(z.object({
      frameworkSlug: z.string(),
      strategyId: z.string(),
      input: z.record(z.unknown()),
    }))
    .mutation(async ({ input }) => {
      return artemis.executeFramework(input.frameworkSlug, input.strategyId, input.input as Record<string, unknown>);
    }),

  runBatch: adminProcedure
    .input(z.object({
      strategyId: z.string(),
      frameworkSlugs: z.array(z.string()),
      inputs: z.record(z.record(z.unknown())),
    }))
    .mutation(async ({ input }) => {
      return artemis.runDiagnosticBatch(input.strategyId, input.frameworkSlugs, input.inputs as Record<string, Record<string, unknown>>);
    }),

  runPillarDiagnostic: protectedProcedure
    .input(z.object({ strategyId: z.string(), pillarKey: z.string(), inputs: z.record(z.record(z.unknown())) }))
    .mutation(async ({ input }) => {
      return artemis.runPillarDiagnostic(input.strategyId, input.pillarKey, input.inputs as Record<string, Record<string, unknown>>);
    }),

  history: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(({ input }) => artemis.getDiagnosticHistory(input.strategyId)),

  differential: protectedProcedure
    .input(z.object({ strategyId: z.string(), fromDate: z.date(), toDate: z.date() }))
    .query(({ input }) => artemis.differentialDiagnosis(input.strategyId, input.fromDate, input.toDate)),

  getDependencyOrder: protectedProcedure
    .input(z.object({ slugs: z.array(z.string()) }))
    .query(({ input }) => artemis.topologicalSort(input.slugs)),
});
