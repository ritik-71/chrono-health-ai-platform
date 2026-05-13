"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Unified theme hook for ChronoHealth dashboard.
 * Wraps next-themes and provides semantic CSS-variable-based helpers.
 */
export function useChronoTheme() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true; // SSR-safe default

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return {
    theme: mounted ? resolvedTheme : "dark",
    setTheme,
    toggleTheme,
    isDark,
    mounted,
    // Tooltip / chart styles using CSS variables
    tooltipStyle: {
      backgroundColor: "var(--tooltip-bg)",
      border: "1px solid var(--tooltip-border)",
      borderRadius: "12px",
      color: "var(--tooltip-text)",
    },
    chartGridStroke: "var(--chart-grid)",
    chartTickFill: "var(--chart-tick)",
  };
}
