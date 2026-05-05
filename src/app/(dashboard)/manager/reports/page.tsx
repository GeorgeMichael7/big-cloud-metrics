"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/Header";
import { useReportData } from "@/hooks/useTeamData";
import { DATE_RANGES } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import { Download, FileText, Table } from "lucide-react";
import { toast } from "sonner";

export default function ReportsPage() {
  const { data: session } = useSession();
  const [range, setRange] = useState("month");
  const { data: reportData, isLoading } = useReportData(range);

  if (!session) return null;

  function downloadCSV() {
    if (!reportData?.rows?.length) { toast.error("No data to export"); return; }
    const headers = ["Date", "Technician", "Role", "Metric", "Value", "Notes", "Logged At"];
    const rows = reportData.rows.map((r: Record<string, unknown>) =>
      [r.date, r.technician, r.role, r.metric, r.value, r.notes, r.loggedAt]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `big-cloud-metrics-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded!");
  }

  async function downloadPDF() {
    if (!reportData?.rows?.length) { toast.error("No data to export"); return; }
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "landscape" });

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 297, 297, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Big Cloud Metrics AI", 14, 18);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Report: ${DATE_RANGES.find((r) => r.value === range)?.label} · Generated ${new Date().toLocaleDateString()}`,
      14, 26
    );

    autoTable(doc, {
      startY: 32,
      head: [["Date", "Technician", "Role", "Metric", "Value", "Notes"]],
      body: reportData.rows.map((r: Record<string, unknown>) => [
        r.date, r.technician, r.role, r.metric, r.value, r.notes,
      ]),
      theme: "grid",
      styles: {
        fillColor: [30, 41, 59],
        textColor: [241, 245, 249],
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [29, 78, 216],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [15, 23, 42] },
    });

    doc.save(`big-cloud-metrics-${range}-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("PDF downloaded!");
  }

  const rows: Record<string, unknown>[] = reportData?.rows ?? [];
  const displayedRows = rows.slice(0, 100); // show first 100 in preview

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Reports & Export"
        subtitle="Download team performance data"
        user={{ name: session.user.name ?? "", role: session.user.role, avatarColor: session.user.avatarColor }}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {DATE_RANGES.filter((r) => r.value !== "custom").map((r) => (
              <button key={r.value} onClick={() => setRange(r.value)}
                className="px-3 py-2 rounded-xl text-sm font-medium transition-all border"
                style={{
                  background: range === r.value ? "rgba(59,130,246,0.2)" : "rgba(30,41,59,0.5)",
                  borderColor: range === r.value ? "rgba(59,130,246,0.5)" : "rgba(148,163,184,0.1)",
                  color: range === r.value ? "#60A5FA" : "#94A3B8",
                }}>
                {r.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex gap-2">
            <button onClick={downloadCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white border"
              style={{ background: "rgba(16,185,129,0.2)", borderColor: "rgba(16,185,129,0.3)", color: "#34D399" }}>
              <Table size={16} /> CSV
            </button>
            <button onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)", color: "white" }}>
              <FileText size={16} /> PDF
            </button>
          </div>
        </div>

        {/* Summary */}
        {!isLoading && reportData && (
          <div className="flex items-center gap-4 px-4 py-3 rounded-xl"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <span className="text-sm text-blue-300">
              <strong>{formatNumber(reportData.totalLogs)}</strong> log entries found for this period
            </span>
            <span className="text-slate-500 text-sm">·</span>
            <span className="text-sm text-slate-400">
              {new Date(reportData.start).toLocaleDateString()} → {new Date(reportData.end).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Data preview table */}
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: "rgba(30,41,59,0.6)", borderColor: "rgba(148,163,184,0.08)" }}>
          <div className="px-5 py-3 border-b text-xs font-medium text-slate-400"
            style={{ borderColor: "rgba(148,163,184,0.08)" }}>
            Preview (first {Math.min(100, rows.length)} of {rows.length} rows)
          </div>
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-10 rounded-lg" />)}
            </div>
          ) : rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
                    {["Date", "Technician", "Role", "Metric", "Value", "Notes"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-white/3"
                      style={{ borderColor: "rgba(148,163,184,0.04)" }}>
                      <td className="px-4 py-2.5 text-slate-300 font-mono text-xs">{String(row.date)}</td>
                      <td className="px-4 py-2.5 text-slate-200">{String(row.technician)}</td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300">
                          {String(row.role).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-200">{String(row.metric)}</td>
                      <td className="px-4 py-2.5 text-white font-bold tabular-nums">{String(row.value)}</td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs max-w-[200px] truncate">
                        {String(row.notes || "—")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500">
              No data for this period.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
