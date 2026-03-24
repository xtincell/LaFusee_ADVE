# ANNEXE H — Addendum : GLORY→Piliers, Superfan, Devotion & Cult Index

**Version** : 1.1-add1
**Date** : 24 mars 2026
**Objet** : Composites manquants dans l'Annexe H v1.1 — les variables Superfan/Devotion/Cult Index et le mapping GLORY → production de variables pilier. À fusionner dans H lors de la prochaine consolidation.

> Complète : ANNEXE-H-ONTOLOGIE.md v1.1

---

# 1. COMPOSITES MANQUANTS AU NIVEAU N2

---

## N2.16 — SuperfanProfile

> Le SuperfanProfile est le composite qui représente un membre individuel de la communauté avec son segment dans la Devotion Ladder, ses métriques d'engagement, et son historique de progression. C'est l'unité atomique du mouvement — chaque SuperfanProfile est un point de données qui alimente le Cult Index.

```typescript
interface SuperfanProfile {                 // Pilier E → Brand OS
  id: string;
  strategyId: string;                       // La marque à laquelle il est rattaché

  // Identité
  externalId: atom.text_short;              // ID sur la plateforme source (Instagram handle, email, etc.)
  platform: atom.channel;                   // Plateforme source principale
  displayName: atom.text_short;
  avatarUrl: atom.url | null;

  // Segmentation Devotion
  segment: SuperfanSegment;                 // AUDIENCE | FOLLOWER | ENGAGED | FAN | SUPERFAN | EVANGELIST
  previousSegment: SuperfanSegment | null;  // Segment avant la dernière promotion
  promotedAt: atom.date | null;             // Date de dernière promotion de segment
  segmentHistory: Array<{                   // Historique complet des transitions
    from: SuperfanSegment;
    to: SuperfanSegment;
    date: atom.date;
    trigger: atom.text_short;               // Ce qui a déclenché la transition (achat, UGC, referral, etc.)
  }>;

  // Engagement — métriques cumulées
  engagementDepth: atom.score_100;          // Score composite 0-100 de profondeur d'engagement
  ugcCount: atom.number;                    // Nombre de contenus créés (posts, reviews, vidéos)
  defenseCount: atom.number;                // Nombre de fois où le superfan a défendu la marque publiquement
  shareCount: atom.number;                  // Nombre de partages de contenu de la marque
  referralCount: atom.number;               // Nombre de personnes référées/converties
  purchaseCount: atom.number;               // Nombre d'achats
  eventAttendance: atom.number;             // Nombre d'événements/rituels auxquels il a participé
  interactionFrequency: atom.text_short;    // "daily" | "weekly" | "monthly" | "quarterly" | "rare"

  // Valeur économique
  lifetimeValue: atom.currency;             // LTV réel de ce superfan
  lastPurchaseDate: atom.date | null;
  averageOrderValue: atom.currency;

  // Psychométrie (optionnel — rempli si le profil est enrichi)
  tensionSegment: TensionSegment | null;    // Mapping vers la Grille des Tensions (N1.04)
  lf8Dominant: atom.lf8[] | null;           // LF8 observés (déduits du comportement)
  personaMatch: string | null;              // ID du persona D.personas qui correspond le mieux

  // Tags et notes
  tags: atom.text_short[];                  // Tags libres (ex: "early-adopter", "content-creator", "premium")
  notes: atom.text_medium | null;           // Notes du fixer
}
```

**Formule `engagementDepth`** :

```
engagementDepth = min(100,
  (ugcCount × 10)          // Chaque UGC vaut 10 points (cap 40)
  + (defenseCount × 15)    // Chaque défense vaut 15 points (cap 30)
  + (referralCount × 20)   // Chaque referral vaut 20 points (cap 40)
  + (shareCount × 2)       // Chaque share vaut 2 points (cap 20)
  + (eventAttendance × 5)  // Chaque event vaut 5 points (cap 25)
  + (purchaseCount × 3)    // Chaque achat vaut 3 points (cap 15)
)
```

Chaque composante est cappée individuellement pour éviter qu'un seul comportement (ex: 1000 shares) écrase les autres. Le score final est cappé à 100.

**Critères de promotion automatique** (évalués par le `devotion-evaluator` service) :

