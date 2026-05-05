"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { pct, targetColor } from "@/lib/utils";
import { TEAM_REFILL_DAILY_TARGET } from "@/lib/constants";
import type { MetricType } from "@/types";

interface GapChartProps {
  teamTotals: Record<string, number>;
  metricTypes: MetricType[];
  loading?: boolean;
}

export function GapChart({ teamTotals, metricTypes, loading }: GapChartProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  // Build items for each metric with a target
  const items = [
    // Team-wide refill target first
    {
      id: "team_refills",
      label: "Team Refills",
      icon: "🔄",
      current: teamTotals["mt_refills"] ?? 0,
      target: TEAM_REFILL_DAILY_TARGET,
      color: "#06B6D4",
    },
    // Individual metric targets
    ...metricTypes
      .filter((m) => m.target && m.isActive)
      .map((m) => ({
        id: m.id,
        label: m.name,
        icon: m.icon,
        current: teamTotals[m.id] ?? 0,
        target: m.target as number,
        color: m.color,
      })),
  ];

  const sorted = [...items].sort((a, b) => {
    const pa = pct(a.current, a.target);
    const pb = pct(b.current, b.target);
    return pa - pb; // lowest completion first (biggest gaps at top)
  });

  const hasGaps = sorted.some((i) => pct(i.current, i.target) < 100);

  return (
    <div>
      {!hasGaps && (
        <div className="flex items-center gap-2 p-3 rounded-xl mb-3"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <CheckCircle size={16} className="text-emerald-400" />
          <span className="text-sm text-emerald-300 font-medium">
            All targets met! Great work today.
          </span>
        </div>
      )}

      <div className="space-y-2.5">
        {sorted.map((item) => {
          const p = pct(item.current, item.target);
          const tc = targetColor(p);
          const gap = Math.max(item.target - item.current, 0);
          const isOnTrack = p >= 80;

          return (
            <div
              key={item.id}
              className="rounded-xl px-4 py-3 border"
              style={{
                background: p < 60
                  ? "rgba(239,68,68,0.06)"
                  : p < 80
                  ? "rgba(245,158,11,0.06)"
                  : "rgba(16,185,129,0.05)",
                borderColor: p < 60
                  ? "rgba(239,68,68,0.2)"
                  : p < 80
                  ? "rgba(245,158,11,0.15)"
                  : "rgba(16,185,129,0.15)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-200 flex items-center gap-2">
                  <span>{item.icon}</span>
                  {item.label}
                </span>
                <div className="flex items-center gap-3">
                  {!isOnTrack && gap > 0 && (
                    <span className="text-xs text-slate-500">
                      needs <span className="font-bold" style={{ color: tc }}>+{gap}</span>
                    </span>
                  )}
                  <span className="text-sm font-bold tabular-nums" style={{ color: tc }}>
                    {item.current} / {item.target}
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: tc }}
                  initial={{ width: 0 }}
                  animate={{ width: `${p}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
