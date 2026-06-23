import type { ReactNode } from "react";

const toneClasses = {
  neutral: "border-zinc-200 bg-white",
  green: "border-emerald-200 bg-emerald-50",
  amber: "border-amber-200 bg-amber-50",
  red: "border-rose-200 bg-rose-50",
  blue: "border-sky-200 bg-sky-50",
} as const;

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?: keyof typeof toneClasses;
};

export function MetricCard({ label, value, detail, icon, tone = "neutral" }: MetricCardProps) {
  return (
    <section className={`rounded-lg border p-4 shadow-sm ${toneClasses[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-950">{value}</p>
        </div>
        <div className="rounded-md border border-white/70 bg-white p-2 text-zinc-700 shadow-sm">{icon}</div>
      </div>
      <p className="mt-3 text-sm leading-5 text-zinc-600">{detail}</p>
    </section>
  );
}
