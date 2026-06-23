import type { FixApproach, Issue, IssueKind, IssueStatus, Priority, Severity } from "../types";

export type IssueRow = {
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

type DiagnosisQuality = NonNullable<Issue["diagnosisQuality"]>;

const issueKinds = ["escaped_bug", "defect"] as const satisfies readonly IssueKind[];
const priorities = ["P0", "P1", "P2", "P3", "P4"] as const satisfies readonly Priority[];
const severities = ["critical", "high", "medium", "low"] as const satisfies readonly Severity[];
const statuses = [
  "new",
  "triaged",
  "diagnosing",
  "in_progress",
  "fixed",
  "verified",
  "closed",
] as const satisfies readonly IssueStatus[];
const fixApproaches = [
  "quick_patch",
  "patch_plus_follow_up",
  "root_cause_fix",
] as const satisfies readonly FixApproach[];
const diagnosisQualities = ["clear", "partial", "late"] as const satisfies readonly DiagnosisQuality[];

function optional(value: string | null): string | undefined {
  return value ?? undefined;
}

function parseRequiredUnion<T extends string>(
  value: string,
  allowedValues: readonly T[],
  fieldName: string,
): T {
  if ((allowedValues as readonly string[]).includes(value)) {
    return value as T;
  }

  throw new Error(`Invalid issue ${fieldName} value "${value}".`);
}

function parseOptionalUnion<T extends string>(
  value: string | null,
  allowedValues: readonly T[],
  fieldName: string,
): T | undefined {
  if (value === null) {
    return undefined;
  }

  return parseRequiredUnion(value, allowedValues, fieldName);
}

export function mapIssueRow(row: IssueRow): Issue {
  return {
    id: row.id,
    key: row.external_key ?? row.id,
    title: row.title,
    kind: parseRequiredUnion(row.issue_kind, issueKinds, "issue_kind"),
    priority: parseRequiredUnion(row.priority, priorities, "priority"),
    severity: parseRequiredUnion(row.severity, severities, "severity"),
    status: parseRequiredUnion(row.status, statuses, "status"),
    team: row.team_name ?? "Unassigned",
    productArea: row.product_area ?? "Uncategorized",
    // This is the issue origin; API response metadata also has a repository data source.
    source: row.source ?? "Unknown",
    requirement: row.missed_requirement ?? "Uncategorized requirement",
    createdAt: row.created_at,
    detectedAt: optional(row.detected_at),
    firstTriagedAt: optional(row.first_triaged_at),
    diagnosisStartedAt: optional(row.diagnosis_started_at),
    fixedAt: optional(row.fixed_at),
    verifiedAt: optional(row.verified_at),
    closedAt: optional(row.closed_at),
    fixApproach: parseOptionalUnion(row.fix_approach, fixApproaches, "fix_approach"),
    diagnosisQuality: parseOptionalUnion(row.diagnosis_quality, diagnosisQualities, "diagnosis_quality"),
  };
}