| Transition | Condition |
|---|---|
| AUDIENCE → FOLLOWER | Premier follow/inscription OU premier clic depuis une campagne |
| FOLLOWER → ENGAGED | ≥3 interactions en 30 jours (likes, comments, clicks) |
| ENGAGED → FAN | Premier achat OU ≥1 UGC OU ≥5 shares en 30 jours |
| FAN → SUPERFAN | (engagementDepth ≥ 50) ET (referralCount ≥ 1 OU defenseCount ≥ 1) |
| SUPERFAN → EVANGELIST | (engagementDepth ≥ 80) ET (referralCount ≥ 3) ET (ugcCount ≥ 5) ET (defenseCount ≥ 2) |

**Validation** : `segment` doit correspondre aux critères ci-dessus (pas de promotion manuelle sans override fixer). `promotedAt` est set automatiquement lors de chaque promotion. Cross-ref : le `personaMatch` doit pointer vers un persona.id existant dans D.personas.

---

## N2.17 — CommunitySnapshot

> Instantané de santé communautaire à un moment donné. Pris périodiquement (hebdomadaire ou mensuel). Permet de calculer les tendances et d'alimenter le Cult Index.

```typescript
interface CommunitySnapshot {               // Pilier E → Signal
  id: string;
  strategyId: string;
  createdAt: atom.date;

  // Taille
  totalCommunity: atom.number;              // Nombre total de personnes dans la communauté (toutes plateformes)
  bySegment: Record<SuperfanSegment, atom.number>; // Distribution par segment de la Devotion Ladder
  byPlatform: Record<atom.channel, atom.number>;   // Distribution par plateforme

  // Santé
  retentionRate: atom.percentage;           // % de membres actifs ce mois vs le mois précédent
  activityRate: atom.percentage;            // % de membres qui ont interagi au moins 1x ce mois
  growthRate: atom.percentage;              // Croissance nette (nouveaux - perdus) / total × 100
  churnRate: atom.percentage;               // % de membres perdus ce mois

  // Velocity
  promotions: Array<{                       // Promotions de segment ce mois
    from: SuperfanSegment;
    to: SuperfanSegment;
    count: atom.number;
  }>;
  degradations: Array<{                     // Dégradations de segment ce mois
    from: SuperfanSegment;
    to: SuperfanSegment;
    count: atom.number;
  }>;

  // Engagement agrégé
  totalUGC: atom.number;                    // UGC créé ce mois
  totalDefenses: atom.number;               // Défenses ce mois
  totalShares: atom.number;                 // Shares ce mois
  totalReferrals: atom.number;              // Referrals ce mois
  totalPurchases: atom.number;              // Achats ce mois
  averageEngagementDepth: atom.score_100;   // Moyenne des engagementDepth de tous les profils

  // Sentiment (optionnel — si tracking social actif)
  sentimentScore: atom.score_100 | null;    // 0=très négatif, 50=neutre, 100=très positif
  topMentionThemes: atom.text_short[];      // Thèmes les plus mentionnés
}
```

**Validation** : `bySegment` doit sommer à `totalCommunity`. `retentionRate + churnRate` ≈ 100%. Les `promotions` doivent respecter les règles de transition (pas de saut de segment — AUDIENCE→SUPERFAN est invalide).

---

## N2.18 — DevotionSnapshot

> Le DevotionSnapshot est le radar de la Devotion Ladder à un instant T. Il mesure la distribution de l'audience dans les 6 segments et calcule des métriques de conversion inter-segments.

```typescript
interface DevotionSnapshot {                // Pilier E → L'Oracle cockpit
  id: string;
  strategyId: string;
  createdAt: atom.date;

  // Distribution
  ladder: Array<{
    segment: SuperfanSegment;
    count: atom.number;
    percentage: atom.percentage;
    trend: "up" | "down" | "stable";        // vs snapshot précédent
    deltaAbsolute: atom.number;             // Variation absolue
  }>;

  // Conversions inter-segments
  conversionRates: Array<{
    from: SuperfanSegment;
    to: SuperfanSegment;                    // Le segment immédiatement supérieur
    rate: atom.percentage;                  // % de `from` qui sont devenus `to` sur la période
    velocity: atom.number;                  // Jours moyens pour la transition
  }>;

  // Métriques dérivées
  superfanRatio: atom.percentage;           // (SUPERFAN + EVANGELIST) / totalCommunity × 100
  pyramidHealth: "inverted" | "heavy_bottom" | "balanced" | "top_heavy"; // Forme de la pyramide
  bottleneck: SuperfanSegment | null;       // Le segment avec le taux de conversion le plus bas (goulot)
  estimatedTimeToNextCultTier: atom.number | null; // Jours estimés pour passer au CultTier suivant

  // Lien avec le Cult Index
  cultIndexAtSnapshot: atom.score_100;      // Cult Index calculé au moment du snapshot
  cultTier: CultTier;                       // GHOST | FUNCTIONAL | LOVED | EMERGING | CULT
}
```

