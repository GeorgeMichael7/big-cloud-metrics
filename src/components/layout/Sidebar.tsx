"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, History, BarChart3, Users, Trophy,
  FileText, Settings, LogOut, Shield, Activity
} from "lucide-react";
import { CloudLogo } from "@/components/shared/CloudLogo";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";

interface SidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarColor: string;
  };
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  // Tech / Pharmacist
  {
    href: "/dashboard",
    label: "My Dashboard",
    icon: LayoutDashboard,
    roles: ["TECHNICIAN", "PHARMACIST"],
  },
  {
    href: "/dashboard/history",
    label: "My History",
    icon: History,
    roles: ["TECHNICIAN", "PHARMACIST"],
  },
  // Manager
  {
    href: "/manager",
    label: "Overview",
    icon: Activity,
    roles: ["MANAGER", "SUPER_ADMIN"],
  },
  {
    href: "/manager/team",
    label: "Team Dashboard",
    icon: BarChart3,
    roles: ["MANAGER", "SUPER_ADMIN"],
  },
  {
    href: "/manager/reports",
    label: "Reports & Export",
    icon: FileText,
    roles: ["MANAGER", "SUPER_ADMIN"],
  },
  {
    href: "/manager/metrics",
    label: "Manage Metrics",
    icon: Settings,
    roles: ["MANAGER", "SUPER_ADMIN"],
  },
  // Admin
  {
    href: "/admin",
    label: "User Management",
    icon: Users,
    roles: ["SUPER_ADMIN"],
  },
  {
    href: "/admin/locations",
    label: "Locations",
    icon: Shield,
    roles: ["SUPER_ADMIN"],
  },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user.role)
  );

  // Group items for cleaner sidebar
  const techItems = visibleItems.filter((i) =>
    ["/dashboard", "/dashboard/history"].includes(i.href)
  );
  const managerItems = visibleItems.filter((i) => i.href.startsWith("/manager"));
  const adminItems = visibleItems.filter((i) => i.href.startsWith("/admin"));

  function NavLink({ item }: { item: NavItem }) {
    const isActive =
      item.href === "/"
        ? pathname === item.href
        : pathname.startsWith(item.href) && (item.href !== "/dashboard" || pathname === "/dashboard" || pathname.startsWith("/dashboard/"));

    const active =
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : item.href === "/manager"
        ? pathname === "/manager"
        : pathname.startsWith(item.href);

    return (
      <Link href={item.href}>
        <div
          className={cn(
            "sidebar-link",
            active ? "active" : ""
          )}
        >
          <item.icon size={18} className={active ? "text-blue-400" : "text-slate-400"} />
          <span className="truncate">{item.label}</span>
          {active && (
            <motion.div
              layoutId="sidebar-indicator"
              className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"
            />
          )}
        </div>
      </Link>
    );
  }

  function SectionLabel({ label }: { label: string }) {
    return (
      <div className="px-4 mb-1 mt-4 first:mt-0">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      className="w-60 flex-shrink-0 h-screen flex flex-col border-r"
      style={{
        background: "rgba(15,23,42,0.95)",
        borderColor: "rgba(148,163,184,0.08)",
      }}
    >
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: "rgba(148,163,184,0.08)" }}>
        <CloudLogo size={36} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {techItems.length > 0 && (
          <>
            <SectionLabel label="My Work" />
            {techItems.map((item) => <NavLink key={item.href} item={item} />)}
          </>
        )}
        {managerItems.length > 0 && (
          <>
            <SectionLabel label="Management" />
            {managerItems.map((item) => <NavLink key={item.href} item={item} />)}
          </>
        )}
        {adminItems.length > 0 && (
          <>
            <SectionLabel label="Administration" />
            {adminItems.map((item) => <NavLink key={item.href} item={item} />)}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="p-3 border-t" style={{ borderColor: "rgba(148,163,184,0.08)" }}>
        <div className="flex items-center justify-between mb-2">
          <UserAvatar
            name={user.name}
            color={user.avatarColor}
            size="sm"
            showName
            role={ROLE_LABELS[user.role] ?? user.role}
          />
          <ThemeToggle />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                     text-slate-400 hover:text-red-400 hover:bg-red-400/10
                     transition-colors duration-150"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
