import { defaultSlaPolicies } from "@/lib/sla";

export default function SettingsPage() {
  const policies = Object.values(defaultSlaPolicies);

  return (
    <div className="px-4 py-4 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Settings</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-950 sm:text-3xl">Workspace configuration</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
            Early configuration surfaces for terminology and SLA defaults. These will become editable once Supabase persistence is connected.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-950">Terminology defaults</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4 rounded-md border border-zinc-200 p-3">
                <dt className="font-medium text-zinc-700">Escaped issue</dt>
                <dd className="text-zinc-950">Bug</dd>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md border border-zinc-200 p-3">
                <dt className="font-medium text-zinc-700">Unescaped issue</dt>
                <dd className="text-zinc-950">Defect</dd>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md border border-zinc-200 p-3">
                <dt className="font-medium text-zinc-700">High priority</dt>
                <dd className="text-zinc-950">P0 / P1 / P2</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-950">SLA policy defaults</h2>
            <div className="mt-4 grid gap-3">
              {policies.map((policy) => (
                <div key={policy.priority} className="rounded-md border border-zinc-200 p-3">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-zinc-950">{policy.priority}</h3>
                    <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-600">
                      {policy.calendarMode.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600">{policy.label}</p>
                  <p className="mt-2 text-sm text-zinc-700">
                    Warning: {policy.warningAfterDays ?? "none"} · Breach: {policy.breachAfterDays === 0 ? "same day" : `${policy.breachAfterDays} days`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
