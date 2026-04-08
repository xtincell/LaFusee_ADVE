/**
 * VAULT ENRICHMENT — Scan du vault BrandDataSource pour enrichir les piliers
 *
 * Le vault contient TOUTES les données brutes de la marque :
 *   - Résultats d'intake (formulaire)
 *   - Notes manuelles de l'opérateur
 *   - Documents uploadés (PDF, DOCX parsés)
 *   - Données CRM synchronisées
 *
 * Le bouton "Enrichir" charge TOUT le vault, scanne TOUTES les variables
 * du pilier ciblé, et produit des recommandations :
 *   - CONFIRMER : la source valide la valeur actuelle
 *   - CHALLENGER : la source suggère une alternative
 *   - INFIRMER : la source contredit la valeur actuelle
 *   - AJOUTER : la source contient une info absente du pilier
 *
 * Traitement ON-DEMAND (pas automatique) pour charger le contexte complet.
 */

import { db } from "@/lib/db";
import { PILLAR_SCHEMAS } from "@/lib/types/pillar-schemas";
import { callLLMAndParse } from "@/server/services/utils/llm";
import type { PillarKey } from "@/lib/types/advertis-vector";
import type { Prisma } from "@prisma/client";

// ── Types ──────────────────────────────────────────────────────────────

export interface VaultRecommendation {
  field: string;
  operation: "SET" | "ADD" | "MODIFY" | "REMOVE" | "EXTEND";
  currentSummary: string;
  proposedValue: unknown;
  targetMatch?: { key: string; value: string };
  justification: string;
  source: "VAULT";
  impact: "LOW" | "MEDIUM" | "HIGH";
  verdict: "CONFIRM" | "CHALLENGE" | "INFIRM" | "ADD";
}

export interface VaultEnrichmentResult {
  pillarKey: string;
  recommendations: VaultRecommendation[];
  vaultSize: number; // nombre de sources chargées
  error?: string;
}

// ── Load full vault ───────────────────────────────────────────────────

