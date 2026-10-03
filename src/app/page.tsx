'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { Navbar } from '@/components/Navbar';
import { FileUploader } from '@/components/FileUploader';
import { SampleDataSelector } from '@/components/SampleDataSelector';
import { ExecutiveSummary } from '@/components/ExecutiveSummary';
import { DashboardGrid } from '@/components/DashboardGrid';
import { DataOverviewTable } from '@/components/DataOverviewTable';
import { AiChatAssistant } from '@/components/AiChatAssistant';
import { VisionStudio } from '@/components/VisionStudio';
import { GlassCard } from '@/components/GlassCard';
import { DashboardFilters } from '@/components/DashboardFilters';
import { CorrelationHeatmap } from '@/components/CorrelationHeatmap';
import { DataCleaningModal } from '@/components/DataCleaningModal';
import { Sparkles, Zap, BarChart3, Database, FileImage } from 'lucide-react';
import { AppTab } from '@/lib/types';

export default function Home() {
  const { currentDataset, activeImage, activeTab, setActiveTab } = useData();

  const isInitialState = !currentDataset && !activeImage;
  const showVisionStudio = activeTab === 'vision' || (!currentDataset && Boolean(activeImage));

  const mobileTabs: AppTab[] = activeImage
    ? ['dashboard', 'table', 'chat', 'insights', 'vision']
    : ['dashboard', 'table', 'chat', 'insights'];

  return (
    <div className="min-h-screen bg-radial-light dark:bg-radial-dark flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {isInitialState ? (
          /* Empty / Initial State */
          <div className="py-12 space-y-8">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Next-Gen Glassmorphic AI Analyst & Multimodal Vision</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Turn Datasets & Chart Images Into <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-violet-500 to-emerald-400">Actionable Intelligence</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Upload raw CSV, Excel, or JSON files — or drop in <b>chart screenshots and image tables</b>. Get instant visual OCR, digitized interactive dashboards, and ask questions in natural language.
              </p>
            </div>

            {/* File & Image Upload Zone */}
            <FileUploader />

            {/* Pre-built Sample Datasets & Sample Chart Image */}
            <SampleDataSelector />

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-8 max-w-6xl mx-auto">
              <GlassCard className="p-5 space-y-2">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit border border-cyan-500/20">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Heavy Dataset Parser</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  High performance client-side statistical engine parses large multi-megabyte CSV and Excel files instantly.
                </p>
              </GlassCard>

              <GlassCard className="p-5 space-y-2">
                <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 w-fit border border-violet-500/20">
                  <FileImage className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Multimodal Vision Studio</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Extracts numbers & data series from chart screenshots and invoices into digitized interactive Recharts and tables.
                </p>
              </GlassCard>

              <GlassCard className="p-5 space-y-2">
                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 w-fit border border-teal-500/20">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Automated Dashboards</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Generates Bar, Line, Pie, and Area charts with glassmorphism tooltips and dynamic color palettes.
                </p>
              </GlassCard>

              <GlassCard className="p-5 space-y-2">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit border border-emerald-500/20">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Conversational Q&A</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Ask natural language questions about datasets or images and receive statistical summaries and visual answers.
                </p>
              </GlassCard>
            </div>
          </div>
        ) : showVisionStudio ? (
          /* Active Vision Studio State */
          <VisionStudio />
        ) : (
          /* Active Dataset Dashboard State */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Executive Top Stats */}
            <ExecutiveSummary />

            {/* Global Slicers & Filters Bar */}
            <DashboardFilters />

            {/* Mobile Tab Pills */}
            <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-2">
              {mobileTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap border ${
                    activeTab === tab
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-slate-800/60 text-slate-300 border-slate-700'
                  }`}
                >
                  {tab === 'vision' ? 'Vision Studio' : tab}
                </button>
              ))}
            </div>

            {/* Tab Content Display */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <DashboardGrid />
                <CorrelationHeatmap />
              </div>
            )}
            {activeTab === 'table' && <DataOverviewTable />}
            {activeTab === 'chat' && <AiChatAssistant />}
            {activeTab === 'insights' && <ExecutiveSummary />}
          </div>
        )}
      </main>

      {/* Data Cleaning Interactive Modal */}
      <DataCleaningModal />

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/50 dark:border-white/10 py-6 mt-12 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} DataPulse AI • Next-Gen Multimodal Dataset & Image Analyst</p>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Vercel Ready Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
