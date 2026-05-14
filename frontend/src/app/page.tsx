"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  ArrowRight, Brain, Activity, Moon, Sun, Watch, 
  Database, Shield, Zap, Layers, Cpu, Network,
  BarChart3, RefreshCw, Smartphone, Code2, Play, Users, Mail, Globe, Share2
} from "lucide-react";
import Link from "next/link";

// --- REUSABLE COMPONENTS ---

const SectionHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="text-center max-w-3xl mx-auto mb-16">
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-theme-primary to-theme-muted"
    >
      {title}
    </motion.h2>
    <motion.p 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="text-lg text-theme-muted"
    >
      {subtitle}
    </motion.p>
  </div>
);

const ParticleBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-cyan-500/20 rounded-full"
        initial={{
          x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
          y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
        }}
        animate={{
          y: [null, Math.random() * -500],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    ))}
  </div>
);

// --- SECTIONS ---

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? "bg-background/50 backdrop-blur-xl border-b border-theme py-4" : "bg-transparent py-6"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-theme-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight text-theme-primary">ChronoHealth<span className="text-cyan-500">.ai</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-theme-muted-foreground">
          <Link href="/research" className="hover:text-theme-primary transition-colors text-cyan-400">IEEE Research</Link>
          <Link href="/patent" className="hover:text-theme-primary transition-colors text-purple-400">Patent Showcase</Link>
          <Link href="/architecture" className="hover:text-theme-primary transition-colors text-blue-400">Architecture</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hidden md:block text-sm font-medium text-theme-muted-foreground hover:text-theme-primary transition-colors">
            Login
          </Link>
          <Link href="/dashboard">
            <button className="px-5 py-2.5 text-sm font-bold text-black bg-white rounded-full hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Launch Platform
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

const SimulationModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { label: "Wearable Data Ingestion", detail: "HRV: 45.5ms • Sleep: 6.2h • Cortisol: 15μg/dL • Light: 5000lux", icon: Watch, color: "#06b6d4" },
    { label: "CII Engine Processing", detail: "Circadian Interaction Index = f(stress, sleep, cortisol, light) → CII: 86.2", icon: Activity, color: "#8b5cf6" },
    { label: "XGBoost Inference", detail: "Stress Risk: High (89%) • Sleep Disorder: 35% • Fatigue: Moderate", icon: Cpu, color: "#f43f5e" },
    { label: "RL Agent Scheduling", detail: "Q-Learning optimal action: Morning light therapy (10,000 lux) + CBT-I", icon: Brain, color: "#f59e0b" },
    { label: "Chronotherapy Delivered", detail: "Intervention scheduled: 07:30 AM light exposure + 22:00 stimulus control", icon: Zap, color: "#10b981" },
  ];

  useEffect(() => {
    if (!isOpen) { setStep(0); return; }
    const interval = setInterval(() => {
      setStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 25 }}
        className="w-full max-w-xl rounded-3xl border border-theme bg-[#0a0e1a] p-8 shadow-2xl relative overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">AI Pipeline Simulation</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
          </div>
          <div className="space-y-3">
            {steps.map((s, i) => {
              const isActive = i === step;
              const isDone = i < step;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0.3, x: -10 }}
                  animate={{ opacity: isDone || isActive ? 1 : 0.3, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className={`p-4 rounded-xl border transition-all duration-500 ${
                    isActive ? "border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/10" :
                    isDone ? "border-green-500/30 bg-green-500/5" : "border-white/5 bg-white/[0.02]"
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDone ? "bg-green-500/20" : isActive ? "bg-cyan-500/20" : "bg-white/5"}`}>
                      <s.icon className="w-4 h-4" style={{ color: isDone ? "#10b981" : isActive ? s.color : "#6b7280" }} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${isDone ? "text-green-400" : isActive ? "text-white" : "text-gray-500"}`}>{s.label}</p>
                      {(isDone || isActive) && (
                        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                          className="text-[11px] text-gray-400 mt-1 font-mono">{s.detail}</motion.p>
                      )}
                    </div>
                    {isDone && <span className="text-green-400 text-xs font-bold">✓</span>}
                    {isActive && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                  </div>
                </motion.div>
              );
            })}
          </div>
          {step >= steps.length - 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
              <p className="text-green-400 font-bold text-sm">✓ Pipeline Complete — Intervention Scheduled</p>
              <p className="text-[11px] text-gray-400 mt-1">Total inference latency: 1.2s • CII synchronized</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Hero = () => {
  const [showSim, setShowSim] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <ParticleBackground />
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-theme backdrop-blur-md mb-8">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-medium text-cyan-200">Next-Gen Digital Therapeutics Engine</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Concurrent Management of <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              Stress & Circadian Rhythms
            </span>
          </h1>
          <p className="text-xl text-theme-muted mb-12 max-w-3xl mx-auto leading-relaxed">
            An advanced AI-driven SaaS platform combining reinforcement learning, wearable integration, 
            and chronotherapy to break the maladaptive cycle of adjustment disorders in young adults.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard">
              <button className="w-full sm:w-auto px-8 py-4 text-base font-bold text-black bg-white rounded-full hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                Access AI Dashboard <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <button onClick={() => setShowSim(true)} className="w-full sm:w-auto px-8 py-4 text-base font-bold text-theme-primary bg-surface border border-theme rounded-full hover:bg-surface-hover transition-all flex items-center justify-center gap-2 backdrop-blur-md">
              <Play className="w-5 h-5" /> Watch Simulation
            </button>
          </div>
        </motion.div>
      </div>
      <SimulationModal isOpen={showSim} onClose={() => setShowSim(false)} />
    </section>
  );
};

const ProblemStatement = () => (
  <section id="problem" className="py-24 relative border-t border-theme bg-background">
    <div className="max-w-7xl mx-auto px-6">
      <SectionHeading 
        title="The Bidirectional Epidemic" 
        subtitle="Adjustment Disorder (AjD) and Circadian Rhythm Sleep-Wake Disorders (CRSWD) form a compounding, destructive feedback loop."
      />
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { icon: Brain, title: "Psychological Stress", desc: "High academic pressure triggers acute adjustment disorders, elevating cortisol and cognitive hyperarousal." },
          { icon: RefreshCw, title: "The Feedback Loop", desc: "Stress delays circadian phase onset, which ruins sleep architecture, subsequently magnifying next-day stress vulnerability." },
          { icon: Moon, title: "Circadian Disruption", desc: "Irregular light exposure and erratic schedules lead to severe phase delays and circadian misalignment." }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="p-8 rounded-3xl bg-surface border border-theme hover:border-cyan-500/30 transition-colors group"
          >
            <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <item.icon className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-theme-primary mb-4">{item.title}</h3>
            <p className="text-theme-muted leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const SolutionArchitecture = () => (
  <section id="solution" className="py-24 relative bg-surface">
    <div className="max-w-7xl mx-auto px-6">
      <SectionHeading 
        title="AI-Powered Intervention" 
        subtitle="We utilize a state-of-the-art ML pipeline to calculate the Circadian Interaction Index (CII) and deliver dynamic, personalized chronotherapy."
      />
      
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          {[
            { icon: Network, title: "Circadian Interaction Index (CII)", desc: "A novel multi-variable mathematical model that quantifies the real-time interaction between psychological stress and circadian phase shifts." },
            { icon: Layers, title: "Reinforcement Learning Module", desc: "A Q-learning simulation environment that schedules optimal cognitive behavioral therapy and chronotherapy interventions." },
            { icon: Zap, title: "Real-time Predictive Analytics", desc: "XGBoost and deep neural networks process historical multi-modal datasets to predict sleep disorder probability with high accuracy." }
          ].map((feat, i) => (
            <div key={i} className="flex gap-6">
              <div className="shrink-0 mt-1 w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <feat.icon className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-theme-primary mb-2">{feat.title}</h4>
                <p className="text-theme-muted leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Mock UI Glass Card */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 blur-3xl" />
          <div className="relative rounded-3xl border border-theme bg-background/40 backdrop-blur-2xl p-8 overflow-hidden">
            <div className="flex justify-between items-center mb-8 border-b border-theme pb-6">
              <div>
                <p className="text-sm text-theme-muted font-medium mb-1">Live Inference Pipeline</p>
                <p className="text-2xl font-bold text-theme-primary">System Architecture</p>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface border border-theme flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Watch className="text-cyan-400 w-5 h-5" />
                  <span className="text-theme-muted-foreground">Wearable Data Ingestion</span>
                </div>
                <span className="text-green-400 text-xs font-mono">ACTIVE</span>
              </div>
              <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-500/50 to-transparent mx-auto" />
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="text-cyan-400 w-5 h-5" />
                  <span className="text-theme-primary font-medium">CII Engine (XGBoost)</span>
                </div>
                <span className="text-xs font-mono text-cyan-300">0.94 ACC</span>
              </div>
              <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-500/50 to-purple-500/50 mx-auto" />
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Brain className="text-purple-400 w-5 h-5" />
                  <span className="text-theme-primary font-medium">RL Intervention Agent</span>
                </div>
                <span className="text-xs font-mono text-purple-300">Q-VAL OPTIMAL</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const ResearchStats = () => (
  <section id="research" className="py-24 relative bg-background border-t border-theme">
    <div className="max-w-7xl mx-auto px-6">
      <SectionHeading title="Research-Backed Efficacy" subtitle="Our models are trained on clinical data, delivering unprecedented accuracy." />
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { stat: "96.4%", label: "Stress Prediction Accuracy" },
          { stat: "89.2%", label: "CRSWD Detection Rate" },
          { stat: "4.2x", label: "Faster Intervention Scheduling" },
          { stat: "12k+", label: "Clinical Data Points Analyzed" }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-6 text-center rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-theme"
          >
            <div className="text-4xl font-bold text-cyan-400 mb-2">{item.stat}</div>
            <div className="text-sm text-theme-muted font-medium">{item.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const FutureScope = () => (
  <section className="py-24 relative bg-background border-t border-theme">
    <div className="max-w-7xl mx-auto px-6">
      <SectionHeading title="Future Scope" subtitle="The roadmap for scaling our digital therapeutics platform." />
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="p-8 rounded-2xl bg-surface border border-theme"
        >
          <h3 className="text-xl font-bold text-theme-primary mb-4">Phase 1: Multi-Modal Biomarkers</h3>
          <p className="text-theme-muted leading-relaxed mb-4">
            Expanding our ingestion engine to support continuous HRV, EDA (Electrodermal Activity), and continuous glucose monitoring (CGM) via Apple HealthKit and Google Fit APIs.
          </p>
          <div className="flex gap-2">
             <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">HRV</span>
             <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">EDA</span>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="p-8 rounded-2xl bg-surface border border-theme"
        >
          <h3 className="text-xl font-bold text-theme-primary mb-4">Phase 2: LLM Integration</h3>
          <p className="text-theme-muted leading-relaxed mb-4">
            Deploying a fine-tuned LLM agent capable of interpreting complex chronobiological data and delivering real-time, conversational Cognitive Behavioral Therapy (CBT-I).
          </p>
          <div className="flex gap-2">
             <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">Generative AI</span>
             <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">CBT-I</span>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const TeamSection = () => (
  <section className="py-24 relative bg-surface border-t border-theme">
    <div className="max-w-7xl mx-auto px-6 text-center">
      <SectionHeading title="The Research Team" subtitle="Pioneers in computational psychiatry and digital health." />
      <div className="flex flex-wrap justify-center gap-12">
        {[1, 2, 3].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 p-1 mb-4">
              <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-theme-primary/50" />
              </div>
            </div>
            <h4 className="text-lg font-bold text-theme-primary">Lead Researcher {item}</h4>
            <p className="text-sm text-cyan-400">ML & Healthcare</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const TechStack = () => (
  <section id="technology" className="py-24 relative border-t border-theme bg-background">
    <div className="max-w-7xl mx-auto px-6 text-center">
      <SectionHeading title="Production-Grade Stack" subtitle="Built with the latest technologies to ensure scalability, security, and real-time processing." />
      <div className="flex flex-wrap justify-center gap-4">
        {['Next.js 15', 'React 19', 'TypeScript', 'FastAPI', 'Python 3.13', 'TensorFlow', 'PyTorch', 'XGBoost', 'Tailwind CSS', 'Framer Motion', 'Recharts'].map((tech, i) => (
          <motion.div 
            key={tech}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="px-6 py-3 rounded-full border border-theme bg-surface text-theme-muted-foreground font-medium hover:bg-surface-hover transition-colors cursor-default"
          >
            {tech}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const CallToAction = () => (
  <section className="py-32 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-background to-surface" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
    
    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
      <h2 className="text-4xl md:text-6xl font-bold mb-8 text-theme-primary">Ready to transform behavioral healthcare?</h2>
      <p className="text-xl text-theme-muted mb-10">Access the AI platform, upload datasets, and explore the mathematical modeling in real-time.</p>
      <Link href="/dashboard">
        <button className="px-10 py-5 text-lg font-bold text-black bg-white rounded-full hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]">
          Launch ChronoHealth Platform
        </button>
      </Link>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-theme bg-background py-12">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-2">
        <Brain className="w-6 h-6 text-cyan-500" />
        <span className="font-bold text-lg text-theme-primary">ChronoHealth.ai</span>
      </div>
      <p className="text-theme-muted text-sm">© 2026 ChronoHealth Research Team. All rights reserved.</p>
      <div className="flex gap-4">
        <a href="#" className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-theme-muted hover:text-theme-primary hover:bg-surface-hover transition-all"><Globe className="w-5 h-5" /></a>
        <a href="#" className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-theme-muted hover:text-theme-primary hover:bg-surface-hover transition-all"><Share2 className="w-5 h-5" /></a>
        <a href="#" className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-theme-muted hover:text-theme-primary hover:bg-surface-hover transition-all"><Mail className="w-5 h-5" /></a>
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-theme-primary font-sans selection:bg-cyan-500/30">
      <Navbar />
      <main>
        <Hero />
        <ProblemStatement />
        <SolutionArchitecture />
        <ResearchStats />
        <TechStack />
        <FutureScope />
        <TeamSection />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
