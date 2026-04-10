# LaFusee OS `v3.3.0`

**Plateforme SaaS de gestion de marque IA-powered** — Methodologie ADVE-RTIS, architecture NETERU, 6 serveurs MCP, 4 portails.

> *"Chaque marque a un ADN. On le decode, on le protege, on le fait performer."*

---

## Vue d'ensemble

LaFusee OS est le systeme d'exploitation de l'agence LaFusee. Il orchestre la gestion complete du cycle de vie des marques — du diagnostic initial au suivi de performance continu — via la methodologie proprietaire **ADVE-RTIS** (8 piliers, score /200) et l'architecture **NETERU** (trio Mestor/Artemis/Seshat).

### Chiffres cles

| Metrique | Valeur |
|---|---|
| Pages (routes) | 160 |
| Fichiers TypeScript | 490 |
| Lignes de code (services) | ~24 000 |
| Routers tRPC | 66 |
| Modeles Prisma | ~80 (2600 lignes) |
| Serveurs MCP | 6 |
| Glory Tools | 91 (31 sequences) |
| Portails | 4 (Console, Cockpit, Creator, Agency) + Intake |

> Voir [CHANGELOG.md](./CHANGELOG.md) pour l'historique complet des versions.

---

## Architecture

```
LaFusee OS
├── Portail Console (Fixer)     — 60+ pages, 9 divisions, admin complet
├── Portail Cockpit (Client)    — dashboard marque, missions, insights
├── Portail Creator (Talent)    — missions, QC, gains, progression
├── Portail Agency              — clients, missions, revenus, contrats
├── Widget Intake               — formulaire public d'onboarding (4 methodes)
├── Architecture NETERU          — Mestor (decision) + Artemis (protocole) + Seshat (observation)
├── 6 Serveurs MCP              — Intelligence, Operations, Creative, Pulse, Guild, Seshat
├── 66 Routers tRPC             — API type-safe backend complet
├── Prisma + PostgreSQL          — ~80 modeles, 2600 lignes de schema
└── Anthropic Claude API         — LLM Gateway central, 91 Glory Tools, 31 sequences
```

### Architecture NETERU (v3)

Le trio divin orchestre toute l'intelligence du systeme :

```
                    ┌─────────────────────────┐
                    │   MESTOR (Decision)      │
                    │   Commandant + Hyperviseur│
                    │   Cascade RTIS            │
                    └──────────┬──────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   ARTEMIS     │  │   SESHAT      │  │  PILLAR      │
    │   24 Frameworks│  │  Knowledge    │  │  GATEWAY     │
    │   91 Tools     │  │  Tarsis       │  │  (LOI 1)     │
    │   31 Sequences │  │  References   │  │  Ecriture    │
    └──────────────┘  └──────────────┘  └──────────────┘
```

