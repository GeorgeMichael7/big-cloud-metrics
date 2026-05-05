"use client";

import { motion } from "framer-motion";
import { Crown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { formatNumber, cn } from "@/lib/utils";
import type { UserSafe, MetricType } from "@/types";

interface LeaderboardEntry {
  user: UserSafe;
  totals: Record<string, number>;
  grandTotal: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  metricTypes: MetricType[];
  selectedMetric?: string; // show per-metric leaderboard if set
  loading?: boolean;
  title?: string;
}

export function Leaderboard({
  entries,
  metricTypes,
  selectedMetric,
  loading,
  title = "Team Leaderboard",
}: LeaderboardProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  const mt = selectedMetric
    ? metricTypes.find((m) => m.id === selectedMetric)
    : null;

  const sorted = [...entries].sort((a, b) => {
    const aVal = selectedMetric ? (a.totals[selectedMetric] ?? 0) : a.grandTotal;
    const bVal = selectedMetric ? (b.totals[selectedMetric] ?? 0) : b.grandTotal;
    return bVal - aVal;
  });

  const RANK_STYLES = [
    { bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.3)", text: "#FCD34D" },
    { bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.25)", text: "#CBD5E1" },
    { bg: "rgba(217,119,6,0.12)", border: "rgba(217,119,6,0.25)", text: "#D97706" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Crown size={16} className="text-amber-400" />
          {title}
          {mt && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${mt.color}22`, color: mt.color }}
            >
              {mt.icon} {mt.name}
            </span>
          )}
        </h3>
      </div>

      <div className="space-y-2">
        {sorted.map((entry, idx) => {
          const value = selectedMetric
            ? (entry.totals[selectedMetric] ?? 0)
            : entry.grandTotal;
          const rank = idx + 1;
          const style = RANK_STYLES[idx] ?? {};
          const isTop3 = idx < 3;

          return (
            <motion.div
              key={entry.user.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
                isTop3 ? "hover:brightness-110" : "hover:bg-white/5"
              )}
              style={
                isTop3
                  ? {
                      background: style.bg,
                      borderColor: style.border,
                    }
                  : {
                      background: "rgba(30,41,59,0.4)",
                      borderColor: "rgba(148,163,184,0.07)",
                    }
              }
            >
              {/* Rank */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0"
                style={
                  isTop3
                    ? { background: style.border, color: style.text }
                    : { background: "rgba(148,163,184,0.1)", color: "#64748B" }
                }
              >
                {rank === 1 ? "👑" : rank}
              </div>

              {/* Avatar + Name */}
              <UserAvatar
                name={entry.user.name}
                color={entry.user.avatarColor}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-200 truncate">
                  {entry.user.name}
                </div>
                <div className="text-xs text-slate-500 capitalize">
                  {entry.user.role.toLowerCase().replace("_", " ")}
                </div>
              </div>

              {/* Per-metric mini bars */}
              {!selectedMetric && (
                <div className="hidden md:flex items-center gap-1 mr-2">
                  {metricTypes.slice(0, 5).map((m) => {
                    const v = entry.totals[m.id] ?? 0;
                    const pct = m.target ? Math.min((v / m.target) * 100, 100) : 0;
                    return (
                      <div key={m.id} title={`${m.name}: ${v}`}
                        className="w-1.5 rounded-full"
                        style={{
                          height: `${Math.max(pct * 0.24, 4)}px`,
                          background: m.color,
                          opacity: v > 0 ? 1 : 0.2,
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Value */}
              <div className="text-right">
                <div
                  className="text-lg font-black tabular-nums"
                  style={isTop3 ? { color: style.text } : { color: "#F1F5F9" }}
                >
                  {formatNumber(value)}
                </div>
                {selectedMetric && mt?.target && (
                  <div className="text-xs text-slate-500">
                    of {mt.target} goal
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
