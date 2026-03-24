# CAHIER DE CHARGES — LaFusée Industry OS

**Version** : 2.1 (standalone)
**Date** : 23 mars 2026
**Auteur** : Alexandre "Xtincell" Djengue Mbangue × Claude
**Base** : ADVERTIS Codebase (87 modèles Prisma, 43 routers tRPC, 65+ services, 4 serveurs MCP)
**Statut** : Document de référence pour le build

### Annexes techniques (spécifications détaillées)

Ce document est autonome mais référence 4 annexes pour les spécifications exhaustives des systèmes existants :

| Annexe | Contenu | Emplacement |
|--------|---------|-------------|
| **ANNEXE A** | Méthodologie ADVE-RTIS complète (8 piliers, schemas Zod, champs, scoring /200, cycle de génération) | `src/__docs__/ANNEXE-A-METHODOLOGIE-ADVE.md` |
| **ANNEXE B** | GLORY Tools complet (39 outils, 4 layers, inputs/outputs, dépendances, pipeline BRAND) | `src/__docs__/ANNEXE-B-GLORY-TOOLS.md` |
| **ANNEXE C** | Campaign Manager 360 (19 sous-routers, 92 procédures, 12 états, 100+ types d'actions, AARRR unifié) | `src/__docs__/ANNEXE-C-CAMPAIGN-MANAGER-360.md` |
| **ANNEXE D** | Systèmes existants (ARTEMIS 24 frameworks, Mestor AI, Serenite finance, Tarsis intel, Brand OS, Guilde, Club, Events, Boutique, Editorial, RADAR, PR, Social, Media Buying) | `src/__docs__/ANNEXE-D-SYSTEMES-EXISTANTS.md` |
| **ANNEXE E** | Audit de complétude — vérification de couverture de toutes les features existantes, gaps identifiés et intégrés dans ce cahier | `src/__docs__/ANNEXE-E-AUDIT-COMPLETUDE.md` |

Un développeur lisant ce document + les 5 annexes a **toute l'information nécessaire** pour construire LaFusée sans accès au code existant.

---

## 1. CONTEXTE ET VISION

### 1.1 Le problème fondamental

Aucune structure de classe mondiale ne sert correctement le marché créatif en Afrique francophone.

Les groupes internationaux (Havas, Publicis, WPP) maintiennent des bureaux à Abidjan, Douala, Dakar — des boîtes aux lettres. Leurs méthodologies (Meaningful Brands, BrandZ) restent à Paris ou Londres. Les équipes locales exécutent sans framework. Le client africain reçoit un service de tier 3 au prix du tier 1.

Les agences locales n'ont pas de méthode propriétaire. Elles ont du talent, de l'intuition, de la débrouillardise. Mais rien de codifié, rien de reproductible, rien de mesurable. Chaque projet est un artisanat. C'est ce qui empêche le marché de scaler, de professionnaliser, de facturer à sa vraie valeur.

Le freelance créatif reçoit des briefs vagues, est payé au lance-pierres, n'a aucune visibilité sur sa prochaine mission, et n'a aucun pouvoir de négociation.

Le DA dans une agence sous-dimensionnée porte la vision créative de 8 clients en même temps sans méthode formalisée, sans outil pour mesurer si un livrable est "on-brand", sans moyen de transférer son savoir à un junior.

Le chef de marque jongle entre prestataires qui ne se parlent pas, reçoit des livrables incohérents, et ne peut pas prouver la valeur de son budget com auprès de sa direction.

### 1.2 UPgraders — l'écosystème

UPgraders est un écosystème à 5 divisions qui forme un flywheel :

```
L'ORACLE (stratégie) → LE SIGNAL (intelligence) → L'ARÈNE (communauté)
       ↑                                                    ↓
L'ACADÉMIE (transmission) ←←←← LA FUSÉE (ingénierie) ←←←←←←
```

| Division | Métier | Offres clés | Motto |
|----------|--------|-------------|-------|
| **L'Oracle** | Architecture et stratégie de marque | IMPULSION™, Retainer Stratégique | "Voir ce que les autres ne voient pas" |
| **Le Signal** | Intelligence marché et production éditoriale | RADAR™, The Upgrade™ | "Rendre visible ce que personne ne mesure" |
| **L'Arène** | Communauté et événements | Upgraded Brands Club™, Upgrade Summit™, La Guilde™ | "Créer l'appartenance" |
| **La Fusée** | Technologie, outils, infrastructure opérationnelle | ADVERTIS (SaaS), BOOST™, SOCLE™ | "Construire le moteur" |
| **L'Académie** | Transmission, formation, certification | Certification ADVE™, Bootcamps, Playbooks | "Rendre chaque professionnel capable" |

**"De la Poussière à l'Étoile"** — chaque talent créatif, chaque marque, chaque projet peut atteindre l'excellence s'il a la structure pour.

### 1.3 L'ADVE — le protocole

L'ADVE est à UPgraders ce que le Meaningful Brands est à Havas : une méthode propriétaire. Sauf que le Meaningful Brands **mesure** si une marque compte. L'ADVE **prescrit** comment construire un culte de marque.

8 piliers. Chacun avec une question fondamentale :

| Pilier | Nom | Question | Focus |
|--------|-----|----------|-------|
| **A** | Authenticité | Qui êtes-vous vraiment ? | Identité, vision, mission, mythe fondateur |
| **D** | Distinction | Pourquoi vous et pas un autre ? | Positionnement, identité visuelle, voix, dialectes uniques |
| **V** | Valeur | Que promettez-vous au monde ? | Promesse divine, produits (sacrements), expérience multisensorielle |
| **E** | Engagement | Comment créer la dévotion ? | Devotion Ladder, temples, rituels, clergé, pèlerinages, évangélisation |
| **R** | Risk | Quels sont vos angles morts ? | SWOT, cartographie des risques, mitigation, plan de crise |
| **T** | Track | Comment mesurez-vous le succès ? | Validation marché, KPIs, scoring Cult Index |
| **I** | Implementation | De la stratégie à l'action ? | Roadmap 36 mois, budget, structure équipe, campagnes |
| **S** | Stratégie | Comment assembler le tout ? | Synthèse exécutive, bible de marque, playbooks, guidelines |

**En entrée** : n'importe quel objet (marque, brief, créatif, livrable, signal, campagne). L'ADVE le décompose en 8 dimensions. Score /25 par pilier. Composite /200. Confidence 0-1.

**En sortie** : un diagnostic + une prescription pour construire un mouvement de marque. Pas un audit statique — un protocole vivant.

**Échelle de scoring** :
- **0-80** : Zombie (invisible, pas d'identité distincte)
- **81-120** : Ordinaire (fonctionnel mais interchangeable)
- **121-160** : Forte (reconnue et respectée)
- **161-180** : Culte (adorée, inspire la dévotion)
- **181-200** : Icône (légendaire, référence mondiale)

### 1.4 LaFusée — l'Industry OS

LaFusée n'est pas un outil de gestion d'agence. C'est **l'infrastructure méthodologique qui manque à une industrie entière**.

LaFusée est l'encodage numérique des 5 divisions d'UPgraders dans un système où l'ADVE est le protocole pervasif. Le Brand OS est le produit vendu. L'Agency OS est l'infrastructure invisible. L'ADVE est la loi.

Ce que ça permet :
- Un freelance à Douala livre au même standard qu'un studio à Paris — parce que le protocole guide chaque décision
- Une agence locale à Abidjan facture du premium — parce qu'elle a une méthode prouvée et mesurable
- Un chef de marque à Libreville justifie son budget — parce qu'il a un score /200 et une Devotion Ladder
- Un DG mesure sa marque pour la première fois — parce que le Quick Intake lui donne un diagnostic en 15 minutes

L'ambition : devenir **l'infrastructure méthodologique du marché créatif africain**. Et le Knowledge Graph cross-clients est ce qui rend ça irréversible.

### 1.5 Principes architecturaux

1. **L'ADVE est un protocole, pas un module.** Chaque objet transactionnel porte un vecteur ADVERTIS. Le protocole est pervasif.
2. **Refactor over rewrite.** La stack actuelle (Next.js 16, tRPC v11, Prisma 87 modèles, 4 MCP servers, 43 routers) est solide. On rewire, on ne réécrit pas.
3. **Additif d'abord.** Les nouveaux champs sont optionnels (`Json?` nullable). Le système existant continue de fonctionner pendant la migration.
4. **Les portals sont des vues, pas des apps.** Les 3 portals (Client, Creator, Fixer) sont des vues filtrées sur le même backend. Pas de code dupliqué.
5. **Les 5 divisions structurent l'expérience.** Chaque feature appartient à une division. La Fixer Console les expose toutes. Les portals Client et Creator n'en montrent que les facettes pertinentes.
6. **Le Knowledge Graph est capturé dès le jour 1.** La capture est immédiate, l'intelligence est progressive.
7. **Multi-opérateur ready.** UPgraders est le premier opérateur. Le modèle de données prépare l'arrivée d'opérateurs licenciés (agences certifiées ADVE) sans le construire en V1.

### 1.6 Les 7 populations servies

| Acteur | Douleur | Ce que LaFusée résout | Portal |
|--------|---------|----------------------|--------|
| **Le Fixer** (Alexandre/ADMIN) | Impossible de scaler sa méthode au-delà de sa présence physique | God mode sur l'écosystème. Le système porte la méthode à sa place | Fixer Console |
| **Le propriétaire de marque** (DG/CEO) | Ne peut pas mesurer la force de sa marque ni justifier le budget | Score /200, Cult Index, Devotion Ladder, Value Reports | Client Portal (EXECUTIVE) |
| **Le responsable de marque** (Brand Manager) | Jongle entre prestataires incohérents, pas de métriques | Brand OS vivant, guidelines, briefs qualifiés, suivi par pilier | Client Portal (MARKETING) |
| **Le freelance créatif** | Briefs vagues, pricing au rabais, pas de progression | Guilde avec tiers, briefs qualifiés, tarifs structurés, apprentissage ADVE | Creator Portal |
| **L'agence opérationnelle/de production** | Sous-traitance à l'aveugle, marges compressées | Guild Organization, briefs qualifiés, pipeline stable | Creator Portal (org) |
| **L'agence conseil de grade inférieur** | Pas de méthode reproductible, dépend du talent des fondateurs | Licence ADVE, outils clé-en-main, qualité standardisée par le protocole | Fixer Console (light) |
| **Le réseau d'Alexandre** (DG, CMO, directeurs) | Pas de mesure objective de leur marque | Quick Intake partageable → diagnostic en 15 min → funnel vers le Brand OS | Quick Intake (public) |

---

## 2. DATA MODEL

### 2.1 Type fondamental : AdvertisVector

Nouveau type pervasif, attachable à tout objet transactionnel du système.

```typescript
// src/lib/types/advertis-vector.ts
import { z } from "zod";

export const AdvertisVectorSchema = z.object({
  a: z.number().min(0).max(25),  // Authenticité
  d: z.number().min(0).max(25),  // Distinction
  v: z.number().min(0).max(25),  // Valeur
  e: z.number().min(0).max(25),  // Engagement
  r: z.number().min(0).max(25),  // Risk
  t: z.number().min(0).max(25),  // Track
  i: z.number().min(0).max(25),  // Implementation
  s: z.number().min(0).max(25),  // Stratégie
  composite: z.number().min(0).max(200),  // Somme des 8 piliers
  confidence: z.number().min(0).max(1),   // Fiabilité du scoring
});

export type AdvertisVector = z.infer<typeof AdvertisVectorSchema>;

// Classification automatique
export function classifyBrand(composite: number): "ZOMBIE" | "ORDINAIRE" | "FORTE" | "CULTE" | "ICONE" {
  if (composite <= 80) return "ZOMBIE";
  if (composite <= 120) return "ORDINAIRE";
  if (composite <= 160) return "FORTE";
  if (composite <= 180) return "CULTE";
  return "ICONE";
}
```

**Modèles existants à enrichir** (ajout champ `advertis_vector Json?`) :

| Modèle | Raison |
|--------|--------|
| `Strategy` | Profil ADVERTIS vivant du client (Brand Instance) |
| `Campaign` | Objectif ADVERTIS cible de la campagne |
| `Mission` | Vecteur hérité de la campagne/strategy parente |
| `TalentProfile` | Forces ADVERTIS du créatif |
| `Signal` | Impact ADVERTIS du signal détecté |
| `GloryOutput` | Piliers renforcés par le livrable créatif |
| `BrandAsset` | Piliers que cet asset sert |

### 2.2 Nouveaux modèles Prisma

#### 2.2.1 Operator (multi-opérateur ready)

```prisma
model Operator {
  id            String   @id @default(cuid())
  name          String   // "UPgraders SARL", "Agence XYZ"
  slug          String   @unique // "upgraders", "agence-xyz"
  status        OperatorStatus @default(ACTIVE) // ACTIVE, SUSPENDED, CHURNED

  // Licence ADVE
  licenseType   LicenseType @default(OWNER) // OWNER (UPgraders), LICENSED, TRIAL
  licensedAt    DateTime?
  licenseExpiry DateTime?

  // Configuration
  branding      Json?    // Logo, couleurs, custom domain
  maxBrands     Int      @default(50)  // Limite de Brand Instances
  commissionRate Float   @default(0.10) // % reversé à UPgraders sur chaque transaction

  // Relations
  users         User[]
  strategies    Strategy[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Note** : en V1, seul l'Operator "UPgraders" existe (`licenseType: OWNER`). Le modèle prépare le multi-tenant sans le construire.

**Modification sur `User`** : ajout `operatorId String?` + relation `Operator`.
**Modification sur `Strategy`** : ajout `operatorId String?` + relation `Operator`.

#### 2.2.2 Driver (S2 — Machine de traduction stratégie → canal)

```prisma
model Driver {
  id            String   @id @default(cuid())
  strategyId    String
  strategy      Strategy @relation(fields: [strategyId], references: [id])

  channel       DriverChannel  // INSTAGRAM, FACEBOOK, TIKTOK, LINKEDIN, WEBSITE, PACKAGING, EVENT, PR, PRINT, VIDEO, RADIO, TV, OOH, CUSTOM
  channelType   DriverType     // DIGITAL, PHYSICAL, EXPERIENTIAL, MEDIA
  name          String         // "Instagram CIMENCAM"
  status        DriverStatus   @default(ACTIVE) // ACTIVE, INACTIVE, ARCHIVED

  // Specs de production
  formatSpecs   Json           // Specs techniques par format (taille, ratio, durée, résolution)
  constraints   Json           // Contraintes (interdits visuels, tonalité, fréquence)
  briefTemplate Json           // Template de brief pré-rempli pour ce driver
  qcCriteria    Json           // Critères de QC spécifiques au canal

  // Vecteur ADVERTIS de priorité pour ce canal
  pillarPriority Json          // AdvertisVector — quels piliers sont prioritaires

  // Relations
  missions      Mission[]
  processes     Process[]
  gloryTools    DriverGloryTool[]

  deletedAt     DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([strategyId])
}

model DriverGloryTool {
  id        String @id @default(cuid())
  driverId  String
  driver    Driver @relation(fields: [driverId], references: [id])
  gloryTool String // Identifiant du GLORY tool lié (slug)

  @@index([driverId])
}
```

#### 2.2.3 GuildOrganization (agences de prod dans la Guilde)

```prisma
model GuildOrganization {
  id              String   @id @default(cuid())
  name            String   // "Studio Bantoo", "Motion19"
  description     String?
  logoUrl         String?
  website         String?

  tier            GuildTier @default(APPRENTI)
  advertis_vector Json?    // Forces ADVERTIS collectives

  // Métriques agrégées
  totalMissions   Int      @default(0)
  firstPassRate   Float    @default(0)
  avgQcScore      Float    @default(0)

  // Spécialités
  specializations Json?    // [{channel: "VIDEO", level: "EXPERT"}, ...]

  // Relations
  members         TalentProfile[]

  deletedAt       DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Modification sur `TalentProfile`** : ajout `guildOrganizationId String?` + relation.

#### 2.2.4 QualityReview (QC distribué)

```prisma
model QualityReview {
  id              String   @id @default(cuid())
  deliverableId   String
  deliverable     MissionDeliverable @relation(fields: [deliverableId], references: [id])
  reviewerId      String
  reviewer        User     @relation(fields: [reviewerId], references: [id])

  // Verdict structuré par pilier
  verdict         ReviewVerdict  // ACCEPTED, MINOR_REVISION, MAJOR_REVISION, REJECTED, ESCALATED
  pillarScores    Json           // { a: {score, comment}, d: {score, comment}, ... } — piliers pertinents uniquement
  overallScore    Float          // Score global 0-10
  feedback        String         // Feedback général

  // Méta
  reviewType      ReviewType     // AUTOMATED, PEER, FIXER, CLIENT
  reviewDuration  Int?           // Durée en minutes (pour compensation)

  createdAt       DateTime @default(now())

  @@index([deliverableId])
  @@index([reviewerId])
}
```

#### 2.2.5 Enrichissement TalentProfile (Guilde avec tiers)

```prisma
// Champs à ajouter sur TalentProfile existant
model TalentProfile {
  // ... champs existants conservés ...

  tier              GuildTier @default(APPRENTI) // APPRENTI, COMPAGNON, MAITRE, ASSOCIE
  advertis_vector   Json?     // Forces ADVERTIS du créatif

  // Métriques de performance (enrichissement des existants totalMissions, avgScore)
  firstPassRate     Float     @default(0)  // Taux d'acceptation premier jet
  collabMissions    Int       @default(0)  // Missions collaboratives validées
  peerReviews       Int       @default(0)  // QC peer effectués

  // Spécialités par driver
  driverSpecialties Json?     // [{channel: "INSTAGRAM", level: "EXPERT"}, ...]

  // Guild Organization
  guildOrganizationId String?
  guildOrganization   GuildOrganization? @relation(fields: [guildOrganizationId], references: [id])

  // Relations nouvelles
  qualityReviews    QualityReview[]  // Reviews effectuées
  portfolioItems    PortfolioItem[]
  memberships       Membership[]
  commissions       Commission[]
}
```

#### 2.2.6 PortfolioItem

```prisma
model PortfolioItem {
  id              String @id @default(cuid())
  talentProfileId String
  talentProfile   TalentProfile @relation(fields: [talentProfileId], references: [id])
  deliverableId   String?
  title           String
  description     String?
  pillarTags      Json?    // Piliers ADVERTIS que cet item illustre
  fileUrl         String?
  thumbnailUrl    String?

  createdAt       DateTime @default(now())

  @@index([talentProfileId])
}
```

#### 2.2.7 Process (Scheduler)

```prisma
model Process {
  id            String   @id @default(cuid())
  strategyId    String?
  strategy      Strategy? @relation(fields: [strategyId], references: [id])

  type          ProcessType    // DAEMON, TRIGGERED, BATCH
  name          String
  description   String?
  status        ProcessStatus  // RUNNING, PAUSED, STOPPED, COMPLETED

  // Scheduling
  frequency     String?        // Cron expression pour DAEMON/BATCH
  triggerSignal String?        // Type de signal qui déclenche un TRIGGERED
  priority      Int @default(5) // 1 (critique) à 10 (faible)

  // Assignation
  driverId      String?
  driver        Driver?  @relation(fields: [driverId], references: [id])
  assigneeId    String?

  // Playbook (pour TRIGGERED)
  playbook      Json?    // Actions séquencées avec piliers ADVERTIS prioritaires

  // Tracking
  lastRunAt     DateTime?
  nextRunAt     DateTime?
  runCount      Int      @default(0)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([strategyId])
  @@index([status])
}
```

#### 2.2.8 Commission (Value Capture)

```prisma
// Le modèle Commission EXISTE DÉJÀ dans le schema (missionId, talentId, grossAmount, commissionRate, etc.)
// Enrichissement :
model Commission {
  // ... champs existants conservés (missionId, talentId, grossAmount, commissionRate, commissionAmount, netAmount, currency, status, paidAt) ...

  // Nouveaux champs
  tierAtTime    GuildTier?       // Tier du créatif au moment de la commission
  operatorFee   Float?           // Part reversée à l'opérateur (si licencié)
  invoiceId     String?
  invoice       Invoice? @relation(fields: [invoiceId], references: [id])
}

model Membership {
  id              String   @id @default(cuid())
  talentProfileId String
  talentProfile   TalentProfile @relation(fields: [talentProfileId], references: [id])

  tier            GuildTier
  amount          Float          // Montant mensuel
  currency        String @default("XAF")
  status          MembershipStatus // ACTIVE, OVERDUE, CANCELLED, EXEMPT

  currentPeriodStart DateTime
  currentPeriodEnd   DateTime

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([talentProfileId])
}
```

#### 2.2.9 DevotionSnapshot

```prisma
model DevotionSnapshot {
  id            String   @id @default(cuid())
  strategyId    String
  strategy      Strategy @relation(fields: [strategyId], references: [id])

  // Distribution en % (somme = 100)
  spectateur    Float @default(0)
  interesse     Float @default(0)
  participant   Float @default(0)
  engage        Float @default(0)
  ambassadeur   Float @default(0)
  evangeliste   Float @default(0)

  // Score synthétique (0-100)
  devotionScore Float

  // Source
  trigger       String @default("manual") // manual, scheduled, signal, campaign_end

  measuredAt    DateTime @default(now())

  @@index([strategyId])
  @@index([measuredAt])
}
```

#### 2.2.10 KnowledgeEntry (Knowledge Graph)

```prisma
model KnowledgeEntry {
  id            String   @id @default(cuid())

  entryType     KnowledgeType // DIAGNOSTIC_RESULT, MISSION_OUTCOME, BRIEF_PATTERN, CREATOR_PATTERN, SECTOR_BENCHMARK, CAMPAIGN_TEMPLATE

  // Contexte
  sector        String?       // FMCG, BANQUE, STARTUP, TECH...
  market        String?       // CM, CI, GA, SN...
  channel       String?       // DriverChannel value
  pillarFocus   String?       // Pilier dominant (A, D, V, E, R, T, I, S)

  // Données
  data          Json          // Contenu structuré variable selon le type

  // Métriques
  successScore  Float?        // Indicateur de succès (0-1)
  sampleSize    Int @default(1)

  // Traçabilité (anonymisé — pas de lien direct vers Strategy)
  sourceHash    String?       // Hash anonymisé de la source

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([entryType])
  @@index([sector])
  @@index([market])
}
```

#### 2.2.11 DeliverableTracking (Feedback Loop)

```prisma
model DeliverableTracking {
  id              String   @id @default(cuid())
  deliverableId   String   @unique
  deliverable     MissionDeliverable @relation(fields: [deliverableId], references: [id])

  // Signaux attendus (configurés par le Driver)
  expectedSignals Json     // [{type: "engagement", target: 500}, {type: "impressions", target: 10000}]

  // Signaux reçus
  receivedSignals Json     @default("[]")

  // Impact mesuré sur les piliers
  pillarImpact    Json?    // AdvertisVector delta (avant/après)

  status          TrackingStatus // AWAITING_SIGNALS, PARTIAL, COMPLETE, EXPIRED
  expiresAt       DateTime

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

#### 2.2.12 QuickIntake (porte d'entrée du funnel)

```prisma
model QuickIntake {
  id            String   @id @default(cuid())

  // Identité (pas de compte requis)
  contactName   String
  contactEmail  String
  contactPhone  String?
  companyName   String
  sector        String?
  country       String?

  // Données collectées (15 min AI-guided)
  responses     Json     // Réponses structurées aux questions ADVE

  // Résultat
  advertis_vector Json?  // Score produit par le Quick Intake
  classification  String? // ZOMBIE, ORDINAIRE, FORTE, CULTE, ICONE
  diagnostic      Json?   // Diagnostic synthétique (forces, faiblesses, recommandations)

  // Conversion
  shareToken    String   @unique @default(cuid()) // Token pour lien partageable
  status        QuickIntakeStatus @default(IN_PROGRESS) // IN_PROGRESS, COMPLETED, CONVERTED, EXPIRED
  convertedToId String?  // strategyId si converti en Brand Instance

  // Tracking
  source        String?  // "direct_link", "referral_alexandre", "summit_2026", etc.
  completedAt   DateTime?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([shareToken])
  @@index([contactEmail])
  @@index([status])
}
```

### 2.3 Nouveaux Enums

```prisma
enum OperatorStatus {
  ACTIVE
  SUSPENDED
  CHURNED
}

enum LicenseType {
  OWNER      // UPgraders
  LICENSED   // Agence certifiée ADVE
  TRIAL      // Période d'essai
}

enum GuildTier {
  APPRENTI
  COMPAGNON
  MAITRE
  ASSOCIE
}

enum DriverChannel {
  INSTAGRAM
  FACEBOOK
  TIKTOK
  LINKEDIN
  WEBSITE
  PACKAGING
  EVENT
  PR
  PRINT
  VIDEO
  RADIO
  TV
  OOH
  CUSTOM
}

enum DriverType {
  DIGITAL
  PHYSICAL
  EXPERIENTIAL
  MEDIA
}

enum DriverStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}

enum ProcessType {
  DAEMON
  TRIGGERED
  BATCH
}

enum ProcessStatus {
  RUNNING
  PAUSED
  STOPPED
  COMPLETED
}

enum ReviewVerdict {
  ACCEPTED
  MINOR_REVISION
  MAJOR_REVISION
  REJECTED
  ESCALATED
}

enum ReviewType {
  AUTOMATED
  PEER
  FIXER
  CLIENT
}

enum MissionMode {
  DISPATCH
  COLLABORATIF
}

enum MembershipStatus {
  ACTIVE
  OVERDUE
  CANCELLED
  EXEMPT
}

enum KnowledgeType {
  DIAGNOSTIC_RESULT
  MISSION_OUTCOME
  BRIEF_PATTERN
  CREATOR_PATTERN
  SECTOR_BENCHMARK
  CAMPAIGN_TEMPLATE
}

enum TrackingStatus {
  AWAITING_SIGNALS
  PARTIAL
  COMPLETE
  EXPIRED
}

enum QuickIntakeStatus {
  IN_PROGRESS
  COMPLETED
  CONVERTED
  EXPIRED
}
```

### 2.4 Modifications sur modèles existants

| Modèle existant | Champs à ajouter | Raison |
|---|---|---|
| `User` | `operatorId String?` | Lien vers l'opérateur |
| `Strategy` | `operatorId String?`, `advertis_vector Json?`, phase `QUICK_INTAKE` | Multi-opérateur + scoring ADVE + porte tactique |
| `Campaign` | `advertis_vector Json?`, `devotionObjective Json?` | Objectifs ADVE composites |
| `Mission` | `advertis_vector Json?`, `mode MissionMode?`, `driverId String?` | Mode dispatch/collaboratif + lien Driver |
| `TalentProfile` | `tier GuildTier`, `advertis_vector Json?`, `driverSpecialties Json?`, `guildOrganizationId String?`, métriques perf | Guilde complète |
| `Signal` | `advertis_vector Json?` | Impact ADVE du signal |
| `GloryOutput` | `advertis_vector Json?` | Piliers renforcés par le livrable |
| `BrandAsset` | `pillarTags Json?` | Tagging ADVE des assets |
| `Pillar` (existant, renommé PillarContent dans le contexte) | `confidence Float?` | Fiabilité du contenu |
| `Commission` (existant) | `tierAtTime GuildTier?`, `operatorFee Float?`, `invoiceId String?` | Enrichissement value capture |

### 2.5 Estimation du modèle cible

| Dimension | Actuel | Ajouté | Cible |
|-----------|--------|--------|-------|
| Modèles Prisma | 87 | +12 (Operator, Driver, DriverGloryTool, GuildOrganization, QualityReview, PortfolioItem, Process, Membership, DevotionSnapshot, KnowledgeEntry, DeliverableTracking, QuickIntake) | **~99** |
| Modèles modifiés | — | 10 | — |
| Enums ajoutés | — | 15 | — |

---

## 3. API SURFACE

### 3.1 Nouveaux routers tRPC

| Router | Procedures | Division | Système |
|--------|------------|----------|---------|
| `operator` | getOwn, list, update, getStats | Transversal | Multi-opérateur |
| `driver` | create, update, delete, list, getByStrategy, activate, deactivate, generateSpecs, auditCoherence, translateBrief | La Fusée | S2 |
| `qualityReview` | submit, list, getByDeliverable, getByReviewer, assignReviewer, escalate | L'Arène | S6 |
| `guildTier` | getProfile, checkPromotion, promote, demote, listByTier, getProgressPath | L'Arène | S6 |
| `guildOrg` | create, update, list, getMembers, getMetrics, addMember, removeMember | L'Arène | S6 |
| `process` | create, update, delete, list, start, pause, stop, getSchedule, getContention | La Fusée | S7 |
| `commission` | calculate, list, getByMission, getByCreator, markPaid, generatePaymentOrder, getOperatorFees | La Fusée (SOCLE) | S8 |
| `membership` | create, renew, cancel, list, getByCreator, checkStatus | La Fusée (SOCLE) | S8 |
| `valueReport` | generate, list, getByStrategy, export | L'Oracle | S8 |
| `knowledgeGraph` | query, getBenchmarks, getFrameworkRanking, getCreatorPatterns, getBriefPatterns, ingest | Le Signal | S9 |
| `devotionLadder` | snapshot, list, getByStrategy, setObjective, compare | L'Oracle | S0 |
| `deliverableTracking` | create, addSignal, getByDeliverable, getImpact, expire | La Fusée | S2 |
| `quickIntake` | start, advance, complete, getByToken, convert, listAll | L'Oracle | S1 |
| `bootSequence` | start, advance, complete, getState | L'Oracle | S1 |
| `guidelines` | generate, get, export, shareLink | La Fusée | S2 |
| `matching` | suggest, override, getHistory, getBestForBrief | L'Arène | S5 |
| `upsell` | detect, list, dismiss | La Fusée (SOCLE) | S8 |
| `advertisScorer` | scoreObject, batchScore, getHistory, recalculate | Transversal | S0 |

**Total : 18 nouveaux routers, ~100 procedures.** Routers existants : 43. **Cible : 61 routers.**

### 3.2 Routers existants à modifier

| Router | Division | Modification |
|--------|----------|-------------|
| `strategy` | L'Oracle | Ajouter phase QUICK_INTAKE, intégrer advertis_vector, operatorId, lier aux Drivers |
| `campaign` | La Fusée (BOOST) | Ajouter advertis_vector cible, devotionObjective |
| `mission` | La Fusée (BOOST) | Ajouter mode (DISPATCH/COLLABORATIF), driverId, advertis_vector hérité |
| `guilde` | L'Arène | Restructurer autour des tiers, intégrer advertis_vector, GuildOrganization |
| `framework` | L'Oracle (ARTEMIS) | Taguer chaque framework par pilier(s), diagnostic différentiel |
| `glory` | La Fusée | Lier tools aux Drivers, hériter du contexte ADVE |
| `brandVault` | La Fusée | Tagging par pilier, niveaux d'assets, garbage collection |
| `analytics` | Le Signal | Enrichir avec dimension ADVE, alimenter Knowledge Graph |
| `cockpit` | Client Portal | Restructurer comme Brand OS orienté cult marketing |
| `signal` | Le Signal | Ajouter advertis_vector, connecter au feedback loop |
| `club` | L'Arène | Intégrer Upgraded Brands Club dans le flywheel |
| `event` | L'Arène | Intégrer Upgrade Summit et events dans le flywheel |
| `boutique` | L'Académie | Playbooks et templates comme canal de distribution ADVE |
| `sourceInsights` | Le Signal (RADAR) | Enrichir comme produit vendable séparément |
| `mestor` | Transversal | Contextualiser selon le portal d'invocation |
| `onboarding` | L'Oracle | Câbler au Boot Sequence et Quick Intake |
| `pr` | La Fusée (BOOST) | Ajouter advertis_vector sur PressRelease, lier aux Drivers PR, câbler clippings → feedback loop |
| `social` | La Fusée (BOOST) | Connecter SocialConnection aux Drivers sociaux, câbler SocialPost.metrics → Signal → feedback loop |
| `media-buying` | La Fusée (BOOST) | Câbler MediaPerformanceSync → CampaignAmplification (données réelles), alimenter Knowledge Graph |
| `messaging` | Transversal | Contextualiser conversations par Strategy/Mission, intégrer dans les 3 portals |
| `crm` | La Fusée (SOCLE) | Câbler Quick Intake → Deal, pipeline de conversion, revenue forecasting |
| `translation` | La Fusée | Intégrer aux Drivers multi-marchés, connecter au FW-15 Cultural Expansion |
| `attribution` | Le Signal | Alimenter Knowledge Graph avec patterns d'attribution par secteur/marché |
| `cohort` | Le Signal | Connecter aux DevotionSnapshot, alimenter Knowledge Graph |
| `market-study` | Le Signal | Résultats → Knowledge Graph, permettre déclenchement depuis Drivers |
| `market-pricing` | L'Arène | Alimenter matching-engine (référentiel tarifaire) + commission-engine |
| `intervention` | La Fusée (BOOST) | Permettre conversion InterventionRequest → Mission, placer dans portals |
| `ambassador` | L'Arène | Réconcilier AmbassadorProgram avec Devotion Ladder (ambassadeurs = segment 5) |
| `publication` | La Fusée (GLORY) | Clarifier cycle GloryOutput → QualityReview → Publication → BrandAsset |

### 3.3 Serveurs MCP

| Serveur | Tools | Resources | Division | Focus |
|---------|-------|-----------|----------|-------|
| **Intelligence** (existant) | 9 | 6 | L'Oracle + Le Signal | Scores, variables, frameworks, pillars, freshness |
| **Operations** (existant) | 12 | 5 | La Fusée (BOOST) | Campaigns, budgets, teams, briefs, approvals |
| **Creative** (existant) | 42 | 0 | La Fusée (GLORY) | 39 GLORY tools + audits |
| **Pulse** (existant) | 11 | 7 | Le Signal | Cult index, signals, social, community, superfans |
| **Guild** (nouveau) | ~10 | ~4 | L'Arène | Profils créatifs, tiers, matching, QC, performance |
| **SESHAT** (nouveau) | ~8 | ~3 | L'Académie + Le Signal | Références, enrichissement brief, scoring pertinence |

**MCP cible : 6 serveurs, ~92 tools.**

---

## 4. SERVICES À CONSTRUIRE

### 4.1 Services critiques (bloquants — sans eux rien ne fonctionne)

| Service | Emplacement | Division | Description |
|---------|-------------|----------|-------------|
| `advertis-scorer` | `server/services/advertis-scorer/` | Transversal | Calcule le vecteur ADVE de n'importe quel objet. AI-assisted (Mestor) pour les premiers scorings, raffiné par les données. Expose `scoreObject(type, id)` et `batchScore(type, ids)`. C'est la pièce maîtresse — si ce service est imprécis ou lent, tout le reste en souffre. |
| `driver-engine` | `server/services/driver-engine/` | La Fusée | Cycle de vie des Drivers. `generateSpecs(strategyId, channel)` produit specs via AI + Knowledge Graph. `translateBrief(driverId, missionContext)` produit brief qualifié. C'est le lien entre L'Oracle (stratégie) et La Fusée (exécution). |
| `matching-engine` | `server/services/matching-engine/` | L'Arène | Croise briefs et créatifs. Phase early : filtre binaire (compétences + dispo). Phase mature : scoring multi-facteurs (compétences, vecteur ADVE, performance historique, dispo, tarif). Retourne top 3 avec confidence. |
| `qc-router` | `server/services/qc-router/` | L'Arène | Détermine qui review quoi. Input : deliverable + soumetteur. Output : reviewer assigné + type de review. Règles : Apprenti → review par Compagnon+. Compagnon → review par Maître+. Criticité mission × tier soumetteur. |
| `feedback-loop` | `server/services/feedback-loop/` | Transversal | Câble le loop complet. Signal entrant → recalcul score pilier → si dérive > seuil → diagnostic ARTEMIS → prescription → alerte fixer. C'est le "système nerveux" de LaFusée. |
| `quick-intake-engine` | `server/services/quick-intake/` | L'Oracle | Expérience 15 min, AI-guided, sans compte. Questions adaptatives par pilier. Produit un AdvertisVector partiel + classification + diagnostic. Lien partageable. C'est l'outil de vente #1 et l'acte de positionnement ADVE sur le marché. |

### 4.2 Services importants (différenciants)

| Service | Division | Description |
|---------|----------|-------------|
| `boot-sequence` | L'Oracle | Onboarding client complet (60-90 min). Arbre de décision adaptatif. Invoque Mestor. Calibre les 8 piliers. Produit le Brand Diagnostic Report. |
| `commission-engine` | La Fusée (SOCLE) | Calcule commissions par mission selon tier + type de Driver. Génère ordres de paiement vers Serenite. Calcule le % opérateur (pour licenciés). |
| `value-report-generator` | L'Oracle | Rapport mensuel par client. Agrège : évolution piliers, Devotion Ladder, missions, QC, diagnostics, recommandations. Export PDF/HTML. Justifie le retainer. |
| `knowledge-aggregator` | Le Signal | Service batch périodique. Agrège AuditLog + ScoreSnapshot + missions + QC en KnowledgeEntry. Calcule benchmarks sectoriels, framework rankings, creator patterns. **La capture est passive dès P0, l'agrégation est P5.** |
| `guidelines-renderer` | La Fusée | Agrège profil ADVE (8 piliers + BrandProfile + variables + assets clés) en document structuré. Invoque GLORY tools par section. Export HTML/PDF. |
| `diagnostic-engine` | L'Oracle (ARTEMIS) | Extension d'ARTEMIS. Sélection auto des frameworks pertinents selon le symptôme. Exécution en batterie. Rapport structuré avec localisation du problème (profil/driver/créatif/marché). |
| `upsell-detector` | La Fusée (SOCLE) | Analyse Brand Instances : drivers manquants mais pertinents, piliers sous-exploités, conversions quick_intake → full. Alertes Fixer Console. |
| `tier-evaluator` | L'Arène | Évalue périodiquement les créatifs contre critères de promotion/rétrogradation. Produit recommandations pour le fixer. |

### 4.3 Services de support

| Service | Division | Description |
|---------|----------|-------------|
| `process-scheduler` | La Fusée | Gère daemons, triggered, batch. Cron-like pour récurrence. Alertes sur arrêt. Contention management. |
| `team-allocator` | La Fusée (BOOST) | Vue consolidée charge par personne/créatif. Détection goulots. Recommandations staffing. |
| `seshat-bridge` | L'Académie | API client vers SESHAT (externe). Requête références, enrichissement brief, feedback pertinence. |
| `asset-tagger` | La Fusée | Tagging ADVE automatique sur assets (via Mestor). Pilier(s) renforcés, driver source, score conformité. |
| `knowledge-capture` | Le Signal | Service léger qui écrit un KnowledgeEntry à chaque événement significatif (scoring, mission close, QC, etc.). Passif. Tourne dès P0. |

### 4.4 Services existants à enrichir

| Service existant | Division | Enrichissement |
|-----------------|----------|----------------|
| `feedback-processor` | Le Signal | Connecter au feedback-loop, écrire des KnowledgeEntry |
| `cult-index-engine` | L'Oracle | Connecter aux DevotionSnapshot, alimenter le scoring /200 |
| `campaign-plan-generator` | La Fusée (BOOST) | Intégrer AdvertisVector cible dans la génération |
| `campaign-budget-engine` | La Fusée (SOCLE) | Intégrer commissions et operator fees |
| `talent-engine` | L'Arène | Intégrer tier, GuildOrganization, matching-engine |
| `ecosystem-engine` | Le Signal | Alimenter Knowledge Graph |
| `financial-engine` | La Fusée (SOCLE) | Intégrer commissions, memberships, operator fees |

---

## 5. UI / UX

### 5.1 Architecture de navigation — 3 Portals, 5 Divisions

Les 4 Surfaces actuelles (`mission-control`, `brand-pulse`, `studio`, `backstage`) sont **restructurées en 3 Portals** qui exposent les 5 Divisions d'UPgraders selon le rôle de l'utilisateur.

```
PORTALS
├── /cockpit (CLIENT PORTAL — Brand OS)
│   Le client voit son Brand OS.
│   Il ne voit jamais la Guilde, les autres clients, les mécaniques internes.
│
├── /creator (CREATOR PORTAL — Guild OS)
│   Le créatif gère ses missions et sa progression.
│   Sa visibilité stratégique dépend de son tier.
│
├── /console (FIXER CONSOLE — Ecosystem OS)
│   God mode. Les 5 divisions exposées.
│   L'orchestrateur voit tout.
│
└── /intake (QUICK INTAKE — public, sans auth)
    Diagnostic ADVE en 15 min.
    Porte d'entrée du funnel.
```

### 5.2 Quick Intake (/intake) — PUBLIC, SANS AUTH

**Audience** : n'importe qui avec un lien
**Principe** : 15 minutes, AI-guided, score /200, porte d'entrée du funnel.

| Étape | Contenu |
|-------|---------|
| `/intake` | Landing : "Mesurez la force de votre marque en 15 minutes" + CTA |
| `/intake/[token]` | Questionnaire adaptatif guidé par Mestor (questions par pilier, ton conversationnel) |
| `/intake/[token]/result` | Score /200, classification (Zombie → Icône), radar 8 piliers, diagnostic synthétique, CTA vers IMPULSION |

**Le Quick Intake est partageable par lien.** Alexandre envoie un lien personnalisé à un DG. Le DG fait son intake. Alexandre reçoit une notification. Le DG voit son score. Le funnel est enclenché.

### 5.3 Client Portal (/cockpit) — Brand OS

**Audience** : CLIENT_RETAINER, CLIENT_STATIC
**Principe** : le client ne voit que SA Brand Instance. La page d'accueil vend la transformation (cult marketing). L'opérationnel est un clic plus profond.

**Structure :**

```
/cockpit                    → CULT DASHBOARD (page d'accueil)
│  Cult Index + tendance
│  Devotion Ladder (visualisation héroïque)
│  Radar 8 piliers avec scores et alertes
│  Prescriptions actives
│
├── /cockpit/operate        → OPÉRATIONNEL
│   ├── missions            Missions en cours, livrables à valider
│   ├── campaigns           Campagnes actives (performance média réelle si connecté)
│   ├── briefs              Soumettre un nouveau brief
│   └── requests            Demandes d'intervention ponctuelles
│
├── /cockpit/brand          → IDENTITÉ DE MARQUE
│   ├── guidelines          Guidelines vivantes, interrogeables via Mestor, exportables
│   ├── assets              BrandVault filtré (recherche par pilier)
│   └── identity            Profil ADVE complet (8 piliers navigables)
│
├── /cockpit/insights       → INTELLIGENCE
│   ├── reports             Value Reports mensuels
│   ├── diagnostics         Diagnostics ARTEMIS résumés
│   ├── benchmarks          Benchmarks sectoriels (si dispo)
│   └── attribution         D'où viennent mes clients (multi-touch)
│
├── /cockpit/messages       → MESSAGERIE (communication avec le fixer/équipe)
│
└── /cockpit/mestor         → AI ASSISTANT (contextuel Brand OS)
```

**View modes** (conservés) :
- **EXECUTIVE** : Cult Index + Devotion Ladder + Value Report. Pas de détails opérationnels.
- **MARKETING** : Tout le détail. Missions, campagnes, piliers, guidelines.
- **FOUNDER** : Vision stratégique. Diagnostic, prescriptions, benchmarks.
- **MINIMAL** : Livrables à valider. Point.

### 5.4 Creator Portal (/creator) — Guild OS

**Audience** : FREELANCE (individuel ou membre d'une GuildOrganization)
**Principe** : le créatif voit ses missions, ses métriques, sa progression. Le niveau de détail stratégique dépend de son tier. L'apprentissage ADVE est intégré.

**Structure :**

```
/creator                    → DASHBOARD CRÉATIF
│  Missions dispo (filtrées profil/tier)
│  Missions actives
│  QC pipeline
│  Revenus du mois
│
├── /creator/missions       → MISSIONS
│   ├── available           Missions disponibles, accepter/décliner
│   ├── active              Missions actives, briefs complets, soumission livrables
│   └── collab              Mode collaboratif (enrichir brief, contributions trackées)
│
├── /creator/qc             → QUALITY CONTROL
│   ├── submitted           Livrables soumis, feedback reçu
│   └── peer                Missions de QC peer (Maîtres/Associés)
│
├── /creator/progress       → PROGRESSION
│   ├── metrics             Performance (first pass rate, QC score, etc.)
│   ├── path                Chemin de progression (critères par tier)
│   └── strengths           Forces/faiblesses par pilier ADVE
│
├── /creator/earnings       → REVENUS
│   ├── missions            Missions complétées, commissions
│   ├── qc                  Compensation QC peer
│   ├── invoices            Factures (Serenite côté freelance)
│   └── history             Historique complet
│
├── /creator/profile        → PROFIL
│   ├── skills              Compétences, tarifs, dispo
│   ├── portfolio           Portfolio (lié aux livrables validés)
│   └── drivers             Spécialités par Driver/canal
│
├── /creator/learn          → ACADÉMIE
│   ├── adve                Fondamentaux ADVE (déblocage progressif par tier)
│   ├── drivers             Guidelines par Driver (specs, do/don't)
│   ├── cases               Cas d'étude (missions passées anonymisées)
│   └── resources           Templates, playbooks, webinars
│
├── /creator/messages       → MESSAGERIE (communication avec le fixer + collaboration)
│
└── /creator/community      → COMMUNAUTÉ
    ├── guild               Annuaire Guilde (par tier, spécialité)
    └── events              Événements à venir (Summit, meetups)
```

**Visibilité par tier :**

| Élément | Apprenti | Compagnon | Maître | Associé |
|---------|----------|-----------|--------|---------|
| Brief technique | Oui | Oui | Oui | Oui |
| Références SESHAT | Oui | Oui | Oui | Oui |
| Pilier ADVE dominant | Non | Oui | Oui | Oui |
| Profil ADVE client | Non | Non | Oui | Oui |
| Mode collaboratif | Non | Partiel | Complet | Complet |
| QC peer | Non | Non | Oui | Oui |
| ADVE avancé (learn) | Non | Partiel | Complet | Complet |
| Fixer Console (lecture) | Non | Non | Non | Oui |

### 5.5 Fixer Console (/console) — Ecosystem OS

**Audience** : ADMIN (+ Associés en lecture)
**Principe** : god mode structuré par les 5 divisions d'UPgraders.

**Structure :**

```
/console                    → ECOSYSTEM DASHBOARD
│  Clients actifs + scores
│  Missions en vol
│  Guilde santé
│  Revenus
│  Alertes centralisées
│  Quick Intakes récents
│
├── /console/oracle         → L'ORACLE
│   ├── clients             Liste Brand Instances, drill-down (profil ADVE, drivers, score history)
│   ├── diagnostics         Diagnostics ARTEMIS en cours
│   ├── intake              Quick Intakes (pipeline de conversion)
│   └── boot                Boot Sequences en cours
│
├── /console/signal         → LE SIGNAL
│   ├── intelligence        RADAR™ (rapports, baromètres)
│   ├── tarsis              Veille concurrentielle (toutes les marques)
│   ├── signals             Signaux cross-clients
│   ├── knowledge           Knowledge Graph explorer (benchmarks, patterns, search)
│   ├── market-study        Études de marché multi-sources (6 adaptateurs)
│   └── attribution         Attribution + cohortes cross-clients
│
├── /console/arene          → L'ARÈNE
│   ├── guild               Créatifs par tier, métriques, promotions en attente
│   ├── orgs                Guild Organizations (agences de prod)
│   ├── matching            Matching en cours, overrides
│   ├── club                Upgraded Brands Club (membres, engagement)
│   └── events              Events (Summit, meetups, planning)
│
├── /console/fusee          → LA FUSÉE
│   ├── missions            Toutes les missions en vol, statuts, QC, SLA
│   ├── campaigns           Campagnes cross-clients
│   ├── drivers             Drivers actifs (tous clients)
│   ├── glory               GLORY tools usage stats
│   ├── scheduler           Processus actifs, calendrier, contention
│   ├── pr                  Relations presse cross-clients (communiqués, clippings)
│   ├── social              Connexions sociales, publications, métriques
│   ├── media               Plateformes publicitaires, performance, achat média
│   └── interventions       Demandes d'intervention en attente
│
├── /console/academie       → L'ACADÉMIE
│   ├── formations          Cours, bootcamps (existant via Course model)
│   ├── certifications      Certifications ADVE en cours
│   ├── boutique            Playbooks, templates, ventes
│   └── content             Contenu éditorial (The Upgrade™)
│
├── /console/socle          → SOCLE (FINANCE)
│   ├── revenue             Revenus consolidés : fees, commissions, retainers, memberships
│   ├── commissions         Commissions en attente
│   ├── value-reports       Value Reports générés
│   ├── contracts           Contrats (Serenite)
│   ├── invoices            Factures (Serenite)
│   ├── escrow              Escrow (Serenite)
│   └── pipeline            Pipeline commercial (Quick Intake → Deal → Brand Instance)
│
├── /console/ecosystem      → ÉCOSYSTÈME (future-proof)
│   ├── operators           Opérateurs licenciés (V1 : UPgraders only)
│   ├── metrics             Métriques écosystème (volume transactionnel, croissance)
│   └── scoring             Score /200 comme standard de marché (stats de diffusion)
│
├── /console/messages       → MESSAGERIE (communication centralisée tous acteurs)
│
└── /console/config         → CONFIGURATION
    ├── thresholds          Seuils (alerte ADVE, promotion guilde, commissions)
    ├── templates           Templates (briefs, guidelines, value reports)
    ├── integrations        Connexions tierces (Social, Media, webhooks)
    └── system              Paramètres globaux, MCP keys, pricing marché
```

### 5.6 Mestor — couche ambiante

Mestor n'est pas un portal. C'est un assistant AI contextuel accessible partout. Son comportement change selon le portal d'invocation :

| Portal | Contexte Mestor | Exemple de question |
|--------|----------------|---------------------|
| Client Portal | Brand OS du client. Ne révèle jamais les mécaniques internes. | "Pourquoi mon pilier Expression a baissé ?" |
| Creator Portal | Mission en cours + guidelines du Driver. Niveau de détail ADVE selon le tier. | "Qu'est-ce que le client attend sur ce brief ?" |
| Fixer Console | Tout l'écosystème. Peut comparer des clients, analyser des patterns cross. | "Quel créatif a le meilleur track record sur des briefs packaging FMCG ?" |
| Quick Intake | Guide conversationnel. Pose les questions ADVE de manière accessible. | (Mode guided interview, pas de question libre) |

---

## 6. SYSTÈMES EXISTANTS (résumé — détails en annexes)

Le codebase actuel implémente déjà un volume considérable de fonctionnalités. Cette section résume chaque système. Les spécifications exhaustives sont dans les annexes A-D.

### 6.1 Méthodologie ADVE-RTIS (→ ANNEXE A)

8 piliers séquentiels (A → D → V → E → R → T → I → S) avec schemas Zod complets. Chaque pilier a un contenu structuré spécifique (ex: Authenticité = identité + hero's journey + ikigai + valeurs + hiérarchie communautaire + timeline + extensions ARTEMIS cult marketing). Cycle de génération AI cascade : chaque pilier consomme les précédents. Pipeline orchestrator gère les side-effects post-génération (phase advance, score recalculation, variable extraction, staleness propagation, widget computation). Phases : fiche → audit → implementation → cockpit → complete.

### 6.2 GLORY Tools (→ ANNEXE B)

39 outils créatifs en 4 layers : CR (10 outils concepteur-rédacteur), DC (8 outils direction de création), HYBRID (11 outils opérationnels), BRAND (10 outils pipeline identité visuelle séquencé). Point d'entrée unique `generateGloryOutput()`. Outils persistables (21/39) sauvegardés en BDD avec refNumber. Layer BRAND = pipeline complet de développement d'identité de marque avec dépendances explicites (analyse sémiotique → cartographie visuelle → moodboard → chromatique → typographie → logo → tokens → motion → guidelines).

### 6.3 Campaign Manager 360 (→ ANNEXE C)

19 sous-routers, 92 procédures. Machine à 12 états (BRIEF_DRAFT → ARCHIVED). 100+ types d'actions ATL/BTL/TTL. Pipeline production 6 états (DEVIS → TERMINE). Achat média avec 11 types. Gestion d'équipe 13 rôles. Budget 8 catégories avec variance, burn forecast, cost-per-KPI. Approvals 9 types avec round counter. Assets 12 types avec versioning. Briefs 7 types avec 4 générateurs AI. Reports 7 types. Dependencies 4 types (BLOCKS/REQUIRES/FOLLOWS/PARALLEL). Field Operations terrain avec team + ambassadors JSON. AARRR Reporting unifié terrain + digital avec métriques de conversion calculées. Operation Recommender zéro-LLM.

### 6.4 ARTEMIS (→ ANNEXE D § D.1)

24 frameworks analytiques en 9 couches (Philosophie → Identité → Valeur → Expérience → Validation → Exécution → Mesure → Croissance → Survie). Modèle d'exécution : théorique, calcul (synchrone), IA (asynchrone), hybride. Orchestration avec tri topologique des dépendances. Quality gates. Score ARTEMIS global (% d'implémentations fraîches).

### 6.5 Mestor AI (→ ANNEXE D § D.2)

Assistant IA contextuel : conversations (threads avec 40 messages d'historique), insights proactifs (rule-based + AI, expiration 7j, déduplication 24h), scénarios (WHAT_IF/BUDGET_REALLOC/MARKET_ENTRY/COMPETITOR_RESPONSE). System prompt expert ADVERTIS. Context builder charge : métadonnées stratégie, statut piliers, signaux actifs, campagnes actives, Cult Index, Community snapshot.

### 6.6 Serenite (→ ANNEXE D § D.3)

Factures (4 types, 6 statuts, numérotation séquentielle auto, items liés aux assignments), contrats (4 types, 6 statuts, signature data), escrow (release partiel, conditions de libération), commissions (calcul par level × COMMISSION_RATES), dashboard financier (revenue, unpaid, escrow, commissions, avgRate). Currency par défaut XAF.

### 6.7 Tarsis / Signal Intelligence (→ ANNEXE D § D.4)

Signaux 3 couches (METRIC/STRONG/WEAK) liés aux piliers, avec mutations auditées et propagation automatique vers Decision Queue. Market Context : competitors (SOV, positionnement), opportunities (calendrier), budget tiers (5 niveaux), cross-brand intelligence (patterns sectoriels), metric thresholds (seuils d'alerte).

### 6.8 Brand OS (→ ANNEXE D § D.5)

Cult Index Engine (score 0-100, 7 dimensions), SuperfanProfile (6 segments Devotion Ladder : AUDIENCE → EVANGELIST), CommunitySnapshot (santé communautaire périodique), BrandOSConfig (configuration par stratégie), SocialChannels (6 plateformes), Ambassador Program (5 tiers).

### 6.9 La Guilde (→ ANNEXE D § D.6)

TalentProfile complet (compétences, tarifs, dispo, level, portfolio). Talent Engine : search paginé, matching pondéré, calcul de level, reviews, certifications, progression path. Catégories : CORE, EXTENDED, RESEAU.

### 6.10 Modules additionnels (→ ANNEXE D § D.7)

- **Club** (Upgraded Brands Club) : membres, événements, registrations, activités à points
- **Events** (Upgrade Summit) : événements avec budget, logistique, attendees, satisfaction
- **Boutique** (L'Académie) : templates payants/gratuits, achats trackés
- **Courses** (L'Académie) : cours avec programme, enrollment, progression, score final
- **Editorial** (The Upgrade) : articles premium, newsletters segmentées
- **Source Insights / RADAR** : rapports (BAROMETRE/SECTORIEL/FLASH/CUSTOM), data points, alertes, abonnements, demandes custom
- **PR** : communiqués, contacts presse, distributions, clippings (reach, ad equivalent value)
- **Social** : connexions OAuth (6 plateformes), posts publiés avec métriques (likes, comments, shares, reach)
- **Media Buying** : connexions GOOGLE_ADS/META_ADS/DV360/TIKTOK/LINKEDIN, sync performance quotidien (impressions, clicks, spend, conversions)
- **Messaging** : conversations directes inter-acteurs (fixer↔client, fixer↔créatif), threads contextualisés
- **CRM** : pipeline commercial (Deal, FunnelMapping), suivi opportunités prospect → client
- **Translation** : traduction de contenus stratégiques, documents multilingues, adaptation culturelle
- **Attribution** : attribution multi-touch (AttributionEvent), suivi parcours client, ARTEMIS FW-10
- **Cohorts** : analyse de cohortes (CohortSnapshot), rétention, LTV par segment, ARTEMIS FW-10
- **Market Study** : études de marché multi-sources (6 adaptateurs : Google Trends, Semrush, SerpAPI, SimilarWeb, SocialBlade, Crunchbase), synthèse AI
- **Market Pricing** : référentiel de tarifs marché par prestation, secteur et marché
- **Interventions** : demandes ponctuelles hors missions/campagnes (InterventionRequest)
- **Ambassador Program** : programme ambassadeurs à 5 tiers (Bronze → Diamond), referrals, content, points
- **Présentations stratégiques** : génération HTML des 8 piliers (8 renderers spécialisés), export PDF/Excel

### 6.11 Infrastructure transversale

- **Variable Store** : CRUD atomique BrandVariable avec historique de versions, 8 sources possibles, staleness tracking
- **Staleness Propagator** : BFS cascade quand une variable change → marque dépendants stale → propage aux piliers, frameworks, traductions
- **Pipeline Orchestrator** : side-effects post-génération (phase advance, score recalculation, variable extraction, widget computation)
- **AI Cost Tracker** : logging de chaque appel AI (modèle, tokens, coût USD/XAF, durée)
- **Audit Trail** : log immutable de chaque CREATE/UPDATE/DELETE avec userId, before/after data
- **Soft Deletes** : interception des delete sur modèles core → deletedAt timestamp, filtrage automatique
- **4 serveurs MCP** : Intelligence (9 tools, 6 resources), Operations (12 tools, 5 resources), Creative (42 tools), Pulse (11 tools, 7 resources). Transport WebStandard stateless. Auth Bearer token via McpApiKey.

---

## 7. MAPPING DIVISIONS → CODE EXISTANT → AJOUTS

Ce tableau montre ce qui existe déjà dans le code, ce qui est ajouté, et ce qui est enrichi.

### L'Oracle (stratégie de marque)

| Composant | État | Détail |
|-----------|------|--------|
| Strategy + 8 Pillars | ✅ Existe | 87+ modèles, pillar editors complets |
| ARTEMIS Frameworks | ✅ Existe | `framework` router + executor + 20+ frameworks |
| Score Snapshots | ✅ Existe | BMF, risk, investment scores |
| Cockpit Client | ✅ Existe → enrichir | Restructurer autour du cult marketing |
| AdvertisVector /200 | 🆕 Nouveau | Type pervasif + `advertis-scorer` service |
| DevotionSnapshot | 🆕 Nouveau | Modèle + router `devotionLadder` |
| Quick Intake | 🆕 Nouveau | Modèle + engine + pages publiques |
| Boot Sequence | 🆕 Nouveau | Service `boot-sequence` + UI |
| Value Reports | 🆕 Nouveau | Service `value-report-generator` + router |
| Diagnostic Engine | 🆕 Nouveau | Extension ARTEMIS avec localisation problème |

### Le Signal (intelligence marché)

| Composant | État | Détail |
|-----------|------|--------|
| Tarsis (veille concurrentielle) | ✅ Existe | `tarsis/` routes + CompetitorSnapshot |
| Market Study | ✅ Existe → enrichir | 6 adaptateurs, synthèse AI. Connecter résultats → Knowledge Graph, permettre déclenchement depuis Drivers |
| Signals | ✅ Existe | 3 couches (metric/strong/weak) |
| Source Insights (RADAR) | ✅ Existe | `sourceInsights` router + InsightReport modèle |
| Cult Index | ✅ Existe → enrichir | Connecter aux DevotionSnapshot |
| Analytics | ✅ Existe → enrichir | Ajouter dimension ADVE |
| Attribution | ✅ Existe → enrichir | `attribution` router + AttributionEvent. Alimenter Knowledge Graph (patterns par secteur/marché) |
| Cohorts | ✅ Existe → enrichir | `cohort` router + CohortSnapshot. Connecter aux DevotionSnapshot |
| Knowledge Graph | 🆕 Nouveau | KnowledgeEntry modèle + `knowledge-capture` (P0) + `knowledge-aggregator` (P5) |
| Editorial (The Upgrade) | ✅ Existe | `editorial` router + EditorialArticle |

### L'Arène (communauté)

| Composant | État | Détail |
|-----------|------|--------|
| Guilde (TalentProfile) | ✅ Existe → enrichir | Ajouter tier, ADVE vector, driverSpecialties |
| Matching | ✅ Existe (page) → enrichir | Service `matching-engine` |
| Club (Upgraded Brands Club) | ✅ Existe | `club` router + ClubMember + ClubEvent |
| Events (Upgrade Summit) | ✅ Existe | `event` router + Event + EventAttendee |
| GuildOrganization | 🆕 Nouveau | Modèle pour agences de prod |
| QualityReview | 🆕 Nouveau | Modèle + router + `qc-router` service |
| Tier system | 🆕 Nouveau | `guildTier` router + `tier-evaluator` service |
| Ambassador Program | ✅ Existe → enrichir | Réconcilier avec Devotion Ladder (ambassadeurs = segment 5, évangélistes = segment 6) |

### La Fusée (ingénierie et ops)

| Composant | État | Détail |
|-----------|------|--------|
| Campaign Manager 360 | ✅ Existe | 14 sous-routers, modèle complet |
| Missions | ✅ Existe → enrichir | Ajouter mode DISPATCH/COLLAB, driverId |
| GLORY (39 tools) | ✅ Existe → enrichir | Lier aux Drivers, hériter contexte ADVE |
| Deliverables | ✅ Existe → enrichir | Ajouter DeliverableTracking |
| MCP Servers (4) | ✅ Existe | Intelligence, Operations, Creative, Pulse |
| Drivers | 🆕 Nouveau | Modèle + `driver-engine` service |
| Guidelines | 🆕 Nouveau | `guidelines-renderer` service |
| Process Scheduler | 🆕 Nouveau | Modèle + service |
| Feedback Loop | 🆕 Nouveau | Service câblant Signal → scoring → ARTEMIS |
| BrandVault enrichi | ✅ Existe → enrichir | Tagging ADVE, 3 niveaux, garbage collection |
| PR (Relations Presse) | ✅ Existe → enrichir | Ajouter advertis_vector, lier aux Drivers PR, câbler clippings → Signal → feedback loop |
| Social Publishing | ✅ Existe → enrichir | Connecter SocialConnection aux Drivers sociaux, câbler SocialPost.metrics → Signal → feedback loop |
| Media Buying | ✅ Existe → enrichir | Câbler MediaPerformanceSync → CampaignAmplification (données réelles), benchmarks → Knowledge Graph |
| Interventions | ✅ Existe → enrichir | Conversion InterventionRequest → Mission, placer dans portals |
| Translation | ✅ Existe → enrichir | Intégrer aux Drivers multi-marchés, connecter au FW-15 Cultural Expansion |
| Présentations stratégiques | ✅ Existe → enrichir | 8 renderers HTML existants. Étendre `guidelines-renderer` en `brand-document-renderer` (guidelines + présentations + Value Reports) |
| Publications (cycle de vie) | ✅ Existe → enrichir | Clarifier cycle GloryOutput → QualityReview → Publication → BrandAsset |
| MCP Guild (nouveau) | 🆕 Nouveau | 5ème serveur MCP |
| MCP SESHAT (nouveau) | 🆕 Nouveau | 6ème serveur MCP |

### La Fusée — SOCLE (finance)

| Composant | État | Détail |
|-----------|------|--------|
| Serenite (contrats, factures, escrow) | ✅ Existe | Modèles complets |
| Commission | ✅ Existe → enrichir | Ajouter tierAtTime, operatorFee |
| Financial Engine | ✅ Existe → enrichir | Intégrer commissions, memberships |
| Membership | 🆕 Nouveau | Modèle + router |
| Commission Engine | 🆕 Nouveau | Service de calcul automatique |
| Mobile Money | 🆕 Nouveau (P4) | Webhooks Orange/MTN/Wave |
| CRM / Pipeline commercial | ✅ Existe → enrichir | Câbler Quick Intake → Deal, pipeline de conversion, revenue forecasting |
| Market Pricing | ✅ Existe → enrichir | Alimenter matching-engine (référentiel tarifaire) + commission-engine |

### Transversal

| Composant | État | Détail |
|-----------|------|--------|
| Messaging | ✅ Existe → enrichir | Contextualiser par Strategy/Mission, intégrer dans les 3 portals. Mestor = IA, Messaging = humain |

### L'Académie (transmission)

| Composant | État | Détail |
|-----------|------|--------|
| Courses | ✅ Existe | Course + CourseEnrollment modèles |
| Boutique (playbooks, templates) | ✅ Existe | BoutiqueTemplate + TemplatePurchase |
| Onboarding | ✅ Existe → enrichir | Câbler au Boot Sequence |
| Certification ADVE | ✅ Existe (via Course) → enrichir | Parcours structuré par tier |
| Creator /learn | 🆕 Nouveau | Pages dans Creator Portal |
| SESHAT Bridge | 🆕 Nouveau | Service de références créatives |

---

## 8. PHASES DE BUILD

### Phase 0 — Fondation ADVE Protocol + Quick Intake (Semaines 1-4)

**Objectif** : le protocole ADVE est pervasif, le Quick Intake est live, la capture Knowledge Graph est active.

| Tâche | Type | Division | Effort |
|-------|------|----------|--------|
| Implémenter AdvertisVector (Zod type + helpers) | Nouveau | Transversal | S |
| Ajouter `advertis_vector Json?` sur Strategy, Campaign, Mission, TalentProfile, Signal, GloryOutput, BrandAsset | Refactor | Transversal | M |
| Implémenter `advertis-scorer` service (scoring AI-assisted via Mestor) | Nouveau | Transversal | L |
| Implémenter router `advertis-scorer` (scoreObject, batchScore, getHistory) | Nouveau | Transversal | M |
| Ajouter phase QUICK_INTAKE sur Strategy | Refactor | L'Oracle | S |
| Implémenter modèle QuickIntake + router | Nouveau | L'Oracle | M |
| Implémenter `quick-intake-engine` service (questionnaire adaptatif, scoring partiel) | Nouveau | L'Oracle | L |
| Implémenter pages `/intake` (landing + questionnaire + résultat) — PUBLIC, sans auth | Nouveau | L'Oracle | L |
| Implémenter DevotionSnapshot modèle + router `devotionLadder` | Nouveau | L'Oracle | M |
| Connecter CultIndexSnapshot à DevotionSnapshot | Refactor | Le Signal | S |
| Unifier scoring : ScoreSnapshot + AdvertisVector en /200 cohérent | Refactor | Transversal | M |
| Implémenter modèle KnowledgeEntry | Nouveau | Le Signal | S |
| Implémenter service `knowledge-capture` (écriture passive à chaque événement) | Nouveau | Le Signal | M |
| Implémenter modèle Operator (UPgraders comme seul opérateur) | Nouveau | Transversal | S |
| Ajouter `operatorId` sur User et Strategy | Refactor | Transversal | S |
| Câbler Quick Intake → CRM (Quick Intake complété crée un Deal en PROSPECT) | Refactor | La Fusée (SOCLE) | S |
| Réconcilier AmbassadorProgram avec Devotion Ladder (ambassadeurs = segment 5) | Refactor | L'Arène | S |

**Livrable** : tout objet du système peut être scoré /200. Le Quick Intake est partageable par lien et crée automatiquement un Deal dans le CRM. La Devotion Ladder est mesurable et réconciliée avec le programme ambassadeurs. Le Knowledge Graph capture passivement. Un DG peut recevoir un lien, scorer sa marque en 15 min, et voir "Ordinaire — 94/200". Le fixer voit le pipeline de conversion.

### Phase 1 — Brand Instance complète (Semaines 5-9)

**Objectif** : chaque client a un Brand OS complet avec Drivers, guidelines, feedback loop.

| Tâche | Type | Division | Effort |
|-------|------|----------|--------|
| Implémenter modèle Driver + DriverGloryTool + router `driver` | Nouveau | La Fusée | L |
| Implémenter `driver-engine` service (generateSpecs, translateBrief) | Nouveau | La Fusée | L |
| Lier GLORY tools aux Drivers via DriverGloryTool | Refactor | La Fusée | M |
| Implémenter `guidelines-renderer` service | Nouveau | La Fusée | L |
| Implémenter router `guidelines` (generate, get, export, shareLink) | Nouveau | La Fusée | M |
| Structurer BrandVault en 3 niveaux (système/opérateur/production) | Refactor | La Fusée | M |
| Implémenter tagging ADVE sur assets (`asset-tagger` service) | Nouveau | La Fusée | M |
| Implémenter garbage collection (expiration, alertes, purge) | Nouveau | La Fusée | S |
| Implémenter DeliverableTracking modèle + router | Nouveau | La Fusée | M |
| Câbler `feedback-loop` service (Signal → scoring → ARTEMIS → recalibration → alerte) | Nouveau | Transversal | L |
| Enrichir permissions avec droits granulaires par Strategy | Refactor | Transversal | M |
| Enrichir approval workflow avec check ADVE par pilier | Refactor | La Fusée (BOOST) | M |
| Connecter SocialConnection aux Drivers sociaux (INSTAGRAM ↔ Driver Instagram, etc.) | Refactor | La Fusée | M |
| Câbler SocialPost.metrics → Signal automatiquement (métriques sociales → feedback loop) | Refactor | La Fusée | M |
| Câbler MediaPerformanceSync → CampaignAmplification (données réelles média) | Refactor | La Fusée (BOOST) | M |
| Lier PressRelease aux Drivers PR + ajouter advertis_vector | Refactor | La Fusée | S |
| Câbler PressClipping → Signal (reach + sentiment → pillar impact via feedback loop) | Refactor | Le Signal | S |
| Connecter résultats Market Study → Knowledge Graph (KnowledgeEntry type SECTOR_BENCHMARK) | Refactor | Le Signal | M |
| Étendre `guidelines-renderer` en `brand-document-renderer` (guidelines + présentations stratégiques + réutilisant les 8 renderers HTML existants) | Refactor | La Fusée | M |

**Livrable** : un client onboardé a un profil ADVE vivant, des Drivers actifs qui produisent des briefs qualifiés, des guidelines et présentations exportables. Le feedback loop reçoit des données réelles (métriques sociales, performance média, clippings presse) et mesure l'impact. Les études de marché alimentent le Knowledge Graph.

### Phase 2 — Mission Forge + Guilde (Semaines 10-15)

**Objectif** : les missions sont dispatchées ou co-créées, le QC est distribué, la Guilde est structurée.

| Tâche | Type | Division | Effort |
|-------|------|----------|--------|
| Ajouter mode DISPATCH/COLLABORATIF sur Mission | Refactor | La Fusée | S |
| Implémenter `matching-engine` service | Nouveau | L'Arène | L |
| Implémenter brief generator (Mestor + Driver + contexte ADVE) | Nouveau | La Fusée | L |
| Implémenter router `matching` (suggest, override, getHistory) | Nouveau | L'Arène | M |
| Ajouter `tier GuildTier` sur TalentProfile + métriques perf | Refactor | L'Arène | M |
| Implémenter GuildOrganization modèle + router `guildOrg` | Nouveau | L'Arène | M |
| Implémenter QualityReview modèle + router `qualityReview` | Nouveau | L'Arène | L |
| Implémenter `qc-router` service (routing par tier × criticité) | Nouveau | L'Arène | M |
| Implémenter QC automatisé (conformité technique + scoring IA) | Nouveau | L'Arène | L |
| Implémenter feedback structuré par pilier dans QC | Nouveau | L'Arène | M |
| Implémenter `tier-evaluator` service | Nouveau | L'Arène | M |
| Implémenter PortfolioItem modèle | Nouveau | L'Arène | S |
| Implémenter router `guildTier` | Nouveau | L'Arène | M |
| Enrichir statuts Mission (brief_generated → delivered_to_client) | Refactor | La Fusée | S |
| Implémenter SLA tracking (alertes J-2, J-1, escalade) | Nouveau | La Fusée | M |
| Connecter SESHAT via `seshat-bridge` service (si SESHAT prêt) | Nouveau | L'Académie | M |
| Intégrer Market Pricing au matching-engine (référentiel tarifaire pour scoring) | Refactor | L'Arène | S |
| Intégrer Translations aux Drivers multi-marchés (adaptation linguistique par Driver/marché) | Refactor | La Fusée | M |
| Permettre conversion InterventionRequest → Mission | Refactor | La Fusée (BOOST) | S |
| Enrichir Attribution et Cohorts → alimenter Knowledge Graph | Refactor | Le Signal | M |

**Livrable** : un brief qualifié est généré automatiquement via Driver (avec adaptation linguistique si multi-marché), le bon créatif est matché (avec tarif de référence marché), le QC est distribué par tier, le créatif progresse dans la Guilde, les agences de prod sont des GuildOrganizations. Les demandes d'intervention peuvent devenir des missions.

### Phase 3 — Portals (Semaines 16-22)

**Objectif** : les 3 populations + le funnel public ont leur interface.

| Tâche | Type | Division | Effort |
|-------|------|----------|--------|
| Restructurer `/cockpit` en Client Portal (Cult Dashboard → operate → brand → insights) | Refactor | L'Oracle | L |
| Page d'accueil cockpit : Cult Index + Devotion Ladder + radar 8 piliers | Nouveau | L'Oracle | L |
| Construire `/creator` complet (dashboard, missions, qc, progress, earnings, profile, learn, community) | Nouveau | L'Arène + L'Académie | XL |
| Implémenter visibilité par tier dans Creator Portal | Nouveau | L'Arène | M |
| Implémenter `/creator/learn` (fondamentaux ADVE, guidelines Driver, cas d'étude, ressources) | Nouveau | L'Académie | L |
| Construire `/console` complet (oracle, signal, arene, fusee, academie, socle, ecosystem, config) | Nouveau | Toutes | XL |
| Implémenter Mestor contextuel (scope selon le portal) | Refactor | Transversal | M |
| Implémenter view modes existants sur le nouveau Client Portal | Refactor | L'Oracle | S |
| Intégrer Club (Upgraded Brands Club) dans `/console/arene/club` et comme widget client | Refactor | L'Arène | M |
| Intégrer Events (Summit, meetups) dans `/console/arene/events` et `/creator/community/events` | Refactor | L'Arène | M |
| Intégrer Messaging dans les 3 portals (`/cockpit/messages`, `/creator/messages`, `/console/messages`) — contextualisé par Strategy/Mission | Refactor | Transversal | M |
| Placer PR dans `/console/fusee/pr` | Refactor | La Fusée | S |
| Placer Social dans `/console/fusee/social` | Refactor | La Fusée | S |
| Placer Media Buying dans `/console/fusee/media` | Refactor | La Fusée | S |
| Placer CRM/pipeline dans `/console/socle/pipeline` | Refactor | La Fusée (SOCLE) | S |
| Placer Market Study dans `/console/signal/market-study` | Refactor | Le Signal | S |
| Placer Attribution + Cohortes dans `/cockpit/insights/attribution` et `/console/signal/attribution` | Refactor | Le Signal | S |
| Placer Interventions dans `/cockpit/operate/requests` | Refactor | La Fusée | S |
| Intégrer factures freelance dans `/creator/earnings/invoices` (Serenite côté créatif) | Refactor | La Fusée (SOCLE) | S |
| Migrer pages `/os/*`, `/impulsion/*`, `/pilotis/*` vers les portals (redirections + fallback) | Refactor | Transversal | M |

**Livrable** : chaque acteur a son interface complète. Le client voit son Brand OS centré cult marketing. Le créatif gère ses missions, progresse, apprend l'ADVE, et voit ses factures. Le fixer a son god mode structuré par les 5 divisions avec PR, Social, Media, CRM, Market Study et interventions accessibles. La messagerie inter-acteurs fonctionne dans les 3 portals.

### Phase 4 — Value Capture + Scheduler + Boot Sequence (Semaines 23-28)

**Objectif** : la valeur est capturée, le système s'auto-organise, l'onboarding est complet.

| Tâche | Type | Division | Effort |
|-------|------|----------|--------|
| Enrichir Commission modèle + implémenter `commission-engine` service | Nouveau | La Fusée (SOCLE) | L |
| Implémenter Membership modèle + router | Nouveau | La Fusée (SOCLE) | M |
| Implémenter `value-report-generator` service | Nouveau | L'Oracle | L |
| Implémenter router `valueReport` (generate, list, export) | Nouveau | L'Oracle | M |
| Implémenter `upsell-detector` service | Nouveau | La Fusée (SOCLE) | M |
| Implémenter Process modèle + `process-scheduler` service | Nouveau | La Fusée | L |
| Implémenter `team-allocator` service | Nouveau | La Fusée (BOOST) | M |
| Implémenter contention management | Nouveau | La Fusée | M |
| Implémenter Boot Sequence complet (`boot-sequence` service + UI) | Nouveau | L'Oracle | L |
| Intégration paiement Mobile Money (webhooks Orange/MTN/Wave) | Nouveau | La Fusée (SOCLE) | L |
| Implémenter operator fees et reporting pour licenciés (prêt mais pas activé) | Nouveau | Transversal | M |

**Livrable** : les commissions sont calculées automatiquement, les retainers justifiés par des Value Reports, les processus sont schedulés, les goulots détectés, le Boot Sequence produit un profil ADVE calibré en 60-90 min. Mobile Money opérationnel.

### Phase 5 — Knowledge Graph + Antifragilité (Semaines 29-35)

**Objectif** : le système apprend, se renforce, et devient irremplaçable.

| Tâche | Type | Division | Effort |
|-------|------|----------|--------|
| Implémenter `knowledge-aggregator` service (batch — active l'intelligence sur les données capturées depuis P0) | Nouveau | Le Signal | XL |
| Implémenter benchmarks sectoriels (agrégation cross-strategy) | Nouveau | Le Signal | L |
| Implémenter framework performance ranking | Nouveau | L'Oracle | M |
| Implémenter creator performance profiling | Nouveau | L'Arène | M |
| Implémenter brief optimization patterns | Nouveau | La Fusée | M |
| Implémenter campaign templates data-driven | Nouveau | La Fusée (BOOST) | M |
| Connecter Tarsis au Knowledge Graph | Refactor | Le Signal | M |
| Implémenter `diagnostic-engine` (extension ARTEMIS + diagnostic différentiel + localisation) | Nouveau | L'Oracle | L |
| Implémenter 5ème serveur MCP : Guild | Nouveau | L'Arène | L |
| Implémenter 6ème serveur MCP : SESHAT | Nouveau | L'Académie | L |
| Anonymisation des données cross-client | Nouveau | Transversal | M |
| Data export par client (RGPD-like) | Nouveau | Transversal | M |
| Score /200 comme standard public : page de stats, widget embeddable | Nouveau | Transversal | M |

**Livrable** : le Knowledge Graph agrège les patterns depuis P0. ARTEMIS apprend des résultats passés. Les benchmarks sectoriels sont disponibles. Le matching utilise la performance historique. Le système est antifragile — il s'améliore avec chaque transaction.

---

## 9. CONTRAINTES TECHNIQUES

### 9.1 Performance

| Métrique | Seuil |
|----------|-------|
| Chargement dashboard (tout portal) | < 2s |
| Scoring ADVE (un objet) | < 5s (AI-assisted) |
| Matching engine | < 3s |
| Génération brief qualifié | < 15s (AI-assisted) |
| Génération Value Report | < 30s |
| Génération Guidelines | < 20s |
| Knowledge Graph query | < 1s |
| Batch knowledge-aggregator (par run) | < 5 min |
| Quick Intake (bout-en-bout) | < 15 min (UX) |
| Quick Intake (scoring final) | < 10s |

### 9.2 Scalabilité

| Dimension | Capacité cible V1 |
|-----------|-------------------|
| Opérateurs | 1 (UPgraders) — modèle prêt pour N |
| Brand Instances simultanées | 50 |
| Créatifs dans la Guilde (individuels) | 100 |
| Guild Organizations | 20 |
| Missions actives simultanées | 200 |
| Processus (daemons + batch) | 500 |
| KnowledgeEntry | 100 000 |
| Assets BrandVault (tous clients) | 50 000 |
| Quick Intakes (total) | 10 000 |

### 9.3 Sécurité

- **Isolation stricte des Brand Instances** : filtrage applicatif systématique sur `strategyId` + `operatorId`. Un client ne voit jamais les données d'un autre client.
- **Isolation des créatifs** : un freelance ne voit que les missions qui lui sont assignées ou disponibles pour son profil/tier.
- **Knowledge Graph anonymisé** : `sourceHash` au lieu de `strategyId` pour toute donnée cross-client.
- **Quick Intake** : données stockées séparément des Brand Instances. Conversion explicite avec consentement.
- **Commissions et revenus** : visibles uniquement par le concerné + ADMIN.
- **McpApiKey** : étendues aux nouveaux serveurs (Guild, SESHAT).
- **Rate limiting** : 10 req/min pour les endpoints AI.
- **Operator isolation** (future) : un opérateur licencié ne voit que ses propres Brand Instances et créatifs.

### 9.4 Migration

- Tous les nouveaux champs JSON sont nullable (`Json?`) — le système existant continue de fonctionner sans vecteur ADVE.
- Les nouvelles routes sont ajoutées sans modifier les routes existantes.
- Les modèles existants reçoivent des champs additifs, jamais de suppression.
- La migration est progressive : Phase 0 peut être déployée sans Phase 1.
- Chaque phase est autonome et déployable indépendamment (sauf dépendances marquées).
- Les Surfaces v2 actuelles (mission-control, brand-pulse, studio, backstage) sont maintenues comme fallback pendant la transition vers les 3 Portals.

### 9.5 Intégrations externes

| Intégration | Protocole | Division | Usage | Phase |
|-------------|-----------|----------|-------|-------|
| SESHAT | API REST ou MCP | L'Académie | Références créatives pour les briefs | Phase 2 |
| Mobile Money (Orange, MTN, Wave) | Webhooks + API | La Fusée (SOCLE) | Paiement commissions et memberships | Phase 4 |
| Social Media APIs | Webhooks entrants | Le Signal | Signaux pour le feedback loop | Phase 1 |
| Calendriers (Google/Outlook) | API REST | La Fusée | Sync pour le scheduler | Phase 4 |

---

## 10. CRITÈRES D'ACCEPTATION

### 10.1 Phase 0 — Fondation ADVE Protocol + Quick Intake

- [ ] Un objet Strategy peut être scoré /200 sur les 8 piliers et le score est persisté
- [ ] Le score composite /200 est calculé et historisé en time series
- [ ] Mestor peut scorer n'importe quel objet quand invoqué avec le contexte approprié
- [ ] La Devotion Ladder est mesurable et les snapshots sont stockés
- [ ] Une alerte est générée quand un score passe sous un seuil configurable
- [ ] Le Quick Intake est accessible par lien partageable, sans compte
- [ ] Le Quick Intake guide l'utilisateur en 15 min et produit un score /200 + classification
- [ ] Le résultat Quick Intake est partageable et montre le radar 8 piliers
- [ ] Un Quick Intake complété peut être converti en Brand Instance (Strategy)
- [ ] Le fixer reçoit une notification à chaque Quick Intake complété
- [ ] Chaque scoring, mission close, et QC écrit un KnowledgeEntry (capture passive)
- [ ] Le modèle Operator existe avec UPgraders comme seul opérateur
- [ ] Un Quick Intake complété crée automatiquement un Deal dans le CRM (statut PROSPECT)
- [ ] Le fixer voit le pipeline de conversion Quick Intake → Deal → Brand Instance
- [ ] L'AmbassadorProgram est réconcilié avec la Devotion Ladder (ambassadeurs = segment 5)

### 10.2 Phase 1 — Brand Instance

- [ ] Un Driver peut être créé, activé, et lié à une Strategy
- [ ] Un Driver activé génère des specs initiales basées sur le profil ADVE du client
- [ ] Un brief qualifié est générable via un Driver (stratégie + direction + specs + critères QC)
- [ ] Les assets BrandVault sont tagués par pilier et recherchables
- [ ] Les guidelines sont générées automatiquement depuis le profil ADVE et exportables en PDF
- [ ] Un Signal entrant recalcule le score du pilier concerné
- [ ] Un seuil de dérive déclenche un diagnostic ARTEMIS + alerte fixer
- [ ] Les SocialConnection sont liées aux Drivers correspondants (même plateforme)
- [ ] Les métriques de SocialPost alimentent automatiquement le feedback loop via Signal
- [ ] Les MediaPerformanceSync remontent les données réelles dans les CampaignAmplification
- [ ] Les PressClipping génèrent des Signals qui alimentent le feedback loop (reach + sentiment → pillar impact)
- [ ] Les résultats de Market Study produisent des KnowledgeEntry (type SECTOR_BENCHMARK)
- [ ] Le `brand-document-renderer` peut produire guidelines ET présentations stratégiques (8 piliers)

### 10.3 Phase 2 — Mission Forge + Guilde

- [ ] Une mission peut être créée en mode DISPATCH ou COLLABORATIF
- [ ] Le matching engine retourne les 2-3 meilleurs créatifs pour un brief donné
- [ ] Le QC est routé automatiquement selon le tier du soumetteur
- [ ] Le QC produit un verdict structuré par pilier avec feedback
- [ ] Un créatif voit son chemin de progression avec critères mesurables
- [ ] Le fixer peut valider une promotion de tier
- [ ] En mode collaboratif, le créatif peut enrichir le brief et ses contributions sont trackées
- [ ] Une GuildOrganization peut être créée et ses membres sont liés
- [ ] Le matching-engine utilise le MarketPricing comme référence tarifaire
- [ ] Les Drivers multi-marchés peuvent produire des briefs culturellement adaptés (via Translation)
- [ ] Une InterventionRequest peut être convertie en Mission
- [ ] Les AttributionEvent alimentent le Knowledge Graph

### 10.4 Phase 3 — Portals

- [ ] Le Client Portal affiche le Cult Index + Devotion Ladder + radar 8 piliers en page d'accueil
- [ ] Le Client Portal permet de soumettre un brief et valider des livrables (section /operate)
- [ ] Les guidelines sont navigables et interrogeables via Mestor dans le Client Portal
- [ ] Le Creator Portal montre les missions disponibles filtrées par profil/tier
- [ ] Le Creator Portal montre les métriques de performance et le chemin de progression
- [ ] Le Creator Portal inclut une section /learn avec fondamentaux ADVE et guidelines Driver
- [ ] La Fixer Console expose les 5 divisions avec drill-down complet
- [ ] Le Club et les Events sont intégrés dans la navigation
- [ ] Mestor est contextuel selon le portal d'invocation
- [ ] Les view modes (EXECUTIVE, MARKETING, FOUNDER, MINIMAL) fonctionnent sur le Client Portal
- [ ] La messagerie est accessible dans les 3 portals, contextualisée par Strategy/Mission
- [ ] Le PR, le Social et le Media Buying sont accessibles dans la Fixer Console (/console/fusee)
- [ ] Le CRM/pipeline est accessible dans /console/socle/pipeline
- [ ] Le Market Study est accessible dans /console/signal/market-study
- [ ] Les demandes d'intervention sont gérables dans /cockpit/operate/requests
- [ ] L'attribution est consultable dans /cockpit/insights/attribution
- [ ] Les factures freelance sont visibles dans /creator/earnings/invoices
- [ ] Les pages legacy (/os, /impulsion, /pilotis) redirigent vers les portals

### 10.5 Phase 4 — Value Capture + Scheduler

- [ ] Les commissions sont calculées automatiquement par mission selon le tier
- [ ] Un Value Report mensuel est générable et exportable par client
- [ ] Le Value Report contextualise les baisses de score (causes exogènes identifiées)
- [ ] Les daemons sont schedulables et des alertes sont émises quand ils s'arrêtent
- [ ] La contention entre missions/daemons est détectée et des arbitrages sont proposés
- [ ] Le Boot Sequence complet produit un profil ADVE calibré en 60-90 minutes
- [ ] Le paiement Mobile Money est opérationnel pour les commissions

### 10.6 Phase 5 — Knowledge Graph + Antifragilité

- [ ] Les benchmarks sectoriels sont calculés cross-strategy (anonymisés)
- [ ] Le diagnostic ARTEMIS recommande les frameworks basé sur les résultats passés
- [ ] Le matching engine utilise la performance historique du créatif sur des briefs similaires
- [ ] Les templates de campagne sont enrichis par les données réelles
- [ ] Un client peut exporter l'intégralité de ses données
- [ ] Les 6 serveurs MCP sont opérationnels (Intelligence, Operations, Creative, Pulse, Guild, SESHAT)
- [ ] Le score /200 est citeable et partageable comme standard de marché

---

## 11. LEXIQUE

| Terme | Définition |
|-------|------------|
| **UPgraders** | Écosystème à 5 divisions (Oracle, Signal, Arène, Fusée, Académie) pour l'industrie créative africaine. "De la Poussière à l'Étoile". |
| **LaFusée** | Le SaaS Industry OS qui encode les 5 divisions d'UPgraders. Le Brand OS est le produit. L'Agency OS est l'infrastructure. L'ADVE est le protocole. |
| **ADVE-RTIS** | Méthodologie propriétaire 8 piliers (Authenticité, Distinction, Valeur, Engagement, Risk, Track, Implementation, Stratégie). Méthode de création de culte de marque. |
| **Vecteur ADVERTIS** | Objet JSON : 8 scores /25 + composite /200 + confidence. Attachable à tout objet transactionnel. |
| **Score /200** | Score composite ADVE. 0-80 Zombie, 81-120 Ordinaire, 121-160 Forte, 161-180 Culte, 181-200 Icône. |
| **Brand Instance** | L'ensemble des données d'un client : Strategy + piliers + drivers + assets + scores + feedback. Son Brand OS. |
| **Driver** | Machine de traduction stratégie → canal. Transforme le profil ADVE en specs de production pour un canal donné (Instagram, packaging, event, etc.). |
| **Devotion Ladder** | Échelle de progression d'audience en 6 niveaux : Spectateur → Intéressé → Participant → Engagé → Ambassadeur → Évangéliste. |
| **Guilde** | Réseau structuré de créatifs avec hiérarchie méritocratique (Apprenti → Compagnon → Maître → Associé). |
| **GuildOrganization** | Agence opérationnelle/de production membre de la Guilde en tant qu'entité collective. |
| **Mission Forge** | Système de création et dispatch de missions. Produit des briefs qualifiés via Driver. |
| **QC distribué** | Quality Control réparti par tier : Maîtres valident Compagnons, Compagnons valident Apprentis. |
| **Knowledge Graph** | Intelligence accumulée cross-client (anonymisée) : patterns, benchmarks, performance créatifs, optimisation briefs. |
| **Feedback Loop** | Boucle fermée : Output → Signal → Diagnostic → Recalibration → Output ajusté. |
| **Boot Sequence** | Onboarding client complet (60-90 min) qui calibre le profil ADVE. |
| **Quick Intake** | Diagnostic express (15 min), public, partageable par lien. Score /200 + classification. Porte d'entrée du funnel. |
| **Fixer** | L'orchestrateur stratégique (Alexandre / ADMIN) qui opère l'écosystème. Protocol Owner. |
| **Opérateur** | Entité qui opère des Brand Instances via LaFusée. UPgraders est le premier et seul opérateur en V1. Les agences licenciées ADVE seront des opérateurs futurs. |
| **L'Oracle** | Division stratégie (IMPULSION™, Retainer, diagnostics ARTEMIS). |
| **Le Signal** | Division intelligence (RADAR™, Tarsis, benchmarks, Knowledge Graph). |
| **L'Arène** | Division communauté (Guilde, Upgraded Brands Club™, Upgrade Summit™, matching). |
| **La Fusée** | Division ingénierie (ADVERTIS SaaS, BOOST™ ops, SOCLE™ finance, GLORY tools, MCP servers). |
| **L'Académie** | Division transmission (Certification ADVE™, bootcamps, playbooks, SESHAT). |
| **ARTEMIS** | Batterie de frameworks analytiques pour le diagnostic de marque. |
| **SESHAT** | Système de curation de références créatives, filtrable par profil ADVE. |
| **GLORY** | 39 outils créatifs/opérationnels liés aux Drivers. |
| **Mestor** | AI assistant (Claude) contextuel selon le portal d'invocation. |
| **RADAR™** | Produit d'intelligence marché (baromètres sectoriels, benchmarks). Division Le Signal. |
| **Value Report** | Rapport mensuel justificatif du retainer, quantifiant la valeur produite par pilier. |
| **Upgraded Brands Club™** | Communauté de marques clientes. Network effect. Division L'Arène. |
| **Upgrade Summit™** | Événement flagship annuel. Acquisition + positionnement. Division L'Arène. |
| **SOCLE™** | Infrastructure admin/finance (contrats, factures, escrow, commissions, Mobile Money). |
| **BOOST™** | Gestion de projet créatif et accélération (Campaign Manager 360, missions, dispatch). |
| **Flywheel** | Stratégie → Création → Communauté → Demande → Solutions → Finance → Croissance. Les 5 divisions s'alimentent mutuellement. |

---

## 12. INVENTAIRE TECHNIQUE COMPLET

### 12.1 Stack

| Couche | Technologie |
|--------|------------|
| Framework | Next.js 16 (App Router, React 19, React Compiler) |
| Language | TypeScript (strict mode, `noUncheckedIndexedAccess`) |
| API | tRPC v11 (superjson, Zod validation) |
| Database | PostgreSQL 16 via Prisma ORM |
| Auth | NextAuth.js 5 (JWT sessions, Credentials + Google OAuth) |
| AI | Anthropic Claude via Vercel AI SDK (`@ai-sdk/anthropic`) |
| Styling | Tailwind CSS v4 (OKLCH color system, `@theme` syntax) |
| Components | shadcn/ui (Radix UI primitives, CVA variants) |
| MCP | Model Context Protocol SDK v1.26.0 |
| Testing | Vitest (unit), Playwright (e2e) |

### 12.2 Chiffres cibles

| Dimension | Actuel | Cible finale |
|-----------|--------|-------------|
| Modèles Prisma | 87 | ~99 |
| tRPC Routers | 43 | ~61 (18 nouveaux + 30 modifiés) |
| Services | 65+ | ~85+ |
| MCP Servers | 4 (74 tools) | 6 (~92 tools) |
| Pages/Routes | ~45 | ~58 (3 portals + intake + pages manquantes) |
| Routers existants enrichis | — | 30 (16 initiaux + 14 ajoutés par Annexe E) |
| Phases de build | — | 6 (0-5), ~35 semaines |
