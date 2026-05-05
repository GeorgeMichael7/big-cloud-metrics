"use client";

import { useQuery } from "@tanstack/react-query";
import { DASHBOARD_REFRESH_INTERVAL } from "@/lib/constants";

/** Fetch all users (managers/admins only) */
export function useUsers(locationId?: string) {
  const params = new URLSearchParams();
  if (locationId) params.set("locationId", locationId);

  return useQuery({
    queryKey: ["users", locationId],
    queryFn: async () => {
      const res = await fetch(`/api/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });
}

/** Manager overview snapshot */
export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/overview");
      if (!res.ok) throw new Error("Failed to fetch overview");
      return res.json();
    },
    refetchInterval: DASHBOARD_REFRESH_INTERVAL,
  });
}

/** Report data for export */
export function useReportData(range: string) {
  return useQuery({
    queryKey: ["report", range],
    queryFn: async () => {
      const res = await fetch(`/api/reports?range=${range}`);
      if (!res.ok) throw new Error("Failed to fetch report");
      return res.json();
    },
    enabled: !!range,
  });
}
