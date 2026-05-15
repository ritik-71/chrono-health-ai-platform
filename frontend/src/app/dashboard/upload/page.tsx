"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import api from "@/lib/api";
import {
  UploadCloud, FileSpreadsheet, CheckCircle, AlertTriangle,
  RefreshCw, BarChart as BarChartIcon, ChevronRight, FileJson, Table, ShieldCheck,
  FileAxis3D
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from "recharts";
import { useAnalytics } from "@/context/AnalyticsContext";

export default function UploadPage() {
  const { refreshAll } = useAnalytics();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResult(null); // Reset result on new file
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    setProgress(20);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(p => (p < 90 ? p + 10 : p));
      }, 300);

      const response = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(async () => {
        setResult(response.data);
        setIsUploading(false);
        toast.success("Dataset successfully parsed and analyzed!");
        fetchHistory(); // Refresh history after successful ingestion
        await refreshAll(); // Trigger global analytics recomputation
      }, 800);

    } catch (error: any) {
      setIsUploading(false);
      setProgress(0);
      toast.error(error.response?.data?.detail || "Error uploading dataset");
    }
  };

  const renderMissingValuesChart = () => {
    if (!result?.missing_values) return null;
    const data = Object.entries(result.missing_values).map(([key, val]) => ({
      name: key,
      missing: val
    })).filter(d => (d.missing as number) > 0);

    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-theme-muted">
          <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
          <p>No missing values detected. Data is 100% complete.</p>
        </div>
      );
    }

    return (
      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
            <XAxis type="number" stroke="#888" />
            <YAxis dataKey="name" type="category" stroke="#888" width={100} />
            <Tooltip  />
            <Bar dataKey="missing" fill="#f43f5e" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={(entry.missing as number) > 50 ? "#e11d48" : "#fb7185"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const response = await api.get("/api/upload/history");
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="w-full h-full overflow-y-auto pb-20">
      <Toaster position="top-right" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid #333' } }} />

      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dataset Ingestion Engine</h1>
          <p className="text-theme-muted">Upload clinical datasets, sensor logs, or survey results for AI preprocessing.</p>
        </div>

        {/* Upload Area */}
        <AnimatePresence mode="wait">
          {!result && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <motion.div
                key="upload-zone"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="xl:col-span-2"
              >
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragActive ? "border-cyan-500 bg-cyan-500/10" : "border-theme hover:border-cyan-500/50 hover:bg-surface bg-black/20"
                    }`}
                >
                  <input {...getInputProps()} />
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                    <UploadCloud className={`w-10 h-10 ${isDragActive ? "text-cyan-400" : "text-theme-muted"}`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    {isDragActive ? "Drop the dataset here" : "Drag & Drop Dataset"}
                  </h3>
                  <p className="text-theme-muted mb-6 max-w-md mx-auto">
                    Supports CSV, JSON, and Excel formats. Our automated pipeline will parse, clean, and analyze the dataset immediately.
                  </p>

                  <div className="flex justify-center gap-4 mb-8">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface text-xs font-medium text-theme-primary"><FileSpreadsheet className="w-4 h-4 text-green-400" /> CSV / XLS</div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface text-xs font-medium text-theme-primary"><FileJson className="w-4 h-4 text-yellow-400" /> JSON</div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.success("Loading sample 'chrono_cbt_dataset.csv'...");
                      // Mock setting a file
                      const mockFile = new File(["col1,col2\nval1,val2"], "chrono_cbt_dataset.csv", { type: "text/csv" });
                      setFile(mockFile);
                    }}
                    className="mb-8 px-6 py-2 border border-white/20 bg-surface hover:bg-white/10 rounded-full text-sm font-medium transition-colors"
                  >
                    Or Load Sample Dataset
                  </button>

                  {file && (
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white/10 border border-white/20 mb-6">
                      <FileAxis3D className="w-5 h-5 text-cyan-400" />
                      <span className="font-medium">{file.name}</span>
                      <span className="text-xs text-theme-muted">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  )}
                </div>

                {file && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 flex items-center gap-2"
                    >
                      {isUploading ? (
                        <><RefreshCw className="w-5 h-5 animate-spin" /> Processing Data...</>
                      ) : (
                        <>Run Ingestion Pipeline <ChevronRight className="w-5 h-5" /></>
                      )}
                    </button>
                  </div>
                )}

                {/* Progress Bar */}
                {isUploading && (
                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2 text-theme-muted">
                      <span>Parsing structure...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>

              {/* History Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="p-6 rounded-3xl bg-surface border border-theme h-fit"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-indigo-400" /> Upload History
                </h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {isLoadingHistory ? (
                    <div className="flex justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin text-theme-muted" /></div>
                  ) : history.length === 0 ? (
                    <p className="text-theme-muted text-sm italic text-center py-8">No previous uploads found.</p>
                  ) : (
                    history.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl bg-black/40 border border-theme hover:border-theme transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm truncate max-w-[150px]">{item.filename}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{item.type}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-theme-muted">
                          <span>{item.rows} rows</span>
                          <span>{new Date(item.time).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-2 w-full bg-surface h-1 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full" style={{ width: `${item.quality_score}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {/* Analysis Results */}
          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-green-400" /> Analysis Complete
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-bold transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  >
                    View Recomputed Dashboard
                  </button>
                  <button
                    onClick={() => setResult(null)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                  >
                    Upload Another File
                  </button>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-6 rounded-2xl bg-surface border border-theme">
                  <p className="text-theme-muted text-sm mb-1">Total Rows</p>
                  <p className="text-3xl font-bold">{result.rows.toLocaleString()}</p>
                </div>
                <div className="p-6 rounded-2xl bg-surface border border-theme">
                  <p className="text-theme-muted text-sm mb-1">Feature Columns</p>
                  <p className="text-3xl font-bold text-indigo-400">{result.columns.length}</p>
                </div>
                <div className="p-6 rounded-2xl bg-surface border border-theme">
                  <p className="text-theme-muted text-sm mb-1">Data Completeness</p>
                  <p className="text-3xl font-bold text-cyan-400">{result.completeness.toFixed(1)}%</p>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20">
                  <p className="text-green-400 text-sm mb-1">AI Quality Score</p>
                  <p className="text-3xl font-bold text-green-400">{result.quality_score} / 100</p>
                </div>
              </div>

              {/* Insights & Missing Values */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-surface border border-theme">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" /> Preprocessing Insights
                  </h3>
                  <ul className="space-y-3">
                    {result.insights.map((insight: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-theme-primary">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                        {insight}
                      </li>
                    ))}
                    <li className="flex items-start gap-3 text-sm text-theme-primary">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      Ready for standard scaler normalization.
                    </li>
                  </ul>
                  <div className="mt-6 pt-6 border-t border-theme">
                    <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-bold transition-colors">
                      Execute Preprocessing Pipeline
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-surface border border-theme">
                  <h3 className="text-lg font-bold mb-1">Missing Value Distribution</h3>
                  <p className="text-xs text-theme-muted mb-4">Detects nulls across all features for imputation planning.</p>
                  {renderMissingValuesChart()}
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="p-6 rounded-2xl bg-surface border border-theme overflow-hidden">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Table className="w-5 h-5 text-cyan-400" /> Data Preview (First 5 Rows)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-theme-muted uppercase bg-black/40 border-b border-theme">
                      <tr>
                        {result.columns.map((col: string, idx: number) => (
                          <th key={idx} className="px-4 py-3 whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.preview.map((row: any, idx: number) => (
                        <tr key={idx} className="border-b border-theme hover:bg-surface transition-colors">
                          {result.columns.map((col: string, colIdx: number) => (
                            <td key={colIdx} className="px-4 py-3 whitespace-nowrap text-theme-primary">
                              {row[col] !== null && row[col] !== "" ? String(row[col]) : <span className="text-red-400 text-xs italic">NaN</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