- **Mestor** : Hyperviseur deterministe (plans d'orchestration) + Commandant LLM (recommandations strategiques)
- **Artemis** : 24 frameworks diagnostiques + 91 Glory Tools en 31 sequences executables
- **Seshat** : Knowledge Graph local + Tarsis (signaux faibles) + enrichissement references

### Stack technique

- **Framework** : Next.js 15 (App Router, Turbopack)
- **Language** : TypeScript 5.8 (strict)
- **API** : tRPC v11 + React Query
- **Base de donnees** : PostgreSQL via Prisma 6
- **Auth** : NextAuth v5 (RBAC : FIXER, ASSOCIE, CLIENT, CREATOR)
- **AI** : Anthropic Claude API (@anthropic-ai/sdk + AI SDK)
- **MCP** : Model Context Protocol (@modelcontextprotocol/sdk)
- **UI** : Tailwind CSS 4, Lucide Icons, Recharts
- **Tests** : Vitest (unit) + Playwright (e2e)
- **Deploy** : Vercel (crons integres)

---

## Methodologie ADVE-RTIS

Le coeur de LaFusee. Chaque marque est evaluee sur 8 piliers, score /25 chacun, total /200 :

| Pilier | Nom | Description |
|---|---|---|
| **A** | Authenticite | ADN de marque, valeurs, mission, histoire |
| **D** | Distinction | Positionnement, differenciation, avantage competitif |
| **V** | Valeur | Proposition de valeur, pricing, perception marche |
| **E** | Engagement | Communaute, touchpoints, fidelisation |
| **R** | Risk | Risques identifies, vulnerabilites, plan de mitigation |
| **T** | Track | KPIs, metriques de suivi, objectifs chiffres |
| **I** | Implementation | Plan d'action, phases, ressources, timeline |
| **S** | Strategie | Vision long terme, roadmap, pivots strategiques |

### Classification AdvertisVector

| Score /200 | Classification |
|---|---|
| 170+ | LEGENDARY |
| 140-169 | ICONIC |
| 110-139 | ESTABLISHED |
| 80-109 | EMERGING |
| 50-79 | FRAGILE |
| < 50 | CRITICAL |

---

## Les 7 Divisions

| Division | Couleur | Role |
|---|---|---|
| **L'Oracle** | Violet | Diagnostic, ingestion, brief ingest, boot sequence, intake |
| **Mestor** | Violet-deep | Hyperviseur, plans d'orchestration, recommandations, insights |
| **Artemis** | Emeraude | Missions, campagnes, glory tools, skill tree, vault, drivers |
| **Seshat** | Bleu | Intelligence marche, signaux, knowledge graph, tarsis, attribution |
| **L'Arene** | Orange | Guilde de creatifs, matching, organisations, evenements |
| **Le Socle** | Vert | Revenus, commissions, pipeline, contrats, escrow, factures |
| **L'Academie** | Jaune | Formations, certifications, boutique, contenu editorial |
| **L'Ecosysteme** | — | Operateurs, metriques globales, scoring plateforme |

---

## 6 Serveurs MCP

Chaque serveur expose des **tools** (actions) et des **resources** (donnees) via le protocole MCP :

| Serveur | Tools | Resources | Role |
|---|---|---|---|
| **Intelligence** | 6 | 7 | Analyse marche, signaux, drift detection |
| **Operations** | 8 | 5 | Missions, campagnes, SLA, scheduling |
| **Creative** | 23 | 7 | Brand guardian, glory tools, generation creative |
| **Pulse** | 5 | 4 | Social metrics, engagement, tendances |
| **Guild** | 6 | 5 | Talent matching, QC, promotions |
| **Seshat** | 4 | 3 | Knowledge persistence, memoire organisationnelle |

---

## Glory Tools + Sequences

91 outils AI specialises en 4 couches, orchestres en 31 sequences :

| Couche | Outils | Role |
|---|---|---|
| **CR** (Concepteur-Redacteur) | 10 | Copywriting, concepts, tone-of-voice |
| **DC** (Direction de Creation) | 25+ | Identite visuelle, evaluation, presentation |
| **HYBRID** | ~20 | Operations, calendrier, budget, benchmarks |
| **BRAND** | ~20 | Pipeline identite visuelle, semiotique, guidelines, motion |

### 31 Sequences (5 tiers)

| Famille | Sequences | Tier |
|---|---|---|
| **Pillar** | MANIFESTE-A, BRANDBOOK-D, OFFRE-V, PLAYBOOK-E, AUDIT-R, ETUDE-T, BRAINSTORM-I, ROADMAP-S | T0-T1 |
| **Identity** | BRAND, NAMING, MESSAGING, POSITIONING, PERSONA-MAP, BRAND-AUDIT | T1-T2 |
| **Production** | KV, SPOT-VIDEO, SPOT-RADIO, PRINT-AD, OOH, SOCIAL-POST, STORY-ARC, WEB-COPY, PACKAGING | T2 |
| **Campaign** | CAMPAIGN-360, CAMPAIGN-SINGLE, LAUNCH, REBRAND, PITCH | T3 |
| **Operational** | MEDIA-PLAN, CONTENT-CALENDAR, ANNUAL-PLAN, OPS, INFLUENCE, COST-SERVICE, COST-CAMPAIGN, PROFITABILITY | T4-T5 |

Chaque sequence a des **prerequis** (skill tree) : les tiers superieurs ne se debloquent que quand les tiers inferieurs sont ACCEPTED dans le Vault.

---

## Demarrage rapide

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Cle API Anthropic (`ANTHROPIC_API_KEY`)

### Installation

```bash
# Clone
git clone https://github.com/xtincell/ADVE-project.git
cd ADVE-project

# Dependances
npm install

# Variables d'environnement
cp .env.example .env
# Remplir : DATABASE_URL, ANTHROPIC_API_KEY, NEXTAUTH_SECRET

# Base de donnees
npx prisma migrate dev
npx prisma db seed        # seed de base
npx prisma db seed:demo   # seed de demo (optionnel)

# Lancer
npm run dev
```

L'app tourne sur `http://localhost:3000`.

### Scripts disponibles

| Script | Description |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Build production |
| `npm run start` | Start production |
| `npm run lint` | ESLint |
| `npm run test` | Tests unitaires (Vitest) |
| `npm run test:e2e` | Tests E2E (Playwright) |
| `npm run db:generate` | Regenerer le client Prisma |
| `npm run db:push` | Push schema sans migration |
| `npm run db:migrate` | Migration dev |
| `npm run db:seed` | Seed de base |
| `npm run db:seed:demo` | Seed de demo |

---

## Structure du projet

```
src/
├── app/
│   ├── (auth)/              # Pages d'auth (login, register, reset)
│   ├── (agency)/            # Portail Agence
│   ├── (cockpit)/           # Portail Client (Cockpit)
│   ├── (console)/           # Portail Admin (Console Fixer) — 60+ pages
│   │   └── console/
│   │       ├── oracle/      # L'Oracle — clients, ingestion, brief-ingest, boot, diagnostics
│   │       ├── mestor/      # Mestor — plans, insights, recommandations
│   │       ├── artemis/     # Artemis — missions, campagnes, glory, skill-tree, vault, tools
│   │       ├── seshat/      # Seshat — intelligence, signaux, knowledge, market, tarsis
│   │       ├── arene/       # L'Arene — guilde, matching, academie
│   │       ├── socle/       # Le Socle — revenus, commissions, contrats
│   │       └── config/      # Configuration systeme + variables bible
│   ├── (creator)/           # Portail Creatif (Creator)
│   ├── (intake)/            # Widget d'intake public (4 methodes)
│   └── api/                 # NextAuth, chat, cron, export, MCP, tRPC, webhooks
├── components/
│   ├── navigation/          # AppShell, sidebar, portal configs (5 portails)
│   └── shared/              # 35+ composants reutilisables
├── lib/
│   ├── schemas/             # Schemas Zod (pillar-schemas, etc.)
│   ├── trpc/                # Client tRPC (React Query v5)
│   └── types/               # advertis-vector, pillar-schemas, variable-bible, pillar-maturity
└── server/
    ├── mcp/                 # 6 serveurs MCP
    ├── services/            # 40+ services metier
    │   ├── mestor/          # Commandant + Hyperviseur + RTIS Cascade
    │   ├── artemis/         # 24 frameworks + tools registry + sequences + executor
    │   ├── seshat/          # Knowledge graph + Tarsis + references
    │   ├── brief-ingest/    # Brief PDF → ParsedBrief → NETERU pipeline
    │   ├── pillar-gateway/  # LOI 1 — seul point d'ecriture des piliers
    │   ├── llm-gateway/     # Gateway central LLM (retry, cost tracking, caller tags)
    │   ├── rtis-protocols/  # R, T, I, S — protocoles specialises
    │   ├── glory-tools/     # Executeur, auto-complete, sequence queue
    │   └── ...              # ingestion-pipeline, campaign-manager, matching-engine, etc.
    └── trpc/
        ├── routers/         # 66 routers tRPC
        └── router.ts        # Router principal (appRouter)
prisma/
├── schema.prisma            # 2600 lignes, ~80 modeles
└── seed.ts                  # Seed de base + demo
Documentation/               # Cahier de charges v5, annexes A-H
```

---

## Portails et roles

| Portail | Route | Role RBAC | Acces |
|---|---|---|---|
| Console | `/console` | FIXER | Admin complet — 9 divisions, 60+ pages |
| Console | `/console` | ASSOCIE | Lecture seule (a venir) |
| Cockpit | `/cockpit` | CLIENT | Dashboard marque, piliers, missions, insights |
| Creator | `/creator` | CREATOR | Missions, QC, gains, progression |
| Agency | `/agency` | AGENCY | Clients, missions, revenus, contrats |
| Intake | `/intake` | Public | Formulaire d'onboarding (4 methodes) |

---

## Crons

Configures dans `vercel.json` :

| Cron | Frequence | Role |
|---|---|---|
| `/api/cron/scheduler` | Toutes les 5 min | Dispatch de missions, SLA checks |
| `/api/cron/feedback-loop` | Tous les jours 8h | Boucle de feedback, alertes drift |

---

## Services principaux

| Service | Role | Statut |
|---|---|---|
| **Mestor Hyperviseur** | Plans d'orchestration deterministes, execution step-by-step | ACTIVE |
| **Mestor Commandant** | Recommandations strategiques LLM, what-if scenarios | ACTIVE |
| **Artemis Frameworks** | 24 diagnostics, tri topologique, execution | ACTIVE |
| **Artemis Glory Tools** | 91 outils creatifs, 31 sequences, skill tree | ACTIVE |
| **Seshat Knowledge** | Knowledge graph, references, enrichissement | ACTIVE |
| **Seshat Tarsis** | Signaux faibles, intelligence marche | ACTIVE |
| **Brief Ingest** | PDF → ParsedBrief → NETERU pipeline | ACTIVE |
| **Pillar Gateway** | LOI 1 — seul point d'ecriture piliers, versioning | ACTIVE |
| **LLM Gateway** | Calls centralises, retry, cost tracking, caller tags | ACTIVE |
| **RTIS Protocols** | R(isk), T(rack), I(nnovation), S(trategy) | ACTIVE |
| **Ingestion Pipeline** | PDF/DOCX/XLSX/Image → ADVE filler | ACTIVE |
| **Campaign Manager 360** | State machine, gates, budget, AARRR | ACTIVE |
| **Matching Engine** | Talent ↔ Mission scoring + suggestion | ACTIVE |
| **Sequence Vault** | Staging → Accept/Reject → BrandAsset promotion | ACTIVE |
| **AdvertisVector Scorer** | Score /200, snapshots, historique | ACTIVE |

---

## Documentation

Le dossier `Documentation/` contient le cahier de charges complet :

| Document | Contenu |
|---|---|
| `ANNEXE-A-METHODOLOGIE-ADVE.md` | Methodologie ADVE-RTIS complete |
| `ANNEXE-B-GLORY-TOOLS.md` | 39 Glory tools, specs detaillees |
| `ANNEXE-C-CAMPAIGN-MANAGER-360.md` | Campaign Manager, missions, SLA |
| `ANNEXE-D-SYSTEMES-EXISTANTS.md` | Systemes existants a integrer |
| `ANNEXE-E-AUDIT-COMPLETUDE.md` | Audit de completude des modules |
| `LAFUSEE-OS-PART-1-VISION-DATA.md` | Vision, data model, architecture |
| `LAFUSEE-OS-PART-2-API-UI-SYSTEMES.md` | API, UI, systemes |
| `LAFUSEE-OS-PART-3-BUILD-ACCEPTATION.md` | Build, tests, acceptation |

---

## Variables d'environnement

```env
# Base de donnees
DATABASE_URL="postgresql://user:pass@localhost:5432/lafusee"

# Auth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# AI
ANTHROPIC_API_KEY="sk-ant-..."

# Optionnel
VERCEL_URL=""
```

---

## Contribution

1. Chaque module a un **spec embarque** dans son fichier principal (header commentaire)
2. Les **dependances cross-module** sont documentees dans chaque module + dans `.claude/module-registry.json`
3. Toute modification d'un module doit verifier que les modules dependants restent fonctionnels (`npx tsc --noEmit`)
4. Les scores et statuts sont mis a jour dans le registry apres chaque fix

---

## Versionnage

Format : **`MAJEURE.PHASE.ITERATION`** (voir [CHANGELOG.md](./CHANGELOG.md))

| Version | Date | Jalon |
|---|---|---|
| v3.3.0 | 2026-04-10 | Brief Ingest Pipeline NETERU-governed |
| v3.2.0 | 2026-04-08 | Artemis Context System + Vault operationnel |
| v3.1.0 | 2026-04-04 | Architecture NETERU (Mestor/Artemis/Seshat) |
| v3.0.0 | 2026-03-31 | Bible ADVERTIS 134 variables + Design System |
| v2.5.0 | 2026-03-25 | Glory 91 tools, 31 sequences, deliverables |
| v2.0.0 | 2026-02-20 | 3 portails operationnels, 49 pages console |
| v1.0.0 | 2026-01-25 | Foundation — ADVE-RTIS, Campaign Manager, 42 modules |

---

## Licence

Proprietary — LaFusee SARL. Tous droits reserves.
