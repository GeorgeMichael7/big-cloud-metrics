"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit2, UserX, UserCheck, Shield, Mail,
  Copy, Eye, EyeOff, X, Check
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { toast } from "sonner";
import { ROLE_LABELS, ROLE_COLORS, AVATAR_COLORS } from "@/lib/constants";
import type { UserSafe } from "@/types";

type Role = "MANAGER" | "PHARMACIST" | "TECHNICIAN";

interface NewUserForm {
  name: string;
  email: string;
  password: string;
  role: Role;
  locationId: string;
  avatarColor: string;
}

function generatePassword(): string {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789!@#$";
  let pw = "";
  for (let i = 0; i < 12; i++) {
    pw += chars[Math.floor(Math.random() * chars.length)];
  }
  return pw;
}

export default function AdminPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserSafe | null>(null);

  const { data: users, isLoading } = useQuery<(UserSafe & { location?: { name: string } })[]>({
    queryKey: ["users-admin"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      // Use the seeded location since we only have one for now
      return [{ id: "loc_pillcloud_li", name: "Pill Cloud Specialty Pharmacy of Long Island" }];
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users-admin"] });
      toast.success(`User ${data.isActive ? "activated" : "deactivated"}`);
    },
  });

  if (!session) return null;

  const activeUsers = (users ?? []).filter((u) => u.isActive);
  const inactiveUsers = (users ?? []).filter((u) => !u.isActive);

  const ROLE_ORDER = ["MANAGER", "PHARMACIST", "TECHNICIAN"];
  const sortedActive = [...activeUsers].sort(
    (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role)
  );

  return (
    <div className="flex flex-col h-full">
      <Header
        title="User Management"
        subtitle="Create and manage team accounts"
        user={{ name: session.user.name ?? "", role: session.user.role, avatarColor: session.user.avatarColor }}
        actions={
          <button
            onClick={() => { setEditingUser(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
          >
            <Plus size={16} /> New User
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(ROLE_LABELS).filter(([r]) => r !== "SUPER_ADMIN").map(([role, label]) => {
            const count = (users ?? []).filter((u) => u.role === role && u.isActive).length;
            return (
              <div key={role} className="rounded-xl px-4 py-3 border"
                style={{ background: `${ROLE_COLORS[role]}11`, borderColor: `${ROLE_COLORS[role]}25` }}>
                <div className="text-2xl font-black text-white">{count}</div>
                <div className="text-xs text-slate-400">{label}s</div>
              </div>
            );
          })}
        </div>

        {/* Active users */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <UserCheck size={16} className="text-emerald-400" />
            Active Team ({activeUsers.length})
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedActive.map((user, i) => (
                <UserRow
                  key={user.id}
                  user={user}
                  index={i}
                  onEdit={() => { setEditingUser(user); setShowForm(true); }}
                  onToggle={() => toggleActiveMutation.mutate({ id: user.id, isActive: false })}
                  currentUserId={session.user.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Inactive users */}
        {inactiveUsers.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
              <UserX size={16} className="text-slate-500" />
              Deactivated ({inactiveUsers.length})
            </h3>
            <div className="space-y-2 opacity-60">
              {inactiveUsers.map((user, i) => (
                <UserRow
                  key={user.id}
                  user={user}
                  index={i}
                  onEdit={() => { setEditingUser(user); setShowForm(true); }}
                  onToggle={() => toggleActiveMutation.mutate({ id: user.id, isActive: true })}
                  currentUserId={session.user.id}
                  deactivated
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      <AnimatePresence>
        {showForm && (
          <UserFormModal
            editingUser={editingUser}
            locations={locations ?? []}
            onClose={() => { setShowForm(false); setEditingUser(null); }}
            onSaved={() => {
              queryClient.invalidateQueries({ queryKey: ["users-admin"] });
              setShowForm(false);
              setEditingUser(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function UserRow({
  user, index, onEdit, onToggle, currentUserId, deactivated,
}: {
  user: UserSafe & { location?: { name: string } };
  index: number;
  onEdit: () => void;
  onToggle: () => void;
  currentUserId: string;
  deactivated?: boolean;
}) {
  const isSelf = user.id === currentUserId;
  const roleColor = ROLE_COLORS[user.role] ?? "#3B82F6";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-4 px-5 py-3.5 rounded-2xl border"
      style={{
        background: "rgba(30,41,59,0.5)",
        borderColor: "rgba(148,163,184,0.07)",
      }}
    >
      <UserAvatar name={user.name} color={user.avatarColor} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white truncate">{user.name}</span>
          {isSelf && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
              You
            </span>
          )}
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: `${roleColor}22`, color: roleColor }}
          >
            {ROLE_LABELS[user.role]}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
          <Mail size={11} />
          {user.email}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={onEdit}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
          <Edit2 size={15} />
        </button>
        {!isSelf && (
          <button onClick={onToggle}
            className={`p-2 rounded-lg transition-colors ${
              deactivated
                ? "text-emerald-400 hover:bg-emerald-400/10"
                : "text-slate-500 hover:text-red-400 hover:bg-red-400/10"
            }`}
            title={deactivated ? "Reactivate user" : "Deactivate user"}
          >
            {deactivated ? <UserCheck size={15} /> : <UserX size={15} />}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function UserFormModal({
  editingUser,
  locations,
  onClose,
  onSaved,
}: {
  editingUser: UserSafe | null;
  locations: { id: string; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(editingUser?.name ?? "");
  const [email, setEmail] = useState(editingUser?.email ?? "");
  const [password, setPassword] = useState(generatePassword());
  const [showPw, setShowPw] = useState(true); // show on create
  const [role, setRole] = useState<Role>((editingUser?.role as Role) ?? "TECHNICIAN");
  const [locationId, setLocationId] = useState(
    editingUser?.locationId ?? locations[0]?.id ?? ""
  );
  const [avatarColor, setAvatarColor] = useState(editingUser?.avatarColor ?? AVATAR_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isEdit = !!editingUser;

  async function handleSave() {
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    try {
      const url = isEdit ? `/api/users/${editingUser!.id}` : "/api/users";
      const method = isEdit ? "PUT" : "POST";
      const body: Record<string, unknown> = { name, email, role, locationId, avatarColor };
      if (!isEdit || password) body.password = password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed");
      }
      setSaved(true);
      toast.success(isEdit ? "User updated!" : "User created! Welcome email sent.");
      setTimeout(onSaved, 600);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save user");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        className="w-full max-w-lg rounded-2xl p-6 border"
        style={{ background: "#1E293B", borderColor: "rgba(148,163,184,0.15)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">
            {isEdit ? "Edit User" : "Create New User"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {/* Avatar color picker */}
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Avatar Color</label>
            <div className="flex items-center gap-2 flex-wrap">
              <UserAvatar name={name || "New User"} color={avatarColor} size="md" />
              <div className="flex gap-1.5 flex-wrap">
                {AVATAR_COLORS.map((c) => (
                  <button key={c} onClick={() => setAvatarColor(c)}
                    className="w-6 h-6 rounded-full ring-2 transition-all"
                    style={{
                      background: c,
                      ringColor: avatarColor === c ? "white" : "transparent",
                      outline: avatarColor === c ? `2px solid ${c}` : "none",
                      outlineOffset: "2px",
                    }} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Full Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/10 outline-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Role *</label>
              <select value={role} onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-slate-200 outline-none">
                <option value="MANAGER">Manager</option>
                <option value="PHARMACIST">Pharmacist</option>
                <option value="TECHNICIAN">Technician</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Email Address *</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)}
              type="email" placeholder="jane@pillcloudpharmacy.com"
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/10 outline-none" />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              {isEdit ? "New Password (leave blank to keep current)" : "Temporary Password *"}
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? "Enter new password to change" : ""}
                className="w-full px-3 py-2.5 pr-20 rounded-xl text-sm text-white bg-white/5 border border-white/10 outline-none font-mono"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button onClick={() => setShowPw(!showPw)}
                  className="p-1 text-slate-400 hover:text-white">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(password);
                    toast.success("Password copied!");
                  }}
                  className="p-1 text-slate-400 hover:text-white" title="Copy password">
                  <Copy size={14} />
                </button>
              </div>
            </div>
            {!isEdit && (
              <button onClick={() => setPassword(generatePassword())}
                className="mt-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                Generate new password
              </button>
            )}
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Location *</label>
            <select value={locationId} onChange={(e) => setLocationId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-slate-200 outline-none">
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm text-slate-400 bg-white/5 hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !name.trim() || !email.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: saved ? "rgba(16,185,129,0.3)" : "linear-gradient(135deg, #2563EB, #1D4ED8)" }}>
            {saved ? (
              <><Check size={16} /> Saved!</>
            ) : saving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
            ) : (
              isEdit ? "Save Changes" : "Create User"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
