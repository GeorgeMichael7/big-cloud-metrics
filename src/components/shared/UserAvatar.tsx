import { getInitials, cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showName?: boolean;
  role?: string;
}

const SIZE_CLASSES = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

export function UserAvatar({
  name,
  color = "#3B82F6",
  size = "md",
  className,
  showName = false,
  role,
}: UserAvatarProps) {
  const initials = getInitials(name);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ring-2 ring-white/10",
          SIZE_CLASSES[size]
        )}
        style={{ backgroundColor: color }}
        title={name}
      >
        {initials}
      </div>
      {showName && (
        <div>
          <div className="text-sm font-semibold text-slate-200 leading-tight">
            {name}
          </div>
          {role && (
            <div className="text-xs text-slate-400 leading-tight capitalize">
              {role.toLowerCase().replace("_", " ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
