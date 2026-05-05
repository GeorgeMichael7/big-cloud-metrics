import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, todayNY } from "@/lib/utils";

/**
 * GET /api/metrics/today
 * Returns the current user's metric totals for today.
 * Query: ?userId=xxx (managers can query other users)
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const requestedUserId = searchParams.get("userId");

  // Non-managers can only view their own data
  const canViewOthers = ["MANAGER", "SUPER_ADMIN"].includes(session.user.role);
  const targetUserId =
    requestedUserId && canViewOthers ? requestedUserId : session.user.id;

  const today = todayNY();

  const logs = await prisma.metricLog.findMany({
    where: {
      userId: targetUserId,
      workDate: today,
    },
    include: { metricType: true },
    orderBy: { loggedAt: "desc" },
  });

  // Aggregate totals per metric type
  const totals: Record<string, number> = {};
  const recentLogs: typeof logs = [];

  for (const log of logs) {
    totals[log.metricTypeId] = (totals[log.metricTypeId] ?? 0) + log.value;
  }

  // Return last 20 log events for the activity feed
  recentLogs.push(...logs.slice(0, 20));

  return apiSuccess({ totals, recentLogs, date: today.toISOString() });
}
