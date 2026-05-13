"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useChronoTheme } from "@/lib/useChronoTheme";
import api from "@/lib/api";
import {
  Activity, BrainCircuit, UploadCloud, FileSpreadsheet, Moon, Sun, Menu, Bell,
  Search, Settings, User, HeartPulse, TrendingUp, Zap, Info, Loader2, MoonStar,
  MessageSquare, Download, Sparkles, Clock
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar
} from "recharts";

// Mock Time-series data for the charts
const weeklyData = [
  { day: "Mon", stress: 65, sleep: 6.2, hrv: 45, mood: 60 },
  { day: "Tue", stress: 55, sleep: 7.1, hrv: 52, mood: 65 },
  { day: "Wed", stress: 80, sleep: 4.5, hrv: 35, mood: 40 },
  { day: "Thu", stress: 45, sleep: 8.0, hrv: 65, mood: 80 },
  { day: "Fri", stress: 50, sleep: 7.5, hrv: 60, mood: 75 },
  { day: "Sat", stress: 30, sleep: 9.0, hrv: 80, mood: 90 },
  { day: "Sun", stress: 35, sleep: 8.5, hrv: 75, mood: 85 },
];

const radarData = [
  { subject: 'Stress Resistance', A: 80, fullMark: 100 },
  { subject: 'Sleep Efficiency', A: 65, fullMark: 100 },
  { subject: 'Circadian Alignment', A: 90, fullMark: 100 },
  { subject: 'HRV Recovery', A: 50, fullMark: 100 },
  { subject: 'Mood Stability', A: 70, fullMark: 100 },
];

// Component for Animated Counter - Memoized
const Counter = React.memo(({ value, prefix = "", suffix = "", decimals = 0 }: { value: number | string, prefix?: string, suffix?: string, decimals?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const target = typeof value === "number" ? value : parseFloat(value.replace(/[^0-9.]/g, ""));

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const step = (target / duration) * 10;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setDisplayValue(target);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 10);
    return () => clearInterval(timer);
  }, [target]);

  return <span>{prefix}{displayValue.toFixed(decimals)}{suffix}</span>;
});

