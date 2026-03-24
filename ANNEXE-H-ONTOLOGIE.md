# ANNEXE H — Ontologie des Variables du Système ADVE-RTIS

**Version** : 1.1 (corrections Enemy + DA/LSI + pipeline BRAND GLORY)
**Date** : 24 mars 2026
**Objet** : Taxonomie complète des types atomiques, des règles de composition, et des structures composites du système ADVE-RTIS. Ce document est la source de vérité pour le data model, le scoring, les prompts de génération, et le moteur de recommandation Mestor.

**Principe fondamental** : le système est un assemblage déterministe de variables de complexité croissante. Chaque niveau se compose à partir du niveau inférieur selon des règles vérifiables sans LLM. Le LLM accélère le remplissage. Les règles garantissent la logique. Mestor opère sur le tout comme moteur de recommandation stratégique.

> Remplace : ANNEXE G (obsolète — traitait les champs comme des blocs de texte)
> Référencé par : CAHIER-DE-CHARGES-INDUSTRY-OS.md §4.1 (`advertis-scorer`), §6.1 (méthodologie), ANNEXE F §F.1

---

## Architecture des niveaux

```
N6  MOUVEMENT        Déplacement sur la fenêtre d'Overton
     ↑ se réalise via
N5  STRATÉGIE        Le profil ADVE-RTIS complet (8 piliers assemblés)
     ↑ se compose de
N4  COMPOSITE MAJEUR Le livrable par pilier (manifeste, brand book, offre, playbook...)
     ↑ se compose de
N3  COLLECTION       Ensembles ordonnés de composites (catalogue, roster, calendrier)
     ↑ se compose de
N2  COMPOSITE        Structures composées d'atomes (persona, produit, rituel, action marketing)
     ↑ se compose de
N1  ATOME            La plus petite unité de donnée indivisible
     ↑ puise dans
N0  TAXONOMIE        Énumérations fixes, référentiels fermés
```

Chaque variable du système a un **niveau** (N0-N6), un **type**, un **pilier source** (quel pilier la produit), et des **règles de composition** (quels éléments du niveau inférieur la constituent). Le scoring mesure la complétude structurelle de chaque niveau.

---

# NIVEAU 0 — TAXONOMIES

Énumérations fixes. Jamais modifiées par le client ou le LLM. Ce sont les alphabets du système.

## T.01 — Archétypes de marque (Jung/Pearson)

12 archétypes. Chaque marque en choisit un primaire et optionnellement un secondaire.

| Code | Archétype | Motivation profonde | Peur fondamentale |
|---|---|---|---|
| `HERO` | Le Héros | Prouver sa valeur par le courage | L'impuissance, la faiblesse |
| `SAGE` | Le Sage | Comprendre le monde par la vérité | L'ignorance, l'erreur |
| `MAGICIAN` | Le Magicien | Transformer la réalité | Les conséquences imprévues |
| `EXPLORER` | L'Explorateur | Découvrir, vivre pleinement | L'enfermement, le vide intérieur |
| `REBEL` | Le Rebelle | Renverser ce qui ne fonctionne pas | L'impuissance face au système |
| `CREATOR` | Le Créateur | Donner forme à une vision | La médiocrité, l'insignifiance |
| `RULER` | Le Souverain | Exercer le contrôle, créer l'ordre | Le chaos, le renversement |
| `INNOCENT` | L'Innocent | Retrouver le bonheur simple | La punition, l'abandon |
| `JESTER` | Le Bouffon | Vivre dans le moment, jouir | L'ennui, la banalité |
| `LOVER` | L'Amant | Créer l'intimité, l'expérience sensorielle | La solitude, le rejet |
| `CAREGIVER` | Le Protecteur | Protéger et aider les autres | L'égoïsme, l'ingratitude |
| `EVERYMAN` | L'Homme Ordinaire | Appartenir, se connecter | L'exclusion, le rejet |

**Usage** : A.identite.archetype (N1), D.tonDeVoix (influence), E.rituels (tonalité)

---

## T.02 — Valeurs universelles de Schwartz

10 valeurs universelles. La marque en sélectionne 3-7 et les hiérarchise.

| Code | Valeur | Définition | Tension avec |
|---|---|---|---|
| `SELF_DIRECTION` | Autonomie | Pensée et action indépendante | Conformité, Tradition |
| `STIMULATION` | Stimulation | Excitation, nouveauté, défi | Sécurité |
| `HEDONISM` | Hédonisme | Plaisir et gratification sensorielle | Conformité |
| `ACHIEVEMENT` | Accomplissement | Succès personnel selon les normes sociales | Bienveillance |
| `POWER` | Puissance | Statut social, contrôle des ressources | Universalisme |
| `SECURITY` | Sécurité | Stabilité, harmonie, ordre | Stimulation, Autonomie |
| `CONFORMITY` | Conformité | Respect des normes et attentes | Autonomie, Stimulation |
| `TRADITION` | Tradition | Respect des coutumes et de l'héritage | Autonomie, Stimulation |
| `BENEVOLENCE` | Bienveillance | Préservation du bien-être des proches | Puissance, Accomplissement |
| `UNIVERSALISM` | Universalisme | Compréhension, tolérance, protection de tous | Puissance |

**Propriété critique** : les valeurs en tension (colonne 4) ne peuvent pas être toutes au top du ranking sans contradiction. Le scoring vérifie la cohérence des tensions.

**Usage** : A.valeurs (N2), validation de cohérence cross-pilier

---

## T.03 — LF8 de Whitman (Life Force 8)

8 désirs biologiques fondamentaux. Chaque persona est mappé sur 1-3 LF8 dominants.

| Code | Désir | Description |
|---|---|---|
| `LF1` | Survie / longévité | Rester en vie, prolonger la vie |
| `LF2` | Nourriture / plaisir | Jouir de la nourriture et des boissons |
| `LF3` | Absence de peur | Être libre de la peur, de la douleur, du danger |
| `LF4` | Compagnonnage sexuel | Désir de relations intimes |
| `LF5` | Confort de vie | Conditions de vie confortables |
| `LF6` | Supériorité / compétition | Être supérieur, gagner, suivre le rythme |
| `LF7` | Protection des proches | Protéger ceux qu'on aime |
| `LF8` | Approbation sociale | Être reconnu, approuvé, valorisé |

**Usage** : D.personas.lf8Mapping (N2), E.aarrr (influence des triggers), campagnes (levier de persuasion)

---

## T.04 — Grille des Tensions Identitaires Commerciales

6 axes de tension × N segments par axe. Chaque segment a une peur, un désir caché, et un pattern d'achat.

| Axe | Code |
|---|---|
| Argent & Statut | `TENSION_MONEY` |
| Âge & Mortalité | `TENSION_AGE` |
| Genre & Séduction | `TENSION_GENDER` |
| Identité Sociale & Appartenance | `TENSION_IDENTITY` |
| Pouvoir & Influence | `TENSION_POWER` |
| Relations & Connexion | `TENSION_RELATION` |

Chaque axe contient des segments atomiques (N1) — voir §N1.04.

**Usage** : D.personas.tensionProfile (N2), E.sacraments (trigger design), campagnes (ciblage émotionnel)

---

## T.05 — Étapes AARRR (Pirate Funnel)

| Code | Étape | Question | Métrique primaire |
|---|---|---|---|
| `ACQ` | Acquisition | Comment me découvrent-ils ? | Reach, impressions, trafic |
| `ACT` | Activation | Ont-ils le premier "aha moment" ? | Taux de première action, sign-up |
| `RET` | Rétention | Reviennent-ils ? | MAU, churn rate, fréquence |
| `REV` | Revenue | Paient-ils ? | MRR, ARPU, conversion payant |
| `REF` | Referral | En parlent-ils ? | NPS, taux de referral, viralité |

**Usage** : E.aarrr (N2), E.sacraments (N2 ARTEMIS), Campaign.aarrStage, FieldReport.aarrMetrics, Operation Recommender

---

## T.06 — Types d'actions marketing

### ATL (Above The Line) — 10 types

| Code | Action |
|---|---|
| `ATL_TV` | Spot TV |
| `ATL_RADIO` | Spot Radio |
| `ATL_CINEMA` | Spot Cinéma |
| `ATL_PRESS` | Insertion Presse |
| `ATL_OOH` | Affichage (Out of Home) |
| `ATL_DOOH` | Affichage Digital |
| `ATL_TRANSIT` | Transit (bus, taxi, train) |
| `ATL_AMBIENT` | Ambient marketing |
| `ATL_AERIAL` | Aérien (banderoles, drones) |
| `ATL_SPONSORSHIP` | Sponsoring broadcast |

### BTL (Below The Line) — 38 types

