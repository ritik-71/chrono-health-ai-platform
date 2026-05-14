"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Activity, Calendar, TrendingDown, TrendingUp, AlertTriangle, RefreshCw,
  Clock, CheckCircle, ShieldAlert, Zap, Moon
} from "lucide-react";
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Scatter
} from "recharts";

const TARGET_COLORS: Record<string, string> = {
  stressEMA: "#f43f5e",
  sleepEMA: "#8b5cf6",
  fatigueEMA: "#f59e0b",
  ciiEMA: "#06b6d4",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0a0a0a] border border-theme rounded-xl p-3 shadow-xl">
        <p className="text-xs font-bold mb-2">Day {label}</p>
        {payload.map((entry: any, index: number) => {
          if (entry.dataKey === 'interventionReward') return null; // handled separately
          if (entry.dataKey.includes('EMA')) {
             return (
               <div key={index} className="flex items-center gap-2 text-xs mb-1">
                 <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                 <span className="text-theme-muted capitalize">{entry.name}:</span>
                 <span className="text-white font-mono">{Number(entry.value).toFixed(1)}</span>
               </div>
             );
          }
          return null;
        })}
        {data.intervention && (
          <div className="mt-3 pt-2 border-t border-theme">
            <p className="text-[10px] uppercase text-indigo-400 font-bold mb-1 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Intervention Triggered
            </p>
            <p className="text-xs text-white bg-indigo-500/20 px-2 py-1 rounded-md border border-indigo-500/30">
              {data.intervention}
            </p>
            {data.interventionReward !== undefined && (
              <p className="text-[10px] text-green-400 mt-1 font-mono">+ {data.interventionReward} reward</p>
            )}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function PatientJourneyPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000"}/api/timeline/patient-journey`);
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-theme-muted">
        <RefreshCw className="w-6 h-6 animate-spin" /> Analyzing patient journey...
      </div>
    );
  }

  if (!data || !data.timeline?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-theme-muted">
        <AlertTriangle className="w-10 h-10 text-amber-400" />
        <p>No patient timeline data available. Ensure predictions and RL history exist.</p>
        <button onClick={fetchData} className="px-4 py-2 rounded-xl bg-surface border border-theme text-sm hover:bg-white/10">Retry</button>
      </div>
    );
  }

  const { timeline, recoveryStats: stats, interventionMarkers } = data;

  const getTrendIcon = (trend: number) => {
    if (trend < -0.1) return <TrendingDown className="w-4 h-4 text-emerald-400" />;
    if (trend > 0.1) return <TrendingUp className="w-4 h-4 text-rose-400" />;
    return <Activity className="w-4 h-4 text-theme-muted" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend < -0.1) return "text-emerald-400";
    if (trend > 0.1) return "text-rose-400";
    return "text-theme-muted";
  };

  return (
    <div className="w-full h-full overflow-y-auto pb-20">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Patient Journey Timeline</h1>
              <p className="text-theme-muted text-sm">Longitudinal recovery curves, biomarker evolution, and intervention efficacy.</p>
            </div>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-theme hover:bg-white/10 transition text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </motion.div>

        {/* ── Recovery Stat Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Stress Evolution", trend: stats.stressTrend, initial: stats.initialStress, current: stats.currentStress, icon: Activity, color: "from-rose-500/20 to-pink-600/10 border-rose-500/20" },
            { label: "Sleep Recovery", trend: -stats.sleepTrend, initial: stats.initialSleep, current: stats.currentSleep, icon: Moon, color: "from-purple-500/20 to-violet-600/10 border-purple-500/20" },
            { label: "Circadian Stability", trend: -stats.ciiTrend, initial: stats.initialCII, current: stats.currentCII, icon: Clock, color: "from-cyan-500/20 to-blue-600/10 border-cyan-500/20" },
            { label: "Total Interventions", trend: 0, initial: 0, current: stats.totalInterventions, icon: Zap, color: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/20", hideTrend: true },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`p-5 rounded-2xl bg-gradient-to-br ${card.color} border flex flex-col justify-between`}>
              <div className="flex items-center justify-between mb-2">
                <card.icon className="w-5 h-5 text-theme-primary" />
                {!card.hideTrend && (
                  <div className={`flex items-center gap-1 text-xs font-bold ${getTrendColor(card.trend)}`}>
                    {getTrendIcon(card.trend)}
                    <span>{card.trend > 0 ? "+" : ""}{card.trend.toFixed(2)}/day</span>
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs text-theme-muted mb-1">{card.label}</div>
                {card.hideTrend ? (
                  <div className="text-3xl font-black">{card.current}</div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black">{card.current?.toFixed(1)}</span>
                    <span className="text-xs text-theme-muted line-through">init {card.initial?.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Main Longitudinal Timeline Chart ─────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-surface border border-theme rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h3 className="text-sm font-semibold">Biomarker Recovery Curves</h3>
              <p className="text-xs text-theme-muted">Exponential Moving Average (EMA) of key clinical indicators over {stats.daysTracked} days.</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-rose-500" /> Stress</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-purple-500" /> Sleep</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-cyan-500" /> CII</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-[3px] border border-indigo-500 bg-indigo-500/20" /> Intervention</span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {Object.entries(TARGET_COLORS).map(([key, color]) => (
                    <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "var(--chart-tick)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--chart-tick)", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Area charts for smoothed progression */}
                <Area type="monotone" dataKey="sleepEMA" name="Sleep Quality" stroke={TARGET_COLORS.sleepEMA} strokeWidth={2} fillOpacity={1} fill="url(#colorsleepEMA)" animationDuration={1000} />
                <Area type="monotone" dataKey="ciiEMA" name="Circadian Stability" stroke={TARGET_COLORS.ciiEMA} strokeWidth={2} fillOpacity={1} fill="url(#colorciiEMA)" animationDuration={1200} />
                <Line type="monotone" dataKey="stressEMA" name="Stress Risk" stroke={TARGET_COLORS.stressEMA} strokeWidth={3} dot={false} animationDuration={1400} />
                
                {/* Intervention Markers overlay */}
                <Scatter dataKey="interventionReward" fill="#6366f1" line={false} shape="square" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── Intervention Event Log ───────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-surface border border-theme rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" /> Intervention Event Log
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interventionMarkers.map((marker: any, idx: number) => (
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50 group-hover:bg-indigo-400 transition-colors" />
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono text-theme-muted">Day {marker.day}</span>
                  <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                    +{marker.reward} R
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-200">{marker.type}</p>
              </motion.div>
            ))}
          </div>
          {interventionMarkers.length === 0 && (
            <div className="p-6 text-center text-theme-muted text-sm border border-theme rounded-xl border-dashed">
              No RL interventions triggered yet.
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
