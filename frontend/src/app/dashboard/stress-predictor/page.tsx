"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import api from "@/lib/api";
import { useChronoTheme } from "@/lib/useChronoTheme";
import { HeartPulse, Brain, AlertTriangle, TrendingUp, RefreshCw, Zap, Activity } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

export default function StressPredictorPage() {
  const { isDark, tooltipStyle } = useChronoTheme();
  const [data, setData] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pred, hist] = await Promise.all([
        api.get("/api/predict"),
        api.get("/api/prediction/history"),
      ]);
      setData(pred.data);
      setHistory(hist.data.slice(-20));
    } catch (e) { 
      console.error("Stress Predictor fetch error:", e);
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const riskColor = (r: string) => r === "Low" ? "#10b981" : r === "Moderate" ? "#f59e0b" : "#f43f5e";
  const riskBg = (r: string) => r === "Low" ? "from-emerald-500/20 to-green-600/10 border-emerald-500/20"
    : r === "Moderate" ? "from-amber-500/20 to-orange-600/10 border-amber-500/20"
      : "from-red-500/20 to-rose-600/10 border-red-500/20";

  const radarData = data ? [
    { subject: "HRV", value: Math.min(100, data.circadian_stability) },
    { subject: "Sleep", value: Math.max(0, 100 - data.sleep_disorder_probability * 100) },
    { subject: "Circadian", value: data.circadian_stability },
    { subject: "Fatigue", value: data.mental_fatigue === "Low" ? 80 : data.mental_fatigue === "Moderate" ? 50 : 20 },
    { subject: "CII", value: Math.max(0, 100 - data.cii_prediction) },
  ] : [];

  const historyChartData = history.map((h, i) => ({
    t: `T-${history.length - i}`,
    stress: h.stress ?? 0,
    sleep: h.sleep ?? 0,
    fatigue: h.fatigue ?? 0,
  }));

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen transition-colors duration-500">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stress Predictor</h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Real-time ML-based stress risk assessment and biomarker analysis.</p>
          </div>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition text-sm disabled:opacity-50" style={{ background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> {loading ? "Fetching…" : "Refresh"}
        </button>
      </motion.div>

      {loading && !data ? (
        <div className="flex items-center justify-center h-64 text-theme-muted">
          <RefreshCw className="w-8 h-8 animate-spin mr-3" /> Running ML inference…
        </div>
      ) : data ? (
        <>
          {/* Top stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Stress Risk", value: data.stress_risk, sub: `Confidence: ${data.prediction_metadata?.confidence_score}%`, color: riskBg(data.stress_risk), textColor: riskColor(data.stress_risk), icon: AlertTriangle },
              { label: "Mental Fatigue", value: data.mental_fatigue, sub: "Fatigue classification", color: riskBg(data.mental_fatigue), textColor: riskColor(data.mental_fatigue), icon: Brain },
              { label: "Circadian Stability", value: `${data.circadian_stability}%`, sub: "Phase alignment score", color: "from-cyan-500/20 to-blue-600/10 border-cyan-500/20", textColor: "#06b6d4", icon: Activity },
              { label: "Sleep Disorder Prob.", value: `${(data.sleep_disorder_probability * 100).toFixed(1)}%`, sub: "Risk category: " + (data.sleep_disorder_probability < 0.3 ? "Low" : data.sleep_disorder_probability < 0.6 ? "Moderate" : "High"), color: "from-purple-500/20 to-indigo-600/10 border-purple-500/20", textColor: "#8b5cf6", icon: Zap },
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
            {/* Radar chart */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-2xl p-6">
              <h3 className="text-sm font-semibold mb-1">Biomarker Radar Profile</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Multi-dimensional health state across key stress biomarkers.</p>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--chart-grid)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--chart-tick)', fontSize: 12 }} />
                  <Radar name="Score" dataKey="value" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Recommendations */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-2xl p-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold mb-1">Chronotherapy Timing</h3>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="text-sm text-amber-300">{data.chronotherapy_timing}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">CBT Recommendations</h3>
                <div className="space-y-2">
                  {data.personalized_cbt_suggestions?.map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: 'var(--surface)', color: 'var(--foreground)' }}>
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
                <div className="p-3 rounded-xl text-xs" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>
                <span className="text-theme-muted font-semibold">Primary Driver: </span>
                {data.prediction_metadata?.primary_driver} ·{" "}
                <span className="text-theme-muted font-semibold">Severity: </span>
                {data.prediction_metadata?.severity_classification}
              </div>
            </motion.div>
          </div>

          {/* Historical stress trend */}
          {historyChartData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6">
              <h3 className="text-sm font-semibold mb-1">Historical Stress & Sleep Trend</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Last {historyChartData.length} inference records from the database.</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={historyChartData}>
                  <defs>
                    <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="t" tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area type="monotone" dataKey="stress" name="Stress Score" stroke="#f43f5e" fill="url(#stressGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="sleep" name="Sleep Score" stroke="#06b6d4" fill="url(#sleepGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </>
      ) : (
        <div className="text-center text-theme-muted py-20">Failed to load prediction data. Is the backend running?</div>
      )}
    </div>
  );
}
