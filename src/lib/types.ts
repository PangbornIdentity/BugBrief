export type Priority = "P0" | "P1" | "P2" | "P3" | "P4";
export type Severity = "critical" | "high" | "medium" | "low";
export type IssueKind = "escaped_bug" | "defect";
export type IssueStatus =
  | "new"
  | "triaged"
  | "diagnosing"
  | "in_progress"
  | "fixed"
  | "verified"
  | "closed";
export type CalendarMode = "calendar_days" | "business_days" | "same_local_day";
export type SlaState =
  | "within_sla"
  | "at_risk"
  | "breached"
  | "met"
  | "missed"
  | "not_applicable";
export type FixApproach = "quick_patch" | "patch_plus_follow_up" | "root_cause_fix";

export type SlaPolicy = {
  priority: Priority;
  label: string;
  warningAfterDays?: number;
  breachAfterDays: number;
  calendarMode: CalendarMode;
};

export type SlaResult = {
  state: SlaState;
  label: string;
  dueAt: string | null;
  warningAt: string | null;
  breachedAt: string | null;
  elapsedDays: number;
  targetDays: number | null;
};

export type Issue = {
  id: string;
  key: string;
  title: string;
  kind: IssueKind;
  priority: Priority;
  severity: Severity;
  status: IssueStatus;
  team: string;
  productArea: string;
  source: string;
  requirement: string;
  createdAt: string;
  detectedAt?: string;
  firstTriagedAt?: string;
  diagnosisStartedAt?: string;
  fixedAt?: string;
  verifiedAt?: string;
  closedAt?: string;
  fixApproach?: FixApproach;
  diagnosisQuality?: "clear" | "partial" | "late";
};

export type IssueWithSla = Issue & {
  ageDays: number;
  timeToFixDays: number | null;
  sla: SlaResult;
};
