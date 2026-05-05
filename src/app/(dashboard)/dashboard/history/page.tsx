"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/Header";
import { useMetricTypes, useMetricHistory } from "@/hooks/useMetrics";
import { formatNumber, formatDateLong } from "@/lib/utils";
import { DATE_RANGES } from "@/lib/constants";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { format } from "date-fns";

export default function HistoryPage() {
  const { data: session } = useSession();
  const [range, setRange] = useState("week");
  const { data: metricTypes } = useMetricTypes();
  const { data: historyData, isLoading } = useMetricHistory(range, {
    userId: session?.user.id,
  });

  if (!session) return null;

  // Build chart-friendly data from history
  const chartData =
    historyData?.chartData?.map((point: Record<string, unknown>) => {
      const entry: Record<string, unknown> = {
        date: format(new Date(point.date as string), "MMM d"),
      };
      // Sum all metrics for this user on this date
      let dayTotal = 0;
      for (const [key, val] of Object.entries(point)) {
        if (key.startsWith(session.user.id + "__")) {
          const mid = key.split("__")[1];
          const mt = metricTypes?.find((m) => m.id === mid);
          if (mt) entry[mt.name] = val;
          dayTotal += (val as number) || 0;
        }
      }
      entry.Total = dayTotal;
      return entry;
    }) ?? [];

  const colors = metricTypes?.map((m) => m.color) ?? [];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="My History"
        subtitle="Your personal performance over time"
        user={{
          name: session.user.name ?? "",
          role: session.user.role,
          avatarColor: session.user.avatarColor,
        }}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Range selector */}
        <div className="flex flex-wrap gap-2">
          {DATE_RANGES.filter((r) => r.value !== "custom").map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all border"
              style={{
                background:
                  range === r.value
                    ? "rgba(59,130,246,0.2)"
                    : "rgba(30,41,59,0.5)",
                borderColor:
                  range === r.value
                    ? "rgba(59,130,246,0.5)"
                    : "rgba(148,163,184,0.1)",
                color: range === r.value ? "#60A5FA" : "#94A3B8",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div
          className="rounded-2xl p-6 border"
          style={{
            background: "rgba(30,41,59,0.6)",
            borderColor: "rgba(148,163,184,0.08)",
          }}
        >
          <h3 className="text-base font-semibold text-white mb-4">
            Daily Output — {DATE_RANGES.find((r) => r.value === range)?.label}
          </h3>
          {isLoading ? (
            <div className="skeleton h-64 rounded-xl" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.08)"
                />
                <XAxis
                  dataKey="date"
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
                  contentStyle={{
                    background: "#1E293B",
                    border: "1px solid rgba(148,163,184,0.15)",
                    borderRadius: "12px",
                    color: "#F1F5F9",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", color: "#94A3B8" }}
                />
                {metricTypes
                  ?.filter((mt) =>
                    chartData.some((d: Record<string, unknown>) => d[mt.name] !== undefined)
                  )
                  .map((mt) => (
                    <Line
                      key={mt.id}
                      type="monotone"
                      dataKey={mt.name}
                      stroke={mt.color}
                      strokeWidth={2}
                      dot={{ fill: mt.color, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              No data for this period yet.
            </div>
          )}
        </div>

        {/* Summary stats */}
        {!isLoading && chartData.length > 0 && (
          <div
            className="rounded-2xl p-6 border"
            style={{
              background: "rgba(30,41,59,0.6)",
              borderColor: "rgba(148,163,184,0.08)",
            }}
          >
            <h3 className="text-base font-semibold text-white mb-4">
              Period Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {metricTypes
                ?.filter((mt) => {
                  const sum = chartData.reduce(
                    (acc: number, d: Record<string, unknown>) => acc + ((d[mt.name] as number) ?? 0),
                    0
                  );
                  return sum > 0;
                })
                .map((mt) => {
                  const sum = chartData.reduce(
                    (acc: number, d: Record<string, unknown>) => acc + ((d[mt.name] as number) ?? 0),
                    0
                  );
                  const avg = (sum / Math.max(chartData.length, 1)).toFixed(1);
                  return (
                    <div
                      key={mt.id}
                      className="rounded-xl p-4 border"
                      style={{
                        background: `${mt.color}11`,
                        borderColor: `${mt.color}33`,
                      }}
                    >
                      <div className="text-xl mb-1">{mt.icon}</div>
                      <div className="text-2xl font-black text-white tabular-nums">
                        {formatNumber(sum)}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {mt.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        avg {avg}/day
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
