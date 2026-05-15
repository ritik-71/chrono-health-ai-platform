"use client";
/**
 * Global Analytics Context for state persistence across the ChronoHealth Dashboard.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "@/lib/api";

interface AnalyticsContextType {
  predictData: any;
  ciiData: any;
  rlData: any;
  rlAnalyticsData: any;
  historyData: any[];
  explainabilityData: any;
  patientJourneyData: any;
  phenotypesData: any;
  correlationsData: any;
  ciiTimelineData: any;
  uploadHistoryData: any[];
  loading: boolean;
  refreshAll: () => Promise<void>;
  isInitialized: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [predictData, setPredictData] = useState<any>(null);
  const [ciiData, setCiiData] = useState<any>(null);
  const [rlData, setRlData] = useState<any>(null);
  const [rlAnalyticsData, setRlAnalyticsData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [uploadHistoryData, setUploadHistoryData] = useState<any[]>([]);
  const [explainabilityData, setExplainabilityData] = useState<any>(null);
  const [patientJourneyData, setPatientJourneyData] = useState<any>(null);
  const [phenotypesData, setPhenotypesData] = useState<any>(null);
  const [correlationsData, setCorrelationsData] = useState<any>(null);
  const [ciiTimelineData, setCiiTimelineData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      // Parallel fetch for core analytics
      const [resPredict, resCii, resRl, resRlAna, resHistory, resUploadHistory, resExplain, resJourney, resPheno, resCorr, resCiiTimeline] = await Promise.all([
        api.get("/api/predict"),
        api.get("/api/cii"),
        api.get("/api/rl/simulation"),
        api.get("/api/rl/analytics"),
        api.get("/api/prediction/history"),
        api.get("/api/upload/history"),
        api.get("/api/explainability/analyze"),
        api.get("/api/timeline/patient-journey"),
        api.get("/api/phenotypes/analyze"),
        api.get("/api/analytics/correlations"),
        api.get("/api/analytics/cii-timeline")
      ]);

      if (resPredict.data) setPredictData(resPredict.data);
      if (resCii.data) setCiiData(resCii.data);
      if (resRl.data) setRlData(resRl.data);
      if (resRlAna.data) setRlAnalyticsData(resRlAna.data);
      if (resExplain.data) setExplainabilityData(resExplain.data);
      if (resJourney.data) setPatientJourneyData(resJourney.data);
      if (resPheno.data) setPhenotypesData(resPheno.data);
      if (resCorr.data) setCorrelationsData(resCorr.data);
      if (resCiiTimeline.data) setCiiTimelineData(resCiiTimeline.data);
      if (resUploadHistory.data) setUploadHistoryData(resUploadHistory.data);

      if (resHistory.data && Array.isArray(resHistory.data)) {
        const formatted = resHistory.data.map((d: any) => ({
          day: d.timestamp ? new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
          stress: d.stress_score ?? 50,
          sleep: (d.sleep_score ?? 70) / 10,
          hrv: d.hrv ?? 50,
          mood: d.mood_stability ?? 75
        }));
        setHistoryData(formatted);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error("Global Analytics Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize once on mount
  useEffect(() => {
    if (!isInitialized) {
      refreshAll();
    }
  }, [isInitialized, refreshAll]);

  return (
    <AnalyticsContext.Provider value={{
      predictData, ciiData, rlData, rlAnalyticsData, historyData,
      uploadHistoryData,
      explainabilityData, patientJourneyData, phenotypesData, correlationsData,
      ciiTimelineData,
      loading, refreshAll, isInitialized
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
};
