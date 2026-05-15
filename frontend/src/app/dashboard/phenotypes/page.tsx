"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import api from "@/lib/api";
import {
  BrainCircuit, RefreshCw, AlertTriangle, Users, Shield,
  TrendingUp, Zap, Sparkles
} from "lucide-react";
import {
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
  AreaChart, Area, PieChart, Pie
} from "recharts";

const PHENO_COLORS: Record<string, string> = {
  "Balanced": "#10b981",
  "Stress-Dominant": "#f43f5e",
  "Sleep-Dominant": "#8b5cf6",
  "Comorbid": "#f59e0b",
};

const PHENO_ICONS: Record<string, string> = {
  "Balanced": "🟢",
  "Stress-Dominant": "🔴",
  "Sleep-Dominant": "🟣",
  "Comorbid": "🟡",
};

const RISK_COLORS: Record<string, string> = {
  Low: "#10b981",
  Moderate: "#f59e0b",
  High: "#f43f5e",
};

import { useAnalytics } from "@/context/AnalyticsContext";

export default function PhenotypesPage() {
  const { 
    phenotypesData: data, 
    loading, 
    refreshAll: fetchData 
  } = useAnalytics();
  const [selectedRadar, setSelectedRadar] = useState<string>("Balanced");

  useEffect(() => {
    if (data && data.dominant) {
      setSelectedRadar(data.dominant);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-theme-muted">
        <RefreshCw className="w-6 h-6 animate-spin" /> Analyzing behavioral phenotypes…
      </div>
    );
  }

  if (!data || !data.summary?.total) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-theme-muted">
        <AlertTriangle className="w-10 h-10 text-amber-400" />
        <p>No prediction data found. Run the ML pipeline first.</p>
        <button onClick={fetchData} className="px-4 py-2 rounded-xl bg-surface border border-theme text-sm hover:bg-white/10">Retry</button>
      </div>
    );
  }

  const { distribution, dominant, radarProfiles, trend, riskSegmentation, groupComparison, summary } = data;

  // Pie data
  const pieData = Object.entries(distribution).map(([name, count]: [string, any]) => ({
    name,
    value: count,
    fill: PHENO_COLORS[name] || "#6b7280",
  }));

  // Risk segmentation for bar
  const riskData = Object.entries(riskSegmentation).map(([tier, count]: [string, any]) => ({
    tier,
    count,
    fill: RISK_COLORS[tier] || "#6b7280",
  }));

  return (
    <div className="w-full h-full overflow-y-auto pb-20">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-500 to-rose-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Behavioral Phenotype Explorer</h1>
              <p className="text-theme-muted text-sm">ML-derived behavioral classification, risk segmentation, and comparative analytics.</p>
            </div>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-theme hover:bg-white/10 transition text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </motion.div>

        {/* ── Dominant Phenotype Banner ──────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl border p-6"
          style={{ borderColor: PHENO_COLORS[dominant] + "40", background: `linear-gradient(135deg, ${PHENO_COLORS[dominant]}10, transparent)` }}>
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10"
            style={{ background: PHENO_COLORS[dominant] }} />
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-4xl">{PHENO_ICONS[dominant]}</span>
            <div>
              <p className="text-xs text-theme-muted uppercase tracking-widest font-bold">Dominant Phenotype</p>
              <p className="text-2xl font-black" style={{ color: PHENO_COLORS[dominant] }}>{dominant}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-3xl font-black">{summary.dominantPct}%</p>
              <p className="text-xs text-theme-muted">{summary.dominantCount} / {summary.total} records</p>
            </div>
          </div>
        </motion.div>

        {/* ── Summary Stat Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Avg Stress", value: summary.avgStress, icon: Zap, color: "from-rose-500/20 to-pink-600/10 border-rose-500/20", textColor: "#f43f5e" },
            { label: "Avg Sleep", value: summary.avgSleep, icon: Shield, color: "from-purple-500/20 to-violet-600/10 border-purple-500/20", textColor: "#8b5cf6" },
            { label: "Avg Fatigue", value: summary.avgFatigue, icon: TrendingUp, color: "from-amber-500/20 to-orange-600/10 border-amber-500/20", textColor: "#f59e0b" },
            { label: "Avg CII", value: summary.avgCII, icon: Sparkles, color: "from-cyan-500/20 to-blue-600/10 border-cyan-500/20", textColor: "#06b6d4" },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={`p-5 rounded-2xl bg-gradient-to-br ${card.color} border`}>
              <card.icon className="w-4 h-4 text-theme-muted mb-1.5" />
              <div className="text-2xl font-bold" style={{ color: card.textColor }}>{card.value}</div>
              <div className="text-xs text-theme-muted mt-0.5">{card.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Distribution Pie + Radar Selector ─────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Phenotype Distribution */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="bg-surface border border-theme rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-1">Phenotype Distribution</h3>
            <p className="text-xs text-theme-muted mb-4">Classification breakdown across {summary.total} prediction records.</p>
            <div className="flex items-center gap-4">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                      paddingAngle={4} dataKey="value" animationDuration={800}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip  />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-3">
                {pieData.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.fill }} />
                    <span className="text-xs text-theme-primary flex-1">{p.name}</span>
                    <span className="text-xs font-bold">{p.value}</span>
                    <span className="text-[10px] text-theme-muted">({summary.total ? Math.round(p.value / summary.total * 100) : 0}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Radar Profile Selector */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-surface border border-theme rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-1">Phenotype Radar Profile</h3>
            <p className="text-xs text-theme-muted mb-3">Select a phenotype to view its average biomarker fingerprint.</p>
            <div className="flex gap-2 mb-4 flex-wrap">
              {Object.keys(PHENO_COLORS).map((p) => (
                <button key={p} onClick={() => setSelectedRadar(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedRadar === p
                    ? "border-white/30 bg-white/10 text-white"
                    : "border-theme bg-surface text-theme-muted hover:text-theme-primary"}`}
                  style={selectedRadar === p ? { color: PHENO_COLORS[p] } : {}}>
                  {PHENO_ICONS[p]} {p}
                </button>
              ))}
            </div>
            {radarProfiles[selectedRadar]?.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarProfiles[selectedRadar]}>
                  <PolarGrid stroke="#ffffff15" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: "var(--chart-tick)", fontSize: 11 }} />
                  <Radar name={selectedRadar} dataKey="value"
                    stroke={PHENO_COLORS[selectedRadar]} fill={PHENO_COLORS[selectedRadar]}
                    fillOpacity={0.25} strokeWidth={2} animationDuration={600} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-600 text-sm">
                No records for this phenotype.
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Group Comparison Bar Chart ─────────────────────────────────── */}
        {groupComparison.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-surface border border-theme rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-1">Grouped Phenotype Comparison</h3>
            <p className="text-xs text-theme-muted mb-4">Mean biomarker scores per phenotype — reveals the defining characteristics of each cluster.</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={groupComparison} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="phenotype" tick={{ fill: "var(--chart-tick)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--chart-tick)", fontSize: 10 }} domain={[0, 100]} />
                <Tooltip  />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="avgStress" name="Stress" fill="#f43f5e" radius={[3, 3, 0, 0]} animationDuration={800} />
                <Bar dataKey="avgSleep" name="Sleep" fill="#8b5cf6" radius={[3, 3, 0, 0]} animationDuration={900} />
                <Bar dataKey="avgFatigue" name="Fatigue" fill="#f59e0b" radius={[3, 3, 0, 0]} animationDuration={1000} />
                <Bar dataKey="avgCII" name="CII" fill="#06b6d4" radius={[3, 3, 0, 0]} animationDuration={1100} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* ── Phenotype Trend Stacked Area ───────────────────────────────── */}
        {trend.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-surface border border-theme rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-1">Phenotype Trend Over Time</h3>
            <p className="text-xs text-theme-muted mb-4">Sliding-window phenotype prevalence (%) — tracks transitions between behavioral states.</p>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trend} stackOffset="expand">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="index" tick={{ fill: "var(--chart-tick)", fontSize: 10 }} />
                <YAxis tickFormatter={(v: number) => `${Math.round(v * 100)}%`} tick={{ fill: "var(--chart-tick)", fontSize: 10 }} />
                <Tooltip 
                  formatter={(v: any) => [`${typeof v === "number" ? v.toFixed(1) : v}%`]} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Area type="monotone" dataKey="Balanced" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} animationDuration={1000} />
                <Area type="monotone" dataKey="Stress-Dominant" stackId="1" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.6} animationDuration={1100} />
                <Area type="monotone" dataKey="Sleep-Dominant" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} animationDuration={1200} />
                <Area type="monotone" dataKey="Comorbid" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} animationDuration={1300} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* ── Risk Segmentation ─────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-surface border border-theme rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-4">Risk Segmentation</h3>
          <div className="flex items-center gap-8 flex-wrap">
            {riskData.map((r, i) => {
              const pct = summary.total > 0 ? Math.round((r.count / summary.total) * 100) : 0;
              return (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#ffffff10" strokeWidth="3" />
                      <motion.circle
                        cx="18" cy="18" r="15" fill="none" stroke={r.fill} strokeWidth="3"
                        strokeDasharray={`${pct} ${100 - pct}`}
                        initial={{ strokeDasharray: "0 100" }}
                        animate={{ strokeDasharray: `${pct} ${100 - pct}` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: r.fill }}>{pct}%</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: r.fill }}>{r.tier} Risk</p>
                    <p className="text-[10px] text-theme-muted">{r.count} / {summary.total}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