**Formule `pyramidHealth`** :

```
ratio = (SUPERFAN + EVANGELIST) / totalCommunity

pyramidHealth =
  ratio < 0.01  → "heavy_bottom"     (moins de 1% de superfans — base massive, pas de conversion)
  ratio 0.01-0.05 → "balanced"       (pyramide saine — conversion progressive)
  ratio 0.05-0.15 → "top_heavy"      (beaucoup de superfans — communauté mûre mais attention au renouvellement)
  ratio > 0.15 → "inverted"          (plus de superfans que de base — la communauté n'attire plus de nouveaux)
```

**Formule `bottleneck`** :

```
bottleneck = segment avec le min(conversionRates.rate)
// Le segment dont le moins de membres transitent vers le suivant
// Indique où le funnel de devotion bloque
```

---

# 2. CULT INDEX — FORMULE COMPLÈTE

Le Cult Index mesure la santé cultuelle d'une marque. Score composite 0-100 calculé depuis 7 dimensions pondérées.

## 2.1 Les 7 dimensions

| # | Dimension | Poids | Ce qu'elle mesure | Formule |
|---|---|---|---|---|
| 1 | **Engagement Depth** | 0.25 | Profondeur moyenne d'engagement de toute la communauté | `avg(SuperfanProfile.engagementDepth)` |
| 2 | **Superfan Velocity** | 0.20 | Accélération de la production de superfans | `f(newSuperfans_30j / newSuperfans_prev30j)`. 50 = stable, >50 = accélération, <50 = décélération |
| 3 | **Community Cohesion** | 0.15 | Solidité de la communauté (rétention × activité) | `retentionRate × 0.6 + activityRate × 0.4` (×100) |
| 4 | **Brand Defense Rate** | 0.15 | % de superfans qui défendent activement | `totalDefenses / (superfanCount × 3)` (×100). 3 défenses/superfan = 100% |
| 5 | **UGC Generation Rate** | 0.10 | Création de contenu par la communauté | `(totalUGC / totalCommunity) × 1000 × 2`. 50 UGC/1000 membres = score 100 |
| 6 | **Ritual Adoption** | 0.10 | Adoption des rituels de marque (proxy: partages réguliers) | `(totalShares / totalCommunity) × 1000`. 1000 shares/1000 membres = score 100 |
| 7 | **Evangelism Score** | 0.05 | Intensité d'évangélisation | `(evangelistRatio × 500 + referralIntensity × 20) / 2`. evangelistRatio = evangelists/total, referralIntensity = referrals/superfans |

## 2.2 Formule composite

```
cultIndex = clamp(0, 100, round(
  engagementDepth      × 0.25
  + superfanVelocity   × 0.20
  + communityCohesion  × 0.15
  + brandDefenseRate   × 0.15
  + ugcGenerationRate  × 0.10
  + ritualAdoption     × 0.10
  + evangelismScore    × 0.05
))
```

## 2.3 Classification Cult Tier

| Score | Tier | Label FR | Description |
|---|---|---|---|
| 0-20 | `GHOST` | Marque fantôme | Existe mais personne ne s'en soucie |
| 21-40 | `FUNCTIONAL` | Marque fonctionnelle | On achète par habitude |
| 41-60 | `LOVED` | Marque aimée | Préférence active |
| 61-80 | `EMERGING` | Culte émergent | Les fans commencent à évangéliser |
| 81-100 | `CULT` | Marque culte | La communauté vit pour la marque |

## 2.4 Poids ajustables

