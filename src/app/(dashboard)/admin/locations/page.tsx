"use client";

import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/Header";
import { MapPin, Building2 } from "lucide-react";

export default function LocationsPage() {
  const { data: session } = useSession();
  if (!session) return null;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Locations"
        subtitle="Pharmacy locations across the network"
        user={{ name: session.user.name ?? "", role: session.user.role, avatarColor: session.user.avatarColor }}
      />
      <div className="flex-1 p-6">
        <div className="rounded-2xl p-6 border"
          style={{ background: "rgba(30,41,59,0.6)", borderColor: "rgba(148,163,184,0.08)" }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(59,130,246,0.15)" }}>
              <Building2 size={22} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Pill Cloud Specialty Pharmacy of Long Island
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-slate-400 mt-1">
                <MapPin size={13} />
                Long Island, New York
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300">
                  Active
                </span>
                <span className="text-xs text-slate-500">Timezone: America/New_York</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4">
          Multi-location management will be available as your pharmacy network expands.
        </p>
      </div>
    </div>
  );
}
