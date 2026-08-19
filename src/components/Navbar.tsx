'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { ThemeToggle } from './ThemeToggle';
import { ApiKeyModal } from './ApiKeyModal';
import { BrainCircuit, BarChart3, Table as TableIcon, MessageSquareText, Lightbulb, Key, Trash2, UploadCloud, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentDataset, activeTab, setActiveTab, clearDataset, uploadFile, customApiKey, customApiProvider, setIsCleaningModalOpen, exportData } = useData();
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  const handleNavFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await uploadFile(file);
      e.target.value = '';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => currentDataset ? setActiveTab('dashboard') : clearDataset()}>
            <div className="relative p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 via-violet-600 to-emerald-400 text-slate-950 shadow-glow-cyan">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-cyan-600 to-violet-600 dark:from-white dark:via-cyan-300 dark:to-violet-400">
                  DataPulse AI
                </span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  Analyst Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium hidden sm:block">
                Instant Heavy Dataset Insights & Conversational Intelligence
              </p>
            </div>
          </div>

          {/* Tab Navigation (If dataset active) */}
          {currentDataset && (
            <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-200/60 dark:bg-slate-900/60 border border-slate-300/50 dark:border-white/10 backdrop-blur-md">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'dashboard'
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-cyan-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'table'
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-cyan-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TableIcon className="w-4 h-4" />
                Data Preview
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'chat'
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-cyan-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageSquareText className="w-4 h-4" />
                AI Q&A
              </button>

              <button
                onClick={() => setActiveTab('insights')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'insights'
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-cyan-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                Insights ({currentDataset.insights.length})
              </button>
            </nav>
          )}

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {/* Native Label for Direct File Selection */}
            <label
              htmlFor="nav-dataset-upload-input"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold cursor-pointer rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 transition"
              title="Upload New File"
            >
              <input
                id="nav-dataset-upload-input"
                type="file"
                onChange={handleNavFileChange}
                accept=".csv,.xlsx,.xls,.json"
                className="sr-only"
              />
              <UploadCloud className="w-4 h-4" />
              <span className="hidden sm:inline">Upload File</span>
            </label>

            {currentDataset && (
              <>
                <button
                  onClick={() => setIsCleaningModalOpen(true)}
                  title="Open Data Cleaning Suite"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 transition"
                >
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                  <span className="hidden md:inline">Clean Data</span>
                </button>

                <button
                  onClick={() => exportData()}
                  title="Export Cleaned Dataset CSV"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700/60 transition"
                >
                  <UploadCloud className="w-4 h-4 text-teal-500" />
                  <span className="hidden md:inline">Export</span>
                </button>

                <button
                  onClick={clearDataset}
                  title="Reset Workspace"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition border border-transparent hover:border-rose-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </>
            )}

            <button
              onClick={() => setIsKeyModalOpen(true)}
              className={`relative p-2.5 rounded-xl border text-xs font-medium backdrop-blur-md transition-all flex items-center gap-1.5 ${
                customApiKey
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-900/60 border-slate-300 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-cyan-500'
              }`}
              title={customApiKey ? `Custom AI API Key Active (${customApiProvider.toUpperCase()})` : "Configure Custom AI API Key"}
            >
              <Key className="w-4 h-4" />
              {customApiKey && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </button>

            <ThemeToggle />
          </div>

        </div>
      </header>

      <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} />
    </>
  );
};
