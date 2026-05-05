// ─── Shared TypeScript Types ──────────────────────────────────────────────────

export type Role = "SUPER_ADMIN" | "MANAGER" | "PHARMACIST" | "TECHNICIAN";
export type InputType = "INTEGER" | "INTEGER_WITH_NOTES" | "NOTES_ONLY";
export type TargetScope = "PER_TECH" | "PER_PHARMACIST" | "PER_PERSON" | "TEAM_TOTAL";

// ── Database model types (safe for client — no password) ─────────────────────

export interface UserSafe {
  id: string;
  email: string;
  name: string;
  role: Role;
  locationId: string;
  avatarColor: string;
  isActive: boolean;
  createdAt: string;
}

export interface Location {
  id: string;
  name: string;
  address: string | null;
  timezone: string;
  isActive: boolean;
}

export interface MetricType {
  id: string;
  name: string;
  description: string | null;
  inputType: InputType;
  isActive: boolean;
  displayOrder: number;
  color: string;
  icon: string;
  target: number | null;
  targetScope: TargetScope | null;
  applicableRoles: string; // comma-separated role names or ""
}

export interface MetricLog {
  id: string;
  userId: string;
  metricTypeId: string;
  locationId: string;
  workDate: string;
  value: number;
  notes: string | null;
  loggedAt: string;
  user?: UserSafe;
  metricType?: MetricType;
}

// ── Dashboard data types ──────────────────────────────────────────────────────

/** Aggregated total for one metric on one day, for one user */
export interface UserMetricTotal {
  userId: string;
  metricTypeId: string;
  total: number;
}

/** Full day summary for a single user */
export interface UserDaySummary {
  user: UserSafe;
  totals: Record<string, number>; // metricTypeId → sum
  grandTotal: number;
}

/** Team daily overview */
export interface TeamDayOverview {
  date: string;
  byUser: UserDaySummary[];
  teamTotals: Record<string, number>; // metricTypeId → team sum
}

/** Leaderboard entry */
export interface LeaderboardEntry {
  rank: number;
  user: UserSafe;
  value: number;
  trend: "up" | "down" | "same";
  previousValue: number;
}

/** Chart data point for contribution charts */
export interface ContributionPoint {
  date: string;         // "May 5"
  total: number;
  [userId: string]: number | string; // per-user contributions
}

/** Target attainment for one metric */
export interface TargetStatus {
  metricType: MetricType;
  current: number;
  target: number;
  pct: number;
  scope: TargetScope;
}

// ── Form types ────────────────────────────────────────────────────────────────

export interface LogMetricInput {
  metricTypeId: string;
  value: number;
  notes?: string;
  workDate?: string; // ISO date string; defaults to today
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  locationId: string;
  avatarColor?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: Role;
  locationId?: string;
  avatarColor?: string;
  isActive?: boolean;
}

export interface CreateMetricTypeInput {
  name: string;
  description?: string;
  inputType: InputType;
  color: string;
  icon: string;
  target?: number;
  targetScope?: TargetScope;
  applicableRoles?: string;
  displayOrder?: number;
}

// ── API response types ────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
