import { describe, expect, it } from "vitest";
import { calculateSla, defaultSlaPolicies } from "./sla";
import type { Issue } from "./types";

const baseIssue: Issue = {
  id: "test-issue",
  key: "TEST-1",
  title: "Synthetic test issue",
  kind: "escaped_bug",
  priority: "P1",
  severity: "high",
  status: "in_progress",
  team: "Demo Team",
  productArea: "Demo Area",
  source: "Demo Source",
  requirement: "Demo requirement",
  createdAt: "2026-06-10T10:00:00.000Z",
};

describe("calculateSla", () => {
  it("marks a fixed P1 inside five days as met", () => {
    const result = calculateSla(
      {
        ...baseIssue,
        fixedAt: "2026-06-14T09:00:00.000Z",
      },
      defaultSlaPolicies.P1,
      new Date("2026-06-22T18:00:00.000Z"),
    );

    expect(result.state).toBe("met");
    expect(result.elapsedDays).toBe(4);
  });

  it("marks an open P1 after three days but before five days as at risk", () => {
    const result = calculateSla(
      baseIssue,
      defaultSlaPolicies.P1,
      new Date("2026-06-13T12:00:00.000Z"),
    );

    expect(result.state).toBe("at_risk");
    expect(result.warningAt).toBe("2026-06-13T10:00:00.000Z");
  });

  it("marks an open P2 after fifteen days as breached", () => {
    const result = calculateSla(
      {
        ...baseIssue,
        priority: "P2",
        createdAt: "2026-06-01T12:00:00.000Z",
      },
      defaultSlaPolicies.P2,
      new Date("2026-06-17T12:01:00.000Z"),
    );

    expect(result.state).toBe("breached");
    expect(result.breachedAt).toBe("2026-06-16T12:00:00.000Z");
  });

  it("uses same-day target for P0", () => {
    const result = calculateSla(
      {
        ...baseIssue,
        priority: "P0",
        createdAt: "2026-06-18T15:30:00.000Z",
        fixedAt: "2026-06-19T00:01:00.000Z",
      },
      defaultSlaPolicies.P0,
      new Date("2026-06-22T18:00:00.000Z"),
    );

    expect(result.state).toBe("missed");
    expect(result.dueAt).toBe("2026-06-18T23:59:59.999Z");
  });
});
