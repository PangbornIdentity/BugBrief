"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardModel } from "@/lib/reports";

const pieColors = ["#2563eb", "#10b981"];

type ChartSize = {
  width: number;
  height: number;
};

function ChartPlaceholder() {
  return <div className="h-full rounded-md border border-dashed border-zinc-200 bg-zinc-50" aria-hidden="true" />;
}

function ChartPanel({ title, children }: { title: string; children: (size: ChartSize) => ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ChartSize | null>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) => {
      const nextSize = {
        width: Math.floor(entry.contentRect.width),
        height: Math.floor(entry.contentRect.height),
      };

      if (nextSize.width <= 0 || nextSize.height <= 0) {
        return;
      }

      setSize((current) =>
        current?.width === nextSize.width && current.height === nextSize.height ? current : nextSize,
      );
    });

    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-950">{title}</h2>
      <div ref={frameRef} className="mt-4 h-64 min-h-64 w-full min-w-0">
        {size ? children(size) : <ChartPlaceholder />}
      </div>
    </section>
  );
}

export function DashboardCharts({ model }: { model: DashboardModel }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartPanel title="Bug and defect influx">
        {({ width, height }) => (
          <AreaChart width={width} height={height} data={model.influxByWeek} margin={{ left: 0, right: 16, top: 10, bottom: 0 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={28} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="escaped" name="Escaped" stackId="1" stroke="#2563eb" fill="#93c5fd" />
            <Area type="monotone" dataKey="defects" name="Defects" stackId="1" stroke="#10b981" fill="#a7f3d0" />
          </AreaChart>
        )}
      </ChartPanel>

      <ChartPanel title="SLA outcomes by priority">
        {({ width, height }) => (
          <BarChart width={width} height={height} data={model.slaByPriority} margin={{ left: 0, right: 16, top: 10, bottom: 0 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={28} />
            <Tooltip />
            <Legend />
            <Bar dataKey="met" stackId="sla" name="Met" fill="#10b981" />
            <Bar dataKey="missed" stackId="sla" name="Missed" fill="#ef4444" />
            <Bar dataKey="atRisk" stackId="sla" name="At risk" fill="#f59e0b" />
            <Bar dataKey="breached" stackId="sla" name="Breached" fill="#991b1b" />
          </BarChart>
        )}
      </ChartPanel>

      <ChartPanel title="P0/P1/P2 time to fix">
        {({ width, height }) => (
          <LineChart width={width} height={height} data={model.timeToFixByPriority} margin={{ left: 0, right: 16, top: 10, bottom: 0 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} width={34} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="averageDays" name="Avg days" stroke="#2563eb" strokeWidth={3} />
            <Line type="monotone" dataKey="targetDays" name="Target" stroke="#f97316" strokeDasharray="5 5" strokeWidth={2} />
          </LineChart>
        )}
      </ChartPanel>

      <ChartPanel title="Escaped vs unescaped">
        {({ width, height }) => (
          <PieChart width={width} height={height}>
            <Tooltip />
            <Legend />
            <Pie data={model.issueMix} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={4}>
              {model.issueMix.map((entry, index) => (
                <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
          </PieChart>
        )}
      </ChartPanel>
    </div>
  );
}
