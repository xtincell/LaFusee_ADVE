# ADVE-project — Plan d'actions restantes

**Date** : 2026-04-27
**Repo canonique** : `https://github.com/xtincell/ADVE-project` — branche `main`
**Version** : 4.0.0-alpha (consolidation v3 + v4)
**Tests** : 672 pass, 22 skipped, 1 fail (LLM smoke — manque ANTHROPIC_API_KEY)

---

## 1. ETAT DES PLAINTES ORIGINALES

### Plainte 1 — "Le scoring ne marche pas"
**Statut : CORRIGE dans v4**

L'ancien formulaire intake (`LaFusee_ADVE`) stockait les reponses avec des cles `q0/q1/q2` alors que le backend attendait `a_vision/a_mission/d_positioning`. Score = 0 systematiquement.

v4 a resolu le probleme differemment et mieux :
- Le formulaire utilise `trpc.quickIntake.getQuestions` (server-driven)
- Les reponses sont keyed par `question.id` (semantique)
- `complete()` passe par `extractStructuredPillarContent()` qui appelle le LLM pour extraire les atoms structures depuis les reponses libres
- Score ADVE /100 (4 piliers) avec cap a 25/pilier

**Risque residuel** : Si `ANTHROPIC_API_KEY` n'est pas configuree, `callLLM()` echoue et l'extraction tombe en fallback. Verifier que le fallback produit quand meme un score non-zero.

---

### Plainte 2 — "Page de resultat = creature de Frankenstein"
**Statut : AMELIORE mais incomplet**

v4 a ajoute :
- [x] Export PDF (jsPDF + html2canvas)
- [x] Radar 4 piliers ADVE
- [x] CTA vers IMPULSION
- [ ] **Pas de paywall** (CinetPay / PayPal / Visa) — aucune integration paiement
- [ ] **Pas d'audit ADVE complet** dans le rendu (juste score + forces/faiblesses)
- [ ] **Pas de reco RTIS legere** dans l'apercu gratuit
- [ ] **Follow-up CTA non fonctionnels** (mailto: seulement)

---

### Plainte 3 — "ARTEMIS sequences ne demarrent pas"
**Statut : CORRIGE dans v4**

v4 a un service `artemis/` complet (11 fichiers) avec :
- Frameworks, governance, tools engine, deliverable compiler, execution journal
- Skill tree UI, vault, scheduler
- Plus de bug de validation de niveau de pilier

---

### Plainte 4 — "ARTEMIS orchestration : locks, fallbacks, hooks"
**Statut : CORRIGE dans v4**

- `feedback-loop/index.ts` : 577 lignes, drift detection + replan
- `knowledge-capture/index.ts` : 174+ lignes, events sur transitions
- `mestor/index.ts` : 300+ lignes, Claude API + context enrichment
- Governance coordinators pour les 4 cerveaux (Notoria, Seshat, Mestor, Artemis)

---

## 2. BUG CRITIQUE — 1402 ERREURS TYPESCRIPT

**Impact** : Le build Next.js echouera en production.

### Cause racine
Le schema Prisma (118 modeles) ne contient pas encore ~30 modeles/champs references dans le code applicatif. Ce sont des modeles prevus pour v5 :

| Modele/Champ manquant | Occurrences | Fichiers touches |
|------------------------|-------------|------------------|
| `deal` | 42 | crm-engine, quick-intake, campaign-manager |
| `budget` | 36 | financial-brain, campaign-budget-engine |
| `recommendation` | 32 | notoria, pillar-gateway, mestor |
| `brandDataSource` | 32 | ingestion-pipeline, connectors |
| `assigneeId` | 31 | mission, campaign, brief-ingest |
| `state` (Campaign) | 29 | campaign-manager, social, media-buying |
| `validationStatus` (Pillar) | 20 | pillar-maturity, boot-sequence |
| `externalConnector` | 20 | advertis-connectors |
| `superfanProfile` | 18 | cult-index-engine, devotion-engine |
| `scoreSnapshot` | 17 | analytics, cockpit |

**+ 321 erreurs `TS7006`** : parametres implicitement `any` dans les pages agency/cockpit (manque de typage).

### Action requise
1. **Option A (recommandee)** : Ajouter les modeles manquants au schema Prisma pour aligner code ↔ DB
2. **Option B** : Stubber les services qui referencent des modeles inexistants (plus rapide, moins propre)
3. Les 321 erreurs `any` se corrigent avec des annotations de type explicites

---

## 3. FONCTIONNALITES A IMPLEMENTER

### P0 — Critique (bloquant pour le funnel)

#### 3.1 Paywall sur la page de resultat intake
- Integration CinetPay (Afrique) + Stripe/PayPal (international)
- Apercu gratuit : score composite + radar + forces/faiblesses (deja present)
- Contenu payant : audit ADVE detaille + reco RTIS + PDF telechargemeable
- Prix suggere : 5 000 - 25 000 FCFA selon le marche
- Fichiers a modifier : `src/app/(intake)/intake/[token]/result/page.tsx`

