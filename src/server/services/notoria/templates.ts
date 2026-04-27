import type { PillarKey } from "@/lib/types/advertis-vector";
import type {
  BusinessContext,
  BusinessModelKey,
  EconomicModelKey,
  PositioningArchetypeKey,
  SalesChannel,
} from "@/lib/types/business-context";

// ============================================================================
// NOTORIA TEMPLATES — heuristiques déterministes pour pré-remplir les piliers
// ----------------------------------------------------------------------------
// Aucune dépendance LLM ; ces templates produisent des contenus structurés
// directement consommables par le scoring ADVE-RTIS et l'UI.
// ============================================================================

export interface NotoriaSeed {
  // Métadonnées brand
  brandName: string;
  sector?: string | null;
  country?: string | null;
  // Réponses textuelles libres collectées dans l'intake
  intakeResponses: Record<string, unknown>;
  // Contexte business
  bizContext: BusinessContext | null;
}

export interface NotoriaPillarFill {
  pillar: PillarKey;
  content: Record<string, unknown>;
  /** Confidence du remplissage automatique (0-1). Toujours < 0.6 pour rester en COHERENT au mieux. */
  confidence: number;
  /** Étiquettes lisibles des dérivations utilisées (pour traçabilité). */
  derivedFrom: string[];
}

// ============================================================================
// PILIER A — Authenticité
// ============================================================================

export function fillAuthenticity(seed: NotoriaSeed): NotoriaPillarFill {
  const r = seed.intakeResponses;
  const ctx = seed.bizContext;

  const content: Record<string, unknown> = {};
  const derivedFrom: string[] = [];

  // Vision/mission depuis intake si présent
  if (typeof r.a_vision === "string" && r.a_vision.trim()) {
    content.vision = r.a_vision;
    derivedFrom.push("intake.a_vision");
  }
  if (typeof r.a_mission === "string" && r.a_mission.trim()) {
    content.mission = r.a_mission;
    derivedFrom.push("intake.a_mission");
  }
  if (typeof r.a_origin === "string" && r.a_origin.trim()) {
    content.origin = r.a_origin;
    derivedFrom.push("intake.a_origin");
  }
  if (typeof r.a_values === "string" && r.a_values.trim()) {
    // valeurs typiquement listées séparées par virgule ou ligne
    const list = r.a_values.split(/[\n,;]/).map((s) => s.trim()).filter(Boolean);
    if (list.length >= 2) content.values = list;
    else content.values_freeform = r.a_values;
    derivedFrom.push("intake.a_values");
  }
  if (typeof r.a_archetype === "string" && r.a_archetype.trim()) {
    content.archetype = r.a_archetype;
    derivedFrom.push("intake.a_archetype");
  }

  // Inférence d'archétype par business model + positioning si non fourni
  if (!content.archetype && ctx) {
    content.archetype = inferArchetype(ctx);
    derivedFrom.push("inferred.archetype_from_bizmodel_positioning");
  }

  // Suggestion de purpose par secteur
  if (seed.sector) {
    content.purpose_hint = sectorPurposeHint(seed.sector);
    derivedFrom.push("inferred.purpose_from_sector");
  }

  // Cultural anchor par pays + secteur
  if (seed.country && seed.sector) {
    content.cultural_anchor = `${seed.sector} en ${seed.country}`;
    derivedFrom.push("inferred.cultural_anchor");
  }

  return {
    pillar: "a",
    content,
    confidence: estimateConfidence(content, ["vision", "mission", "values", "archetype"]),
    derivedFrom,
  };
}

// ============================================================================
// PILIER D — Distinction
// ============================================================================

