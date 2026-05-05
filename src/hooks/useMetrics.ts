"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DASHBOARD_REFRESH_INTERVAL } from "@/lib/constants";
import type { MetricType, LogMetricInput } from "@/types";

/** Fetch all active metric types */
export function useMetricTypes() {
  return useQuery<MetricType[]>({
    queryKey: ["metric-types"],
    queryFn: async () => {
      const res = await fetch("/api/metric-types");
      if (!res.ok) throw new Error("Failed to fetch metric types");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 min — metric types rarely change
  });
}

/** Today's totals for the current user */
export function useTodayMetrics(userId?: string) {
  const url = userId
    ? `/api/metrics/today?userId=${userId}`
    : "/api/metrics/today";

  return useQuery<{
    totals: Record<string, number>;
    recentLogs: Array<{
      id: string;
      metricTypeId: string;
      value: number;
      notes: string | null;
      loggedAt: string;
      metricType: MetricType;
    }>;
    date: string;
  }>({
    queryKey: ["metrics-today", userId ?? "me"],
    queryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch today's metrics");
      return res.json();
    },
    refetchInterval: DASHBOARD_REFRESH_INTERVAL,
  });
}

/** Log a metric increment */
export function useLogMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LogMetricInput) => {
      const res = await fetch("/api/metrics/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to log metric");
      }
      return res.json();
    },
    onSuccess: (data) => {
      // Immediately update today's cache optimistically
      queryClient.invalidateQueries({ queryKey: ["metrics-today"] });
      queryClient.invalidateQueries({ queryKey: ["metrics-team"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

/** Team metrics for a date range */
export function useTeamMetrics(range: string = "today") {
  return useQuery({
    queryKey: ["metrics-team", range],
    queryFn: async () => {
      const res = await fetch(`/api/metrics/team?range=${range}`);
      if (!res.ok) throw new Error("Failed to fetch team metrics");
      return res.json();
    },
    refetchInterval: DASHBOARD_REFRESH_INTERVAL,
  });
}

/** Historical chart data */
export function useMetricHistory(
  range: string,
  options?: { userId?: string; metricTypeId?: string }
) {
  const params = new URLSearchParams({ range });
  if (options?.userId) params.set("userId", options.userId);
  if (options?.metricTypeId) params.set("metricTypeId", options.metricTypeId);

  return useQuery({
    queryKey: ["metrics-history", range, options],
    queryFn: async () => {
      const res = await fetch(`/api/metrics/history?${params}`);
      if (!res.ok) throw new Error("Failed to fetch history");
      return res.json();
    },
  });
}
