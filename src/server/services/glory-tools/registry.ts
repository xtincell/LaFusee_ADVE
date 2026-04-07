/**
 * GLORY Tools — Creative Tools Registry
 * 4 Layers: CR (Copywriter), DC (Creative Direction), HYBRID (Operations), BRAND (Visual Identity Pipeline)
 * 20 Sequences: named workflows that chain tools into end-to-end deliverables
 *
 * ═══ PRODUCTION CRÉATIVE (par livrable) ═══
 *   BRAND        — Identité Visuelle complète (pipeline raffiné, 10 tools)
 *   KV           — Key Visual de campagne (concept → prompt AI image)
 *   SPOT-VIDEO   — Spot pub vidéo/TV (concept → script → storyboard → briefs prod)
 *   SPOT-RADIO   — Spot radio/audio (concept → script → dialogue → brief son)
 *   PRINT-AD     — Annonce presse (concept → claim → layout → body copy)
 *   OOH          — Affichage extérieur (concept → claim → layout → déclinaison formats)
 *   SOCIAL-POST  — Post social unitaire (concept → copy plateforme → brand check)
 *   STORY-ARC    — Arc narratif multi-contenus (concept → séquenceur → calendrier)
 *   WEB-COPY     — Contenu web / landing page (concept → long copy → brand check)
 *   NAMING       — Naming marque ou produit (sémiotique → wordplay → claims → évaluation)
 *   PACKAGING    — Direction packaging (sémiotique → chromatic → typo → brief vendor)
 *
 * ═══ STRATÉGIQUES ═══
 *   CAMPAIGN-360 — Campagne 360° complète (brief → archi → direction → media → simulation)
 *   LAUNCH       — Lancement produit/marque (benchmark → brief → campagne → digital)
 *   REBRAND      — Rebranding (audit → brand pipeline → migration guidelines)
 *   PITCH        — Compétition / appel d'offres (benchmark → brief → concept → pitch → présentation)
 *   ANNUAL-PLAN  — Planning annuel éditorial (calendrier → content → budget)
 *
 * ═══ OPÉRATIONNELLES ═══
 *   OPS          — Opérations Production (budget → devis → vendor → approval)
 *   GUARD        — Brand Governance (guardian → cohérence → approbation → audit)
 *   EVAL         — Post-campagne & Awards (résultats → ROI → évaluation → case)
 *   INFLUENCE    — Campagne influenceurs/KOL (benchmark → brief → copy → calendrier)
 *
 * UTILITY tools (wordplay-cultural-bank, benchmark-reference-finder, client-education-module)
 * participate in multiple sequences as pluggable enrichments.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type GloryLayer = "CR" | "DC" | "HYBRID" | "BRAND";

export type GlorySequenceFamily = "PILLAR" | "PRODUCTION" | "STRATEGIC" | "OPERATIONAL";

export type GlorySequenceKey =
  // Pilier ADVE-RTIS (8 deliverables fondamentaux — un par lettre)
  | "MANIFESTE-A"
  | "BRANDBOOK-D"
  | "OFFRE-V"
  | "PLAYBOOK-E"
  | "AUDIT-R"
  | "ETUDE-T"
  | "BRAINSTORM-I"
  | "ROADMAP-S"
  // Production créative (par livrable)
  | "BRAND"
  | "KV"
  | "SPOT-VIDEO"
  | "SPOT-RADIO"
  | "PRINT-AD"
  | "OOH"
  | "SOCIAL-POST"
  | "STORY-ARC"
  | "WEB-COPY"
  | "NAMING"
  | "PACKAGING"
  // Stratégiques
  | "CAMPAIGN-360"
  | "LAUNCH"
  | "REBRAND"
  | "PITCH"
  | "ANNUAL-PLAN"
  // Opérationnelles
  | "OPS"
  | "GUARD"
  | "EVAL"
  | "INFLUENCE";

export type GloryToolStatus = "ACTIVE" | "PLANNED";

export interface GloryToolDef {
  slug: string;
  name: string;
  layer: GloryLayer;
  order: number;
  sequenceKeys: GlorySequenceKey[];
  pillarKeys: string[];
  requiredDrivers: string[];
  dependencies: string[];
  description: string;
  inputFields: string[];
  outputFormat: string;
  promptTemplate: string;
  status: GloryToolStatus;
}

export interface GlorySequenceDef {
  key: GlorySequenceKey;
  family: GlorySequenceFamily;
  name: string;
  description: string;
  /** For pillar sequences: which ADVE-RTIS pillar this produces the main deliverable for */
  pillar?: string;
  /** Ordered list of tool slugs forming the chain */
  chain: string[];
  /** Tool slugs identified as missing — to be built */
  missingTools: Array<{ slug: string; name: string; insertAfter: string; description: string }>;
  /** True if the sequence has been refined and tested */
  refined: boolean;
}

// ─── Sequence Definitions ────────────────────────────────────────────────────

