export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/utils";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";
import { ROLE_LABELS } from "@/lib/constants";

const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  password: z.string().min(6).max(100),
  role: z.enum(["MANAGER", "PHARMACIST", "TECHNICIAN"]),
  locationId: z.string().min(1),
  avatarColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

/** GET /api/users — list all users (SUPER_ADMIN only) */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Unauthorized", 401);
  if (!["SUPER_ADMIN", "MANAGER"].includes(session.user.role)) {
    return apiError("Forbidden", 403);
  }

  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");
  const role = searchParams.get("role");

  const where: Record<string, unknown> = {};
  if (locationId) where.locationId = locationId;
  if (role) where.role = role;

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true, name: true, email: true, role: true,
      locationId: true, avatarColor: true, isActive: true, createdAt: true,
      location: { select: { name: true } },
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return apiSuccess(users);
}

/** POST /api/users — create a new user (SUPER_ADMIN only) */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Unauthorized", 401);
  if (session.user.role !== "SUPER_ADMIN") return apiError("Forbidden", 403);

  const body = await req.json();
  const parsed = CreateUserSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.message, 400);

  const { name, email, password, role, locationId, avatarColor } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return apiError("Email already in use", 409);

  const location = await prisma.location.findUnique({ where: { id: locationId } });
  if (!location) return apiError("Location not found", 404);

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role,
      locationId,
      avatarColor: avatarColor ?? "#3B82F6",
    },
    select: {
      id: true, name: true, email: true, role: true,
      locationId: true, avatarColor: true, isActive: true, createdAt: true,
    },
  });

  // Send welcome email (non-blocking — don't fail if email fails)
  sendWelcomeEmail(email, name, password, ROLE_LABELS[role]).catch(console.error);

  return apiSuccess(user, 201);
}
