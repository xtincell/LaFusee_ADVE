import type { PillarKey } from "@/lib/types/advertis-vector";

/**
 * Niveau de validation d'un pilier — du non-démarré au validé.
 * Inspire de l'ontologie Annexe G : atomes, collections, cross-refs.
 *
 *   EMPTY      : aucun atome, aucun contenu — séquence non démarrée
 *   STARTED    : 1+ atomes mais < seuil de cohérence
 *   PARTIAL    : seuil de cohérence atteint mais ni collections ni cross-refs
 *   COHERENT   : atomes + collections complètes
 *   VALIDATED  : atomes + collections + cross-refs (pleinement validé)
 */
export type ValidationLevel = "EMPTY" | "STARTED" | "PARTIAL" | "COHERENT" | "VALIDATED";

export interface PillarValidation {
  pillar: PillarKey;
  level: ValidationLevel;
  // Pourcentages 0-1
  atomsRatio: number;
  keyAtomsRatio: number;
  collectionsRatio: number;
  crossRefsRatio: number;
  confidence: number;
  // Score structurel projeté (0-25)
  projectedScore: number;
  // Raisons / gaps lisibles humainement
  gaps: string[];
  // Atomes manquants (pour audit)
  atomsFilled: number;
  atomsRequired: number;
  keyAtomsFilled: number;
  keyAtomsRequired: number;
  // Flag UI : utilisateur a explicitement passe ce pilier
  skipped: boolean;
}

export interface PillarRequirements {
  atomsRequired: number;
  collectionsRequired: number;
  crossRefsRequired: number;
  // Atomes-clés que l'on s'attend a voir (pour les gaps lisibles)
  keyAtoms: string[];
}

/**
 * Référentiel des exigences par pilier (Annexe H ontology).
 * Atomes-clés = noms de champs attendus dans Pillar.content.
 */
export const PILLAR_REQUIREMENTS: Record<PillarKey, PillarRequirements> = {
  a: {
    atomsRequired: 12,
    collectionsRequired: 3,
    crossRefsRequired: 2,
    keyAtoms: ["vision", "mission", "origin", "values", "archetype", "manifesto", "founder_story", "cultural_anchor", "brand_promise_emotional", "purpose", "rituals", "totem"],
  },
  d: {
    atomsRequired: 10,
    collectionsRequired: 3,
    crossRefsRequired: 2,
    keyAtoms: ["positioning", "competitors", "visual", "voice", "differentiation", "brand_codes", "naming_convention", "logo_system", "color_palette", "typography"],
  },
  v: {
    atomsRequired: 8,
    collectionsRequired: 2,
    crossRefsRequired: 2,
    keyAtoms: ["promise", "products", "experience", "sacrements", "value_proposition", "pricing_logic", "ux_signature", "service_blueprint"],
  },
  e: {
    atomsRequired: 10,
    collectionsRequired: 3,
    crossRefsRequired: 2,
    keyAtoms: ["community", "loyalty", "advocates", "rituals", "devotion_ladder", "temples", "clergy", "ambassadors", "communication_loops", "ugc_strategy"],
  },
  r: {
    atomsRequired: 8,
    collectionsRequired: 2,
    crossRefsRequired: 1,
    keyAtoms: ["threats", "crisis", "reputation", "swot_strengths", "swot_weaknesses", "swot_opportunities", "swot_threats", "mitigation_plan"],
  },
  t: {
    atomsRequired: 6,
    collectionsRequired: 2,
    crossRefsRequired: 1,
    keyAtoms: ["kpis", "measurement", "nps", "market_validation", "scoring_method", "review_cadence"],
  },
  i: {
    atomsRequired: 8,
    collectionsRequired: 2,
    crossRefsRequired: 2,
    keyAtoms: ["roadmap", "budget", "team", "campaigns", "drivers", "channels", "calendar", "ownership"],
  },
  s: {
    atomsRequired: 6,
    collectionsRequired: 2,
    crossRefsRequired: 3,
    keyAtoms: ["guidelines", "coherence", "ambition", "playbooks", "governance", "brand_bible"],
  },
};

/**
 * Cles meta exclues du compte d'atomes (etat interne, pas du contenu de marque).
 * Toute cle commencant par "_" est consideree meta.
 */
function isMetaKey(key: string): boolean {
  return key.startsWith("_");
}

/**
 * Garde defensif : retourne un objet sain, vide si l'input est corrompu
 * (string, array, primitive). Filtre aussi les cles meta.
 */
function sanitizeContent(content: unknown): Record<string, unknown> {
  if (!content || typeof content !== "object" || Array.isArray(content)) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(content as Record<string, unknown>)) {
    if (!isMetaKey(k)) out[k] = v;
  }
  return out;
}

/**
 * Compte les atomes valides dans un objet de contenu.
 * Un atome est valide si la valeur n'est pas vide (null, "", undefined, [], {})
 * et si sa cle n'est pas une cle meta (prefixee par "_").
 */
export function countAtoms(content: unknown): number {
  const safe = sanitizeContent(content);
  return Object.values(safe).filter(isFilledValue).length;
}

/**
 * Compte les atomes "key" — les cles attendues dans la registry du pilier.
 * Ces atomes pesent plus pour determiner le niveau de validation.
 */
export function countKeyAtoms(content: unknown, pillar: PillarKey): number {
  const safe = sanitizeContent(content);
  const expected = new Set(PILLAR_REQUIREMENTS[pillar].keyAtoms);
  let count = 0;
  for (const [k, v] of Object.entries(safe)) {
    if (expected.has(k) && isFilledValue(v)) count++;
  }
  return count;
}

/**
 * Compte les collections "complètes" (tableaux >= 2 elements).
 */
