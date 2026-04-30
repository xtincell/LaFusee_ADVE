GOVERNANCE NETERU — Politique (draft)
===================================

Version: 0.2 — 2026-04-30 (extension Ptah)

Objectif
--------
Décrire une politique opérationnelle et technique pour gouverner les recommandations produites par
NETERU (Mestor / Artemis / Seshat / **Ptah**) : traçabilité, sécurité, qualité, contrôle humain et observabilité.

Portée
------
S'applique à toutes les sorties automatisées étiquetées `recommendation`, `reco`, `rtis`, `oracle`,
`creative_output`, `asset` ou produites par les sequences GLORY orchestrées par Artemis et/ou Mestor,
ainsi que par les pipelines Ptah branchés sur l'API Magnific. Ne couvre pas les opérations bas niveau
infra (deploy, infra-as-code) mais couvre les intégrations (campaign-manager, driver-engine, vault,
feedback-loop, magnific-gateway).

Principes
---------
- Séparation des rôles : `Mestor` (décision), `Artemis` (orchestration), `Seshat` (observation),
  `Ptah` (production créative). La gouvernance est une couche transverse (policy + humains).  
- Provenance obligatoire : toute reco porte sa source, sa confiance, et un snapshot d'entrée.  
- Minimal Safe‑Action : bloquer automatiquement les actions destructrices sans approbation.  
- Transparence & Explainability : résumé court (top‑3 raisons) attaché à chaque reco.  
- Mesurabilité : KPIs et alertes pour suivre dérives et impacts.  
- Least Privilege : séparation des droits (read vs suggest vs approve vs apply).

Métadonnées obligatoires (schéma minimal)
----------------------------------------
Chaque recommandation persistée doit contenir au moins :

- `id` : uuid
- `ts` : timestamp
- `agent` : `Mestor` | `Artemis` | `GLORY_TOOL` | `Human`
- `sequenceKey` (si applicable)
- `modelVersion` : string (LLM/tool version)
- `inputSnapshotRef` : reference to stored input state (vault/db id)
- `confidence` : 0.0-1.0
- `source` : `vault` | `manual` | `external` | `derived`
- `variablesUsed` : [string]
- `changeType` : `SET` | `PATCH` | `UPSERT` | `ACTION`
- `destructive` : boolean
- `explain` : short text (1-3 lignes)
- `applyPolicy` : `auto` | `suggest` | `requires_review`

Quality Gates (automatiques)
----------------------------
- Gate: Confidence
  - `confidence >= 0.7` → suggestion auto‑appliquée si `applyPolicy=auto` et non destructive.
  - `0.5 <= confidence < 0.7` → require human review before apply.
  - `confidence < 0.5` → block / do not apply; store as draft for inspection.

- Gate: Destructive changes
  - Toute reco avec `destructive=true` nécessite 2 approbations humaines (Operator + Strategy Governor)
    avant application.

- Gate: Financial validation
  - Toute reco modifiant budgets/prix passe par `financial-brain.validateFinancials(...)` et doit
    satisfaire les règles (BLOCK/WARN/INFORM) avant application.

- Gate: External data freshness
  - Si `source=external` et `source.ts` > X jours (configurable), re-validation manuelle requise.

- Gate: PII / Compliance
  - Les sorties contenant PII doivent être redacted avant exposition et stockées selon la politique GDPR/Local.

Rôles et responsabilités
------------------------
- Strategy Governor (propriétaire de la policy) : valide seuils, approbations, SLA.  
- Model Steward : versioning des LLMs, contrôle retrain, rollback.  
- Protocol Owner (Artemis lead) : maintient sequences, quality gates, tests.  
- Operator / Fixer : exécute revues, applique recos après approbation.  
- Auditor / Compliance : audits périodiques, revue logs immuables.  
- Platform Owner : métriques, dashboards, alerting (feedback-loop).

Cycle de vie d'une recommandation (extrait)
-------------------------------------------
1. Génération : `Mestor` / `Artemis` produit une reco avec métadonnées obligatoires.
2. Évaluation automatique : middleware de gating exécute toutes les gates (confidence, financial, PII...).
3. Explainability : on génère un résumé `explain` attaché.  
4. Approval path : selon `applyPolicy` et flags, envoyer au ou aux humains désignés.  
5. Application : application atomique + log immuable (audit id).  
6. Observabilité : feedback collecté via `feedback-loop` (metrics, success, revert).  

Observabilité & KPIs
--------------------
- Recommendation Acceptance Rate (par agent, par sequence)
- Revert Rate (applied → reverted dans les 30 jours)
- Time to Approve (median)
- Confidence distribution (histogram)
- Business impact signals (A/B, lift après 7/30/90 jours)
- Model drift alerts (confidence drop / input distribution shift)

Stockage & audit trail
----------------------
- Logs immuables (jsonl) : conserver `inputSnapshotRef`, `modelVersion`, `applyTrace`.
- Vault: store external sources with provenance (SOURCES, date, confidence). Voir pattern `financial-brain/benchmarks`.

