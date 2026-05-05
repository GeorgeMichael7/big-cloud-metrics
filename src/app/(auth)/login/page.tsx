"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, Cloud } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    const result = await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error("Invalid email or password. Please try again.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0F172A]">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #1D4ED8 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #06B6D4 0%, transparent 70%)" }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="rounded-3xl p-8 border"
          style={{
            background: "rgba(30,41,59,0.85)",
            backdropFilter: "blur(24px)",
            borderColor: "rgba(148,163,184,0.1)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="relative mb-4"
            >
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1D4ED8, #06B6D4)" }}
              >
                {/* Cloud + Capsule SVG logo */}
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M38 30H12C8.686 30 6 27.314 6 24C6 21.08 7.984 18.612 10.726 17.81C10.26 17.022 10 16.1 10 15.1C10 12.268 12.268 10 15.1 10C16.1 10 17.022 10.26 17.81 10.726C18.612 7.984 21.08 6 24 6C27.314 6 30 8.686 30 12C30 12.066 29.998 12.132 29.996 12.198C33.398 12.876 36 15.84 36 19.4C36 19.6 35.988 19.796 35.966 19.99C37.204 20.686 38 22.006 38 23.5V30Z"
                    fill="white" fillOpacity="0.9"/>
                  {/* Capsule pill */}
                  <rect x="18" y="24" width="12" height="8" rx="4" fill="white" fillOpacity="0.3"/>
                  <rect x="18" y="24" width="6" height="8" rx="3" fill="white"/>
                </svg>
              </div>
            </motion.div>

            <h1 className="text-2xl font-black text-white tracking-tight">
              Big Cloud Metrics
            </h1>
            <p className="text-sm text-slate-400 mt-1 font-medium">
              Pill Cloud Specialty Pharmacy
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@pillcloudpharmacy.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm
                           transition-all outline-none border"
                style={{
                  background: "rgba(15,23,42,0.6)",
                  borderColor: "rgba(148,163,184,0.15)",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#3B82F6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(148,163,184,0.15)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-slate-500 text-sm
                             transition-all outline-none border"
                  style={{
                    background: "rgba(15,23,42,0.6)",
                    borderColor: "rgba(148,163,184,0.15)",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#3B82F6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(148,163,184,0.15)"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading || !email || !password}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm mt-2
                         transition-all duration-150 flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? "rgba(59,130,246,0.5)"
                  : "linear-gradient(135deg, #2563EB, #1D4ED8)",
                boxShadow: loading ? "none" : "0 4px 16px rgba(37,99,235,0.4)",
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Contact your administrator if you need access.
          </p>
        </div>

        {/* Version tag */}
        <p className="text-center text-xs text-slate-600 mt-4">
          Big Cloud Metrics AI · v1.0
        </p>
      </motion.div>
    </div>
  );
}
