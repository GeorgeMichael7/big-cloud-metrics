"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Clock, TrendingUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/Header";
import { MetricLogCard } from "@/components/dashboard/MetricLogCard";
import { TeamProgressPanel } from "@/components/dashboard/TeamProgressPanel";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useMetricTypes, useTodayMetrics } from "@/hooks/useMetrics";
import { useTeamMetrics } from "@/hooks/useMetrics";
import { formatTime } from "@/lib/utils";

export default function TechDashboardPage() {
  const { data: session } = useSession();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const { data: metricTypes, isLoading: typesLoading } = useMetricTypes();
  const { data: todayData, isLoading: todayLoading, refetch: refetchToday } =
    useTodayMetrics();
  const { data: teamData, isLoading: teamLoading } = useTeamMetrics("today");

  function handleRefresh() {
    refetchToday();
    setLastUpdated(new Date());
  }

  const totals: Record<string, number> = todayData?.totals ?? {};

  // Grand total of all the user's metrics today
  const grandTotal = useMemo(
    () => Object.values(totals).reduce((a, b) => a + b, 0),
    [totals]
  );

  if (!session) return null;

  const isLoading = typesLoading || todayLoading;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="My Dashboard"
        subtitle={`${session.user.name} · Today's Metrics`}
        user={{
          name: session.user.name ?? "",
          role: session.user.role,
          avatarColor: session.user.avatarColor,
        }}
        actions={
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400
                       hover:text-white hover:bg-white/5 transition-colors border border-transparent
                       hover:border-white/10"
          >
            <RefreshCw size={15} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Welcome strip */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <UserAvatar
              name={session.user.name ?? ""}
              color={session.user.avatarColor}
              size="lg"
            />
            <div>
              <h2 className="text-xl font-bold text-white">
                Good {getGreeting()}, {session.user.name?.split(" ")[0]}! 👋
              </h2>
              <p className="text-sm text-slate-400">
                You&apos;ve logged{" "}
                <span className="font-bold text-blue-400">{grandTotal}</span>{" "}
                metric{grandTotal !== 1 ? "s" : ""} today.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <Clock size={13} />
            Updated {formatTime(lastUpdated)}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          {/* Left: Metric cards grid */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-300">
                Log Your Metrics
              </h3>
              <span className="ml-1 text-xs text-slate-500">
                — tap +1 after each completed task
              </span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton h-52 rounded-2xl" />
                ))}
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.05 } },
                }}
              >
                {(metricTypes ?? []).map((mt) => (
                  <motion.div
                    key={mt.id}
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <MetricLogCard
                      metricType={mt}
                      todayTotal={totals[mt.id] ?? 0}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Right: Team progress */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-slate-300">
                Team Progress Today
              </span>
            </div>
            <TeamProgressPanel
              teamTotals={teamData?.teamTotals ?? {}}
              byUser={teamData?.byUser ?? []}
              metricTypes={metricTypes ?? []}
              loading={teamLoading}
            />
          </div>
        </div>

        {/* Recent activity feed */}
        {(todayData?.recentLogs?.length ?? 0) > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">
              Recent Activity
            </h3>
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                background: "rgba(30,41,59,0.5)",
                borderColor: "rgba(148,163,184,0.08)",
              }}
            >
              {todayData!.recentLogs.slice(0, 8).map((log, i) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
                  style={{ borderColor: "rgba(148,163,184,0.06)" }}
                >
                  <span className="text-lg">{log.metricType.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-slate-200">
                      {log.metricType.name}
                    </span>
                    {log.notes && (
                      <p className="text-xs text-slate-500 truncate">{log.notes}</p>
                    )}
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: log.metricType.color }}
                  >
                    +{log.value}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatTime(log.loggedAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
