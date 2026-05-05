export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/utils";
import { z } from "zod";
import bcrypt from "bcryptjs";

const UpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().toLowerCase().optional(),
  password: z.string().min(6).max(100).optional(),
  role: z.enum(["MANAGER", "PHARMACIST", "TECHNICIAN"]).optional(),
  locationId: z.string().optional(),
  avatarColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  isActive: z.boolean().optional(),
});

/** GET /api/users/[id] — get a single user */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Unauthorized", 401);

  const canView =
    session.user.id === params.id ||
    ["MANAGER", "SUPER_ADMIN"].includes(session.user.role);
  if (!canView) return apiError("Forbidden", 403);

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, name: true, email: true, role: true,
      locationId: true, avatarColor: true, isActive: true, createdAt: true,
      location: { select: { id: true, name: true } },
    },
  });
  if (!user) return apiError("User not found", 404);

  return apiSuccess(user);
}

/** PUT /api/users/[id] — update a user (SUPER_ADMIN only) */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Unauthorized", 401);
  if (session.user.role !== "SUPER_ADMIN") return apiError("Forbidden", 403);

  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.message, 400);

  const { password, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest };

  if (password) {
    updateData.password = await bcrypt.hash(password, 12);
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: updateData,
    select: {
      id: true, name: true, email: true, role: true,
      locationId: true, avatarColor: true, isActive: true, createdAt: true,
    },
  });

  return apiSuccess(user);
}

/** DELETE /api/users/[id] — deactivate a user (SUPER_ADMIN only, soft delete) */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Unauthorized", 401);
  if (session.user.role !== "SUPER_ADMIN") return apiError("Forbidden", 403);

  // Prevent self-deletion
  if (session.user.id === params.id) {
    return apiError("Cannot deactivate your own account", 400);
  }

  await prisma.user.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  return apiSuccess({ message: "User deactivated" });
}
