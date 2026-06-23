import { NextResponse } from "next/server";
import { getEnrichedIssues } from "@/lib/reports";

export function GET() {
  return NextResponse.json({
    data: getEnrichedIssues(),
    meta: {
      source: "synthetic_demo",
      warning: "Demo data only. Do not commit proprietary issue payloads.",
    },
  });
}
