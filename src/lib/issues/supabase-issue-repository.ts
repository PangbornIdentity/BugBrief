import "server-only";

import { createServiceSupabaseClient } from "../supabase/server";
import type { Issue } from "../types";
import { mapIssueRow, type IssueRow } from "./supabase-issue-mapper";
import type { IssueRepository } from "./types";

const issueSelect = `
  id,
  external_key,
  title,
  issue_kind,
  priority,
  severity,
  status,
  product_area,
  team_name,
  source,
  missed_requirement,
  detected_at,
  first_triaged_at,
  diagnosis_started_at,
  fixed_at,
  verified_at,
  closed_at,
  fix_approach,
  diagnosis_quality,
  created_at
`;

export class SupabaseIssueRepository implements IssueRepository {
  readonly source = "supabase" as const;

  async listIssues(): Promise<Issue[]> {
    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase
      .from("issues")
      .select(issueSelect)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to load issues from Supabase: ${error.message}`);
    }

    return ((data ?? []) as IssueRow[]).map(mapIssueRow);
  }
}
