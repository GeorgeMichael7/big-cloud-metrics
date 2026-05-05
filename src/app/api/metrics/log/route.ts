export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, todayNY } from "@/lib/utils";
import { z } from "zod";

const LogSchema = z.object({
  metricTypeId: z.string().min(1),
  value: z.number().min(0.1).max(9999).default(1),
  notes: z.string().max(500).optional(),
  workDate: z.string().optional(), // ISO date; defaults to today NY
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Unauthorized", 401);

  const body = await req.json();
  const parsed = LogSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.message, 400);

  const { metricTypeId, value, notes, workDate } = parsed.data;

  // Verify the metric type exists and is active
  const metricType = await prisma.metricType.findFirst({
    where: { id: metricTypeId, isActive: true },
  });
  if (!metricType) return apiError("Metric type not found", 404);

  const logDate = workDate
    ? new Date(workDate)
    : todayNY();

  const log = await prisma.metricLog.create({
    data: {
      userId: session.user.id,
      metricTypeId,
      locationId: session.user.locationId,
      workDate: logDate,
      value,
      notes: notes ?? null,
    },
  });

  // Return the new log + today's running total for this metric
  const todayTotal = await prisma.metricLog.aggregate({
    where: {
      userId: session.user.id,
      metricTypeId,
      workDate: logDate,
    },
    _sum: { value: true },
  });

  return apiSuccess({
    log,
    todayTotal: todayTotal._sum.value ?? 0,
  });
}
