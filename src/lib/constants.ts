// ─── App Constants ────────────────────────────────────────────────────────────

export const APP_NAME = "Big Cloud Metrics AI";
export const APP_TAGLINE = "Pharmacy Performance, Elevated.";

// Business hours (America/New_York)
export const SHIFT_START_HOUR = 9;   // 9:00 AM
export const SHIFT_END_HOUR = 18;    // 6:00 PM

// Team-level daily target (not per-person)
export const TEAM_REFILL_DAILY_TARGET = 100;

// Auto-refresh interval for live dashboard data (milliseconds)
export const DASHBOARD_REFRESH_INTERVAL = 10_000; // 10 seconds

// Role display names and colors
export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  MANAGER: "Manager",
  PHARMACIST: "Pharmacist",
  TECHNICIAN: "Technician",
};

export const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "#F59E0B",
  MANAGER: "#8B5CF6",
  PHARMACIST: "#10B981",
  TECHNICIAN: "#3B82F6",
};

// Default avatar palette — assigned round-robin to new users
export const AVATAR_COLORS = [
  "#3B82F6", // blue
  "#8B5CF6", // purple
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#6366F1", // indigo
  "#14B8A6", // teal
  "#F97316", // orange
];

// Metric type IDs (matches seed.ts)
export const METRIC_IDS = {
  OUTBOUND: "mt_outbound",
  INBOUND: "mt_inbound",
  NEW_FILLS: "mt_newfills",
  REFILLS: "mt_refills",
  SHIPMENTS: "mt_shipments",
  ADMIN: "mt_admin",
  UNPACKING: "mt_unpacking",
  PRIOR_AUTH: "mt_priorauth",
  INSURANCE: "mt_insurance",
  CONSULTATION: "mt_consultation",
  DATA_ENTRY: "mt_dataentry",
} as const;

// Report date range options
export const DATE_RANGES = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Last 3 Months", value: "3months" },
  { label: "Last 6 Months", value: "6months" },
  { label: "This Year", value: "year" },
  { label: "Custom Range", value: "custom" },
] as const;

export type DateRangeValue = (typeof DATE_RANGES)[number]["value"];