| Code | Action |
|---|---|
| `BTL_SAMPLING` | Sampling / dégustation |
| `BTL_STREET` | Street marketing |
| `BTL_PDV` | Activation point de vente |
| `BTL_EVENT` | Événementiel |
| `BTL_LAUNCH` | Lancement produit |
| `BTL_SPONSORING` | Sponsoring événementiel |
| `BTL_DIRECT_MAIL` | Direct mail |
| `BTL_FASHION` | Fashion show |
| `BTL_CAMPUS` | Activation campus |
| `BTL_SENSIBILISATION` | Sensibilisation / éducation |
| `BTL_TRADE_MARKETING` | Trade marketing |
| `BTL_POPUP` | Pop-up store |
| `BTL_ROADSHOW` | Roadshow |
| `BTL_CONCOURS` | Concours / jeux |
| `BTL_PLV` | PLV (publicité sur lieu de vente) |
| `BTL_MERCHANDISING` | Merchandising |
| `BTL_PACKAGING` | Packaging promotionnel |
| `BTL_BRANDING` | Branding environnemental |
| `BTL_GUERILLA` | Guérilla marketing |
| `BTL_EXPERIENTIAL` | Marketing expérientiel |
| `BTL_VIP` | Événement VIP / hospitality |
| `BTL_DEMO` | Démonstration produit |
| `BTL_WORKSHOP` | Workshop / masterclass |
| `BTL_CHARITY` | Action caritative / RSE |
| `BTL_FLASH_MOB` | Flash mob |
| `BTL_FOOD_TRUCK` | Food truck / véhicule de marque |
| `BTL_FESTIVAL` | Participation festival |
| `BTL_SPORT` | Activation sportive |
| `BTL_CULTURAL` | Activation culturelle |
| `BTL_B2B_EVENT` | Événement B2B / salon |
| `BTL_CONFERENCE` | Conférence / keynote |
| `BTL_LOYALTY` | Programme de fidélité physique |
| `BTL_AMBASSADOR` | Programme ambassadeur terrain |
| `BTL_DOOR_TO_DOOR` | Porte-à-porte |
| `BTL_TELEMARKETING` | Télémarketing |
| `BTL_PARTNERSHIP` | Partenariat de distribution |
| `BTL_IN_STORE` | Animation en magasin |
| `BTL_COMMUNITY` | Animation communautaire terrain |

### TTL (Through The Line) — 27 types

| Code | Action |
|---|---|
| `TTL_SOCIAL_ORGANIC` | Social media organique |
| `TTL_SOCIAL_AD` | Social media paid |
| `TTL_SEA` | Search Engine Advertising |
| `TTL_SEO` | Search Engine Optimization |
| `TTL_INFLUENCER` | Marketing d'influence |
| `TTL_CONTENT` | Content marketing |
| `TTL_CRM` | CRM / nurturing |
| `TTL_EMAIL` | Email marketing |
| `TTL_SMS` | SMS marketing |
| `TTL_WHATSAPP` | WhatsApp marketing |
| `TTL_LOYALTY_DIGITAL` | Programme fidélité digital |
| `TTL_APP_INSTALL` | Campagne d'installation app |
| `TTL_COMMUNITY_MGMT` | Community management |
| `TTL_PODCAST` | Podcast branded |
| `TTL_WEBINAR` | Webinaire |
| `TTL_VIDEO_CONTENT` | Contenu vidéo (YouTube, etc.) |
| `TTL_AFFILIATE` | Marketing d'affiliation |
| `TTL_PROGRAMMATIC` | Publicité programmatique |
| `TTL_NATIVE_AD` | Publicité native |
| `TTL_DISPLAY` | Display advertising |
| `TTL_RETARGETING` | Retargeting |
| `TTL_UGC` | User Generated Content |
| `TTL_LIVE_SHOPPING` | Live shopping |
| `TTL_CHATBOT` | Chatbot marketing |
| `TTL_AR_VR` | Réalité augmentée / VR |
| `TTL_GAMIFICATION` | Gamification digitale |
| `TTL_PR_DIGITAL` | Relations presse digitales |

**Usage** : Campaign.actions (N2), E.touchpoints (sélection de canaux), I.campaigns (composition des opérations), brief composition

---

## T.07 — Devotion Ladder (6 niveaux)

| Code | Niveau | Comportement caractéristique | Transition vers le suivant |
|---|---|---|---|
| `DEV_SPECTATEUR` | Spectateur | Voit la marque, pas d'interaction | Premier contact significatif |
| `DEV_INTERESSE` | Intéressé | Cherche activement des informations | Premier achat ou inscription |
| `DEV_PARTICIPANT` | Participant | Achète, utilise, interagit | Usage régulier, habitude |
| `DEV_ENGAGE` | Engagé | Revient systématiquement, donne du feedback | Recommandation spontanée |
| `DEV_AMBASSADEUR` | Ambassadeur | Recommande activement, défend la marque | Prosélytisme actif |
| `DEV_EVANGELISTE` | Évangéliste | Convertit les autres, crée du contenu, incarne la marque | — (niveau terminal) |

**Usage** : A.hierarchieCommunautaire (mapping), E.gamification (progression), E.ritesDePassage (ARTEMIS), SuperfanProfile.segment, DevotionSnapshot

---

## T.08 — Canaux Driver

| Code | Canal | Type |
|---|---|---|
| `CHAN_INSTAGRAM` | Instagram | Digital |
| `CHAN_FACEBOOK` | Facebook | Digital |
| `CHAN_TIKTOK` | TikTok | Digital |
| `CHAN_LINKEDIN` | LinkedIn | Digital |
| `CHAN_YOUTUBE` | YouTube | Digital |
| `CHAN_TWITTER` | Twitter/X | Digital |
| `CHAN_WEBSITE` | Site web | Digital |
| `CHAN_APP` | Application mobile | Digital |
| `CHAN_EMAIL` | Email | Digital |
| `CHAN_SMS` | SMS / WhatsApp | Digital |
| `CHAN_PACKAGING` | Packaging | Physique |
| `CHAN_PLV` | PLV | Physique |
| `CHAN_OOH` | Affichage | Physique |
| `CHAN_PRINT` | Print (flyer, brochure) | Physique |
| `CHAN_EVENT` | Événementiel | Expérientiel |
| `CHAN_POPUP` | Pop-up / activation | Expérientiel |
| `CHAN_PR` | Relations presse | Média |
| `CHAN_TV` | Télévision | Média |
| `CHAN_RADIO` | Radio | Média |
| `CHAN_VIDEO` | Production vidéo | Média |

