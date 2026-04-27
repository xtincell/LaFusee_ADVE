import type { PillarKey } from "@/lib/types/advertis-vector";
import type { BusinessContext, BusinessModelKey } from "@/lib/types/business-context";
import type { NotoriaPillarFill, NotoriaSeed } from "./templates";

// ============================================================================
// PILIER R — Risk
// ----------------------------------------------------------------------------
// Derive depuis le contenu ADVE deja rempli + le contexte business.
// R reagit a l'interne (ADVE).
// ============================================================================

export interface ADVEContent {
  a: Record<string, unknown>;
  d: Record<string, unknown>;
  v: Record<string, unknown>;
  e: Record<string, unknown>;
}

export function fillRisk(seed: NotoriaSeed, adve: ADVEContent): NotoriaPillarFill {
  const ctx = seed.bizContext;
  const content: Record<string, unknown> = {};
  const derivedFrom: string[] = [];

  const swotStrengths: string[] = [];
  const swotWeaknesses: string[] = [];
  const swotOpportunities: string[] = [];
  const swotThreats: string[] = [];

  // STRENGTHS — from ADVE filled fields
  if (adve.a.archetype) swotStrengths.push(`Archetype clair (${adve.a.archetype})`);
  if (adve.d.positioning) swotStrengths.push(`Positionnement formule`);
  if (adve.v.products && Array.isArray(adve.v.products) && adve.v.products.length > 1) {
    swotStrengths.push(`Portefeuille produits diversifie (${(adve.v.products as string[]).length} items)`);
  }
  if (adve.e.community === "Communaute engagee et fidele" || adve.e.community === "Tribu cultuelle") {
    swotStrengths.push("Communaute deja active");
  }
  derivedFrom.push("derived.strengths_from_adve");

  // WEAKNESSES — from ADVE gaps
  if (!adve.a.values) swotWeaknesses.push("Valeurs de marque non explicitees");
  if (!adve.d.visual || adve.d.visual === "Inexistante" || adve.d.visual === "Basique") {
    swotWeaknesses.push("Identite visuelle sous-developpee");
  }
  if (!adve.v.value_proposition_template && !adve.v.promise) {
    swotWeaknesses.push("Proposition de valeur non formulee");
  }
  if (adve.e.community === "Aucune" || adve.e.community === "Reseaux sociaux passifs") {
    swotWeaknesses.push("Pas de communaute structuree");
  }
  derivedFrom.push("derived.weaknesses_from_adve_gaps");

  // OPPORTUNITIES — from sector + business model patterns
  if (ctx) {
    swotOpportunities.push(...sectorOpportunities(seed.sector, ctx));
    derivedFrom.push("derived.opportunities_from_context");
  }

  // THREATS — sectorial + business-model-specific
  if (ctx) {
    swotThreats.push(...modelThreats(ctx));
    derivedFrom.push("derived.threats_from_business_model");
  }
  if (seed.sector) {
    swotThreats.push(...sectorThreats(seed.sector));
    derivedFrom.push("derived.threats_from_sector");
  }

  content.swot_strengths = swotStrengths;
  content.swot_weaknesses = swotWeaknesses;
  content.swot_opportunities = swotOpportunities;
  content.swot_threats = swotThreats;
  content.threats = swotThreats.slice(0, 3);

  // Niveaux par defaut sur les axes mesurables
  content.crisis = "Inexistant";
  content.reputation = "Pas du tout";
  content.mitigation_plan = buildMitigationPlan(swotWeaknesses, swotThreats);

  return {
    pillar: "r" as PillarKey,
    content,
    confidence: 0.55,
    derivedFrom,
  };
}

// ============================================================================
// PILIER T — Track
// ----------------------------------------------------------------------------
// Derive depuis ADVE + R + benchmarks Seshat.
// T croise interne et marche.
// ============================================================================

export interface SeshatBenchmarks {
  npsTarget?: number;
  retentionTarget?: number;
  npsBenchmark?: number;
  ctrBenchmark?: number;
  conversionBenchmark?: number;
}