Les poids (0.25, 0.20, ...) sont les valeurs par défaut. Ils sont stockés dans `BrandOSConfig.cultWeights` et peuvent être ajustés par le fixer pour chaque marque. Cas d'usage : une marque B2B où l'UGC est rare mais les défenses (recommandations entre pairs) sont le signal fort → augmenter le poids de Brand Defense Rate, diminuer UGC.

## 2.5 Cold start

Avec 0 SuperfanProfile, le Cult Index est 0 (GHOST). Le Knowledge Seeder (Annexe F §F.3) ne seed PAS le Cult Index — il ne peut pas être fabriqué. C'est une métrique émergente. Le First Value Protocol (F §F.2) inclut la création des premiers SuperfanProfile dès que les canaux sociaux sont connectés et les premières métriques remontent.

## 2.6 Mapping Cult Index → Score pilier E

Le Cult Index ne remplace pas le score /25 du pilier E. Il le complète :

```
score_E_structural = rubrique classique (touchpoints, rituels, gamification, aarrr, kpis, etc.)
cultIndex_bonus = min(3, cultIndex / 33)  // 0-3 points bonus
score_E_total = min(25, score_E_structural + cultIndex_bonus)
```

Le Cult Index est un **bonus de preuve** : si les rituels sont bien conçus (structural score élevé) ET que les superfans les adoptent (Cult Index élevé), le pilier E reçoit un bonus. Si les rituels sont bien conçus mais personne ne les adopte, le structural est bon mais le bonus est 0. Ça force la distinction entre design (est-ce bien pensé ?) et adoption (est-ce que ça marche ?).

---

# 3. MAPPING GLORY → PRODUCTION DE VARIABLES PILIER

Chaque outil GLORY consomme des variables pilier (via `requiredPillars`) et **produit** des variables qui enrichissent ces mêmes piliers ou d'autres. Le tableau ci-dessous formalise ce qui n'était qu'implicite dans le code.

## 3.1 Layer BRAND (10 outils) → Pilier D (Direction Artistique)

Déjà formalisé dans N2.15 de l'Annexe H v1.1. Chaque outil = un sous-composite de la DA. Pipeline séquentiel #1→#10.

## 3.2 Layer CR (10 outils) → Production créative (Piliers A+D+E → Campaign deliverables)

