"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import AIAssistant from "@/components/AIAssistant";
import { useChronoTheme } from "@/lib/useChronoTheme";
import {
  Activity, BrainCircuit, UploadCloud, FileSpreadsheet, Moon, Sun, Menu, Bell,
  Search, Settings, User, HeartPulse, TrendingUp, Zap, MoonStar, Layers, Clock, Sparkles, Calendar, LogOut
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isDark, toggleTheme, mounted } = useChronoTheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("chrono_auth_token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("chrono_auth_token");
    localStorage.removeItem("chrono_user");
    router.push("/login");
  };

  const navItems = [
    { icon: Activity, label: "AI Dashboard", href: "/dashboard" },
    { icon: UploadCloud, label: "Dataset Upload", href: "/dashboard/upload" },
    { icon: HeartPulse, label: "Stress Predictor", href: "/dashboard/stress-predictor" },
    { icon: Moon, label: "Sleep Analysis", href: "/dashboard/sleep-analysis" },
    { icon: Zap, label: "CII Engine", href: "/dashboard/cii" },
    { icon: BrainCircuit, label: "Phenotypes", href: "/dashboard/phenotypes" },
    { icon: TrendingUp, label: "Correlations", href: "/dashboard/correlations" },
    { icon: Layers, label: "RL Simulation", href: "/dashboard/rl" },
    { icon: Sparkles, label: "Explainability", href: "/dashboard/explainability" },
    { icon: Calendar, label: "Patient Journey", href: "/dashboard/patient-journey" },
  ];

  if (!isAuthenticated || !mounted) return null;

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-500`}
      style={{ background: `var(--background)`, color: `var(--foreground)` }}
    >
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop + Mobile) */}
      <motion.aside
        initial={false}
        animate={{
          x: isMobileMenuOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? -280 : 0),
          width: typeof window !== 'undefined' && window.innerWidth < 768 ? 280 : 256
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed md:static inset-y-0 left-0 border-r backdrop-blur-2xl flex flex-col justify-between z-50 transition-colors duration-300"
        style={{
          borderColor: `var(--sidebar-border)`,
          background: `var(--sidebar-bg)`,
        }}
      >
        <div className="overflow-y-auto custom-scrollbar">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <BrainCircuit className="text-white w-6 h-6" />
              </div>
              <span className={`text-lg font-bold bg-clip-text text-transparent ${isDark ? "bg-gradient-to-r from-white to-gray-400" : "bg-gradient-to-r from-gray-900 to-gray-600"}`}>
                ChronoHealth
              </span>
            </div>
            {isMobileMenuOpen && (
              <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 hover:bg-white/10 rounded-lg">
                <Settings className="w-5 h-5" style={{ color: 'var(--muted)' }} />
              </button>
            )}
          </div>

          <nav className="mt-4 px-4 space-y-1">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link key={index} href={item.href}>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                        ? "bg-gradient-to-r from-cyan-500/10 to-blue-600/10 text-cyan-500 border border-cyan-500/20 font-semibold"
                        : `hover:bg-[var(--surface-hover)]`
                      }`}
                    style={!isActive ? { color: 'var(--muted)' } : undefined}
                  >
                    <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-cyan-500" : ""}`} style={!isActive ? { color: 'var(--muted-foreground)' } : undefined} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-indigo-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <h4 className="text-sm font-semibold text-indigo-400 mb-1 relative z-10">Clinical Pro</h4>
            <p className="text-[10px] mb-4 relative z-10" style={{ color: 'var(--muted)' }}>Advanced ML inference active.</p>
            <button className="w-full py-2 text-[11px] font-bold text-white rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-all relative z-10 shadow-lg shadow-indigo-600/20">
              Model Registry
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group hover:bg-rose-500/10 text-rose-500/70 hover:text-rose-500 border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar">
        <header
          className="h-20 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 sm:px-8 transition-colors duration-300"
          style={{
            borderBottom: `1px solid var(--header-border)`,
            background: `var(--header-bg)`,
          }}
        >
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-[var(--surface-hover)]">
              <Menu className="w-6 h-6" style={{ color: 'var(--muted)' }} />
            </button>
            <div className="relative group hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-500 transition-colors" style={{ color: 'var(--muted)' }} />
              <input
                type="text"
                placeholder="Search patient records..."
                className="rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 w-64 lg:w-96 transition-all"
                style={{
                  background: 'var(--input-bg)',
                  border: `1px solid var(--input-border)`,
                  color: 'var(--input-text)',
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-[var(--surface-hover)] transition-colors">
              {isDark ? <Sun className="w-5 h-5" style={{ color: 'var(--muted)' }} /> : <MoonStar className="w-5 h-5" style={{ color: 'var(--muted)' }} />}
            </button>
            <button className="relative p-2 rounded-full hover:bg-[var(--surface-hover)] transition-colors group">
              <Bell className="w-5 h-5 group-hover:text-cyan-500" style={{ color: 'var(--muted)' }} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" style={{ borderWidth: '2px', borderColor: 'var(--notification-ring)' }} />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 p-[2px] cursor-pointer shadow-lg hover:scale-110 transition-transform active:scale-95">
              <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: 'var(--background)' }}>
                <User className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 page-transition" style={{
          background: isDark
            ? `radial-gradient(circle at top right, var(--page-gradient-from), transparent 25%), radial-gradient(circle at bottom left, var(--page-gradient-to), transparent 25%)`
            : undefined,
        }}>
          {children}
        </div>
      </main>
      <AIAssistant />
    </div>
  );
}
