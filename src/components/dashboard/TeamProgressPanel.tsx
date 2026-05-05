"use client";

import { motion } from "framer-motion";
import { pct, targetColor, cn } from "@/lib/utils";
import { TEAM_REFILL_DAILY_TARGET } from "@/lib/constants";
import { UserAvatar } from "@/components/shared/UserAvatar";
import type { MetricType, UserSafe } from "@/types";

interface TeamProgressPanelProps {
  teamTotals: Record<string, number>;
  byUser: Array<{
    user: UserSafe;
    totals: Record<string, number>;
    grandTotal: number;
  }>;
  metricTypes: MetricType[];
  loading?: boolean;
}

export function TeamProgressPanel({
  teamTotals,
  byUser,
  metricTypes,
  loading,
}: TeamProgressPanelProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  // Only show metrics with targets for the progress panel
  const targetedMetrics = metricTypes.filter((m) => m.target && m.isActive);

  // Team refill total for the team-level target
  const teamRefills = teamTotals["mt_refills"] ?? 0;
  const teamRefillPct = pct(teamRefills, TEAM_REFILL_DAILY_TARGET);

  return (
    <div className="space-y-3">
      {/* Team-wide refill target */}
      <ProgressRow
        label="Team Refills (Daily Goal)"
        current={teamRefills}
        target={TEAM_REFILL_DAILY_TARGET}
        pctVal={teamRefillPct}
        color="#06B6D4"
        isTeam
      />

      {/* Per-metric targeted rows */}
      {targetedMetrics.map((mt) => {
        const total = teamTotals[mt.id] ?? 0;
        const p = pct(total, mt.target ?? 0);
        return (
          <ProgressRow
            key={mt.id}
            label={`${mt.icon} ${mt.name}`}
            current={total}
            target={mt.target ?? 0}
            pctVal={p}
            color={mt.color}
          />
        );
      })}

      {/* Mini leaderboard: top contributers today */}
      {byUser.length > 0 && (
        <div
          className="rounded-xl p-4 border"
          style={{
            background: "rgba(30,41,59,0.5)",
            borderColor: "rgba(148,163,184,0.08)",
          }}
        >
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Today&apos;s Team Output
          </h4>
          <div className="space-y-2.5">
            {byUser.slice(0, 6).map((u, idx) => (
              <div key={u.user.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 w-4">
                  {idx + 1}
                </span>
                <UserAvatar name={u.user.name} color={u.user.avatarColor} size="xs" />
                <span className="text-sm text-slate-200 flex-1 truncate">
                  {u.user.name}
                </span>
                <span className="text-sm font-bold text-white tabular-nums">
                  {u.grandTotal}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressRow({
  label,
  current,
  target,
  pctVal,
  color,
  isTeam,
}: {
  label: string;
  current: number;
  target: number;
  pctVal: number;
  color: string;
  isTeam?: boolean;
}) {
  const tc = targetColor(pctVal);

  return (
    <div
      className={cn(
        "rounded-xl p-3.5 border",
        isTeam && "ring-1"
      )}
      style={{
        background: isTeam ? `${color}11` : "rgba(30,41,59,0.4)",
        borderColor: isTeam ? `${color}33` : "rgba(148,163,184,0.07)",
        ringColor: isTeam ? color : "transparent",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-300 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tabular-nums" style={{ color: tc }}>
            {pctVal}%
          </span>
          <span className="text-xs text-slate-500 tabular-nums">
            {current}/{target}
          </span>
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-white/5">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: tc }}
          initial={{ width: 0 }}
          animate={{ width: `${pctVal}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
