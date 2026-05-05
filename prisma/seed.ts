/**
 * Big Cloud Metrics AI — Database Seed
 * Run with: npm run db:seed
 *
 * Seeds:
 *  1. Default location (Pill Cloud Specialty Pharmacy of Long Island)
 *  2. All 11 metric types
 *  3. Super admin account (George Michael) — credentials printed to console
 */

import { PrismaClient, Role, InputType, TargetScope } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("\n🌱 Starting Big Cloud Metrics AI seed...\n");

  // ── 1. Location ─────────────────────────────────────────────────────────────
  const location = await prisma.location.upsert({
    where: { id: "loc_pillcloud_li" },
    update: {},
    create: {
      id: "loc_pillcloud_li",
      name: "Pill Cloud Specialty Pharmacy of Long Island",
      address: "Long Island, New York",
      timezone: "America/New_York",
      isActive: true,
    },
  });
  console.log(`✅ Location: ${location.name}`);

  // ── 2. Metric Types ─────────────────────────────────────────────────────────
  const metrics = [
    {
      id: "mt_outbound",
      name: "Outbound Calls",
      description: "Calls made to patients, doctors, or insurance providers",
      inputType: InputType.INTEGER,
      color: "#8B5CF6",
      icon: "📞",
      displayOrder: 1,
      target: 75,
      targetScope: TargetScope.PER_PERSON,
      applicableRoles: "TECHNICIAN,PHARMACIST",
    },
    {
      id: "mt_inbound",
      name: "Inbound Calls",
      description: "Calls received from patients, doctors, or insurance providers",
      inputType: InputType.INTEGER,
      color: "#3B82F6",
      icon: "📲",
      displayOrder: 2,
      target: 75,
      targetScope: TargetScope.PER_PERSON,
      applicableRoles: "TECHNICIAN,PHARMACIST",
    },
    {
      id: "mt_newfills",
      name: "New Fills",
      description: "New prescriptions filled and verified",
      inputType: InputType.INTEGER,
      color: "#10B981",
      icon: "💊",
      displayOrder: 3,
      target: 40,
      targetScope: TargetScope.PER_PHARMACIST,
      applicableRoles: "PHARMACIST",
    },
    {
      id: "mt_refills",
      name: "Refills",
      description: "Prescription refills processed and completed",
      inputType: InputType.INTEGER,
      color: "#06B6D4",
      icon: "🔄",
      displayOrder: 4,
      target: 20,
      targetScope: TargetScope.PER_TECH,
      // Team total target of 100 is tracked separately in constants
      applicableRoles: "TECHNICIAN,PHARMACIST",
    },
    {
      id: "mt_shipments",
      name: "Shipments Created",
      description: "Patient shipments packaged and dispatched",
      inputType: InputType.INTEGER,
      color: "#F59E0B",
      icon: "📦",
      displayOrder: 5,
      target: 35,
      targetScope: TargetScope.PER_TECH,
      applicableRoles: "TECHNICIAN",
    },
    {
      id: "mt_admin",
      name: "Admin / Clerical",
      description: "Administrative tasks, documentation, data entry, compliance",
      inputType: InputType.INTEGER_WITH_NOTES,
      color: "#EC4899",
      icon: "📋",
      displayOrder: 6,
      target: null,
      targetScope: null,
      applicableRoles: "",
    },
    {
      id: "mt_unpacking",
      name: "Unpacking & Shelf Loading",
      description: "Inventory received, unpacked, verified, and stocked on shelves",
      inputType: InputType.INTEGER_WITH_NOTES,
      color: "#14B8A6",
      icon: "🗃️",
      displayOrder: 7,
      target: null,
      targetScope: null,
      applicableRoles: "",
    },
    {
      id: "mt_priorauth",
      name: "Prior Auth Requests",
      description: "Prior authorization requests submitted to insurance carriers",
      inputType: InputType.INTEGER,
      color: "#6366F1",
      icon: "📝",
      displayOrder: 8,
      target: null,
      targetScope: null,
      applicableRoles: "TECHNICIAN,PHARMACIST",
    },
    {
      id: "mt_insurance",
      name: "Insurance Rejections Resolved",
      description: "Insurance claim rejections investigated and successfully resolved",
      inputType: InputType.INTEGER,
      color: "#EF4444",
      icon: "🛡️",
      displayOrder: 9,
      target: null,
      targetScope: null,
      applicableRoles: "TECHNICIAN,PHARMACIST",
    },
    {
      id: "mt_consultation",
      name: "Patient Consultations",
      description: "Patient counseling sessions, medication reviews, and follow-ups",
      inputType: InputType.INTEGER_WITH_NOTES,
      color: "#059669",
      icon: "🩺",
      displayOrder: 10,
      target: null,
      targetScope: null,
      applicableRoles: "PHARMACIST",
    },
    {
      id: "mt_dataentry",
      name: "Data Entry / Order Entry",
      description: "Prescription order entry and patient record data management",
      inputType: InputType.INTEGER,
      color: "#7C3AED",
      icon: "⌨️",
      displayOrder: 11,
      target: null,
      targetScope: null,
      applicableRoles: "TECHNICIAN",
    },
  ];

  for (const m of metrics) {
    await prisma.metricType.upsert({
      where: { id: m.id },
      update: m,
      create: m,
    });
  }
  console.log(`✅ ${metrics.length} metric types created`);

  // ── 3. Super Admin (George Michael) ─────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "george@pillcloudpharmacy.com";
  const adminName = process.env.SEED_ADMIN_NAME ?? "George Michael";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin2026!";

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      locationId: location.id,
      avatarColor: "#1D4ED8",
      isActive: true,
    },
  });
  console.log(`✅ Super admin: ${admin.name} (${admin.email})`);

  // ── Done ─────────────────────────────────────────────────────────────────────
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Seed complete! Your login credentials:\n");
  console.log(`   Email   : ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log("\n⚠️  Change your password after first login!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
