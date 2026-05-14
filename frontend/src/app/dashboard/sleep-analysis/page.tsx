"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useChronoTheme } from "@/lib/useChronoTheme";
import { Moon, RefreshCw, Clock, TrendingDown, AlertCircle, CheckCircle2, Zap, BrainCircuit } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, Cell
} from "recharts";

const sleepStageColors: Record<string, string> = {
  Deep: "#8b5cf6", REM: "#06b6d4", Light: "#f59e0b", Awake: "#f43f5e"
};

export default function SleepAnalysisPage() {
  const { isDark, tooltipStyle } = useChronoTheme();
  const [predData, setPredData] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pred, hist] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000"}/api/predict`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000"}/api/prediction/history`),
      ]);
      setPredData(pred.data);
      setHistory(hist.data.slice(-14));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const sleepProb = predData ? predData.sleep_disorder_probability : 0;
  const sleepScore = predData ? Math.round((1 - sleepProb) * 100) : 0;
  const riskLabel = sleepProb < 0.3 ? "Low Risk" : sleepProb < 0.6 ? "Moderate Risk" : "High Risk";
  const riskColor = sleepProb < 0.3 ? "#10b981" : sleepProb < 0.6 ? "#f59e0b" : "#f43f5e";

  // Simulated sleep stage breakdown based on disorder probability
  const stageData = [
    { stage: "Deep Sleep", pct: Math.round(20 - sleepProb * 10), color: sleepStageColors.Deep },
    { stage: "REM Sleep", pct: Math.round(25 - sleepProb * 8), color: sleepStageColors.REM },
    { stage: "Light Sleep", pct: Math.round(40 + sleepProb * 5), color: sleepStageColors.Light },
    { stage: "Awake", pct: Math.round(15 + sleepProb * 13), color: sleepStageColors.Awake },
  ];

  const radarData = [
    { subject: "Sleep Duration", value: Math.round((1 - sleepProb) * 90 + 10) },
    { subject: "Sleep Quality", value: sleepScore },
    { subject: "REM Cycles", value: Math.round((1 - sleepProb) * 80 + 20) },
    { subject: "Continuity", value: Math.round((1 - sleepProb) * 85 + 10) },
    { subject: "Recovery", value: predData ? Math.round(predData.circadian_stability) : 75 },
  ];

  const historyData = history.map((h, i) => ({
    t: `D-${history.length - i}`,
    sleep: h.sleep ?? 0,
    stress: h.stress ?? 0,
  }));

  const recommendations = sleepProb > 0.5 ? [
    "Implement strict stimulus control — use bed only for sleep.",
    "Maintain a consistent wake time, even on weekends.",
    "Avoid screens 90 minutes before target sleep time.",
    "Try 4-7-8 breathing technique as a sleep-onset protocol.",
  ] : sleepProb > 0.3 ? [
    "Maintain consistent sleep/wake schedule within ±20 min.",
    "Limit caffeine intake after 2:00 PM.",
    "Use progressive muscle relaxation before bed.",
  ] : [
    "Sleep architecture is well-calibrated. Maintain current schedule.",
    "Light therapy at 07:30 AM may further strengthen circadian phase.",
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen transition-colors duration-500">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
            <Moon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sleep Analysis</h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Disorder probability, sleep architecture, and CBT-I recommendations.</p>
          </div>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition text-sm disabled:opacity-50" style={{ background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> {loading ? "Fetching…" : "Refresh"}
        </button>
      </motion.div>

      {loading && !predData ? (
        <div className="flex items-center justify-center h-64" style={{ color: 'var(--muted)' }}>
          <RefreshCw className="w-8 h-8 animate-spin mr-3" /> Running sleep analysis…
        </div>
      ) : predData ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Sleep Score", value: `${sleepScore}/100`, sub: riskLabel, icon: Moon, color: "from-indigo-500/20 to-purple-600/10 border-indigo-500/20", textColor: "#818cf8" },
              { label: "Disorder Probability", value: `${(sleepProb * 100).toFixed(1)}%`, sub: riskLabel, icon: AlertCircle, color: sleepProb < 0.3 ? "from-emerald-500/20 to-green-600/10 border-emerald-500/20" : sleepProb < 0.6 ? "from-amber-500/20 to-orange-600/10 border-amber-500/20" : "from-red-500/20 to-rose-600/10 border-red-500/20", textColor: riskColor },
              { label: "Circadian Stability", value: `${predData.circadian_stability}%`, sub: "Phase alignment", icon: Clock, color: "from-cyan-500/20 to-blue-600/10 border-cyan-500/20", textColor: "#06b6d4" },
              { label: "CII Index", value: predData.cii_prediction, sub: "Circadian disruption level", icon: BrainCircuit, color: "from-purple-500/20 to-violet-600/10 border-purple-500/20", textColor: "#a78bfa" },
            ].map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={`p-5 rounded-2xl bg-gradient-to-br ${card.color} border shadow-sm`}>
                <card.icon className="w-5 h-5 text-slate-400 mb-2" />
                <div className="text-2xl font-bold" style={{ color: card.textColor }}>{card.value}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{card.label}</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{card.sub}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Sleep stage breakdown */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-2xl p-6">
              <h3 className="text-sm font-semibold mb-1">Sleep Stage Distribution</h3>
              <p className="text-xs mb-5" style={{ color: 'var(--muted)' }}>Estimated architecture based on disorder probability model.</p>
              <div className="space-y-4">
                {stageData.map((stage, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: stage.color }} className="font-medium">{stage.stage}</span>
                      <span className="text-theme-muted">{stage.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface)' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${stage.pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                        className="h-full rounded-full" style={{ backgroundColor: stage.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-3 rounded-xl border border-theme bg-surface text-xs text-theme-muted">
                {riskLabel === "Low Risk"
                  ? <span className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-4 h-4" /> Healthy sleep architecture — deep and REM cycles are well distributed.</span>
                  : <span className="flex items-center gap-2 text-amber-400"><AlertCircle className="w-4 h-4" /> Sleep fragmentation detected — reduced deep sleep and elevated wake time.</span>}
              </div>
            </motion.div>

            {/* Radar & recommendations */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-semibold mb-4">Sleep Quality Radar</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--chart-grid)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} />
                    <Radar name="Sleep" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-semibold mb-3">CBT-I Recommendations</h3>
                <div className="space-y-2">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: 'var(--surface)', color: 'var(--foreground)' }}>
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Historical sleep trend */}
          {historyData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6">
              <h3 className="text-sm font-semibold mb-1">Sleep Score — Historical Trend</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Last {historyData.length} records from prediction history database.</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="sleepAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="stressAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="t" tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="sleep" name="Sleep Score" stroke="#8b5cf6" fill="url(#sleepAreaGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="stress" name="Stress Score" stroke="#f43f5e" fill="url(#stressAreaGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </>
      ) : (
        <div className="text-center text-theme-muted py-20">Failed to load sleep data. Is the backend running?</div>
      )}
    </div>
  );
}