export function fillTrack(
  seed: NotoriaSeed,
  adve: ADVEContent,
  benchmarks: SeshatBenchmarks = {}
): NotoriaPillarFill {
  const ctx = seed.bizContext;
  const content: Record<string, unknown> = {};
  const derivedFrom: string[] = [];

  // KPIs adaptes au business model
  const kpis = ctx ? kpisForBusinessModel(ctx.businessModel) : ["awareness", "consideration", "conversion"];
  content.kpis = kpis;
  derivedFrom.push("derived.kpis_from_business_model");

  // Cadence de mesure
  if (ctx?.businessModel === "ABONNEMENT" || ctx?.businessModel === "PLATEFORME") {
    content.measurement = "En continu";
  } else if (ctx?.positioningArchetype === "ULTRA_LUXE" || ctx?.positioningArchetype === "LUXE") {
    content.measurement = "Trimestriellement";
  } else {
    content.measurement = "Mensuellement";
  }

  // NPS / market validation (placeholder valeurs cibles)
  content.nps = "Approximatif";
  content.market_validation = "Etude qualitative";
  if (benchmarks.npsBenchmark !== undefined) {
    content.nps_benchmark = benchmarks.npsBenchmark;
    derivedFrom.push("seshat.nps_benchmark");
  }

  // Dashboard KPIs : croisement interne / marche
  content.dashboard_layout = buildDashboardLayout(kpis, ctx?.businessModel);
  content.scoring_method = "ADVE-RTIS";
  content.review_cadence = ctx?.businessModel === "ABONNEMENT" ? "Mensuelle" : "Trimestrielle";

  return {
    pillar: "t" as PillarKey,
    content,
    confidence: 0.55,
    derivedFrom,
  };
}

// ============================================================================
// PROPOSE ADVE UPDATES — boucle dynamique R/T → ADVE
// ============================================================================

export interface ADVEUpdateProposal {
  pillar: "a" | "d" | "v" | "e";
  field: string;
  rationale: string;
  suggestedValue?: unknown;
  source: "risk_finding" | "track_finding";
}

export function proposeADVEUpdates(
  riskContent: Record<string, unknown>,
  trackContent: Record<string, unknown>
): ADVEUpdateProposal[] {
  const proposals: ADVEUpdateProposal[] = [];

  const weaknesses = (riskContent.swot_weaknesses ?? []) as string[];
  const threats = (riskContent.swot_threats ?? []) as string[];

  // Mapping faiblesses → champ ADVE a renforcer
  for (const w of weaknesses) {
    if (/valeurs de marque/i.test(w)) {
      proposals.push({
        pillar: "a",
        field: "values",
        rationale: `Faiblesse identifiee dans R : "${w}"`,
        source: "risk_finding",
      });
    }
    if (/identite visuelle/i.test(w)) {
      proposals.push({
        pillar: "d",
        field: "visual",
        rationale: `Faiblesse identifiee dans R : "${w}"`,
        source: "risk_finding",
      });
    }
    if (/proposition de valeur/i.test(w)) {
      proposals.push({
        pillar: "v",
        field: "value_proposition_template",
        rationale: `Faiblesse identifiee dans R : "${w}"`,
        source: "risk_finding",
      });
    }
    if (/communaute/i.test(w)) {
      proposals.push({
        pillar: "e",
        field: "community",
        rationale: `Faiblesse identifiee dans R : "${w}"`,
        source: "risk_finding",
      });
    }
  }

  // Mapping menaces → ajustements ADVE
  for (const t of threats) {
    if (/concurrent/i.test(t) || /commodit/i.test(t)) {
      proposals.push({
        pillar: "d",
        field: "differentiation_hypothesis",
        rationale: `Menace identifiee dans R : "${t}" — la distinction doit etre renforcee`,
        source: "risk_finding",
      });
    }
    if (/regulation|reglement/i.test(t)) {
      proposals.push({
        pillar: "v",
        field: "compliance_layer",
        rationale: `Menace reglementaire : "${t}"`,
        source: "risk_finding",
      });
    }
  }

  // Track findings (eg: NPS bas) → suggerer un travail E
  const npsBenchmark = trackContent.nps_benchmark as number | undefined;
  if (npsBenchmark !== undefined && npsBenchmark < 30) {
    proposals.push({
      pillar: "e",
      field: "loyalty_strategy",
      rationale: `T benchmark indique un NPS sous 30 — l'engagement et la loyaute doivent etre repensees`,
      source: "track_finding",
    });
  }

  return proposals;
}

// ============================================================================
// HELPERS
// ============================================================================

function sectorOpportunities(sector: string | null | undefined, ctx: BusinessContext): string[] {
  const list: string[] = [];
  if (sector === "TECH" || ctx.businessModel === "ABONNEMENT") {
    list.push("Croissance numerique soutenue dans la zone");
  }
  if (sector === "FOOD" || sector === "FMCG") {
    list.push("Demande locale en croissance pour produits de qualite");
  }
  if (ctx.positioningArchetype === "PREMIUM" || ctx.positioningArchetype === "LUXE") {
    list.push("Apparition d'une classe consommatrice premium en Afrique francophone");
  }
  if (ctx.businessModel === "PLATEFORME") {
    list.push("Marche encore peu structure — fenetre pour devenir le standard");
  }
  if (list.length === 0) list.push("Marche en structuration — opportunite de leadership");
  return list;
}

