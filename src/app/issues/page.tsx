import { getIssueRepository } from "@/lib/issues";
import { getEnrichedIssues } from "@/lib/reports";
import type { SlaState } from "@/lib/types";

export const dynamic = "force-dynamic";

const badgeClasses: Record<SlaState, string> = {
  within_sla: "border-sky-200 bg-sky-50 text-sky-700",
  at_risk: "border-amber-200 bg-amber-50 text-amber-800",
  breached: "border-rose-200 bg-rose-50 text-rose-700",
  met: "border-emerald-200 bg-emerald-50 text-emerald-700",
  missed: "border-rose-200 bg-rose-50 text-rose-700",
  not_applicable: "border-zinc-200 bg-zinc-50 text-zinc-600",
};

function formatState(state: SlaState): string {
  return state.replace("_", " ");
}

export default async function IssuesPage() {
  const issueRepository = getIssueRepository();
  const sourceIssues = await issueRepository.listIssues();
  const issues = getEnrichedIssues(sourceIssues).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="px-4 py-4 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Issues</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-950 sm:text-3xl">Bug and defect inventory</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
            A public-safe list showing the fields BugBrief tracks. Current source: {issueRepository.source === "supabase" ? "local Supabase" : "synthetic demo data"}.
          </p>
        </header>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <th className="pb-2 pr-3">Issue</th>
                  <th className="px-3 pb-2">Kind</th>
                  <th className="px-3 pb-2">Priority</th>
                  <th className="px-3 pb-2">Status</th>
                  <th className="px-3 pb-2">Team</th>
                  <th className="px-3 pb-2">Age</th>
                  <th className="pb-2 pl-3 text-right">SLA</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id} className="border-t border-zinc-200 align-top">
                    <td className="py-3 pr-3">
                      <div className="font-medium text-zinc-950">{issue.key}</div>
                      <div className="mt-1 max-w-md text-sm text-zinc-600">{issue.title}</div>
                    </td>
                    <td className="px-3 py-3 text-sm capitalize text-zinc-700">{issue.kind.replace("_", " ")}</td>
                    <td className="px-3 py-3 text-sm font-semibold text-zinc-800">{issue.priority}</td>
                    <td className="px-3 py-3 text-sm capitalize text-zinc-700">{issue.status.replace("_", " ")}</td>
                    <td className="px-3 py-3 text-sm text-zinc-700">{issue.team}</td>
                    <td className="px-3 py-3 text-sm text-zinc-700">{issue.ageDays}d</td>
                    <td className="py-3 pl-3 text-right">
                      <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold capitalize ${badgeClasses[issue.sla.state]}`}>
                        {formatState(issue.sla.state)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
