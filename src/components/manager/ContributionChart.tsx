"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from "recharts";
import type { MetricType, UserSafe } from "@/types";

interface ContributionEntry {
  user: UserSafe;
  totals: Record<string, number>;
  grandTotal: number;
}

interface ContributionChartProps {
  metricType: MetricType;
  entries: ContributionEntry[];
  loading?: boolean;
}

export function ContributionChart({
  metricType,
  entries,
  loading,
}: ContributionChartProps) {
  if (loading) return <div className="skeleton h-64 rounded-xl" />;

  const data = entries
    .filter((e) => (e.totals[metricType.id] ?? 0) > 0)
    .sort((a, b) => (b.totals[metricType.id] ?? 0) - (a.totals[metricType.id] ?? 0))
    .map((e) => ({
      name: e.user.name.split(" ")[0], // first name only for chart labels
      value: e.totals[metricType.id] ?? 0,
      color: e.user.avatarColor,
    }));

  const total = data.reduce((acc, d) => acc + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
        No data yet for {metricType.name} today.
      </div>
    );
  }

  return (
    <div>
      {/* Team total headline */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400">
          Team total today
        </span>
        <span
          className="text-2xl font-black tabular-nums"
          style={{ color: metricType.color }}
        >
          {total}
          {metricType.target && (
            <span className="text-sm font-medium text-slate-400 ml-1">
              / {metricType.target}
            </span>
          )}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(148,163,184,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "#64748B", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748B", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(148,163,184,0.04)" }}
            contentStyle={{
              background: "#1E293B",
              border: "1px solid rgba(148,163,184,0.15)",
              borderRadius: "10px",
              color: "#F1F5F9",
              fontSize: "13px",
            }}
            formatter={(val: number) => [val, metricType.name]}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.9} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Percentage breakdown */}
      <div className="mt-3 flex flex-wrap gap-2">
        {data.map((d) => (
          <div
            key={d.name}
            className="flex items-center gap-1.5 text-xs"
          >
            <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
            <span className="text-slate-400">{d.name}</span>
            <span className="font-semibold text-slate-200">
              {total > 0 ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
