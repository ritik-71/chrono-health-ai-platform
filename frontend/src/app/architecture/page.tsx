"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Smartphone, Watch, Database, Cloud, 
  Zap, Layers, Brain, ArrowDown, Activity, ShieldCheck
} from "lucide-react";
import Link from "next/link";

export default function ArchitecturePage() {
  const [mounted, setMounted] = useState(false);
  const [activeModule, setActiveModule] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const modules = [
    {
      id: 1,
      title: "Wearable Integration",
      icon: Watch,
      color: "from-cyan-500 to-blue-500",
      border: "border-cyan-500/30",
      desc: "Continuous ingestion of HRV, SpO2, and Actigraphy data via Apple HealthKit & Google Fit."
    },
    {
      id: 2,
      title: "Smartphone Sensor Layer",
      icon: Smartphone,
      color: "from-blue-500 to-indigo-500",
      border: "border-blue-500/30",
      desc: "Passive collection of screen-time patterns, ambient light, and typing kinematics."
    },
    {
      id: 3,
      title: "Cloud Infrastructure",
      icon: Cloud,
      color: "from-indigo-500 to-purple-500",
      border: "border-indigo-500/30",
      desc: "Secure, HIPAA-compliant REST APIs hosted on distributed auto-scaling node clusters."
    },
    {
      id: 4,
      title: "Data Processing Pipeline",
      icon: Database,
      color: "from-purple-500 to-fuchsia-500",
      border: "border-purple-500/30",
      desc: "Real-time stream processing, median imputation, and SMOTE balancing for ML ingestion."
    },
    {
      id: 5,
      title: "CII Engine",
      icon: Zap,
      color: "from-fuchsia-500 to-pink-500",
      border: "border-fuchsia-500/30",
      desc: "Mathematical calculation of the Circadian Interaction Index bridging stress and phase shifts."
    },
    {
      id: 6,
      title: "Reinforcement Learning Engine",
      icon: Layers,
      color: "from-pink-500 to-rose-500",
      border: "border-pink-500/30",
      desc: "Deep Q-Network dynamically calculating optimal intervention states based on reward decay."
    },
    {
      id: 7,
      title: "AI Recommendation Layer",
      icon: Brain,
      color: "from-rose-500 to-orange-500",
      border: "border-rose-500/30",
      desc: "Final generation of personalized Cognitive Behavioral Therapy (CBT-I) and Chronotherapy timings."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-cyan-500/30 pb-24 overflow-x-hidden">
      {/* Premium Header */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Home
          </Link>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-bold uppercase tracking-widest">
            <Activity className="w-4 h-4 animate-pulse" /> Live Infrastructure
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20">
          <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-bold tracking-widest border border-blue-500/20">
            SYSTEM ARCHITECTURE
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mt-6 tracking-tight">
            Interactive Topology Map
          </h1>
          <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">
            Hover over any module to isolate its functionality and view live data stream connections across the neural framework.
          </p>
        </motion.div>

        {/* Interactive Architecture Map */}
        <div className="relative max-w-4xl mx-auto py-12 flex flex-col items-center">
          
          {/* Animated Background Flow Effect */}
          <div className="absolute inset-0 pointer-events-none flex justify-center opacity-30">
            <div className="w-[1px] h-full bg-gradient-to-b from-cyan-500 via-purple-500 to-rose-500 relative">
               <motion.div 
                 animate={{ top: ['0%', '100%'] }} 
                 transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                 className="absolute left-1/2 -translate-x-1/2 w-4 h-32 bg-white blur-[8px] rounded-full"
               />
            </div>
          </div>

          {/* Level 1: Data Sources */}
          <div className="flex flex-col sm:flex-row gap-8 w-full justify-center relative z-10">
            <ModuleCard module={modules[0]} active={activeModule} onHover={setActiveModule} />
            <ModuleCard module={modules[1]} active={activeModule} onHover={setActiveModule} />
          </div>

          {/* Connecting Pipe */}
          <div className="h-16 w-0.5 bg-gradient-to-b from-blue-500/50 to-indigo-500/50 relative z-0 my-2">
            <DataOrb delay={0} />
          </div>

          {/* Level 2: Processing */}
          <div className="flex flex-col sm:flex-row gap-8 w-full justify-center relative z-10">
            <ModuleCard module={modules[2]} active={activeModule} onHover={setActiveModule} />
            <ModuleCard module={modules[3]} active={activeModule} onHover={setActiveModule} />
          </div>

          {/* Connecting Pipe */}
          <div className="h-16 w-0.5 bg-gradient-to-b from-purple-500/50 to-fuchsia-500/50 relative z-0 my-2">
             <DataOrb delay={0.5} />
          </div>

          {/* Level 3: AI Engines */}
          <div className="flex flex-col sm:flex-row gap-8 w-full justify-center relative z-10">
            <ModuleCard module={modules[4]} active={activeModule} onHover={setActiveModule} />
            <ModuleCard module={modules[5]} active={activeModule} onHover={setActiveModule} />
          </div>

          {/* Connecting Pipe */}
          <div className="h-16 w-0.5 bg-gradient-to-b from-fuchsia-500/50 to-rose-500/50 relative z-0 my-2">
             <DataOrb delay={1.0} />
          </div>

          {/* Level 4: Output */}
          <div className="flex w-full justify-center relative z-10">
            <ModuleCard module={modules[6]} active={activeModule} onHover={setActiveModule} wide />
          </div>

        </div>
      </main>
    </div>
  );
}

function ModuleCard({ module, active, onHover, wide = false }: any) {
  const isHovered = active === module.id;
  const isFaded = active !== null && active !== module.id;

  return (
    <motion.div
      onMouseEnter={() => onHover(module.id)}
      onMouseLeave={() => onHover(null)}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      animate={{
        opacity: isFaded ? 0.4 : 1,
        scale: isHovered ? 1.05 : 1,
        zIndex: isHovered ? 20 : 1
      }}
      className={`relative p-6 rounded-2xl bg-black border ${isHovered ? `border-${module.color.split(' ')[0].replace('from-', '')}` : 'border-white/10'} shadow-2xl transition-all duration-300 cursor-crosshair ${wide ? 'w-full max-w-lg' : 'w-full max-w-sm'}`}
    >
      {/* Glow Behind */}
      {isHovered && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`absolute inset-0 bg-gradient-to-br ${module.color} blur-2xl opacity-20 -z-10 rounded-2xl`} 
        />
      )}

      <div className="flex flex-col items-center text-center">
        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${module.color} p-0.5 mb-4`}>
          <div className="w-full h-full bg-black rounded-[11px] flex items-center justify-center">
             <module.icon className={`w-8 h-8 text-white ${isHovered ? 'animate-bounce' : ''}`} />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{module.title}</h3>
        <p className={`text-sm ${isHovered ? 'text-gray-300' : 'text-gray-500'} transition-colors`}>
          {module.desc}
        </p>

        {isHovered && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-white/10 w-full text-xs text-left">
            <div className="flex justify-between mb-1"><span className="text-gray-500">Status:</span><span className="text-green-400 font-mono">ONLINE</span></div>
            <div className="flex justify-between mb-1"><span className="text-gray-500">Latency:</span><span className="text-cyan-400 font-mono">12ms</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Data I/O:</span><span className="text-purple-400 font-mono">14.2 MB/s</span></div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function DataOrb({ delay }: { delay: number }) {
  return (
    <motion.div 
      animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
      transition={{ repeat: Infinity, duration: 2, delay: delay, ease: "linear" }}
      className="absolute left-1/2 -translate-x-1/2 w-1.5 h-6 bg-white rounded-full shadow-[0_0_10px_white]"
    />
  );
}
