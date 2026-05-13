"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Activity, Clock, TrendingUp, TrendingDown, BarChart2,
  RefreshCw, AlertTriangle, CheckCircle2, Zap, BrainCircuit
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ScatterChart, Scatter, Cell, ComposedChart
} from "recharts";

const RISK_COLORS: Record<string, string> = {
  "Low Risk": "#10b981",
  "Moderate Risk": "#f59e0b",
  "High Risk": "#f43f5e",
};

// ── Heatmap Cell Component ───────────────────────────────────────────────
function HeatmapGrid({ data }: { data: any[] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getColor = (val: number | null) => {
    if (val === null) return "rgba(255,255,255,0.03)";
    if (val < 25) return "rgba(16,185,129,0.5)";
    if (val < 40) return "rgba(6,182,212,0.45)";
    if (val < 60) return "rgba(245,158,11,0.5)";
    return "rgba(244,63,94,0.55)";
  };

  const lookup: Record<string, any> = {};
  data.forEach((d) => {
    lookup[`${d.day}_${d.hour}`] = d;
  });

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Hour labels */}
        <div className="flex gap-0.5 ml-10 mb-1">
          {hours.filter((_, i) => i % 3 === 0).map((h) => (
            <div key={h} className="text-[9px] text-theme-muted font-mono" style={{ width: "36px", textAlign: "center" }}>
              {h.toString().padStart(2, "0")}:00
            </div>
          ))}
        </div>
        {/* Rows */}
        {days.map((day) => (
          <div key={day} className="flex items-center gap-0.5 mb-0.5">
            <div className="w-10 text-[10px] text-theme-muted font-medium text-right pr-2">{day}</div>
            {hours.map((h) => {
              const cell = lookup[`${day}_${h}`];
              const val = cell?.value ?? null;
              return (
                <motion.div
                  key={h}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (days.indexOf(day) * 24 + h) * 0.003 }}
                  title={val !== null ? `${day} ${h}:00 — CII: ${val}` : `${day} ${h}:00 — No data`}
                  className="w-[27px] h-5 rounded-sm cursor-pointer hover:ring-1 hover:ring-white/30 transition-all"
                  style={{ backgroundColor: getColor(val) }}
                />
              );
            })}
          </div>
        ))}
        {/* Legend */}
        <div className="flex items-center gap-3 ml-10 mt-3 text-[10px] text-theme-muted">
          <span>Low</span>
          {["rgba(16,185,129,0.5)", "rgba(6,182,212,0.45)", "rgba(245,158,11,0.5)", "rgba(244,63,94,0.55)"].map((c, i) => (
            <div key={i} className="w-4 h-3 rounded-sm" style={{ backgroundColor: c }} />
          ))}
          <span>High</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function CIITimelinePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:8000/api/analytics/cii-timeline");
      setData(res.data);
    } catch (e: any) {
      console.error(e);
      setError("Failed to fetch CII timeline analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-theme-muted">
        <RefreshCw className="w-6 h-6 animate-spin" /> Loading temporal analytics…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-theme-muted">
        <AlertTriangle className="w-10 h-10 text-amber-400" />
        <p>{error || "No data available."}</p>
        <button onClick={fetchData} className="px-4 py-2 rounded-xl bg-surface border border-theme text-sm hover:bg-white/10">
          Retry
        </button>
      </div>
    );
  }

  const { timeline, weeklyComparison, heatmap, summary } = data;

  const trendDirection = timeline.length >= 2
    ? timeline[timeline.length - 1].cii > timeline[0].cii ? "Increasing" : "Decreasing"
    : "Stable";

  return (
    <div className="w-full h-full overflow-y-auto pb-20">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Circadian Timeline Intelligence</h1>
              <p className="text-theme-muted text-sm">Advanced temporal analytics, drift detection, and rolling correlations.</p>
            </div>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-theme hover:bg-white/10 transition text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </motion.div>

        {/* ── Summary Stat Cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Mean CII", value: summary.mean, sub: `σ = ${summary.stdDev}`, icon: BarChart2, color: "from-cyan-500/20 to-blue-600/10 border-cyan-500/20", textColor: "#06b6d4" },
            { label: "Latest CII", value: summary.latest, sub: trendDirection, icon: trendDirection === "Increasing" ? TrendingUp : TrendingDown, color: "from-purple-500/20 to-violet-600/10 border-purple-500/20", textColor: "#a78bfa" },
            { label: "Avg Drift", value: summary.avgDrift, sub: "|dCII/dt|", icon: Activity, color: "from-amber-500/20 to-orange-600/10 border-amber-500/20", textColor: "#f59e0b" },
            { label: "Stress r", value: summary.globalStressCorrelation, sub: "CII ↔ Stress", icon: Zap, color: "from-rose-500/20 to-pink-600/10 border-rose-500/20", textColor: "#f43f5e" },
            { label: "Sleep r", value: summary.globalSleepCorrelation, sub: "CII ↔ Sleep", icon: BrainCircuit, color: "from-emerald-500/20 to-green-600/10 border-emerald-500/20", textColor: "#10b981" },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} border`}>
              <card.icon className="w-4 h-4 text-theme-muted mb-1.5" />
              <div className="text-xl font-bold" style={{ color: card.textColor }}>{card.value}</div>
              <div className="text-[10px] text-theme-muted mt-0.5">{card.label}</div>
              <div className="text-[10px] text-gray-600">{card.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* ── CII Trend + Rolling Mean ────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-surface border border-theme rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-1">CII Daily Trend & Rolling Average</h3>
          <p className="text-xs text-theme-muted mb-4">{summary.totalRecords} records — raw CII values with 5-point moving average overlay.</p>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={timeline}>
              <defs>
                <linearGradient id="ciiAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="index" tick={{ fill: "var(--chart-tick)", fontSize: 10 }} label={{ value: "Record #", position: "insideBottomRight", offset: -5, style: { fill: "#6b7280", fontSize: 10 } }} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--chart-tick)", fontSize: 10 }} />
              <Tooltip 
                formatter={(v: any, name: any) => [typeof v === "number" ? v.toFixed(1) : v, name]} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Area type="monotone" dataKey="cii" name="Raw CII" stroke="#8b5cf6" fill="url(#ciiAreaFill)" strokeWidth={1.5} dot={false} animationDuration={1200} />
              <Line type="monotone" dataKey="rollingMean" name="5pt Moving Avg" stroke="#06b6d4" strokeWidth={2.5} dot={false} strokeDasharray="" animationDuration={1500} />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── Circadian Drift + Instability ────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-surface border border-theme rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-1">Circadian Drift |dCII/dt|</h3>
            <p className="text-xs text-theme-muted mb-4">Absolute rate of change — spikes indicate rapid phase instability.</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="index" tick={{ fill: "var(--chart-tick)", fontSize: 10 }} />
                <YAxis tick={{ fill: "var(--chart-tick)", fontSize: 10 }} />
                <Tooltip  />
                <Bar dataKey="drift" name="Drift |dCII/dt|" animationDuration={800}>
                  {timeline.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.drift > 5 ? "#f43f5e" : entry.drift > 2 ? "#f59e0b" : "#10b981"} fillOpacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
            className="bg-surface border border-theme rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-1">Rolling Instability (σ)</h3>
            <p className="text-xs text-theme-muted mb-4">5-point rolling standard deviation — higher values = less predictable rhythms.</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="instGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="index" tick={{ fill: "var(--chart-tick)", fontSize: 10 }} />
                <YAxis tick={{ fill: "var(--chart-tick)", fontSize: 10 }} />
                <Tooltip  />
                <Area type="monotone" dataKey="instability" name="Instability (σ)" stroke="#f59e0b" fill="url(#instGrad)" strokeWidth={2} dot={false} animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* ── Rolling Correlations ─────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-surface border border-theme rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-1">Rolling Cross-Correlations (7-pt window)</h3>
          <p className="text-xs text-theme-muted mb-4">How CII co-moves with stress and sleep scores over time. Values near ±1 = strong coupling.</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timeline.filter((d: any) => d.stressCorrelation !== undefined)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="index" tick={{ fill: "var(--chart-tick)", fontSize: 10 }} />
              <YAxis domain={[-1, 1]} tick={{ fill: "var(--chart-tick)", fontSize: 10 }} />
              <Tooltip 
                formatter={(v: any) => [typeof v === "number" ? v.toFixed(3) : v]} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Line type="monotone" dataKey="stressCorrelation" name="CII ↔ Stress" stroke="#f43f5e" strokeWidth={2} dot={false} animationDuration={1200} />
              <Line type="monotone" dataKey="sleepCorrelation" name="CII ↔ Sleep" stroke="#06b6d4" strokeWidth={2} dot={false} animationDuration={1200} />
              {/* Zero line */}
              <Line type="monotone" dataKey={() => 0} stroke="#ffffff20" strokeWidth={1} strokeDasharray="4 4" dot={false} legendType="none" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── Temporal Heatmap ─────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-surface border border-theme rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-1">Temporal CII Heatmap</h3>
          <p className="text-xs text-theme-muted mb-5">Average CII by day-of-week × hour-of-day — identifies temporal disruption patterns.</p>
          <HeatmapGrid data={heatmap} />
        </motion.div>

        {/* ── Weekly Comparison ────────────────────────────────────────────── */}
        {weeklyComparison.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-surface border border-theme rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-1">Weekly CII Comparison</h3>
            <p className="text-xs text-theme-muted mb-4">Mean CII per week with instability bands — tracks longitudinal trajectory.</p>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={weeklyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="week" tick={{ fill: "var(--chart-tick)", fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--chart-tick)", fontSize: 10 }} />
                <Tooltip  />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="mean" name="Avg CII" fill="#8b5cf6" fillOpacity={0.6} radius={[4, 4, 0, 0]} animationDuration={800} />
                <Line type="monotone" dataKey="instability" name="Instability (σ)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} animationDuration={1200} />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* ── Risk Distribution ────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-surface border border-theme rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-4">Cumulative Risk Distribution</h3>
          <div className="flex items-center gap-6 flex-wrap">
            {Object.entries(summary.riskDistribution).map(([risk, count]: [string, any]) => {
              const total = summary.totalRecords;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const color = RISK_COLORS[risk] || "#6b7280";
              return (
                <div key={risk} className="flex items-center gap-3">
                  <div className="relative w-14 h-14">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#ffffff10" strokeWidth="3" />
                      <motion.circle
                        cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3"
                        strokeDasharray={`${pct} ${100 - pct}`}
                        initial={{ strokeDasharray: "0 100" }}
                        animate={{ strokeDasharray: `${pct} ${100 - pct}` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color }}>{pct}%</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color }}>{risk}</p>
                    <p className="text-[10px] text-theme-muted">{count} / {total} records</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
