export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, todayNY, getDateRange } from "@/lib/utils";
import { TEAM_REFILL_DAILY_TARGET } from "@/lib/constants";

/**
 * GET /api/dashboard/overview
 * Returns a full snapshot for the manager overview dashboard.
 */
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Unauthorized", 401);
  if (!["MANAGER", "SUPER_ADMIN"].includes(session.user.role)) {
    return apiError("Forbidden", 403);
  }

  const locationId = session.user.locationId;
  const today = todayNY();
  const { start: weekStart, end: weekEnd } = getDateRange("week");

  // Today's logs
  const todayLogs = await prisma.metricLog.findMany({
    where: { locationId, workDate: today },
    include: {
      user: { select: { id: true, name: true, role: true, avatarColor: true } },
      metricType: { select: { id: true, name: true, color: true, icon: true, target: true, targetScope: true } },
    },
  });

  // This week's logs (for leaderboard trends)
  const weekLogs = await prisma.metricLog.findMany({
    where: { locationId, workDate: { gte: weekStart, lte: weekEnd } },
    select: { userId: true, metricTypeId: true, value: true },
  });

  // Active team members
  const team = await prisma.user.findMany({
    where: { locationId, isActive: true, role: { in: ["TECHNICIAN", "PHARMACIST"] } },
    select: { id: true, name: true, role: true, avatarColor: true },
    orderBy: { name: "asc" },
  });

  // Active metric types
  const metricTypes = await prisma.metricType.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  });

  // Build today's aggregates
  const todayByUser: Record<string, Record<string, number>> = {};
  const todayTeamTotals: Record<string, number> = {};

  for (const log of todayLogs) {
    if (!todayByUser[log.userId]) todayByUser[log.userId] = {};
    todayByUser[log.userId][log.metricTypeId] =
      (todayByUser[log.userId][log.metricTypeId] ?? 0) + log.value;
    todayTeamTotals[log.metricTypeId] =
      (todayTeamTotals[log.metricTypeId] ?? 0) + log.value;
  }

  // Week aggregates for trend arrows
  const weekByUser: Record<string, number> = {};
  for (const log of weekLogs) {
    weekByUser[log.userId] = (weekByUser[log.userId] ?? 0) + log.value;
  }

  // Team refill progress
  const teamRefillTotal = todayTeamTotals["mt_refills"] ?? 0;
  const teamRefillPct = Math.min(
    Math.round((teamRefillTotal / TEAM_REFILL_DAILY_TARGET) * 100),
    100
  );

  return apiSuccess({
    today: today.toISOString(),
    team,
    metricTypes,
    todayByUser,
    todayTeamTotals,
    weekByUser,
    teamRefillTarget: { current: teamRefillTotal, target: TEAM_REFILL_DAILY_TARGET, pct: teamRefillPct },
  });
}
