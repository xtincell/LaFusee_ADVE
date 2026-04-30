PTAH — 4eme Neter (Production Creative)
========================================

Version: 0.1 — 2026-04-30
Branche: claude/neteru-governance-setup-SscHC

---

POURQUOI UN 4eme NETER
----------------------

Le trio actuel (Mestor decision / Artemis orchestration / Seshat observation) ne
contient pas de cerveau dedie a la **fabrication des assets**. Aujourd'hui, la
production creative est dispersee :

- glory-tools (sequences) genere du contenu mais reste un outil d'Artemis
- driver-engine traduit des briefs sans produire d'image / video / audio
- asset-tagger annote des assets existants (Seshat) mais ne les fabrique pas
- aucun service ne gouverne le cout, la qualite et la provenance des outputs
  generatifs

Avec la dispo de l'API Magnific (39+ modeles image, 25+ modeles video, audio,
icones, stock 250M+, MCP remote), on a besoin d'un **gouverneur dedie** :

> **Ptah** — patron des artisans, dieu de la creation par la main et le verbe.
> Il fabrique. Il ne decide pas (Mestor), il ne planifie pas (Artemis), il
> n'observe pas (Seshat). **Il execute la production**.

Position dans le pantheon :

| Neter | Verbe | Equivalent |
|-------|-------|------------|
| Mestor | Decider | Strategy lead |
| Artemis | Orchestrer | Protocol owner |
| Seshat | Observer | Intelligence lead |
| **Ptah** | **Fabriquer** | **Production lead** |
| Thot | Valider (cout) | Financial brain |

---

PERIMETRE DE PTAH
-----------------

### Ce que Ptah gouverne

1. **Generation d'assets** : image, video, audio, icones (via Magnific)
2. **Edition d'assets** : upscale, relight, style transfer, inpainting,
   outpainting, change camera, background removal
3. **Recherche stock** : 250M+ assets Magnific
4. **Pipelines creatifs** : enchainement multi-etapes (brief → KV → upscale →
   relight → output billboard)
5. **Cycle de vie de l'asset** : URL signee 12h → ingest CDN → metadata →
   archivage
6. **Cout par asset** : pre-flight estimate + post-execution actual
7. **Provenance** : tracage `prompt + modele + seed + sources` pour chaque
   livrable

### Ce que Ptah ne fait PAS

- Decider du brief creatif → **Mestor** + Artemis frameworks
- Orchestrer des sequences strategiques → **Artemis**
- Tagger / classifier les assets en aval → **Seshat** (asset-tagger)
- Valider les budgets globaux → **Thot** (financial-brain)
- Ecrire dans les piliers strategiques → **Pillar Gateway** (LOI 1)

---

SERVICES SOUS PTAH (proposition)
--------------------------------

10 services nouveaux + 2 absorbes / shims :

| Service | Role | Endpoint Magnific principal |
|---------|------|------------------------------|
| `magnific-gateway` | Abstraction REST + auth + retry + rate-limit | tous |
| `image-foundry` | Mystic / Flux / Imagen / Nano Banana / Seedream | /v1/ai/mystic, /v1/ai/flux*, /v1/ai/imagen* |
| `video-foundry` | Kling / WAN / Veo / PixVerse / Seedance / LTX / Runway | /v1/ai/kling*, /v1/ai/wan*, /v1/ai/veo* |
| `voice-foundry` | TTS, voice cloning, sound effects, lip sync, audio isolation | /v1/ai/text-to-speech, /v1/ai/sound-effects, /v1/ai/audio-isolation |
| `icon-foundry` | Text-to-icon (PNG / SVG, 5 styles) | /v1/ai/text-to-icon |
| `asset-refiner` | Upscale Creative + Precision, Relight, Style Transfer, Inpaint, Outpaint, Change Camera, Bg Removal | /v1/ai/image-upscaler, /v1/ai/image-relight, etc. |
| `prompt-foundry` | improve-prompt + image-to-prompt | /v1/ai/improve-prompt, /v1/ai/image-to-prompt |
| `stock-discovery` | Search 250M+ assets stock | /v1/icons, /v1/resources, /v1/photos |
| `asset-cdn-bridge` | Recupere les URL signees 12h → re-upload CDN durable | (interne) |
| `creative-cost-tracker` | Pre-flight cost estimate + post-execution reconciliation | (extension de ai-cost-tracker) |
| `magnific-mcp-bridge` | Expose Ptah via le MCP remote Magnific (search + generate) | api.magnific.com/mcp |
| `creative-quality-gate` | AI Classifier sur outputs + brand-fidelity check + IP safety | /v1/ai/classifier/image |

Services existants qui restent attaches a leur Neter actuel :

