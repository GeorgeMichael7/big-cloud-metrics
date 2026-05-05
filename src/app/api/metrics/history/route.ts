export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, getDateRange } from "@/lib/utils";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import type { DateRangeValue } from "@/lib/constants";

/**
 * GET /api/metrics/history
 * Returns daily totals grouped by date for charts.
 * Query: ?userId=xxx&range=week|month|...&metricTypeId=xxx&locationId=xxx
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const range = (searchParams.get("range") ?? "week") as DateRangeValue;
  const userId = searchParams.get("userId");
  const metricTypeId = searchParams.get("metricTypeId");
  const locationId = searchParams.get("locationId") ?? session.user.locationId;

  const canViewOthers = ["MANAGER", "SUPER_ADMIN"].includes(session.user.role);

  const { start, end } = getDateRange(range);

  const where: Record<string, unknown> = {
    locationId,
    workDate: { gte: start, lte: end },
  };

  // Filter by user if specified
  if (userId) {
    if (!canViewOthers && userId !== session.user.id) {
      return apiError("Forbidden", 403);
    }
    where.userId = userId;
  } else if (!canViewOthers) {
    where.userId = session.user.id;
  }

  if (metricTypeId) where.metricTypeId = metricTypeId;

  const logs = await prisma.metricLog.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, avatarColor: true, role: true } },
      metricType: { select: { id: true, name: true, color: true, icon: true } },
    },
    orderBy: { workDate: "asc" },
  });

  // Group by date → user → metric
  const byDate: Record<string, Record<string, Record<string, number>>> = {};

  for (const log of logs) {
    const dateKey = format(toZonedTime(log.workDate, "America/New_York"), "yyyy-MM-dd");
    if (!byDate[dateKey]) byDate[dateKey] = {};
    if (!byDate[dateKey][log.userId]) byDate[dateKey][log.userId] = {};
    const cur = byDate[dateKey][log.userId][log.metricTypeId] ?? 0;
    byDate[dateKey][log.userId][log.metricTypeId] = cur + log.value;
  }

  // Flatten to chart-friendly array
  const chartData = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, users]) => {
      const entry: Record<string, unknown> = { date };
      for (const [uid, metrics] of Object.entries(users)) {
        for (const [mid, val] of Object.entries(metrics)) {
          entry[`${uid}__${mid}`] = val;
        }
      }
      return entry;
    });

  return apiSuccess({ chartData, byDate, range, start, end });
}
