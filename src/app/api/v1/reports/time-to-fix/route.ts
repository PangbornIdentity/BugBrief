import { NextResponse } from "next/server";
import { buildDashboardModel } from "@/lib/reports";

export function GET() {
  const model = buildDashboardModel();

  return NextResponse.json({
    data: model.timeToFixByPriority,
    meta: {
      source: "synthetic_demo",
      generatedAt: model.generatedAt,
    },
  });
}
