export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/utils";
import { z } from "zod";

const CreateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(300).optional(),
  inputType: z.enum(["INTEGER", "INTEGER_WITH_NOTES", "NOTES_ONLY"]).default("INTEGER"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#3B82F6"),
  icon: z.string().max(4).default("📊"),
  target: z.number().positive().optional(),
  targetScope: z.enum(["PER_TECH", "PER_PHARMACIST", "PER_PERSON", "TEAM_TOTAL"]).optional(),
  applicableRoles: z.string().default(""),
  displayOrder: z.number().int().default(99),
});

/** GET /api/metric-types — list all metric types */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get("active") !== "false";

  const types = await prisma.metricType.findMany({
    where: activeOnly ? { isActive: true } : {},
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });

  // Filter by applicable roles for the current user (show ALL to managers/admins)
  const canSeeAll = ["MANAGER", "SUPER_ADMIN"].includes(session.user.role);
  const filtered = canSeeAll
    ? types
    : types.filter((t) => {
        if (!t.applicableRoles) return true; // empty = all roles
        return t.applicableRoles
          .split(",")
          .includes(session.user.role);
      });

  return apiSuccess(filtered);
}

/** POST /api/metric-types — create a new metric type (MANAGER/SUPER_ADMIN) */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Unauthorized", 401);
  if (!["MANAGER", "SUPER_ADMIN"].includes(session.user.role)) {
    return apiError("Forbidden", 403);
  }

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.message, 400);

  const metricType = await prisma.metricType.create({ data: parsed.data });
  return apiSuccess(metricType, 201);
}
