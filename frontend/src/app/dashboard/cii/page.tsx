"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useChronoTheme } from "@/lib/useChronoTheme";
import { 
  Zap, Activity, BrainCircuit, AlertTriangle, CheckCircle, Clock, 
  Info, TrendingUp, Cpu, HeartPulse
} from "lucide-react";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell
} from "recharts";

export default function CIIPage() {
  const { isDark, tooltipStyle } = useChronoTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCII();
    const interval = setInterval(fetchCII, 10000); // Live poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchCII = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "https://chrono-health-ai-platform.onrender.com"}/api/cii`);
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch CII data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 pb-20">
        <Activity className="w-8 h-8 text-cyan-500 animate-spin" />
        <p style={{ color: 'var(--muted)' }}>Computing Circadian Interaction Index...</p>
      </div>
    );
  }

  // Formatting historical trend for LineChart
  const trendData = data.historical_trend.map((val: number, i: number) => ({
    day: `Day ${i + 1}`,
    cii: val
  }));

  // Formatting components for PieChart
  const pieData = [
    { name: "Stress-Sleep Correlation", value: data.components.stress_sleep_correlation, color: "#f43f5e" },
    { name: "Phase Shift Rate", value: data.components.phase_shift_rate, color: "#3b82f6" },
    { name: "External Zeitgebers", value: data.components.external_zeitgebers, color: "#10b981" }
  ];

  // Risk configurations
  let riskColor = "text-green-400";
  let riskBg = "bg-green-500/10 border-green-500/20";
  let RiskIcon = CheckCircle;
  
  if (data.risk_category === "Moderate Risk") {
    riskColor = "text-yellow-400";
    riskBg = "bg-yellow-500/10 border-yellow-500/20";
    RiskIcon = AlertTriangle;
  } else if (data.risk_category === "High Risk") {
    riskColor = "text-red-400";
    riskBg = "bg-red-500/10 border-red-500/20";
    RiskIcon = Activity;
  }

  return (
    <div className="w-full h-full overflow-y-auto pb-20">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Zap className="w-8 h-8 text-cyan-400" /> Circadian Interaction Engine
            </h1>
            <p className="mt-1" style={{ color: 'var(--muted)' }}>Real-time quantification of chronobiological disruption.</p>
          </div>
          <div className={`px-5 py-2.5 rounded-xl border flex items-center gap-3 ${riskBg}`}>
            <RiskIcon className={`w-5 h-5 ${riskColor}`} />
            <div>
              <p className="text-xs text-theme-muted uppercase tracking-wider font-bold">Status</p>
              <p className={`font-bold ${riskColor}`}>{data.risk_category}</p>
            </div>
          </div>
        </div>

        {/* Top Grid: Formula & Live Index */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Animated Equation Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 p-8 rounded-3xl border relative overflow-hidden flex flex-col justify-center"
            style={{ background: 'var(--surface)', borderColor: 'var(--card-border)' }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-50" />
            <h3 className="text-sm font-medium text-theme-muted uppercase tracking-widest mb-6">Mathematical Model</h3>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-xl sm:text-2xl md:text-4xl font-serif tracking-wide">
              <span className="font-bold">CII(t)</span>
              <span className="text-theme-muted">=</span>
              
              <motion.div 
                animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="flex items-center gap-1 bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20"
              >
                <span className="text-rose-400">α·ρ<sub className="text-sm">S,C</sub>(t)</span>
              </motion.div>
              <span className="text-theme-muted">+</span>
              
              <motion.div 
                animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 4, delay: 1, ease: "easeInOut" }}
                className="flex items-center gap-1 bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20"
              >
                <span className="text-blue-400">β·|dC/dt|</span>
              </motion.div>
              <span className="text-theme-muted">+</span>
              
              <motion.div 
                animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 4, delay: 2, ease: "easeInOut" }}
                className="flex items-center gap-1 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20"
              >
                <span className="text-green-400">γ·Σw<sub className="text-sm">i</sub>·f<sub className="text-sm">i</sub>(t)</span>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-theme">
              <div className="text-center"><p className="text-xs text-theme-muted mb-1">Stress-Sleep Vector</p><p className="font-mono text-rose-400 font-bold">{data.components.stress_sleep_correlation}</p></div>
              <div className="text-center border-l border-theme"><p className="text-xs text-theme-muted mb-1">Phase Shift Rate</p><p className="font-mono text-blue-400 font-bold">{data.components.phase_shift_rate}</p></div>
              <div className="text-center border-l border-theme"><p className="text-xs text-theme-muted mb-1">Ext. Zeitgebers</p><p className="font-mono text-green-400 font-bold">{data.components.external_zeitgebers}</p></div>
            </div>
          </motion.div>

          {/* Live CII Score Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className={`p-8 rounded-3xl border ${riskBg} flex flex-col items-center justify-center text-center relative overflow-hidden`}
          >
            {data.risk_category === "High Risk" && (
              <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
            )}
            <p className={`text-sm font-bold uppercase tracking-widest mb-4 ${riskColor}`}>Current Index</p>
            <div className="relative">
              <motion.span 
                key={data.current_cii}
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="text-7xl font-black tracking-tighter"
              >
                {data.current_cii}
              </motion.span>
              <span className="absolute -right-6 top-2 text-xl text-theme-muted">/100</span>
            </div>
            <div className="mt-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-theme">
              <TrendingUp className={`w-4 h-4 ${data.trend_direction === 'upward' ? 'text-red-400' : 'text-green-400'}`} />
              <span className="text-xs font-medium text-theme-primary">Trend: {data.trend_direction}</span>
            </div>
          </motion.div>
        </div>

        {/* Middle Grid: Analysis & Explanation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Interpretation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-8 rounded-3xl border"
            style={{ background: 'var(--surface)', borderColor: 'var(--card-border)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold">AI Clinical Interpretation</h3>
            </div>
            <p className="text-theme-primary leading-relaxed text-lg mb-6">
              "{data.interpretation}"
            </p>
            
            <h4 className="text-sm font-bold text-theme-muted uppercase tracking-widest mb-4 border-b border-theme pb-2">Recommended Interventions</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-cyan-400 font-bold text-xs">1</span>
                </div>
                <span className="text-sm text-theme-primary">Deploy morning light therapy (10,000 lux) for 30 mins upon waking to anchor the circadian phase.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-cyan-400 font-bold text-xs">2</span>
                </div>
                <span className="text-sm text-theme-primary">Initiate CBT-I restriction protocols to decouple the hyperarousal-stress correlation.</span>
              </li>
            </ul>
          </motion.div>

          {/* Component Breakdown Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="p-8 rounded-3xl border flex flex-col"
            style={{ background: 'var(--surface)', borderColor: 'var(--card-border)' }}
          >
            <h3 className="text-xl font-bold mb-2">Component Contribution</h3>
            <p className="text-sm text-theme-muted mb-6">Visualizing mathematical drivers of the current index.</p>
            
            <div className="flex-1 min-h-[200px] flex items-center">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-4">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <div>
                      <p className="text-xs text-theme-muted">{item.name}</p>
                      <p className="text-sm font-bold">{item.value.toFixed(1)} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Grid: Historical Trend */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="p-8 rounded-3xl border"
          style={{ background: 'var(--surface)', borderColor: 'var(--card-border)' }}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold">CII Trend Analysis</h3>
              <p className="text-sm text-theme-muted">7-day longitudinal stability tracking</p>
            </div>
            <div className="px-3 py-1 rounded-lg bg-white/10 border border-theme text-xs text-theme-primary">
              Live Polling (10s)
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--chart-tick)" axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="var(--chart-tick)" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: "#06b6d4" }}
                />
                <Line 
                  type="monotone" dataKey="cii" stroke="#06b6d4" strokeWidth={4} 
                  dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }} activeDot={{ r: 8 }} 
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
