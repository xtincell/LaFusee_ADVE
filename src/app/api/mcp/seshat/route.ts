import { NextResponse } from "next/server";
import * as seshatMcp from "@/server/mcp/seshat";

export async function POST(request: Request) {
  try {
    const { tool, params } = await request.json();

    const tools: Record<string, (params: any) => Promise<unknown>> = {
      searchReferences: (p) => seshatMcp.searchReferences(p.topic, p.sector, p.market),
      enrichBrief: (p) => seshatMcp.enrichBrief(p.channel, p.sector, p.market),
      scorePertinence: (p) => seshatMcp.scorePertinence(p.referenceId, p.score),
      getReferencesForPillar: (p) => seshatMcp.getReferencesForPillar(p.pillar),
      getSectorReferences: (p) => seshatMcp.getSectorReferences(p.sector),
      getBriefEnrichment: (p) => seshatMcp.getBriefEnrichment(p.context),
      getReferenceCatalog: () => seshatMcp.getReferenceCatalog(),
      getTrendingReferences: () => seshatMcp.getTrendingReferences(),
      getSectorReferencesSummary: () => seshatMcp.getSectorReferencesSummary(),
    };

    const handler = tools[tool];
    if (!handler) {
      return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 });
    }

    const result = await handler(params ?? {});
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    server: "seshat",
    tools: ["searchReferences", "enrichBrief", "scorePertinence", "getReferencesForPillar", "getSectorReferences", "getBriefEnrichment"],
    resources: ["getReferenceCatalog", "getTrendingReferences", "getSectorReferencesSummary"],
  });
}
