import { demoIssues } from "./demo-data";
import { defaultSlaPolicies, demoNow, enrichIssue, highPriorityPriorities, isHighPriority } from "./sla";
import type { Issue, IssueKind, IssueWithSla, Priority, SlaState } from "./types";

export type DashboardSummary = {
  totalIssues: number;
  openIssues: number;
  highPriorityOpen: number;
  slaCompliancePercent: number;
  slaAtRisk: number;
  slaBreached: number;
  averageTimeToFixDays: number;
};

export type PrioritySlaRow = {
  priority: Priority;
  target: string;
  met: number;
  missed: number;
  atRisk: number;
  breached: number;
  compliancePercent: number;
};

export type TimeToFixRow = {
  priority: Priority;
  averageDays: number;
  targetDays: number;
  fixedCount: number;
};

export type InfluxRow = {
  week: string;
  escaped: number;
  defects: number;
  total: number;
};

export type IssueMixRow = {
  name: string;
  value: number;
};

export type DashboardModel = {
  generatedAt: string;
  summary: DashboardSummary;
  influxByWeek: InfluxRow[];
  slaByPriority: PrioritySlaRow[];
  timeToFixByPriority: TimeToFixRow[];
  issueMix: IssueMixRow[];
  watchlist: IssueWithSla[];
};

const closedStates = new Set(["fixed", "verified", "closed"]);
const stateRank: Record<SlaState, number> = {
  breached: 0,
  at_risk: 1,
  within_sla: 2,
  missed: 3,
  met: 4,
  not_applicable: 5,
};

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round((total / values.length) * 10) / 10;
}

function isOpen(issue: Issue): boolean {
  return !closedStates.has(issue.status);
}

function startOfWeek(value: string): string {
  const date = new Date(value);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - day + 1);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

function countIssueMix(issues: Issue[]): IssueMixRow[] {
  const labels: Record<IssueKind, string> = {
    escaped_bug: "Escaped bugs",
    defect: "Unescaped defects",
  };

  return (["escaped_bug", "defect"] as IssueKind[]).map((kind) => ({
    name: labels[kind],
    value: issues.filter((issue) => issue.kind === kind).length,
  }));
}

function buildInfluxRows(issues: Issue[]): InfluxRow[] {
  const groups = new Map<string, InfluxRow>();

  for (const issue of issues) {
    const week = startOfWeek(issue.createdAt);
    const existing = groups.get(week) ?? { week, escaped: 0, defects: 0, total: 0 };

    if (issue.kind === "escaped_bug") {
      existing.escaped += 1;
    } else {
      existing.defects += 1;
    }

    existing.total += 1;
    groups.set(week, existing);
  }

  return Array.from(groups.values()).sort((a, b) => a.week.localeCompare(b.week));
}

function buildSlaRows(issues: IssueWithSla[]): PrioritySlaRow[] {
  return highPriorityPriorities.map((priority) => {
    const priorityIssues = issues.filter((issue) => issue.priority === priority);
    const met = priorityIssues.filter((issue) => issue.sla.state === "met").length;
    const missed = priorityIssues.filter((issue) => issue.sla.state === "missed").length;
    const atRisk = priorityIssues.filter((issue) => issue.sla.state === "at_risk").length;
    const breached = priorityIssues.filter((issue) => issue.sla.state === "breached").length;
    const decided = met + missed;
    const policy = defaultSlaPolicies[priority];

    return {
      priority,
      target: policy?.label ?? "No SLA configured",
      met,
      missed,
      atRisk,
      breached,
      compliancePercent: decided === 0 ? 0 : Math.round((met / decided) * 100),
    };
  });
}

function buildTimeToFixRows(issues: IssueWithSla[]): TimeToFixRow[] {
  return highPriorityPriorities.map((priority) => {
    const fixed = issues.filter((issue) => issue.priority === priority && issue.timeToFixDays !== null);
    const policy = defaultSlaPolicies[priority];

    return {
      priority,
      averageDays: average(fixed.map((issue) => issue.timeToFixDays ?? 0)),
      targetDays: policy?.breachAfterDays ?? 0,
      fixedCount: fixed.length,
    };
  });
}

export function getEnrichedIssues(issues: Issue[] = demoIssues, now: Date = demoNow): IssueWithSla[] {
  return issues.map((issue) => enrichIssue(issue, now));
}

export function buildDashboardModel(issues: Issue[] = demoIssues, now: Date = demoNow): DashboardModel {
  const enriched = getEnrichedIssues(issues, now);
  const openIssues = enriched.filter(isOpen);
  const highPriorityOpen = openIssues.filter((issue) => isHighPriority(issue.priority));
  const highPriorityClosed = enriched.filter(
    (issue) => isHighPriority(issue.priority) && (issue.sla.state === "met" || issue.sla.state === "missed"),
  );
  const met = highPriorityClosed.filter((issue) => issue.sla.state === "met").length;
  const fixedDurations = enriched
    .map((issue) => issue.timeToFixDays)
    .filter((value): value is number => value !== null);

  const watchlist = highPriorityOpen
    .slice()
    .sort((a, b) => {
      const stateDelta = stateRank[a.sla.state] - stateRank[b.sla.state];
      if (stateDelta !== 0) {
        return stateDelta;
      }

      return (a.sla.dueAt ?? "9999").localeCompare(b.sla.dueAt ?? "9999");
    })
    .slice(0, 6);

  return {
    generatedAt: now.toISOString(),
    summary: {
      totalIssues: enriched.length,
      openIssues: openIssues.length,
      highPriorityOpen: highPriorityOpen.length,
      slaCompliancePercent:
        highPriorityClosed.length === 0 ? 0 : Math.round((met / highPriorityClosed.length) * 100),
      slaAtRisk: highPriorityOpen.filter((issue) => issue.sla.state === "at_risk").length,
      slaBreached: highPriorityOpen.filter((issue) => issue.sla.state === "breached").length,
      averageTimeToFixDays: average(fixedDurations),
    },
    influxByWeek: buildInfluxRows(enriched),
    slaByPriority: buildSlaRows(enriched),
    timeToFixByPriority: buildTimeToFixRows(enriched),
    issueMix: countIssueMix(enriched),
    watchlist,
  };
}
