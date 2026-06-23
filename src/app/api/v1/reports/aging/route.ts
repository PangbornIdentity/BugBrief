import { NextResponse } from "next/server";
import { getIssueRepository } from "@/lib/issues";
import { getEnrichedIssues } from "@/lib/reports";

export async function GET() {
  const issueRepository = getIssueRepository();
  const issues = await issueRepository.listIssues();
  const openIssues = getEnrichedIssues(issues)
    .filter((issue) => !["fixed", "verified", "closed"].includes(issue.status))
    .sort((a, b) => b.ageDays - a.ageDays);

  return NextResponse.json({
    data: openIssues.map((issue) => ({
      id: issue.id,
      key: issue.key,
      title: issue.title,
      priority: issue.priority,
      status: issue.status,
      team: issue.team,
      ageDays: issue.ageDays,
      slaState: issue.sla.state,
    })),
    meta: {
      source: issueRepository.source,
    },
  });
}
