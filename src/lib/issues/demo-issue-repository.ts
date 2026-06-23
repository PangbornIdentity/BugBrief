import { demoIssues } from "../demo-data";
import type { Issue } from "../types";
import type { IssueRepository } from "./types";

export class DemoIssueRepository implements IssueRepository {
  readonly source = "demo" as const;

  async listIssues(): Promise<Issue[]> {
    return demoIssues;
  }
}