export function fillDistinction(seed: NotoriaSeed): NotoriaPillarFill {
  const r = seed.intakeResponses;
  const ctx = seed.bizContext;
  const content: Record<string, unknown> = {};
  const derivedFrom: string[] = [];

  if (typeof r.d_positioning === "string" && r.d_positioning.trim()) {
    content.positioning = r.d_positioning;
    derivedFrom.push("intake.d_positioning");
  }
  if (typeof r.d_visual === "string") {
    content.visual = r.d_visual;
    derivedFrom.push("intake.d_visual");
  }
  if (typeof r.d_voice === "string") {
    content.voice = r.d_voice;
    derivedFrom.push("intake.d_voice");
  }
  if (typeof r.d_competitors === "string" && r.d_competitors.trim()) {
    const list = r.d_competitors.split(/[\n,;]/).map((s) => s.trim()).filter(Boolean);
    if (list.length >= 2) content.competitors = list;
    else content.competitors_freeform = r.d_competitors;
    derivedFrom.push("intake.d_competitors");
  }

  if (ctx) {
    content.differentiation_hypothesis = inferDifferentiation(ctx);
    content.brand_codes_seed = inferBrandCodes(ctx);
    derivedFrom.push("inferred.differentiation_from_context");
  }

  return {
    pillar: "d",
    content,
    confidence: estimateConfidence(content, ["positioning", "visual", "voice"]),
    derivedFrom,
  };
}

// ============================================================================
// PILIER V — Valeur
// ============================================================================

export function fillValue(seed: NotoriaSeed): NotoriaPillarFill {
  const r = seed.intakeResponses;
  const ctx = seed.bizContext;
  const content: Record<string, unknown> = {};
  const derivedFrom: string[] = [];

  if (typeof r.v_promise === "string" && r.v_promise.trim()) {
    content.promise = r.v_promise;
    derivedFrom.push("intake.v_promise");
  }
  if (typeof r.v_products === "string" && r.v_products.trim()) {
    const list = r.v_products.split(/[\n,;]/).map((s) => s.trim()).filter(Boolean);
    if (list.length >= 2) content.products = list;
    else content.products_freeform = r.v_products;
    derivedFrom.push("intake.v_products");
  }
  if (r.v_experience !== undefined && r.v_experience !== null) {
    content.experience = r.v_experience;
    derivedFrom.push("intake.v_experience");
  }

  if (ctx) {
    content.pricing_logic = inferPricingLogic(ctx);
    content.value_proposition_template = buildValuePropTemplate(ctx, seed.brandName);
    content.sacrements_hint = inferSacrements(ctx);
    derivedFrom.push("inferred.pricing_and_value_prop");
    if (ctx.freeLayer) {
      content.free_layer_summary = `Gratuit : ${ctx.freeLayer.whatIsFree} | Payant : ${ctx.freeLayer.whatIsPaid}`;
      derivedFrom.push("intake.freeLayer");
    }
  }

  return {
    pillar: "v",
    content,
    confidence: estimateConfidence(content, ["promise", "products", "value_proposition_template"]),
    derivedFrom,
  };
}

// ============================================================================
// PILIER E — Engagement
// ============================================================================

export function fillEngagement(seed: NotoriaSeed): NotoriaPillarFill {
  const r = seed.intakeResponses;
  const ctx = seed.bizContext;
  const content: Record<string, unknown> = {};
  const derivedFrom: string[] = [];

  if (typeof r.e_community === "string") {
    content.community = r.e_community;
    derivedFrom.push("intake.e_community");
  }
  if (typeof r.e_loyalty === "string") {
    content.loyalty = r.e_loyalty;
    derivedFrom.push("intake.e_loyalty");
  }
  if (typeof r.e_advocates === "string") {
    content.advocates = r.e_advocates;
    derivedFrom.push("intake.e_advocates");
  }
  if (typeof r.e_rituals === "string" && r.e_rituals.trim()) {
    content.rituals = r.e_rituals.split(/[\n,;]/).map((s) => s.trim()).filter(Boolean);
    derivedFrom.push("intake.e_rituals");
  }

  if (ctx) {
    content.engagement_pattern = inferEngagementPattern(ctx);
    content.devotion_ladder_seed = ["Suspect", "Prospect", "Client", "Fan", "Ambassadeur"];
    content.suggested_temples = suggestTemples(ctx);
    derivedFrom.push("inferred.engagement_pattern_from_bizmodel");
  }

  return {
    pillar: "e",
    content,
    confidence: estimateConfidence(content, ["community", "loyalty", "engagement_pattern"]),
    derivedFrom,
  };
}

