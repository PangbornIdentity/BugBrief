import { describe, expect, it } from "vitest";
import { mapIssueRow, type IssueRow } from "./supabase-issue-mapper";

const baseIssueRow: IssueRow = {
  id: "00000000-0000-4000-8000-000000000101",
  external_key: "BB-LOCAL-101",
  title: "Mapper test issue",
  issue_kind: "escaped_bug",
  priority: "P1",
  severity: "high",
  status: "fixed",
  product_area: "Billing",
  team_name: "CRM Experience",
  source: "Jira",
  missed_requirement: "Payment status should refresh after retry",
  detected_at: "2026-06-10T12:00:00.000Z",
  first_triaged_at: "2026-06-10T14:00:00.000Z",
  diagnosis_started_at: "2026-06-10T15:00:00.000Z",
  fixed_at: "2026-06-11T16:00:00.000Z",
  verified_at: "2026-06-11T18:00:00.000Z",
  closed_at: "2026-06-12T12:00:00.000Z",
  fix_approach: "root_cause_fix",
  diagnosis_quality: "clear",
  created_at: "2026-06-10T12:00:00.000Z",
};

describe("mapIssueRow", () => {
  it("maps a Supabase issue row into the app issue shape", () => {
    expect(mapIssueRow(baseIssueRow)).toEqual({
      id: "00000000-0000-4000-8000-000000000101",
      key: "BB-LOCAL-101",
      title: "Mapper test issue",
      kind: "escaped_bug",
      priority: "P1",
      severity: "high",
      status: "fixed",
      team: "CRM Experience",
      productArea: "Billing",
      source: "Jira",
      requirement: "Payment status should refresh after retry",
      createdAt: "2026-06-10T12:00:00.000Z",
      detectedAt: "2026-06-10T12:00:00.000Z",
      firstTriagedAt: "2026-06-10T14:00:00.000Z",
      diagnosisStartedAt: "2026-06-10T15:00:00.000Z",
      fixedAt: "2026-06-11T16:00:00.000Z",
      verifiedAt: "2026-06-11T18:00:00.000Z",
      closedAt: "2026-06-12T12:00:00.000Z",
      fixApproach: "root_cause_fix",
      diagnosisQuality: "clear",
    });
  });

  it("uses app defaults for nullable display fields", () => {
    const issue = mapIssueRow({
      ...baseIssueRow,
      external_key: null,
      product_area: null,
      team_name: null,
      source: null,
      missed_requirement: null,
      detected_at: null,
      first_triaged_at: null,
      diagnosis_started_at: null,
      fixed_at: null,
      verified_at: null,
      closed_at: null,
      fix_approach: null,
      diagnosis_quality: null,
    });

    expect(issue.key).toBe(baseIssueRow.id);
    expect(issue.productArea).toBe("Uncategorized");
    expect(issue.team).toBe("Unassigned");
    expect(issue.source).toBe("Unknown");
    expect(issue.requirement).toBe("Uncategorized requirement");
    expect(issue.detectedAt).toBeUndefined();
    expect(issue.firstTriagedAt).toBeUndefined();
    expect(issue.diagnosisStartedAt).toBeUndefined();
    expect(issue.fixedAt).toBeUndefined();
    expect(issue.verifiedAt).toBeUndefined();
    expect(issue.closedAt).toBeUndefined();
    expect(issue.fixApproach).toBeUndefined();
    expect(issue.diagnosisQuality).toBeUndefined();
  });

  it.each([
    ["issue_kind", "incident"],
    ["priority", "PX"],
    ["severity", "urgent"],
    ["status", "done"],
    ["fix_approach", "workaround_only"],
    ["diagnosis_quality", "unknown"],
  ])("throws for invalid %s values", (fieldName, value) => {
    expect(() =>
      mapIssueRow({
        ...baseIssueRow,
        [fieldName]: value,
      }),
    ).toThrow(`Invalid issue ${fieldName} value "${value}".`);
  });
});