- `glory-tools` reste sous **Artemis** (orchestration des sequences) mais
  **delegue** la production a Ptah via `magnific-gateway`
- `asset-tagger` reste sous **Seshat** (observation post-production)
- `ai-cost-tracker` reste transversal mais Ptah ajoute son extension dediee

---

ARCHITECTURE TECHNIQUE
----------------------

### Couches

```
+------------------------------------------------------+
|  Artemis (sequences GLORY)  /  Mestor (briefs)       |
|       |                              |               |
|       v                              v               |
|  +-----------------------------------------+         |
|  |          PTAH ORCHESTRATION             |         |
|  |  - pipeline runner                      |         |
|  |  - quality gates                        |         |
|  |  - cost gate (-> Thot)                  |         |
|  +-----------------------------------------+         |
|       |                                              |
|       v                                              |
|  +-----------------------------------------+         |
|  |          magnific-gateway               |         |
|  |   (auth / retry / webhook / polling)    |         |
|  +-----------------------------------------+         |
|       |                                              |
|       v                                              |
|       Magnific REST API (api.magnific.com)           |
|                                                      |
+------------------------------------------------------+
       |                                              ^
       v                                              |
   asset-cdn-bridge ---> CDN durable -----------------+
                          |
                          v
                   asset-tagger (Seshat) -> KnowledgeEntry
```

### Flux nominal d'une generation

1. **Trigger** : Artemis sequence ou brief Mestor demande un asset
2. **Pre-flight** : `creative-cost-tracker.estimate(model, params)` retourne
   cout EUR
3. **Cost gate** : `financial-brain.validateFinancials({type: "creative",
   amount, budgetLineId})` → BLOCK / WARN / OK
4. **Bible enrichment** : `prompt-foundry.improvePrompt(prompt,
   variableBibleContext)` injecte les variables marque (positionnement, ton,
   couleur)
5. **Soumission** : `magnific-gateway.post(endpoint, payload)` avec `webhook_url`
6. **Persistence task** : insert `CreativeTask` row (`task_id`, `model`,
   `cost_estimate`, `status=CREATED`)
7. **Webhook reception** : `POST /api/webhooks/magnific` verifie signature et
   met a jour `CreativeTask`
8. **Asset ingestion** : `asset-cdn-bridge.fetch(signed_url)` → upload CDN
   durable, libere l'URL Magnific avant 12h
9. **Quality gate** : `creative-quality-gate.evaluate(asset)` → AI Classifier,
   resolution check, brand-fidelity score
10. **Hand-off Seshat** : emit `CREATIVE_OUTPUT_READY` → `asset-tagger` annote,
    `KnowledgeEntry` cree
11. **Cost reconcile** : `creative-cost-tracker.reconcile(task_id, actual_cost)`
12. **Hand-off Mestor** : emit signal vers Notoria si applicable (KV ready,
    nouveau visuel disponible)

### Webhooks vs polling

- **Production** : webhooks obligatoires sur tous les endpoints Magnific. URL
  unique `POST /api/webhooks/magnific` qui dispatche par `task_id`.
- **Dev / fallback** : polling 3-5s avec backoff exponentiel sur 503, max 5min
  avant timeout.
- **Verification** : signature HMAC sur header (a confirmer dans la doc
  Magnific) — sinon allowlist IP + token aleatoire injecte dans le
  `webhook_url`.

### Concurrence et rate-limit

- 3 requetes concurrentes max par user sur Kling Elements / 1.6 / 2.0 (doc)
- `magnific-gateway` maintient un **token bucket** par modele
- File d'attente locale (BullMQ ou Postgres LISTEN/NOTIFY) pour serialiser les
  pics
- Header `x-ratelimit-*` lu et expose en metriques

---

GOUVERNANCE PTAH (specifique)
------------------------------

Reprend les principes de `GOVERNANCE-NETERU.md` et **ajoute** :

### Metadonnees obligatoires d'un asset cree

```ts
type CreativeOutput = {
  id: string;                      // uuid interne
  taskId: string;                  // task_id Magnific
  model: string;                   // "mystic" | "kling-2.5-turbo-pro" | ...
  modelVersion: string;            // hash ou tag fournisseur si dispo
  prompt: string;                  // prompt final apres improve-prompt
  promptOriginal: string;          // prompt avant enrichment
  seed?: number;                   // 0-2147483647
  inputs: { type: "url" | "base64", ref: string }[];
  webhookEvents: { ts: string, event: string }[];
  costEstimateEUR: number;
  costActualEUR: number | null;
  cdnUrl: string | null;           // URL durable (post asset-cdn-bridge)
  expiresAt: string;               // URL Magnific T+12h
  classifierScore: { ai: number, not_ai: number } | null;
  brandFidelityScore: number | null;
  rights: "commercial" | "editorial" | "research";
  triggeredBy: { agent: "Mestor" | "Artemis" | "Human", ref: string };
  destructive: false;              // asset gen n'est jamais destructive
};
```

