import { NextResponse } from "next/server";
import * as guildMcp from "@/server/mcp/guild";

export async function POST(request: Request) {
  try {
    const { tool, params } = await request.json();

    const tools: Record<string, (params: any) => Promise<unknown>> = {
      getCreatorProfile: (p) => guildMcp.getCreatorProfile(p.userId),
      getCreatorsByTier: (p) => guildMcp.getCreatorsByTier(p.tier),
      getTopPerformers: (p) => guildMcp.getTopPerformers(p.limit),
      searchCreators: (p) => guildMcp.searchCreators(p.skills, p.channel),
      getQcStats: () => guildMcp.getQcStats(),
      getMatchingSuggestions: (p) => guildMcp.getMatchingSuggestions(p.missionId),
      getGuildStats: () => guildMcp.getGuildStats(),
      getTierDistribution: () => guildMcp.getTierDistribution(),
      getOrgDirectory: () => guildMcp.getOrgDirectory(),
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
    server: "guild",
    tools: ["getCreatorProfile", "getCreatorsByTier", "getTopPerformers", "searchCreators", "getQcStats", "getMatchingSuggestions"],
    resources: ["getGuildStats", "getTierDistribution", "getOrgDirectory"],
  });
}
