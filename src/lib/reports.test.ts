import { describe, expect, it } from "vitest";
import { buildDashboardModel } from "./reports";
import type { Issue } from "./types";

const reportBaseIssue: Issue = {
  id: "report-test-1",
  key: "REPORT-1",
  title: "Report test issue",
  kind: "escaped_bug",
  priority: "P1",
  severity: "high",
  status: "closed",
  team: "Demo Team",
  productArea: "Demo Area",
  source: "Demo Source",
  requirement: "Demo requirement",
  createdAt: "2026-06-01T00:00:00.000Z",
};

describe("buildDashboardModel", () => {
  it("builds summary metrics from synthetic data", () => {
    const model = buildDashboardModel();

    expect(model.summary.totalIssues).toBeGreaterThan(0);
    expect(model.summary.highPriorityOpen).toBeGreaterThan(0);
    expect(model.summary.averageTimeToFixDays).toBeGreaterThan(0);
    expect(model.summary.highPriorityAverageTimeToFixDays).toBeGreaterThan(0);
    expect(model.slaByPriority).toHaveLength(3);
    expect(model.timeToFixByPriority.map((row) => row.priority)).toEqual(["P0", "P1", "P2"]);
  });

  it("puts breached or at-risk high-priority issues in the watchlist", () => {
    const model = buildDashboardModel();
    const states = model.watchlist.map((issue) => issue.sla.state);

    expect(states.some((state) => state === "breached" || state === "at_risk")).toBe(true);
  });

  it("separates all-priority average fix time from high-priority average fix time", () => {
    const model = buildDashboardModel(
      [
        {
          ...reportBaseIssue,
          id: "report-test-p1",
          key: "REPORT-P1",
          priority: "P1",
          fixedAt: "2026-06-03T00:00:00.000Z",
          closedAt: "2026-06-03T01:00:00.000Z",
        },
        {
          ...reportBaseIssue,
          id: "report-test-p4",
          key: "REPORT-P4",
          priority: "P4",
          severity: "low",
          fixedAt: "2026-06-21T00:00:00.000Z",
          closedAt: "2026-06-21T01:00:00.000Z",
        },
      ],
      new Date("2026-06-22T18:00:00.000Z"),
    );

    expect(model.summary.highPriorityAverageTimeToFixDays).toBe(2);
    expect(model.summary.averageTimeToFixDays).toBe(11);
  });
});
