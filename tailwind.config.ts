import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          white: "#FFFFFF",
          "light-blue": "#60A5FA",
          blue: "#3B82F6",
          "dark-blue": "#1D4ED8",
          navy: "#0F172A",
          slate: "#1E293B",
          cyan: "#06B6D4",
        },
        metric: {
          outbound: "#8B5CF6",
          inbound: "#3B82F6",
          fills: "#10B981",
          refills: "#06B6D4",
          shipments: "#F59E0B",
          admin: "#EC4899",
          unpacking: "#14B8A6",
          priorauth: "#6366F1",
          insurance: "#EF4444",
          consultation: "#059669",
          dataentry: "#7C3AED",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #1D4ED8 100%)",
        "gradient-card":
          "linear-gradient(135deg, rgba(30,58,95,0.8) 0%, rgba(29,78,216,0.3) 100%)",
        "gradient-tech":
          "linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #1D4ED8 100%)",
        "gradient-manager":
          "linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #8B5CF6 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(31, 38, 135, 0.37)",
        "glass-hover": "0 8px 32px rgba(59, 130, 246, 0.4)",
        glow: "0 0 20px rgba(59, 130, 246, 0.5)",
        "glow-sm": "0 0 10px rgba(59, 130, 246, 0.3)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-once": "bounce 0.5s ease-in-out",
        "count-up": "countUp 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        countUp: {
          "0%": { transform: "translateY(4px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
