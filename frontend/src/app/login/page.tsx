"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Brain, ArrowRight, Lock, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { getApiUrl } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(getApiUrl("/api/v1/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem("chrono_auth_token", data.access_token);
        localStorage.setItem("chrono_user", JSON.stringify(data.user));
        toast.success("Authentication successful");
        router.push("/dashboard");
      } else {
        toast.error(data.detail || "Invalid credentials.");
      }
    } catch (error) {
      toast.error("Network error. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans">
      <Toaster position="top-center" toastOptions={{ style: { background: 'var(--surface)', color: 'var(--foreground)', border: '1px solid var(--card-border)' } }} />
      
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--chart-grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--chart-grid)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 sm:p-12 rounded-3xl border backdrop-blur-2xl relative z-10 shadow-2xl"
        style={{ background: 'var(--surface)', borderColor: 'var(--card-border)' }}
      >
        <div className="flex flex-col items-center mb-10">
          <Link href="/">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20 cursor-pointer">
              <Brain className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>Sign in to your clinical portal.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--muted)' }}>Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input 
                type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-cyan-500 transition-colors"
                style={{ background: 'var(--background)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
                placeholder="demo@chronohealth.ai"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--muted)' }}>Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input 
                type="password" required
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-cyan-500 transition-colors"
                style={{ background: 'var(--background)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 mb-6 text-sm">
            <label className="flex items-center gap-2 cursor-pointer" style={{ color: 'var(--muted)' }}>
              <input type="checkbox" className="rounded text-cyan-500 focus:ring-cyan-500/20" style={{ background: 'var(--background)', borderColor: 'var(--card-border)' }} /> Remember me
            </label>
            <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Forgot Password?</a>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>

        <p className="text-center text-sm mt-8" style={{ color: 'var(--muted)' }}>
          Don't have an account? <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-bold">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
}
