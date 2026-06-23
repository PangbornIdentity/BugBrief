import { describe, expect, it } from "vitest";
import { DemoIssueRepository } from "./demo-issue-repository";

describe("DemoIssueRepository", () => {
  it("returns synthetic issues for local development", async () => {
    const issues = await new DemoIssueRepository().listIssues();

    expect(issues.length).toBeGreaterThan(0);
    expect(issues.every((issue) => issue.key.startsWith("BB-DEMO-"))).toBe(true);
  });
});
