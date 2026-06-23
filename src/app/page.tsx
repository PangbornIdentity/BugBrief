import { Activity, AlertOctagon, AlertTriangle, Clock3, Download, Plus, ShieldCheck } from "lucide-react";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { MetricCard } from "@/components/dashboard/metric-card";
import { buildDashboardModel } from "@/lib/reports";
import type { IssueWithSla, SlaState } from "@/lib/types";

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

function formatDate(value: string | null): string {
  if (!value) {
    return "No target";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function WatchlistRow({ issue }: { issue: IssueWithSla }) {
  return (
    <tr className="border-t border-zinc-200 align-top">
      <td className="py-3 pr-3">
        <div className="font-medium text-zinc-950">{issue.key}</div>
        <div className="mt-1 max-w-sm text-sm text-zinc-600">{issue.title}</div>
      </td>
      <td className="px-3 py-3 text-sm text-zinc-700">{issue.team}</td>
      <td className="px-3 py-3 text-sm text-zinc-700">{issue.priority}</td>
      <td className="px-3 py-3 text-sm text-zinc-700">{issue.ageDays}d</td>
      <td className="px-3 py-3 text-sm text-zinc-700">{formatDate(issue.sla.dueAt)}</td>
      <td className="py-3 pl-3 text-right">
        <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold capitalize ${badgeClasses[issue.sla.state]}`}>
          {formatState(issue.sla.state)}
        </span>
      </td>
    </tr>
  );
}

export default function Home() {
  const model = buildDashboardModel();
  const generatedAt = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(model.generatedAt));

  return (
    <div className="px-4 py-4 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                <span className="font-semibold text-zinc-950">BugBrief</span>
                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                  Local demo data
                </span>
                <span>Generated {generatedAt}</span>
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-normal text-zinc-950 sm:text-3xl">
                Bug quality operations
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
                Track bug influx, escaped vs unescaped work, SLA risk, and P0/P1/P2 time-to-fix trends from structured issue data.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50">
                <Download size={16} aria-hidden="true" />
                Export
              </button>
              <button className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800">
                <Plus size={16} aria-hidden="true" />
                New issue
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Total issues"
            value={model.summary.totalIssues.toString()}
            detail="Synthetic issues across Vertical App Experience and CRM Experience."
            icon={<Activity size={20} aria-hidden="true" />}
          />
          <MetricCard
            label="Open work"
            value={model.summary.openIssues.toString()}
            detail={`${model.summary.highPriorityOpen} are P0/P1/P2 and need close monitoring.`}
            icon={<Clock3 size={20} aria-hidden="true" />}
            tone="blue"
          />
          <MetricCard
            label="SLA compliance"
            value={`${model.summary.slaCompliancePercent}%`}
            detail="Closed or fixed high-priority issues that met their target."
            icon={<ShieldCheck size={20} aria-hidden="true" />}
            tone="green"
          />
          <MetricCard
            label="At risk"
            value={model.summary.slaAtRisk.toString()}
            detail="Open high-priority work past warning threshold but before breach."
            icon={<AlertTriangle size={20} aria-hidden="true" />}
            tone="amber"
          />
          <MetricCard
            label="Breached"
            value={model.summary.slaBreached.toString()}
            detail="Open high-priority work beyond the configured SLA target."
            icon={<AlertOctagon size={20} aria-hidden="true" />}
            tone="red"
          />
        </section>

        <DashboardCharts model={model} />

        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-950">High-priority SLA watchlist</h2>
              <p className="mt-1 text-sm text-zinc-600">Open P0/P1/P2 issues sorted by breach risk and due date.</p>
            </div>
            <div className="text-sm font-medium text-zinc-600">P0/P1/P2 avg time to fix: {model.summary.highPriorityAverageTimeToFixDays} days</div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <th className="pb-2 pr-3">Issue</th>
                  <th className="px-3 pb-2">Team</th>
                  <th className="px-3 pb-2">Priority</th>
                  <th className="px-3 pb-2">Age</th>
                  <th className="px-3 pb-2">SLA target</th>
                  <th className="pb-2 pl-3 text-right">State</th>
                </tr>
              </thead>
              <tbody>
                {model.watchlist.map((issue) => (
                  <WatchlistRow key={issue.id} issue={issue} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
