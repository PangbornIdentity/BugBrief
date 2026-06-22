import type { Issue, IssueWithSla, Priority, SlaPolicy, SlaResult } from "./types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const demoNow = new Date("2026-06-22T18:00:00.000Z");

export const highPriorityPriorities: Priority[] = ["P0", "P1", "P2"];

export const defaultSlaPolicies: Partial<Record<Priority, SlaPolicy>> = {
  P0: {
    priority: "P0",
    label: "Same local day",
    breachAfterDays: 0,
    calendarMode: "same_local_day",
  },
  P1: {
    priority: "P1",
    label: "3 day warning / 5 day breach",
    warningAfterDays: 3,
    breachAfterDays: 5,
    calendarMode: "calendar_days",
  },
  P2: {
    priority: "P2",
    label: "15 day breach",
    breachAfterDays: 15,
    calendarMode: "calendar_days",
  },
};

export function isHighPriority(priority: Priority): boolean {
  return highPriorityPriorities.includes(priority);
}

export function daysBetween(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / MS_PER_DAY);
}

export function roundDays(days: number): number {
  return Math.round(days * 10) / 10;
}

function addCalendarDays(start: Date, days: number): Date {
  return new Date(start.getTime() + days * MS_PER_DAY);
}

function addBusinessDays(start: Date, days: number): Date {
  const result = new Date(start);
  let remaining = days;

  while (remaining > 0) {
    result.setUTCDate(result.getUTCDate() + 1);
    const day = result.getUTCDay();
    if (day !== 0 && day !== 6) {
      remaining -= 1;
    }
  }

  return result;
}

function endOfSameUtcDay(start: Date): Date {
  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), 23, 59, 59, 999));
}

function addByPolicy(start: Date, days: number, policy: SlaPolicy): Date {
  if (policy.calendarMode === "business_days") {
    return addBusinessDays(start, days);
  }

  if (policy.calendarMode === "same_local_day") {
    return endOfSameUtcDay(start);
  }

  return addCalendarDays(start, days);
}

export function calculateSla(
  issue: Issue,
  policy: SlaPolicy | undefined = defaultSlaPolicies[issue.priority],
  now: Date = demoNow,
): SlaResult {
  const createdAt = new Date(issue.createdAt);
  const resolvedAt = issue.fixedAt ?? issue.closedAt;
  const referenceAt = resolvedAt ? new Date(resolvedAt) : now;
  const elapsedDays = roundDays(daysBetween(createdAt, referenceAt));

  if (!policy) {
    return {
      state: "not_applicable",
      label: "No SLA configured",
      dueAt: null,
      warningAt: null,
      breachedAt: null,
      elapsedDays,
      targetDays: null,
    };
  }

  const dueAt = addByPolicy(createdAt, policy.breachAfterDays, policy);
  const warningAt =
    policy.warningAfterDays === undefined ? null : addByPolicy(createdAt, policy.warningAfterDays, policy);

  if (resolvedAt) {
    const met = referenceAt.getTime() <= dueAt.getTime();
    return {
      state: met ? "met" : "missed",
      label: policy.label,
      dueAt: dueAt.toISOString(),
      warningAt: warningAt?.toISOString() ?? null,
      breachedAt: met ? null : dueAt.toISOString(),
      elapsedDays,
      targetDays: policy.breachAfterDays,
    };
  }

  const nowTime = now.getTime();
  const state =
    nowTime > dueAt.getTime()
      ? "breached"
      : warningAt && nowTime > warningAt.getTime()
        ? "at_risk"
        : "within_sla";

  return {
    state,
    label: policy.label,
    dueAt: dueAt.toISOString(),
    warningAt: warningAt?.toISOString() ?? null,
    breachedAt: state === "breached" ? dueAt.toISOString() : null,
    elapsedDays,
    targetDays: policy.breachAfterDays,
  };
}

export function timeToFixDays(issue: Issue): number | null {
  if (!issue.fixedAt) {
    return null;
  }

  return roundDays(daysBetween(new Date(issue.createdAt), new Date(issue.fixedAt)));
}

export function enrichIssue(issue: Issue, now: Date = demoNow): IssueWithSla {
  return {
    ...issue,
    ageDays: roundDays(daysBetween(new Date(issue.createdAt), now)),
    timeToFixDays: timeToFixDays(issue),
    sla: calculateSla(issue, defaultSlaPolicies[issue.priority], now),
  };
}
