"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Layers, RefreshCw, BrainCircuit, Target, Award, ShieldAlert,
  Activity, Clock, ChevronRight, BarChart2, Zap
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ComposedChart, PieChart, Pie
} from "recharts";

const TYPE_COLORS: Record<string, string> = {
  "CBT-I + Light Therapy": "#6366f1",
  "Melatonin Only": "#10b981",
  "Mindfulness + Sleep Restriction": "#f59e0b",
  "No Intervention": "#6b7280",
};
const fallbackColor = (t: string) => TYPE_COLORS[t] || ["#f43f5e", "#06b6d4", "#8b5cf6", "#ec4899"][Math.abs(t.charCodeAt(0)) % 4];

// Q-table heatmap cell color
const qColor = (v: number): string => {
  if (v >= 15) return "rgba(99,102,241,0.7)";
  if (v >= 8) return "rgba(99,102,241,0.45)";
  if (v >= 0) return "rgba(99,102,241,0.2)";
  return "rgba(244,63,94,0.4)";
};

import { useAnalytics } from "@/context/AnalyticsContext";

export default function RLSimulationPage() {
  const { 
    rlData: sim, 
    rlAnalyticsData: analytics, 
    loading: contextLoading, 
    refreshAll: fetchData 
  } = useAnalytics();
  const [isSimulating, setIsSimulating] = useState(false);

  const loading = contextLoading && (!sim || !analytics);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      // RL re-simulation is typically a background task on backend, 
      // here we just trigger a global refresh to get latest state.
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-theme-muted">
        <Activity className="w-6 h-6 animate-spin" /> Loading RL Engine…
      </div>
    );
  }

  const { summary: s } = analytics;
  const states = ["High Stress, Delayed Sleep", "Low Stress, Delayed Sleep", "High Stress, Normal Sleep", "Low Stress, Normal Sleep"];
  const actions = ["CBT-I + Light Therapy", "Melatonin Only", "Mindfulness + Sleep Restriction", "No Intervention"];

  return (
    <div className="w-full h-full overflow-y-auto pb-20">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Adaptive AI Intervention Engine</h1>
              <p className="text-theme-muted text-sm">Deep Q-Learning chronotherapy scheduling with live policy analytics.</p>
            </div>
          </div>
          <button onClick={handleSimulate} disabled={isSimulating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50 text-sm">
            <RefreshCw className={`w-4 h-4 ${isSimulating ? "animate-spin" : ""}`} /> {isSimulating ? "Simulating…" : "Force Re-simulation"}
          </button>
        </motion.div>

        {/* ── Stat Cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Steps", value: s.total, sub: "DB records", icon: BarChart2, color: "from-indigo-500/20 to-violet-600/10 border-indigo-500/20", textColor: "#818cf8" },
            { label: "Cumulative R", value: s.totalCumulativeReward, sub: "Total reward", icon: Zap, color: "from-emerald-500/20 to-green-600/10 border-emerald-500/20", textColor: "#10b981" },
            { label: "Mean Reward", value: s.meanReward, sub: "Per step", icon: Target, color: "from-cyan-500/20 to-blue-600/10 border-cyan-500/20", textColor: "#06b6d4" },
            { label: "Best Intervention", value: s.bestIntervention?.split(" ")[0] || "—", sub: `mean R = ${s.bestMeanReward}`, icon: Award, color: "from-amber-500/20 to-orange-600/10 border-amber-500/20", textColor: "#f59e0b" },
            { label: "Adherence", value: `${sim.engagement_analytics.adherence_rate}%`, sub: sim.engagement_analytics.drop_off_risk + " risk", icon: ShieldAlert, color: "from-rose-500/20 to-pink-600/10 border-rose-500/20", textColor: "#f43f5e" },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} border`}>
              <card.icon className="w-4 h-4 text-theme-muted mb-1.5" />
              <div className="text-xl font-bold truncate" style={{ color: card.textColor }}>{card.value}</div>
              <div className="text-[10px] text-theme-muted mt-0.5">{card.label}</div>
              <div className="text-[10px] text-gray-600">{card.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Cumulative Reward + Rolling Average ──────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-surface border border-theme rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-1">Cumulative Reward Progression</h3>
          <p className="text-xs text-theme-muted mb-4">{s.total} intervention steps — per-step reward, cumulative total, and rolling average.</p>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={analytics.cumulativeRewards}>
              <defs>
                <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="index" tick={{ fill: "var(--chart-tick)", fontSize: 10 }} />
              <YAxis tick={{ fill: "var(--chart-tick)", fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Area type="monotone" dataKey="cumulative" name="Cumulative" stroke="#6366f1" fill="url(#cumGrad)" strokeWidth={2} dot={false} animationDuration={1200} />
              <Line type="monotone" dataKey="rollingAvg" name="Rolling Avg" stroke="#10b981" strokeWidth={2} dot={false} animationDuration={1400} />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── Frequency + Effectiveness side by side ───────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Intervention Frequency */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="bg-surface border border-theme rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-1">Intervention Frequency</h3>
            <p className="text-xs text-theme-muted mb-4">How often each intervention has been prescribed by the RL policy.</p>
            <div className="flex items-center gap-4">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={analytics.frequency.map((f: any) => ({ ...f, fill: fallbackColor(f.type) }))}
                      cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="count" animationDuration={800}>
                      {analytics.frequency.map((f: any, i: number) => <Cell key={i} fill={fallbackColor(f.type)} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-2">
                {analytics.frequency.map((f: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fallbackColor(f.type) }} />
                    <span className="text-[10px] text-theme-primary flex-1 truncate">{f.type}</span>
                    <span className="text-[10px] font-bold">{f.count}</span>
                    <span className="text-[9px] text-theme-muted">({f.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Effectiveness */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-surface border border-theme rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-1">Intervention Effectiveness</h3>
            <p className="text-xs text-theme-muted mb-4">Mean reward per intervention type — higher = more effective at reducing CII.</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.effectiveness} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis type="number" tick={{ fill: "var(--chart-tick)", fontSize: 10 }} />
                <YAxis type="category" dataKey="type" tick={{ fill: "var(--chart-tick)", fontSize: 10 }} width={90}
                  tickFormatter={(t: string) => t.length > 14 ? t.slice(0, 14) + "…" : t} />
                <Tooltip />
                <Bar dataKey="meanReward" name="Mean Reward" radius={[0, 4, 4, 0]} animationDuration={800}>
                  {analytics.effectiveness.map((e: any, i: number) => (
                    <Cell key={i} fill={fallbackColor(e.type)} fillOpacity={0.75} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* ── Q-Table Heatmap ──────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-surface border border-theme rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-semibold">Q-Table Heatmap</h3>
              <p className="text-xs text-theme-muted">State-action expected reward matrix — brighter = higher Q-value.</p>
            </div>
            <div className="text-[10px] font-mono text-theme-muted px-3 py-1 rounded-lg bg-black border border-theme">
              α={s.alpha} · γ={s.gamma} · ε={s.epsilon}
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Action column headers */}
              <div className="flex ml-[200px] mb-1">
                {actions.map((a, i) => (
                  <div key={i} className="w-[110px] text-center text-[9px] text-theme-muted font-semibold truncate px-1">
                    {a.length > 16 ? a.slice(0, 16) + "…" : a}
                  </div>
                ))}
              </div>
              {/* State rows */}
              {states.map((state, si) => (
                <div key={si} className="flex items-center mb-1">
                  <div className="w-[200px] text-right pr-3 text-[10px] text-theme-muted font-medium truncate">{state}</div>
                  {actions.map((action, ai) => {
                    const cell = analytics.qHeatmap.find((c: any) => c.stateIdx === si && c.actionIdx === ai);
                    const val = cell?.qValue ?? 0;
                    const isMax = analytics.qHeatmap
                      .filter((c: any) => c.stateIdx === si)
                      .every((c: any) => val >= c.qValue);
                    return (
                      <motion.div
                        key={ai}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (si * 4 + ai) * 0.03 }}
                        className={`w-[110px] h-[38px] flex items-center justify-center rounded-md mx-0.5 text-xs font-mono font-bold
                          ${isMax ? "ring-1 ring-indigo-400/50" : ""}`}
                        style={{ backgroundColor: qColor(val) }}
                        title={`${state} → ${action}: Q=${val}`}
                      >
                        <span className={val >= 0 ? "text-white" : "text-red-300"}>{val.toFixed(1)}</span>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
              {/* Legend */}
              <div className="flex items-center gap-2 mt-3 ml-[200px] text-[9px] text-theme-muted">
                <span>Negative</span>
                {["rgba(244,63,94,0.4)", "rgba(99,102,241,0.2)", "rgba(99,102,241,0.45)", "rgba(99,102,241,0.7)"].map((c, i) => (
                  <div key={i} className="w-5 h-3 rounded-sm" style={{ backgroundColor: c }} />
                ))}
                <span>High Q</span>
                <span className="ml-3 text-indigo-400">⬜ = optimal action</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Policy Evolution ─────────────────────────────────────────── */}
        {analytics.policyEvolution.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-surface border border-theme rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-1">Policy Evolution</h3>
            <p className="text-xs text-theme-muted mb-4">How intervention mix shifts over time — tracks the agent&apos;s policy convergence.</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={analytics.policyEvolution} stackOffset="expand">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="index" tick={{ fill: "var(--chart-tick)", fontSize: 10 }} />
                <YAxis tickFormatter={(v: number) => `${Math.round(v * 100)}%`} tick={{ fill: "var(--chart-tick)", fontSize: 10 }} />
                <Tooltip
                  formatter={(v: any) => [`${typeof v === "number" ? v.toFixed(1) : v}%`]} />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
                {analytics.frequency.map((f: any) => (
                  <Area key={f.type} type="monotone" dataKey={f.type} stackId="1"
                    stroke={fallbackColor(f.type)} fill={fallbackColor(f.type)} fillOpacity={0.6}
                    animationDuration={1000} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* ── Adaptive Scheduling Timeline ─────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="p-6 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-transparent border border-indigo-500/20">
          <h3 className="text-sm font-semibold mb-1">Today&apos;s Adaptive Schedule</h3>
          <p className="text-xs text-indigo-300/60 mb-5">Optimal intervention timing based on max Q-values.</p>
          <div className="space-y-4">
            {sim.scheduling_timeline.map((item: any, idx: number) => (
              <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-theme">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs text-indigo-300 font-bold">{item.time}</span>
                    <span className="text-[10px] uppercase font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">{item.status}</span>
                  </div>
                  <p className="text-sm text-white truncate">{item.intervention}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-theme-muted">Expected</p>
                  <p className="text-sm font-mono font-bold text-green-400">{item.expected_reward}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