Versioning, Testing et Déploiement
---------------------------------
- Tagger `modelVersion` et dataset snapshot à chaque release modèle.
- Canary : dry‑run sur X% des stratégies (configurable) avant full apply.
- Backout : chaque change appliqué contient un `rollbackPlan` accessible via audit id.

Checklist d'implémentation (roadmap priorisée)
---------------------------------------------
1. Mandater métadonnées obligatoires et valider leur présence dans les sorties Mestor/Artemis.  
2. Implémenter middleware de gating dans `rtis-cascade` pour bloquer/appliquer selon règles.  
3. Intégrer appel `financial-brain/validateFinancials` pour tout changement financier.  
4. Ajouter stockage d'audit immuable (`logs/reco-execution.jsonl` ou table DB).  
5. Exposer KPIs dans `feedback-loop` + dashboard (alertes).  
6. Lancer canary + mesurer acceptance/revert + itérer politique.

Exemples de règles rapides
--------------------------
- Budget recommendation: call to `financial-brain.validateFinancials(...)` required.  
- Persona SET on `d.personas`: `destructive=true` so 2 approvals required.  
- Asset Magnific généré sur campagne `humanOnly=true` avec `classifierScore.ai > 0.5` → BLOCK.
- Toute génération Ptah > 1 EUR estimée → cost gate Thot avec review humaine.

Extension Ptah (production créative)
-------------------------------------
Politique spécifique aux sorties générées via Magnific (image, vidéo, audio, icônes). Détail complet
dans `PTAH-NETERU.md`, résumé ici :

### Métadonnées additionnelles obligatoires

En plus du schéma minimal recommendation, tout `CreativeOutput` doit porter :

- `taskId` (Magnific), `model`, `modelVersion`, `seed`
- `prompt` (final, après improve-prompt) + `promptOriginal`
- `inputs[]` : tableau de refs (URL ou base64 hash) avec type
- `costEstimateEUR` + `costActualEUR`
- `cdnUrl` (URL durable post asset-cdn-bridge) + `expiresAt` (T+12h Magnific)
- `classifierScore` (AI vs not_ai) + `brandFidelityScore`
- `rights` : `commercial` | `editorial` | `research`
- `triggeredBy` : `{ agent, ref }`

### Quality Gates additionnelles

| Gate | Action si fail |
|------|----------------|
| G1 Cost gate (`creative-cost-tracker.estimate <= remaining(budgetLine)`) | BLOCK + alerte Thot |
| G2 Bible gate (variables marque obligatoires injectées) | WARN + continue |
| G3 Concurrency gate (rate-limit Magnific par modèle) | QUEUE |
| G4 Resolution gate (output >= spec.minDimensions) | BLOCK avant livraison |
| G5 IP safety gate (input utilisateur, AI Classifier) | WARN |
| G6 Human-only gate (campagne flag, AI score > 0.5) | BLOCK + escalade |
| G7 Brand fidelity gate (similarité avec BrandAsset references < 0.6) | BLOCK |
| G8 Webhook integrity gate (signature HMAC + task_id connu) | DROP silencieux + log |

### Apply Policy spécifique aux assets

| Cas | Policy |
|-----|--------|
| Asset stock (Magnific 250M+) téléchargé via stock-discovery | `auto` (commercial license validée) |
| Asset généré IA, campagne sans contrainte | `suggest` |
| Asset généré IA, campagne `humanOnly=true` | `requires_review` |
| Asset issu de Style Transfer / Relight d'un BrandAsset | `auto` si fidelity >= 0.8, sinon `suggest` |
| Asset > 5 EUR de coût unitaire | `requires_review` (operator + budget owner) |

### Audit trail créatif

- Log immuable `logs/ptah-execution.jsonl` : un événement par appel Magnific
  (CREATED, IN_PROGRESS, COMPLETED, FAILED, CDN_INGESTED, GATE_REJECTED)
- Conservation 90 jours des inputs (URL ou hash base64) pour reproductibilité
- Lien `CreativeOutput.id ↔ AICostLog.id ↔ KnowledgeEntry.id` pour traçabilité
  bout-en-bout

### Ownership Ptah

- **Production Lead** (Ptah governor) : valide modèles utilisés, seuils coût,
  policy par campagne
- **Creative Director** : valide brand-fidelity threshold + références BrandAsset
- **Cost Owner (Thot)** : valide cap par campagne + alertes seuils
- **Operator** : revue manuelle des assets en `requires_review`

Prochaine étape proposée
-----------------------
- Si d'accord : générer PR minimal qui (a) ajoute la validation des métadonnées et (b) installe le middleware
  de gate dans `src/server/services/mestor/rtis-cascade.ts` pour la gate `confidence`.  

Contact / ownership
-------------------
Policy owner: Strategy Governor (à définir) — pour questions et changements de seuils.

---
Fin du draft.
