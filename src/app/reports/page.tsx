import Link from "next/link";
import { BarChart3, Clock3, FileJson, ShieldCheck } from "lucide-react";
import { buildDashboardModel } from "@/lib/reports";

const reportLinks = [
  {
    href: "/api/v1/reports/sla",
    title: "SLA report API",
    description: "Summary, P0/P1/P2 rollups, and current watchlist.",
    icon: ShieldCheck,
  },
  {
    href: "/api/v1/reports/time-to-fix",
    title: "Time-to-fix API",
    description: "Average fix duration compared with priority targets.",
    icon: Clock3,
  },
  {
    href: "/api/v1/reports/aging",
    title: "Aging API",
    description: "Open issues sorted by current age and SLA state.",
    icon: BarChart3,
  },
  {
    href: "/api/v1/openapi.json",
    title: "OpenAPI document",
    description: "Machine-readable API contract for AI clients.",
    icon: FileJson,
  },
];

export default function ReportsPage() {
  const model = buildDashboardModel();

  return (
    <div className="px-4 py-4 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Reports</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-950 sm:text-3xl">Quality reporting workspace</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
            The dashboard is the visual report; these endpoints are the first API-backed reporting surfaces for AI clients.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reportLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link key={link.href} href={link.href} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md">
                <Icon size={20} className="text-zinc-700" aria-hidden="true" />
                <h2 className="mt-3 text-sm font-semibold text-zinc-950">{link.title}</h2>
                <p className="mt-2 text-sm leading-5 text-zinc-600">{link.description}</p>
              </Link>
            );
          })}
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-950">Current reporting snapshot</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-zinc-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">SLA compliance</p>
              <p className="mt-2 text-2xl font-semibold">{model.summary.slaCompliancePercent}%</p>
            </div>
            <div className="rounded-md border border-zinc-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">At risk</p>
              <p className="mt-2 text-2xl font-semibold">{model.summary.slaAtRisk}</p>
            </div>
            <div className="rounded-md border border-zinc-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Breached</p>
              <p className="mt-2 text-2xl font-semibold">{model.summary.slaBreached}</p>
            </div>
            <div className="rounded-md border border-zinc-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">P0/P1/P2 avg time to fix</p>
              <p className="mt-2 text-2xl font-semibold">{model.summary.highPriorityAverageTimeToFixDays}d</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
