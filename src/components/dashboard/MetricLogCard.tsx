"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, MessageSquare, X, Check } from "lucide-react";
import { useLogMetric } from "@/hooks/useMetrics";
import { toast } from "sonner";
import type { MetricType } from "@/types";

interface MetricLogCardProps {
  metricType: MetricType;
  todayTotal: number;
  onLogged?: (newTotal: number) => void;
}

export function MetricLogCard({ metricType, todayTotal, onLogged }: MetricLogCardProps) {
  const [displayTotal, setDisplayTotal] = useState(todayTotal);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [flash, setFlash] = useState(false);
  const logMutation = useLogMetric();
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Sync with server total
  if (todayTotal !== displayTotal && !logMutation.isPending) {
    setDisplayTotal(todayTotal);
  }

  const needsNotes =
    metricType.inputType === "INTEGER_WITH_NOTES" ||
    metricType.inputType === "NOTES_ONLY";

  async function handleLog(value: number, notesText?: string) {
    if (value <= 0) return;

    // Optimistic UI update
    setDisplayTotal((prev) => prev + value);
    triggerFlash();

    try {
      const result = await logMutation.mutateAsync({
        metricTypeId: metricType.id,
        value,
        notes: notesText || undefined,
      });
      setDisplayTotal(result.todayTotal);
      onLogged?.(result.todayTotal);
      if (notesText) {
        toast.success(`Logged ${value} ${metricType.name}`, { description: notesText });
      }
    } catch {
      // Rollback optimistic update
      setDisplayTotal((prev) => prev - value);
    }

    setNotes("");
    setCustomValue("");
    setShowNotes(false);
  }

  function handleQuickLog() {
    if (needsNotes) {
      setShowNotes(true);
      setTimeout(() => notesRef.current?.focus(), 100);
    } else {
      handleLog(1);
    }
  }

  function handleNoteSubmit() {
    const val = customValue ? parseFloat(customValue) : 1;
    if (isNaN(val) || val <= 0) return;
    handleLog(val, notes);
  }

  function triggerFlash() {
    setFlash(true);
    setTimeout(() => setFlash(false), 400);
  }

  const progressPct =
    metricType.target
      ? Math.min((displayTotal / metricType.target) * 100, 100)
      : null;

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: `linear-gradient(135deg, ${metricType.color}22, ${metricType.color}11)`,
        border: `1px solid ${metricType.color}33`,
      }}
    >
      {/* Top section */}
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${metricType.color}33` }}
          >
            {metricType.icon}
          </div>
          {metricType.target && (
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{
                background: `${metricType.color}22`,
                color: metricType.color,
              }}
            >
              Goal: {metricType.target}
            </span>
          )}
        </div>

        <div className="mb-1">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">
            {metricType.name}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={displayTotal}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="text-4xl font-black text-white tabular-nums"
              style={{
                textShadow: flash ? `0 0 20px ${metricType.color}` : "none",
                transition: "text-shadow 0.3s",
              }}
            >
              {displayTotal}
            </motion.div>
          </AnimatePresence>
          {metricType.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              {metricType.description}
            </p>
          )}
        </div>

        {/* Progress bar */}
        {progressPct !== null && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>{Math.round(progressPct)}% of goal</span>
              <span>{metricType.target}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full progress-fill"
                style={{ backgroundColor: metricType.color }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Notes panel (slide down) */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t"
            style={{ borderColor: `${metricType.color}22` }}
          >
            <div className="p-3 space-y-2">
              {metricType.inputType !== "NOTES_ONLY" && (
                <input
                  type="number"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="Amount (default: 1)"
                  className="w-full px-3 py-2 rounded-lg text-sm text-white bg-white/5 border border-white/10 outline-none"
                  onFocus={(e) => (e.target.style.borderColor = metricType.color)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              )}
              <textarea
                ref={notesRef}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note... (optional)"
                rows={2}
                className="w-full px-3 py-2 rounded-lg text-sm text-white bg-white/5 border border-white/10 outline-none resize-none"
                onFocus={(e) => (e.target.style.borderColor = metricType.color)}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleNoteSubmit}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1"
                  style={{ background: metricType.color }}
                >
                  <Check size={14} /> Log
                </button>
                <button
                  onClick={() => setShowNotes(false)}
                  className="px-3 py-2 rounded-lg text-xs text-slate-400 bg-white/5 hover:bg-white/10"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action bar */}
      {!showNotes && (
        <div
          className="flex items-center border-t"
          style={{ borderColor: `${metricType.color}22` }}
        >
          {/* Quick -1 */}
          <button
            onClick={() => displayTotal > 0 && handleLog(-1)}
            disabled={displayTotal <= 0 || logMutation.isPending}
            className="flex-none w-12 h-11 flex items-center justify-center text-slate-500
                       hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30"
          >
            <Minus size={16} />
          </button>

          {/* Main +1 button */}
          <motion.button
            onClick={handleQuickLog}
            disabled={logMutation.isPending}
            whileTap={{ scale: 0.95 }}
            className="flex-1 h-11 flex items-center justify-center gap-1.5 font-semibold text-sm
                       transition-all disabled:opacity-50"
            style={{ color: metricType.color }}
          >
            {logMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              <>
                <Plus size={18} strokeWidth={2.5} />
                {needsNotes ? "Add Entry" : "+1"}
              </>
            )}
          </motion.button>

          {/* Notes toggle (for INTEGER types that optionally have notes) */}
          {metricType.inputType === "INTEGER" && (
            <button
              onClick={() => { setShowNotes(true); setTimeout(() => notesRef.current?.focus(), 100); }}
              className="flex-none w-12 h-11 flex items-center justify-center text-slate-500
                         hover:text-white hover:bg-white/5 transition-colors"
            >
              <MessageSquare size={15} />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
