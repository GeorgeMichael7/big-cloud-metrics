"use client";

import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { useMetricHistory } from "@/hooks/useMetrics";
import { DATE_RANGES } from "@/lib/constants";
import type { MetricType, UserSafe } from "@/types";

interface TrendChartProps {
  metricType: MetricType;
  team: UserSafe[];
  initialRange?: string;
}

export function TrendChart({ metricType, team, initialRange = "week" }: TrendChartProps) {
  const [range, setRange] = useState(initialRange);
  const { data: historyData, isLoading } = useMetricHistory(range, {
    metricTypeId: metricType.id,
  });

  // Build chart data: one point per date, one line per team member
  const chartData =
    historyData?.chartData?.map((point: Record<string, unknown>) => {
      const entry: Record<string, unknown> = {
        date: format(new Date(point.date as string), "MMM d"),
      };
      for (const usr of team) {
        const key = `${usr.id}__${metricType.id}`;
        entry[usr.name] = (point[key] as number) ?? 0;
      }
      return entry;
    }) ?? [];

  const validRanges = ["week", "month", "3months"] as const;

  return (
    <div>
      {/* Range tabs */}
      <div className="flex gap-1.5 mb-4">
        {validRanges.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
            style={{
              background: range === r ? "rgba(59,130,246,0.2)" : "transparent",
              borderColor: range === r ? "rgba(59,130,246,0.4)" : "rgba(148,163,184,0.1)",
              color: range === r ? "#60A5FA" : "#64748B",
            }}
          >
            {DATE_RANGES.find((d) => d.value === r)?.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="skeleton h-52 rounded-xl" />
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148,163,184,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "#64748B", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748B", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            {metricType.target && (
              <ReferenceLine
                y={metricType.target}
                stroke={metricType.color}
                strokeDasharray="4 4"
                strokeOpacity={0.5}
                label={{ value: "Goal", fill: "#64748B", fontSize: 11 }}
              />
            )}
            <Tooltip
              contentStyle={{
                background: "#1E293B",
                border: "1px solid rgba(148,163,184,0.15)",
                borderRadius: "10px",
                color: "#F1F5F9",
                fontSize: "12px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", color: "#94A3B8" }}
            />
            {team.map((usr) => (
              <Line
                key={usr.id}
                type="monotone"
                dataKey={usr.name}
                stroke={usr.avatarColor}
                strokeWidth={2}
                dot={{ fill: usr.avatarColor, r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-52 flex items-center justify-center text-slate-500 text-sm">
          No data for this period.
        </div>
      )}
    </div>
  );
}