**Usage** : Driver.channel, E.touchpoints.canal, Campaign.actions (canal d'exécution)

---

## T.09 — Secteurs d'activité

| Code | Secteur | Coefficient α (budget) |
|---|---|---|
| `SECT_FMCG` | Grande consommation | Haut |
| `SECT_BANK` | Banque / Finance | Moyen-haut |
| `SECT_TELECOM` | Télécommunications | Haut |
| `SECT_RETAIL` | Distribution | Moyen |
| `SECT_HEALTH` | Santé / Pharma | Moyen |
| `SECT_TECH` | Technologie / SaaS | Variable |
| `SECT_AGRI` | Agriculture / Agro-industrie | Moyen-bas |
| `SECT_ENERGY` | Énergie | Bas |
| `SECT_REAL_ESTATE` | Immobilier | Moyen |
| `SECT_EDUCATION` | Éducation | Bas |
| `SECT_HOSPITALITY` | Hôtellerie / Restauration | Moyen |
| `SECT_FASHION` | Mode / Luxe | Haut |
| `SECT_MEDIA` | Média / Entertainment | Moyen |
| `SECT_GOVERNMENT` | Secteur public | Bas |
| `SECT_NGO` | ONG / Associatif | Très bas |
| `SECT_TRANSPORT` | Transport / Logistique | Moyen-bas |
| `SECT_CONSTRUCTION` | BTP / Construction | Bas |

**Usage** : Strategy.sector, budget formula (coefficient α), Knowledge Graph (benchmarks sectoriels), VERTICAL_DICTIONARY (vocabulaire)

---

## T.10 — Profils de maturité

| Code | Profil | Coverage attendue | Mode génération | Ratio descriptif/projectif |
|---|---|---|---|---|
| `MAT_MATURE` | Mature | 100% | Descriptif | 100/0 |
| `MAT_GROWTH` | Croissance | 70% | Mixte | 70/30 |
| `MAT_STARTUP` | Startup | 40% | Projectif | 40/60 |
| `MAT_LAUNCH` | Lancement | 0% | Vision | 0/100 |

**Usage** : Strategy.maturityProfile, génération AI (adaptation du ton), scoring (seuils ajustés), budget formula (coefficient β)

---

## T.11 — Marchés géographiques

| Code | Marché | Devise | Coefficient γ (environnement) |
|---|---|---|---|
| `MKT_CM` | Cameroun | XAF | Référence |
| `MKT_CI` | Côte d'Ivoire | XOF | Comparable |
| `MKT_SN` | Sénégal | XOF | Comparable |
| `MKT_GA` | Gabon | XAF | Pouvoir d'achat + |
| `MKT_CG` | Congo-Brazzaville | XAF | Comparable |
| `MKT_CD` | RD Congo | CDF | Volatilité + |
| `MKT_BF` | Burkina Faso | XOF | Pouvoir d'achat - |
| `MKT_ML` | Mali | XOF | Instabilité + |
| `MKT_BJ` | Bénin | XOF | Comparable |
| `MKT_TG` | Togo | XOF | Pouvoir d'achat - |
| `MKT_NE` | Niger | XOF | Pouvoir d'achat -- |
| `MKT_TD` | Tchad | XAF | Instabilité + |
| `MKT_GN` | Guinée | GNF | Volatilité + |
| `MKT_MG` | Madagascar | MGA | Isolé |
| `MKT_FR` | France (diaspora) | EUR | Référence premium |
| `MKT_GLOBAL` | Multi-marché | — | Agrégé |

**Usage** : Strategy.market, Driver (adaptation multi-marché), budget formula (coefficient γ), Market Study, pricing

---

# NIVEAU 1 — ATOMES

La plus petite unité de donnée indivisible. Chaque atome a un type, des contraintes de valeur, et un pilier source.

## N1.01 — Atomes scalaires

| ID | Nom | Type | Contraintes | Pilier | Exemple |
|---|---|---|---|---|---|
| `atom.text` | Texte libre | string | min/max chars configurable | * | "Notre mission est..." |
| `atom.text_short` | Texte court | string | max:150 chars | * | Un slogan, un nom |
| `atom.text_medium` | Texte moyen | string | min:50, max:500 chars | * | Une description, un acte |
| `atom.text_long` | Texte long | string | min:100, max:2000 chars | * | Un résumé exécutif |
| `atom.number` | Nombre | number | min/max configurable | * | Un prix, un score |
| `atom.currency` | Montant monétaire | number + devise | ≥0, devise dans T.11 | V | 150000 XAF |
| `atom.percentage` | Pourcentage | number | 0-100 | * | 15% |
| `atom.ratio` | Ratio | number | ≥0 | V | LTV/CAC = 3.5 |
| `atom.score_100` | Score /100 | number | 0-100, entier | R,T | riskScore, bmfScore |
| `atom.score_25` | Score /25 | number | 0-25, 2 décimales | * | Score pilier |
| `atom.boolean` | Booléen | boolean | true/false | * | Est-ce vérifié ? |
| `atom.date` | Date | ISO string | format valide | * | 2026-03-24 |
| `atom.duration_months` | Durée en mois | number | ≥1, entier | V | dureeLTV = 24 |
| `atom.rank` | Rang | number | ≥1, unique dans son contexte | A | Rang de valeur = 1 |
| `atom.url` | URL | string | format URL valide | D | portfolioUrl |
| `atom.hex_color` | Couleur | string | format #RRGGBB | D | #10B981 |

---

## N1.02 — Atomes énumérés (sélection dans une taxonomie N0)

| ID | Nom | Taxonomie source | Cardinalité | Pilier |
|---|---|---|---|---|
| `atom.archetype` | Archétype | T.01 | 1 primaire + 0-1 secondaire | A |
| `atom.schwartz_value` | Valeur Schwartz | T.02 | Sélection 3-7 parmi 10 | A |
| `atom.lf8` | Levier LF8 | T.03 | Sélection 1-3 parmi 8 | D |
| `atom.tension_axis` | Axe de tension | T.04 | Sélection 1-2 parmi 6 | D |
| `atom.aarrr_stage` | Étape AARRR | T.05 | 1 parmi 5 | E, Campaign |
| `atom.action_type` | Type d'action | T.06 | 1 parmi 75 (ATL+BTL+TTL) | Campaign |
| `atom.action_category` | Catégorie d'action | {ATL, BTL, TTL} | 1 parmi 3 | Campaign |
| `atom.devotion_level` | Niveau Devotion | T.07 | 1 parmi 6 | A, E |
| `atom.channel` | Canal | T.08 | 1 parmi 20 | Driver |
| `atom.sector` | Secteur | T.09 | 1 parmi 17 | Strategy |
| `atom.maturity` | Maturité | T.10 | 1 parmi 4 | Strategy |
| `atom.market` | Marché | T.11 | 1+ parmi 16 | Strategy |
| `atom.touchpoint_type` | Type touchpoint | {physique, digital, humain} | 1 parmi 3 | E |
| `atom.ritual_type` | Type rituel | {always-on, cyclique} | 1 parmi 2 | E |
| `atom.risk_level` | Niveau de risque | {low, medium, high, critical} | 1 parmi 4 | R |
| `atom.urgency` | Urgence | {immediate, short_term, medium_term, long_term} | 1 parmi 4 | R |
| `atom.hypothesis_status` | Statut hypothèse | {validated, invalidated, to_test} | 1 parmi 3 | T |
| `atom.lifecycle_phase` | Phase cycle de vie | {launch, growth, mature, decline} | 1 parmi 4 | V |
| `atom.product_category` | Catégorie produit | {produit, service} | 1 parmi 2 | V |
| `atom.cost_category` | Catégorie coût | {capex, opex, cout_cache, friction, migration, apprentissage} | 1 parmi 6 | V |
| `atom.value_category` | Catégorie valeur | {fonctionnel, emotionnel, social} | 1 parmi 3 | V |
| `atom.guild_tier` | Tier guilde | {APPRENTI, COMPAGNON, MAITRE, ASSOCIE} | 1 parmi 4 | Guilde |
| `atom.mission_mode` | Mode mission | {DISPATCH, COLLABORATIF} | 1 parmi 2 | Mission |

---

## N1.03 — Atomes dérivés (calculés depuis d'autres atomes)

| ID | Nom | Formule | Inputs | Pilier |
|---|---|---|---|---|
| `atom.marge_unitaire` | Marge unitaire | `(prix - cout) / prix × 100` | prix, cout d'un produit | V |
| `atom.ltv_cac_ratio` | Ratio LTV/CAC | `ltv / cac` | ltv, cac | V |
| `atom.marge_nette` | Marge nette | `CA - budget_total` | CA visé, budget paramétrique | V |
| `atom.roi_estime` | ROI estimé | `(ltv × clients_estimes - investissement) / investissement` | ltv, cac, som | V |
| `atom.payback_period` | Période de retour | `cac / (ltv / duree_ltv)` | cac, ltv, duree_ltv | V |
| `atom.budget_parametrique` | Budget paramétrique | `CA × α(secteur) × β(maturité) × γ(environnement)` | CA, secteur, maturité, marché | V→I |
| `atom.risk_score` | Score de risque | `Σ(critical×30 + high×15 + medium×5 + low×1) × normalisation` | microSwots.riskLevel | R |
| `atom.bmf_score` | Score Brand-Market Fit | Évaluation multi-critères (validation hypothèses × triangulation × TAM crédibilité) | Données T complètes | T |
| `atom.coherence_score` | Score cohérence | Évaluation cross-pilier (A↔D↔V↔E cohérence) | Tous les piliers | S |
| `atom.cult_index` | Cult Index | Moyenne pondérée de 7 dimensions (engagement depth, superfan velocity, community cohesion, brand defense, UGC, ritual adoption, evangelism) | Brand OS data | E→Signal |
| `atom.score_pilier` | Score /25 | `score_structural × quality_modulator` | Rubrique structurelle + AI modulator | Chaque pilier |
| `atom.composite_200` | Score /200 | `Σ score_pilier` (8 piliers) | 8 × score_pilier | S |

---

## N1.04 — Segments de tension (atomes de la Grille T.04)

Chaque segment est un atome composé de 3 sous-champs fixes.

```typescript
interface TensionSegment {
  axis: atom.tension_axis;        // Ex: TENSION_MONEY
  segment: string;                // Ex: "Les nouveaux riches"
  fear: atom.text_short;          // "Terreur de ne pas être légitimes"
  hiddenDesire: atom.text_short;  // "Désir de validation par les codes"
  buyingPattern: atom.text_medium; // "Luxe ostentatoire, clubs privés, marques-signaux, mentors à 10K"
  lf8Mapping: atom.lf8[];         // [LF6, LF8] — Supériorité + Approbation sociale
}
```

**Segments par axe** :

| Axe | Segments |
|---|---|
| TENSION_MONEY | Les riches, Les nouveaux riches, La classe moyenne supérieure, La classe moyenne, Les pauvres ambitieux, Les pauvres résignés |
| TENSION_AGE | Les vieux, Les vieux actifs, Les 40-50, Les 30-35, Les 20-25, Les ados |
| TENSION_GENDER | Les hommes, Les hommes en couple, Les femmes, Les femmes ambitieuses, Les mères, Les pères |
| TENSION_IDENTITY | Les expatriés, Les marginaux/alternatifs, Les convertis, Les premiers de la classe, Les intellectuels, Les créatifs |
| TENSION_POWER | Les leaders, Les entrepreneurs, Les politiques, Les influenceurs, Les employés ambitieux |
| TENSION_RELATION | Les solitaires, Les couples installés, Les divorcés, Les self-made |

**Total : 33 segments × 3 champs + LF8 mapping = le référentiel psychométrique complet.**

**Usage** : D.personas.tensionProfile (chaque persona est mappé sur 1-2 segments), E.sacraments (les triggers sont dérivés des désirs cachés), Campaign (ciblage émotionnel)

---

# NIVEAU 2 — COMPOSITES

Structures composées d'atomes. Chaque composite a un type, une liste de champs atomiques, et des règles de validation.

## N2.01 — Valeur de marque

```typescript
interface BrandValue {                      // Pilier A
  value: atom.schwartz_value;               // Sélection dans T.02
  customName: atom.text_short;              // Nom affiné (ex: "L'audace de proposer")
  rank: atom.rank;                          // Unique, séquentiel
  justification: atom.text_medium;          // Pourquoi ce rang
  costOfHolding: atom.text_medium;          // Quand cette valeur coûte quelque chose
  tensionWith: atom.schwartz_value[];       // Valeurs en tension (vérifié contre T.02)
}
```

**Validation** : `rank` unique dans le set, `tensionWith` cohérent avec T.02, `costOfHolding` non vide (une valeur sans coût n'est pas une valeur)

---

## N2.02 — Acte du Hero's Journey

```typescript
interface HeroJourneyAct {                  // Pilier A
  actNumber: 1 | 2 | 3 | 4 | 5;
  title: atom.text_short;                   // "Les origines", "L'appel", etc.
  narrative: atom.text_medium;              // Le récit de cet acte
  emotionalArc: atom.text_short;            // L'émotion dominante (empathie, tension, vulnérabilité, espoir, inspiration)
  causalLink: atom.text_short;              // Lien avec l'acte précédent (vide pour acte 1)
}
```

**Validation** : 5 actes séquentiels, `causalLink` non vide pour actes 2-5, `emotionalArc` suit une progression (pas 5 fois la même émotion)

---

## N2.03 — Ikigai de marque

```typescript
interface BrandIkigai {                     // Pilier A
  love: atom.text_medium;                   // Ce qu'on aime (passion, pas métier)
  competence: atom.text_medium;             // Ce qu'on fait le mieux (vérifiable)
  worldNeed: atom.text_medium;              // Ce dont le monde a besoin (formulé comme manque)
  remuneration: atom.text_medium;           // Ce pour quoi on nous paie (transfert de valeur)
  intersection: atom.text_medium;           // L'intersection (raison d'être — dérivé des 4)
}
```

**Validation** : 4 champs non vides + `intersection` qui doit contenir des éléments des 4 autres champs. Cross-ref : `competence` → D.avantagesCompetitifs, `remuneration` → V.produitsCatalogue

---

## N2.04 — Persona

```typescript
interface Persona {                         // Pilier D
  id: string;                               // "persona-001"
  name: atom.text_short;                    // Prénom + contexte ("Brice, 34 ans, DG PME")
  priority: atom.rank;                      // 1 = persona principal

  // Démographie
  age: atom.number;                         // Âge ou tranche
  csp: atom.text_short;                     // Catégorie socio-professionnelle
  location: atom.market;                    // Marché principal
  income: atom.text_short;                  // Fourchette de revenus
  familySituation: atom.text_short;         // Situation familiale

  // Psychométrie
  tensionProfile: TensionSegment;           // N1.04 — segment de la Grille des Tensions
  lf8Dominant: atom.lf8[];                  // 1-3 LF8 dominants (de T.03)
  schwartzValues: atom.schwartz_value[];    // 2-3 valeurs dominantes du persona (de T.02)
  
  // Psychographie
  lifestyle: atom.text_medium;              // Style de vie, centres d'intérêt
  mediaConsumption: atom.text_medium;       // Quels médias, quelles plateformes, quand
  brandRelationships: atom.text_medium;     // Marques qu'il utilise/admire (et pourquoi)

  // Motivations & Freins
  motivations: atom.text_medium;            // Ce qui le pousse vers la marque
  fears: atom.text_medium;                  // Ce qui le retient
  hiddenDesire: atom.text_medium;           // Ce qu'il veut vraiment (de tensionProfile.hiddenDesire)
  whatTheyActuallyBuy: atom.text_medium;    // Ce qu'il achète réellement (de tensionProfile.buyingPattern)

  // Parcours
  jobsToBeDone: atom.text_medium[];         // Les "jobs" qu'il essaie d'accomplir
  decisionProcess: atom.text_medium;        // Comment il décide (impulsif, comparateur, délégateur...)
  devotionPotential: atom.devotion_level;   // Niveau max atteignable dans la Devotion Ladder
}
```

**Validation** : au moins `name`, `tensionProfile`, `lf8Dominant`, `motivations`, `fears` non vides. Cross-ref : `schwartzValues` doit avoir au moins 1 valeur en commun avec A.valeurs (le persona partage au moins une valeur avec la marque — sinon pourquoi serait-il client ?)

---

## N2.05 — Produit/Service (SKU)

```typescript
interface ProduitService {                  // Pilier V
  id: string;                               // "prod-001"
  nom: atom.text_short;                     // Nom du produit
  categorie: atom.product_category;         // produit / service
  prix: atom.currency;                      // Prix de vente
  cout: atom.currency;                      // Coût de revient
  margeUnitaire: atom.marge_unitaire;       // Dérivé : (prix-cout)/prix

  // Valeur
  gainClientConcret: atom.text_medium;      // Gain fonctionnel mesurable pour le client
  gainClientAbstrait: atom.text_medium;     // Gain émotionnel/social pour le client
  gainMarqueConcret: atom.text_medium;      // Gain mesurable pour la marque (revenu, data...)
  gainMarqueAbstrait: atom.text_medium;     // Gain intangible (positionnement, fidélisation...)
  coutClientConcret: atom.text_medium;      // Coût financier + friction tangible
  coutClientAbstrait: atom.text_medium;     // Coût psychologique (risque perçu, apprentissage)
  coutMarqueConcret: atom.currency;         // COGS + distribution
  coutMarqueAbstrait: atom.text_medium;     // Coût d'opportunité, cannibalisation

  // Positionnement
  lienPromesse: atom.text_medium;           // Comment ce produit incarne la promesse maître (ref D)
  segmentCible: string;                     // ID du persona visé (ref D.personas.id)
  phaseLifecycle: atom.lifecycle_phase;     // launch/growth/mature/decline
  
  // Persuasion
  leviersPsychologiques: atom.text_short[]; // Cialdini, etc. (réciprocité, rareté, preuve sociale...)
  maslowMapping: atom.text_short;           // Quel niveau de Maslow
  lf8Trigger: atom.lf8[];                   // Quels LF8 ce produit active
  scoreEmotionnelADVE: atom.score_100;      // Score de charge émotionnelle 0-100

  // Distribution
  canalDistribution: atom.channel[];        // Canaux de distribution
  disponibilite: atom.text_short;           // Disponibilité géographique/temporelle
  
  // Catalogue
  skuRef: atom.text_short;                  // Référence SKU (optionnel)
  variantes: string[];                      // IDs d'autres produits qui sont des variantes
  dependencies: string[];                   // IDs de produits requis (prérequis)
}
```

**Validation** : `prix` et `cout` doivent être > 0. `margeUnitaire` est calculé, pas saisi. `segmentCible` doit correspondre à un persona.id existant dans D.personas. `lienPromesse` doit être non vide (chaque produit justifie son existence dans la stratégie).

---

## N2.06 — Package (composite de produits)

```typescript
interface Package {                         // Pilier V
  id: string;                               // "pkg-001"
  nom: atom.text_short;
  produitIds: string[];                     // Références vers ProduitService.id
  prixPackage: atom.currency;               // Prix du package (≤ Σ prix individuels pour justifier)
  reduction: atom.percentage;               // % de réduction vs achat séparé
  segmentCible: string;                     // Persona visé
  rationale: atom.text_medium;              // Pourquoi ces produits ensemble
}
```

**Validation** : `produitIds` doivent tous exister dans V.produitsCatalogue. `prixPackage` ≤ Σ prix des produits inclus.

---

## N2.07 — Tier du Product Ladder (composite de packages/produits)

```typescript
interface ProductLadderTier {               // Pilier V
  tier: atom.text_short;                    // Nom du tier ("Starter", "Pro", "Enterprise")
  prix: atom.text_short;                    // Fourchette de prix
  produitIds: string[];                     // Références produits/packages inclus
  cible: string;                            // Persona ID
  description: atom.text_medium;            // Ce qui est inclus et pourquoi
  position: atom.rank;                      // Rang dans le ladder (1 = entrée de gamme)
}
```

**Validation** : les tiers doivent être ordonnés par prix croissant. Chaque tier doit cibler un segment distinct (pas le même persona pour 2 tiers adjacents sauf si l'usage diffère).

---

## N2.08 — Touchpoint

```typescript
interface Touchpoint {                      // Pilier E
  canal: atom.text_short;                   // Nom spécifique ("Instagram Stories", pas "réseaux sociaux")
  type: atom.touchpoint_type;               // physique / digital / humain
  channelRef: atom.channel;                 // Référence vers T.08
  role: atom.text_medium;                   // Rôle dans le parcours client
  aarrStage: atom.aarrr_stage;              // À quelle étape du funnel ce touchpoint opère
  devotionLevel: atom.devotion_level[];     // Quels niveaux de la Devotion Ladder il adresse
  priority: atom.rank;                      // Priorité relative
  frequency: atom.text_short;              // Fréquence d'interaction attendue
}
```

**Validation** : les 3 types doivent être représentés dans la collection. Chaque étape AARRR doit avoir au moins 1 touchpoint. Cross-ref : `channelRef` doit correspondre à un canal pour lequel un Driver peut être activé.

---

## N2.09 — Rituel

```typescript
interface Ritual {                          // Pilier E
  nom: atom.text_short;                     // Nom mémorable, propre à la marque
  type: atom.ritual_type;                   // always-on / cyclique
  frequency: atom.text_short;               // "Hebdomadaire", "Chaque Ramadan", "Annuel"
  description: atom.text_medium;            // Comment ça se passe
  devotionLevels: atom.devotion_level[];    // Quels niveaux participent
  touchpoints: string[];                    // Quels touchpoints sont mobilisés
  aarrPrimary: atom.aarrr_stage;            // Quelle étape AARRR ce rituel sert principalement
  kpiMeasure: atom.text_short;              // Comment on mesure si le rituel fonctionne
  sacredCalendarLink: string | null;        // Si cyclique, référence au calendrier sacré (ARTEMIS)
}
```

**Validation** : min:1 always-on + min:1 cyclique. `devotionLevels` doit couvrir au moins 3 niveaux de la Ladder (pas tous les rituels pour les évangélistes).

---

## N2.10 — Action Marketing (opération)

```typescript
interface MarketingAction {                 // Pilier E → I → Campaign
  id: string;                               // "action-001"
  name: atom.text_short;                    // Nom de l'opération
  type: atom.action_type;                   // De T.06 (ATL/BTL/TTL)
  category: atom.action_category;           // ATL / BTL / TTL
  
  // Ciblage
  aarrStage: atom.aarrr_stage;              // Étape AARRR visée
  aarrSecondary: atom.aarrr_stage | null;   // Étape secondaire (optionnel)
  personaTarget: string[];                  // IDs des personas visés
  devotionTarget: atom.devotion_level[];    // Niveaux de la Ladder visés
  
  // Exécution
  channels: atom.channel[];                 // Canaux d'exécution
  duration: atom.text_short;                // Durée de l'opération
  frequency: atom.text_short;               // Fréquence si récurrent
  geography: atom.market[];                 // Marchés ciblés
  
  // Créatifs nécessaires
  keyVisual: atom.boolean;                  // Nécessite un KV ?
  video: atom.boolean;                      // Nécessite une production vidéo ?
  audio: atom.boolean;                      // Nécessite un spot audio ?
  copywriting: atom.boolean;                // Nécessite du copy ?
  eventBranding: atom.boolean;              // Nécessite un branding événementiel ?

  // Costing
  costingUnit: "CPM" | "CPC" | "CPL" | "CPA" | "FLAT";
  coutUnitaire: atom.currency;              // Coût par unité
  volumeEstime: atom.number;                // Volume estimé
  budgetEstime: atom.currency;              // coutUnitaire × volumeEstime (dérivé)
  
  // Performance attendue
  kpiPrimary: atom.text_short;              // KPI principal
  kpiTarget: atom.text_short;               // Objectif chiffré
  rendementDecroissant: atom.percentage;    // % de diminishing returns estimé
  
  // Composition
  subActions: string[];                     // IDs d'actions enfants (ex: un événement contient du sampling + du street marketing)
  skuPromoted: string[];                    // IDs des produits/services promus
}
```

**Validation** : `type` doit être cohérent avec `category` (un type BTL_ ne peut pas être en catégorie ATL). `skuPromoted` doit référencer des produits existants dans V.produitsCatalogue. Si `eventBranding` = true, l'événement est un sous-système de marque (voir N2.11).

---

## N2.11 — Événement (sous-marque)

```typescript
interface BrandEvent {                      // Pilier E → I → Campaign
  id: string;
  name: atom.text_short;                    // Nom de l'événement
  parentBrandRef: string;                   // Lien vers la Strategy mère
  
  // L'événement EST une sous-marque
  eventArchetype: atom.archetype;           // Archétype de l'événement (peut différer de la marque mère)
  eventPromise: atom.text_short;            // Promesse spécifique de l'événement
  eventIdentity: {
    colorOverride: atom.hex_color[];        // Palette spécifique (dérivée de D.identiteVisuelle)
    moodOverride: atom.text_medium;         // Ambiance spécifique
    toneOverride: atom.text_short;          // Ajustement du ton (plus festif, plus solennel, etc.)
  };
  
  // Opérationnel
  format: "IN_PERSON" | "VIRTUAL" | "HYBRID";
  capacity: atom.number;
  budget: atom.currency;
  
  // Composition
  actions: string[];                        // IDs des MarketingAction qui composent l'événement
  team: Array<{name: string, role: string, fee: atom.currency}>;
  ambassadors: Array<{name: string, handle: string, deliverables: string[]}>;
}
```

**Validation** : `eventArchetype` doit être compatible avec l'archétype de la marque mère (pas contradictoire). `eventPromise` doit être une déclinaison de D.promessesDeMarque.promesseMaitre. Les `actions` enfants sont des MarketingAction de type événementiel.

---

## N2.12 — Brief de campagne (composite)

```typescript
interface CampaignBrief {                   // Pilier I → Campaign Manager
  id: string;
  campaignRef: string;                      // ID de la campagne
  
  // Direction stratégique (de A + D)
  axeStrategique: atom.text_medium;         // L'axe de communication
  pisteCreative: atom.text_medium;          // La piste d'exécution
  bigIdea: {
    concept: atom.text_medium;              // Le concept central
    mechanism: atom.text_short;             // Le mécanisme créatif
    insightLink: atom.text_medium;          // Lien avec l'insight consommateur
    declinaisons: Array<{                   // Déclinaisons par support
      support: atom.channel;
      description: atom.text_medium;
    }>;
  };
  
  // Intention AARRR
  aarrPrimary: atom.aarrr_stage;            // Objectif funnel primaire
  aarrSecondary: atom.aarrr_stage | null;   // Objectif secondaire
  aarrIntention: atom.text_medium;          // Ce qu'on veut accomplir spécifiquement
  
  // Budget
  budget: atom.currency;                    // Budget total du brief
  budgetAllocation: Array<{
    category: "PRODUCTION" | "MEDIA" | "TALENT" | "LOGISTICS" | "TECHNOLOGY" | "LEGAL" | "CONTINGENCY" | "AGENCY_FEE";
    amount: atom.currency;
  }>;
  
  // Opérations recommandées (de la bible d'actions T.06)
  recommendedActions: string[];             // IDs de MarketingAction
  
  // Cibles
  personaTargets: string[];                 // IDs de personas
  devotionObjective: {                      // Objectif Devotion Ladder
    from: atom.devotion_level;
    to: atom.devotion_level;
    targetPercentage: atom.percentage;       // % de l'audience à faire transiter
  };
  
  // Contraintes
  timeline: {start: atom.date, end: atom.date};
  markets: atom.market[];
  mandatoryChannels: atom.channel[];
  prohibitedChannels: atom.channel[];
}
```

**Validation** : `budget` doit être ≤ au budget restant dans la campagne. `recommendedActions` doivent référencer des actions existantes. `aarrPrimary` doit être cohérent avec le type de campagne (une campagne de lancement = ACQ, une campagne de fidélisation = RET). `bigIdea.concept` doit être dérivable du positionnement D.

---

## N2.13 — Signal (atome d'intelligence)

```typescript
interface Signal {                          // Pilier R + T (Tarsis)
  id: string;
  layer: "METRIC" | "STRONG" | "WEAK";
  pillarAffected: atom.text_short;          // Quel pilier ce signal impacte (A, D, V, E...)
  
  // Contenu
  title: atom.text_short;
  description: atom.text_medium;
  source: atom.text_short;                  // D'où vient le signal (veille, client, terrain, social...)
  confidence: atom.percentage;              // Niveau de confiance 0-100
  
  // Impact
  advertis_impact: {                        // Impact estimé sur le vecteur ADVERTIS
    pillar: string;
    direction: "positive" | "negative" | "neutral";
    magnitude: "low" | "medium" | "high";
  }[];
  
  // Action
  status: "ACTIVE" | "ACKNOWLEDGED" | "ACTIONED" | "DISMISSED";
  urgency: atom.urgency;
  recommendedAction: atom.text_medium;      // Ce que Mestor recommande
}
```

**Usage** : le feedback loop consomme les signaux et recalibre les scores des piliers. Mestor agrège les signaux actifs pour ses recommandations quotidiennes.

---

## N2.14 — Ennemi (Le Sheitan du culte)

> L'ennemi n'est PAS un concept abstrait ("la médiocrité"). C'est un **mouvement miroir concret** avec des adeptes, des marques, des valeurs opposées, et des actions d'opposition mesurables. La haine commune de l'ennemi est le liant de fraternité le plus puissant entre les superfans — plus fort que l'amour de la marque elle-même. C'est le Sheitan du culte de marque.

```typescript
interface Enemy {                           // Pilier A (ARTEMIS FW-20)
  // Identité du mouvement ennemi
  name: atom.text_short;                    // Nom du mouvement ennemi (pas un concurrent — le MOUVEMENT)
  manifesto: atom.text_medium;              // Ce que l'ennemi croit et prêche — sa vision du monde
  narrative: atom.text_medium;              // Le récit dominant de l'ennemi ("les choses sont bien comme elles sont", "seule la taille compte", etc.)
  
  // Opposition axiologique (Schwartz)
  enemySchwartzValues: atom.schwartz_value[];  // Valeurs que l'ennemi incarne (sélection dans T.02)
  brandSchwartzValues: atom.schwartz_value[];  // Nos valeurs pour vérifier la tension (doit être en opposition via T.02 tensions)
  tensionProof: atom.text_medium;              // Preuve concrète que ces valeurs sont en opposition sur le terrain
  
  // Position sur la fenêtre d'Overton
  overtonMap: {
    ourPosition: atom.text_medium;          // Où notre marque se situe sur le spectre (ex: "l'excellence créative est un droit, pas un luxe")
    enemyPosition: atom.text_medium;        // Où l'ennemi se situe (ex: "le volume et le prix bas sont les seuls critères")
    battleground: atom.text_medium;         // La zone contestée entre les deux (ex: "la classe moyenne qui hésite entre qualité et économie")
    shiftDirection: atom.text_medium;       // Dans quelle direction on pousse l'Overton (ex: "normaliser l'investissement dans la marque pour les PME africaines")
  };
  
  // Forces concrètes de l'ennemi
  enemyBrands: Array<{                     // Les marques qui incarnent l'ennemi
    name: atom.text_short;                  // Nom de la marque
    sector: atom.sector;                    // Secteur
    marketShare: atom.text_short;           // Part de marché estimée
    howTheyFight: atom.text_medium;         // Comment elles s'opposent concrètement (prix dumping, lobbying, saturation média...)
    theirSuperfans: atom.text_short;        // Profil de leurs superfans
  }>;
  enemySuperfanProfile: {
    tensionSegments: TensionSegment[];      // Les segments de tension (N1.04) que l'ennemi capture
    lf8Exploited: atom.lf8[];              // Quels LF8 l'ennemi exploite (typiquement LF3 peur, LF5 confort)
    count: atom.text_short;                 // Estimation de la taille de la base ennemie
  };
  enemyNarratives: Array<{                 // Les contre-narratifs actifs dans le marché
    narrative: atom.text_medium;            // Le message
    channel: atom.channel;                  // Où il circule
    effectiveness: atom.risk_level;         // low/medium/high/critical — à quel point ça nous impacte
  }>;
  
  // Modes d'opposition
  activeOpposition: Array<{                // Actions délibérées contre notre mouvement
    action: atom.text_medium;              // Lobbying, campagnes de désinformation, undercut prix, occupation des canaux...
    frequency: atom.text_short;            // Permanent, saisonnier, réactif
    impact: atom.risk_level;               // Impact sur notre mouvement
  }>;
  passiveOpposition: Array<{               // Résistances structurelles
    resistance: atom.text_medium;          // Habitudes consommateur, normes culturelles, inertie institutionnelle
    entrenchment: atom.risk_level;         // À quel point c'est enraciné
  }>;
  
  // Notre stratégie de combat
  counterStrategy: {
    marketingCounter: atom.text_long;       // Comment nos campagnes combattent l'ennemi
    lobbyingCounter: atom.text_medium;      // Actions de lobbying / influence institutionnelle
    alliances: Array<{                      // Alliés naturels dans ce combat
      name: atom.text_short;
      type: atom.text_short;               // "Marque alliée", "Institution", "Influenceur", "Média"
      sharedEnemy: atom.text_short;         // Pourquoi ils combattent le même ennemi
    }>;
    overtonActions: atom.text_medium[];     // Actions concrètes pour déplacer l'Overton (études, événements, prises de parole...)
  };
  
  // Fraternité (lien Devotion)
  fraternityFuel: {
    sharedHatred: atom.text_medium;         // Ce que les superfans détestent ensemble chez l'ennemi
    recognitionSignal: atom.text_medium;    // Comment les superfans se reconnaissent mutuellement dans le combat
    tribalRituals: atom.text_medium;        // Les rituels de groupe qui renforcent le lien anti-ennemi
    warStories: atom.text_medium;           // Les histoires de victoire contre l'ennemi que la communauté partage
  };
}
```

**Validation** : `enemySchwartzValues` doit être en tension avec `brandSchwartzValues` (vérifié contre T.02). `enemyBrands` min:1 (l'ennemi a au minimum une incarnation concrète). `activeOpposition` + `passiveOpposition` min:2 total. `counterStrategy.alliances` min:1 (on ne combat pas seul). Cross-ref : `fraternityFuel.tribalRituals` doit correspondre à au moins un rituel dans E.rituels. `overtonMap.shiftDirection` doit être cohérent avec `A.prophecy.worldTransformed`.

---

## N2.15 — Direction Artistique (Pipeline BRAND GLORY)

> La DA n'est pas 3 champs texte. C'est un système de production visuelle composé de **10 sous-composites séquencés**, chacun correspondant à un outil GLORY de la couche BRAND. Chaque outil produit un output structuré qui devient une unité atomique de la DA. Le pipeline a des dépendances explicites — on ne peut pas faire la typographie avant la chromatique, ni les tokens avant le logo.

### Pipeline et dépendances

```
BRAND #1  SemioticAnalysis         → []              (analyse sémiotique : Greimas, Floch, Barthes)
BRAND #2  VisualLandscapeMap       → [#1]            (cartographie visuelle concurrentielle)
BRAND #3  Moodboard                → [#1, #2]        (moodboard multi-source + prompts Nano Banana)
BRAND #4  ChromaticSystem          → [#3]            (système chromatique 5 niveaux)
BRAND #5  TypographySystem         → [#4]            (système typographique 4 couches)
BRAND #6  LogoTypeRecommendation   → [#4, #5]        (recommandation type de logo)
BRAND #7  LogoValidation           → [#6]            (protocole validation logo)
BRAND #8  DesignTokens             → [#4, #5, #6]    (design tokens 3-tier)
BRAND #9  MotionIdentity           → [#8]            (identité motion)
BRAND #10 BrandGuidelines          → [tout]          (guidelines 13 sections)
```

### Sous-composite #1 — Analyse Sémiotique

```typescript
interface SemioticAnalysis {                // GLORY: semiotic-brand-analyzer
  greimas: {
    subject: atom.text_short;              // Le sujet du carré sémiotique
    contrary: atom.text_short;             // Le contraire
    contradictory: atom.text_short;        // Le contradictoire
    implication: atom.text_short;          // L'implication
    brandPosition: atom.text_medium;       // Où la marque se positionne dans le carré
  };
  flochAxes: {
    practicalVsUtopian: atom.text_medium;  // Position sur l'axe pratique ↔ utopique
    criticalVsLudic: atom.text_medium;     // Position sur l'axe critique ↔ ludique
    brandQuadrant: atom.text_short;        // Quadrant dominant
  };
  barthesConnotation: {
    denotation: atom.text_medium;          // Ce que la marque montre littéralement
    connotation: atom.text_medium;         // Ce que la marque suggère implicitement
    myths: atom.text_medium;               // Quels mythes culturels la marque mobilise
  };
  semanticGaps: atom.text_medium[];        // Zones de sens non-occupées dans le paysage concurrentiel
  culturalContext: atom.market[];           // Marchés culturels analysés
}
```

### Sous-composite #2 — Cartographie Visuelle Concurrentielle

```typescript
interface VisualLandscapeMap {              // GLORY: visual-landscape-mapper
  matrix: {
    axisX: atom.text_short;                // Ex: "Premium ↔ Accessible"
    axisY: atom.text_short;                // Ex: "Modern ↔ Heritage"
    competitors: Array<{
      name: atom.text_short;
      positionX: atom.number;              // -100 à +100
      positionY: atom.number;
      dominantColors: atom.hex_color[];
      typographyStyle: atom.text_short;
    }>;
    brandTarget: { x: atom.number; y: atom.number }; // Où viser
    availableZones: atom.text_medium[];     // Zones visuellement non-occupées
  };
  dba: Array<{                             // Distinctive Brand Assets
    competitor: atom.text_short;
    assets: atom.text_short[];             // Éléments visuels distinctifs identifiés
    ownershipStrength: atom.risk_level;    // Combien l'asset est "possédé" par ce concurrent
  }>;
  chromaticTerritory: {
    occupied: atom.hex_color[];            // Couleurs prises par les concurrents
    available: atom.hex_color[];           // Couleurs disponibles
  };
}
```

### Sous-composite #3 — Moodboard

```typescript
interface Moodboard {                       // GLORY: visual-moodboard-generator
  direction: atom.text_long;               // Direction visuelle narrative
  mood: atom.text_short[];                 // Tags d'ambiance
  references: Array<{
    source: atom.text_short;               // Unsplash, Pexels, Pinterest, Are.na, Brave
    url: atom.url;
    rationale: atom.text_short;            // Pourquoi cette référence
  }>;
  cmfAnalysis: {                           // Color, Material, Finish
    colors: atom.text_medium;
    materials: atom.text_medium;
    finishes: atom.text_medium;
  };
  nanoBananaPrompts: atom.text_long[];     // Prompts optimisés pour génération AI
  applications: atom.text_short[];         // Supports prioritaires
}
```

### Sous-composite #4 — Système Chromatique

```typescript
interface ChromaticSystem {                 // GLORY: chromatic-strategy-builder
  tiers: {
    primary: Array<{                       // Tier 1 — Couleurs maîtresses (2-3)
      hex: atom.hex_color;
      name: atom.text_short;
      munsell: atom.text_short;            // Notation Munsell
      pantone: atom.text_short;            // Référence Pantone
      cmyk: atom.text_short;               // Valeurs CMYK pour print
      meaning: atom.text_medium;           // Signification sémiotique (lien avec LSI)
      usage: atom.text_short;              // Cas d'usage principal
    }>;
    secondary: Array<{hex: atom.hex_color; name: atom.text_short; usage: atom.text_short}>; // Tier 2
    accent: Array<{hex: atom.hex_color; name: atom.text_short; usage: atom.text_short}>;    // Tier 3
    neutral: Array<{hex: atom.hex_color; name: atom.text_short; usage: atom.text_short}>;   // Tier 4
    semantic: Array<{hex: atom.hex_color; name: atom.text_short; role: atom.text_short}>;    // Tier 5 (succès, erreur, warning, info)
  };
  accessibility: {
    wcagLevel: "AA" | "AAA";
    contrastPairs: Array<{fg: atom.hex_color; bg: atom.hex_color; ratio: atom.number}>;
  };
  forbidden: Array<{hex: atom.hex_color; reason: atom.text_short}>;  // Couleurs de l'ennemi ou du secteur à éviter
  applicationRules: atom.text_medium;      // Règles d'application par support
}
```

### Sous-composite #5 — Système Typographique

```typescript
interface TypographySystem {                // GLORY: typography-system-architect
  layers: {
    primary: {                             // Couche 1 — Titre / Display
      family: atom.text_short;
      weight: atom.text_short;
      rationale: atom.text_medium;
      license: atom.text_short;
    };
    secondary: {                           // Couche 2 — Corps
      family: atom.text_short;
      weight: atom.text_short;
      rationale: atom.text_medium;
      license: atom.text_short;
    };
    display: {                             // Couche 3 — Display / Impact (optionnel)
      family: atom.text_short | null;
      usage: atom.text_short;
    };
    functional: {                          // Couche 4 — UI / Monospace
      family: atom.text_short;
      usage: atom.text_short;
    };
  };
  scale: {
    ratio: atom.text_short;               // "Major Third 1.25" ou "Perfect Fourth 1.333"
    baseSize: atom.number;                // 16px typiquement
    sizes: Array<{name: atom.text_short; px: atom.number; usage: atom.text_short}>;
  };
  modes: {
    productive: atom.text_medium;          // Règles pour UI/interface (IBM productive)
    expressive: atom.text_medium;          // Règles pour marketing (IBM expressive)
  };
  languageSupport: atom.text_short[];     // Langues supportées
}
```

### Sous-composite #6 — Recommandation Logo

```typescript
interface LogoTypeRecommendation {          // GLORY: logo-type-advisor
  recommendation: "wordmark" | "symbol" | "combination" | "emblem" | "lettermark" | "abstract";
  decisionMatrix: Array<{
    factor: atom.text_short;               // 8 facteurs (nom, marché, budget, média, modèle, héritage, scope, secteur)
    assessment: atom.text_medium;
    implication: atom.text_short;
  }>;
  briefDesigner: atom.text_long;           // Brief complet pour le designer
  constraints: atom.text_medium[];         // Contraintes techniques (responsive, monochrome, etc.)
}
```

### Sous-composite #7 — Validation Logo

```typescript
interface LogoValidation {                  // GLORY: logo-validation-protocol
  scalability: {
    favicon16: atom.boolean;
    appIcon: atom.boolean;
    businessCard: atom.boolean;
    billboard: atom.boolean;
    score: atom.score_100;
  };
  monochromeTest: atom.boolean;
  associationsTest: atom.text_medium;      // Associations implicites détectées
  metrics5D: {                             // Framework 5 dimensions
    memorability: atom.score_100;
    distinctiveness: atom.score_100;
    relevance: atom.score_100;
    versatility: atom.score_100;
    timelessness: atom.score_100;
  };
  responsiveTiers: Array<{
    tier: 1 | 2 | 3 | 4;                  // Full → Compact → Icon → Favicon
    description: atom.text_short;
    minWidth: atom.number;                 // px
  }>;
}
```

### Sous-composite #8 — Design Tokens

```typescript
interface DesignTokens {                    // GLORY: design-token-architect
  architecture: "3-tier";                  // Salesforce 3-tier (global → alias → component)
  globalTokens: Array<{
    name: atom.text_short;                 // Ex: "color.primary.500"
    value: atom.text_short;                // Ex: "#10B981"
    type: "color" | "spacing" | "typography" | "shadow" | "border" | "motion";
  }>;
  aliasTokens: Array<{
    name: atom.text_short;                 // Ex: "color.brand.primary"
    ref: atom.text_short;                  // Ex: "$color.primary.500"
    context: atom.text_short;              // Ex: "CTA backgrounds"
  }>;
  exportFormats: Array<"JSON" | "YAML" | "CSS" | "Tailwind" | "Figma" | "iOS" | "Android">;
  platforms: atom.text_short[];            // Plateformes cibles
}
```

### Sous-composite #9 — Motion Identity

```typescript
interface MotionIdentity {                  // GLORY: motion-identity-designer
  principles: {
    productive: atom.text_medium;          // Mouvements UI (transitions, micro-interactions)
    expressive: atom.text_medium;          // Mouvements marketing (animations logo, intro vidéo)
  };
  curves: Array<{
    name: atom.text_short;                 // Ex: "ease-brand-in"
    bezier: atom.text_short;               // Ex: "cubic-bezier(0.4, 0, 0.2, 1)"
    usage: atom.text_short;
  }>;
  durations: Array<{
    name: atom.text_short;                 // Ex: "micro", "normal", "dramatic"
    ms: atom.number;
    usage: atom.text_short;
  }>;
  exportFormats: Array<"Lottie" | "CSS" | "Framer" | "After Effects">;
  signature: atom.text_medium;             // Le mouvement signature de la marque (ex: "rotation 45° + fade-in progressif")
}
```

### Sous-composite #10 — Brand Guidelines (document final)

```typescript
interface BrandGuidelines {                 // GLORY: brand-guidelines-generator
  sections: {                              // 13 sections classe Frontify/Brandpad
    brandStory: atom.text_long;            // 1. Histoire (de A)
    missionVisionValues: atom.text_long;   // 2. Mission/Vision/Valeurs (de A)
    positioning: atom.text_long;           // 3. Positionnement (de D)
    logos: atom.text_long;                 // 4. Logos et usage (de #6 + #7)
    colors: atom.text_long;               // 5. Couleurs (de #4)
    typography: atom.text_long;            // 6. Typographie (de #5)
    photography: atom.text_long;           // 7. Photographie et illustration (de #3 + LSI)
    iconography: atom.text_long;           // 8. Iconographie
    layout: atom.text_long;               // 9. Mise en page et grilles
    motion: atom.text_long;               // 10. Motion (de #9)
    voice: atom.text_long;                // 11. Voix et ton (de D.tonDeVoix)
    applications: atom.text_long;          // 12. Applications (déclinaisons par support)
    dosAndDonts: atom.text_long;           // 13. Do's and Don'ts
  };
  version: atom.text_short;
  lastUpdated: atom.date;
  exportFormats: Array<"PDF" | "HTML" | "Notion">;
}
```

### LSI intégré dans la DA

La matrice LSI (Layered Semantic Integration) est le **framework transversal** qui structure l'ensemble du pipeline BRAND. Chaque concept abstrait de la marque (valeurs, archétype, promesse, ennemi) est distribué sur 5 couches pour éviter le littéralisme :

```typescript
interface LSIMatrix {                       // Transversal à toute la DA
  concepts: atom.text_short[];             // 3-5 concepts abstraits à incarner (tirés de A.valeurs + A.archetype + D.positionnement + A.enemy)
  distribution: Array<{
    concept: atom.text_short;              // Le concept
    anatomy: atom.text_medium;             // Comment il se traduit en formes, proportions, structures
    outfit: atom.text_medium;              // Comment il se traduit en textiles, packaging, imprimés
    texture: atom.text_medium;             // Comment il se traduit en surfaces, patines, finitions
    accessories: atom.text_medium;         // Comment il se traduit en objets, icônes, signalétique
    attitude: atom.text_medium;            // Comment il se traduit en postures, compositions, dynamiques
  }>;
  sublimationRules: Array<{
    literal: atom.text_short;              // L'interprétation littérale à ÉVITER
    sublimated: atom.text_short;           // L'évocation à utiliser à la place
  }>;
  visualHierarchy: Array<{
    level: 1 | 2 | 3;                     // Ce qu'on voit en premier / second / dernier
    element: atom.text_short;
    role: atom.text_short;
  }>;
}
```

**La DA complète** du pilier D est donc :

```typescript
interface DirectionArtistique {             // Pilier D — composite de 10 sous-composites + LSI
  lsi: LSIMatrix;                          // Framework transversal
  semioticAnalysis: SemioticAnalysis;      // BRAND #1
  visualLandscape: VisualLandscapeMap;     // BRAND #2
  moodboard: Moodboard;                   // BRAND #3
  chromaticSystem: ChromaticSystem;        // BRAND #4
  typographySystem: TypographySystem;      // BRAND #5
  logoRecommendation: LogoTypeRecommendation; // BRAND #6
  logoValidation: LogoValidation;          // BRAND #7
  designTokens: DesignTokens;             // BRAND #8
  motionIdentity: MotionIdentity;         // BRAND #9
  guidelines: BrandGuidelines;            // BRAND #10
}
```

**Validation** : chaque sous-composite est "complet" quand l'outil GLORY correspondant a été exécuté et son output validé. La séquence de dépendances est vérifiée — on ne peut pas avoir un `TypographySystem` sans `ChromaticSystem`. Le `LSIMatrix` doit être rempli avant ou pendant le moodboard (#3) car il structure toute la production visuelle qui suit.

---

# NIVEAU 3 — COLLECTIONS

Ensembles ordonnés de composites N2. Chaque collection a des règles de cardinalité et de couverture.

| Collection | Composite source | Min | Max | Règle de couverture | Pilier |
|---|---|---|---|---|---|
| Valeurs de marque | N2.01 BrandValue | 3 | 7 | Rangs uniques, tensions cohérentes | A |
| Hero's Journey | N2.02 HeroJourneyAct | 5 | 5 | 5 actes séquentiels, arc émotionnel | A |
| Hiérarchie communautaire | (voir Devotion Ladder mapping) | 4 | 8 | Correspond aux niveaux T.07 | A |
| Marques ennemies | N2.14 Enemy.enemyBrands | 1 | 10 | ≥1 avec howTheyFight non vide | A |
| Narratifs ennemis | N2.14 Enemy.enemyNarratives | 1 | 10 | ≥1 avec effectiveness ≥ medium | A |
| Personas | N2.04 Persona | 2 | 5 | ≥1 par tier du product ladder, priorités uniques | D |
| Pipeline DA | N2.15 DirectionArtistique (10 sous-composites) | 4 | 10 | Séquence respectée, min #1-#4 pour MVP | D |
| Catalogue produits | N2.05 ProduitService | 1 | 50 | Chaque persona a ≥1 produit | V |
| Packages | N2.06 Package | 0 | 20 | Chaque package référence des produits existants | V |
| Product Ladder | N2.07 ProductLadderTier | 2 | 5 | Tiers ordonnés par prix, couvrent ≥2 personas | V |
| Quadrants valeur/coût | ValeurCoutItem | 1/cat | 10/cat | 8 catégories, toutes représentées | V |
| Touchpoints | N2.08 Touchpoint | 5 | 15 | 3 types représentés, 5 étapes AARRR couvertes | E |
| Rituels | N2.09 Ritual | 3 | 10 | ≥1 always-on + ≥1 cyclique, ≥3 niveaux Ladder | E |
| Micro-SWOTs | MicroSwot (de R) | 5 | 26 | ≥1 par pilier A-D-V-E | R |
| Hypothèses | HypothesisValidation (de T) | 5 | 20 | ≥1 par pilier A-D-V-E | T |
| Concurrents | CompetitiveBenchmark (de T) | 3 | 10 | Inclut D.concurrents + ≥1 indirect | T |
| Campagnes annuelles | CampaignBrief (via I) | 6 | 24 | 4 trimestres couverts, ≥1 rituel cyclique | I |
| Actions marketing | N2.10 MarketingAction | 10 | 200 | 3 catégories ATL/BTL/TTL représentées | I/Campaign |
| Recommandations | StrategicRecommendation | 8 | 15 | ≥2 de R (mitigations) + ≥2 de T (marché) | S |
| Signaux actifs | N2.13 Signal | 0 | ∞ | Flux continu (pas de max) | R/T |

---

# NIVEAU 4 — COMPOSITES MAJEURS (un par pilier)

Le livrable principal de chaque pilier. C'est ce que le client reçoit.

| Pilier | Composite majeur | Équivalent agence Big Four | Composé de |
|---|---|---|---|
| **A** | **Manifeste de marque** | Brand Purpose Statement (McKinsey), Brand Belief System (Havas) | identite + herosJourney + ikigai + valeurs + hiérarchie + timeline + prophecy + **enemy (N2.14 — mouvement miroir concret avec marques, superfans adverses, stratégie de combat)** + doctrine + mythology |
| **D** | **Brand Book Direction Artistique** | Brand Identity System (Landor), Brand Guidelines (Publicis) | personas + paysageConcurrentiel + promesses + positionnement + tonDeVoix + **directionArtistique (N2.15 — pipeline BRAND 10 sous-composites séquencés : sémiotique → landscape → moodboard → chromatique → typographie → logo → validation → tokens → motion → guidelines + LSI matrix transversale)** + assetsLinguistiques + sacredObjects + proofPoints + symboles |
| **E** | **Playbook d'Engagement** | Customer Experience Blueprint (BCG), Community Playbook (Accenture) | touchpoints + rituels + principes + gamification + aarrr + kpis + sacredCalendar + commandments + ritesDePassage + sacraments |
| **V** | **Offre Commerciale Structurée** | Value Architecture (Bain), Pricing Strategy (McKinsey) | produitsCatalogue + packages + productLadder + 8 quadrants valeur/coût + unitEconomics + budget paramétrique |
| **R** | **Recommandations Stratégiques** | Risk Assessment (Deloitte), Strategic Audit (EY) | microSwots + globalSwot + riskScore + matrix + mitigations + summary |
| **T** | **Étude de Marché Validée** | Market Sizing & Validation (BCG), Brand Health Tracker (Kantar) | triangulation + hypothèses + marketReality + tamSamSom + benchmark + bmfScore + recommendations |
| **I** | **Plan de Campagnes** | Integrated Campaign Plan (WPP), Annual Marketing Plan (Havas) | roadmap + campagnes annuelles + budget + team + launchPlan + playbook + sections UPGRADERS (platform, copy strategy, big idea, activation, governance, workstreams, architecture, principles) |
| **S** | **Roadmap Annuelle** | Strategic Roadmap (McKinsey), Brand Master Plan (Publicis) | synthèse + vision + coherencePiliers + FCS + recommandations + axes + sprint90 + kpiDashboard |

**Validation N4** : chaque composite majeur est "complet" quand toutes ses collections N3 constituantes sont complètes selon leurs règles de couverture. Le score structural /25 mesure cette complétude.

---

# NIVEAU 5 — STRATÉGIE (profil ADVE-RTIS)

L'assemblage des 8 composites majeurs constitue la stratégie complète.

```
Stratégie = A(Manifeste) + D(BrandBook) + V(Offre) + E(Playbook) 
          + R(Audit) + T(Étude) + I(Plan) + S(Roadmap)
```

Le score /200 est la mesure de complétude et de qualité de cet assemblage.

**Équivalent marché** : une stratégie complète est l'équivalent d'un contrat one-shot avec McKinsey (positionnement + audit) + Havas (direction artistique + plan de campagnes) + BCG (étude de marché + value architecture) + Accenture (playbook opérationnel + customer experience). Sauf que c'est un système vivant, pas un PDF.

---

# NIVEAU 6 — MOUVEMENT

> Un mouvement est un déplacement de la marque sur la fenêtre d'Overton.

Le mouvement n'est pas un livrable — c'est le résultat cumulé de l'exécution de la stratégie via les campagnes.

```
Mouvement = Σ Campagnes exécutées × Impact mesuré (feedback loop)
```

Où chaque campagne est :

```
Campagne = Brief (N2.12) 
         → Actions (N2.10[]) 
         → Exécution (production + média + terrain)
         → Mesure (AARRR + signaux)
         → Recalibration (feedback loop → scores ADVE ajustés)
```

Le mouvement est mesuré par :

- **Δ Score /200** : progression du score composite dans le temps
- **Δ Devotion Ladder** : déplacement de la distribution d'audience vers les niveaux supérieurs
- **Δ Cult Index** : progression du score d'engagement cultuel
- **Δ Perception marché** : signaux externes captés par Tarsis

**Le rôle de Mestor au N6** : Mestor ne génère pas le mouvement — il le pilote. Chaque jour, Mestor agrège :
- Les signaux R (internes) et T (externes) actifs
- L'état des campagnes en cours
- Les métriques de la Devotion Ladder
- Le budget restant
- Les événements du calendrier sacré

Et recommande les ajustements : accélérer telle campagne, pivoter telle action, saisir telle opportunité, réagir à telle crise. C'est de l'aide à la décision stratégique en continu — pas de la génération de contenu.

---

# SCORING — Depuis l'ontologie

Le scoring /25 par pilier n'est plus basé sur des longueurs de texte. Il est basé sur la **complétude structurelle de la composition**.

**Principes** :

1. Chaque atome N1 correctement rempli (non vide, type valide, dans les contraintes) = 1 unité de complétude
2. Chaque composite N2 correctement assemblé (tous ses atomes valides + relations cross-ref vérifiées) = bonus de composition
3. Chaque collection N3 complète (cardinalité respectée + couverture respectée) = bonus de couverture
4. Le composite majeur N4 est "structurellement complet" quand toutes ses collections N3 sont complètes
5. Le quality modulator (AI) ne porte plus sur la "qualité du texte" mais sur la **cohérence inter-composites** et la **pertinence stratégique** des choix

**Formule révisée** :

```
score_pilier = (atomes_valides / atomes_requis × 15) 
             + (collections_complètes / collections_totales × 7) 
             + (cross_refs_valides / cross_refs_requises × 3)
             × quality_modulator (0.70-1.00)
```

Le quality modulator évalue :
- Pour A-D-V-E : cohérence narrative + spécificité + puissance (les composites racontent-ils la même histoire ?)
- Pour R-T : pertinence analytique (les conclusions sont-elles logiquement dérivées ?)
- Pour I-S : faisabilité + fidélité (le plan est-il exécutable et fidèle à la stratégie ?)

---

*Fin de l'Annexe H — Ontologie des Variables du Système ADVE-RTIS*
