import type { Issue } from "@/lib/types";

export type IssueDataSource = "demo" | "supabase";

export type IssueRepository = {
  source: IssueDataSource;
  listIssues(): Promise<Issue[]>;
};

export function getIssueDataSource(): IssueDataSource {
  const source = process.env.BUGBRIEF_DATA_SOURCE ?? "demo";

  if (source === "demo" || source === "supabase") {
    return source;
  }

  throw new Error(`Unsupported BUGBRIEF_DATA_SOURCE "${source}". Use "demo" or "supabase".`);
}