| # | Outil | Consomme | Produit | Variable pilier enrichie |
|---|---|---|---|---|
| 1 | `concept-generator` | A (archetype, valeurs), D (positionnement, promesse) | Concepts créatifs (3-5 pistes avec axe, promesse, territoire visuel, score force, risque) | I.bigIdea (alimentation), Campaign.brief.pisteCreative |
| 2 | `script-writer` | A (mythologie), D (ton), E (rituels → moments narratifs) | Scripts publicitaires complets (scènes, dialogues, audio, production notes) | Campaign.actions (contenu livrable pour ATL_TV, ATL_RADIO, TTL_VIDEO_CONTENT) |
| 3 | `long-copy-craftsman` | A (hero's journey, valeurs), D (ton, positionnement) | Manifestes, brand stories, éditos, tribunes | A.doctrine.canon (enrichissement mythologie), I.brandPlatform (narrative) |
| 4 | `dialogue-writer` | A (valeurs), D (ton, assetsLinguistiques), E (touchpoints humains) | Dialogues pour spots, podcasts, customer service scripts | Campaign.actions (contenu livrable), E.rituels (scripts de rituels humains) |
| 5 | `claim-baseline-factory` | A (noyauIdentitaire), D (promesse, positionnement), V (product ladder) | Claims, baselines, taglines par produit et par tier | D.assetsLinguistiques.mantras (enrichissement), V.produitsCatalogue[].lienPromesse (affinement) |
| 6 | `print-ad-architect` | A (archetype), D (DA, positionnement), V (produits) | Annonces presse structurées (headline, body, visual, CTA) | Campaign.actions (contenu livrable pour ATL_PRESS, ATL_OOH) |
| 7 | `social-copy-engine` | A (valeurs, mythologie), D (ton, vocabulaire), E (rituels, calendrier sacré) | Posts sociaux par plateforme avec hooks, copy, hashtags, CTA | Campaign.actions (contenu TTL_SOCIAL_ORGANIC), E.rituels (contenu always-on) |
| 8 | `storytelling-sequencer` | A (hero's journey), D (personas, ton), E (rites de passage) | Séquences narratives multi-épisodes (arcs, épisodes, cliffhangers) | Campaign.actions (contenu TTL_CONTENT, TTL_PODCAST), E.rituels (séries récurrentes) |
| 9 | `wordplay-cultural-bank` | A (valeurs, références culturelles) | Banque de jeux de mots, expressions, références culturelles exploitables | D.assetsLinguistiques.vocabulaireProprietaire (enrichissement massif) |
| 10 | `brief-creatif-interne` | A+D+V+E (tous les piliers core) | Brief créatif structuré complet (problématique, insight, promesse, RTB, tone, contraintes) | N2.12 CampaignBrief (alimentation directe — ce tool PRODUIT le brief) |

## 3.3 Layer DC (8 outils) → Direction créative (Piliers A+D → qualité et cohérence)

| # | Outil | Consomme | Produit | Variable pilier enrichie |
|---|---|---|---|---|
| 11 | `campaign-architecture-planner` | A+D+V+E (stratégie complète) | Architecture de campagne 360 (phases, touchpoints, séquencement, synergies) | I.campaigns.annualCalendar (structuration), N2.12 CampaignBrief (cadrage) |
| 12 | `creative-evaluation-matrix` | A (valeurs), D (positionnement, promesse) | Matrice d'évaluation des créations (critères pondérés, scores, verdict) | QualityReview (critères de QC créatif), I.guidingPrinciples (critères de cohérence) |
| 13 | `idea-killer-saver` | A (valeurs), D (positionnement) | Analyse kill/save de concepts (forces, faiblesses, potentiel, recommandation) | Filtrage des concepts de #1 avant production |
| 14 | `multi-team-coherence-checker` | A (noyau), D (DA, ton, positionnement) | Audit de cohérence cross-équipes (écarts identifiés, recommandations d'alignement) | S.coherenceScore (input), brand-guardian-system (alimentation des règles) |
| 15 | `client-presentation-strategist` | A+D (positionnement, promesse, archetype) | Stratégie de présentation client (storytelling, séquencement, objection handling) | I.governance (processus de présentation), Pitch delivery |
| 16 | `creative-direction-memo` | A (valeurs), D (DA complète) | Mémo de direction créative (direction, contraintes, inspirations, do/don't) | N2.15 LSIMatrix (raffinement), Driver.specs (enrichissement des specs de brief) |
| 17 | `pitch-architect` | A+D+V+E (tous les piliers core) | Architecture de pitch complet (structure, storytelling, données, visuels) | I.launchPlan (présentation interne), Business development |
| 18 | `award-case-builder` | A (mythologie), D (positionnement), E (résultats, KPIs) | Case study formaté pour awards (challenge, insight, idea, execution, results) | post-campaign-reader (input structuré), PR content |

## 3.4 Layer HYBRID (11 outils) → Opérations (Piliers V+E+I → exécution)

| # | Outil | Consomme | Produit | Variable pilier enrichie |
|---|---|---|---|---|
| 19 | `campaign-360-simulator` | A+D+V (stratégie + budget) | Simulation de campagne 360 (reach estimé, conversions, ROI par canal, scénarios) | I.budgetAllocation (optimisation), I.campaigns (calibration des budgets par campagne) |
| 20 | `production-budget-optimizer` | A (scope de production) | Budget de production optimisé (postes, alternatives, savings) | I.budgetAllocation.production (détail), Campaign.budgetAllocation |
| 21 | `vendor-brief-generator` | A+D (DA, ton, positionnement) | Brief fournisseur structuré (photographe, vidéaste, imprimeur, etc.) | Mission.brief (deliverable direct pour la Guilde) |
| 22 | `production-devis-generator` | A (specs de production) | Devis de production détaillé (postes, quantités, prix unitaires, total) | Serenite (input pour facturation), Mission.budget |
| 23 | `content-calendar-strategist` | A+D+E (rituels, touchpoints, calendrier sacré) | Calendrier éditorial structuré (par semaine, par canal, par pilier, avec briefs) | I.campaigns (enrichissement calendrier annuel), E.rituels (matérialisation des always-on) |
| 24 | `approval-workflow-manager` | (aucun pilier requis) | Workflow d'approbation structuré (étapes, rôles, SLA, escalade) | I.governance (processus de validation) |
| 25 | `brand-guardian-system` | A+D (DA, ton, valeurs, positionnement) | Système de garde-fou de marque (règles de conformité, checklist, red flags) | I.guidingPrinciples (do's/don'ts enrichis), QualityReview (critères automatisés) |
| 26 | `client-education-module` | (aucun pilier requis) | Module éducatif client (concepts ADVE vulgarisés, processus expliqués) | L'Académie (contenu onboarding client) |
| 27 | `benchmark-reference-finder` | A+D (positionnement, DA, archetype) | Références créatives contextualisées (campagnes similaires, benchmarks sectoriels) | SESHAT fallback (Annexe F §F.3), brief enrichissement (références visuelles) |
| 28 | `post-campaign-reader` | A+D+E (objectifs, KPIs, résultats) | Bilan de campagne structuré (résultats vs objectifs, learnings, recommandations) | R.microSwots (alimentation signaux performance), T.hypothesisValidation (validation), Knowledge Graph |
| 29 | `digital-planner` | D+E (personas, touchpoints, canaux digitaux) | Plan média digital (mix de canaux, budget par plateforme, KPIs, séquencement) | I.activationDispositif.paid + .owned (enrichissement), Campaign.budgetAllocation.media |

## 3.5 Synthèse : ce que chaque pilier reçoit de GLORY

| Pilier | Outils qui l'ENRICHISSENT | Variables enrichies |
|---|---|---|
| **A** | #3 (long-copy → mythologie), #9 (wordplay → banque culturelle) | A.doctrine.canon, A.livingMythology |
| **D** | #1-#10 BRAND (DA complète), #5 (claims → mantras), #9 (wordplay → vocabulaire), #16 (creative memo → LSI) | D.identiteVisuelle (→ N2.15), D.assetsLinguistiques, D.promessesDeMarque (affinement) |
| **V** | #5 (claims → lien promesse par produit), #22 (devis → coûts de production) | V.produitsCatalogue[].lienPromesse, V.coutMarqueTangible |
| **E** | #7 (social copy → contenu rituels), #8 (storytelling → séries), #23 (calendrier → matérialisation rituels) | E.rituels (contenu concret), E.sacredCalendar (activation) |
| **R** | #28 (post-campaign → signaux performance) | R.microSwots (alimentation indirecte via Signals) |
| **T** | #28 (post-campaign → validation hypothèses) | T.hypothesisValidation (preuves concrètes) |
| **I** | #1 (concepts → big idea), #10 (brief → CampaignBrief), #11 (architecture → calendrier), #19 (simulation → budget), #20 (budget prod), #23 (calendrier éditorial), #24 (workflow → governance), #25 (guardian → principles), #29 (digital plan → activation) | I.bigIdea, I.campaigns, I.budgetAllocation, I.governance, I.guidingPrinciples, I.activationDispositif |
| **S** | #14 (cohérence → coherenceScore), #17 (pitch → présentation exécutive) | S.scoreCoherence (input), S.syntheseExecutive (enrichissement) |

---

# 4. COLLECTIONS N3 MANQUANTES

| Collection | Composite source | Min | Max | Règle de couverture | Pilier |
|---|---|---|---|---|---|
| SuperfanProfiles | N2.16 SuperfanProfile | 0 | ∞ | Flux continu, 6 segments tous représentés quand totalCommunity > 100 | E |
| CommunitySnapshots | N2.17 CommunitySnapshot | 1/mois | 1/semaine | Au moins 1 par mois pour le Cult Index, idéalement 1/semaine | E |
| DevotionSnapshots | N2.18 DevotionSnapshot | 1/mois | 1/semaine | Synchrone avec CommunitySnapshot | E |
| GLORY Outputs | GloryOutput (existant dans le code) | 0 | ∞ | Par tool, par Strategy — chaque output est persisté et versionné | Transversal |

---

# 5. VARIABLES DÉRIVÉES N1 MANQUANTES

| ID | Nom | Formule | Inputs | Pilier |
|---|---|---|---|---|
| `atom.engagement_depth` | Profondeur d'engagement | `min(100, ugc×10 + defense×15 + referral×20 + share×2 + event×5 + purchase×3)` (caps par composante) | SuperfanProfile counters | E |
| `atom.superfan_velocity` | Vélocité superfan | `f(new30d / prev30d)` → 50=stable, >50=accélération | SuperfanProfile.promotedAt | E |
| `atom.community_cohesion` | Cohésion communauté | `retentionRate × 0.6 + activityRate × 0.4` (×100) | CommunitySnapshot | E |
| `atom.brand_defense_rate` | Taux de défense | `totalDefenses / (superfanCount × 3)` (×100) | SuperfanProfile agrégés | E |
| `atom.ugc_rate` | Taux UGC | `(totalUGC / totalCommunity) × 1000 × 2` (50/1000=100) | SuperfanProfile agrégés | E |
| `atom.ritual_adoption` | Adoption rituels | `(totalShares / totalCommunity) × 1000` | SuperfanProfile agrégés | E |
| `atom.evangelism_score` | Score évangélisme | `(evangelistRatio × 500 + referralIntensity × 20) / 2` | SuperfanProfile agrégés | E |
| `atom.cult_index` | Cult Index | Somme pondérée des 7 dimensions (§2.2) | 7 dimensions ci-dessus | E |
| `atom.superfan_ratio` | Ratio superfan | `(SUPERFAN + EVANGELIST) / totalCommunity × 100` | DevotionSnapshot | E |
| `atom.pyramid_health` | Santé pyramide | Classification par seuils de superfan_ratio (§N2.18) | DevotionSnapshot | E |
| `atom.bottleneck_segment` | Goulot Devotion | `min(conversionRates.rate)` → segment avec la conversion la plus basse | DevotionSnapshot | E |

---

# 6. IMPACT SUR LE SCORING /25 DU PILIER E

Le pilier E a maintenant deux composantes de scoring :

**Composante 1 — Design (0-22 points)** : est-ce que l'architecture d'engagement est bien conçue ? (touchpoints, rituels, gamification, AARRR, KPIs, extensions ARTEMIS)

**Composante 2 — Adoption (0-3 points)** : est-ce que ça fonctionne dans la réalité ? (Cult Index bonus)

```
score_E = min(25, score_design + cultIndex_bonus)

score_design = scoring structural actuel (rubriques touchpoints + rituels + principes + gamification + aarrr + kpis + ARTEMIS)
cultIndex_bonus = min(3, cultIndex / 33)
```

Effet : une marque avec un playbook parfaitement conçu mais 0 adoption = 22/25. Une marque avec un playbook bon (18/22) mais une adoption forte (Cult Index 90 → bonus 2.7) = 20.7/25. La preuve de terrain ne remplace pas le design, mais elle le bonifie.

Pour une marque en Quick Intake ou Boot Sequence récent, le cultIndex_bonus est 0 (pas encore de données). Le score repose entièrement sur le design. C'est correct — on ne peut pas mesurer l'adoption d'un système pas encore déployé.

---

# 7. LE SUPERFAN DANS LE MOUVEMENT (N6)

Le lien entre SuperfanProfile et le Mouvement (N6) :

```
Mouvement = Δ Overton
         = f(nombre critique de superfans coordonnés × intensité de leur comportement)
         
nombre_critique = seuil à partir duquel le mouvement s'auto-entretient
                = dépend du secteur, du marché, de la taille de l'ennemi
                
intensité = f(engagementDepth moyen des SUPERFAN+EVANGELIST)
          × f(brandDefenseRate)
          × f(evangelismScore)
          × f(ritualAdoption)
```

Mestor utilise ces métriques pour :

1. **Prédire la suffisance** : est-ce qu'on a assez de superfans pour le prochain déplacement d'Overton ?
2. **Identifier les leviers** : quel comportement est le plus faible (UGC ? defense ? referral ?) → quelle campagne lancer pour le stimuler ?
3. **Mesurer l'impact ennemi** : si le Cult Index baisse alors que les rituels sont maintenus → les narratifs ennemis (N2.14) sont en train de gagner du terrain → recommander une contre-offensive
4. **Timing des campagnes** : quand le superfanVelocity accélère → le moment est optimal pour lancer une campagne d'Overton shift. Quand il décélère → consolider la base avant de pousser.

---

*Fin de l'Addendum à l'Annexe H*
