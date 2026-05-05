import { cn } from "@/lib/utils";

interface CloudLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function CloudLogo({ size = 40, className, showText = true }: CloudLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Cloud + Capsule SVG */}
      <div
        className="flex-shrink-0 rounded-xl flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg, #1D4ED8, #06B6D4)",
          boxShadow: "0 4px 12px rgba(29,78,216,0.4)",
        }}
      >
        <svg
          width={size * 0.65}
          height={size * 0.65}
          viewBox="0 0 32 32"
          fill="none"
        >
          {/* Cloud shape */}
          <path
            d="M26 21H8C5.791 21 4 19.209 4 17C4 15.06 5.32 13.408 7.151 12.94C6.84 12.348 6.667 11.672 6.667 10.967C6.667 8.578 8.578 6.667 10.967 6.667C11.672 6.667 12.348 6.84 12.94 7.151C13.408 5.32 15.06 4 17 4C19.209 4 21 5.791 21 8C21 8.044 20.999 8.088 20.997 8.132C23.265 8.584 25 10.56 25 12.933C25 13.067 24.992 13.197 24.977 13.327C25.803 13.791 26.333 14.671 26.333 15.667V21Z"
            fill="white"
            fillOpacity="0.95"
          />
          {/* Capsule pill — left half (colored) */}
          <rect x="11" y="17" width="5" height="6" rx="3" fill="white" fillOpacity="0.4" />
          <rect x="11" y="17" width="3" height="6" rx="3" fill="white" />
          {/* Capsule pill — right half */}
          <rect x="14" y="17" width="5" height="6" rx="3" fill="white" fillOpacity="0.35" />
        </svg>
      </div>

      {showText && (
        <div>
          <div className="text-sm font-black text-white leading-tight tracking-tight">
            Big Cloud
          </div>
          <div className="text-xs text-blue-300 font-medium leading-tight">
            Metrics AI
          </div>
        </div>
      )}
    </div>
  );
}
