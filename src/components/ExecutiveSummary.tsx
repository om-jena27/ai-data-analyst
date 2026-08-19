'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { GlassCard } from './GlassCard';
import { FileText, Database, Layers, ShieldCheck, AlertTriangle, TrendingUp, Sparkles, Hash, UploadCloud } from 'lucide-react';

export const ExecutiveSummary: React.FC = () => {
  const { currentDataset, filteredDataset, setActiveTab, clearDataset, setIsCleaningModalOpen, exportData } = useData();

  const ds = filteredDataset || currentDataset;
  if (!ds) return null;

  const { fileName, fileSize, rowCount, columnCount, columns, insights, qualityScore } = ds;

  const numericCols = columns.filter(c => c.type === 'numeric');
  const catCols = columns.filter(c => c.type === 'categorical' || c.type === 'text');

  return (
    <div className="space-y-6">
      {/* Top Banner / Dataset Badge */}
      <GlassCard glow="cyan" className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-cyan-400 border border-cyan-500/30">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {fileName}
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {fileSize}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Automated statistical analysis completed across {rowCount.toLocaleString()} records and {columnCount} attributes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCleaningModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition shadow-sm"
              title="Open Data Cleaning Suite"
            >
              <Sparkles className="w-4 h-4 text-cyan-500" />
              Clean Data
            </button>

            <button
              onClick={() => exportData()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition"
              title="Download Cleaned CSV"
            >
              <UploadCloud className="w-4 h-4 text-teal-500" />
              Export CSV
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-glow-cyan transition"
            >
              <Sparkles className="w-4 h-4" />
              Ask AI
            </button>
          </div>
        </div>
      </GlassCard>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total Rows</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {rowCount.toLocaleString()}
            </h3>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total Columns</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {columnCount} <span className="text-xs font-medium text-slate-600 dark:text-slate-400">({numericCols.length} num)</span>
            </h3>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Data Quality Score</p>
            <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {qualityScore} / 100
            </h3>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Primary Metric</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
              {numericCols[0]?.name || 'N/A'}
            </h3>
          </div>
        </GlassCard>
      </div>

      {/* AI Insights & Executive Highlights */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Automated Executive Insights & Anomalies
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3"
            >
              {insight.importance === 'high' ? (
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
              )}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  {insight.title}
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
