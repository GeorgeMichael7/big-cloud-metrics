export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, todayNY, getDateRange } from "@/lib/utils";
import type { DateRangeValue } from "@/lib/constants";

/**
 * GET /api/metrics/team
 * Returns aggregated team metrics for a given date range.
 * All authenticated users can access this (techs see team too).
 * Query: ?range=today|week|month|3months|6months|year
 *        &locationId=xxx (defaults to user's location)
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const range = (searchParams.get("range") ?? "today") as DateRangeValue;
  const locationId = searchParams.get("locationId") ?? session.user.locationId;

  const { start, end } =
    range === "today"
      ? { start: todayNY(), end: todayNY() }
      : getDateRange(range);

  // Fetch all logs for this location + date range
  const logs = await prisma.metricLog.findMany({
    where: {
      locationId,
      workDate: { gte: start, lte: end },
    },
    include: {
      user: {
        select: {
          id: true, name: true, email: true,
          role: true, avatarColor: true, isActive: true,
          locationId: true, createdAt: true,
        },
      },
      metricType: true,
    },
    orderBy: { loggedAt: "asc" },
  });

  // Build per-user totals: { userId → { metricTypeId → sum } }
  const byUser: Record<string, Record<string, number>> = {};
  const teamTotals: Record<string, number> = {};
  const userMap: Record<string, typeof logs[0]["user"]> = {};

  for (const log of logs) {
    const uid = log.userId;
    const mid = log.metricTypeId;

    if (!byUser[uid]) byUser[uid] = {};
    byUser[uid][mid] = (byUser[uid][mid] ?? 0) + log.value;
    teamTotals[mid] = (teamTotals[mid] ?? 0) + log.value;
    userMap[uid] = log.user;
  }

  // Format response
  const byUserArray = Object.entries(byUser).map(([userId, totals]) => ({
    user: userMap[userId],
    totals,
    grandTotal: Object.values(totals).reduce((a, b) => a + b, 0),
  }));

  // Sort by grandTotal descending (leaderboard order)
  byUserArray.sort((a, b) => b.grandTotal - a.grandTotal);

  return apiSuccess({ byUser: byUserArray, teamTotals, range, start, end });
}