// ============================================================================
// HELPERS — inférences déterministes
// ============================================================================

const ARCHETYPE_BY_POSITIONING: Partial<Record<PositioningArchetypeKey, string>> = {
  ULTRA_LUXE: "Le Souverain",
  LUXE: "Le Souverain",
  PREMIUM: "Le Sage",
  MASSTIGE: "L'Amant",
  MAINSTREAM: "L'Homme ordinaire",
  VALUE: "Le Caregiver",
  LOW_COST: "L'Homme ordinaire",
};

const ARCHETYPE_BY_BIZMODEL: Partial<Record<BusinessModelKey, string>> = {
  SERVICES: "Le Sage",
  ABONNEMENT: "Le Caregiver",
  PLATEFORME: "Le Magicien",
  FREEMIUM_AD: "Le Magicien",
  P2P_SHARING: "L'Innocent",
  LICENSING_IP: "Le Createur",
  PRODUCTION: "Le Createur",
  FINANCIARISATION: "Le Sage",
  INFRASTRUCTURE: "Le Souverain",
};

function inferArchetype(ctx: BusinessContext): string {
  return (
    ARCHETYPE_BY_POSITIONING[ctx.positioningArchetype] ??
    ARCHETYPE_BY_BIZMODEL[ctx.businessModel] ??
    "L'Explorateur"
  );
}

const SECTOR_PURPOSE: Record<string, string> = {
  FMCG: "Rendre le quotidien plus simple, plus juste, plus desirable",
  BANQUE: "Donner aux gens et aux entreprises le pouvoir d'agir sur leurs ambitions",
  TECH: "Resoudre un probleme massif avec une elegance technique",
  TELECOM: "Connecter les personnes et amplifier leur capacite d'echange",
  IMMOBILIER: "Permettre a chacun d'habiter un lieu qui lui ressemble",
  SANTE: "Prendre soin du corps et de l'esprit avec exigence",
  EDUCATION: "Liberer le potentiel par la transmission",
  MODE: "Donner forme a la singularite de chacun",
  FOOD: "Nourrir les corps et les rituels avec sincerite",
  SERVICES: "Apporter une expertise qui transforme la trajectoire du client",
};

function sectorPurposeHint(sector: string): string {
  return SECTOR_PURPOSE[sector] ?? "Apporter une valeur unique a un marche bien identifie";
}

function inferDifferentiation(ctx: BusinessContext): string[] {
  const points: string[] = [];
  if (ctx.positioningArchetype === "ULTRA_LUXE" || ctx.positioningArchetype === "LUXE") {
    points.push("Rarete et savoir-faire");
    points.push("Heritage de marque");
    points.push("Service signature");
  } else if (ctx.positioningArchetype === "LOW_COST") {
    points.push("Prix imbattable");
    points.push("Modele operationnel optimise");
    points.push("Simplicite radicale");
  } else if (ctx.businessModel === "ABONNEMENT") {
    points.push("Continuite de service et amelioration permanente");
    points.push("Communaute exclusive");
    points.push("Valeur cumulative");
  } else if (ctx.businessModel === "PLATEFORME") {
    points.push("Effet reseau et liquidite");
    points.push("Confiance et reputation");
    points.push("Decouvrabilite");
  } else {
    points.push("Proposition de valeur claire");
    points.push("Qualite d'execution");
    points.push("Proximite client");
  }
  return points;
}