function modelThreats(ctx: BusinessContext): string[] {
  const map: Partial<Record<BusinessModelKey, string[]>> = {
    PRODUCTION: ["Fluctuation des couts matieres premieres", "Dependance fournisseurs"],
    DISTRIBUTION: ["Pression sur les marges", "Concurrence de l'ecommerce direct"],
    SERVICES: ["Banalisation de l'offre", "Dependance aux profils cle"],
    ABONNEMENT: ["Churn eleve", "Saturation du marche du SaaS"],
    PLATEFORME: ["Desintermediation", "Cout d'acquisition deux faces"],
    FREEMIUM_AD: ["Cannibalisation par le tier gratuit", "Dependance plateformes pub"],
    LICENSING_IP: ["Contrefacons", "Renouvellement de licence"],
    RAZOR_BLADE: ["Generiques moins chers sur la consommable"],
    P2P_SHARING: ["Confiance / qualite variable", "Reglementation"],
    FINANCIARISATION: ["Risques reglementaires lourds", "Risque de credit / liquidite"],
    INFRASTRUCTURE: ["Cout du capital", "Reglementation publique"],
    HYBRID: ["Complexite d'execution", "Identite de marque diluee"],
  };
  return map[ctx.businessModel] ?? ["Pression concurrentielle"];
}

function sectorThreats(sector: string): string[] {
  const map: Record<string, string[]> = {
    FMCG: ["Volatilite matieres premieres", "Pouvoir d'achat"],
    BANQUE: ["Cybersecurite", "Reglementation BEAC / COBAC"],
    TECH: ["Cycle technologique court", "Talents rares"],
    TELECOM: ["Reglementation ART / ARCEP", "Cout du spectre"],
    IMMOBILIER: ["Acces au foncier", "Volatilite des prix"],
    SANTE: ["Reglementation", "Reputation sensible"],
    EDUCATION: ["Reconnaissance institutionnelle"],
    MODE: ["Cycles courts", "Contrefacons"],
    FOOD: ["Securite alimentaire", "Saisonnalite"],
    SERVICES: ["Banalisation", "Pression prix"],
  };
  return map[sector] ?? [];
}

function buildMitigationPlan(weaknesses: string[], threats: string[]): string {
  const top = [...weaknesses.slice(0, 2), ...threats.slice(0, 2)];
  if (top.length === 0) return "Aucun risque critique identifie au moment de l'audit initial.";
  return `Plan d'attenuation a structurer en priorite sur : ${top.join(" ; ")}`;
}

function kpisForBusinessModel(bm: BusinessModelKey): string[] {
  const map: Partial<Record<BusinessModelKey, string[]>> = {
    PRODUCTION: ["Marge brute", "Rotation stock", "Taux de retour"],
    DISTRIBUTION: ["Sell-through", "Marge nette", "Couverture distribution"],
    SERVICES: ["Taux d'occupation", "Marge contributive", "NPS"],
    ABONNEMENT: ["MRR", "Churn", "LTV/CAC", "Activation rate"],
    PLATEFORME: ["GMV", "Take rate", "Liquidite (matches/mois)", "Retention deux faces"],
    FREEMIUM_AD: ["DAU/MAU", "ARPU", "Conversion free→paid", "Revenu pub"],
    LICENSING_IP: ["Royalties", "Nombre de licencies", "Renouvellements"],
    RAZOR_BLADE: ["Base installee", "Frequence rachat", "Marge consommable"],
    P2P_SHARING: ["Trust score", "Repeat rate", "Volume transactions"],
    FINANCIARISATION: ["Encours", "Marge nette d'interet", "PDC / NPL"],
    INFRASTRUCTURE: ["Capacite utilisee", "Uptime", "ARPU"],
    HYBRID: ["KPI mix selon canal dominant"],
  };
  return map[bm] ?? ["Awareness", "Consideration", "Conversion", "Retention"];
}

function buildDashboardLayout(kpis: string[], bm?: BusinessModelKey): Record<string, string[]> {
  return {
    acquisition: kpis.filter((k) => /awareness|conversion|cac|GMV|sell-through|capacite/i.test(k)),
    retention: kpis.filter((k) => /retention|churn|LTV|repeat|frequence|encours/i.test(k)),
    monetization: kpis.filter((k) => /marge|MRR|ARPU|royalt|take rate/i.test(k)),
    health: kpis.filter((k) => /NPS|trust|uptime|PDC|NPL/i.test(k)),
  };
}
