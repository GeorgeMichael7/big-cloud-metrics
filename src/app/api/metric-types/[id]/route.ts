export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/utils";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(300).optional(),
  inputType: z.enum(["INTEGER", "INTEGER_WITH_NOTES", "NOTES_ONLY"]).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(4).optional(),
  target: z.number().positive().nullable().optional(),
  targetScope: z.enum(["PER_TECH", "PER_PHARMACIST", "PER_PERSON", "TEAM_TOTAL"]).nullable().optional(),
  applicableRoles: z.string().optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

/** PUT /api/metric-types/[id] */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Unauthorized", 401);
  if (!["MANAGER", "SUPER_ADMIN"].includes(session.user.role)) {
    return apiError("Forbidden", 403);
  }

  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.message, 400);

  const metricType = await prisma.metricType.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return apiSuccess(metricType);
}

/** DELETE /api/metric-types/[id] — soft delete (deactivate) */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Unauthorized", 401);
  if (!["MANAGER", "SUPER_ADMIN"].includes(session.user.role)) {
    return apiError("Forbidden", 403);
  }

  await prisma.metricType.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  return apiSuccess({ message: "Metric type deactivated" });
}
