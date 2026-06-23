import "server-only";

import { createServiceSupabaseClient } from "../supabase/server";
import type { FixApproach, Issue, IssueKind, IssueStatus, Priority, Severity } from "../types";
import type { IssueRepository } from "./types";

type IssueRow = {
  id: string;
  external_key: string | null;
  title: string;
  issue_kind: string;
  priority: string;
  severity: string;
  status: string;
  product_area: string | null;
  team_name: string | null;
  source: string | null;
  missed_requirement: string | null;
  detected_at: string | null;
  first_triaged_at: string | null;
  diagnosis_started_at: string | null;
  fixed_at: string | null;
  verified_at: string | null;
  closed_at: string | null;
  fix_approach: string | null;
  diagnosis_quality: string | null;
  created_at: string;
};

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

function optional(value: string | null): string | undefined {
  return value ?? undefined;
}

function mapIssueRow(row: IssueRow): Issue {
  return {
    id: row.id,
    key: row.external_key ?? row.id,
    title: row.title,
    kind: row.issue_kind as IssueKind,
    priority: row.priority as Priority,
    severity: row.severity as Severity,
    status: row.status as IssueStatus,
    team: row.team_name ?? "Unassigned",
    productArea: row.product_area ?? "Uncategorized",
    source: row.source ?? "Unknown",
    requirement: row.missed_requirement ?? "Uncategorized requirement",
    createdAt: row.created_at,
    detectedAt: optional(row.detected_at),
    firstTriagedAt: optional(row.first_triaged_at),
    diagnosisStartedAt: optional(row.diagnosis_started_at),
    fixedAt: optional(row.fixed_at),
    verifiedAt: optional(row.verified_at),
    closedAt: optional(row.closed_at),
    fixApproach: row.fix_approach ? (row.fix_approach as FixApproach) : undefined,
    diagnosisQuality: row.diagnosis_quality ? (row.diagnosis_quality as Issue["diagnosisQuality"]) : undefined,
  };
}

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
