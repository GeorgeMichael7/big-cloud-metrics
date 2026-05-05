"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { RefreshCw, Users, TrendingUp, Target, BarChart2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Leaderboard } from "@/components/manager/Leaderboard";
import { GapChart } from "@/components/manager/GapChart";
import { ContributionChart } from "@/components/manager/ContributionChart";
import { useDashboardOverview } from "@/hooks/useTeamData";
import { useMetricTypes, useTeamMetrics } from "@/hooks/useMetrics";
import { pct, formatNumber, formatDate, targetColor } from "@/lib/utils";
import { TEAM_REFILL_DAILY_TARGET } from "@/lib/constants";

export default function ManagerPage() {
  const { data: session } = useSession();
  const [selectedMetric, setSelectedMetric] = useState<string | undefined>();
  const [leaderboardRange, setLeaderboardRange] = useState("today");

  const { data: overview, isLoading: overviewLoading, refetch } =
    useDashboardOverview();
  const { data: metricTypes } = useMetricTypes();
  const { data: teamData, isLoading: teamLoading } =
    useTeamMetrics(leaderboardRange);

  if (!session) return null;

  const teamTotals = overview?.todayTeamTotals ?? {};
  const byUser = overview?.byUser ??
    (teamData?.byUser?.map((u: { user: { id: string; name: string; role: string; avatarColor: string; isActive: boolean; locationId: string; email: string; createdAt: string; }; totals: Record<string, number>; grandTotal: number }) => u) ?? []);
  const allMetrics = metricTypes ?? [];

  // Summary stat cards
  const statsCards = [
    {
      label: "Active Team Members",
      value: overview?.team?.length ?? 0,
      icon: <Users size={20} />,
      color: "#3B82F6",
    },
    {
      label: "Team Refills Today",
      value: teamTotals["mt_refills"] ?? 0,
      suffix: `/ ${TEAM_REFILL_DAILY_TARGET}`,
      icon: <Target size={20} />,
      color: "#06B6D4",
      pctValue: pct(teamTotals["mt_refills"] ?? 0, TEAM_REFILL_DAILY_TARGET),
    },
    {
      label: "Total Calls Today",
      value: (teamTotals["mt_outbound"] ?? 0) + (teamTotals["mt_inbound"] ?? 0),
      icon: <TrendingUp size={20} />,
      color: "#8B5CF6",
    },
    {
      label: "Total Shipments",
      value: teamTotals["mt_shipments"] ?? 0,
      icon: <BarChart2 size={20} />,
      color: "#F59E0B",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Manager Overview"
        subtitle={`Live dashboard · ${formatDate(new Date())}`}
        user={{
          name: session.user.name ?? "",
          role: session.user.role,
          avatarColor: session.user.avatarColor,
        }}
        actions={
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400
                       hover:text-white hover:bg-white/5 transition-colors border border-transparent
                       hover:border-white/10"
          >
            <RefreshCw size={15} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Summary stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-4 border"
              style={{
                background: `${card.color}11`,
                borderColor: `${card.color}28`,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${card.color}22`, color: card.color }}
              >
                {card.icon}
              </div>
              <div className="text-3xl font-black text-white tabular-nums">
                {formatNumber(card.value as number)}
                {card.suffix && (
                  <span className="text-sm font-medium text-slate-400 ml-1">
                    {card.suffix}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1">{card.label}</div>
              {card.pctValue !== undefined && (
                <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: targetColor(card.pctValue) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${card.pctValue}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Main grid: Leaderboard + Gap Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leaderboard */}
          <div
            className="rounded-2xl p-5 border"
            style={{
              background: "rgba(30,41,59,0.6)",
              borderColor: "rgba(148,163,184,0.08)",
            }}
          >
            {/* Range tabs */}
            <div className="flex gap-1.5 mb-4">
              {[
                { value: "today", label: "Today" },
                { value: "week", label: "Week" },
                { value: "month", label: "Month" },
              ].map((r) => (
                <button
                  key={r.value}
                  onClick={() => setLeaderboardRange(r.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                  style={{
                    background:
                      leaderboardRange === r.value
                        ? "rgba(251,191,36,0.15)"
                        : "transparent",
                    borderColor:
                      leaderboardRange === r.value
                        ? "rgba(251,191,36,0.35)"
                        : "rgba(148,163,184,0.1)",
                    color:
                      leaderboardRange === r.value ? "#FCD34D" : "#64748B",
                  }}
                >
                  {r.label}
                </button>
              ))}

              {/* Metric filter */}
              <select
                value={selectedMetric ?? ""}
                onChange={(e) => setSelectedMetric(e.target.value || undefined)}
                className="ml-auto text-xs px-2 py-1.5 rounded-lg border outline-none"
                style={{
                  background: "#1E293B",
                  borderColor: "rgba(148,163,184,0.15)",
                  color: "#94A3B8",
                }}
              >
                <option value="">All Metrics</option>
                {allMetrics.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.icon} {m.name}
                  </option>
                ))}
              </select>
            </div>

            <Leaderboard
              entries={teamData?.byUser ?? byUser}
              metricTypes={allMetrics}
              selectedMetric={selectedMetric}
              loading={teamLoading}
            />
          </div>

          {/* Gap chart */}
          <div
            className="rounded-2xl p-5 border"
            style={{
              background: "rgba(30,41,59,0.6)",
              borderColor: "rgba(148,163,184,0.08)",
            }}
          >
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Target size={16} className="text-red-400" />
              Today&apos;s Gap Analysis
            </h3>
            <GapChart
              teamTotals={teamTotals}
              metricTypes={allMetrics}
              loading={overviewLoading}
            />
          </div>
        </div>

        {/* Contribution charts per metric */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-4">
            Per-Metric Contribution Today
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {allMetrics
              .filter((m) => (teamTotals[m.id] ?? 0) > 0)
              .map((mt) => (
                <div
                  key={mt.id}
                  className="rounded-2xl p-5 border"
                  style={{
                    background: `${mt.color}08`,
                    borderColor: `${mt.color}22`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{mt.icon}</span>
                    <span className="text-sm font-semibold text-white">
                      {mt.name}
                    </span>
                  </div>
                  <ContributionChart
                    metricType={mt}
                    entries={teamData?.byUser ?? byUser}
                    loading={overviewLoading || teamLoading}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
