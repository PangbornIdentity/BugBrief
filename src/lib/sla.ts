import type { Issue, IssueWithSla, Priority, SlaPolicy, SlaResult } from "./types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const defaultWorkspaceTimeZone = "UTC";

const resolvedStatuses = new Set<Issue["status"]>(["fixed", "verified", "closed"]);

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

function getTimeZoneParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const partMap = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(partMap.year),
    month: Number(partMap.month),
    day: Number(partMap.day),
    hour: Number(partMap.hour),
    minute: Number(partMap.minute),
    second: Number(partMap.second),
  };
}

function getTimeZoneOffsetMillis(timeZone: string, date: Date): number {
  const parts = getTimeZoneParts(date, timeZone);
  const localAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    date.getUTCMilliseconds(),
  );

  return localAsUtc - date.getTime();
}

function localDateTimeToUtc(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  millisecond: number,
): Date {
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
  let utcTime = localAsUtc;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const offset = getTimeZoneOffsetMillis(timeZone, new Date(utcTime));
    const nextUtcTime = localAsUtc - offset;

    if (nextUtcTime === utcTime) {
      break;
    }

    utcTime = nextUtcTime;
  }

  return new Date(utcTime);
}

function endOfSameLocalDay(start: Date, timeZone: string): Date {
  const parts = getTimeZoneParts(start, timeZone);

  return localDateTimeToUtc(timeZone, parts.year, parts.month, parts.day, 23, 59, 59, 999);
}

function addByPolicy(start: Date, days: number, policy: SlaPolicy, timeZone: string): Date {
  if (policy.calendarMode === "business_days") {
    return addBusinessDays(start, days);
  }

  if (policy.calendarMode === "same_local_day") {
    return endOfSameLocalDay(start, timeZone);
  }

  return addCalendarDays(start, days);
}

function getResolvedAt(issue: Issue, now: Date): Date | null {
  const resolvedAt = issue.fixedAt ?? issue.closedAt;

  if (resolvedAt) {
    return new Date(resolvedAt);
  }

  if (resolvedStatuses.has(issue.status)) {
    return now;
  }

  return null;
}

export function calculateSla(
  issue: Issue,
  policy: SlaPolicy | undefined = defaultSlaPolicies[issue.priority],
  now: Date = demoNow,
  workspaceTimeZone: string = defaultWorkspaceTimeZone,
): SlaResult {
  const createdAt = new Date(issue.createdAt);
  const resolvedAt = getResolvedAt(issue, now);
  const referenceAt = resolvedAt ?? now;
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

  const dueAt = addByPolicy(createdAt, policy.breachAfterDays, policy, workspaceTimeZone);
  const warningAt =
    policy.warningAfterDays === undefined
      ? null
      : addByPolicy(createdAt, policy.warningAfterDays, policy, workspaceTimeZone);

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

export function enrichIssue(
  issue: Issue,
  now: Date = demoNow,
  workspaceTimeZone: string = defaultWorkspaceTimeZone,
): IssueWithSla {
  return {
    ...issue,
    ageDays: roundDays(daysBetween(new Date(issue.createdAt), now)),
    timeToFixDays: timeToFixDays(issue),
    sla: calculateSla(issue, defaultSlaPolicies[issue.priority], now, workspaceTimeZone),
  };
}