async function loadVault(strategyId: string): Promise<{ text: string; sourceCount: number }> {
  const sources = await db.brandDataSource.findMany({
    where: {
      strategyId,
      processingStatus: { in: ["EXTRACTED", "PROCESSED"] },
    },
    select: {
      fileName: true,
      sourceType: true,
      rawContent: true,
      rawData: true,
      extractedFields: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (sources.length === 0) return { text: "", sourceCount: 0 };

  // Compile ALL sources into a single context block
  const blocks: string[] = [];
  for (const source of sources) {
    const header = `[SOURCE: ${source.fileName ?? source.sourceType} — ${source.createdAt.toLocaleDateString("fr")}]`;

    const parts: string[] = [header];

    // Raw text content (intake answers, notes, parsed documents)
    if (source.rawContent) {
      parts.push(source.rawContent);
    }

    // Structured extracted fields
    if (source.extractedFields && typeof source.extractedFields === "object") {
      const fields = source.extractedFields as Record<string, unknown>;
      const fieldLines = Object.entries(fields)
        .filter(([, v]) => v != null && v !== "")
        .map(([k, v]) => `  ${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`);
      if (fieldLines.length > 0) {
        parts.push("Champs extraits:\n" + fieldLines.join("\n"));
      }
    }

    // Raw data (JSON responses)
    if (source.rawData && typeof source.rawData === "object" && !source.rawContent) {
      const data = source.rawData as Record<string, unknown>;
      const dataLines = Object.entries(data)
        .filter(([, v]) => v != null && v !== "")
        .slice(0, 30) // Limit to avoid token overflow
        .map(([k, v]) => `  ${k}: ${typeof v === "string" ? v.slice(0, 200) : JSON.stringify(v).slice(0, 200)}`);
      if (dataLines.length > 0) {
        parts.push("Donnees:\n" + dataLines.join("\n"));
      }
    }

    blocks.push(parts.join("\n"));
  }

  return { text: blocks.join("\n\n---\n\n"), sourceCount: sources.length };
}

// ── Describe schema fields ────────────────────────────────────────────

function describeSchemaFields(pillarKey: string): string {
  const schemaKey = pillarKey.toUpperCase() as keyof typeof PILLAR_SCHEMAS;
  const schema = PILLAR_SCHEMAS[schemaKey];
  if (!schema) return "Schema non disponible";

  const shape = (schema as { shape?: Record<string, unknown> }).shape ?? {};
  return Object.keys(shape).map(k => `- ${k}`).join("\n");
}

// ── Main API ──────────────────────────────────────────────────────────

/**
 * Scan the full vault and produce recommendations for a specific pillar.
 * Loads ALL BrandDataSource → compares against current pillar content →
 * produces per-field recommendations (CONFIRM/CHALLENGE/INFIRM/ADD).
 */
export async function enrichFromVault(
  strategyId: string,
  pillarKey: PillarKey,
): Promise<VaultEnrichmentResult> {
  try {
    // 1. Load full vault
    const { text: vaultText, sourceCount } = await loadVault(strategyId);

    if (sourceCount === 0) {
      return {
        pillarKey,
        recommendations: [],
        vaultSize: 0,
        error: "Aucune source dans le vault. Ajoutez des notes ou documents dans l'onglet Sources.",
      };
    }

    // 2. Load current pillar content
    const pillar = await db.pillar.findUnique({
      where: { strategyId_key: { strategyId, key: pillarKey } },
    });
    const currentContent = (pillar?.content ?? {}) as Record<string, unknown>;

    // 3. Load all other pillars for cross-context
    const allPillars = await db.pillar.findMany({ where: { strategyId } });
    const otherPillarsContext = allPillars
      .filter(p => p.key !== pillarKey)
      .map(p => `[${p.key.toUpperCase()}] ${JSON.stringify(p.content, null, 2).slice(0, 1000)}`)
      .join("\n\n");

    // 4. Get schema fields for this pillar
    const schemaFields = describeSchemaFields(pillarKey);

    // 5. Mestor scans vault vs current content → produces recos
    const result = await callLLMAndParse({
      system: `Tu es le Commandant MESTOR. On te donne :
1. Le VAULT complet de la marque (toutes les sources brutes : notes, intake, documents)
2. Le contenu ACTUEL du pilier ${pillarKey.toUpperCase()}
3. Les VARIABLES ATTENDUES du pilier (schema)
4. Le contexte des autres piliers

Pour CHAQUE variable du pilier, analyse le vault et determine :
- CONFIRM : le vault valide la valeur actuelle (cite la source)
- CHALLENGE : le vault suggere une meilleure valeur ou une nuance (propose la modification)
- INFIRM : le vault contredit la valeur actuelle (propose le remplacement)
- ADD : le vault contient une info qui n'est pas dans le pilier (propose l'ajout)

Ne propose QUE ce que le vault JUSTIFIE. Ne fabrique pas d'informations.
Chaque reco doit citer la source du vault qui la motive.

Retourne un JSON array de recommandations avec :
- field: le nom du champ
- operation: SET | ADD | MODIFY | REMOVE | EXTEND
- currentSummary: resume de la valeur actuelle (20 mots max)
- proposedValue: la nouvelle valeur (respecte le type attendu)
- justification: pourquoi, en citant la source du vault
- impact: LOW | MEDIUM | HIGH
- verdict: CONFIRM | CHALLENGE | INFIRM | ADD`,
      prompt: `=== VAULT DE LA MARQUE (${sourceCount} sources) ===
${vaultText.slice(0, 12000)}

=== PILIER ${pillarKey.toUpperCase()} — CONTENU ACTUEL ===
${JSON.stringify(currentContent, null, 2).slice(0, 4000)}

=== VARIABLES ATTENDUES DU PILIER ${pillarKey.toUpperCase()} ===
${schemaFields}

=== CONTEXTE AUTRES PILIERS ===
${otherPillarsContext.slice(0, 3000)}

Produis les recommandations d'enrichissement basees sur le vault.
Ne propose RIEN qui ne soit pas justifie par une source du vault.`,
      maxTokens: 6000,
      strategyId,
    }, `vault-enrichment:${pillarKey}`);

    const recos = (Array.isArray(result) ? result : (result as Record<string, unknown>).recommendations ?? []) as VaultRecommendation[];

    // Tag all with source: "VAULT"
    for (const r of recos) {
      r.source = "VAULT";
    }

    // Store as pendingRecos on the pillar
    if (recos.length > 0) {
      await db.pillar.update({
        where: { strategyId_key: { strategyId, key: pillarKey } },
        data: { pendingRecos: recos as unknown as Prisma.InputJsonValue },
      });
    }

    return { pillarKey, recommendations: recos, vaultSize: sourceCount };
  } catch (err) {
    return {
      pillarKey,
      recommendations: [],
      vaultSize: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Scan vault for ALL 8 pillars at once. Returns summary of recos per pillar.
 */
export async function enrichAllFromVault(
  strategyId: string,
): Promise<Record<string, VaultEnrichmentResult>> {
  const results: Record<string, VaultEnrichmentResult> = {};

  for (const key of ["a", "d", "v", "e", "r", "t", "i", "s"] as PillarKey[]) {
    results[key] = await enrichFromVault(strategyId, key);
  }

  return results;
}
