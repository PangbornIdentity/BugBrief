import { describe, expect, it } from "vitest";
import { buildDashboardModel } from "./reports";

describe("buildDashboardModel", () => {
  it("builds summary metrics from synthetic data", () => {
    const model = buildDashboardModel();

    expect(model.summary.totalIssues).toBeGreaterThan(0);
    expect(model.summary.highPriorityOpen).toBeGreaterThan(0);
    expect(model.summary.averageTimeToFixDays).toBeGreaterThan(0);
    expect(model.slaByPriority).toHaveLength(3);
    expect(model.timeToFixByPriority.map((row) => row.priority)).toEqual(["P0", "P1", "P2"]);
  });

  it("puts breached or at-risk high-priority issues in the watchlist", () => {
    const model = buildDashboardModel();
    const states = model.watchlist.map((issue) => issue.sla.state);

    expect(states.some((state) => state === "breached" || state === "at_risk")).toBe(true);
  });
});
