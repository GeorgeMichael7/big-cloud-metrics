"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/Header";
import { TrendChart } from "@/components/manager/TrendChart";
import { useMetricTypes, useTeamMetrics } from "@/hooks/useMetrics";
import { useUsers } from "@/hooks/useTeamData";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { formatNumber } from "@/lib/utils";
import type { UserSafe } from "@/types";

export default function TeamDashboardPage() {
  const { data: session } = useSession();
  const [selectedMetricId, setSelectedMetricId] = useState("mt_refills");

  const { data: metricTypes } = useMetricTypes();
  const { data: teamData } = useTeamMetrics("today");
  const { data: users } = useUsers();

  if (!session) return null;

  const teamMembers: UserSafe[] = (users ?? []).filter(
    (u: UserSafe) => u.isActive && ["TECHNICIAN", "PHARMACIST"].includes(u.role)
  );

  const selectedMt = metricTypes?.find((m) => m.id === selectedMetricId);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Team Dashboard"
        subtitle="Full team performance view"
        user={{
          name: session.user.name ?? "",
          role: session.user.role,
          avatarColor: session.user.avatarColor,
        }}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Metric selector */}
        <div className="flex flex-wrap gap-2">
          {(metricTypes ?? []).map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMetricId(m.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border"
              style={{
                background:
                  selectedMetricId === m.id
                    ? `${m.color}22`
                    : "rgba(30,41,59,0.5)",
                borderColor:
                  selectedMetricId === m.id
                    ? `${m.color}44`
                    : "rgba(148,163,184,0.1)",
                color: selectedMetricId === m.id ? m.color : "#64748B",
              }}
            >
              <span>{m.icon}</span>
              {m.name}
            </button>
          ))}
        </div>

        {/* Trend chart for selected metric */}
        {selectedMt && (
          <div
            className="rounded-2xl p-6 border"
            style={{
              background: "rgba(30,41,59,0.6)",
              borderColor: "rgba(148,163,184,0.08)",
            }}
          >
            <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
              <span className="text-xl">{selectedMt.icon}</span>
              {selectedMt.name} — Trend by Team Member
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Each line shows one team member's daily total
            </p>
            <TrendChart
              metricType={selectedMt}
              team={teamMembers}
            />
          </div>
        )}

        {/* Today's team table */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            background: "rgba(30,41,59,0.6)",
            borderColor: "rgba(148,163,184,0.08)",
          }}
        >
          <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(148,163,184,0.08)" }}>
            <h3 className="text-sm font-semibold text-white">
              Today — All Metrics by Team Member
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Member
                  </th>
                  {(metricTypes ?? []).slice(0, 7).map((m) => (
                    <th
                      key={m.id}
                      className="text-center px-3 py-3 text-xs font-medium uppercase tracking-wide"
                      style={{ color: m.color }}
                    >
                      <span title={m.name}>{m.icon}</span>
                    </th>
                  ))}
                  <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {(teamData?.byUser ?? []).map(
                  (entry: {
                    user: UserSafe;
                    totals: Record<string, number>;
                    grandTotal: number;
                  }) => (
                    <tr
                      key={entry.user.id}
                      className="border-b hover:bg-white/3 transition-colors"
                      style={{ borderColor: "rgba(148,163,184,0.05)" }}
                    >
                      <td className="px-5 py-3">
                        <UserAvatar
                          name={entry.user.name}
                          color={entry.user.avatarColor}
                          size="sm"
                          showName
                          role={entry.user.role.toLowerCase()}
                        />
                      </td>
                      {(metricTypes ?? []).slice(0, 7).map((m) => (
                        <td
                          key={m.id}
                          className="text-center px-3 py-3 text-sm font-semibold tabular-nums"
                          style={{ color: (entry.totals[m.id] ?? 0) > 0 ? m.color : "#334155" }}
                        >
                          {entry.totals[m.id] ?? 0}
                        </td>
                      ))}
                      <td className="text-right px-5 py-3 text-white font-black tabular-nums">
                        {formatNumber(entry.grandTotal)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