// Component for Shimmering Skeleton Card - Memoized
const SkeletonCard = React.memo(() => (
  <div className="p-6 rounded-2xl overflow-hidden relative" style={{ border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
    <div className="shimmer absolute inset-0 opacity-20" />
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 rounded-xl" style={{ background: 'var(--surface)' }} />
    </div>
    <div className="w-24 h-4 rounded-full mb-3" style={{ background: 'var(--surface)' }} />
    <div className="w-32 h-8 rounded-full mb-2" style={{ background: 'var(--surface)' }} />
    <div className="w-20 h-3 rounded-full" style={{ background: 'var(--surface)' }} />
  </div>
));

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const { isDark, tooltipStyle, chartGridStroke, chartTickFill } = useChronoTheme();
  const [isLoading, setIsLoading] = useState(true);
  
  // API States
  const [predictData, setPredictData] = useState<any>(null);
  const [ciiData, setCiiData] = useState<any>(null);
  const [rlData, setRlData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Memoize active chart data to prevent recalculation on every render
  const activeChartData = React.useMemo(() => {
    return historyData.length > 5 ? historyData : weeklyData;
  }, [historyData]);

  useEffect(() => {
    setMounted(true);
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = React.useCallback(async () => {
    if (historyData.length === 0) setIsLoading(true);
    try {
      const [resPredict, resCii, resRl, resHistory] = await Promise.all([
        api.get("/api/predict").catch(() => ({ data: null })),
        api.get("/api/cii").catch(() => ({ data: null })),
        api.get("/api/rl/simulation").catch(() => ({ data: null })),
        api.get("/api/prediction/history").catch(() => ({ data: [] }))
      ]);

      setPredictData(resPredict.data);
      setCiiData(resCii.data);
      setRlData(resRl.data);
      
      if (resHistory.data && resHistory.data.length > 0) {
        const formattedHistory = resHistory.data.map((d: any) => ({
          day: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          stress: d.stress,
          sleep: d.sleep / 10,
          hrv: d.stress,
          mood: d.cii
        }));
        setHistoryData(formattedHistory);
      }
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setTimeout(() => setIsLoading(false), 400); // Reduced delay for better performance feel
    }
  }, [historyData.length]);

  if (!mounted) return null;

  const handleExportCSV = () => {
    if (!predictData || !ciiData) return;
    const csvContent = `data:text/csv;charset=utf-8,Metric,Value\nStress Risk,${predictData.stress_risk}\nSleep Disorder Probability,${predictData.sleep_disorder_probability}\nCircadian Stability,${predictData.circadian_stability}\nMental Fatigue,${predictData.mental_fatigue}\nCII Prediction,${ciiData.current_cii}\nChronotherapy Timing,${predictData.chronotherapy_timing}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "chronohealth_analytics_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => { window.print(); setIsExporting(false); }, 500);
  };

  return (
    <div className="w-full h-full overflow-y-auto pb-20 custom-scrollbar">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="text-3xl sm:text-4xl font-black tracking-tight mb-2"
            >
              AI Healthcare Intelligence
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              style={{ color: 'var(--muted)' }}
            >
              Real-time synchronization with clinical ML inference pipelines.
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <button onClick={handleExportCSV} className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2" style={{ background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
              <Download className="w-4 h-4" /> CSV
            </button>
            <button onClick={handleExportPDF} disabled={isExporting} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-2 shadow-lg shadow-cyan-600/20 disabled:opacity-50 transition-all">
              <Download className="w-4 h-4" /> PDF Report
            </button>
          </motion.div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              [1, 2, 3, 4].map((i) => <motion.div key={`skel-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SkeletonCard /></motion.div>)
            ) : (
              [
                { label: "Stress Risk Index", value: predictData?.stress_risk || "Moderate", desc: "XGBoost Confidence: 89%", icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-500/10" },
                { label: "Circadian Index (CII)", value: ciiData?.current_cii || 85.2, desc: "Trend: Synchronized", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10", counter: true },
                { label: "Circadian Stability", value: predictData?.circadian_stability || 82.5, desc: "Phase Shift: -0.8h", icon: Sun, color: "text-amber-500", bg: "bg-amber-500/10", counter: true, suffix: "%" },
                { label: "Sleep Disorder Prob.", value: (predictData?.sleep_disorder_probability || 0.35) * 100, desc: "Risk Tier: Alpha", icon: Moon, color: "text-indigo-500", bg: "bg-indigo-500/10", counter: true, suffix: "%" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card hover-lift p-6 rounded-3xl"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3.5 rounded-2xl ${stat.bg} shadow-inner`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: 'var(--surface)', border: '1px solid var(--card-border)', color: 'var(--muted)' }}>
                      <Clock className="w-3 h-3" /> LIVE
                    </div>
                  </div>
                  <h3 className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>{stat.label}</h3>
                  <div className="text-3xl font-black mb-2 tracking-tighter">
                    {stat.counter ? (
                      <Counter value={stat.value} suffix={stat.suffix} decimals={1} />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <p className={`text-[10px] font-semibold ${stat.color}`}>{stat.desc}</p>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="lg:col-span-2 glass-card rounded-3xl p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Longitudinal Clinical Correlation</h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>7-day Stress vs. Sleep interaction trends.</p>
              </div>
            </div>
            <div className="h-[320px] w-full">
              {isLoading ? (
                <div className="w-full h-full shimmer rounded-2xl opacity-10" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeChartData}>
                    <defs>
                      <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                    <XAxis dataKey="day" stroke="var(--chart-tick)" axisLine={false} tickLine={false} fontSize={12} tickMargin={10} />
                    <YAxis yAxisId="left" stroke="var(--chart-tick)" axisLine={false} tickLine={false} fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--chart-tick)" axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      itemStyle={{ fontWeight: "bold" }}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="stress" name="Stress" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorStress)" />
                    <Area yAxisId="right" type="monotone" dataKey="sleep" name="Sleep Quality" stroke="#06b6d4" strokeWidth={4} fillOpacity={1} fill="url(#colorSleep)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="glass-card rounded-3xl p-8 flex flex-col"
          >
            <h3 className="text-xl font-bold tracking-tight mb-1">Clinical Harmony</h3>
            <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>Biomarker radar alignment.</p>
            <div className="flex-1 flex items-center justify-center">
              {isLoading ? (
                <div className="w-48 h-48 rounded-full shimmer opacity-10" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="var(--chart-grid)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--chart-tick)', fontSize: 10, fontWeight: "bold" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="State" dataKey="A" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">
                <BrainCircuit className="w-3.5 h-3.5" /> Insight
              </div>
              <p className="text-[11px] italic" style={{ color: 'var(--muted)' }}>Alignment indicates high therapeutic compliance.</p>
            </div>
          </motion.div>
        </div>

        {/* Intelligence Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="glass-card rounded-3xl p-8 border-indigo-500/10 bg-gradient-to-br from-indigo-500/[0.02] to-transparent"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">XAI Clinical Reasoning</h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>Deep inference & Adaptive Intervention Logic</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold" style={{ background: 'var(--surface)', border: '1px solid var(--card-border)', color: 'var(--muted)' }}>
              GPT-4 Reasoning Engine <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl transition-all group" style={{ background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/70 mb-2">Primary Feature Driver</p>
                  <p className="text-lg font-bold group-hover:text-indigo-400 transition-colors">{predictData?.prediction_metadata?.primary_driver || "HRV Latency"}</p>
                </div>
                <div className="p-5 rounded-2xl transition-all group" style={{ background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-400/70 mb-2">Intervention Reward</p>
                  <p className="text-lg font-bold group-hover:text-green-400 transition-colors">+{rlData?.reward_evolution?.slice(-1)[0]?.reward || 15.4}</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><BrainCircuit className="w-12 h-12" /></div>
                <h4 className="text-sm font-bold text-indigo-400 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Adaptive Recommendation
                </h4>
                <p className="text-sm leading-relaxed font-medium" style={{ color: isDark ? '#d1d5db' : '#374151' }}>
                  {rlData?.scheduling_timeline?.[0]?.intervention || "Optimized morning light exposure (10,000 lux) and stimulus control therapy recommended to realign circadian phase."}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="p-6 rounded-2xl flex-1 flex flex-col justify-center" style={{ background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
                <div className="flex justify-between items-end mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Inference Confidence</span>
                  <span className="text-xl font-black text-indigo-400">{predictData?.prediction_metadata?.confidence_score || 89.2}%</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface)' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${predictData?.prediction_metadata?.confidence_score || 89.2}%` }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
                  />
                </div>
              </div>
              <button className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]">
                Open Explainability Center
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