export function countCollections(content: unknown): number {
  const safe = sanitizeContent(content);
  return Object.values(safe).filter((v) => Array.isArray(v) && v.length >= 2).length;
}

/**
 * Compte les cross-references (chaines pointant vers autres entites).
 */
export function countCrossRefs(content: unknown): number {
  const safe = sanitizeContent(content);
  return Object.values(safe).filter(
    (v) => typeof v === "string" && /^(strategy_|driver_|campaign_|mission_|asset_|signal_)/.test(v)
  ).length;
}

/**
 * Indique si le pilier a ete explicitement passe par l'utilisateur.
 */
export function isPillarSkipped(content: unknown): boolean {
  if (!content || typeof content !== "object" || Array.isArray(content)) return false;
  return (content as Record<string, unknown>)._skipped === true;
}

function isFilledValue(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v as object).length > 0;
  return true;
}

/**
 * Calcule le niveau de validation d'un pilier a partir de son contenu.
 *
 * Le niveau prend en compte :
 *  - le ratio d'atomes-cles remplis (registry, prioritaire)
 *  - le ratio total d'atomes (incluant atomes libres)
 *  - les collections et cross-refs
 *  - la confidence qualitative
 *  - le flag _skipped (sort le pilier de EMPTY mais ne le promeut pas)
 */
export function validatePillar(
  pillar: PillarKey,
  content: unknown,
  confidence: number = 0
): PillarValidation {
  const req = PILLAR_REQUIREMENTS[pillar];
  const atoms = countAtoms(content);
  const keyAtoms = countKeyAtoms(content, pillar);
  const collections = countCollections(content);
  const crossRefs = countCrossRefs(content);
  const skipped = isPillarSkipped(content);

  const keyAtomsRequired = req.keyAtoms.length;
  const keyAtomsRatio = keyAtomsRequired > 0 ? keyAtoms / keyAtomsRequired : 0;
  const atomsRatio = req.atomsRequired > 0 ? atoms / req.atomsRequired : 0;
  const collectionsRatio = req.collectionsRequired > 0 ? collections / req.collectionsRequired : 0;
  const crossRefsRatio = req.crossRefsRequired > 0 ? crossRefs / req.crossRefsRequired : 0;

  // Ratio composite pour la projection : pondere keyAtoms (60%) et atomes libres (40%)
  const compositeAtomRatio = keyAtomsRatio * 0.6 + atomsRatio * 0.4;

  // Score projete (formule Annexe G, max 25)
  const projectedScore = Math.min(
    25,
    Math.min(1, compositeAtomRatio) * 15 + Math.min(1, collectionsRatio) * 7 + Math.min(1, crossRefsRatio) * 3
  );

  // Determination du niveau — pilote par les keyAtoms
  let level: ValidationLevel;
  if (atoms === 0 && !skipped) {
    level = "EMPTY";
  } else if (skipped && keyAtoms === 0) {
    // Skipped explicitement et pas de contenu reel : reste STARTED pour signaler que c'etait un choix
    level = "STARTED";
  } else if (keyAtomsRatio < 0.3) {
    level = "STARTED";
  } else if (keyAtomsRatio >= 0.6 && collectionsRatio >= 0.5 && crossRefsRatio >= 0.5 && confidence >= 0.6) {
    level = "VALIDATED";
  } else if (keyAtomsRatio >= 0.6 && collectionsRatio >= 0.5) {
    level = "COHERENT";
  } else {
    level = "PARTIAL";
  }

  // Gaps lisibles
  const gaps: string[] = [];
  if (skipped) {
    gaps.push("Pilier explicitement passé — peut être repris à tout moment");
  }
  if (keyAtomsRatio < 0.6) {
    const missing = Math.max(0, Math.ceil(keyAtomsRequired * 0.6) - keyAtoms);
    gaps.push(`${missing} atomes-clés manquants (${keyAtoms}/${keyAtomsRequired} de la registry)`);
  }
  if (collectionsRatio < 0.5) {
    gaps.push(`Collections incomplètes (${collections}/${req.collectionsRequired})`);
  }
  if (crossRefsRatio < 0.5) {
    gaps.push(`Liens vers autres entités manquants (${crossRefs}/${req.crossRefsRequired})`);
  }
  if (confidence < 0.6 && atoms > 0 && !skipped) {
    gaps.push(`Confiance qualitative basse (${(confidence * 100).toFixed(0)}%)`);
  }

  return {
    pillar,
    level,
    atomsRatio: Math.round(atomsRatio * 100) / 100,
    keyAtomsRatio: Math.round(keyAtomsRatio * 100) / 100,
    collectionsRatio: Math.round(collectionsRatio * 100) / 100,
    crossRefsRatio: Math.round(crossRefsRatio * 100) / 100,
    confidence,
    projectedScore: Math.round(projectedScore * 100) / 100,
    gaps,
    atomsFilled: atoms,
    atomsRequired: req.atomsRequired,
    keyAtomsFilled: keyAtoms,
    keyAtomsRequired,
    skipped,
  };
}

/**
 * Couleur/intent UI par niveau.
 */
export const LEVEL_INTENT: Record<ValidationLevel, "muted" | "info" | "warn" | "ok" | "success"> = {
  EMPTY: "muted",
  STARTED: "info",
  PARTIAL: "warn",
  COHERENT: "ok",
  VALIDATED: "success",
};

export const LEVEL_LABEL: Record<ValidationLevel, string> = {
  EMPTY: "Non démarré",
  STARTED: "Démarré",
  PARTIAL: "Partiel",
  COHERENT: "Cohérent",
  VALIDATED: "Validé",
};
