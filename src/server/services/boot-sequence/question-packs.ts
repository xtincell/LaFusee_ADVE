import type { PillarKey } from "@/lib/types/advertis-vector";

/**
 * Pack de questions par pilier pour le Boot Sequence.
 * Les `id` correspondent aux `keyAtoms` de PILLAR_REQUIREMENTS — chaque atome
 * rempli incremente le ratio de validation.
 *
 * Type:
 *  - text       : reponse libre (textarea)
 *  - text_short : ligne unique
 *  - select     : choix unique parmi options
 *  - multiselect: chips selectionnables (stocke comme array, alimente collections)
 *  - scale      : echelle 1-10
 */
export interface PackQuestion {
  id: string;
  label: string;
  helper?: string;
  type: "text" | "text_short" | "select" | "multiselect" | "scale";
  options?: string[];
  weight: "key" | "support";
  required?: boolean;
}

export const QUESTION_PACKS: Record<PillarKey, PackQuestion[]> = {
  a: [
    { id: "vision", label: "Vision a 10 ans", helper: "Ou voulez-vous etre dans 10 ans ?", type: "text", weight: "key", required: true },
    { id: "mission", label: "Mission", helper: "Pourquoi votre marque existe-t-elle ?", type: "text", weight: "key", required: true },
    { id: "purpose", label: "Raison d'etre profonde", helper: "Au-dela du profit, quel impact visez-vous ?", type: "text", weight: "key" },
    { id: "origin", label: "Histoire fondatrice", helper: "Le moment / la frustration qui a fait naitre la marque", type: "text", weight: "key" },
    { id: "founder_story", label: "Recit du fondateur", type: "text", weight: "support" },
    { id: "values", label: "Valeurs cardinales (3-5)", helper: "Une par ligne", type: "multiselect", weight: "key", required: true },
    { id: "manifesto", label: "Manifeste / credo", helper: "Phrase porte-drapeau", type: "text", weight: "support" },
    { id: "archetype", label: "Archetype dominant", type: "select", options: ["Le Createur", "Le Sage", "Le Heros", "L'Explorateur", "L'Outlaw", "Le Magicien", "Le Caregiver", "L'Innocent", "L'Amant", "Le Bouffon", "Le Souverain", "L'Homme ordinaire"], weight: "key" },
    { id: "cultural_anchor", label: "Ancrage culturel", helper: "A quelle culture / mouvement votre marque appartient-elle ?", type: "text", weight: "support" },
    { id: "brand_promise_emotional", label: "Promesse emotionnelle", helper: "Que ressent le client en interagissant avec vous ?", type: "text", weight: "support" },
    { id: "rituals", label: "Rituels de marque", helper: "Gestes / moments signature que vivent vos clients", type: "multiselect", weight: "support" },
    { id: "totem", label: "Totem / symbole emblematique", type: "text_short", weight: "support" },
  ],
  d: [
    { id: "positioning", label: "Positionnement strategique", helper: "Ce qui vous rend unique en une phrase", type: "text", weight: "key", required: true },
    { id: "differentiation", label: "Points de difference", helper: "3 elements qui ne peuvent etre copies facilement", type: "multiselect", weight: "key", required: true },
    { id: "competitors", label: "Concurrents directs", helper: "3 marques qui jouent sur le meme terrain", type: "multiselect", weight: "key" },
    { id: "voice", label: "Ton de voix", type: "select", options: ["Inspirant", "Expert", "Decontracte", "Provocateur", "Chaleureux", "Formel", "Audacieux", "Discret"], weight: "key", required: true },
    { id: "visual", label: "Maturite visuelle", type: "select", options: ["Inexistante", "Basique", "Definie mais incoherente", "Professionnelle et coherente", "Distinctive et memorable"], weight: "key", required: true },
    { id: "brand_codes", label: "Codes visuels signature", helper: "Elements graphiques recurrents", type: "multiselect", weight: "support" },
    { id: "logo_system", label: "Systeme de logos (variantes, regles)", type: "select", options: ["Inexistant", "Logo unique", "Variantes basiques", "Systeme complet", "Systeme adaptatif (responsive)"], weight: "support" },
    { id: "color_palette", label: "Palette de couleurs definie", type: "select", options: ["Aucune", "Couleurs ad hoc", "Palette principale", "Palette + secondaires", "Systeme tonal complet"], weight: "support" },
    { id: "typography", label: "Systeme typographique", type: "select", options: ["Aucun", "Une police", "Heading + body", "Hierarchie complete", "Typographie signature"], weight: "support" },
    { id: "naming_convention", label: "Convention de nommage produits", type: "text_short", weight: "support" },
  ],
  v: [
    { id: "promise", label: "Promesse client centrale", type: "text", weight: "key", required: true },
    { id: "value_proposition", label: "Proposition de valeur (formule UVP)", helper: "Pour [cible], qui [besoin], notre [produit] est le [categorie] qui [benefice unique].", type: "text", weight: "key", required: true },
    { id: "products", label: "Produits / services principaux", type: "multiselect", weight: "key", required: true },
    { id: "experience", label: "Qualite de l'experience client (1-10)", type: "scale", weight: "key" },
    { id: "sacrements", label: "Moments-cle du parcours client", helper: "Les 3-5 moments ou la valeur est ressentie", type: "multiselect", weight: "key" },
    { id: "pricing_logic", label: "Logique de prix", type: "select", options: ["Cost+", "Valeur perçue", "Concurrence", "Premium / scarcity", "Penetration", "Dynamique / personnalise"], weight: "support" },
    { id: "ux_signature", label: "Signature UX", helper: "Detail qui rend l'experience inoubliable", type: "text_short", weight: "support" },
    { id: "service_blueprint", label: "Blueprint de service formalise", type: "select", options: ["Non", "Informel", "Documente partiellement", "Documente integralement"], weight: "support" },
  ],
  e: [
    { id: "community", label: "Etat de la communaute", type: "select", options: ["Aucune", "Reseaux sociaux passifs", "Communaute active", "Communaute engagee et fidele", "Tribu cultuelle"], weight: "key", required: true },
    { id: "loyalty", label: "Taux de clients recurrents", type: "select", options: ["< 10%", "10-30%", "30-50%", "50-70%", "> 70%"], weight: "key", required: true },
    { id: "advocates", label: "Frequence de recommandation", type: "select", options: ["Jamais", "Rarement", "Parfois", "Souvent", "Systematiquement"], weight: "key", required: true },
    { id: "devotion_ladder", label: "Echelons de devotion identifies", helper: "Suspect → Prospect → Client → Fan → Ambassadeur → Apotre", type: "multiselect", weight: "key" },
    { id: "rituals", label: "Rituels communautaires", helper: "Rendez-vous, evenements, moments de partage", type: "multiselect", weight: "key" },
    { id: "temples", label: "Lieux / espaces communautaires", helper: "Boutique, forum, Discord, etc.", type: "multiselect", weight: "support" },
    { id: "clergy", label: "Animateurs / coeur de la communaute", type: "text", weight: "support" },
    { id: "ambassadors", label: "Programme ambassadeurs", type: "select", options: ["Aucun", "Informel", "Programme structure", "Programme premium"], weight: "support" },
    { id: "communication_loops", label: "Boucles de communication recurrentes", helper: "Newsletter, podcast, livestream...", type: "multiselect", weight: "support" },
    { id: "ugc_strategy", label: "Strategie UGC / contenu cree par les fans", type: "select", options: ["Aucune", "Reposts ad hoc", "Encouragee", "Programmee et amplifiee"], weight: "support" },
  ],
  r: [
    { id: "threats", label: "Top 3 menaces externes", type: "multiselect", weight: "key", required: true },
    { id: "swot_strengths", label: "Forces internes", type: "multiselect", weight: "key" },
    { id: "swot_weaknesses", label: "Faiblesses internes", type: "multiselect", weight: "key" },
    { id: "swot_opportunities", label: "Opportunites du marche", type: "multiselect", weight: "key" },
    { id: "swot_threats", label: "Risques marche/reputation", type: "multiselect", weight: "key" },
    { id: "crisis", label: "Plan de gestion de crise", type: "select", options: ["Inexistant", "En cours de creation", "Basique", "Documente et teste"], weight: "key", required: true },
    { id: "reputation", label: "Monitoring de reputation", type: "select", options: ["Pas du tout", "Manuel parfois", "Outils basiques", "Monitoring avance temps-reel"], weight: "key" },
    { id: "mitigation_plan", label: "Plan d'attenuation des risques", type: "text", weight: "support" },
  ],
  t: [
    { id: "kpis", label: "KPIs de marque suivis", type: "multiselect", weight: "key", required: true },
    { id: "measurement", label: "Frequence de mesure", type: "select", options: ["Jamais", "Annuellement", "Trimestriellement", "Mensuellement", "En continu"], weight: "key", required: true },
    { id: "nps", label: "Net Promoter Score", type: "select", options: ["Inconnu", "Approximatif", "Mesure annuel", "Mesure trimestriel", "Continu"], weight: "key" },
    { id: "market_validation", label: "Validation marche realisee", type: "select", options: ["Non", "Etude qualitative", "Etude quantitative", "Test marche", "Validation continue"], weight: "key" },
    { id: "scoring_method", label: "Methode de scoring de marque", type: "select", options: ["Aucune", "Interne ad hoc", "Framework externe", "ADVE-RTIS", "ADVE-RTIS + benchmarks"], weight: "support" },
    { id: "review_cadence", label: "Cadence de revue strategique", type: "select", options: ["Jamais", "Annuelle", "Semestrielle", "Trimestrielle", "Mensuelle"], weight: "support" },
  ],
  i: [
    { id: "roadmap", label: "Roadmap strategique formalisee", type: "select", options: ["Non", "Informelle", "Plan annuel", "Plan 3 ans", "Plan 5 ans + jalons"], weight: "key", required: true },
    { id: "budget", label: "Investissement marketing/branding (% CA)", type: "select", options: ["< 2%", "2-5%", "5-10%", "10-15%", "> 15%"], weight: "key", required: true },
    { id: "team", label: "Gouvernance de la marque", type: "select", options: ["Personne dedie", "Le fondateur", "Un responsable marketing", "Une equipe dediee", "Un comite de marque"], weight: "key", required: true },
    { id: "campaigns", label: "Campagnes activees ces 12 derniers mois", type: "multiselect", weight: "key" },
    { id: "drivers", label: "Drivers digitaux actifs", helper: "Site, SEO, social, paid, CRM, partenariats...", type: "multiselect", weight: "key" },
    { id: "channels", label: "Canaux de distribution actifs", type: "multiselect", weight: "support" },
    { id: "calendar", label: "Calendrier editorial", type: "select", options: ["Aucun", "Improvise", "Mensuel", "Trimestriel", "Annuel partage"], weight: "support" },
    { id: "ownership", label: "Responsable execution identifie", type: "text_short", weight: "support" },
  ],
  s: [
    { id: "guidelines", label: "Brand guidelines documentees", type: "select", options: ["Aucune", "Logo + couleurs", "Visuels + voix", "Bible complete", "Bible vivante (versionnee)"], weight: "key", required: true },
    { id: "coherence", label: "Coherence omnicanal (1-10)", type: "scale", weight: "key", required: true },
    { id: "ambition", label: "Ambition a 3 ans", type: "text", weight: "key", required: true },
    { id: "playbooks", label: "Playbooks operationnels", type: "multiselect", weight: "key" },
    { id: "governance", label: "Gouvernance de la marque", type: "select", options: ["Aucune", "CEO seul", "Comite executif", "Comite de marque dedie", "Comite + audits externes"], weight: "key" },
    { id: "brand_bible", label: "Brand bible accessible aux equipes", type: "select", options: ["Non", "Drive partage", "Portail interne", "Portail + onboarding"], weight: "support" },
  ],
};

export function getQuestionPack(pillar: PillarKey): PackQuestion[] {
  return QUESTION_PACKS[pillar] ?? [];
}
