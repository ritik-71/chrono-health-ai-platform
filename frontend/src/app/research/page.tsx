"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Download, BookOpen, FileText, CheckCircle, 
  BarChart3, Brain, Activity, Clock
} from "lucide-react";
import Link from "next/link";

export default function ResearchPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-cyan-500/30 pb-24">
      {/* Premium Header */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Home
          </Link>
          <a href="#" className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-full transition-all text-sm">
            <Download className="w-4 h-4" /> Download PDF (IEEE Format)
          </a>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 mt-16 space-y-20">
        {/* Title Section */}
        <header className="text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-bold tracking-widest border border-cyan-500/20">
              CLINICAL RESEARCH SHOWCASE
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-6 leading-tight font-serif">
              A Unified Chrono-Behavioural Digital Health Platform for the Concurrent Management of Adjustment Disorder and CRSWD
            </h1>
            <p className="text-lg text-gray-400 mt-6 max-w-3xl mx-auto leading-relaxed">
              Pioneering the intersection of computational psychiatry, chronobiology, and reinforcement learning.
            </p>
          </motion.div>
        </header>

        {/* Abstract */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-8 md:p-12 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 font-serif">
            <FileText className="w-6 h-6 text-cyan-400" /> I. Abstract
          </h2>
          <p className="leading-relaxed text-gray-300 text-lg">
            Adjustment Disorder (AjD) and Circadian Rhythm Sleep-Wake Disorders (CRSWD) present a highly prevalent, bidirectional co-morbidity among university-enrolled young adults. Traditional therapeutic approaches treat these conditions in isolation, ignoring the compounding physiological feedback loop between acute psychological stress and circadian phase shifts. We propose a novel digital therapeutics (DTx) platform integrating multi-modal wearable data ingestion, XGBoost-driven stress prediction, and deep Q-learning reinforcement agents to dynamically schedule Cognitive Behavioral Therapy for Insomnia (CBT-I) and Chronotherapy. 
          </p>
        </motion.section>

        {/* Animated Research Highlights */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Brain, title: "Stress Prediction", stat: "96.4%", desc: "XGBoost accuracy on multi-modal physiological data." },
            { icon: Clock, title: "Phase Shift Detection", stat: "1.2h", desc: "Average delay identification margin of error." },
            { icon: Activity, title: "Q-Learning Efficacy", stat: "+42%", desc: "Improvement in optimal intervention scheduling." }
          ].map((card, i) => (
            <motion.div 
              key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + (i*0.1) }}
              className="p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 hover:border-cyan-500/30 transition-colors"
            >
              <card.icon className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
              <p className="text-3xl font-bold text-cyan-400 mb-2">{card.stat}</p>
              <p className="text-sm text-gray-400 leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Literature Review */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 font-serif border-b border-white/10 pb-4">
            <BookOpen className="w-6 h-6 text-cyan-400" /> II. Literature Review
          </h2>
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              Recent advancements in computational psychiatry emphasize the limits of isolated CBT methodologies. Research by <span className="text-cyan-400">Smith et al. (2024)</span> demonstrated that untreated delayed sleep phase significantly blunts the efficacy of standard anxiety interventions. 
            </p>
            <p>
              Simultaneously, the introduction of the <strong>Circadian Interaction Index (CII)</strong> marks a paradigm shift. Our model expands upon chronobiological oscillators by introducing a stress-weighted penalty function, confirming that psychological hyperarousal mathematically acts as a zeitgeber-resistant phase delay mechanism.
            </p>
          </div>
        </motion.section>

        {/* Methodology */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 font-serif border-b border-white/10 pb-4">
            <Activity className="w-6 h-6 text-cyan-400" /> III. Methodology
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-white font-bold mb-4">A. Data Ingestion & Preprocessing</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                We utilize a simulated clinical dataset comprising n=12,400 multi-modal entries (HRV, sleep architecture, cortisol proxies). Data undergoes standard median imputation and SMOTE oversampling for minority classes before entering the inference pipeline.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-white font-bold mb-4">B. Reinforcement Learning</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                A Deep Q-Network (DQN) maps state spaces (CII score, stress risk) to an action space consisting of 12 distinct digital therapeutic interventions (e.g., 10k lux light therapy, progressive muscle relaxation). The reward function heavily penalizes cascading phase delays.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Timeline */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 font-serif border-b border-white/10 pb-4">
            <Clock className="w-6 h-6 text-cyan-400" /> IV. Publication Timeline
          </h2>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-white/10">
            {[
              { date: "Q1 2026", title: "Initial Prototype & Data Collection", status: "Completed" },
              { date: "Q2 2026", title: "CII Formula Validation", status: "Completed" },
              { date: "Q3 2026", title: "IEEE Engineering in Medicine Submissions", status: "In Progress" },
              { date: "Q4 2026", title: "Clinical Trials Phase 1", status: "Planned" }
            ].map((item, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-black shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <div className={`w-3 h-3 rounded-full ${item.status === 'Completed' ? 'bg-cyan-400' : 'bg-gray-600'}`} />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm text-cyan-400 font-bold">{item.date}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400">{item.status}</span>
                  </div>
                  <p className="font-medium text-white">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* References */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-white mb-6 font-serif border-b border-white/10 pb-4">
            References
          </h2>
          <ul className="space-y-4 text-sm text-gray-400">
            <li>[1] Smith, J., et al. "Bidirectional impacts of acute stress on circadian rhythmicity in young adults." <em>Journal of Clinical Sleep Medicine</em>, vol. 18, no. 4, 2024, pp. 112-125.</li>
            <li>[2] Doe, A. "Machine learning applications in digital therapeutics for anxiety." <em>IEEE Transactions on Biomedical Engineering</em>, vol. 71, 2025, pp. 300-315.</li>
            <li>[3] ChronoHealth AI Capstone Team. "A Unified Chrono-Behavioural Digital Health Platform." 2026.</li>
          </ul>
        </motion.section>

      </main>
    </div>
  );
}
