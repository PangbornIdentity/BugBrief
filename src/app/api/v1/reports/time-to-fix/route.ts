import { NextResponse } from "next/server";
import { getIssueRepository } from "@/lib/issues";
import { buildDashboardModel } from "@/lib/reports";

export async function GET() {
  const issueRepository = getIssueRepository();
  const issues = await issueRepository.listIssues();
  const model = buildDashboardModel(issues);

  return NextResponse.json({
    data: model.timeToFixByPriority,
    meta: {
      source: issueRepository.source,
      generatedAt: model.generatedAt,
    },
  });
}
