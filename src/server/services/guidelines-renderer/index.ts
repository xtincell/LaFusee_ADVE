import { db } from "@/lib/db";
import { PILLAR_NAMES, type PillarKey } from "@/lib/types/advertis-vector";

interface GuidelinesDocument {
  strategyId: string;
  title: string;
  generatedAt: string;
  sections: GuidelinesSection[];
  score: Record<string, unknown> | null;
  classification: string;
}

interface GuidelinesSection {
  pillar: PillarKey;
  pillarName: string;
  content: Record<string, unknown>;
  score: number;
  confidence: number;
}

/**
 * Generates a structured brand guidelines document from strategy ADVE profile.
 */
export async function generate(strategyId: string): Promise<GuidelinesDocument> {
  const strategy = await db.strategy.findUniqueOrThrow({
    where: { id: strategyId },
    include: {
      pillars: true,
      drivers: { where: { deletedAt: null } },
      brandAssets: true,
    },
  });

  const vector = strategy.advertis_vector as Record<string, number> | null;

  const sections: GuidelinesSection[] = [];
  for (const pillar of ["a", "d", "v", "e", "r", "t", "i", "s"] as PillarKey[]) {
    const pillarContent = strategy.pillars.find((p) => p.key === pillar);
    sections.push({
      pillar,
      pillarName: PILLAR_NAMES[pillar],
      content: (pillarContent?.content as Record<string, unknown>) ?? {},
      score: vector?.[pillar] ?? 0,
      confidence: pillarContent?.confidence ?? 0,
    });
  }

  const composite = vector ? Object.entries(vector)
    .filter(([k]) => ["a", "d", "v", "e", "r", "t", "i", "s"].includes(k))
    .reduce((sum, [, v]) => sum + (v as number), 0) : 0;

  let classification = "ZOMBIE";
  if (composite > 180) classification = "ICONE";
  else if (composite > 160) classification = "CULTE";
  else if (composite > 120) classification = "FORTE";
  else if (composite > 80) classification = "ORDINAIRE";

  return {
    strategyId,
    title: `Guidelines de marque — ${strategy.name}`,
    generatedAt: new Date().toISOString(),
    sections,
    score: vector,
    classification,
  };
}

/**
 * Export guidelines as HTML string.
 */
export async function exportHtml(strategyId: string): Promise<string> {
  const doc = await generate(strategyId);

  let html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${doc.title}</title>
<style>body{font-family:system-ui;max-width:800px;margin:0 auto;padding:2rem;color:#1a1a1a}
h1{color:#6C3CE0}h2{color:#333;border-bottom:2px solid #6C3CE0;padding-bottom:0.5rem}
.score{font-size:2rem;font-weight:bold;color:#6C3CE0}.section{margin:2rem 0;padding:1rem;border:1px solid #eee;border-radius:8px}
.pillar-score{display:inline-block;padding:0.25rem 0.75rem;background:#f0e6ff;border-radius:4px;font-weight:600}</style></head>
<body><h1>${doc.title}</h1>
<p>Généré le ${new Date(doc.generatedAt).toLocaleDateString("fr-FR")}</p>
<div class="score">${doc.score ? (doc.score as any).composite ?? 0 : 0}/200 — ${doc.classification}</div>`;

  for (const section of doc.sections) {
    html += `<div class="section"><h2>${section.pillarName}</h2>
<span class="pillar-score">${section.score.toFixed(1)}/25</span>
<pre>${JSON.stringify(section.content, null, 2)}</pre></div>`;
  }

  html += `</body></html>`;
  return html;
}

/**
 * Export guidelines as PDF (placeholder — returns HTML for now).
 */
export async function exportPdf(strategyId: string): Promise<string> {
  // TODO: Use puppeteer or similar for actual PDF generation
  return exportHtml(strategyId);
}
