import { NextResponse } from "next/server";
import { buildDashboardModel } from "@/lib/reports";

export function GET() {
  const model = buildDashboardModel();

  return NextResponse.json({
    data: {
      summary: model.summary,
      byPriority: model.slaByPriority,
      watchlist: model.watchlist,
    },
    meta: {
      source: "synthetic_demo",
      generatedAt: model.generatedAt,
    },
  });
}
