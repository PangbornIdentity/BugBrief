import "server-only";

import { DemoIssueRepository } from "./demo-issue-repository";
import { SupabaseIssueRepository } from "./supabase-issue-repository";
import { getIssueDataSource, type IssueRepository } from "./types";

export function getIssueRepository(): IssueRepository {
  const source = getIssueDataSource();

  if (source === "supabase") {
    return new SupabaseIssueRepository();
  }

  return new DemoIssueRepository();
}

export type { IssueDataSource, IssueRepository } from "./types";