export const GLORY_SEQUENCES: GlorySequenceDef[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // PILIER ADVE-RTIS — 8 deliverables fondamentaux (un par lettre)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    key: "MANIFESTE-A",
    family: "PILLAR",
    name: "Le Manifeste",
    description: "Le document fondateur de l'Authenticité de la marque — ADN, voix, archétype, prophétie, manifeste rédigé.",
    pillar: "A",
    chain: [
      "semiotic-brand-analyzer",
      "wordplay-cultural-bank",
      "concept-generator",
      "claim-baseline-factory",
    ],
    missingTools: [
      { slug: "archetype-prophet-builder", name: "Constructeur Archétype & Prophétie", insertAfter: "semiotic-brand-analyzer", description: "Définit l'archétype de marque (12 archétypes jungiens) et formule la prophétie — la promesse transformationnelle que la marque fait au monde." },
      { slug: "tone-of-voice-designer", name: "Designer Ton de Voix", insertAfter: "wordplay-cultural-bank", description: "Définit le spectre vocal de la marque — registre, personnalité linguistique, vocabulaire signature, do/don't rédactionnels, exemples par canal." },
      { slug: "manifesto-writer", name: "Rédacteur de Manifeste", insertAfter: "claim-baseline-factory", description: "Rédige le manifeste de marque — texte fondateur qui cristallise l'ADN, la mission, la vision, et l'engagement de la marque envers ses superfans." },
    ],
    refined: false,
  },
  {
    key: "BRANDBOOK-D",
    family: "PILLAR",
    name: "Le Brandbook",
    description: "Le système visuel complet du pilier Distinction — identité, codes, guidelines. Encapsule la séquence BRAND + compilation.",
    pillar: "D",
    chain: [
      "semiotic-brand-analyzer",
      "visual-landscape-mapper",
      "visual-moodboard-generator",
      "chromatic-strategy-builder",
      "typography-system-architect",
      "logo-type-advisor",
      "logo-validation-protocol",
      "design-token-architect",
      "motion-identity-designer",
      "brand-guidelines-generator",
    ],
    missingTools: [
      { slug: "photography-style-guide", name: "Guide Style Photographique", insertAfter: "visual-moodboard-generator", description: "Définit la direction photo de la marque — cadrage, éclairage, palettes, sujets, retouche, stock vs. custom, do/don't visuels." },
      { slug: "iconography-system-builder", name: "Constructeur Système Iconographique", insertAfter: "design-token-architect", description: "Définit le système d'icônes de la marque — style (outline/filled/duo), grille, épaisseur, coins, cohérence avec la typo et le logo." },
    ],
    refined: false,
  },
  {
    key: "OFFRE-V",
    family: "PILLAR",
    name: "L'Offre Commerciale",
    description: "Le document de Valeur — proposition de valeur, pricing, argumentaire commercial, présentation client.",
    pillar: "V",
    chain: [
      "benchmark-reference-finder",
      "claim-baseline-factory",
      "devis-generator",
      "client-presentation-strategist",
    ],
    missingTools: [
      { slug: "value-proposition-builder", name: "Constructeur Proposition de Valeur", insertAfter: "benchmark-reference-finder", description: "Structure la proposition de valeur — bénéfice unique, preuves, différenciateurs, canvas proposition de valeur, pitch elevator." },
      { slug: "pricing-strategy-advisor", name: "Conseiller Stratégie de Pricing", insertAfter: "claim-baseline-factory", description: "Définit la stratégie de pricing — positionnement prix, grille tarifaire, packages, ancrage psychologique, comparatif marché." },
      { slug: "sales-deck-builder", name: "Constructeur Deck Commercial", insertAfter: "client-presentation-strategist", description: "Compile le deck commercial — slides proposition de valeur, cas clients, ROI démontré, objections/réponses, CTA." },
    ],
    refined: false,
  },
  {
    key: "PLAYBOOK-E",
    family: "PILLAR",
    name: "Le Playbook Engagement",
    description: "Le playbook du pilier Engagement — stratégie communautaire, content, rituels de marque, conversion superfans.",
    pillar: "E",
    chain: [
      "concept-generator",
      "social-copy-engine",
      "storytelling-sequencer",
      "content-calendar-strategist",
    ],
    missingTools: [
      { slug: "community-playbook-generator", name: "Générateur Playbook Communauté", insertAfter: "content-calendar-strategist", description: "Règles d'engagement — ton de réponse, FAQ, gestion de crise, templates, modération, stratégie UGC." },
      { slug: "superfan-journey-mapper", name: "Cartographe Parcours Superfan", insertAfter: "community-playbook-generator", description: "Mappe le parcours de la simple audience au superfan — touchpoints, rituels, rewards, escalation d'engagement, métriques de loyalty." },
      { slug: "engagement-rituals-designer", name: "Designer de Rituels de Marque", insertAfter: "superfan-journey-mapper", description: "Conçoit les rituels récurrents de la marque — rendez-vous hebdo, événements saisonniers, traditions communautaires, mécaniques de fidélisation." },
    ],
    refined: false,
  },
  {
    key: "AUDIT-R",
    family: "PILLAR",
    name: "L'Audit Interne",
    description: "L'audit du pilier Risk — diagnostic des risques de marque, conformité, vulnérabilités, plan de mitigation.",
    pillar: "R",
    chain: [
      "benchmark-reference-finder",
      "brand-guardian-system",
      "creative-evaluation-matrix",
    ],
    missingTools: [
      { slug: "risk-matrix-builder", name: "Constructeur Matrice de Risques", insertAfter: "brand-guardian-system", description: "Cartographie les risques de marque — réputation, juridique, concurrentiel, opérationnel. Probabilité × impact, plan de mitigation par risque." },
      { slug: "crisis-communication-planner", name: "Planificateur Communication de Crise", insertAfter: "risk-matrix-builder", description: "Prépare les scénarios de crise — messages pré-rédigés, chaîne de décision, porte-paroles, canaux prioritaires, timeline de réponse." },
      { slug: "compliance-checklist-generator", name: "Générateur Checklist Conformité", insertAfter: "creative-evaluation-matrix", description: "Génère les checklists de conformité par canal — réglementaire, marque, éthique, accessibilité, RGPD, droit à l'image." },
    ],
    refined: false,
  },
  {
    key: "ETUDE-T",
    family: "PILLAR",
    name: "L'Étude de Marché",
    description: "L'étude du pilier Track — intelligence marché, analyse concurrentielle, tendances, sizing, insights actionnables.",
    pillar: "T",
    chain: [
      "benchmark-reference-finder",
      "post-campaign-reader",
    ],
    missingTools: [
      { slug: "competitive-analysis-builder", name: "Analyse Concurrentielle", insertAfter: "benchmark-reference-finder", description: "Positionnement concurrents, forces/faiblesses, parts de voix, codes visuels, insights différenciation." },
      { slug: "market-sizing-estimator", name: "Estimateur Taille de Marché", insertAfter: "competitive-analysis-builder", description: "Estime la taille du marché — TAM/SAM/SOM, segments, croissance, pénétration, parts de marché atteignables." },
      { slug: "trend-radar-builder", name: "Constructeur Radar de Tendances", insertAfter: "market-sizing-estimator", description: "Cartographie les tendances sectorielles et culturelles — macro-trends, micro-trends, signaux faibles, fenêtres d'opportunité." },
      { slug: "insight-synthesizer", name: "Synthétiseur d'Insights", insertAfter: "post-campaign-reader", description: "Transforme les données brutes en insights actionnables — consumer insights, market insights, cultural insights, avec niveau de confiance." },
    ],
    refined: false,
  },
  {
    key: "BRAINSTORM-I",
    family: "PILLAR",
    name: "Le Brainstorm 360",
    description: "Le brainstorm du pilier Implementation — idéation multi-canaux, architecture de campagne, allocation ressources.",
    pillar: "I",
    chain: [
      "brief-creatif-interne",
      "concept-generator",
      "campaign-architecture-planner",
      "creative-direction-memo",
      "production-budget-optimizer",
    ],
    missingTools: [
      { slug: "ideation-workshop-facilitator", name: "Facilitateur Atelier Idéation", insertAfter: "brief-creatif-interne", description: "Structure un atelier de brainstorming — warm-up, techniques de créativité (SCAMPER, 6 chapeaux, etc.), grille de sélection, output structuré." },
      { slug: "resource-allocation-planner", name: "Planificateur Allocation Ressources", insertAfter: "production-budget-optimizer", description: "Alloue les ressources humaines et techniques — compétences requises, charge par profil, planning capacitaire, sous-traitance vs. interne." },
    ],
    refined: false,
  },
  {
    key: "ROADMAP-S",
    family: "PILLAR",
    name: "La Roadmap Stratégique",
    description: "La roadmap du pilier Strategy — vision long terme, objectifs, KPIs, jalons, gouvernance stratégique.",
    pillar: "S",
    chain: [
      "benchmark-reference-finder",
      "campaign-architecture-planner",
      "digital-planner",
    ],
    missingTools: [
      { slug: "strategic-diagnostic", name: "Diagnostic Stratégique", insertAfter: "benchmark-reference-finder", description: "SWOT augmenté + analyse des forces/faiblesses/opportunités/menaces avec scoring, priorisation, et recommandations stratégiques." },
      { slug: "kpi-framework-builder", name: "Constructeur Framework KPI", insertAfter: "campaign-architecture-planner", description: "Définit le framework de mesure — KPIs par objectif, sources de données, fréquence de reporting, seuils d'alerte, dashboards." },
      { slug: "milestone-roadmap-builder", name: "Constructeur Roadmap à Jalons", insertAfter: "digital-planner", description: "Construit la roadmap à 12-36 mois — phases stratégiques, jalons, dépendances, go/no-go, budget par phase, indicateurs de succès." },
    ],
    refined: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRODUCTION CRÉATIVE — un livrable = une séquence
  // ═══════════════════════════════════════════════════════════════════════════

  {
    key: "BRAND",
    family: "PRODUCTION",
    name: "Identité Visuelle",
    description: "Pipeline séquentiel de 10 outils pour construire l'identité visuelle complète d'une marque — de l'analyse sémiotique aux brand guidelines finales.",
    chain: [
      "semiotic-brand-analyzer",
      "visual-landscape-mapper",
      "visual-moodboard-generator",
      "chromatic-strategy-builder",
      "typography-system-architect",
      "logo-type-advisor",
      "logo-validation-protocol",
      "design-token-architect",
      "motion-identity-designer",
      "brand-guidelines-generator",
    ],
    missingTools: [],
    refined: true,
  },
  {
    key: "KV",
    family: "PRODUCTION",
    name: "Key Visual de Campagne",
    description: "Du concept créatif au prompt AI optimisé pour générer les Key Visuals via Nano Banana Pro / Midjourney / DALL-E, avec validation brand.",
    chain: [
      "concept-generator",
      "claim-baseline-factory",
      "creative-evaluation-matrix",
      "idea-killer-saver",
      "kv-banana-prompt-generator",
    ],
    missingTools: [
      { slug: "kv-art-direction-brief", name: "Brief DA pour KV", insertAfter: "idea-killer-saver", description: "Synthétise concept retenu + données BRAND (chromatic, typo, moodboard) en brief DA structuré pour le prompt generator." },
      { slug: "kv-review-validator", name: "Validateur de KV", insertAfter: "kv-banana-prompt-generator", description: "Évalue les KV générés vs brand guidelines, cohérence chromatique, lisibilité copy overlay. Score + corrections." },
    ],
    refined: false,
  },
  {
    key: "SPOT-VIDEO",
    family: "PRODUCTION",
    name: "Spot Pub Vidéo / TV",
    description: "Du concept au dossier de production vidéo complet — script, dialogues, storyboard, briefs casting et son.",
    chain: [
      "concept-generator",
      "script-writer",
      "dialogue-writer",
    ],
    missingTools: [
      { slug: "storyboard-generator", name: "Générateur de Storyboard", insertAfter: "dialogue-writer", description: "Découpe le script en plans visuels — cadrage, mouvement, transition, timing, notes de réalisation." },
      { slug: "casting-brief-generator", name: "Brief Casting", insertAfter: "storyboard-generator", description: "Profils comédiens/figurants — physique, âge, attitude, compétences, vêtements, diversité." },
      { slug: "music-sound-brief", name: "Brief Musique & Sound Design", insertAfter: "casting-brief-generator", description: "Direction musicale et sonore — genre, tempo, ambiance, SFX, voix off specs." },
    ],
    refined: false,
  },
  {
    key: "SPOT-RADIO",
    family: "PRODUCTION",
    name: "Spot Radio / Audio",
    description: "Du concept au spot radio — script audio, dialogues, brief voix off et sound design.",
    chain: [
      "concept-generator",
      "script-writer",
      "dialogue-writer",
    ],
    missingTools: [
      { slug: "voiceover-brief-generator", name: "Brief Voix Off", insertAfter: "dialogue-writer", description: "Specs voix off — genre vocal, ton, rythme, accents, exemples de direction, durée par segment." },
      { slug: "music-sound-brief", name: "Brief Musique & Sound Design", insertAfter: "voiceover-brief-generator", description: "Direction sonore radio — jingle, ambiance, SFX, mixage specs." },
    ],
    refined: false,
  },
  {
    key: "PRINT-AD",
    family: "PRODUCTION",
    name: "Annonce Presse",
    description: "Du concept à la maquette presse — claim, architecture visuelle, body copy.",
    chain: [
      "concept-generator",
      "claim-baseline-factory",
      "print-ad-architect",
      "long-copy-craftsman",
      "brand-guardian-system",
    ],
    missingTools: [],
    refined: false,
  },
  {
    key: "OOH",
    family: "PRODUCTION",
    name: "Affichage Extérieur",
    description: "Du concept au pack OOH multi-formats — claim, layout maître, déclinaisons 4x3 / abribus / 6m² / digital.",
    chain: [
      "concept-generator",
      "claim-baseline-factory",
      "print-ad-architect",
    ],
    missingTools: [
      { slug: "format-declination-engine", name: "Moteur Déclinaison Formats", insertAfter: "print-ad-architect", description: "Décline l'annonce maître sur tous formats OOH (4x3, abribus, 6m², digital) — adaptation layout, recadrage, ajustement copy." },
    ],
    refined: false,
  },
  {
    key: "SOCIAL-POST",
    family: "PRODUCTION",
    name: "Post Social Unitaire",
    description: "Du concept au post social finalisé pour une plateforme — copy optimisé, hashtags, CTA, vérification brand.",
    chain: [
      "concept-generator",
      "social-copy-engine",
      "brand-guardian-system",
    ],
    missingTools: [],
    refined: false,
  },
  {
    key: "STORY-ARC",
    family: "PRODUCTION",
    name: "Arc Narratif Multi-Contenus",
    description: "Du concept à l'arc narratif en épisodes avec calendrier de publication.",
    chain: [
      "concept-generator",
      "storytelling-sequencer",
      "social-copy-engine",
      "content-calendar-strategist",
    ],
    missingTools: [],
    refined: false,
  },
  {
    key: "WEB-COPY",
    family: "PRODUCTION",
    name: "Contenu Web / Landing Page",
    description: "Du concept au contenu web long-format optimisé — copy persuasif, structure SEO, vérification brand.",
    chain: [
      "concept-generator",
      "long-copy-craftsman",
      "brand-guardian-system",
    ],
    missingTools: [
      { slug: "seo-copy-optimizer", name: "Optimiseur Copy SEO", insertAfter: "long-copy-craftsman", description: "Optimise le contenu pour le référencement — mots-clés, structure Hn, méta descriptions, maillage interne, readability score." },
    ],
    refined: false,
  },
  {
    key: "NAMING",
    family: "PRODUCTION",
    name: "Naming Marque / Produit",
    description: "De l'analyse sémiotique au nom validé — exploration linguistique, claims dérivés, évaluation.",
    chain: [
      "semiotic-brand-analyzer",
      "wordplay-cultural-bank",
      "claim-baseline-factory",
      "creative-evaluation-matrix",
    ],
    missingTools: [
      { slug: "naming-generator", name: "Générateur de Noms", insertAfter: "wordplay-cultural-bank", description: "Génère des propositions de noms à partir de l'analyse sémiotique et de la banque culturelle — étymologie, sonorité, mémorabilité, disponibilité domaine." },
      { slug: "naming-legal-checker", name: "Vérificateur Légal de Nom", insertAfter: "creative-evaluation-matrix", description: "Vérifie la disponibilité juridique du nom — marques déposées, domaines web, réseaux sociaux, connotations négatives inter-langues." },
    ],
    refined: false,
  },
  {
    key: "PACKAGING",
    family: "PRODUCTION",
    name: "Direction Packaging",
    description: "De l'analyse sémiotique au brief packaging — stratégie chromatique, typographique, et brief fournisseur.",
    chain: [
      "semiotic-brand-analyzer",
      "chromatic-strategy-builder",
      "typography-system-architect",
      "vendor-brief-generator",
    ],
    missingTools: [
      { slug: "packaging-layout-advisor", name: "Conseiller Layout Packaging", insertAfter: "typography-system-architect", description: "Guide la hiérarchie visuelle du packaging — zones obligatoires, placement marque, claims, infos légales, facing shelf impact." },
    ],
    refined: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STRATÉGIQUES — orchestration de séquences de production
  // ═══════════════════════════════════════════════════════════════════════════

  {
    key: "CAMPAIGN-360",
    family: "STRATEGIC",
    name: "Campagne 360°",
    description: "Du brief interne à la simulation de campagne complète — architecture, direction créative, plan média, simulation, cohérence.",
    chain: [
      "brief-creatif-interne",
      "concept-generator",
      "campaign-architecture-planner",
      "creative-direction-memo",
      "digital-planner",
      "campaign-360-simulator",
      "multi-team-coherence-checker",
    ],
    missingTools: [
      { slug: "media-plan-builder", name: "Constructeur Plan Média", insertAfter: "creative-direction-memo", description: "Allocation média ATL/BTL/Digital — répartition budgétaire, GRP, CPM/CPC cibles, calendrier de diffusion." },
    ],
    refined: false,
  },
  {
    key: "LAUNCH",
    family: "STRATEGIC",
    name: "Lancement Produit / Marque",
    description: "Du benchmark au plan de lancement — analyse concurrentielle, brief, campagne, plan digital, simulation.",
    chain: [
      "benchmark-reference-finder",
      "brief-creatif-interne",
      "concept-generator",
      "campaign-architecture-planner",
      "digital-planner",
      "campaign-360-simulator",
    ],
    missingTools: [
      { slug: "competitive-analysis-builder", name: "Analyse Concurrentielle", insertAfter: "benchmark-reference-finder", description: "Positionnement concurrents, forces/faiblesses créatives, parts de voix, codes visuels, insights différenciation." },
      { slug: "launch-timeline-planner", name: "Planificateur Timeline Lancement", insertAfter: "campaign-360-simulator", description: "Rétro-planning de lancement — J-90 à J+30, milestones, dépendances, go/no-go checkpoints, war room planning." },
    ],
    refined: false,
  },
  {
    key: "REBRAND",
    family: "STRATEGIC",
    name: "Rebranding",
    description: "De l'audit de marque existante au déploiement des nouvelles guidelines — analyse, pipeline brand, migration.",
    chain: [
      "semiotic-brand-analyzer",
      "visual-landscape-mapper",
      "visual-moodboard-generator",
      "chromatic-strategy-builder",
      "typography-system-architect",
      "logo-type-advisor",
      "logo-validation-protocol",
      "design-token-architect",
      "brand-guidelines-generator",
    ],
    missingTools: [
      { slug: "brand-audit-scanner", name: "Scanner Audit de Marque", insertAfter: "semiotic-brand-analyzer", description: "Audit automatique des assets existants — conformité, cohérence, état des lieux avant rebrand." },
      { slug: "migration-playbook-generator", name: "Générateur Playbook Migration", insertAfter: "brand-guidelines-generator", description: "Plan de migration de l'ancienne vers la nouvelle identité — phases, touchpoints prioritaires, communication interne/externe, timeline." },
    ],
    refined: false,
  },
  {
    key: "PITCH",
    family: "STRATEGIC",
    name: "Pitch & Compétition",
    description: "Du benchmark au deck de pitch — recherche de références, brief, concept, structure de pitch, présentation client.",
    chain: [
      "benchmark-reference-finder",
      "brief-creatif-interne",
      "concept-generator",
      "pitch-architect",
      "client-presentation-strategist",
    ],
    missingTools: [
      { slug: "competitive-analysis-builder", name: "Analyse Concurrentielle", insertAfter: "benchmark-reference-finder", description: "Analyse structurée des concurrents — positionnement, forces/faiblesses, codes visuels, insights différenciation." },
      { slug: "credentials-deck-builder", name: "Constructeur Deck Credentials", insertAfter: "client-presentation-strategist", description: "Compile les credentials agence — cases pertinents, équipe dédiée, méthodologie, chiffres clés, témoignages clients." },
    ],
    refined: false,
  },
  {
    key: "ANNUAL-PLAN",
    family: "STRATEGIC",
    name: "Planning Annuel Éditorial",
    description: "Du calendrier annuel au budget content — thématiques, fréquences, allocation ressources.",
    chain: [
      "content-calendar-strategist",
      "digital-planner",
      "production-budget-optimizer",
    ],
    missingTools: [
      { slug: "seasonal-theme-planner", name: "Planificateur Thèmes Saisonniers", insertAfter: "content-calendar-strategist", description: "Mappe les temps forts de l'année (fêtes, événements sectoriels, saisons) sur les piliers de marque pour générer les thématiques mensuelles." },
      { slug: "content-mix-optimizer", name: "Optimiseur Mix Contenus", insertAfter: "digital-planner", description: "Optimise le ratio pillar/hero/hygiene content, la répartition par format (vidéo/image/texte), et les budgets prod par type de contenu." },
    ],
    refined: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OPÉRATIONNELLES
  // ═══════════════════════════════════════════════════════════════════════════

  {
    key: "OPS",
    family: "OPERATIONAL",
    name: "Opérations Production",
    description: "De l'optimisation budgétaire au workflow d'approbation — devis, briefs fournisseurs, gestion des flux.",
    chain: [
      "production-budget-optimizer",
      "devis-generator",
      "vendor-brief-generator",
      "approval-workflow-manager",
    ],
    missingTools: [],
    refined: false,
  },
  {
    key: "GUARD",
    family: "OPERATIONAL",
    name: "Brand Governance",
    description: "Surveillance et maintien de la cohérence de marque — vérification de conformité, cohérence multi-équipe, audit.",
    chain: [
      "brand-guardian-system",
      "multi-team-coherence-checker",
      "approval-workflow-manager",
    ],
    missingTools: [
      { slug: "brand-audit-scanner", name: "Scanner Audit de Marque", insertAfter: "approval-workflow-manager", description: "Audit automatique de tous les assets publiés — conformité logo, couleurs, typo, ton. Rapport santé de marque + actions correctives." },
    ],
    refined: false,
  },
  {
    key: "EVAL",
    family: "OPERATIONAL",
    name: "Post-Campagne & Awards",
    description: "De l'analyse post-campagne au dossier de candidature awards — résultats, ROI, évaluation, case study.",
    chain: [
      "post-campaign-reader",
      "creative-evaluation-matrix",
      "award-case-builder",
    ],
    missingTools: [
      { slug: "roi-calculator", name: "Calculateur ROI Créatif", insertAfter: "post-campaign-reader", description: "Coût par engagement, earned media value, brand lift estimé, corrélation investissement/résultat." },
    ],
    refined: false,
  },
  {
    key: "INFLUENCE",
    family: "OPERATIONAL",
    name: "Campagne Influenceurs / KOL",
    description: "Du benchmark au brief influenceur — recherche de profils, brief, copy, calendrier de collaboration.",
    chain: [
      "benchmark-reference-finder",
      "concept-generator",
      "social-copy-engine",
      "content-calendar-strategist",
    ],
    missingTools: [
      { slug: "influencer-brief-generator", name: "Brief Influenceur", insertAfter: "concept-generator", description: "Profil recherché, deliverables, do/don't, messages clés, liberté créative, métriques attendues, conditions contractuelles." },
      { slug: "ugc-framework-builder", name: "Framework UGC", insertAfter: "content-calendar-strategist", description: "Cadre pour le User Generated Content — guidelines créatives, hashtags de campagne, mécaniques de participation, curation rules." },
    ],
    refined: false,
  },
];

// ─── LAYER CR — Concepteur-Rédacteur (10 tools) ─────────────────────────────

const CR_TOOLS: GloryToolDef[] = [
  {
    slug: "concept-generator",
    name: "Générateur de Concepts",
    layer: "CR",
    order: 1,
    sequenceKeys: ["MANIFESTE-A", "PLAYBOOK-E", "BRAINSTORM-I", "KV", "SPOT-VIDEO", "SPOT-RADIO", "PRINT-AD", "OOH", "SOCIAL-POST", "STORY-ARC", "WEB-COPY", "CAMPAIGN-360", "LAUNCH", "PITCH", "INFLUENCE"],
    pillarKeys: ["A", "D"],
    requiredDrivers: [],
    dependencies: [],
    description: "Génère des concepts créatifs à partir du brief et de l'ADN de marque",
    inputFields: ["brief", "brand_dna", "target", "tone", "constraints"],
    outputFormat: "concepts_list",
    promptTemplate: `En tant que concepteur-rédacteur senior, génère 5 concepts créatifs pour ce brief.
Contexte marque : {{brand_dna}}
Brief : {{brief}}
Cible : {{target}}
Ton : {{tone}}
Contraintes : {{constraints}}
Pour chaque concept, fournis : titre, accroche, description (3 lignes), déclinaisons possibles.`,
    status: "ACTIVE",
  },
  {
    slug: "script-writer",
    name: "Scripteur",
    layer: "CR",
    order: 2,
    sequenceKeys: ["SPOT-VIDEO", "SPOT-RADIO"],
    pillarKeys: ["A", "E"],
    requiredDrivers: ["VIDEO", "TV", "RADIO"],
    dependencies: ["concept-generator"],
    description: "Écrit des scripts pour vidéo, TV et radio",
    inputFields: ["concept", "duration", "format", "tone", "cta"],
    outputFormat: "script",
    promptTemplate: `Écris un script {{format}} de {{duration}} secondes.
Concept : {{concept}}
Ton : {{tone}}
CTA : {{cta}}
Structure : Accroche (3s) → Développement → Climax → CTA.
Format : dialogues, indications de réalisation, musique/SFX.`,
    status: "ACTIVE",
  },
  {
    slug: "long-copy-craftsman",
    name: "Artisan du Long Copy",
    layer: "CR",
    order: 3,
    sequenceKeys: ["PRINT-AD", "WEB-COPY"],
    pillarKeys: ["A", "V"],
    requiredDrivers: ["PRINT", "WEBSITE"],
    dependencies: [],
    description: "Rédige du contenu long-format persuasif",
    inputFields: ["topic", "angle", "target", "length", "cta"],
    outputFormat: "long_copy",
    promptTemplate: `Rédige un texte long-format persuasif sur le sujet : {{topic}}
Angle : {{angle}} | Cible : {{target}} | Longueur : {{length}} mots
Structure narrative : Hook → Problem → Agitation → Solution → Proof → CTA.`,
    status: "ACTIVE",
  },
  {
    slug: "dialogue-writer",
    name: "Dialoguiste",
    layer: "CR",
    order: 4,
    sequenceKeys: ["SPOT-VIDEO", "SPOT-RADIO"],
    pillarKeys: ["A", "E"],
    requiredDrivers: ["VIDEO", "RADIO"],
    dependencies: [],
    description: "Crée des dialogues naturels et mémorables",
    inputFields: ["scenario", "characters", "tone", "key_message"],
    outputFormat: "dialogue",
    promptTemplate: `Écris un dialogue pour ce scénario :
{{scenario}}
Personnages : {{characters}}
Ton : {{tone}}
Message clé à intégrer naturellement : {{key_message}}`,
    status: "ACTIVE",
  },
  {
    slug: "claim-baseline-factory",
    name: "Usine à Claims & Baselines",
    layer: "CR",
    order: 5,
    sequenceKeys: ["MANIFESTE-A", "OFFRE-V", "KV", "PRINT-AD", "OOH", "NAMING"],
    pillarKeys: ["D", "V"],
    requiredDrivers: [],
    dependencies: [],
    description: "Génère des slogans, claims et baselines",
    inputFields: ["brand_positioning", "key_benefit", "tone", "constraints"],
    outputFormat: "claims_list",
    promptTemplate: `Génère 10 claims/baselines pour cette marque :
Positionnement : {{brand_positioning}}
Bénéfice clé : {{key_benefit}}
Ton : {{tone}}
Pour chaque proposition : version courte (≤5 mots), version longue (≤10 mots), justification.`,
    status: "ACTIVE",
  },
  {
    slug: "print-ad-architect",
    name: "Architecte Print",
    layer: "CR",
    order: 6,
    sequenceKeys: ["PRINT-AD", "OOH"],
    pillarKeys: ["D"],
    requiredDrivers: ["PRINT", "OOH"],
    dependencies: ["concept-generator"],
    description: "Conçoit des annonces presse et affiches",
    inputFields: ["concept", "format", "headline", "visual_direction"],
    outputFormat: "print_ad_spec",
    promptTemplate: `Conçois une annonce {{format}} :
Concept : {{concept}}
Headline proposé : {{headline}}
Direction visuelle : {{visual_direction}}
Livrable : layout description, headline, body copy, CTA, indications visuelles.`,
    status: "ACTIVE",
  },
  {
    slug: "social-copy-engine",
    name: "Moteur Copy Social",
    layer: "CR",
    order: 7,
    sequenceKeys: ["PLAYBOOK-E", "SOCIAL-POST", "STORY-ARC", "INFLUENCE"],
    pillarKeys: ["E"],
    requiredDrivers: ["INSTAGRAM", "FACEBOOK", "TIKTOK", "LINKEDIN"],
    dependencies: [],
    description: "Rédige du contenu optimisé pour chaque plateforme sociale",
    inputFields: ["platform", "content_type", "topic", "tone", "hashtags_strategy"],
    outputFormat: "social_copy_set",
    promptTemplate: `Rédige le copy pour {{platform}} ({{content_type}}) :
Sujet : {{topic}} | Ton : {{tone}}
Stratégie hashtags : {{hashtags_strategy}}
Fournis : copy principal, variantes A/B, hashtags, CTA, heures de publication recommandées.`,
    status: "ACTIVE",
  },
  {
    slug: "storytelling-sequencer",
    name: "Séquenceur Narratif",
    layer: "CR",
    order: 8,
    sequenceKeys: ["PLAYBOOK-E", "STORY-ARC"],
    pillarKeys: ["A", "E"],
    requiredDrivers: [],
    dependencies: ["concept-generator"],
    description: "Structure les arcs narratifs sur plusieurs contenus",
    inputFields: ["story_arc", "episodes", "platform", "frequency"],
    outputFormat: "story_sequence",
    promptTemplate: `Séquence un arc narratif en {{episodes}} épisodes :
Arc : {{story_arc}}
Plateforme : {{platform}} | Fréquence : {{frequency}}
Pour chaque épisode : titre, hook, contenu, cliffhanger, CTA.`,
    status: "ACTIVE",
  },
  {
    slug: "wordplay-cultural-bank",
    name: "Banque Jeux de Mots & Références Culturelles",
    layer: "CR",
    order: 9,
    sequenceKeys: ["MANIFESTE-A", "NAMING"],
    pillarKeys: ["A", "D"],
    requiredDrivers: [],
    dependencies: [],
    description: "Génère des jeux de mots et références culturelles contextuelles (outil utilitaire, pluggable dans toute séquence)",
    inputFields: ["brand_name", "market", "cultural_context", "language"],
    outputFormat: "wordplay_bank",
    promptTemplate: `Génère une banque de jeux de mots et références culturelles :
Marque : {{brand_name}} | Marché : {{market}}
Contexte culturel : {{cultural_context}} | Langue : {{language}}
Catégories : jeux de mots, références pop culture, expressions locales, double sens.`,
    status: "ACTIVE",
  },
  {
    slug: "brief-creatif-interne",
    name: "Brief Créatif Interne",
    layer: "CR",
    order: 10,
    sequenceKeys: ["BRAINSTORM-I", "CAMPAIGN-360", "LAUNCH", "PITCH"],
    pillarKeys: ["I"],
    requiredDrivers: [],
    dependencies: [],
    description: "Génère des briefs créatifs structurés pour l'équipe",
    inputFields: ["objective", "target", "key_message", "deliverables", "budget", "deadline"],
    outputFormat: "creative_brief",
    promptTemplate: `Rédige un brief créatif interne :
Objectif : {{objective}} | Cible : {{target}}
Message clé : {{key_message}}
Livrables attendus : {{deliverables}}
Budget : {{budget}} | Deadline : {{deadline}}
Format : contexte, insight, promesse, preuve, ton, do/don't, livrables, timing.`,
    status: "ACTIVE",
  },
];

// ─── LAYER DC — Direction de Création (9 tools) ─────────────────────────────

const DC_TOOLS: GloryToolDef[] = [
  {
    slug: "campaign-architecture-planner",
    name: "Planificateur d'Architecture de Campagne",
    layer: "DC",
    order: 11,
    sequenceKeys: ["BRAINSTORM-I", "ROADMAP-S", "CAMPAIGN-360", "LAUNCH"],
    pillarKeys: ["I", "E"],
    requiredDrivers: [],
    dependencies: [],
    description: "Planifie l'architecture créative globale d'une campagne",
    inputFields: ["campaign_objectives", "budget", "timeline", "channels", "creative_territory"],
    outputFormat: "campaign_architecture",
    promptTemplate: `Planifie l'architecture créative de la campagne :
Objectifs : {{campaign_objectives}} | Budget : {{budget}}
Timeline : {{timeline}} | Canaux : {{channels}}
Territoire créatif : {{creative_territory}}
Livrable : phases, concepts par phase, déclinaisons par canal, cohérence narrative.`,
    status: "ACTIVE",
  },
  {
    slug: "creative-evaluation-matrix",
    name: "Matrice d'Évaluation Créative",
    layer: "DC",
    order: 12,
    sequenceKeys: ["AUDIT-R", "KV", "NAMING", "EVAL"],
    pillarKeys: ["D", "T"],
    requiredDrivers: [],
    dependencies: [],
    description: "Évalue les propositions créatives selon des critères objectifs",
    inputFields: ["proposals", "criteria", "brand_guidelines", "objectives"],
    outputFormat: "evaluation_matrix",
    promptTemplate: `Évalue les propositions créatives :
Propositions : {{proposals}}
Critères : pertinence stratégique, impact créatif, faisabilité, cohérence marque, mémorabilité.
Guidelines marque : {{brand_guidelines}}
Score chaque proposition sur 10 par critère, avec justification.`,
    status: "ACTIVE",
  },
  {
    slug: "idea-killer-saver",
    name: "Idea Killer/Saver",
    layer: "DC",
    order: 13,
    sequenceKeys: ["KV"],
    pillarKeys: ["D"],
    requiredDrivers: [],
    dependencies: ["creative-evaluation-matrix"],
    description: "Filtre les idées : kill, save, ou pivot",
    inputFields: ["ideas", "brand_fit", "market_context", "budget_reality"],
    outputFormat: "idea_triage",
    promptTemplate: `Triage les idées créatives :
Pour chaque idée, verdict : KILL (pourquoi), SAVE (pourquoi + renforcement), PIVOT (vers quoi).
Critères : faisabilité, différenciation, cohérence marque, potentiel viral.`,
    status: "ACTIVE",
  },
  {
    slug: "multi-team-coherence-checker",
    name: "Vérificateur de Cohérence Multi-Équipe",
    layer: "DC",
    order: 14,
    sequenceKeys: ["CAMPAIGN-360", "GUARD"],
    pillarKeys: ["D", "I"],
    requiredDrivers: [],
    dependencies: [],
    description: "Vérifie la cohérence créative entre équipes et canaux",
    inputFields: ["team_outputs", "brand_guidelines", "campaign_brief"],
    outputFormat: "coherence_report",
    promptTemplate: `Vérifie la cohérence créative entre les livrables des différentes équipes.
Identifie : incohérences visuelles, tonales, narratives, de message.
Recommande : ajustements pour harmoniser, éléments à conserver.`,
    status: "ACTIVE",
  },
  {
    slug: "client-presentation-strategist",
    name: "Stratège de Présentation Client",
    layer: "DC",
    order: 15,
    sequenceKeys: ["OFFRE-V", "PITCH"],
    pillarKeys: ["V", "E"],
    requiredDrivers: [],
    dependencies: [],
    description: "Structure les présentations créatives pour le client",
    inputFields: ["creative_work", "client_context", "objectives", "concerns"],
    outputFormat: "presentation_strategy",
    promptTemplate: `Structure la présentation client :
Travail créatif : {{creative_work}}
Contexte client : {{client_context}}
Objectifs de la présentation : convaincre, inspirer, rassurer.
Livrable : arc narratif, arguments clés, anticipation des objections, recommandation.`,
    status: "ACTIVE",
  },
  {
    slug: "creative-direction-memo",
    name: "Mémo de Direction Créative",
    layer: "DC",
    order: 16,
    sequenceKeys: ["BRAINSTORM-I", "CAMPAIGN-360"],
    pillarKeys: ["D"],
    requiredDrivers: [],
    dependencies: [],
    description: "Rédige des mémos de direction créative pour guider les équipes",
    inputFields: ["vision", "references", "do_dont", "tone_board"],
    outputFormat: "direction_memo",
    promptTemplate: `Rédige un mémo de direction créative :
Vision : {{vision}}
Références : {{references}}
Do : ... | Don't : ...
Tone board : {{tone_board}}
Format : manifeste court, principes directeurs, exemples, anti-exemples.`,
    status: "ACTIVE",
  },
  {
    slug: "pitch-architect",
    name: "Architecte de Pitch",
    layer: "DC",
    order: 17,
    sequenceKeys: ["PITCH"],
    pillarKeys: ["V", "A"],
    requiredDrivers: [],
    dependencies: [],
    description: "Structure les pitches pour les compétitions et appels d'offres",
    inputFields: ["client_brief", "agency_strengths", "creative_proposal", "budget"],
    outputFormat: "pitch_structure",
    promptTemplate: `Structure le pitch :
Brief client : {{client_brief}}
Forces agence : {{agency_strengths}}
Proposition créative : {{creative_proposal}}
Format : contexte → insight → stratégie → idée → exécution → équipe → budget.`,
    status: "ACTIVE",
  },
  {
    slug: "award-case-builder",
    name: "Constructeur de Cases Awards",
    layer: "DC",
    order: 18,
    sequenceKeys: ["EVAL"],
    pillarKeys: ["T", "E"],
    requiredDrivers: [],
    dependencies: [],
    description: "Construit des dossiers pour les concours publicitaires",
    inputFields: ["campaign_results", "creative_work", "category", "award_criteria"],
    outputFormat: "award_case",
    promptTemplate: `Construis le case study pour soumission aux awards :
Résultats : {{campaign_results}}
Catégorie : {{category}}
Critères : {{award_criteria}}
Format : challenge → insight → idea → execution → results (avec métriques).`,
    status: "ACTIVE",
  },
  {
    slug: "kv-banana-prompt-generator",
    name: "Générateur de Prompts Banana pour KV",
    layer: "DC",
    order: 19,
    sequenceKeys: ["KV"],
    pillarKeys: ["A", "D", "V"],
    requiredDrivers: [],
    dependencies: ["concept-generator"],
    description: "Assemble les variables des piliers A-D-V en prompts optimisés pour la génération d'images KV (Key Visuals) de campagne. Puise exclusivement dans les données existantes — n'invente rien.",
    inputFields: ["format", "campaign_context"],
    outputFormat: "kv_prompts_list",
    promptTemplate: `Tu es directeur artistique senior spécialisé en production de Key Visuals pour campagnes publicitaires.

CONTEXTE MARQUE (extrait des piliers ADVE — données réelles, ne rien inventer) :
- Archétype : {{archetype}}
- Prophétie : {{prophecy}}
- Promesse maître : {{master_promise}}
- Ton de voix : {{tone_of_voice}}
- Personnalité : {{personality}}
- Direction chromatique : {{chromatic_strategy}}
- Système typographique : {{typography_system}}
- Moodboard : {{moodboard_keywords}}
- Persona cible : {{primary_persona}}
- Slogan/Tagline : {{linguistic_assets}}
- Concept créatif retenu : {{concept}}

BRIEF KV :
Format cible : {{format}}
Contexte campagne : {{campaign_context}}

MISSION :
Génère 3 prompts en langage naturel optimisés pour la génération d'images AI (Nano Banana Pro / Midjourney / DALL-E).
Chaque prompt doit :
1. Décrire la composition (sujet, arrière-plan, éclairage, angle)
2. Intégrer les couleurs de la stratégie chromatique
3. Refléter l'archétype et la personnalité de marque
4. Être adapté au format cible (OOH 4x3, Story IG, Post LinkedIn, Print A4)
5. Inclure des directives de style photo/illustration cohérentes avec le moodboard

Format de sortie JSON :
{
  "prompts": [
    {
      "format": "nom du format",
      "prompt": "le prompt complet en langage naturel",
      "style_notes": "notes additionnelles pour le DA",
      "copy_overlay": "texte à superposer (slogan/tagline)"
    }
  ]
}`,
    status: "ACTIVE",
  },
];

// ─── LAYER HYBRID — Operations (11 tools) ────────────────────────────────────

const HYBRID_TOOLS: GloryToolDef[] = [
  {
    slug: "campaign-360-simulator",
    name: "Simulateur 360° de Campagne",
    layer: "HYBRID",
    order: 20,
    sequenceKeys: ["CAMPAIGN-360", "LAUNCH"],
    pillarKeys: ["I", "T"],
    requiredDrivers: [],
    dependencies: [],
    description: "Simule l'impact d'une campagne avant lancement",
    inputFields: ["campaign_plan", "budget", "channels", "historical_data"],
    outputFormat: "simulation_report",
    promptTemplate: `Simule la campagne 360° :
Plan : {{campaign_plan}} | Budget : {{budget}}
Canaux : {{channels}}
Projections : reach, engagement, conversions par canal, ROI estimé, risques.`,
    status: "ACTIVE",
  },
  {
    slug: "production-budget-optimizer",
    name: "Optimiseur Budget Production",
    layer: "HYBRID",
    order: 21,
    sequenceKeys: ["BRAINSTORM-I", "OPS", "ANNUAL-PLAN"],
    pillarKeys: ["I"],
    requiredDrivers: [],
    dependencies: [],
    description: "Optimise l'allocation budgétaire de production",
    inputFields: ["deliverables", "budget", "quality_requirements", "timeline"],
    outputFormat: "budget_optimization",
    promptTemplate: `Optimise le budget de production :
Livrables : {{deliverables}} | Budget : {{budget}} XAF
Qualité requise : {{quality_requirements}} | Timeline : {{timeline}}
Recommande : allocation par livrable, alternatives économiques, points de négociation.`,
    status: "ACTIVE",
  },
  {
    slug: "vendor-brief-generator",
    name: "Générateur de Brief Fournisseur",
    layer: "HYBRID",
    order: 22,
    sequenceKeys: ["OPS"],
    pillarKeys: ["I"],
    requiredDrivers: [],
    dependencies: [],
    description: "Génère des briefs pour les fournisseurs externes",
    inputFields: ["deliverable", "specs", "deadline", "budget", "quality_criteria"],
    outputFormat: "vendor_brief",
    promptTemplate: `Génère un brief fournisseur :
Livrable : {{deliverable}} | Specs : {{specs}}
Deadline : {{deadline}} | Budget : {{budget}} XAF
Format : contexte, livrables attendus, specs techniques, critères de qualité, calendrier, conditions.`,
    status: "ACTIVE",
  },
  {
    slug: "devis-generator",
    name: "Générateur de Devis",
    layer: "HYBRID",
    order: 23,
    sequenceKeys: ["OPS"],
    pillarKeys: ["V"],
    requiredDrivers: [],
    dependencies: [],
    description: "Génère des devis détaillés pour les clients",
    inputFields: ["services", "pricing", "timeline", "client_info"],
    outputFormat: "devis",
    promptTemplate: `Génère un devis détaillé :
Services : {{services}} | Pricing : {{pricing}}
Timeline : {{timeline}}
Format : ligne par ligne avec description, quantité, prix unitaire, total, conditions.`,
    status: "ACTIVE",
  },
  {
    slug: "content-calendar-strategist",
    name: "Stratège Calendrier Éditorial",
    layer: "HYBRID",
    order: 24,
    sequenceKeys: ["PLAYBOOK-E", "STORY-ARC", "ANNUAL-PLAN", "INFLUENCE"],
    pillarKeys: ["I", "E"],
    requiredDrivers: ["INSTAGRAM", "FACEBOOK", "TIKTOK", "LINKEDIN"],
    dependencies: [],
    description: "Planifie le calendrier éditorial multi-plateforme",
    inputFields: ["platforms", "frequency", "themes", "events", "duration"],
    outputFormat: "content_calendar",
    promptTemplate: `Planifie le calendrier éditorial sur {{duration}} :
Plateformes : {{platforms}} | Fréquence : {{frequency}}
Thèmes : {{themes}} | Événements clés : {{events}}
Pour chaque semaine : jours de publication, plateforme, type de contenu, thème, CTA.`,
    status: "ACTIVE",
  },
  {
    slug: "approval-workflow-manager",
    name: "Gestionnaire Workflow d'Approbation",
    layer: "HYBRID",
    order: 25,
    sequenceKeys: ["OPS", "GUARD"],
    pillarKeys: ["I"],
    requiredDrivers: [],
    dependencies: [],
    description: "Définit et gère les workflows d'approbation",
    inputFields: ["deliverable_type", "stakeholders", "sla", "escalation_rules"],
    outputFormat: "workflow_definition",
    promptTemplate: `Définis le workflow d'approbation pour {{deliverable_type}} :
Parties prenantes : {{stakeholders}}
SLA : {{sla}}
Règles d'escalation : {{escalation_rules}}
Livrable : étapes, approbateurs par étape, SLA par étape, escalation, notifications.`,
    status: "ACTIVE",
  },
  {
    slug: "brand-guardian-system",
    name: "Système Gardien de Marque",
    layer: "HYBRID",
    order: 26,
    sequenceKeys: ["GUARD"],
    pillarKeys: ["D"],
    requiredDrivers: [],
    dependencies: [],
    description: "Vérifie la conformité d'un contenu aux guidelines de marque",
    inputFields: ["content", "brand_guidelines", "channel"],
    outputFormat: "compliance_report",
    promptTemplate: `Vérifie la conformité aux guidelines de marque :
Contenu : {{content}} | Canal : {{channel}}
Vérifie : logo usage, couleurs, typographie, ton de voix, messages interdits, format.
Verdict : CONFORME / NON-CONFORME avec détail des écarts et corrections suggérées.`,
    status: "ACTIVE",
  },
  {
    slug: "client-education-module",
    name: "Module Éducation Client",
    layer: "HYBRID",
    order: 27,
    sequenceKeys: ["OFFRE-V"],
    pillarKeys: ["E", "V"],
    requiredDrivers: [],
    dependencies: [],
    description: "Crée du contenu éducatif pour les clients (outil utilitaire standalone)",
    inputFields: ["topic", "client_level", "format", "objectives"],
    outputFormat: "educational_content",
    promptTemplate: `Crée un module éducatif client :
Sujet : {{topic}} | Niveau : {{client_level}} | Format : {{format}}
Objectifs d'apprentissage : {{objectives}}
Structure : introduction, concepts clés, exemples, exercices pratiques, ressources.`,
    status: "ACTIVE",
  },
  {
    slug: "benchmark-reference-finder",
    name: "Chercheur de Benchmarks & Références",
    layer: "HYBRID",
    order: 28,
    sequenceKeys: ["OFFRE-V", "AUDIT-R", "ETUDE-T", "ROADMAP-S", "PITCH", "LAUNCH", "INFLUENCE"],
    pillarKeys: ["T", "D"],
    requiredDrivers: [],
    dependencies: [],
    description: "Trouve des benchmarks et références créatives pertinents (SESHAT fallback, utilitaire d'entrée)",
    inputFields: ["sector", "market", "channel", "creative_territory"],
    outputFormat: "benchmark_report",
    promptTemplate: `Trouve des benchmarks et références créatives :
Secteur : {{sector}} | Marché : {{market}} | Canal : {{channel}}
Territoire créatif : {{creative_territory}}
Pour chaque référence : marque, campagne, ce qui fonctionne, applicabilité, source.`,
    status: "ACTIVE",
  },
  {
    slug: "post-campaign-reader",
    name: "Lecteur Post-Campagne",
    layer: "HYBRID",
    order: 29,
    sequenceKeys: ["EVAL"],
    pillarKeys: ["T"],
    requiredDrivers: [],
    dependencies: [],
    description: "Analyse les résultats post-campagne et génère les learnings",
    inputFields: ["campaign_results", "objectives", "budget_spent", "timeline"],
    outputFormat: "post_campaign_report",
    promptTemplate: `Analyse post-campagne :
Résultats : {{campaign_results}} | Objectifs initiaux : {{objectives}}
Budget dépensé : {{budget_spent}} XAF | Timeline : {{timeline}}
Format : résumé exécutif, KPI vs. objectifs, learnings, recommandations next steps.`,
    status: "ACTIVE",
  },
  {
    slug: "digital-planner",
    name: "Planificateur Digital",
    layer: "HYBRID",
    order: 30,
    sequenceKeys: ["ROADMAP-S", "CAMPAIGN-360", "LAUNCH", "ANNUAL-PLAN"],
    pillarKeys: ["I", "T"],
    requiredDrivers: ["INSTAGRAM", "FACEBOOK", "TIKTOK", "LINKEDIN", "WEBSITE"],
    dependencies: [],
    description: "Planifie les campagnes digitales (paid + organic)",
    inputFields: ["objectives", "budget", "platforms", "targeting", "duration"],
    outputFormat: "digital_plan",
    promptTemplate: `Planifie la campagne digitale :
Objectifs : {{objectives}} | Budget : {{budget}} XAF
Plateformes : {{platforms}} | Ciblage : {{targeting}} | Durée : {{duration}}
Livrable : allocation par plateforme, formats, ciblages, calendrier, KPI cibles, A/B tests.`,
    status: "ACTIVE",
  },
];

// ─── LAYER BRAND — Visual Identity Pipeline (10 tools, sequential) ───────────

const BRAND_TOOLS: GloryToolDef[] = [
  {
    slug: "semiotic-brand-analyzer",
    name: "Analyseur Sémiotique de Marque",
    layer: "BRAND",
    order: 31,
    sequenceKeys: ["BRAND"],
    pillarKeys: ["A", "D"],
    requiredDrivers: [],
    dependencies: [],
    description: "Analyse sémiotique de l'identité visuelle existante ou du brief",
    inputFields: ["brand_identity", "sector_codes", "cultural_context"],
    outputFormat: "semiotic_analysis",
    promptTemplate: `Analyse sémiotique de la marque :
Identité actuelle : {{brand_identity}}
Codes sectoriels : {{sector_codes}} | Contexte culturel : {{cultural_context}}
Analyse : signifiants, signifiés, connotations, codes culturels, positionnement sémiotique.`,
    status: "ACTIVE",
  },
  {
    slug: "visual-landscape-mapper",
    name: "Cartographe du Paysage Visuel",
    layer: "BRAND",
    order: 32,
    sequenceKeys: ["BRAND"],
    pillarKeys: ["D"],
    requiredDrivers: [],
    dependencies: ["semiotic-brand-analyzer"],
    description: "Cartographie le paysage visuel du secteur et des concurrents",
    inputFields: ["sector", "competitors", "trends"],
    outputFormat: "visual_landscape_map",
    promptTemplate: `Cartographie le paysage visuel :
Secteur : {{sector}} | Concurrents : {{competitors}}
Tendances : {{trends}}
Map : codes visuels dominants, espaces libres, opportunités de différenciation.`,
    status: "ACTIVE",
  },
  {
    slug: "visual-moodboard-generator",
    name: "Générateur de Moodboard Visuel",
    layer: "BRAND",
    order: 33,
    sequenceKeys: ["BRAND"],
    pillarKeys: ["D", "A"],
    requiredDrivers: [],
    dependencies: ["visual-landscape-mapper"],
    description: "Génère les directions de moodboard basées sur l'analyse",
    inputFields: ["semiotic_insights", "landscape_gaps", "brand_values"],
    outputFormat: "moodboard_directions",
    promptTemplate: `Génère 3 directions de moodboard :
Insights sémiotiques : {{semiotic_insights}}
Espaces visuels libres : {{landscape_gaps}}
Valeurs de marque : {{brand_values}}
Pour chaque direction : concept, ambiance, références visuelles, palette suggérée.`,
    status: "ACTIVE",
  },
  {
    slug: "chromatic-strategy-builder",
    name: "Constructeur de Stratégie Chromatique",
    layer: "BRAND",
    order: 34,
    sequenceKeys: ["BRAND"],
    pillarKeys: ["D"],
    requiredDrivers: [],
    dependencies: ["visual-moodboard-generator"],
    description: "Définit la stratégie couleur de la marque",
    inputFields: ["moodboard_direction", "sector_colors", "psychology"],
    outputFormat: "chromatic_strategy",
    promptTemplate: `Construis la stratégie chromatique :
Direction retenue : {{moodboard_direction}}
Couleurs sectorielles : {{sector_colors}}
Psychologie des couleurs : {{psychology}}
Livrable : palette primaire, secondaire, accent, neutres, OKLCH values, ratios d'utilisation.`,
    status: "ACTIVE",
  },
  {
    slug: "typography-system-architect",
    name: "Architecte du Système Typographique",
    layer: "BRAND",
    order: 35,
    sequenceKeys: ["BRAND"],
    pillarKeys: ["D"],
    requiredDrivers: [],
    dependencies: ["chromatic-strategy-builder"],
    description: "Conçoit le système typographique de la marque",
    inputFields: ["brand_personality", "usage_contexts", "accessibility"],
    outputFormat: "typography_system",
    promptTemplate: `Conçois le système typographique :
Personnalité de marque : {{brand_personality}}
Contextes d'usage : {{usage_contexts}}
Accessibilité : {{accessibility}}
Livrable : familles, hiérarchie, échelle, line-height, letter-spacing, web/print specs.`,
    status: "ACTIVE",
  },
  {
    slug: "logo-type-advisor",
    name: "Conseiller en Logotype",
    layer: "BRAND",
    order: 36,
    sequenceKeys: ["BRAND"],
    pillarKeys: ["D", "A"],
    requiredDrivers: [],
    dependencies: ["typography-system-architect"],
    description: "Guide la conception du logotype",
    inputFields: ["brand_name", "brand_values", "typography_system", "chromatic_strategy"],
    outputFormat: "logotype_direction",
    promptTemplate: `Guide la conception du logotype :
Nom : {{brand_name}} | Valeurs : {{brand_values}}
Système typo : {{typography_system}} | Stratégie chromatique : {{chromatic_strategy}}
Livrable : type de logo recommandé, direction stylistique, do/don't, déclinaisons nécessaires.`,
    status: "ACTIVE",
  },
  {
    slug: "logo-validation-protocol",
    name: "Protocole de Validation Logo",
    layer: "BRAND",
    order: 37,
    sequenceKeys: ["BRAND"],
    pillarKeys: ["D"],
    requiredDrivers: [],
    dependencies: ["logo-type-advisor"],
    description: "Évalue et valide les propositions de logo",
    inputFields: ["logo_proposals", "brand_guidelines", "usage_contexts"],
    outputFormat: "logo_validation_report",
    promptTemplate: `Valide les propositions de logo :
Critères : lisibilité (5 tailles), mémorabilité, reproductibilité, cohérence marque, unicité.
Contextes : digital, print, packaging, signalétique, favicon.
Score chaque proposition et recommande la direction finale.`,
    status: "ACTIVE",
  },
  {
    slug: "design-token-architect",
    name: "Architecte de Design Tokens",
    layer: "BRAND",
    order: 38,
    sequenceKeys: ["BRAND"],
    pillarKeys: ["D", "I"],
    requiredDrivers: [],
    dependencies: ["chromatic-strategy-builder", "typography-system-architect"],
    description: "Définit les design tokens pour l'implémentation technique",
    inputFields: ["chromatic_strategy", "typography_system", "spacing", "motion"],
    outputFormat: "design_tokens",
    promptTemplate: `Définis les design tokens :
Couleurs : {{chromatic_strategy}}
Typo : {{typography_system}}
Spacing : {{spacing}} | Motion : {{motion}}
Format : JSON compatible avec Tailwind/CSS variables, avec nommage sémantique.`,
    status: "ACTIVE",
  },
  {
    slug: "motion-identity-designer",
    name: "Designer d'Identité Motion",
    layer: "BRAND",
    order: 39,
    sequenceKeys: ["BRAND"],
    pillarKeys: ["D", "E"],
    requiredDrivers: ["VIDEO"],
    dependencies: ["design-token-architect"],
    description: "Définit l'identité motion de la marque",
    inputFields: ["brand_personality", "design_tokens", "usage_contexts"],
    outputFormat: "motion_identity",
    promptTemplate: `Conçois l'identité motion :
Personnalité : {{brand_personality}}
Tokens : {{design_tokens}}
Contextes : transitions UI, vidéo intro/outro, loading states, micro-interactions.
Livrable : principes (easing, durée, rythme), bibliothèque d'animations, guidelines motion.`,
    status: "ACTIVE",
  },
  {
    slug: "brand-guidelines-generator",
    name: "Générateur de Brand Guidelines",
    layer: "BRAND",
    order: 40,
    sequenceKeys: ["BRAND"],
    pillarKeys: ["D"],
    requiredDrivers: [],
    dependencies: ["design-token-architect", "motion-identity-designer"],
    description: "Compile les guidelines de marque complètes",
    inputFields: ["all_brand_elements"],
    outputFormat: "brand_guidelines",
    promptTemplate: `Compile les brand guidelines complètes :
Sections : mission/vision, logo usage, palette, typographie, photographie, iconographie,
tone of voice, do/don't, templates, applications, design tokens, motion guidelines.
Format : document structuré prêt pour PDF/HTML.`,
    status: "ACTIVE",
  },
];

// ─── Exports ─────────────────────────────────────────────────────────────────

export const ALL_GLORY_TOOLS: GloryToolDef[] = [...CR_TOOLS, ...DC_TOOLS, ...HYBRID_TOOLS, ...BRAND_TOOLS];

export function getGloryTool(slug: string): GloryToolDef | undefined {
  return ALL_GLORY_TOOLS.find((t) => t.slug === slug);
}

export function getToolsByLayer(layer: GloryLayer): GloryToolDef[] {
  return ALL_GLORY_TOOLS.filter((t) => t.layer === layer).sort((a, b) => a.order - b.order);
}

export function getToolsByPillar(pillarKey: string): GloryToolDef[] {
  return ALL_GLORY_TOOLS.filter((t) => t.pillarKeys.includes(pillarKey));
}

export function getToolsByDriver(driver: string): GloryToolDef[] {
  return ALL_GLORY_TOOLS.filter((t) => t.requiredDrivers.includes(driver));
}

// ─── Sequence helpers ────────────────────────────────────────────────────────

export function getSequence(key: GlorySequenceKey): GlorySequenceDef | undefined {
  return GLORY_SEQUENCES.find((s) => s.key === key);
}

export function getSequenceTools(key: GlorySequenceKey): GloryToolDef[] {
  const seq = getSequence(key);
  if (!seq) return [];
  return seq.chain
    .map((slug) => getGloryTool(slug))
    .filter((t): t is GloryToolDef => t !== undefined);
}

export function getToolSequences(slug: string): GlorySequenceDef[] {
  return GLORY_SEQUENCES.filter((s) => s.chain.includes(slug));
}

export function getAllMissingTools(): Array<{ sequence: GlorySequenceKey; slug: string; name: string; description: string }> {
  const missing: Array<{ sequence: GlorySequenceKey; slug: string; name: string; description: string }> = [];
  for (const seq of GLORY_SEQUENCES) {
    for (const m of seq.missingTools) {
      missing.push({ sequence: seq.key, slug: m.slug, name: m.name, description: m.description });
    }
  }
  return missing;
}

/**
 * Returns the full chain for a sequence, including planned insertion points for missing tools.
 * Gives a picture of what the complete sequence should look like once all tools are built.
 */
export function getFullSequenceChain(key: GlorySequenceKey): Array<{ slug: string; name: string; status: GloryToolStatus }> {
  const seq = getSequence(key);
  if (!seq) return [];

  const result: Array<{ slug: string; name: string; status: GloryToolStatus }> = [];
  for (const slug of seq.chain) {
    const tool = getGloryTool(slug);
    result.push({ slug, name: tool?.name ?? slug, status: "ACTIVE" });

    // Insert missing tools after their anchor
    for (const m of seq.missingTools) {
      if (m.insertAfter === slug) {
        result.push({ slug: m.slug, name: m.name, status: "PLANNED" });
      }
    }
  }

  // Handle missing tools that insert after the last item (or at end)
  for (const m of seq.missingTools) {
    if (!seq.chain.includes(m.insertAfter) && !result.some((r) => r.slug === m.slug)) {
      result.push({ slug: m.slug, name: m.name, status: "PLANNED" });
    }
  }

  return result;
}

// ─── BRAND pipeline (legacy compat) ─────────────────────────────────────────

export function getBrandPipeline(): GloryToolDef[] {
  return getToolsByLayer("BRAND");
}

export function getBrandPipelineDependencyOrder(): string[] {
  const tools = getBrandPipeline();
  const sorted: string[] = [];
  const visited = new Set<string>();

  function visit(slug: string) {
    if (visited.has(slug)) return;
    visited.add(slug);
    const tool = tools.find((t) => t.slug === slug);
    if (!tool) return;
    for (const dep of tool.dependencies) {
      visit(dep);
    }
    sorted.push(slug);
  }

  for (const tool of tools) {
    visit(tool.slug);
  }

  return sorted;
}