function inferBrandCodes(ctx: BusinessContext): string[] {
  if (ctx.positioningArchetype === "ULTRA_LUXE" || ctx.positioningArchetype === "LUXE") {
    return ["typographie serif", "matiere noble", "silence visuel", "or / monochrome"];
  }
  if (ctx.positioningArchetype === "LOW_COST") {
    return ["typographie bold sans serif", "couleur primaire", "prix proeminent"];
  }
  if (ctx.businessModel === "ABONNEMENT" || ctx.businessModel === "PLATEFORME") {
    return ["interface UI signature", "mascotte / illustration", "palette accessible"];
  }
  return ["palette ressente", "logotype lisible", "iconographie sectorielle"];
}

function inferPricingLogic(ctx: BusinessContext): string {
  if (ctx.positioningArchetype === "ULTRA_LUXE" || ctx.positioningArchetype === "LUXE") return "Premium / scarcity";
  if (ctx.positioningArchetype === "LOW_COST") return "Penetration";
  if (ctx.businessModel === "ABONNEMENT") return "Tiered + value-based";
  if (ctx.economicModels.includes("USAGE_BASED" as EconomicModelKey)) return "Usage-based";
  return "Valeur perçue";
}

function buildValuePropTemplate(ctx: BusinessContext, brandName: string): string {
  const benefit = ctx.positioningArchetype === "ULTRA_LUXE" || ctx.positioningArchetype === "LUXE"
    ? "vivre une experience d'exception"
    : ctx.positioningArchetype === "LOW_COST"
      ? "acceder a la categorie au meilleur prix"
      : "obtenir un resultat concret et mesurable";
  return `Pour [cible], qui [besoin], ${brandName} est [categorie] qui permet de ${benefit}.`;
}

function inferSacrements(ctx: BusinessContext): string[] {
  if (ctx.businessModel === "ABONNEMENT") return ["onboarding", "premiere valeur (J+7)", "renouvellement"];
  if (ctx.businessModel === "PLATEFORME") return ["premier match", "premiere transaction reussie", "feedback bidirectionnel"];
  if (ctx.salesChannel === "DIRECT") return ["decouverte", "deballage / unboxing", "premiere utilisation"];
  return ["decouverte", "premier achat", "service apres-vente"];
}

function inferEngagementPattern(ctx: BusinessContext): string {
  if (ctx.businessModel === "ABONNEMENT") return "Retention + reduction churn — engagement continu post-acquisition";
  if (ctx.businessModel === "PLATEFORME") return "Equilibrage offre/demande — engager les deux faces";
  if (ctx.positioningArchetype === "ULTRA_LUXE" || ctx.positioningArchetype === "LUXE") return "Cercle restreint, rituels exclusifs, devotion par rarete";
  if (ctx.salesChannel === "INTERMEDIATED") return "Mediation par distributeurs — la marque doit creer un appel d'air emotionnel direct";
  return "Acquisition + fidelisation classique";
}

function suggestTemples(ctx: BusinessContext): string[] {
  if (ctx.salesChannel === "DIRECT") return ["site / app", "espace physique signature", "communaute en ligne"];
  if (ctx.businessModel === "PLATEFORME") return ["app marketplace", "communaute hosts", "communaute users"];
  if (ctx.businessModel === "ABONNEMENT") return ["espace membres", "newsletter rituelle", "events trimestriels"];
  return ["site / app", "reseaux sociaux", "evenements"];
}

/**
 * Confidence basee sur la couverture des champs critiques attendus.
 * Plafond a 0.55 pour rester en dessous de COHERENT (qui demande 0.6).
 * → Notoria pre-remplit mais ne pretend pas valider.
 */
function estimateConfidence(content: Record<string, unknown>, criticalFields: string[]): number {
  const filled = criticalFields.filter((f) => {
    const v = content[f];
    if (v === null || v === undefined) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  }).length;
  const coverage = criticalFields.length > 0 ? filled / criticalFields.length : 0;
  return Math.min(0.55, 0.25 + coverage * 0.3);
}
