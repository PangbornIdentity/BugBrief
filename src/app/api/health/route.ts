import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "bugbrief",
    timestamp: new Date().toISOString(),
  });
}
