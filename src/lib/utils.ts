import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, subMonths, startOfYear, parseISO } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { AVATAR_COLORS } from "./constants";
import type { DateRangeValue } from "./constants";

// Tailwind class merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Date helpers ─────────────────────────────────────────────────────────────

const TZ = "America/New_York";

/** Returns the current date/time in NY timezone */
export function nowNY(): Date {
  return toZonedTime(new Date(), TZ);
}

/** Returns midnight of today in NY timezone (stored as UTC in DB) */
export function todayNY(): Date {
  const ny = toZonedTime(new Date(), TZ);
  const midnight = startOfDay(ny);
  return fromZonedTime(midnight, TZ);
}

/** Parse an ISO date string and return the NY midnight equivalent */
export function parseWorkDate(dateStr: string): Date {
  const d = parseISO(dateStr);
  const nyDate = toZonedTime(d, TZ);
  return fromZonedTime(startOfDay(nyDate), TZ);
}

/** Format a date as "Mon, May 5" */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(toZonedTime(d, TZ), "EEE, MMM d");
}

/** Format date as "May 5, 2026" */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(toZonedTime(d, TZ), "MMMM d, yyyy");
}

/** Format for display: "9:45 AM" */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(toZonedTime(d, TZ), "h:mm a");
}

/** Get start/end UTC timestamps for a named date range */
export function getDateRange(range: DateRangeValue): { start: Date; end: Date } {
  const now = toZonedTime(new Date(), TZ);

  switch (range) {
    case "today":
      return {
        start: fromZonedTime(startOfDay(now), TZ),
        end: fromZonedTime(endOfDay(now), TZ),
      };
    case "week":
      return {
        start: fromZonedTime(startOfWeek(now, { weekStartsOn: 1 }), TZ),
        end: fromZonedTime(endOfWeek(now, { weekStartsOn: 1 }), TZ),
      };
    case "month":
      return {
        start: fromZonedTime(startOfMonth(now), TZ),
        end: fromZonedTime(endOfMonth(now), TZ),
      };
    case "3months":
      return {
        start: fromZonedTime(startOfDay(subMonths(now, 3)), TZ),
        end: fromZonedTime(endOfDay(now), TZ),
      };
    case "6months":
      return {
        start: fromZonedTime(startOfDay(subMonths(now, 6)), TZ),
        end: fromZonedTime(endOfDay(now), TZ),
      };
    case "year":
      return {
        start: fromZonedTime(startOfYear(now), TZ),
        end: fromZonedTime(endOfDay(now), TZ),
      };
    default:
      return {
        start: fromZonedTime(startOfDay(now), TZ),
        end: fromZonedTime(endOfDay(now), TZ),
      };
  }
}

// ── Number helpers ────────────────────────────────────────────────────────────

/** Format a number with commas: 1234 → "1,234" */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/** Calculate percentage, capped at 100% for display */
export function pct(value: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(Math.round((value / target) * 100), 100);
}

/** Get a color based on percentage completion */
export function targetColor(pctValue: number): string {
  if (pctValue >= 100) return "#10B981"; // green
  if (pctValue >= 60) return "#F59E0B";  // amber
  return "#EF4444";                       // red
}

// ── User helpers ──────────────────────────────────────────────────────────────

/** Get initials from a full name: "George Michael" → "GM" */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Pick an avatar color based on user index */
export function pickAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// ── API helpers ───────────────────────────────────────────────────────────────

export function apiError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return Response.json(data, { status });
}