### Quality Gates Ptah

| Gate | Regle | Action si fail |
|------|-------|----------------|
| **G1 Cost gate** | `costEstimate <= remaining(budgetLine)` | BLOCK + alerte Thot |
| **G2 Bible gate** | prompt enrichi contient variables marque obligatoires (`brandTone`, `colorPalette`) | WARN + continue |
| **G3 Concurrency gate** | `inflight(model) < limit(model)` | QUEUE (ne bloque pas) |
| **G4 Resolution gate** | `output.dimensions >= spec.minDimensions` | BLOCK avant livraison |
| **G5 IP safety gate** | si `inputs[].ref` est une image fournie utilisateur, `image-classifier(input).ai > 0.95` → log + tag mais ne bloque pas | WARN |
| **G6 Human-only gate** | si campagne flag `humanOnly=true`, output `classifierScore.ai > 0.5` → BLOCK | BLOCK + escalade |
| **G7 Brand fidelity gate** | si style transfer ou prompt-driven, calcul similarite avec BrandAsset references | BLOCK si < 0.6 |
| **G8 Webhook integrity gate** | signature HMAC valide + `task_id` connu | DROP silencieux + log audit |

### Coverage et budget par campagne

Chaque campagne expose un **plafond creatif Magnific** :

```ts
type CampaignCreativeBudget = {
  campaignId: string;
  capEUR: number;                  // cap mensuel ou par campagne
  spentEUR: number;
  reservedEUR: number;             // pre-flight estimates non finalises
  alertThresholds: [50, 80, 95];   // % du cap → notification
};
```

`creative-cost-tracker` met a jour `spent` apres reconciliation et publie un
signal `CREATIVE_BUDGET_THRESHOLD` vers Jehuty quand un seuil est franchi.

### Provenance et audit

Toute generation est auditable :

- Log immuable JSONL `logs/ptah-execution.jsonl` (un fichier par jour, rotation)
- Lien `CreativeOutput.id ↔ AICostLog ↔ KnowledgeEntry`
- Conservation 90 jours des inputs (URL ou base64 hash) pour reproductibilite
- Archivage des outputs sur CDN durable (12h Magnific → permanent)

### Politique de retry

- Echec reseau / 503 : retry avec backoff exponentiel 2s / 4s / 8s / 16s, max 4
- Echec Magnific (FAILED status) : ne pas retry automatiquement → escalade
  Operator
- Echec quality gate G4 / G7 : retry **avec parametres ajustes** (resolution
  superieure, prompt resserre) max 2 tentatives

---

CONNEXIONS ENTRE NETERU (mise a jour)
--------------------------------------

Nouveaux liens introduits par Ptah :

```
Artemis sequences -> Ptah : invoke generate / refine
Mestor briefs -> Ptah : pipeline-orchestrator declenche pipeline creatif
Ptah -> Thot : creative-cost-tracker.estimate avant chaque generation
Ptah -> Seshat : CREATIVE_OUTPUT_READY -> asset-tagger -> KnowledgeEntry
Ptah -> Jehuty : signal NEW_KV_AVAILABLE / CREATIVE_BUDGET_THRESHOLD
Bible -> Ptah : prompt-foundry charge variables marque obligatoires
Pillar Gateway -> Ptah : un asset ne s'ecrit JAMAIS dans un pilier sans
                        passer par Gateway (LOI 1 preservee)
```

---

INTEGRATION MAGNIFIC MCP
------------------------

L'API Magnific expose un MCP remote a `https://api.magnific.com/mcp`.

Decision : **on l'integre comme client interne**, pas comme expose externe.

- `magnific-mcp-bridge` instancie un client MCP qui pointe vers le remote
  Magnific
- Tools exposes (search, generate, classify) sont consommes par les autres
  services Ptah comme une **API alternative** plus haut niveau que REST direct
- Avantage : moins de surface code custom, alignement avec le protocole
  Anthropic / Claude Desktop, evolutions Magnific suivies automatiquement
- Inconvenient : moins de controle granulaire (rate-limit, cost) -> on garde
  `magnific-gateway` REST en chemin principal et le MCP en chemin secondaire
  pour les outils interactifs (Console operateur, Claude desktop dev)

---

PRICING ET BUDGETISATION
------------------------

Cas concret deja documente : campagne KV Bonnet Rouge

