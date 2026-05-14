"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Lightbulb, Network, Briefcase, Zap, ShieldCheck,
  Cpu, CheckCircle, XCircle
} from "lucide-react";
import Link from "next/link";

export default function PatentPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-purple-500/30 pb-24">
      {/* Premium Header */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 mt-16 space-y-24">
        {/* Title Section */}
        <header className="text-center space-y-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg bg-purple-500/20 blur-[120px] pointer-events-none rounded-full" />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
            <span className="px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-sm font-bold tracking-widest border border-purple-500/20">
              PATENT & IP SHOWCASE
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mt-6 leading-tight tracking-tight">
              System and Method for <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                Dynamic Chronotherapy Scheduling
              </span>
            </h1>
            <p className="text-lg text-gray-400 mt-6 max-w-3xl mx-auto leading-relaxed">
              Disclosing the proprietary architecture behind the Circadian Interaction Index (CII) and Reinforcement Learning Intervention Engine.
            </p>
          </motion.div>
        </header>

        {/* Novelty Visualization */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 items-center"
        >
          <div>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-purple-400" /> Core Novelty
            </h2>
            <p className="text-gray-300 leading-relaxed text-lg mb-6">
              Current digital therapeutics treat insomnia and anxiety as isolated conditions. Our proprietary technology establishes a mathematical bridge via the <strong>Circadian Interaction Index (CII)</strong>, calculating the exact decay rate of circadian phase synchrony induced by psychological hyperarousal.
            </p>
            <ul className="space-y-4">
              {[
                "Concurrent co-morbidity intervention logic.",
                "Real-time Phase Shift Rate (|dC/dt|) quantification.",
                "Q-Learning automated behavioral scheduling."
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-200">
                  <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-8 rounded-3xl bg-gradient-to-tr from-purple-900/20 to-cyan-900/20 border border-purple-500/30 relative overflow-hidden h-80 flex items-center justify-center">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Animated Abstract Diagram */}
            <div className="relative z-10 w-full max-w-sm">
              <div className="flex justify-between items-center mb-12">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                  <span className="text-xs font-bold text-cyan-400">CBT-I</span>
                </motion.div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-500/50 to-purple-500/50 relative">
                  <motion.div animate={{ left: ['0%', '100%'] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute -top-1 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" />
                </div>
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3, delay: 1.5 }} className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-400">CHRONO</span>
                </motion.div>
              </div>
              <div className="w-32 h-16 mx-auto rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                <span className="font-bold text-white">CII Engine</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Prior Art Comparison */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Network className="w-8 h-8 text-purple-400" /> Prior Art Comparison
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
            <table className="w-full text-left">
              <thead className="border-b border-white/10 bg-black/40">
                <tr>
                  <th className="p-6 text-sm font-bold text-gray-400 uppercase">Feature</th>
                  <th className="p-6 text-sm font-bold text-gray-400 uppercase">Standard Sleep Apps</th>
                  <th className="p-6 text-sm font-bold text-purple-400 uppercase">ChronoHealth.ai Patent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { feature: "Data Processing", standard: "Static heuristic rules", chrono: "Dynamic ML (XGBoost/LSTM) Inference" },
                  { feature: "Intervention Logic", standard: "Pre-programmed schedules", chrono: "Deep Q-Learning adaptive state-transitions" },
                  { feature: "Comorbidity Focus", standard: "Isolated insomnia tracking", chrono: "Concurrent stress & circadian analysis via CII" }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-6 font-medium text-white">{row.feature}</td>
                    <td className="p-6 text-gray-400 flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" /> {row.standard}</td>
                    <td className="p-6 text-gray-200 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> {row.chrono}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Commercialization Opportunities */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          <div className="md:col-span-3">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-purple-400" /> Commercialization Strategy
            </h2>
            <p className="text-gray-400 mb-8">B2B and B2C pathways for deploying the ChronoHealth IP.</p>
          </div>

          {[
            { title: "Clinical SaaS Licensing", desc: "API access for psychiatrists and sleep clinics to embed the CII mathematical engine into their patient portals." },
            { title: "Wearable Integration", desc: "Licensing the edge-inference Q-learning module directly to Apple Watch or Garmin OS for real-time chronotherapy nudges." },
            { title: "Direct-to-Consumer App", desc: "A premium subscription application tailored for university students facing academic-induced adjustment disorders." }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <Zap className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
            </div>
          ))}
        </motion.section>

      </main>
    </div>
  );
}