#### 3.2 Audit ADVE + Reco RTIS dans le resultat
- Generer un diagnostic structure par pilier (pas juste "forces/faiblesses")
- Reco legere RTIS : 2-3 actions prioritaires derivees des gaps ADVE
- Le service `notoria/engine.ts` (487 lignes) et `notoria/intake.ts` (209 lignes) existent — il faut les cabler dans le flow `complete()`
- Fichiers a modifier : `src/server/services/quick-intake/index.ts`, result page

#### 3.3 Follow-up CTA fonctionnels
- Remplacer les `mailto:` par de vrais endpoints (booking, onboarding, contact form)
- "Passer a IMPULSION" → onboarding flow (existe dans `onboarding` router)
- "Telecharger le rapport" → behind paywall
- "Partager mon score" → lien shareable (shareToken existe deja)

### P1 — Important (experience utilisateur)

#### 3.4 Corriger les 1402 erreurs TypeScript
- Aligner le schema Prisma avec le code (ajouter les ~30 modeles manquants)
- Typer les parametres `any` dans les pages agency/cockpit
- Objectif : `npx tsc --noEmit` = 0 erreurs

#### 3.5 Notoria cablage complet
- `notoria-page.tsx` (523 lignes) et `jehuty-feed-page.tsx` (310 lignes) existent en tant que composants
- Les routes cockpit existent (`/cockpit/brand/notoria`, `/cockpit/brand/jehuty`)
- Verifier que les tRPC routers `notoria.ts` (451 lignes) et `jehuty.ts` (307 lignes) sont bien enregistres dans `router.ts`
- Tester le flow complet : recommendations → apply → pillar update

#### 3.6 Seed data coherente
- `seed.ts`, `seed-demo.ts`, `seed-e2e.ts` referencent des modeles Prisma inexistants
- Aligner apres correction du schema (3.4)

### P2 — Amelioration

#### 3.7 Landing page
- Les composants existent (hero, navbar, pricing, FAQ, footer, social-proof, etc.)
- `src/app/page.tsx` a ete simplifie (246 → moins) — verifier qu'il assemble bien les composants landing

#### 3.8 LLM fallback robuste
- `llm-gateway/index.ts` supporte Anthropic + OpenAI
- Verifier la cascade de fallback quand pas de cle API
- Le smoke test (`tests/integration/llm-smoke.test.ts`) echoue sans cle — normal, mais le scoring intake doit survivre sans LLM

#### 3.9 Connectors externes
- Monday.com et Zoho adapters existent (289 + 225 lignes)
- MCP advertis-inbound endpoint existe
- Aucun n'est teste — ajouter des tests unitaires

---

## 4. ARCHITECTURE A CONNAITRE

```
src/
├── app/
│   ├── (intake)/     → Funnel public (landing → questionnaire → resultat)
│   ├── (cockpit)/    → Brand OS client (20 pages, Notoria, Jehuty)
│   ├── (console)/    → Industry OS operateur (50+ pages, 8 divisions)
│   ├── (agency)/     → Portail agence (clients, campagnes, revenue)
│   ├── (creator)/    → Portail createur (missions, QC, earnings)
│   └── (auth)/       → Login / Register
├── server/
│   ├── services/     → 40+ services metier
│   │   ├── notoria/      → 7 fichiers, recommendation engine
│   │   ├── jehuty/       → 2 fichiers, intelligence feed
│   │   ├── artemis/      → 11 fichiers, campaign orchestration
│   │   ├── mestor/       → 8 fichiers, decision support + LLM
│   │   ├── seshat/       → intelligence, signals, knowledge
│   │   └── financial-brain/ → 29 fichiers, budget deterministe
│   ├── mcp/          → 9 MCP servers (guild, notoria, artemis, etc.)
│   └── trpc/
│       ├── router.ts → 70 routers enregistres
│       └── routers/  → un fichier par domaine
└── lib/
    └── types/        → advertis-vector, business-context, pillar-schemas, variable-bible
```

---

## 5. COMMANDES DE VERIFICATION

```bash
# Cloner le repo canonique
git clone https://github.com/xtincell/ADVE-project.git
cd ADVE-project

# Installer
npm install

# Valider Prisma
npx prisma validate

# Lancer les tests (672 attendus)
npx vitest run

# Checker TypeScript (1402 erreurs attendues — a corriger)
npx tsc --noEmit 2>&1 | grep -v "^prisma/" | grep -v "^scripts/" | wc -l

# Dev server
npx next dev --turbopack
```

---

## 6. VARIABLES D'ENVIRONNEMENT REQUISES

```env
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...          # Pour LLM (scoring intake, Mestor, Notoria)
OPENAI_API_KEY=sk-...                 # Fallback LLM
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
# CINETPAY_API_KEY=...                # A configurer pour paywall
# STRIPE_SECRET_KEY=...               # A configurer pour paywall
```
