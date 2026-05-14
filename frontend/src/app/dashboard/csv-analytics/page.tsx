"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  FileSpreadsheet, RefreshCw, TrendingUp, BarChart2,
  Table2, AlertCircle, CheckCircle2, Filter, ArrowUpDown
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";

const COLORS = ["#06b6d4", "#8b5cf6", "#f43f5e", "#10b981", "#f59e0b", "#3b82f6", "#ec4899"];
const qualityColor = (q: number) => q >= 90 ? "#10b981" : q >= 70 ? "#f59e0b" : "#f43f5e";

export default function CSVAnalyticsPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "https://chrono-health-ai-platform.onrender.com"}/api/upload/history`);
      setHistory(res.data);
      if (res.data.length > 0) setSelected(res.data[0]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const filtered = history.filter(d =>
    d.filename?.toLowerCase().includes(filterText.toLowerCase())
  );

  const colData = selected?.columns?.map((col: string, i: number) => ({
    name: col.length > 12 ? col.slice(0, 12) + "…" : col,
    fullName: col,
    missing: selected.missing_values?.[col] ?? 0,
    fill: COLORS[i % COLORS.length],
  })) ?? [];



  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CSV Analytics</h1>
            <p className="text-theme-muted text-sm">Inspect uploaded datasets, column stats and quality scores.</p>
          </div>
        </div>
        <button onClick={fetchHistory} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-theme hover:bg-white/10 transition text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Datasets", value: history.length, icon: Table2, color: "from-cyan-500/20 to-blue-600/10 border-cyan-500/20" },
          { label: "Total Rows", value: history.reduce((s, d) => s + (d.rows ?? 0), 0).toLocaleString(), icon: BarChart2, color: "from-purple-500/20 to-indigo-600/10 border-purple-500/20" },
          { label: "Avg Quality", value: history.length ? Math.round(history.reduce((s, d) => s + (d.quality_score ?? 0), 0) / history.length) + "/100" : "—", icon: CheckCircle2, color: "from-emerald-500/20 to-green-600/10 border-emerald-500/20" },
          { label: "Avg Completeness", value: history.length ? Math.round(history.reduce((s, d) => s + (d.completeness ?? 0), 0) / history.length) + "%" : "—", icon: TrendingUp, color: "from-amber-500/20 to-orange-600/10 border-amber-500/20" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`p-5 rounded-2xl bg-gradient-to-br ${stat.color} border`}>
            <stat.icon className="w-5 h-5 text-theme-muted mb-2" />
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-theme-muted mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Dataset list */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 bg-surface border border-theme rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-theme flex items-center gap-2">
            <Filter className="w-4 h-4 text-theme-muted" />
            <input value={filterText} onChange={e => setFilterText(e.target.value)}
              placeholder="Filter datasets…" className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none" />
          </div>
          {loading ? <div className="p-8 text-center text-theme-muted text-sm">Loading…</div>
            : filtered.length === 0 ? (
              <div className="p-8 text-center text-theme-muted text-sm">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No datasets found. Upload one first.
              </div>
            ) : (
              <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                <div className="grid grid-cols-3 px-4 py-2 text-xs text-theme-muted font-semibold">
                  <span>File</span><span>Rows</span><span>Quality</span>
                </div>
                {filtered.map((d, i) => (
                  <button key={i} onClick={() => setSelected(d)}
                    className={`w-full grid grid-cols-3 px-4 py-3 text-left transition-colors ${selected?.id === d.id ? "bg-cyan-500/10 border-l-2 border-cyan-500" : "hover:bg-surface"}`}>
                    <span className="text-xs text-white truncate pr-2">{d.filename}</span>
                    <span className="text-xs text-theme-muted">{d.rows?.toLocaleString()}</span>
                    <span className="text-xs font-bold" style={{ color: qualityColor(d.quality_score ?? 0) }}>{d.quality_score ?? 0}/100</span>
                  </button>
                ))}
              </div>
            )}
        </motion.div>

        {/* Detail panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-5">
          {selected ? (
            <>
              <div className="bg-surface border border-theme rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{selected.filename}</h3>
                    <p className="text-xs text-theme-muted mt-0.5">{selected.type} · {selected.rows} rows · {selected.columns?.length} cols · {selected.time ? new Date(selected.time).toLocaleDateString() : ""}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border"
                    style={{ color: qualityColor(selected.quality_score), borderColor: qualityColor(selected.quality_score) + "40", backgroundColor: qualityColor(selected.quality_score) + "15" }}>
                    Quality {selected.quality_score}/100
                  </span>
                </div>
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-theme-muted mb-1">
                    <span>Data Completeness</span>
                    <span className="font-semibold">{selected.completeness?.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${selected.completeness}%` }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                  </div>
                </div>
                <p className="text-xs text-theme-muted mb-2 font-semibold uppercase tracking-wider">Columns ({selected.columns?.length})</p>
                <div className="flex flex-wrap gap-2">
                  {selected.columns?.map((col: string, i: number) => (
                    <span key={i} className="px-2 py-1 rounded-lg text-xs font-medium"
                      style={{ backgroundColor: COLORS[i % COLORS.length] + "20", color: COLORS[i % COLORS.length] }}>
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing values chart */}
              <div className="bg-surface border border-theme rounded-2xl p-6">
                <h3 className="text-sm font-semibold mb-1">Missing Values by Column</h3>
                <p className="text-xs text-theme-muted mb-4">Null entry count per feature for imputation planning.</p>
                {colData.every((c: any) => c.missing === 0) ? (
                  <div className="flex items-center gap-3 text-emerald-400 py-6 justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">No missing values — dataset is 100% complete.</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={colData} layout="vertical" margin={{ left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                      <XAxis type="number" tick={{ fill: "var(--chart-tick)", fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fill: "var(--chart-tick)", fontSize: 11 }} width={80} />
                      <Tooltip />
                      <Bar dataKey="missing" radius={[0, 4, 4, 0]}>
                        {colData.map((entry: any, index: number) => <Cell key={index} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>


            </>
          ) : (
            <div className="bg-surface border border-theme rounded-2xl p-16 text-center text-theme-muted">
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a dataset from the list to view analytics.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
