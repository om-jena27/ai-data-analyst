'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { GlassCard } from './GlassCard';
import dynamic from 'next/dynamic';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Table as TableIcon,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  AreaChart as AreaChartIcon,
  Download,
  Database,
  ArrowRight,
  Maximize2,
  X,
  MessageSquareText,
  Lightbulb,
  CheckCircle2,
  FileImage,
  Layers,
  Send,
  Loader2,
  Bot,
  User
} from 'lucide-react';
import { DynamicChartData } from '@/lib/types';

const DynamicChart = dynamic(
  () => import('./DynamicChart').then((mod) => mod.DynamicChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-2xl bg-slate-900/40 animate-pulse border border-slate-800 flex items-center justify-center text-slate-500 text-xs font-semibold">
        Generating Interactive Chart...
      </div>
    ),
  }
);

export const VisionStudio: React.FC = () => {
  const {
    activeImage,
    clearActiveImage,
    convertImageToDataset,
    exportImageTableToCsv,
    imageChatHistory,
    sendImageChatMessage,
    isAnalyzingImage,
    customApiKey,
    customApiProvider,
    uploadFile
  } = useData();

  const [activeVisionTab, setActiveVisionTab] = useState<'insights' | 'chart' | 'table' | 'chat'>('insights');
  const [selectedChartType, setSelectedChartType] = useState<DynamicChartData['type']>('bar');
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');

  if (!activeImage) return null;

  const currentChart: DynamicChartData | undefined = activeImage.chart
    ? {
        ...activeImage.chart,
        type: selectedChartType || activeImage.chart.type
      }
    : undefined;

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAnalyzingImage) return;
    const q = chatInput;
    setChatInput('');
    await sendImageChatMessage(q);
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (isAnalyzingImage) return;
    await sendImageChatMessage(prompt);
  };

  const handleNewFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Action & Navigation Banner */}
      <GlassCard className="p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-cyan-500/30 shadow-glow-cyan">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 via-violet-600 to-emerald-400 text-slate-950 shadow-md">
            <FileImage className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {activeImage.fileName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                {activeImage.imageType}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                {activeImage.detectedVisuals?.dimensions || 'Resolution OK'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {activeImage.providerUsed || 'Vision Engine'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Extracted {activeImage.extractedTable?.rows.length || 0} data records • {activeImage.fileSize}
            </p>
          </div>
        </div>

        {/* Global Action CTAs */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
          {activeImage.extractedTable && activeImage.extractedTable.dataObjects.length > 0 && (
            <button
              onClick={convertImageToDataset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Promote to Live Dataset</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {activeImage.extractedTable && (
            <button
              onClick={exportImageTableToCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          )}

          <label
            htmlFor="vision-upload-another-input"
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          >
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span>Upload Another</span>
            <input
              id="vision-upload-another-input"
              type="file"
              onChange={handleNewFile}
              accept=".csv,.xlsx,.xls,.json,.png,.jpg,.jpeg,.webp"
              className="sr-only"
            />
          </label>

          <button
            onClick={clearActiveImage}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Close Image Analysis"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </GlassCard>

      {/* Main Dual-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Image Viewport & Visual Metadata */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileImage className="w-4 h-4 text-cyan-400" />
                Uploaded Source Image
              </span>
              <button
                onClick={() => setIsZoomModalOpen(true)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-400 text-slate-400 text-xs transition flex items-center gap-1"
                title="Expand Image"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Zoom</span>
              </button>
            </div>

            {/* Image Preview Box */}
            <div
              onClick={() => setIsZoomModalOpen(true)}
              className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/40 cursor-pointer flex items-center justify-center min-h-[260px] max-h-[420px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage.imageUrl}
                alt={activeImage.fileName}
                className="w-full h-auto max-h-[400px] object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                  <Maximize2 className="w-4 h-4 text-cyan-400" /> Click to Zoom
                </span>
              </div>
            </div>

            {/* Visual Attributes Card */}
            {activeImage.detectedVisuals && (
              <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Dimensions:</span>{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {activeImage.detectedVisuals.dimensions}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Aspect Ratio:</span>{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {activeImage.detectedVisuals.aspectRatio}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Format:</span>{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {activeImage.detectedVisuals.format}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Classification:</span>{' '}
                    <span className="font-semibold text-cyan-600 dark:text-cyan-400 capitalize">
                      {activeImage.imageType}
                    </span>
                  </div>
                </div>

                {activeImage.detectedVisuals.colorPalette && activeImage.detectedVisuals.colorPalette.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Detected Palette:</span>
                    <div className="flex items-center gap-1.5">
                      {activeImage.detectedVisuals.colorPalette.map((col, idx) => (
                        <div
                          key={idx}
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: col }}
                          title={col}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Pane: Analysis Workspace & Tabs */}
        <div className="lg:col-span-7 space-y-4">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-900/60 border border-slate-300/50 dark:border-white/10 backdrop-blur-md overflow-x-auto">
            <button
              onClick={() => setActiveVisionTab('insights')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeVisionTab === 'insights'
                  ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-cyan-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Insights & Metrics</span>
            </button>

            {activeImage.chart && (
              <button
                onClick={() => setActiveVisionTab('chart')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeVisionTab === 'chart'
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-cyan-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Interactive Chart</span>
              </button>
            )}

            {activeImage.extractedTable && (
              <button
                onClick={() => setActiveVisionTab('table')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeVisionTab === 'table'
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-cyan-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Extracted Table ({activeImage.extractedTable.rows.length})</span>
              </button>
            )}

            <button
              onClick={() => setActiveVisionTab('chat')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeVisionTab === 'chat'
                  ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-cyan-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>Image Q&A ({imageChatHistory.length})</span>
            </button>
          </div>

          {/* TAB 1: Insights & Metrics */}
          {activeVisionTab === 'insights' && (
            <div className="space-y-4">
              {/* Executive Summary Card */}
              <GlassCard glow="cyan" className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>AI Executive Visual Breakdown</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {activeImage.summary}
                </p>
              </GlassCard>

              {/* Extracted Metrics Grid */}
              {activeImage.metrics && activeImage.metrics.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {activeImage.metrics.map((metric, idx) => (
                    <GlassCard key={idx} className="p-4 space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 line-clamp-1">
                        {metric.label}
                      </span>
                      <div className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {metric.value}
                      </div>
                      {metric.change && (
                        <div className="flex items-center gap-1 text-[11px] font-bold">
                          {metric.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
                          {metric.trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
                          {metric.trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
                          <span
                            className={
                              metric.trend === 'up'
                                ? 'text-emerald-500 dark:text-emerald-400'
                                : metric.trend === 'down'
                                ? 'text-rose-500 dark:text-rose-400'
                                : 'text-slate-500'
                            }
                          >
                            {metric.change}
                          </span>
                        </div>
                      )}
                    </GlassCard>
                  ))}
                </div>
              )}

              {/* Key Insights Bullets */}
              {activeImage.keyInsights && activeImage.keyInsights.length > 0 && (
                <GlassCard className="p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Key Visual Takeaways & Trends
                  </h4>
                  <div className="space-y-2.5">
                    {activeImage.keyInsights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300"
                      >
                        <span className="w-5 h-5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-cyan-500/20">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{insight}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>
          )}

          {/* TAB 2: Interactive Recharts */}
          {activeVisionTab === 'chart' && currentChart && (
            <GlassCard className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{currentChart.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Interactive chart recreated directly from extracted image data
                  </p>
                </div>

                {/* Chart Type Toggles */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedChartType('bar')}
                    className={`p-1.5 rounded-lg text-xs transition ${
                      selectedChartType === 'bar' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Bar Chart"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSelectedChartType('line')}
                    className={`p-1.5 rounded-lg text-xs transition ${
                      selectedChartType === 'line' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Line Chart"
                  >
                    <LineChartIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSelectedChartType('area')}
                    className={`p-1.5 rounded-lg text-xs transition ${
                      selectedChartType === 'area' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Area Chart"
                  >
                    <AreaChartIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSelectedChartType('pie')}
                    className={`p-1.5 rounded-lg text-xs transition ${
                      selectedChartType === 'pie' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Pie Chart"
                  >
                    <PieChartIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Live Rendered Chart */}
              <div className="h-[360px] w-full pt-2">
                <DynamicChart chartData={currentChart} />
              </div>
            </GlassCard>
          )}

          {/* TAB 3: Extracted Data Table */}
          {activeVisionTab === 'table' && activeImage.extractedTable && (
            <GlassCard className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Digitized Tabular Dataset</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeImage.extractedTable.headers.length} columns • {activeImage.extractedTable.rows.length} rows extracted
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={convertImageToDataset}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30 text-xs font-semibold transition"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Open in Full Dashboard</span>
                  </button>
                </div>
              </div>

              {/* Table Display */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      {activeImage.extractedTable.headers.map((h, i) => (
                        <th key={i} className="p-3 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {activeImage.extractedTable.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-500/5 transition">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {typeof cell === 'number' ? cell.toLocaleString() : String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {/* TAB 4: Image AI Q&A */}
          {activeVisionTab === 'chat' && (
            <GlassCard className="p-5 flex flex-col h-[520px]">
              {/* Chat Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 text-white shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Image Visual Q&A</h4>
                    <p className="text-[11px] text-slate-400">Ask questions specifically about this image</p>
                  </div>
                </div>

                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {customApiKey ? (customApiProvider !== 'auto' ? customApiProvider : 'Custom AI') : 'Vision Engine'}
                </span>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="py-2.5 flex items-center gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800/60 text-[11px]">
                <span className="text-slate-400 shrink-0 font-medium">Ideas:</span>
                {[
                  'What is the highest value in this image?',
                  'Summarize key trends',
                  'What are the main categories?'
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(prompt)}
                    disabled={isAnalyzingImage}
                    className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-cyan-400 text-[11px] whitespace-nowrap transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Message Scroll Area */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
                {imageChatHistory.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-slate-400 text-xs p-4">
                    Ask any question about the visual elements, chart trends, or numbers in this image!
                  </div>
                ) : (
                  imageChatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender === 'ai' && (
                        <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-medium rounded-tr-none shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none space-y-2'
                        }`}
                      >
                        <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                        {msg.chart && (
                          <div className="h-44 w-full pt-2">
                            <DynamicChart chartData={msg.chart} />
                          </div>
                        )}

                        <span
                          className={`block text-[10px] mt-1 ${
                            msg.sender === 'user' ? 'text-slate-900/70 text-right' : 'text-slate-400 text-left'
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>

                      {msg.sender === 'user' && (
                        <div className="w-7 h-7 rounded-xl bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  ))
                )}

                {isAnalyzingImage && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs w-fit">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing image query...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendChat} className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question about this image..."
                  className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isAnalyzingImage}
                  className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setIsZoomModalOpen(false)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-cyan-400 transition"
            >
              <X className="w-6 h-6" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage.imageUrl}
              alt={activeImage.fileName}
              className="max-w-full max-h-[85vh] object-contain rounded-xl border border-white/10 shadow-2xl"
            />
            <p className="text-white/80 text-xs mt-3 font-medium">
              {activeImage.fileName} • {activeImage.detectedVisuals?.dimensions}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
