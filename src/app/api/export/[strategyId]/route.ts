import { NextResponse } from "next/server";
import { exportStrategyData, exportAsCsv } from "@/server/services/data-export";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ strategyId: string }> }
) {
  const { strategyId } = await params;
  const format = new URL(request.url).searchParams.get("format") ?? "json";

  try {
    if (format === "csv") {
      const csvFiles = await exportAsCsv(strategyId);
      return NextResponse.json(csvFiles);
    }

    const data = await exportStrategyData(strategyId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
