"use client";

import { formatDate } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  title: string;
  subtitle?: string;
  user: {
    name: string;
    role: string;
    avatarColor: string;
  };
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, user, actions }: HeaderProps) {
  const today = new Date();

  return (
    <div
      className="flex items-center justify-between px-6 py-4 border-b"
      style={{ borderColor: "rgba(148,163,184,0.08)" }}
    >
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {subtitle ?? formatDate(today)}
        </p>
      </div>

      {/* Actions + User */}
      <div className="flex items-center gap-3">
        {actions}
        <div className="hidden md:flex items-center gap-2 pl-3 border-l"
          style={{ borderColor: "rgba(148,163,184,0.1)" }}>
          <UserAvatar
            name={user.name}
            color={user.avatarColor}
            size="sm"
            showName
            role={user.role.toLowerCase().replace("_", " ")}
          />
        </div>
      </div>
    </div>
  );
}
