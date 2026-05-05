import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, getDateRange, formatDate } from "@/lib/utils";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import type { DateRangeValue } from "@/lib/constants";

/**
 * GET /api/reports
 * Returns detailed report data for CSV/PDF export.
 * Only MANAGER and SUPER_ADMIN can access.
 * Query: ?range=...&locationId=...&format=json|csv
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Unauthorized", 401);
  if (!["MANAGER", "SUPER_ADMIN"].includes(session.user.role)) {
    return apiError("Forbidden", 403);
  }

  const { searchParams } = new URL(req.url);
  const range = (searchParams.get("range") ?? "month") as DateRangeValue;
  const locationId = searchParams.get("locationId") ?? session.user.locationId;

  const { start, end } = getDateRange(range);

  const logs = await prisma.metricLog.findMany({
    where: {
      locationId,
      workDate: { gte: start, lte: end },
    },
    include: {
      user: { select: { id: true, name: true, role: true } },
      metricType: { select: { id: true, name: true } },
    },
    orderBy: [{ workDate: "asc" }, { user: { name: "asc" } }],
  });

  // Build flat report rows
  const rows = logs.map((log) => ({
    date: format(toZonedTime(log.workDate, "America/New_York"), "yyyy-MM-dd"),
    technician: log.user.name,
    role: log.user.role,
    metric: log.metricType.name,
    value: log.value,
    notes: log.notes ?? "",
    loggedAt: format(toZonedTime(log.loggedAt, "America/New_York"), "yyyy-MM-dd HH:mm"),
  }));

  // Summary: daily totals per metric per person
  const summary: Record<string, Record<string, Record<string, number>>> = {};
  for (const log of logs) {
    const date = format(toZonedTime(log.workDate, "America/New_York"), "yyyy-MM-dd");
    if (!summary[date]) summary[date] = {};
    if (!summary[date][log.user.name]) summary[date][log.user.name] = {};
    const cur = summary[date][log.user.name][log.metricType.name] ?? 0;
    summary[date][log.user.name][log.metricType.name] = cur + log.value;
  }

  return apiSuccess({
    rows,
    summary,
    range,
    start: start.toISOString(),
    end: end.toISOString(),
    totalLogs: logs.length,
  });
}
