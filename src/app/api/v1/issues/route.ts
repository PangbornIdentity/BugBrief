import { NextResponse } from "next/server";
import { getIssueRepository } from "@/lib/issues";
import { getEnrichedIssues } from "@/lib/reports";

export async function GET() {
  const issueRepository = getIssueRepository();
  const issues = await issueRepository.listIssues();

  return NextResponse.json({
    data: getEnrichedIssues(issues),
    meta: {
      source: issueRepository.source,
      warning:
        issueRepository.source === "demo"
          ? "Demo data only. Do not commit proprietary issue payloads."
          : "Supabase-backed local data. Keep local credentials out of git.",
    },
  });
}
