"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useChronoTheme } from "@/lib/useChronoTheme";
import {
  Sparkles, RefreshCw, AlertTriangle, Eye, ChevronDown, ChevronUp,
  Zap, Shield, BrainCircuit, Activity
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

const TARGET_COLORS: Record<string, string> = {
  stress: "#f43f5e", sleep: "#8b5cf6", fatigue: "#f59e0b", circadian: "#06b6d4",
};
const TARGET_ICONS: Record<string, any> = {
  "Stress Risk": Zap, "Sleep Disorder": Shield, "Mental Fatigue": BrainCircuit, "Circadian Stability": Activity,
};

const shapColor = (v: number) => v >= 0 ? "#f43f5e" : "#06b6d4";

export default function ExplainabilityPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTarget, setActiveTarget] = useState("stress");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const { isDark, tooltipStyle, chartGridStroke, chartTickFill } = useChronoTheme();

  // Editable inputs
  const [inputs, setInputs] = useState({
    hrv: 45.5, sleep_duration: 6.2, sleep_quality: 0.7, cortisol_level: 15.0, light_exposure: 5000.0,
  });

  const fetchData = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "https://chrono-health-ai-platform.onrender.com"}/api/explainability/analyze`;
      const res = params 
        ? await axios.post(url, params)
        : await axios.get(url);
      
      setData(res.data);
      // Sync inputs with what was actually analyzed if it was a default GET
      if (!params && res.data.inputs) {
        setInputs(res.data.inputs);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleInputChange = (key: string, val: number) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleAnalyze = () => fetchData(inputs);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-full gap-3" style={{ color: 'var(--muted)' }}>
        <RefreshCw className="w-6 h-6 animate-spin" /> Computing SHAP explanations…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4" style={{ color: 'var(--muted)' }}>
        <AlertTriangle className="w-10 h-10 text-amber-400" />
        <p>Explainability engine unavailable.</p>
        <button onClick={() => fetchData()} className="px-4 py-2 rounded-xl text-sm hover:opacity-80" style={{ background: 'var(--surface)', border: '1px solid var(--card-border)' }}>Retry</button>
      </div>
    );
  }

  const currentTarget = data.targets[activeTarget];
  const targetLabels: Record<string, string> = { stress: "Stress", sleep: "Sleep", fatigue: "Fatigue", circadian: "Circadian" };

  // Waterfall data for selected target
  const waterfallData = currentTarget?.contributions?.map((c: any) => ({
    name: c.label.length > 14 ? c.label.slice(0, 14) + "…" : c.label,
    fullName: c.label,
    value: c.shapValue,
    absValue: c.absShap,
    fill: shapColor(c.shapValue),
  })) || [];

  return (
    <div className="w-full h-full overflow-y-auto pb-20">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AI Explainability Center</h1>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>SHAP-powered feature importance, contribution analysis, and clinical reasoning.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              {data.method}
            </span>
            <button onClick={handleAnalyze} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition text-sm disabled:opacity-50" style={{ background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Analyze
            </button>
          </div>
        </motion.div>

        {/* ── Input Controls ────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-4">Patient Input Parameters</h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { key: "hrv", label: "HRV", min: 10, max: 120, step: 0.5, unit: "ms" },
              { key: "sleep_duration", label: "Sleep Duration", min: 2, max: 12, step: 0.1, unit: "hrs" },
              { key: "sleep_quality", label: "Sleep Quality", min: 0, max: 1, step: 0.05, unit: "" },
              { key: "cortisol_level", label: "Cortisol", min: 1, max: 40, step: 0.5, unit: "μg/dL" },
              { key: "light_exposure", label: "Light Exposure", min: 0, max: 15000, step: 100, unit: "lux" },
            ].map((f) => (
              <div key={f.key} className="space-y-1">
                <label className="text-[10px] font-semibold uppercase" style={{ color: 'var(--muted)' }}>{f.label}</label>
                <input type="range" min={f.min} max={f.max} step={f.step}
                  value={(inputs as any)[f.key]}
                  onChange={(e) => handleInputChange(f.key, parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 cursor-pointer" />
                <div className="text-xs font-mono text-center">
                  {(inputs as any)[f.key]}{f.unit && ` ${f.unit}`}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Global Feature Importance ─────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-1">Global Feature Importance (mean |SHAP|)</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Average absolute SHAP value across all prediction targets — higher = more influential overall.</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.globalImportance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis type="number" tick={{ fill: 'var(--chart-tick)', fontSize: 10 }} />
              <YAxis type="category" dataKey="label" width={120} tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="importance" name="Mean |SHAP|" radius={[0, 4, 4, 0]} animationDuration={800}>
                {data.globalImportance.map((_: any, i: number) => (
                  <Cell key={i} fill={["#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4", "#10b981"][i % 5]} fillOpacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── Target Selector + Contribution Waterfall ──────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Target selector */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-3">Prediction Target</h3>
            <div className="space-y-2">
              {Object.entries(targetLabels).map(([key, label]) => (
                <button key={key} onClick={() => setActiveTarget(key)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between ${activeTarget === key
                    ? "bg-amber-500/10 border border-amber-500/30"
                    : ""}`}
                  style={activeTarget !== key ? { background: 'var(--surface)', border: '1px solid var(--card-border)', color: 'var(--muted)' } : { color: 'var(--foreground)' }}>
                  <span className="font-medium">{label}</span>
                  <span className="text-[10px] font-mono" style={{ color: TARGET_COLORS[key] }}>
                    {currentTarget && activeTarget === key ? `Driver: ${data.targets[key]?.primaryDriverLabel || "—"}` : ""}
                  </span>
                </button>
              ))}
            </div>

            {/* Radar for selected target */}
            {currentTarget && (
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={currentTarget.contributions.map((c: any) => ({
                    axis: c.label.split(" ")[0],
                    value: c.absShap,
                  }))}>
                    <PolarGrid stroke="var(--chart-grid)" />
                    <PolarAngleAxis dataKey="axis" tick={{ fill: 'var(--chart-tick)', fontSize: 10 }} />
                    <Radar dataKey="value" stroke={TARGET_COLORS[activeTarget]}
                      fill={TARGET_COLORS[activeTarget]} fillOpacity={0.2} strokeWidth={2} animationDuration={600} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* Waterfall / contribution bars */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6 lg:col-span-2">
            <h3 className="text-sm font-semibold mb-1">
              SHAP Feature Contributions — {targetLabels[activeTarget]}
            </h3>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
              <span className="text-rose-400">Red (positive)</span> pushes prediction higher &middot;
              <span className="text-cyan-400 ml-1">Blue (negative)</span> pushes it lower.
            </p>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={waterfallData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis type="number" tick={{ fill: 'var(--chart-tick)', fontSize: 10 }}
                  label={{ value: "SHAP value", position: "insideBottom", offset: -3, style: { fill: 'var(--chart-tick)', fontSize: 10 } }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle}
                  formatter={(v: any) => [typeof v === "number" ? v.toFixed(4) : v, "SHAP"]} />
                <Bar dataKey="value" name="SHAP" radius={[0, 4, 4, 0]} animationDuration={800}>
                  {waterfallData.map((d: any, i: number) => (
                    <Cell key={i} fill={d.fill} fillOpacity={0.75} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* ── Explanation Cards ─────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h3 className="text-sm font-semibold mb-4">Local Explanation Cards</h3>
          <div className="grid lg:grid-cols-2 gap-4">
            {data.explanationCards.map((card: any, idx: number) => {
              const Icon = TARGET_ICONS[card.target] || Sparkles;
              const isExpanded = expandedCard === idx;
              return (
                <motion.div key={idx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.07 }}
                  className="glass-card rounded-2xl p-5 cursor-pointer transition-all"
                  onClick={() => setExpandedCard(isExpanded ? null : idx)}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-semibold">{card.target}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        {card.prediction}
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />}
                    </div>
                  </div>

                  <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>Primary driver: <span className="font-medium" style={{ color: 'var(--foreground)' }}>{card.primaryDriver}</span></p>

                  {/* Top 3 contributors mini-bars */}
                  <div className="space-y-1.5">
                    {card.topContributors.map((tc: any, ti: number) => (
                      <div key={ti} className="flex items-center gap-2">
                        <span className="text-[10px] w-[100px] truncate" style={{ color: 'var(--muted)' }}>{tc.feature}</span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden relative" style={{ background: 'var(--surface)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, Math.abs(tc.impact) * 500)}%` }}
                            transition={{ duration: 0.6, delay: 0.1 * ti }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: tc.direction === "positive" ? "#f43f5e" : "#06b6d4" }}
                          />
                        </div>
                        <span className="text-[10px] font-mono w-[45px] text-right"
                          style={{ color: tc.direction === "positive" ? "#f43f5e" : "#06b6d4" }}>
                          {tc.impact > 0 ? "+" : ""}{tc.impact.toFixed(3)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Expanded reasoning */}
                  {isExpanded && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 p-3 rounded-xl text-xs leading-relaxed" style={{ background: 'var(--surface)', border: '1px solid var(--card-border)', color: 'var(--muted)' }}>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 inline mr-1.5" />
                      {card.explanation}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Feature Detail Table ──────────────────────────────────────── */}
        {currentTarget && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="glass-card rounded-2xl p-6 overflow-x-auto">
            <h3 className="text-sm font-semibold mb-4">
              Detailed Feature Analysis — {targetLabels[activeTarget]}
            </h3>
            <table className="w-full text-sm text-left min-w-[600px]">
              <thead className="text-[10px] uppercase" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--card-border)' }}>
                <tr>
                  <th className="px-4 py-3">Feature</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Baseline</th>
                  <th className="px-4 py-3">Deviation</th>
                  <th className="px-4 py-3">SHAP</th>
                  <th className="px-4 py-3">Direction</th>
                </tr>
              </thead>
              <tbody>
                {currentTarget.contributions.map((c: any, i: number) => (
                  <tr key={i} className="transition" style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td className="px-4 py-3 font-medium">{c.label}</td>
                    <td className="px-4 py-3 font-mono">{c.value}</td>
                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--muted)' }}>{c.baseline}</td>
                    <td className="px-4 py-3 font-mono" style={{ color: c.deviation >= 0 ? "#f59e0b" : "#06b6d4" }}>
                      {c.deviation >= 0 ? "+" : ""}{c.deviation}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold" style={{ color: shapColor(c.shapValue) }}>
                      {c.shapValue >= 0 ? "+" : ""}{c.shapValue.toFixed(4)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${c.direction === "positive"
                        ? "text-rose-400 bg-rose-500/10" : "text-cyan-400 bg-cyan-500/10"}`}>
                        {c.direction === "positive" ? "↑ Risk" : "↓ Protective"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

      </div>
    </div>
  );
}