| Etape | Modele | Cout unitaire | Volume | Total EUR |
|-------|--------|---------------|--------|-----------|
| Generation KV | Nano Banana Pro | ~0.10 (estim) | 18 visuels | 1.80 |
| Upscale 8x | Magnific Creative | 0.50 | 18 | 9.00 |
| Relight golden hour | Magnific Relight | 0.10 | 18 | 1.80 |
| **Total campagne** | | | | **~12.60** |

`creative-cost-tracker` doit **pre-calculer** ce budget AVANT lancement et le
soumettre a Thot pour validation. Toute deviation > 10% post-execution
declenche un signal `COST_DEVIATION` vers Jehuty.

---

ROADMAP PTAH (3 jalons)
------------------------

### Jalon 1 — Foundation (semaine 1-2)
- [ ] `magnific-gateway` : auth, retry, webhook handler, signature verify
- [ ] `creative-cost-tracker` : pricing table 39+ modeles image + 25+ video
- [ ] Modele Prisma `CreativeTask` + `CreativeOutput` + `CampaignCreativeBudget`
- [ ] Endpoint `POST /api/webhooks/magnific` avec signature check
- [ ] Tests unitaires gateway (mock fetch)

### Jalon 2 — Foundries (semaine 3-4)
- [ ] `image-foundry` : 5 modeles prioritaires (Mystic, Nano Banana Pro,
      Flux.2 Pro, Imagen 4 Ultra, Seedream 4)
- [ ] `asset-refiner` : Upscale Creative, Relight, Style Transfer, Change
      Camera, Bg Removal
- [ ] `prompt-foundry` : improve-prompt + Bible injection
- [ ] `asset-cdn-bridge` : ingestion automatique 12h
- [ ] Pipeline KV Bonnet Rouge end-to-end (generation → upscale → relight →
      tagging Seshat)

### Jalon 3 — Video / Audio / Apps API (semaine 5-7)
- [ ] `video-foundry` : Kling 3, Veo 3.1, LTX 2.0, MiniMax Live
- [ ] `voice-foundry` : TTS, sound effects, lip sync, audio isolation
- [ ] `icon-foundry` : 5 styles, PNG / SVG
- [ ] `magnific-mcp-bridge` : MCP client integre cote operateur
- [ ] (Enterprise) `apps-runner` : invocation Apps API Magnific Spaces

### Jalon 4 — Hardening (semaine 8)
- [ ] `creative-quality-gate` : AI Classifier, brand fidelity, resolution check
- [ ] Dashboards : cout par campagne, taux d'echec, latence par modele
- [ ] Alertes : threshold budget, drift modele, latence anormale
- [ ] Documentation operateur + runbook incidents

---

VARIABLES D'ENVIRONNEMENT REQUISES
----------------------------------

```env
MAGNIFIC_API_KEY=sk-mgn-...
MAGNIFIC_BASE_URL=https://api.magnific.com  # ou api.freepik.com pendant migration
MAGNIFIC_WEBHOOK_SECRET=...                 # signature HMAC
MAGNIFIC_WEBHOOK_PUBLIC_URL=https://app.lafusee.io/api/webhooks/magnific
PTAH_CDN_BUCKET=lafusee-creative-assets
PTAH_CDN_REGION=eu-west-3
PTAH_BUDGET_DEFAULT_EUR=50                  # cap par campagne par defaut
```

---

DECISIONS OUVERTES (a trancher)
-------------------------------

1. **Plan Magnific** : Standard / Premium / Enterprise ? Enterprise debloque
   Apps API → fortement recommande pour pipelines reutilisables (Spaces).
2. **Storage CDN** : reutiliser le CDN existant (S3 + Cloudfront ?) ou
   provisionner un bucket dedie ?
3. **Politique IP** : accepter les inputs utilisateur sans verification ou
   imposer un AI Classifier prealable ?
4. **Signature webhook** : verifier la doc Magnific actuelle pour le mecanisme
   exact (HMAC body, header `x-magnific-signature`, etc.)
5. **MCP exposure** : exposer Ptah lui-meme comme MCP server pour Claude
   Desktop operateur, en complement du MCP Magnific remote ?
6. **Migration freepik → magnific** : on default sur `api.magnific.com` ou on
   reste sur `api.freepik.com` pendant les 6 mois de cohabitation ?

---

REFERENCES
----------

- Doc Magnific : https://docs.freepik.com (et docs.magnific.com)
- Doc rebrand : avril 2026, cohabitation 6 mois
- LLM-friendly : https://docs.freepik.com/llms.txt
- MCP repo : https://github.com/freepik-company/freepik-mcp
- Discord dev : https://discord.com/invite/znXUEBkqM7
- Architecture interne : ARCHITECTURE-NETERU.md
- Politique transverse : GOVERNANCE-NETERU.md
- Plan global : HANDOFF-PLAN.md

---

Fin du document.
