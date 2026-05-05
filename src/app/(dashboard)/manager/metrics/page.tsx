"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, GripVertical, ToggleLeft, ToggleRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { toast } from "sonner";
import type { MetricType } from "@/types";

export default function ManageMetricsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: metrics, isLoading } = useQuery<MetricType[]>({
    queryKey: ["metric-types-all"],
    queryFn: async () => {
      const res = await fetch("/api/metric-types?active=false");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/metric-types/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metric-types-all"] });
      queryClient.invalidateQueries({ queryKey: ["metric-types"] });
      toast.success("Metric updated");
    },
  });

  if (!session) return null;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Manage Metrics"
        subtitle="Add, edit, or deactivate metric types"
        user={{ name: session.user.name ?? "", role: session.user.role, avatarColor: session.user.avatarColor }}
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
          >
            <Plus size={16} /> New Metric
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : (
          (metrics ?? []).map((mt, i) => (
            <motion.div
              key={mt.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl border"
              style={{
                background: mt.isActive ? `${mt.color}08` : "rgba(30,41,59,0.3)",
                borderColor: mt.isActive ? `${mt.color}22` : "rgba(148,163,184,0.07)",
                opacity: mt.isActive ? 1 : 0.6,
              }}
            >
              <GripVertical size={16} className="text-slate-600 cursor-grab flex-shrink-0" />

              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: `${mt.color}22` }}
              >
                {mt.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{mt.name}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${mt.color}22`, color: mt.color }}
                  >
                    {mt.inputType.replace("_", " ").toLowerCase()}
                  </span>
                  {mt.target && (
                    <span className="text-xs text-slate-400">
                      Goal: {mt.target} ({mt.targetScope?.replace("_", " ").toLowerCase()})
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{mt.description}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() =>
                    toggleMutation.mutate({ id: mt.id, isActive: !mt.isActive })
                  }
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  title={mt.isActive ? "Deactivate" : "Activate"}
                >
                  {mt.isActive ? (
                    <ToggleRight size={20} className="text-emerald-400" />
                  ) : (
                    <ToggleLeft size={20} className="text-slate-500" />
                  )}
                </button>
                <button
                  onClick={() => { setEditingId(mt.id); setShowForm(true); }}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* New Metric Form Modal */}
      {showForm && (
        <MetricFormModal
          editingMetric={metrics?.find((m) => m.id === editingId)}
          onClose={() => { setShowForm(false); setEditingId(null); }}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["metric-types-all"] });
            queryClient.invalidateQueries({ queryKey: ["metric-types"] });
            setShowForm(false);
            setEditingId(null);
          }}
        />
      )}
    </div>
  );
}

function MetricFormModal({
  editingMetric,
  onClose,
  onSaved,
}: {
  editingMetric?: MetricType;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(editingMetric?.name ?? "");
  const [description, setDescription] = useState(editingMetric?.description ?? "");
  const [inputType, setInputType] = useState(editingMetric?.inputType ?? "INTEGER");
  const [color, setColor] = useState(editingMetric?.color ?? "#3B82F6");
  const [icon, setIcon] = useState(editingMetric?.icon ?? "📊");
  const [target, setTarget] = useState(editingMetric?.target?.toString() ?? "");
  const [targetScope, setTargetScope] = useState(editingMetric?.targetScope ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const url = editingMetric
        ? `/api/metric-types/${editingMetric.id}`
        : "/api/metric-types";
      const method = editingMetric ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, description, inputType, color, icon,
          target: target ? parseFloat(target) : undefined,
          targetScope: targetScope || undefined,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success(editingMetric ? "Metric updated!" : "Metric created!");
      onSaved();
    } catch {
      toast.error("Failed to save metric");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl p-6 border"
        style={{ background: "#1E293B", borderColor: "rgba(148,163,184,0.15)" }}
      >
        <h3 className="text-lg font-bold text-white mb-5">
          {editingMetric ? "Edit Metric" : "New Metric Type"}
        </h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input value={icon} onChange={(e) => setIcon(e.target.value)}
              className="w-16 px-3 py-2.5 rounded-xl text-center text-xl bg-white/5 border border-white/10 outline-none" />
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Metric name"
              className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/10 outline-none" />
          </div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)" rows={2}
            className="w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/10 outline-none resize-none" />
          <div className="grid grid-cols-2 gap-2">
            <select value={inputType} onChange={(e) => setInputType(e.target.value as MetricType["inputType"])}
              className="px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-slate-300 outline-none">
              <option value="INTEGER">Integer Count</option>
              <option value="INTEGER_WITH_NOTES">Count + Notes</option>
              <option value="NOTES_ONLY">Notes Only</option>
            </select>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent" />
              <span className="text-xs text-slate-400">Color</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={target} onChange={(e) => setTarget(e.target.value)}
              type="number" placeholder="Daily target (optional)"
              className="px-3 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/10 outline-none" />
            <select value={targetScope} onChange={(e) => setTargetScope(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-slate-300 outline-none">
              <option value="">No scope</option>
              <option value="PER_TECH">Per Technician</option>
              <option value="PER_PHARMACIST">Per Pharmacist</option>
              <option value="PER_PERSON">Per Person</option>
              <option value="TEAM_TOTAL">Team Total</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm text-slate-400 bg-white/5 hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !name.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}>
            {saving ? "Saving…" : "Save Metric"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
