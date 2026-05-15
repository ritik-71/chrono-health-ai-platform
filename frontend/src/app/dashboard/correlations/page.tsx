"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import api from "@/lib/api";
import {
  GitCompareArrows, RefreshCw, AlertTriangle, Filter, TrendingUp, Info
} from "lucide-react";
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell,
  LineChart, Line
} from "recharts";

const FEATURE_COLORS: Record<string, string> = {
  stress: "#f43f5e", sleep: "#8b5cf6", fatigue: "#f59e0b", cii: "#06b6d4",
};

const heatVal = (v: number): string => {
  if (v >= 0.7) return "rgba(244,63,94,0.75)";
  if (v >= 0.4) return "rgba(244,63,94,0.45)";
  if (v >= 0.2) return "rgba(245,158,11,0.4)";
  if (v >= -0.2) return "rgba(255,255,255,0.08)";
  if (v >= -0.4) return "rgba(6,182,212,0.35)";
  if (v >= -0.7) return "rgba(6,182,212,0.55)";
  return "rgba(6,182,212,0.75)";
};

import { useAnalytics } from "@/context/AnalyticsContext";

export default function CorrelationsPage() {
  const { 
    correlationsData: data, 
    loading, 
    refreshAll: fetchData 
  } = useAnalytics();
  const [activePair, setActivePair] = useState<string | null>(null);
  const [filterStrength, setFilterStrength] = useState<string>("all");

  useEffect(() => {
    if (data && data.pairs) {
      const pairKeys = Object.keys(data.pairs);
      if (pairKeys.length > 0 && !activePair) setActivePair(pairKeys[0]);
    }
  }, [data, activePair]);

  const filteredMatrix = useMemo(() => {
    if (!data?.matrix) return [];
    if (filterStrength === "all") return data.matrix;
    return data.matrix.filter((c: any) =>
      c.rowIdx !== c.colIdx && c.strength === filterStrength
    );
  }, [data, filterStrength]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-theme-muted">
        <RefreshCw className="w-6 h-6 animate-spin" /> Computing correlations…
      </div>
    );
  }

  if (!data || !data.summary?.total) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-theme-muted">
        <AlertTriangle className="w-10 h-10 text-amber-400" />
        <p>No data. Run the ML pipeline first.</p>
        <button onClick={fetchData} className="px-4 py-2 rounded-xl bg-surface border border-theme text-sm hover:bg-white/10">Retry</button>
      </div>
    );
  }

  const { matrix, pairs, analyses, featureStats, summary } = data;
  const features = summary.features as string[];
  const pairKeys = Object.keys(pairs);
  const currentPair = activePair ? pairs[activePair] : null;

  return (
    <div className="w-full h-full overflow-y-auto pb-20">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <GitCompareArrows className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Clinical Correlation Intelligence</h1>
              <p className="text-theme-muted text-sm">Feature correlation matrix, pairwise scatter analysis, and clinical interpretations.</p>
            </div>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-theme hover:bg-white/10 transition text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </motion.div>

        {/* Strongest pair banner */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-transparent flex items-center gap-4 flex-wrap">
          <TrendingUp className="w-6 h-6 text-cyan-400" />
          <div>
            <p className="text-xs text-theme-muted uppercase tracking-widest font-bold">Strongest Pair</p>
            <p className="text-lg font-bold">{summary.strongestPair}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-black text-cyan-400">|r| = {summary.strongestR?.toFixed(4)}</p>
            <p className="text-xs text-theme-muted">{summary.total} records analysed</p>
          </div>
        </motion.div>

        {/* ── Interactive Heatmap ───────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-surface border border-theme rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-semibold">Correlation Matrix Heatmap</h3>
              <p className="text-xs text-theme-muted">Pearson r between all feature pairs. Click a cell to explore.</p>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-theme-muted" />
              {["all", "Strong", "Moderate", "Weak", "Negligible"].map((s) => (
                <button key={s} onClick={() => setFilterStrength(s)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition ${filterStrength === s
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-theme text-theme-muted hover:text-theme-primary"}`}>
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[400px]">
              {/* Column labels */}
              <div className="flex ml-[90px]">
                {features.map((f) => (
                  <div key={f} className="w-[80px] text-center text-[10px] text-theme-muted font-semibold capitalize pb-1">{f}</div>
                ))}
              </div>
              {/* Rows */}
              {features.map((rowF, ri) => (
                <div key={rowF} className="flex items-center">
                  <div className="w-[90px] text-right pr-3 text-[10px] text-theme-muted font-semibold capitalize">{rowF}</div>
                  {features.map((colF, ci) => {
                    const cell = matrix.find((c: any) => c.row === rowF && c.col === colF);
                    if (!cell) return <div key={ci} className="w-[80px] h-[40px]" />;
                    const isDiag = ri === ci;
                    const isHighlighted = filterStrength === "all" || isDiag || cell.strength === filterStrength;
                    const pairKey = ri < ci ? `${rowF}_vs_${colF}` : ri > ci ? `${colF}_vs_${rowF}` : null;
                    return (
                      <motion.div
                        key={ci}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: isHighlighted ? 1 : 0.2, scale: 1 }}
                        transition={{ delay: (ri * 4 + ci) * 0.02 }}
                        onClick={() => { if (pairKey && pairs[pairKey]) setActivePair(pairKey); }}
                        className={`w-[80px] h-[40px] flex items-center justify-center text-xs font-mono font-bold rounded-md m-0.5 transition-all
                          ${pairKey && pairs[pairKey] ? "cursor-pointer hover:ring-1 hover:ring-white/30" : ""}
                          ${activePair === pairKey ? "ring-2 ring-cyan-400" : ""}`}
                        style={{ backgroundColor: isDiag ? "rgba(255,255,255,0.06)" : heatVal(cell.value) }}
                        title={`${cell.rowLabel} vs ${cell.colLabel}: r = ${cell.value} (${cell.strength})`}
                      >
                        <span className={isDiag ? "text-theme-muted" : "text-white"}>
                          {isDiag ? "1.00" : cell.value.toFixed(2)}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
              {/* Color legend */}
              <div className="flex items-center gap-2 mt-4 ml-[90px] text-[9px] text-theme-muted">
                <span>-1 (inverse)</span>
                {[
                  "rgba(6,182,212,0.75)", "rgba(6,182,212,0.45)",
                  "rgba(255,255,255,0.08)",
                  "rgba(244,63,94,0.45)", "rgba(244,63,94,0.75)"
                ].map((c, i) => (
                  <div key={i} className="w-6 h-3 rounded-sm" style={{ backgroundColor: c }} />
                ))}
                <span>+1 (positive)</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Pairwise Scatter Explorer ─────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pair selector */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="bg-surface border border-theme rounded-2xl p-5 lg:col-span-1">
            <h3 className="text-sm font-semibold mb-3">Feature Pairs</h3>
            <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
              {pairKeys.map((key) => {
                const p = pairs[key];
                return (
                  <button key={key} onClick={() => setActivePair(key)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${activePair === key
                      ? "bg-cyan-500/10 border border-cyan-500/30 text-white"
                      : "bg-surface border border-theme text-theme-muted hover:bg-surface"}`}>
                    <span>{p.xLabel} vs {p.yLabel}</span>
                    <span className={`font-mono font-bold ${Math.abs(p.r) >= 0.4 ? "text-cyan-400" : Math.abs(p.r) >= 0.2 ? "text-amber-400" : "text-gray-600"}`}>
                      {p.r.toFixed(3)}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Scatter + regression */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-surface border border-theme rounded-2xl p-6 lg:col-span-2">
            {currentPair ? (
              <>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold">{currentPair.xLabel} vs {currentPair.yLabel}</h3>
                  <span className="text-xs font-mono px-2 py-1 rounded-lg bg-surface border border-theme text-theme-primary">
                    r = {currentPair.r.toFixed(4)} · {currentPair.strength}
                  </span>
                </div>
                <p className="text-xs text-theme-muted mb-4">
                  Regression: y = {currentPair.slope}x + {currentPair.intercept}
                </p>
                <ResponsiveContainer width="100%" height={260}>
                  <ScatterChart margin={{ left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                    <XAxis dataKey="x" name={currentPair.xLabel} tick={{ fill: "var(--chart-tick)", fontSize: 10 }}
                      label={{ value: currentPair.xLabel, position: "insideBottom", offset: -3, style: { fill: "#6b7280", fontSize: 10 } }} />
                    <YAxis dataKey="y" name={currentPair.yLabel} tick={{ fill: "var(--chart-tick)", fontSize: 10 }}
                      label={{ value: currentPair.yLabel, angle: -90, position: "insideLeft", offset: 10, style: { fill: "#6b7280", fontSize: 10 } }} />
                    <Tooltip
                      formatter={(v: any, name: any) => [typeof v === "number" ? v.toFixed(1) : v, name]} />
                    <Scatter data={currentPair.points} fill="#06b6d4" fillOpacity={0.6} r={4} animationDuration={600} />
                  </ScatterChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-600 text-sm">Select a pair to explore.</div>
            )}
          </motion.div>
        </div>

        {/* ── Bucketed Trend (selected pair) ────────────────────────────── */}
        {currentPair?.buckets?.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-surface border border-theme rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-1">Bucketed Relationship: {currentPair.xLabel} → {currentPair.yLabel}</h3>
            <p className="text-xs text-theme-muted mb-4">Mean {currentPair.yLabel} for quantile buckets of {currentPair.xLabel}.</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={currentPair.buckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="xMean" tick={{ fill: "var(--chart-tick)", fontSize: 10 }}
                  label={{ value: `${currentPair.xLabel} (bucket mean)`, position: "insideBottom", offset: -3, style: { fill: "#6b7280", fontSize: 10 } }} />
                <YAxis tick={{ fill: "var(--chart-tick)", fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="yMean" name={`Mean ${currentPair.yLabel}`} fill="#06b6d4" radius={[4, 4, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* ── Clinical Analyses Cards ──────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Stress vs Sleep */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="bg-surface border border-theme rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-1">Stress ↔ Sleep Coupling</h3>
            <div className="flex items-center gap-3 mt-2 mb-4">
              <span className="text-2xl font-black" style={{ color: Math.abs(analyses.stressSleep.r) >= 0.4 ? "#f43f5e" : "#f59e0b" }}>
                r = {analyses.stressSleep.r.toFixed(4)}
              </span>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold border"
                style={{ color: Math.abs(analyses.stressSleep.r) >= 0.4 ? "#f43f5e" : "#f59e0b", borderColor: "currentColor", backgroundColor: "currentColor", opacity: 0.15 }}>
                {analyses.stressSleep.strength}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface text-xs text-theme-muted flex items-start gap-2">
              <Info className="w-4 h-4 text-theme-muted shrink-0 mt-0.5" />
              {analyses.stressSleep.interpretation}
            </div>
          </motion.div>

          {/* Fatigue vs Sleep (HRV proxy) */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
            className="bg-surface border border-theme rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-1">HRV-Fatigue Axis (Sleep proxy)</h3>
            <div className="flex items-center gap-3 mt-2 mb-4">
              <span className="text-2xl font-black" style={{ color: Math.abs(analyses.fatigueSleep.r) >= 0.4 ? "#8b5cf6" : "#f59e0b" }}>
                r = {analyses.fatigueSleep.r.toFixed(4)}
              </span>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-purple-400 border border-purple-400/30 bg-purple-400/10">
                {analyses.fatigueSleep.strength}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface text-xs text-theme-muted flex items-start gap-2">
              <Info className="w-4 h-4 text-theme-muted shrink-0 mt-0.5" />
              {analyses.fatigueSleep.interpretation}
            </div>
          </motion.div>
        </div>

        {/* ── Feature Descriptive Stats ─────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-surface border border-theme rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-4">Feature Descriptive Statistics</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f: string) => {
              const s = featureStats[f];
              const color = FEATURE_COLORS[f] || "#6b7280";
              return (
                <div key={f} className="p-4 rounded-xl border border-theme bg-surface">
                  <p className="text-xs font-semibold capitalize mb-2" style={{ color }}>{f}</p>
                  <div className="space-y-1 text-[11px] text-theme-muted">
                    <div className="flex justify-between"><span>Mean</span><span className="font-mono text-white">{s.mean}</span></div>
                    <div className="flex justify-between"><span>Std Dev</span><span className="font-mono text-white">{s.std}</span></div>
                    <div className="flex justify-between"><span>Min</span><span className="font-mono text-theme-primary">{s.min}</span></div>
                    <div className="flex justify-between"><span>Max</span><span className="font-mono text-theme-primary">{s.max}</span></div>
                  </div>
                  {/* Mini bar */}
                  <div className="mt-2 h-1.5 bg-surface rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, s.mean)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full" style={{ backgroundColor: color }} />
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
