import { BUSINESS_MODELS, ECONOMIC_MODELS, POSITIONING_ARCHETYPES } from "@/lib/types/business-context";

export interface IntakeQuestion {
  id: string;
  pillar: string;
  question: string;
  type: "text" | "select" | "multiselect" | "scale";
  options?: string[];
  required: boolean;
}

const QUESTION_BANK: Record<string, IntakeQuestion[]> = {
  // ========================================================================
  // Business context questions — captured before ADVE pillars
  // ========================================================================
  biz: [
    {
      id: "biz_model", pillar: "biz",
      question: "Quel est votre modèle d'affaires principal ?",
      type: "select",
      options: Object.entries(BUSINESS_MODELS).map(([key, m]) => `${key}::${m.label}`),
      required: true,
    },
    {
      id: "biz_revenue", pillar: "biz",
      question: "Comment générez-vous principalement vos revenus ? (plusieurs choix possibles)",
      type: "multiselect",
      options: Object.entries(ECONOMIC_MODELS).map(([key, m]) => `${key}::${m.label}`),
      required: true,
    },
    {
      id: "biz_positioning", pillar: "biz",
      question: "Comment positionnez-vous vos prix par rapport au marché ?",
      type: "select",
      options: Object.entries(POSITIONING_ARCHETYPES).map(([key, m]) => `${key}::${m.label}`),
      required: true,
    },
    {
      id: "biz_sales_channel", pillar: "biz",
      question: "Comment vendez-vous ?",
      type: "select",
      options: [
        "DIRECT::Directement au client final (D2C)",
        "INTERMEDIATED::Via des distributeurs / revendeurs",
        "HYBRID::Les deux (vente directe + distributeurs)",
      ],
      required: true,
    },
    {
      id: "biz_free_element", pillar: "biz",
      question: "Y a-t-il une partie gratuite dans votre offre ?",
      type: "select",
      options: [
        "NONE::Non, tout est payant",
        "FREEMIUM::Oui, une version gratuite limitée",
        "CONTENT::Oui, du contenu ou des outils gratuits",
        "AD_SUPPORTED::Oui, un modèle financé par la publicité",
      ],
      required: false,
    },
    {
      id: "biz_free_detail", pillar: "biz",
      question: "Si oui, décrivez ce qui est gratuit vs. ce qui est payant.",
      type: "text",
      required: false,
    },
    {
      id: "biz_premium_scope", pillar: "biz",
      question: "Votre positionnement premium/luxe concerne-t-il toute votre gamme ou seulement certains produits ?",
      type: "select",
      options: [
        "FULL::Toute la marque est positionnée premium/luxe",
        "PARTIAL::Seulement certains produits ou lignes",
        "NONE::Nous ne sommes pas positionnés premium/luxe",
      ],
      required: false,
    },
  ],

  // ========================================================================
  // ADVE Pillar questions
  // ========================================================================
  a: [
    { id: "a_vision", pillar: "a", question: "Quelle est la vision de votre marque ? Où voulez-vous être dans 10 ans ?", type: "text", required: true },
    { id: "a_mission", pillar: "a", question: "Quelle est votre mission ? Pourquoi votre marque existe-t-elle ?", type: "text", required: true },
    { id: "a_origin", pillar: "a", question: "Racontez l'histoire de la création de votre marque.", type: "text", required: false },
    { id: "a_values", pillar: "a", question: "Quelles sont les 3-5 valeurs fondamentales de votre marque ?", type: "text", required: true },
    { id: "a_archetype", pillar: "a", question: "Si votre marque était une personne, comment la décririez-vous ?", type: "text", required: false },
  ],
  d: [
    { id: "d_positioning", pillar: "d", question: "Qu'est-ce qui vous rend unique par rapport à vos concurrents ?", type: "text", required: true },
    { id: "d_visual", pillar: "d", question: "Comment décririez-vous votre identité visuelle ?", type: "select", options: ["Inexistante", "Basique", "Définie mais incohérente", "Professionnelle et cohérente", "Distinctive et mémorable"], required: true },
    { id: "d_voice", pillar: "d", question: "Quel ton utilisez-vous pour communiquer ?", type: "select", options: ["Pas défini", "Formel", "Décontracté", "Inspirant", "Provocateur", "Expert"], required: true },
    { id: "d_competitors", pillar: "d", question: "Nommez vos 3 principaux concurrents.", type: "text", required: false },
  ],
  v: [
    { id: "v_promise", pillar: "v", question: "Quelle promesse faites-vous à vos clients ?", type: "text", required: true },
    { id: "v_products", pillar: "v", question: "Quels sont vos produits/services principaux ?", type: "text", required: true },
    { id: "v_experience", pillar: "v", question: "Comment évaluez-vous l'expérience client que vous offrez ?", type: "scale", required: true },
  ],
  e: [
    { id: "e_community", pillar: "e", question: "Avez-vous une communauté autour de votre marque ?", type: "select", options: ["Aucune", "Réseaux sociaux basiques", "Communauté active", "Communauté engagée et fidèle"], required: true },
    { id: "e_loyalty", pillar: "e", question: "Quel % de vos clients reviennent régulièrement ?", type: "select", options: ["< 10%", "10-30%", "30-50%", "50-70%", "> 70%"], required: true },
    { id: "e_advocates", pillar: "e", question: "Vos clients recommandent-ils activement votre marque ?", type: "select", options: ["Jamais", "Rarement", "Parfois", "Souvent", "Systématiquement"], required: true },
    { id: "e_rituals", pillar: "e", question: "Avez-vous des rituels ou traditions de marque ?", type: "text", required: false },
  ],
  r: [
    { id: "r_threats", pillar: "r", question: "Quels sont les 3 plus grands risques pour votre marque ?", type: "text", required: true },
    { id: "r_crisis", pillar: "r", question: "Avez-vous un plan de gestion de crise ?", type: "select", options: ["Non", "En cours de création", "Basique", "Complet et testé"], required: true },
    { id: "r_reputation", pillar: "r", question: "Comment surveillez-vous votre réputation en ligne ?", type: "select", options: ["Pas du tout", "Manuellement parfois", "Outils basiques", "Monitoring avancé"], required: true },
  ],
  t: [
    { id: "t_kpis", pillar: "t", question: "Quels KPIs suivez-vous pour votre marque ?", type: "text", required: true },
    { id: "t_measurement", pillar: "t", question: "À quelle fréquence mesurez-vous la performance de votre marque ?", type: "select", options: ["Jamais", "Annuellement", "Trimestriellement", "Mensuellement", "En continu"], required: true },
    { id: "t_nps", pillar: "t", question: "Connaissez-vous votre Net Promoter Score (NPS) ?", type: "select", options: ["Non", "Approximativement", "Oui, mesuré régulièrement"], required: false },
  ],
  i: [
    { id: "i_roadmap", pillar: "i", question: "Avez-vous un plan marketing structuré ?", type: "select", options: ["Non", "Informel", "Plan annuel", "Plan 3 ans"], required: true },
    { id: "i_budget", pillar: "i", question: "Quel % de votre CA investissez-vous en marketing/branding ?", type: "select", options: ["< 2%", "2-5%", "5-10%", "10-15%", "> 15%"], required: true },
    { id: "i_team", pillar: "i", question: "Qui gère votre marque au quotidien ?", type: "select", options: ["Personne de dédié", "Le fondateur/DG", "Un responsable marketing", "Une équipe dédiée"], required: true },
  ],
  s: [
    { id: "s_guidelines", pillar: "s", question: "Avez-vous des guidelines de marque documentées ?", type: "select", options: ["Non", "Basiques (logo, couleurs)", "Complètes (voix, ton, visuels)", "Bible de marque exhaustive"], required: true },
    { id: "s_coherence", pillar: "s", question: "Sur une échelle de 1-10, à quel point votre communication est-elle cohérente sur tous les canaux ?", type: "scale", required: true },
    { id: "s_ambition", pillar: "s", question: "Où voulez-vous que votre marque soit dans 3 ans ?", type: "text", required: true },
  ],
};

export function getBusinessContextQuestions(): IntakeQuestion[] {
  return QUESTION_BANK.biz ?? [];
}

export function getAdaptiveQuestions(
  pillar: string,
  _existingResponses: Record<string, unknown>
): IntakeQuestion[] {
  const questions = QUESTION_BANK[pillar];
  if (!questions) return [];

  // TODO: Use AI to adapt questions based on existing responses
  // For now, return all questions for the pillar
  return questions;
}

export function getAllQuestions(): Record<string, IntakeQuestion[]> {
  return QUESTION_BANK;
}
